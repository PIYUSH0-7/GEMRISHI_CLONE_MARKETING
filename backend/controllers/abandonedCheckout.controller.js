//----------------Add By Pawan For the Abandoned Checkout-------------
import { AbandonedCheckout } from "../models/abandonedCheckout.model.js";
import asyncHandler from "../utils/asyncHandler.js";
const buildFilter = (query) => {
  const { stage, status, search,fromDate, toDate } = query;
  const filter = {};

  if (stage && ["before_address", "before_payment", "completed"].includes(stage)) {
    filter.dropOffStage = stage;
  }

  // status: "pending" | "resolved"
  if (status === "pending") {
    filter.isResolved = false;
  } else if (status === "resolved") {
    filter.isResolved = true;
  }

  if (search) {
    const regex = { $regex: search, $options: "i" };
    filter.$or = [
      { "customer.name": regex },
      { "customer.emailAddress": regex },
      { "customer.phoneNumber": regex },
      { "customer.shippingAddress.name": regex },
      { "customer.billingAddress.name": regex },
    ];
  }
   
  // --------------Date filter----------
  if (fromDate || toDate) {
    filter.createdAt = {};

    if (fromDate) {
      filter.createdAt.$gte = new Date(`${fromDate}T00:00:00.000Z`);
    }

    if (toDate) {
      filter.createdAt.$lte = new Date(`${toDate}T23:59:59.999Z`);
    }
  }

  return filter;
};

// GET /admin/abandoned-checkouts
export const listAbandonedCheckouts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const sort = req.query.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const filter = buildFilter(req.query);

  const [checkouts, total, totalValueAgg] = await Promise.all([
    AbandonedCheckout.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-rawPayload"),
    AbandonedCheckout.countDocuments(filter),
    // Total abandoned cart value across ALL matching records
    AbandonedCheckout.aggregate([
      { $match: filter },
      { $group: { _id: null, totalValue: { $sum: "$cartDetails.totalPrice" } } },
    ]),
  ]);

  return res.status(200).json({
    success: true,
    data: checkouts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    totalAbandonedValue: totalValueAgg[0]?.totalValue || 0,
  });
});

// GET /admin/abandoned-checkouts-----id
export const getAbandonedCheckoutById = asyncHandler(async (req, res) => {
  const checkout = await AbandonedCheckout.findById(req.params.id);

  if (!checkout) {
    return res.status(404).json({ success: false, message: "Abandoned checkout not found" });
  }

  return res.status(200).json({ success: true, data: checkout });
});

// PATCH /admin/abandoned-checkouts/resolve
export const markAbandonedCheckoutResolved = asyncHandler(async (req, res) => {
  const isResolved = req.body?.isResolved !== undefined ? !!req.body.isResolved : true;

  const checkout = await AbandonedCheckout.findByIdAndUpdate(
    req.params.id,
    { isResolved },
    { new: true }
  );

  if (!checkout) {
    return res.status(404).json({ success: false, message: "Abandoned checkout not found" });
  }

  return res.status(200).json({ success: true, data: checkout });
});

// GET /admin/abandoned-checkouts/export/csv?search=&status=&stage=
export const exportAbandonedCheckouts = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);
  const sort = req.query.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const checkouts = await AbandonedCheckout.find(filter).sort(sort).select("-rawPayload");

  const escapeCsv = (val) => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const paisaToRupee = (p) => (p || p === 0 ? (p / 100).toFixed(2) : "");

  const headers = [
    "Date",
    "Name",
    "Email",
    "Phone",
    "Stage",
    "Status",
    "Item Count",
    "Cart Total (INR)",
    "Amount Paid (INR)",
    "IP Address",
    "Device",
    "OS",
    "Browser",
    "Checkout URL",
  ];

  const rows = checkouts.map((c) => {
    const name =
      c.customer?.shippingAddress?.[0]?.name ||
      c.customer?.billingAddress?.[0]?.name ||
      "";

    return [
      c.createdAt ? c.createdAt.toISOString() : "",
      name,
      c.customer?.emailAddress || "",
      c.customer?.phoneNumber || "",
      c.dropOffStage,
      c.isResolved ? "Resolved" : "Pending",
      c.cartDetails?.itemCount ?? "",
      paisaToRupee(c.cartDetails?.totalPrice),
      paisaToRupee(c.cartDetails?.amountPaid),
      c.ipAddress || "",
      c.deviceInfo?.deviceName || "",
      c.deviceInfo?.os || "",
      c.deviceInfo?.browser || "",
      c.checkoutUrl || "",
    ]
      .map(escapeCsv)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="abandoned-checkouts-${Date.now()}.csv"`
  );
  return res.status(200).send(csv);
});

/**
 * Programmatically create or update an AbandonedCheckout record from orders, webhooks, or drop-offs
 */
export const recordAbandonedCheckout = async ({
  order,
  stage = "before_payment",
  reason = null,
  source = "cashfree_checkout",
  customerPhone = null,
  customerEmail = null,
  customerName = null,
  shippingAddress = null,
  billingAddress = null,
  cartItems = null,
  isResolved = false,
  clientInfo = null, // { ipAddress, userAgent, deviceInfo } - only passed from the customer's own request
}) => {
  if (!order) return null;

  try {
    // If order has unpopulated items and no explicit cartItems, populate them
    if ((!cartItems || cartItems.length === 0) && order.items && Array.isArray(order.items)) {
      const needsPopulate = order.items.some(
        (it) => (it.productId && !it.productId.name && !it.title) || (it.jewelryId && !it.jewelryId.jewelryName && !it.title)
      );

      if (needsPopulate) {
        if (typeof order.populate === "function") {
          try {
            await order.populate([
              { path: "items.productId", select: "name images price slug sku" },
              { path: "items.jewelryId", select: "jewelryName images price slug sku" },
              { path: "items.customization.jewelryId", select: "jewelryName images price slug sku" },
              { path: "items.customization.productId", select: "name images price slug sku" },
            ]);
          } catch (pErr) {
            console.warn("Could not populate order for abandoned checkout:", pErr.message);
          }
        } else if (order._id) {
          try {
            const { Order } = await import("../models/order.model.js");
            const fresh = await Order.findById(order._id)
              .populate("items.productId", "name images price slug sku")
              .populate("items.jewelryId", "jewelryName images price slug sku")
              .populate("items.customization.jewelryId", "jewelryName images price slug sku")
              .populate("items.customization.productId", "name images price slug sku");
            if (fresh) order = fresh;
          } catch (fErr) {
            console.warn("Could not fetch fresh order for abandoned checkout:", fErr.message);
          }
        }
      }
    }

    const rawTotal = Number(order.totalAmount || order.onlinePayAmount || 0);
    const totalPricePaisa = Math.round(rawTotal * 100);
    const initialPricePaisa = Math.round(Number(order.subTotal || rawTotal) * 100);

    const parseImage = (img) => {
      if (!img) return "";
      let raw = "";
      if (typeof img === "object" && img !== null) {
        raw = img.url || (img.fileName ? `/public/uploads/product/${img.fileName}` : "") || "";
      } else if (typeof img === "string") {
        raw = img.trim();
      }
      if (!raw || raw === "[object Object]") return "";
      return raw.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i, "");
    };

    let items = [];
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      items = cartItems.map((ci) => {
        const title = ci.item_name || ci.title || ci.name || "GemRishi Item";
        const image = parseImage(ci.image || ci.item_image_url);
        const jewImage = parseImage(ci.jewelryImage);
        const itemPrice = Math.round(Number(ci.item_price || ci.price || 0) * 100);
        return {
          title,
          quantity: Math.max(1, Number(ci.item_quantity || ci.quantity || 1)),
          finalPrice: itemPrice,
          image,
          jewelryTitle: ci.jewelryTitle || "",
          jewelryImage: jewImage,
          customization: ci.customization || {},
        };
      });
    } else {
      items = (order.items || []).map((it) => {
        const prod = it.productId;
        const jew = it.jewelryId;
        const customJew = it.customization?.jewelryId;
        const customProd = it.customization?.productId;

        const title =
          it.title ||
          prod?.name ||
          customProd?.name ||
          jew?.jewelryName ||
          customJew?.jewelryName ||
          "GemRishi Item";

        const primaryRaw =
          it.image ||
          (Array.isArray(prod?.images) && prod.images[0]) ||
          prod?.images ||
          (Array.isArray(customProd?.images) && customProd.images[0]) ||
          customProd?.images ||
          (Array.isArray(jew?.images) && jew.images[0]) ||
          jew?.images ||
          "";

        const image = parseImage(primaryRaw);

        const jewRaw =
          it.jewelryImage ||
          (Array.isArray(jew?.images) && jew.images[0]) ||
          jew?.images ||
          (Array.isArray(customJew?.images) && customJew.images[0]) ||
          customJew?.images ||
          "";

        const jewelryImage = parseImage(jewRaw);
        const itemPrice = Math.round(Number(it.itemTotal || it.price || 0) * 100);

        return {
          title,
          quantity: Math.max(1, Number(it.quantity || 1)),
          finalPrice: itemPrice,
          image,
          jewelryTitle: it.jewelryTitle || jew?.jewelryName || customJew?.jewelryName || "",
          jewelryImage,
          customization: it.customization || {},
        };
      });
    }

    const rawPhone =
      customerPhone ||
      shippingAddress?.mobileNo ||
      shippingAddress?.phoneNumber ||
      order.address?.mobileNo ||
      order.userId?.mobileNo ||
      order.userId?.phone ||
      "";
    const phone = rawPhone.replace(/\D/g, "").slice(-10) || rawPhone || "Not Provided";

    // Clean customer email, avoiding temporary guest placeholders if real email is available
    let email = customerEmail || shippingAddress?.email || order.address?.email;
    if (!email || email.startsWith("guest_") || email === "guest@gemrishi.com") {
      const uEmail = order.userId?.email;
      if (uEmail && !uEmail.startsWith("guest_") && !uEmail.includes("@temp.com")) {
        email = uEmail;
      }
    }
    if (!email || email.startsWith("guest_") || email.includes("@temp.com")) {
      email = "guest@gemrishi.com";
    }

    // Clean customer name
    let name =
      customerName ||
      shippingAddress?.fullName ||
      shippingAddress?.name ||
      order.address?.fullName;
    if (!name || name === "Valued Customer" || name === "Guest User") {
      const uName = order.userId?.fullName || order.userId?.name;
      if (uName && uName !== "Guest User") {
        name = uName;
      }
    }
    if (!name) name = "Guest Customer";

    let shippingArr = undefined;
    const a = shippingAddress || order.address;
    if (a && (a.addressLine1 || a.line1 || a.city || a.pinCode || a.postalCode || a.fullName || a.name)) {
      shippingArr = [
        {
          name: a.fullName || a.name || name,
          phoneNumber: a.mobileNo || a.phoneNumber || phone,
          line1: a.addressLine1 || a.line1 || "",
          line2: a.addressLine2 || a.line2 || "",
          city: a.city || "",
          state: a.state || "",
          district: a.district || "",
          postalCode: a.pinCode || a.postalCode || "",
          country: a.country || "India",
          landmark: a.landmark || "",
          _type: a.addressType || a._type || "Home",
        },
      ];
    }

    let billingArr = undefined;
    const b = billingAddress || order.billingAddress || (shippingArr ? a : null);
    if (b && (b.addressLine1 || b.line1 || b.city || b.pinCode || b.postalCode || b.fullName || b.name)) {
      billingArr = [
        {
          name: b.fullName || b.name || name,
          phoneNumber: b.mobileNo || b.phoneNumber || phone,
          line1: b.addressLine1 || b.line1 || "",
          line2: b.addressLine2 || b.line2 || "",
          city: b.city || "",
          state: b.state || "",
          district: b.district || "",
          postalCode: b.pinCode || b.postalCode || "",
          country: b.country || "India",
          landmark: b.landmark || "",
          _type: b.addressType || b._type || "Home",
        },
      ];
    }

    const checkoutUrl = `https://gemrishi.com/checkout/${order.orderId || order._id}`;
    const resolvedIsResolved =
      isResolved !== undefined
        ? !!isResolved
        : stage === "completed" || order.paymentStatus === "Completed";

    const doc = await AbandonedCheckout.findOneAndUpdate(
      {
        $or: [
          { checkoutUrl },
          { "rawPayload.orderId": order.orderId },
        ],
      },
      {
        userId: order.userId?._id || order.userId,
        checkoutUrl,
        paymentMethod: order.paymentMethod || "cashfree",
        paymentMode: order.paymentMode || (order.paymentMethod === "cod" ? "Cash on Delivery" : "Cashfree (Online)"),
        paymentStatus: stage === "completed" || order.paymentStatus === "Completed" ? "Completed" : (order.paymentStatus || "Pending"),
        paymentDetails: order.paymentDetails || undefined,
        amountPaid: Number(order.paidAmount !== undefined ? order.paidAmount : (order.paymentStatus === "Completed" || stage === "completed" ? rawTotal : 0)),
        cartDetails: {
          initialPrice: initialPricePaisa,
          totalPrice: totalPricePaisa,
          amountPaid: Math.round(Number(order.paidAmount !== undefined ? order.paidAmount : (order.paymentStatus === "Completed" || stage === "completed" ? rawTotal : 0)) * 100),
          itemCount: items.length || 1,
          items,
          tax: 0,
          shippingCharge: 0,
          surcharge: 0,
        },
        customer: {
          name,
          phoneNumber: phone,
          emailAddress: email,
          shippingAddress: shippingArr,
          billingAddress: billingArr,
        },
        comments: reason ? { reason } : undefined,
        dropOffStage: stage,
        rawPayload: {
          orderId: order.orderId,
          cashfreeOrderId: order.cashfreeOrderId,
          source,
          updatedAt: new Date().toISOString(),
        },
        source,
        isResolved: resolvedIsResolved,
        // Webhooks/cron run from Cashfree/our server, so they pass no clientInfo and never overwrite the customer's IP/device.
        ...(clientInfo?.ipAddress ? { ipAddress: clientInfo.ipAddress } : {}),
        ...(clientInfo?.userAgent ? { userAgent: clientInfo.userAgent } : {}),
        ...(clientInfo?.deviceInfo ? { deviceInfo: clientInfo.deviceInfo } : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Abandoned checkout recorded for order ${order.orderId}: Name=${name}, Phone=${phone}, Stage=${stage}, Resolved=${resolvedIsResolved}`);
    return doc;
  } catch (err) {
    console.error("Error recording abandoned checkout:", err.message);
    return null;
  }
};

/**
 * Mark abandoned checkout resolved when order is paid
 */
export const markAbandonedCheckoutResolvedByOrderId = async (orderId, paymentData = {}) => {
  if (!orderId) return;
  try {
    const updateSet = {
      isResolved: true,
      dropOffStage: "completed",
      paymentStatus: "Completed",
    };
    if (paymentData.paymentMode) updateSet.paymentMode = paymentData.paymentMode;
    if (paymentData.paidAmount !== undefined) {
      updateSet.amountPaid = Number(paymentData.paidAmount);
      updateSet["cartDetails.amountPaid"] = Math.round(Number(paymentData.paidAmount) * 100);
    }
    if (paymentData.paymentDetails) updateSet.paymentDetails = paymentData.paymentDetails;

    await AbandonedCheckout.updateMany(
      {
        $or: [
          { checkoutUrl: { $regex: orderId } },
          { "rawPayload.orderId": orderId },
        ],
      },
      {
        $set: updateSet,
      }
    );
    console.log(`✅ Marked abandoned checkout resolved for order ${orderId}`);
  } catch (err) {
    console.error("Error marking abandoned checkout resolved:", err.message);
  }
};
//----------------Add By Pawan For the Abandoned Checkout-------------