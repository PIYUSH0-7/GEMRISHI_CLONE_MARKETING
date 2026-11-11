import crypto from "crypto";
import { Order } from "../models/order.model.js";
import { finalizePaidOrder } from "./order.controller.js";
// --------------------------Add By Pawan---------------------------------
// Razorpay -> our server. This is the safety net for the browser callback:
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY WEBHOOK: RAZORPAY_WEBHOOK_SECRET is not set");
      return res.status(500).json({ msg: "Webhook not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody; // captured in app.js express.json verify()
    if (!signature || !rawBody) {
      return res.status(400).json({ msg: "Missing signature" });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(String(signature));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      console.warn("RAZORPAY WEBHOOK: invalid signature");
      return res.status(400).json({ msg: "Invalid signature" });
    }

    const { event, payload } = req.body;
    const payment = payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id || payload?.order?.entity?.id;

    if (!razorpayOrderId) {
      return res.status(200).json({ ok: true, ignored: "no order id" });
    }

    if (event === "payment.captured" || event === "order.paid") {
      const order = await Order.findOne({ razorpayOrderId }).populate(
        "userId retailerId",
      );
      if (!order) {
        // Not one of ours (or created by another system) - ack so Razorpay stops retrying.
        return res.status(200).json({ ok: true, ignored: "unknown order" });
      }

      // Never trust the event blindly: the amount paid must match what we asked for.
      const paidPaise = Number(payment?.amount);
      const expectedPaise = Math.round(
        Number(order.onlinePayAmount || order.totalAmount) * 100,
      );
      if (paidPaise && Math.abs(paidPaise - expectedPaise) > 1) {
        console.error(
          `RAZORPAY WEBHOOK: amount mismatch for ${order.orderId}: paid ${paidPaise}, expected ${expectedPaise}`,
        );
        return res.status(200).json({ ok: true, ignored: "amount mismatch" });
      }

      await finalizePaidOrder(order, payment?.id, null);
      return res.status(200).json({ ok: true });
    }

    // payment.failed is intentionally not used to cancel the order: the customer
    // can retry on the same Razorpay order. The cleanup cron expires it if not.
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("RAZORPAY WEBHOOK ERROR:", err);
    // 500 makes Razorpay retry; finalizePaidOrder is idempotent so that's safe.
    return res.status(500).json({ msg: "Webhook error" });
  }
};
