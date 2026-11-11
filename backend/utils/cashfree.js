import crypto from "crypto";

const cleanEnvVar = (val, fallback = "") => {
  if (!val) return fallback;
  return String(val).trim().replace(/^["']|["']$/g, "");
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getCashfreeConfig = () => {
  const appId = cleanEnvVar(process.env.CASHFREE_APP_ID);
  const secretKey = cleanEnvVar(process.env.CASHFREE_SECRET_KEY);
  const env = cleanEnvVar(process.env.CASHFREE_ENV, "TEST").toUpperCase();
  const apiVersion = cleanEnvVar(process.env.CASHFREE_API_VERSION, "2023-08-01");
  const isProd = env === "PROD" || env === "PRODUCTION";
  const baseUrl = isProd
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

  return { appId, secretKey, env, apiVersion, baseUrl, isProd };
};

/**
 * Normalize product/jewelry image into a valid absolute public URL for Cashfree OCC
 */
export function normalizePublicImageUrl(img) {
  if (!img) return "https://gemrishi.com/logo.png";

  let rawUrl = "";
  if (typeof img === "object" && img !== null) {
    rawUrl = img.url || (img.fileName ? `/public/uploads/product/${img.fileName}` : "") || "";
  } else if (typeof img === "string") {
    rawUrl = img.trim();
  }

  if (!rawUrl || rawUrl === "[object Object]") {
    return "https://gemrishi.com/logo.png";
  }

  // Strip localhost / 127.0.0.1
  const cleanPath = rawUrl.replace(
    /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i,
    ""
  );

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  const base = process.env.BACKEND_PUBLIC_URL || "https://api.gemrishi.com";
  const pathPart = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `${base.replace(/\/$/, "")}${pathPart}`;
}

/**
 * Create a new payment session on Cashfree
 */

/**
 * Safely parse JSON from Cashfree responses to avoid "Unexpected token <... is not valid JSON"
 */
async function safeCashfreeJson(response, endpointName = "Cashfree API") {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error(`[Cashfree Error] ${endpointName} returned non-JSON body (HTTP ${response.status}):`, text.slice(0, 300));
    throw new Error(`Payment gateway error (HTTP ${response.status}). Please try again.`);
  }
}

export async function createCashfreeOrderSession({
  orderId,
  orderAmount,
  customer = {},
  cartItems = [],
  returnUrl,
  notifyUrl,
  orderNote,
  orderTags,
  offerFilters,
}) {
  const { appId, secretKey, apiVersion, baseUrl } = getCashfreeConfig();

  if (!appId || !secretKey) {
    throw new Error("Cashfree credentials (CASHFREE_APP_ID, CASHFREE_SECRET_KEY) are missing in environment");
  }

  const rawPhone = String(
    customer.phone || customer.mobileNo || ""
  ).replace(/\D/g, "");
  const formattedPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : (customer.phone || customer.mobileNo || "");

  const customerId = String(
    customer.id || customer._id || `cust_${Date.now()}`
  ).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);

  const customerDetails = {
    customer_id: customerId,
    customer_email: customer.email || "customer@gemrishi.com",
    customer_name: customer.name || customer.fullName || "Valued Customer",
  };

  // Provide customer_phone if available or fallback
  if (formattedPhone) {
    customerDetails.customer_phone = formattedPhone;
  } else {
    // If not provided, fallback to temporary mobile for Cashfree order requirement
    customerDetails.customer_phone = "9999999999";
  }

  let validReturnUrl = String(
    returnUrl ||
    (process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/thank-you?order_id=${orderId}`
      : `https://gemrishi.com/thank-you?order_id=${orderId}`)
  ).trim();

  // Cashfree API strictly requires return_url to be HTTPS and rejects localhost
  if (
    validReturnUrl.startsWith("http://localhost") ||
    validReturnUrl.startsWith("http://127.0.0.1") ||
    !validReturnUrl.startsWith("https://")
  ) {
    validReturnUrl = `https://gemrishi.com/thank-you?order_id=${orderId}`;
  }

  const orderMeta = {
    return_url: validReturnUrl,
    notify_url:
      notifyUrl ||
      (process.env.BACKEND_PUBLIC_URL
        ? `${process.env.BACKEND_PUBLIC_URL}/api/v1/cashfree/webhook`
        : "https://api.gemrishi.com/api/v1/cashfree/webhook"),
  };

  // Cashfree requires offer_filters.values to contain ONLY valid UUIDs (not coupon codes).
  // Safely filter UUIDs to prevent Cashfree API 400/500 errors.
  if (offerFilters && Array.isArray(offerFilters.values)) {
    const validUuids = offerFilters.values
      .map((v) => String(v || "").trim())
      .filter((v) => UUID_REGEX.test(v));

    if (validUuids.length > 0) {
      orderMeta.offer_filters = {
        action: String(offerFilters.action || "ALLOW").toUpperCase() === "DENY" ? "DENY" : "ALLOW",
        values: validUuids,
      };
    }
  }

  const payload = {
    order_id: String(orderId),
    order_amount: Number(Number(orderAmount).toFixed(2)),
    order_currency: "INR",
    customer_details: customerDetails,
    order_meta: orderMeta,
    order_note: orderNote || `GemRishi Order #${orderId}`,
    // Cashfree One Click Checkout (OCC / Checkout 360) Activation
    products: {
      one_click_checkout: {
        enabled: true,
        conditions: [
          {
            key: "features",
            action: "ALLOW",
            values: [
              "checkoutCollectAddress",
              "checkoutAuthenticate",
            ],
          },
        ],
      },
    },
  };

  // Populate cart items for OCC checkout drawer and shipping calculation
  if (Array.isArray(cartItems) && cartItems.length > 0) {
    payload.cart_details = {
      cart_items: cartItems.map((item, idx) => {
        const imageUrl = normalizePublicImageUrl(item.item_image_url || item.image || item.jewelryImage);
        const unitPrice = Number(
          Number(
            item.item_discounted_unit_price ??
            item.item_price ??
            item.item_original_unit_price ??
            item.itemTotal ??
            item.price ??
            0
          ).toFixed(2)
        );

        const discPrice = Number(
          Number(
            item.item_discounted_unit_price ??
            unitPrice
          ).toFixed(2)
        );

        return {
          item_id: String(item.item_id || item.productId || item.jewelryId || item.id || `item_${idx + 1}`),
          item_name: String(item.item_name || item.name || item.jewelryName || item.title || "Jewelry Item").slice(0, 100),
          item_description: String(item.item_description || item.description || "GemRishi Jewelry").slice(0, 200),
          item_image_url: imageUrl,
          item_quantity: Math.max(1, Number(item.item_quantity || item.quantity || 1)),
          item_currency: "INR",
          item_price: discPrice,
          item_original_unit_price: discPrice,
          item_discounted_unit_price: discPrice,
        };
      }),
    };
  }

  if (orderTags && typeof orderTags === "object") {
    payload.order_tags = orderTags;
  }

  const response = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: {
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": apiVersion,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await safeCashfreeJson(response, "createOrderSession");

  if (!response.ok || !data.payment_session_id) {
    console.error("Cashfree Order Creation Failed:", JSON.stringify(data, null, 2));
    throw new Error(data.message || data.error?.message || "Failed to create Cashfree order");
  }

  return data;
}

/**
 * Deactivate an offer on Cashfree PG
 */
export async function deactivateCashfreeOffer(offerId) {
  const { appId, secretKey, apiVersion, baseUrl, env } = getCashfreeConfig();

  if (!appId || !secretKey) {
    throw new Error(
      `Cashfree credentials missing in environment (CASHFREE_APP_ID / CASHFREE_SECRET_KEY) for ${env}`
    );
  }

  const url = `${baseUrl}/offers/${offerId}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": apiVersion,
      "x-client-id": appId,
      "x-client-secret": secretKey,
    },
    body: JSON.stringify({ offer_status: "inactive" }),
  });

  const data = await response.json().catch(() => null);

  return {
    success: response.ok,
    status: response.status,
    environment: env,
    data,
  };
}

/**
 * Fetch Order details from Cashfree directly
 */
export async function getCashfreeOrderDetails(orderId) {
  const { appId, secretKey, apiVersion, baseUrl } = getCashfreeConfig();

  const response = await fetch(`${baseUrl}/orders/${orderId}`, {
    method: "GET",
    headers: {
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": apiVersion,
      "Accept": "application/json",
    },
  });

  return await safeCashfreeJson(response, "getOrderDetails");
}

/**
 * Fetch Extended Order details from Cashfree (including OCC shipping address, customer info)
 */
export async function getCashfreeOrderExtended(orderId) {
  const { appId, secretKey, apiVersion, baseUrl } = getCashfreeConfig();

  try {
    const response = await fetch(`${baseUrl}/orders/${orderId}/extended`, {
      method: "GET",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": apiVersion,
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const data = await safeCashfreeJson(response, "getOrderExtended");
      if (data && (data.shipping_address || data.customer_details || data.cart_details)) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Cashfree getOrderExtended warning:", err.message);
  }

  // Fallback to standard order details
  return await getCashfreeOrderDetails(orderId);
}

/**
 * Fetch Payments list for an order from Cashfree
 */
export async function fetchCashfreeOrderPayments(orderId) {
  const { appId, secretKey, apiVersion, baseUrl } = getCashfreeConfig();

  const response = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
    method: "GET",
    headers: {
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": apiVersion,
      "Accept": "application/json",
    },
  });

  return await safeCashfreeJson(response, "fetchOrderPayments");
}

/**
 * Verify Cashfree Webhook Signature (HMAC-SHA256)
 */
export function verifyCashfreeWebhookSignature(signature, timestamp, rawBody) {
  if (!signature || !timestamp || !rawBody) return false;

  const { secretKey } = getCashfreeConfig();
  if (!secretKey) return false;

  const rawString = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : String(rawBody);
  const message = `${timestamp}${rawString}`;
  const generated = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");

  return generated === signature;
}

/**
 * Auto-purge all active offers from Cashfree for the current environment.
 * Ensures that both TEST and PRODUCTION Cashfree accounts have zero active coupons.
 */
export async function autoPurgeAllCashfreeOffers() {
  const { appId, secretKey, apiVersion, baseUrl, env } = getCashfreeConfig();
  if (!appId || !secretKey) return;

  try {
    const amountTiers = [100, 1000, 10000, 100000];
    const discoveredOffers = new Map();

    for (const amount of amountTiers) {
      try {
        const res = await fetch(`${baseUrl}/eligibility/offers`, {
          method: "POST",
          headers: {
            "x-api-version": apiVersion,
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ queries: { amount } }),
        });

        if (res.ok) {
          const list = await res.json().catch(() => null);
          if (Array.isArray(list)) {
            for (const item of list) {
              const details = item.entity_details || {};
              const id = details.offer_id || item.entity_value;
              const status = details.offer_status;
              if (id && status !== "inactive") {
                discoveredOffers.set(id, details.offer_meta?.offer_code || id);
              }
            }
          }
        }
      } catch (tierErr) {
        // silent
      }
    }

    if (discoveredOffers.size === 0) {
      console.log(`[Cashfree] Verified: Zero active offers on Cashfree (${env}).`);
      return;
    }

    console.log(`[Cashfree] Found ${discoveredOffers.size} active offer(s) on Cashfree (${env}). Deactivating all...`);
    for (const [offerId, code] of discoveredOffers.entries()) {
      try {
        await fetch(`${baseUrl}/offers/${offerId}`, {
          method: "PATCH",
          headers: {
            "x-api-version": apiVersion,
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ offer_status: "inactive" }),
        });
        console.log(`[Cashfree] Deactivated offer: ${code} (${offerId})`);
      } catch (err) {
        console.warn(`[Cashfree] Failed to deactivate offer ${code}:`, err.message);
      }
    }
  } catch (err) {
    console.warn("[Cashfree] Error during offer auto-purge:", err.message);
  }
}

/**
 * Extract human-readable payment mode, paid amount, and payment details from Cashfree payment object
 */
export function extractCashfreePaymentInfo(payment) {
  if (!payment) {
    return {
      paymentMode: "Cashfree (Online)",
      paidAmount: 0,
      paymentDetails: null,
    };
  }

  const group = String(payment.payment_group || "").toLowerCase();
  const method = payment.payment_method || {};
  let mode = "Cashfree (Online)";
  const amount = Number(payment.payment_amount || 0);

  if (method.upi || group === "upi") {
    const upiId = method.upi?.upi_id;
    mode = upiId ? `UPI (${upiId})` : "UPI";
  } else if (method.card || group.includes("card")) {
    const card = method.card || {};
    const network = card.card_network ? card.card_network.toUpperCase() : "";
    const type =
      card.card_type === "credit_card"
        ? "Credit Card"
        : card.card_type === "debit_card"
        ? "Debit Card"
        : "Card";
    const last4 = card.card_number ? card.card_number.slice(-4) : "";
    const bank = card.card_bank_name || "";
    const info = [bank, network, last4 ? `Ending ${last4}` : ""].filter(Boolean).join(" ");
    mode = info ? `${type} (${info})` : type;
  } else if (method.netbanking || group === "net_banking" || group === "netbanking") {
    const bank = method.netbanking?.netbanking_bank_name || "";
    mode = bank ? `Net Banking (${bank})` : "Net Banking";
  } else if (method.wallet || group === "wallet") {
    const provider = method.wallet?.provider || "";
    mode = provider ? `Wallet (${provider.toUpperCase()})` : "Wallet";
  } else if (method.paylater || group === "paylater") {
    const provider = method.paylater?.provider || "";
    mode = provider ? `Pay Later (${provider})` : "Pay Later";
  } else if (group) {
    mode = group.replace(/_/g, " ").toUpperCase();
  }

  return {
    paymentMode: mode,
    paidAmount: amount,
    paymentDetails: {
      cfPaymentId: payment.cf_payment_id,
      paymentGroup: payment.payment_group,
      paymentAmount: payment.payment_amount,
      paymentCurrency: payment.payment_currency || "INR",
      paymentTime: payment.payment_time || payment.payment_completion_time,
      paymentStatus: payment.payment_status,
      paymentMessage: payment.payment_message,
      bankReference: payment.bank_reference,
      method: payment.payment_method,
    },
  };
}
