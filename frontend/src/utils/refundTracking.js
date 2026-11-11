/**
 * GA4 & Meta Refund Tracking Utility
 */

export function trackRefundEvent({
  orderId,
  value,
  currency = "INR",
  items = [],
}) {
  if (!orderId) {
    console.warn("[refundTracking] Missing orderId — skipping refund tracking event");
    return;
  }

  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });

  window.dataLayer.push({
    event: "refund",
    ecommerce: {
      transaction_id: String(orderId),
      value: Number(value) || 0,
      currency,
      items: items.map((item) => ({
        item_id: String(item.id || item.productId || ""),
        item_name: item.name || "Item",
        item_category: item.category || "",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      })),
    },
  });

  if (window.__IS_DEV__) {
    console.log(`[Analytics Event: refund] Order: ${orderId}, Value: ${value}`);
  }
}

export default trackRefundEvent;
