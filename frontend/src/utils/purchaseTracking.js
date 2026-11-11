import { fbqTrack } from "./metaPixel.js";

/**
 * Standardized Unified Purchase Tracking for GA4, Google Ads & Meta Pixel
 * Ensures:
 * 1. Single GA4 e-commerce "purchase" event with standard item formatting.
 * 2. Enhanced Conversions "user_data" payload for Google Ads & GA4.
 * 3. Meta Pixel "Purchase" event with content_type: "product", contents array, and eventID for CAPI deduplication.
 * 4. SessionStorage double-fire prevention per orderId.
 */
export function trackPurchaseEvent({
  orderId,
  subtotal,
  tax = 0,
  shipping = 0,
  coupon = "",
  currency = "INR",
  items = [],
  customer = {},
}) {
  if (!orderId) {
    console.warn("[purchaseTracking] Missing orderId — skipping purchase event");
    return;
  }

  const storageKey = `tracked_order_${orderId}`;

  try {
    if (sessionStorage.getItem(storageKey)) {
      return;
    }
    sessionStorage.setItem(storageKey, "1");
  } catch (e) {
    console.warn("[purchaseTracking] sessionStorage unavailable:", e);
  }

  const numericValue = Number(subtotal) || 0;
  const formattedItems = items.map((item) => ({
    item_id: String(item.id ?? ""),
    item_name: item.name ?? "",
    item_brand: item.brand ?? "GemRishi",
    item_category: item.category ?? "Gemstones",
    item_variant: item.variant ?? "",
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
  }));

  window.dataLayer = window.dataLayer || [];

  // Google Enhanced Conversions (user_data)
  if (customer && (customer.email || customer.phone || customer.phone_number)) {
    const rawPhone = String(customer.phone || customer.phone_number || "").replace(/\D/g, "");
    const cleanPhone = rawPhone.length === 10 ? `+91${rawPhone}` : rawPhone ? `+${rawPhone}` : undefined;
    const nameParts = (customer.name || "").trim().split(" ");
    const firstName = customer.firstName || nameParts[0] || "";
    const lastName = customer.lastName || nameParts.slice(1).join(" ") || "";

    window.dataLayer.push({
      user_data: {
        email: customer.email ? customer.email.trim().toLowerCase() : undefined,
        phone_number: cleanPhone,
        address: {
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          city: customer.city || undefined,
          postal_code: customer.postalCode || customer.zip || customer.pinCode || undefined,
          country: "IN",
        },
      },
    });
  }

  // Clear previous ecommerce object before pushing new purchase
  window.dataLayer.push({ ecommerce: null });

  // Standard GA4 lowercase "purchase" event
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: String(orderId),
      value: numericValue,
      tax: Number(tax) || 0,
      shipping: Number(shipping) || 0,
      currency,
      coupon: coupon || "",
      items: formattedItems,
    },
  });

  // Meta Pixel Purchase Event with Event ID for CAPI Deduplication
  const totalQuantity = formattedItems.reduce(
    (sum, it) => sum + (Number(it.quantity) || 1),
    0
  );

  fbqTrack(
    "Purchase",
    {
      value: numericValue,
      currency,
      content_ids: formattedItems.map((item) => item.item_id).filter(Boolean),
      content_type: "product",
      num_items: totalQuantity,
      contents: formattedItems.map((item) => ({
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price,
      })),
    },
    { eventID: String(orderId) }
  );
}

export function buildItemsFromCartData(cartData = []) {
  return cartData.map((item) => {
    const variant =
      item.customization?.quality?.name ||
      item.customization?.goldKarat?.name ||
      item.customization?.certificate?.name ||
      "";
    return {
      id: String(item.sku || item.productId || item.jewelryId || item.name || ""),
      name: item.name || "GemRishi Item",
      category: item.itemType || "Gemstone",
      variant,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    };
  });
}

export function buildItemsFromRawCart(cartData = []) {
  return cartData.map((cartItem) => {
    const isJewelry = cartItem.itemType === "Jewelry";
    const hasJewelryCustomization = !!cartItem.customization?.jewelryId;
    const name = isJewelry
      ? cartItem.item?.jewelryName
      : hasJewelryCustomization
      ? cartItem.customization.jewelryId?.jewelryName
      : cartItem.item?.name;
    const variant =
      cartItem.customization?.quality?.name ||
      cartItem.customization?.goldKarat?.name ||
      cartItem.customization?.certificate?.name ||
      "";
    const qty = Number(cartItem.quantity) || 1;
    return {
      id: String(cartItem.item?.sku || cartItem.item?._id || cartItem._id || ""),
      name: name || "GemRishi Item",
      category: cartItem.itemType || "Gemstone",
      variant,
      price: qty
        ? Number((Number(cartItem.totalPrice || 0) / qty).toFixed(2))
        : Number(cartItem.totalPrice) || 0,
      quantity: qty,
    };
  });
}

export function buildItemsFromOrder(order) {
  return (order?.items || []).map((item, idx) => {
    const product = item.productId;
    const jewelry = item.jewelryId;
    const linked =
      typeof product === "object" && product
        ? product
        : typeof jewelry === "object" && jewelry
        ? jewelry
        : null;
    const quantity = Number(item.quantity) || 1;
    const price =
      (Number(item.itemTotal) || 0) / quantity || Number(linked?.price) || 0;
    const variant =
      item.customization?.quality?.name ||
      item.customization?.goldKarat?.name ||
      item.customization?.certificate?.name ||
      "";
    const sku =
      linked?.sku ||
      item.sku ||
      (typeof product === "string" ? product : null) ||
      (typeof jewelry === "string" ? jewelry : null) ||
      linked?._id ||
      item._id ||
      `item_${idx + 1}`;

    return {
      id: String(sku),
      name: linked?.name || linked?.jewelryName || item.title || item.jewelryTitle || item.name || "GemRishi Item",
      category: linked ? (jewelry ? "Jewelry" : "Gemstone") : (item.itemType || "Gemstone"),
      variant,
      price,
      quantity,
    };
  });
}

export default {
  trackPurchaseEvent,
  buildItemsFromCartData,
  buildItemsFromRawCart,
  buildItemsFromOrder,
};
