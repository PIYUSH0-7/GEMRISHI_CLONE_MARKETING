
// ============================================================================
// Add By Pawan — NEW FILE: backend/utils/metaPurchase.js
// ----------------------------------------------------------------------------
// The ONE place where a server-side Meta "Purchase" is built and sent.
//
//   * Online (Cashfree / Razorpay): called from finalizePaidOrder(), i.e. only
//     after the gateway payment is verified.
//   * Full COD: called once when the COD order is accepted (the agreed COD
//     conversion). It carries payment_type:"cod" so it is never confused with
//     collected online revenue.
//
// Idempotency: the order document is atomically "claimed" in MongoDB
// (metaTracking.purchase.status: sending -> sent) BEFORE anything is sent, so
// webhook retries, the browser verify call and the cron can race freely and
// still produce exactly one Purchase per order.
// ============================================================================
import {
  resolveCapiConfig,
  resolveCodEventName,
  shouldSendForConsent,
  resolvePurchaseValue,
  resolvePaymentType,
  buildPurchaseContents,
  sanitizeEventSourceUrl,
  buildFbc,
} from "./metacapicore.js";

// Lazy logger: winston is only loaded when something is actually logged, so unit tests don't need it.
const logger = {
  info: (m) => import("./logger.js").then((x) => x.default.info(m)).catch(() => console.log(m)),
  warn: (m) => import("./logger.js").then((x) => x.default.warn(m)).catch(() => console.warn(m)),
};

const STALE_CLAIM_MS = 5 * 60 * 1000; // a crashed "sending" claim can be retaken after 5 minutes

/**
 * Factory with injected dependencies (so the logic is unit-testable with a fake
 * model / fake sender, no database or network needed).
 */
export function createPurchaseDispatcher({
  getOrderModel,
  sendEvent,
  log = logger,
  env = process.env,
  now = () => Date.now(),
}) {
  /** Atomically claim the right to send this order's Purchase. Returns true if we own it. */
  async function claim(Order, orderDocId, eventName, eventId) {
    const staleCutoff = new Date(now() - STALE_CLAIM_MS);
    const claimed = await Order.findOneAndUpdate(
      {
        _id: orderDocId,
        $or: [
          { "metaTracking.purchase.status": { $nin: ["sending", "sent"] } },
          { "metaTracking.purchase.status": "sending", "metaTracking.purchase.claimedAt": { $lt: staleCutoff } },
        ],
      },
      {
        $set: {
          "metaTracking.purchase.status": "sending",
          "metaTracking.purchase.claimedAt": new Date(now()),
          "metaTracking.purchase.eventName": eventName,
          "metaTracking.purchase.eventId": eventId,
        },
      },
      { new: false }
    );
    return !!claimed;
  }

  /**
   * @param {Object} order    Mongoose order document (or plain object) — must have _id, orderId, totalAmount...
   * @param {Object} options
   * @param {"online"|"cod"} options.kind
   * @param {Object} [options.fallbackUser]  user document, used only to fill missing email/phone
   * @returns {Promise<{status: string, reason?: string}>}
   */
  async function dispatchMetaPurchaseForOrder(order, { kind = "online", fallbackUser = null } = {}) {
    try {
      if (!order?._id || !order?.orderId) return { status: "skipped", reason: "invalid_order" };
      const eventId = String(order.orderId); // stable ID, identical to the browser Pixel eventID

      // 1) Environment gate FIRST, so disabled environments never mark an order as "sent".
      const cfg = resolveCapiConfig(env);
      if (!cfg.enabled) {
        log.info(`[Meta Purchase] ${eventId}: skipped (${cfg.reason})`);
        return { status: "skipped", reason: cfg.reason };
      }

      // 2) Which event name?
      const eventName = kind === "cod" ? resolveCodEventName(env) : "Purchase";
      if (!eventName) {
        log.info(`[Meta Purchase] ${eventId}: COD conversion reporting is turned off (META_COD_EVENT_NAME)`);
        return { status: "skipped", reason: "cod_event_disabled" };
      }

      // 3) Load stored checkout attribution (select:false on the schema, so we ask for it explicitly).
      const Order = await getOrderModel();
      const stored = await Order.findById(order._id).select("+metaTracking").lean();
      const tracking = stored?.metaTracking || {};

      // 4) Consent captured at checkout.
      const consent = typeof tracking.consent === "boolean" ? tracking.consent : undefined;
      if (!shouldSendForConsent(consent, env)) {
        log.info(`[Meta Purchase] ${eventId}: skipped (no marketing consent)`);
        return { status: "skipped", reason: "no_marketing_consent" };
      }

      // 5) Value comes from the server's own order record — never zero, never a placeholder.
      const { value, basis } = resolvePurchaseValue(order, env);
      if (value === null) {
        log.warn(`[Meta Purchase] ${eventId}: skipped, no valid order value (basis=${basis})`);
        return { status: "skipped", reason: "no_valid_value" };
      }

      // 6) Idempotency claim.
      const owns = await claim(Order, order._id, eventName, eventId);
      if (!owns) {
        log.info(`[Meta Purchase] ${eventId}: already sent/in-flight, duplicate suppressed`);
        return { status: "duplicate" };
      }

      // 7) Build the event.
      const addr = order.address || {};
      const populatedUser = order.userId && typeof order.userId === "object" && order.userId.email !== undefined ? order.userId : null;
      const user = populatedUser || fallbackUser || null;
      const externalId = String(order.userId?._id || order.userId || fallbackUser?._id || "") || undefined;
      const contents = buildPurchaseContents(order.items);

      const fbc =
        tracking.fbc ||
        buildFbc(tracking.fbclid, tracking.fbclidCapturedAt ? new Date(tracking.fbclidCapturedAt).getTime() : null);

      const result = await sendEvent({
        eventName,
        eventId,
        eventSourceUrl: sanitizeEventSourceUrl(tracking.eventSourceUrl, env) || undefined,
        consent,
        userData: {
          email: addr.email || user?.email,
          phone: addr.mobileNo || user?.phone || user?.mobileNo,
          fullName: addr.fullName || user?.fullName || user?.name,
          city: addr.city,
          state: addr.state,
          zip: addr.pinCode,
          country: addr.country,
          externalId,
          clientIp: tracking.clientIp,
          userAgent: tracking.userAgent,
          fbp: tracking.fbp,
          fbc,
        },
        customData: {
          currency: "INR",
          value,
          order_id: eventId,
          content_type: "product",
          content_ids: contents.map((c) => c.id),
          num_items: contents.reduce((s, c) => s + c.quantity, 0),
          contents,
          payment_type: resolvePaymentType(order),
        },
      });

      // 8) Record the outcome. On failure the claim is released so a later call may retry.
      if (result?.ok) {
        await Order.updateOne(
          { _id: order._id },
          {
            $set: {
              "metaTracking.purchase.status": "sent",
              "metaTracking.purchase.sentAt": new Date(now()),
              "metaTracking.purchase.valueSent": value,
              "metaTracking.purchase.valueBasis": basis,
            },
          }
        );
        return { status: "sent" };
      }

      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            "metaTracking.purchase.status": "failed",
            "metaTracking.purchase.lastError": String(
              result?.reason || JSON.stringify(result?.error || "unknown")
            ).slice(0, 500),
          },
        }
      );
      return { status: "failed", reason: result?.reason || "send_failed" };
    } catch (err) {
      log.warn(`[Meta Purchase] ${order?.orderId}: unexpected error ${err.message}`);
      return { status: "error", reason: err.message };
    }
  }

  return { dispatchMetaPurchaseForOrder, claim };
}

// ---------------------------------------------------------------------------
// Default instance wired to the real Order model + real sender.
// Imports are lazy so this file (and its tests) never need mongoose/axios at load time.
// ---------------------------------------------------------------------------
const defaultDispatcher = createPurchaseDispatcher({
  getOrderModel: async () => (await import("../models/order.model.js")).Order,
  sendEvent: async (payload) => (await import("./metacapi.js")).sendMetaCapiEvent(payload),
});

export const dispatchMetaPurchaseForOrder = defaultDispatcher.dispatchMetaPurchaseForOrder;
export default dispatchMetaPurchaseForOrder;