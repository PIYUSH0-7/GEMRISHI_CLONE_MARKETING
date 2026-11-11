import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { finalizePaidOrder } from "./order.controller.js";
import {
  extractCashfreePaymentInfo,
  createCashfreeOrderSession,
  verifyCashfreeWebhookSignature,
  getCashfreeOrderDetails,
  getCashfreeOrderExtended,
  fetchCashfreeOrderPayments,
} from "../utils/cashfree.js";
import {
  recordAbandonedCheckout,
  markAbandonedCheckoutResolvedByOrderId,
} from "./abandonedCheckout.controller.js";
import { sendOrderConfirmationEmail } from "../utils/orderConfirmationEmail.js";

/**
 * Synchronize OCC customer & shipping address from Cashfree to the Order in MongoDB
 */
export const syncOrderAddressFromCashfree = async (order, orderId) => {
  try {
    const cfExt = await getCashfreeOrderExtended(orderId);
    if (!cfExt) return;

    const shipping = cfExt.shipping_address || cfExt.customer_details?.shipping_address || {};
    const billing = cfExt.billing_address || {};
    const customer = cfExt.customer_details || {};

    const fullName =
      (shipping.name && shipping.name !== "Valued Customer" ? shipping.name : "") ||
      (billing.name && billing.name !== "Valued Customer" ? billing.name : "") ||
      (customer.customer_name && customer.customer_name !== "Valued Customer" ? customer.customer_name : "") ||
      (order.address?.fullName && order.address.fullName !== "Valued Customer" ? order.address.fullName : "") ||
      (order.userId?.fullName && order.userId.fullName !== "Valued Customer" ? order.userId.fullName : "") ||
      order.address?.fullName ||
      "";

    let email =
      shipping.email ||
      billing.email ||
      customer.customer_email ||
      order.address?.email ||
      "";
    if (email && (email.startsWith("guest_") || email === "guest@gemrishi.com")) {
      const uEmail = order.userId?.email;
      if (uEmail && !uEmail.startsWith("guest_") && !uEmail.includes("@temp.com")) {
        email = uEmail;
      }
    }

    const rawMobile =
      shipping.phone ||
      billing.phone ||
      customer.customer_phone ||
      order.address?.mobileNo ||
      order.userId?.mobileNo ||
      "";
    const mobileNo = rawMobile.replace(/\D/g, "").slice(-10) || rawMobile;

    const addressLine1 =
      shipping.address_line_one ||
      shipping.line1 ||
      shipping.address ||
      billing.address_line_one ||
      billing.line1 ||
      order.address?.addressLine1 ||
      "";

    const addressLine2 =
      shipping.address_line_two ||
      shipping.line2 ||
      billing.address_line_two ||
      billing.line2 ||
      order.address?.addressLine2 ||
      "";

    const city = shipping.city || billing.city || order.address?.city || "";
    const state = shipping.state || billing.state || order.address?.state || "";

    const pinCode =
      shipping.pin_code ||
      shipping.postal_code ||
      shipping.pincode ||
      billing.pin_code ||
      billing.postal_code ||
      billing.pincode ||
      order.address?.pinCode ||
      "";

    const country =
      shipping.country ||
      shipping.country_code ||
      billing.country ||
      order.address?.country ||
      "India";

    const landmark = shipping.landmark || billing.landmark || order.address?.landmark || "";
    const addressType =
      shipping.address_type || billing.address_type || order.address?.addressType || "Home";

    if (addressLine1 || city || pinCode || (fullName && fullName !== "Valued Customer")) {
      order.address = {
        fullName: fullName || order.address?.fullName || "Guest Customer",
        email: email || order.address?.email || "",
        mobileNo: mobileNo === "9999999999" ? (order.address?.mobileNo || "") : (mobileNo || order.address?.mobileNo || ""),
        addressLine1,
        addressLine2,
        city,
        state,
        pinCode,
        country,
        landmark,
        addressType,
      };
      await order.save();
      console.log(
        `✅ Synced Cashfree OCC address to order ${order.orderId}: ${fullName}, ${city} - ${pinCode}`
      );
    }

    // Also update User profile if missing mobile or address
    if (order.userId && mobileNo && mobileNo !== "9999999999") {
      const user = await User.findById(order.userId);
      if (user) {
        let changed = false;
        if (!user.mobileNo || user.mobileNo === "unknown") {
          user.mobileNo = mobileNo;
          changed = true;
        }
        if ((!user.fullName || user.fullName === "Valued Customer") && fullName && fullName !== "Valued Customer") {
          user.fullName = fullName;
          changed = true;
        }
        if ((!user.deliveryAddress || user.deliveryAddress.length === 0) && addressLine1) {
          user.deliveryAddress = [order.address];
          changed = true;
        }
        if (changed) {
          await user.save();
        }
      }
    }

    // Also sync to AbandonedCheckout so admin panel always has full customer contact and address
    try {
      const isPaid = order.paymentStatus === "Completed";
      await recordAbandonedCheckout({
        order,
        stage: isPaid ? "completed" : (addressLine1 ? "before_payment" : "before_address"),
        reason: isPaid ? "Payment Completed" : (order.cancelOrderReason || "Cashfree OCC Sync"),
        source: "cashfree_sync",
        customerPhone: mobileNo || order.address?.mobileNo,
        customerEmail: email || order.address?.email,
        customerName: fullName || order.address?.fullName,
        shippingAddress: order.address,
        billingAddress: billing.address_line_one ? billing : order.address,
        isResolved: isPaid,
      });
    } catch (abSyncErr) {
      console.warn("Could not sync address to AbandonedCheckout:", abSyncErr.message);
    }
  } catch (err) {
    console.warn("Could not sync Cashfree address:", err.message);
  }
};

/**
 * Handle Cashfree Webhooks (ORDER_PAID, PAYMENT_SUCCESS_WEBHOOK, PAYMENT_USER_DROPPED_WEBHOOK, etc.)
 */
export const cashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const rawBody = req.rawBody; // Captured in express.json verify middleware

    // 1. Signature Verification
    if (signature && timestamp) {
      const isValid = verifyCashfreeWebhookSignature(signature, timestamp, rawBody);
      if (!isValid) {
        console.warn("CASHFREE WEBHOOK: Invalid signature received");
        return res.status(400).json({ success: false, msg: "Invalid signature" });
      }
    } else {
      console.warn("CASHFREE WEBHOOK: Missing signature headers");
    }

    const { type, data } = req.body || {};
    const orderId = data?.order?.order_id || data?.order_id;
    console.log(`CASHFREE WEBHOOK [${type}]:`, orderId);

    // 2. Handle Payment Success
    if (
      type === "PAYMENT_SUCCESS_WEBHOOK" ||
      type === "ORDER_PAID" ||
      type === "PAYMENT_CHARGED"
    ) {
      const paymentId = data?.payment?.cf_payment_id || data?.payment_id;
      const paymentAmount = Number(
        data?.payment?.payment_amount || data?.order?.order_amount || 0
      );

      if (!orderId) {
        return res.status(200).json({ ok: true, ignored: "no order id" });
      }

      const order = await Order.findOne({
        $or: [{ orderId }, { cashfreeOrderId: orderId }],
      }).populate("userId retailerId");

      if (!order) {
        console.warn(`CASHFREE WEBHOOK: Order not found for ${orderId}`);
        return res.status(200).json({ ok: true, ignored: "order not found" });
      }

      if (order.paymentStatus === "Completed") {
        if (!order.address?.addressLine1) {
          await syncOrderAddressFromCashfree(order, order.cashfreeOrderId || order.orderId);
        }
        if (!order.confirmationEmailSent) {
          await sendOrderConfirmationEmail(order);
        }
        return res.status(200).json({ ok: true, message: "already completed" });
      }

      // Check amount matching (tolerance of 1 rupee for rounding)
      const expectedAmount = Number(order.onlinePayAmount || order.totalAmount);
      if (paymentAmount > 0 && Math.abs(paymentAmount - expectedAmount) > 1) {
        console.error(
          `CASHFREE WEBHOOK: Amount mismatch for ${orderId}. Expected ${expectedAmount}, got ${paymentAmount}`
        );
        return res.status(200).json({ ok: true, ignored: "amount mismatch" });
      }

      // Sync customer address collected in Cashfree OCC
      await syncOrderAddressFromCashfree(order, order.cashfreeOrderId || order.orderId);

      const parsedInfo = extractCashfreePaymentInfo(data?.payment);
      order.cashfreePaymentId = String(paymentId || "");
      order.paymentMode = parsedInfo.paymentMode;
      order.paidAmount = parsedInfo.paidAmount || paymentAmount || expectedAmount;
      order.paymentDetails = parsedInfo.paymentDetails;
      await finalizePaidOrder(order, String(paymentId || ""), null, "cashfree", parsedInfo);

      return res.status(200).json({ ok: true });
    }

    // 3. Handle Payment Failed
    if (type === "PAYMENT_FAILED_WEBHOOK") {
      if (orderId) {
        const order = await Order.findOne({
          $or: [{ orderId }, { cashfreeOrderId: orderId }],
        });
        if (order && order.paymentStatus !== "Completed") {
          await syncOrderAddressFromCashfree(order, order.cashfreeOrderId || order.orderId);
          const hasAddress = !!(order.address?.addressLine1 || order.address?.city);
          await recordAbandonedCheckout({
            order,
            stage: hasAddress ? "before_payment" : "before_address",
            reason: data?.payment?.payment_message || "Cashfree Payment Failed",
            source: "cashfree_webhook",
            customerPhone: order.address?.mobileNo,
            customerEmail: order.address?.email,
            customerName: order.address?.fullName,
            shippingAddress: order.address,
            isResolved: false,
          });
        }
      }
      return res.status(200).json({ ok: true });
    }

    // 4. Handle Payment User Dropped (Modal closed or drop-off)
    if (type === "PAYMENT_USER_DROPPED_WEBHOOK") {
      if (orderId) {
        const order = await Order.findOne({
          $or: [{ orderId }, { cashfreeOrderId: orderId }],
        });
        if (order && order.paymentStatus !== "Completed") {
          await syncOrderAddressFromCashfree(order, order.cashfreeOrderId || order.orderId);
          const hasAddress = !!(order.address?.addressLine1 || order.address?.city);
          await recordAbandonedCheckout({
            order,
            stage: hasAddress ? "before_payment" : "before_address",
            reason: "Customer dropped off during payment",
            source: "cashfree_webhook",
            customerPhone: order.address?.mobileNo,
            customerEmail: order.address?.email,
            customerName: order.address?.fullName,
            shippingAddress: order.address,
            isResolved: false,
          });
        }
      }
      return res.status(200).json({ ok: true });
    }

    // 5. Handle Cashfree Native Abandoned Checkout Webhook
    if (type === "abandonedCheckout" || type === "ABANDONED_CHECKOUT_WEBHOOK") {
      if (orderId) {
        const order = await Order.findOne({
          $or: [{ orderId }, { cashfreeOrderId: orderId }],
        });
        if (order && order.paymentStatus !== "Completed") {
          await syncOrderAddressFromCashfree(order, order.cashfreeOrderId || order.orderId);
          const hasAddress = !!(order.address?.addressLine1 || order.address?.city);
          await recordAbandonedCheckout({
            order,
            stage: hasAddress ? "before_payment" : "before_address",
            reason: "Cashfree OCC abandoned checkout event",
            source: "cashfree_occ_webhook",
            customerPhone: order.address?.mobileNo || data?.customer_phone,
            customerEmail: order.address?.email || data?.customer_email,
            customerName: order.address?.fullName,
            shippingAddress: order.address,
            isResolved: false,
          });
        }
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true, ignored: type });
  } catch (err) {
    console.error("CASHFREE WEBHOOK ERROR:", err);
    return res.status(500).json({ msg: "Webhook processing error" });
  }
};

/**
 * Helper to populate order consistently across operations
 */
const populateOrder = (query) => {
  return query
    .populate("userId retailerId")
    .populate("items.productId", "name images price slug sku")
    .populate("items.jewelryId", "jewelryName images price slug sku")
    .populate({
      path: "items.customization.jewelryId",
      select: "jewelryName images price slug sku",
      strictPopulate: false,
    })
    .populate({
      path: "items.customization.productId",
      select: "name images price slug sku",
      strictPopulate: false,
    });
};

/**
 * Verify Order status on demand (browser return_url or manual verify)
 */
export const verifyCashfreeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await populateOrder(
      Order.findOne({
        $or: [{ orderId }, { cashfreeOrderId: orderId }],
      })
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus === "Completed") {
      await syncOrderAddressFromCashfree(order, order.cashfreeOrderId || order.orderId);
      const freshOrder = await populateOrder(Order.findById(order._id));
      if (!freshOrder?.confirmationEmailSent) {
        await sendOrderConfirmationEmail(freshOrder || order);
      }
      return res.status(200).json({
        success: true,
        paymentStatus: "Completed",
        order: freshOrder || order,
      });
    }

    // Check with Cashfree API for status and payments
    const targetCfId = order.cashfreeOrderId || order.orderId;
    const [cfDetails, payments] = await Promise.all([
      getCashfreeOrderDetails(targetCfId).catch((e) => {
        console.warn("verifyCashfreeOrder getCashfreeOrderDetails error:", e.message);
        return null;
      }),
      fetchCashfreeOrderPayments(targetCfId).catch((e) => {
        console.warn("verifyCashfreeOrder fetchCashfreeOrderPayments error:", e.message);
        return [];
      }),
    ]);

    const successfulPayment = Array.isArray(payments)
      ? payments.find((p) => p.payment_status === "SUCCESS")
      : null;

    if (cfDetails?.order_status === "PAID" || successfulPayment) {
      const paymentId = successfulPayment?.cf_payment_id || `cf_${Date.now()}`;
      const parsedInfo = extractCashfreePaymentInfo(successfulPayment || { payment_amount: cfDetails?.order_amount });

      // Sync customer address collected in Cashfree OCC
      await syncOrderAddressFromCashfree(order, targetCfId);

      order.paymentMode = parsedInfo.paymentMode;
      order.paidAmount = parsedInfo.paidAmount || cfDetails?.order_amount || Number(order.totalAmount);
      order.paymentDetails = parsedInfo.paymentDetails;
      order.cashfreePaymentId = String(paymentId);

      await finalizePaidOrder(order, String(paymentId), null, "cashfree", parsedInfo);

      const freshOrder = await populateOrder(Order.findById(order._id));

      return res.status(200).json({
        success: true,
        paymentStatus: "Completed",
        order: freshOrder || order,
      });
    }

    // Even if payment is still pending/transitioning, sync address if available
    await syncOrderAddressFromCashfree(order, targetCfId);
    const freshOrder = await populateOrder(Order.findById(order._id));

    return res.status(200).json({
      success: true,
      paymentStatus: freshOrder?.paymentStatus || order.paymentStatus,
      cfStatus: cfDetails?.order_status,
      order: freshOrder || order,
    });
  } catch (error) {
    console.error("verifyCashfreeOrder error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify order", error: error.message });
  }
};

/**
 * Track user drop-off immediately when modal is dismissed in the frontend
 */
export const trackCashfreeAbandoned = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const order = await Order.findOne({
      $or: [{ orderId }, { cashfreeOrderId: orderId }],
    }).populate("userId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus === "Completed") {
      return res.status(200).json({ success: true, message: "Order already completed" });
    }

    // Retrieve any address or details the customer entered into Cashfree before dropping off
    await syncOrderAddressFromCashfree(order, order.cashfreeOrderId || order.orderId);

    const hasAddress = !!(order.address?.addressLine1 || order.address?.city);

    await recordAbandonedCheckout({
      order,
      stage: hasAddress ? "before_payment" : "before_address",
      reason: reason || "User closed checkout modal",
      source: "client_modal_close",
      customerPhone: order.address?.mobileNo || order.userId?.mobileNo,
      customerEmail: order.address?.email || order.userId?.email,
      customerName: order.address?.fullName || order.userId?.fullName,
      shippingAddress: order.address,
      isResolved: false,
    });

    return res.status(200).json({ success: true, message: "Abandoned checkout recorded" });
  } catch (err) {
    console.error("trackCashfreeAbandoned error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};


/**
 * Create Cashfree 360 session for 1-on-1 Astrological Consultation
 */
export const createConsultationCashfreeOrder = async (req, res) => {
  try {
    const { planId, customer, reportId, form } = req.body;

    const PLAN_CATALOG = {
      "plan-499": { price: 499, title: "Personalised Kundli + 20 Min Call", duration: "20 Min Call" },
      "plan-1199": { price: 1199, title: "Personalised Kundli + 30–40 Min Call", duration: "30–40 Min" },
      "plan-2999": { price: 2999, title: "Senior Acharya + 40–60 Min Call", duration: "40–60 Min" },
      "plan-4999": { price: 4999, title: "Annual Vedic Astro Membership", duration: "Annual" },
    };

    const selectedPlan = PLAN_CATALOG[planId];
    if (!selectedPlan) {
      return res.status(400).json({ success: false, message: "Invalid consultation plan selected." });
    }

    const orderId = "GR-CONSULT-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);

    const rawPhone = String(customer?.phone || form?.phone || form?.whatsapp || "").replace(/\D/g, "");
    const formattedPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : "9999999999";
    const customerName = String(customer?.name || form?.name || "Valued Customer").trim() || "Valued Customer";
    const customerEmail = String(customer?.email || form?.email || "consultation@gemrishi.com").trim() || "consultation@gemrishi.com";

    // 1. Create Cashfree Order Session
    const cfData = await createCashfreeOrderSession({
      orderId,
      orderAmount: selectedPlan.price,
      customer: {
        id: "cust_" + formattedPhone.slice(-10),
        name: customerName,
        email: customerEmail,
        phone: formattedPhone,
      },
      cartItems: [
        {
          item_id: planId,
          item_name: "Astro Consultation: " + selectedPlan.title,
          item_description: "Vedic Astrological Consultation (" + selectedPlan.duration + ")",
          item_price: selectedPlan.price,
          item_quantity: 1,
          item_currency: "INR",
        },
      ],
      returnUrl: ((req.headers.origin || process.env.FRONTEND_URL || "https://gemrishi.com").replace(/\/$/, "")) + "/thank-you?order_id=" + orderId + "&consultation=true",
      orderNote: "GemRishi Consultation: " + selectedPlan.title + " (Report #" + (reportId || "N/A") + ")",
      orderTags: {
        type: "consultation",
        plan_id: planId,
        report_id: String(reportId || ""),
      },
    });

    if (!cfData?.payment_session_id) {
      return res.status(500).json({ success: false, message: "Failed to initialize Cashfree session." });
    }

    // 2. Persist order record in DB
    const newOrder = new Order({
      orderId,
      cashfreeOrderId: cfData.order_id || orderId,
      totalAmount: String(selectedPlan.price),
      subTotal: selectedPlan.price,
      discountAmount: 0,
      paymentStatus: "Pending",
      orderStatus: "Pending",
      paymentMethod: "cashfree",
      onlinePayAmount: selectedPlan.price,
      offlinePayAmount: 0,
      partialPay: false,
      items: [
        {
          quantity: 1,
          itemTotal: selectedPlan.price,
          title: "Astro Consultation (" + selectedPlan.title + ")",
        },
      ],
      address: {
        fullName: customerName,
        mobileNo: formattedPhone,
        email: customerEmail,
        note: "Consultation Booking: " + selectedPlan.title + " | Report #" + (reportId || "N/A") + " | DOB: " + (form?.dob || "") + " | Place: " + (form?.place?.label || form?.placeLabel || ""),
      },
    });

    await newOrder.save();

    const isProd = ["PROD", "PRODUCTION"].includes(
      String(process.env.CASHFREE_ENV || "").trim().toUpperCase()
    );

    return res.status(200).json({
      success: true,
      orderId,
      paymentSessionId: cfData.payment_session_id,
      cashfreeEnvironment: isProd ? "production" : "sandbox",
    });
  } catch (err) {
    console.error("createConsultationCashfreeOrder error:", err);
    return res.status(500).json({ success: false, message: "Failed to create consultation payment", error: err.message });
  }
};