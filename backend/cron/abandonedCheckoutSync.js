import cron from "node-cron";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { fetchOrderPayments } from "../services/razorpay.service.js";
import { finalizePaidOrder } from "../controllers/order.controller.js";
import {
  extractCashfreePaymentInfo,
  getCashfreeOrderDetails,
  fetchCashfreeOrderPayments,
} from "../utils/cashfree.js";
import { recordAbandonedCheckout } from "../controllers/abandonedCheckout.controller.js";
import { syncOrderAddressFromCashfree } from "../controllers/cashfreeWebhook.controller.js";

console.log("✅ Abandoned Checkout Sync Cron Job Setup Initiated");

// Wait longer than 15 min so orders still being paid are not cancelled.
const STALE_AFTER_MS = 20 * 60 * 1000;
const BATCH_LIMIT = 50;
let running = false; // prevents overlapping runs

const hasCompletedPayment = (o) =>
  o.paymentStatus === "Completed" ||
  !!o.cashfreePaymentId ||
  !!o.razorpayPaymentId;

const isAwaitingOnlinePayment = (o) =>
  ["cashfree", "online", "razorpay"].includes(o.paymentMethod) ||
  !!o.partialPay;

async function processOrder(order) {
  if (hasCompletedPayment(order)) return; // real order, leave it alone
  if (!isAwaitingOnlinePayment(order)) return; // genuine COD order

  // 1. Cashfree verification (webhook may have been delayed)
  if (order.cashfreeOrderId) {
    try {
      const cf = await getCashfreeOrderDetails(order.cashfreeOrderId);
      if (cf?.order_status === "PAID") {
        const payments = await fetchCashfreeOrderPayments(order.cashfreeOrderId);
        const ok = Array.isArray(payments)
          ? payments.find((p) => p.payment_status === "SUCCESS")
          : null;
        const full = await Order.findById(order._id).populate("userId retailerId");
        await syncOrderAddressFromCashfree(full, order.cashfreeOrderId);
        const parsedInfo = extractCashfreePaymentInfo(ok || { payment_amount: cf.order_amount });
        await finalizePaidOrder(
          full,
          ok?.cf_payment_id || `cf_${Date.now()}`,
          null,
          "cashfree",
          parsedInfo
        );
        console.log(`✅ Stale order ${order.orderId} verified as PAID on Cashfree`);
        return;
      }
      // Not paid, but customer may have entered an address before leaving
      await syncOrderAddressFromCashfree(order, order.cashfreeOrderId);
    } catch (err) {
      console.warn("Cashfree check failed for", order.orderId, err.message);
      return; // could not verify, so do NOT cancel; retry next run
    }
  }

  // 2. Legacy Razorpay verification
  if (order.razorpayOrderId) {
    try {
      const payments = await fetchOrderPayments(order.razorpayOrderId);
      const captured = Array.isArray(payments)
        ? payments.find((p) => p.status === "captured")
        : null;
      if (captured) {
        const full = await Order.findById(order._id).populate("userId retailerId");
        await finalizePaidOrder(full, captured.id, null, "razorpay");
        return;
      }
    } catch (err) {
      console.warn("Razorpay check failed for", order.orderId, err.message);
      return;
    }
  }

  // 3. Claim the order atomically so stock is restored only once
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, orderStatus: "Pending", paymentStatus: "Pending" },
    {
      $set: {
        orderStatus: "Cancelled",
        paymentStatus: "Failed",
        cancelOrderReason: "Checkout abandoned (never completed)",
      },
    }
  );
  if (!claimed) return; // webhook or another run already handled it

  // 4. Record in Abandoned Checkout
  try {
    const hasAddress = !!(order.address?.addressLine1 || order.address?.city);
    await recordAbandonedCheckout({
      order,
      stage: hasAddress ? "before_payment" : "before_address",
      reason: "Checkout session expired",
      source: order.paymentMethod || "checkout",
      customerPhone: order.address?.mobileNo || order.userId?.mobileNo,
      customerEmail: order.address?.email || order.userId?.email,
      customerName: order.address?.fullName || order.userId?.fullName,
      shippingAddress: order.address,
      isResolved: false,
    });
  } catch (e) {
    console.error("Abandoned checkout save failed:", order.orderId, e.message);
  }

  // 5. Restore stock
  for (const item of order.items || []) {
    if (item.productId) {
      await Product.findByIdAndUpdate(item.productId._id || item.productId, {
        $inc: { stock: item.quantity },
      });
    }
  }
}

cron.schedule("*/5 * * * *", async () => {
  if (running) return;
  running = true;
  try {
    const cutoff = new Date(Date.now() - STALE_AFTER_MS);

    const orders = await Order.find({
      orderStatus: "Pending",
      paymentStatus: "Pending",
      createdAt: { $lte: cutoff },
    })
      .sort({ createdAt: 1 })
      .limit(BATCH_LIMIT)
      .populate({ path: "items.productId", select: "name images sku" })
      .populate({ path: "items.jewelryId", select: "jewelryName images sku" })
      .populate({ path: "userId", select: "mobileNo email fullName name" });

    for (const order of orders) {
      try {
        await processOrder(order);
      } catch (err) {
        console.error("Cron order failed:", order.orderId, err.message);
      }
    }

    if (orders.length) {
      console.log(`⏳ Abandoned Checkout Sync: checked ${orders.length} order(s)`);
    }
  } catch (err) {
    console.error("ABANDONED CHECKOUT SYNC ERROR:", err.message);
  } finally {
    running = false;
  }
});