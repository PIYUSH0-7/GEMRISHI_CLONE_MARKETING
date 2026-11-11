//----------------------Add By Pawan Abandoned Checkout---------------------------------------
import { Jewelry } from "../models/jewelry.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { Retailer } from "../models/retailer.model.js";
import { User } from "../models/user.model.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmails.js";
import { Offer } from "../models/offer.model.js";
import { RetailerStock } from "../models/retailerStock.model.js";
import { MetalRates } from "../models/metalRates.model.js";
import mongoose from "mongoose";
import { getIO } from "../socket.js";
import { getLatestMetalRates } from "../utils/getLatestMetalRates.js";
// ---- Add By Pawan (START): Meta tracking — Purchase is now sent ONLY from verified-payment / confirmed-COD paths ----
// (the old direct CAPI import was removed: nothing in this file builds a Purchase by hand any more)
import { getRequestContextForMeta, sendMetaCapiEvent } from "../utils/metacapi.js";
import { getClientInfo } from "../utils/clientInfo.js";
import { buildOrderMetaTracking } from "../utils/metacapicore.js";
import { dispatchMetaPurchaseForOrder } from "../utils/metapurchase.js";
// ---- Add By Pawan (END) ----
import { sendGA4MeasurementEvent } from "../utils/ga4MeasurementProtocol.js";
import { createCashfreeOrderSession, normalizePublicImageUrl } from "../utils/cashfree.js";
import {
  recordAbandonedCheckout,
  markAbandonedCheckoutResolvedByOrderId,
} from "./abandonedCheckout.controller.js";
import { sendOrderConfirmationEmail } from "../utils/orderConfirmationEmail.js";
import {
  CAMPAIGN_CONFIG,
  getProductDisplayPrice,
  isCampaignActive,
  isCartItemMatchingBagTarget,
  isGemstoneOfferEligible,
  isGemstoneApplicable,
  getGemstoneDiscountPercent,
  isJewelleryMetalApplicable,
  isSilverOfferEligible,
  isBagOfferEligible,
} from "../config/campaignOffers.config.js";

dotenv.config();

export const createProductOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { totalAmount, items, address, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: "Items array is required" });
  }

  let calculatedTotal = 0;

  // Validate stock for all items
  for (const item of items) {
    const { productId, jewelryId, quantity, itemTotal } = item;

    if (productId) {
      const product = await Product.findById(productId);
      const jewelry = await Jewelry.findById(jewelryId);
      if (!product) {
        return res.status(404).json({ msg: "Product not found:" });
      }

      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ msg: `Insufficient stock for ${product.name}` });
      }
      const basePrice = product.price;
      const certPrices = product.certificate.map((cert) => cert.price);
      const jewelryPrice =
        jewelry && typeof jewelry.price === "number" ? jewelry.price : null;
      const qualityPrices =
        jewelry && Array.isArray(jewelry.quality)
          ? jewelry.quality.map((qual) => qual.price)
          : [];

      let validTotals = new Set();

      if (jewelry) {
        // must include jewelry combinations only
        if (typeof jewelryPrice === "number") {
          validTotals.add(basePrice * quantity + jewelryPrice * quantity);

          certPrices.forEach((cert) => {
            validTotals.add(
              (basePrice + cert) * quantity + jewelryPrice * quantity,
            );
            qualityPrices.forEach((ql) => {
              validTotals.add(
                (basePrice + cert + ql) * quantity + jewelryPrice * quantity,
              );
            });
          });

          qualityPrices.forEach((ql) => {
            validTotals.add(
              (basePrice + ql) * quantity + jewelryPrice * quantity,
            );
          });
        }
      } else {
        // combos without jewelry
        validTotals.add(basePrice * quantity);
        certPrices.forEach((cert) =>
          validTotals.add((basePrice + cert) * quantity),
        );
      }

      const itemValidTotals = Array.from(validTotals);
      console.log({
        basePrice,
        certPrices,
        jewelryPrice,
        qualityPrices,
        quantity,
        itemTotal,
        validTotals: Array.from(validTotals),
      });

      if (!itemValidTotals.includes(itemTotal)) {
        return res
          .status(400)
          .json({ msg: `Amount mismatch for product ${productId}` });
      }

      calculatedTotal = calculatedTotal + itemTotal;
    } else if (jewelryId) {
      // Jewelry-only logic
      const jewelry = await Jewelry.findById(jewelryId);
      if (!jewelry) {
        return res.status(404).json({ msg: `Jewelry not found: ${jewelryId}` });
      }
      if (jewelry.stock < quantity) {
        return res
          .status(400)
          .json({ msg: `Insufficient stock for ${jewelry.jewelryName}` });
      }

      const basePrice = jewelry.price || 0;
      const qualityPrices = Array.isArray(jewelry.quality) && jewelry.quality.length > 0
        ? jewelry.quality.map((q) => q.price)
        : [0, 20000, 100000, 500000];
      const weightPrices = Array.isArray(jewelry.gemstoneWeight)
        ? jewelry.gemstoneWeight.map((w) => w.price)
        : [];
      const certPrices = Array.isArray(jewelry.certificate)
        ? jewelry.certificate.map((c) => c.price)
        : [];

      let validTotals = new Set();

      // base + weight + quality
      weightPrices.forEach((weight) => {
        qualityPrices.forEach((qual) => {
          validTotals.add((basePrice + weight + qual) * quantity);
        });
      });

      // base + weight + quality + certificate
      weightPrices.forEach((weight) => {
        qualityPrices.forEach((qual) => {
          certPrices.forEach((cert) => {
            validTotals.add((basePrice + weight + qual + cert) * quantity);
          });
        });
      });

      const itemValidTotals = Array.from(validTotals);
      console.log("valid totals from jewel", itemValidTotals);

      if (!itemValidTotals.includes(itemTotal)) {
        return res
          .status(400)
          .json({ msg: `Amount mismatch for jewelry ${jewelryId}` });
      }

      calculatedTotal += itemTotal;
    }
  }

  if (calculatedTotal !== totalAmount) {
    return res.status(400).json({ msg: "Final total is mismatched" });
  }
  let razorpayOrderId = null;
  let data = null;

  // if (paymentMethod !== "cod") {
  //   const orderPayload = {
  //     amount: totalAmount * 100,
  //     currency: "INR",
  //     receipt: "receipt_" + Date.now(),
  //   };

  //   const basicAuth = Buffer.from(
  //     process.env.RAZOR_PAY_KEY_ID + ":" + process.env.RAZOR_PAY_KEY_SECRET
  //   ).toString("base64");

  //   const response = await fetch("https://api.razorpay.com/v1/orders", {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Basic ${basicAuth}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(orderPayload),
  //   });

  //   data = await response.json();

  //   if (!response.ok || !data.id) {
  //     return res.status(500).json({ msg: "Failed to create Razorpay order" });
  //   }

  //   razorpayOrderId = data.id;
  // }

  // Reduce stock
  for (const item of items) {
    const { productId, quantity } = item;
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity },
    });
  }

  // Reduce stock
  for (const item of items) {
    const { jewelryId, quantity } = item;
    await Jewelry.findByIdAndUpdate(jewelryId, {
      $inc: { stock: -quantity },
    });
  }

  const order = new Order({
    userId: userId,
    orderId: generateOrderId(),
    totalAmount,
    items,
    razorpayOrderId,
    address,
    paymentMethod,
  });

  await order.save();

  return res.status(200).json({
    msg: "Order initiated successfully",
    order,
    data: paymentMethod === "COD" ? null : data,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const order = await Order.findOne({ razorpayOrderId }).populate(
    "userId retailerId",
  );
  if (!order) {
    return res.status(404).json({ msg: "Order not found" });
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZOR_PAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (razorpaySignature !== generatedSignature) {
    return res.status(400).json({
      msg: "Invalid credentials",
    });
  }

  const finalized = await finalizePaidOrder(
    order,
    razorpayPaymentId,
    razorpaySignature,
  );

  return res.status(200).json({
    msg: finalized ? "Order Verified Sucessfully" : "Order already verified",
    order,
  });
});

// -------------------------Add By Pawan---------------------------------
// Shared by the browser callback (verifyPayment) and the Razorpay webhook.
// Safe to call more than once for the same order: only the first caller
// actually finalizes it, so stock/cart/email side effects never run twice.
export const finalizePaidOrder = async (
  order,
  paymentId,
  signature = null,
  gateway = "cashfree",
  paymentInfo = null,
) => {
  const isCashfree =
    gateway === "cashfree" ||
    order.paymentMethod === "cashfree" ||
    (!order.razorpayOrderId && !!order.cashfreeOrderId);

  const updateFields = {
    paymentStatus: "Completed",
    orderStatus: "InProgress",
  };

  if (isCashfree) {
    updateFields.cashfreePaymentId = paymentId;
  } else {
    updateFields.razorpayPaymentId = paymentId;
    if (signature) {
      updateFields.razorpaySignature = signature;
    }
  }

  // Populate mode of payment and paid amount
  if (paymentInfo) {
    if (paymentInfo.paymentMode) updateFields.paymentMode = paymentInfo.paymentMode;
    if (paymentInfo.paidAmount !== undefined) updateFields.paidAmount = Number(paymentInfo.paidAmount);
    if (paymentInfo.paymentDetails) updateFields.paymentDetails = paymentInfo.paymentDetails;
  } else {
    if (order.paymentMode) updateFields.paymentMode = order.paymentMode;
    if (order.paidAmount !== undefined) updateFields.paidAmount = Number(order.paidAmount);
    if (order.paymentDetails) updateFields.paymentDetails = order.paymentDetails;
  }
  if (!updateFields.paidAmount) {
    updateFields.paidAmount = Number(order.onlinePayAmount || order.totalAmount || 0);
  }
  if (!updateFields.paymentMode) {
    updateFields.paymentMode = isCashfree ? "Cashfree (Online)" : (order.paymentMethod === "cod" ? "Cash on Delivery" : "Online");
  }

  const claim = await Order.updateOne(
    { _id: order._id, paymentStatus: { $ne: "Completed" } },
    { $set: updateFields },
  );
  if (claim.modifiedCount === 0) return false; // already finalized elsewhere

  order.paymentStatus = "Completed";
  order.orderStatus = "InProgress";
  order.paymentMode = updateFields.paymentMode;
  order.paidAmount = updateFields.paidAmount;
  if (updateFields.paymentDetails) order.paymentDetails = updateFields.paymentDetails;

  // Mark abandoned checkout as resolved since order is now completed
  try {
    await markAbandonedCheckoutResolvedByOrderId(order.orderId, {
      paymentMode: updateFields.paymentMode,
      paidAmount: updateFields.paidAmount,
      paymentDetails: updateFields.paymentDetails,
    });
  } catch (resErr) {
    console.error("Error marking abandoned checkout resolved:", resErr.message);
  }

  if (isCashfree) {
    order.cashfreePaymentId = paymentId;
  } else {
    order.razorpayPaymentId = paymentId;
    if (signature) {
      order.razorpaySignature = signature;
    }
  }

  // ---- Add By Pawan (START): Purchase for a VERIFIED online payment ----
  // We only reach this line when the claim above succeeded (paymentStatus flipped to "Completed"
  // after Cashfree/Razorpay verification). The dispatcher adds a second, persistent idempotency
  // claim (metaTracking.purchase) so webhook retries / cron / browser-verify races send ONE event.
  // Value = verified paid amount (fallback: server order total), currency INR, event_id = String(orderId),
  // event_source_url + fbp/fbc/IP/UA come from what was stored at checkout (not from the webhook).
  dispatchMetaPurchaseForOrder(order, { kind: "online" }).catch(() => {});
  // ---- Add By Pawan (END) ----

  // Fire server-side Google Analytics 4 Measurement Protocol event
  sendGA4MeasurementEvent({
    eventName: "purchase",
    clientId: String(order.userId?._id || order.orderId),
    userId: String(order.address?.email || order.userId?.email || ""),
    eventParams: {
      transaction_id: String(order.orderId),
      value: Number(order.totalAmount) || 0,
      currency: "INR",
      shipping: Number(order.shippingCost) || 0,
      items: (order.items || []).map((item) => ({
        item_id: String(item.productId || item.jewelryId || item._id),
        item_name: item.title || item.jewelryTitle || "Gemstone Item",
        quantity: Number(item.quantity) || 1,
        price: Number(item.itemTotal) || 0,
      })),
    },
  });

  try {
    const io = getIO();
    if (io) {
      io.emit("new_order", order);
      console.log("⚡ Realtime 'new_order' socket event emitted after payment verification!");
    }
  } catch (socketErr) {
    console.error("Socket emit error:", socketErr);
  }

  // ✅ Clear cart only after successful payment
  const retailer = await Retailer.findById(order.retailerId);
  if (retailer) {
    retailer.cart = [];
    await retailer.save();
  }

  const user = await User.findById(order.userId);
  if (user) {
    user.cart = [];
    await user.save();
  }

  for (const product of order.items) {
    await Product.findByIdAndUpdate(product.productId, {
      $inc: { orderCount: 1 },
    });
  }

  // Add retailer stock ONLY if the order belongs to a retailer
  if (order.retailerId) {
    for (const item of order.items) {
      await RetailerStock.create({
        retailerId: order.retailerId,
        productId: item.productId,
        certificate: item.customization?.certificate
          ? {
              certificateType: item.customization.certificate.certificateType,
              price: item.customization.certificate.price,
            }
          : null,
        quantity: item.quantity,
      });
    }
  }

  if (isCashfree) {
    order.cashfreePaymentId = paymentId;
  } else {
    order.razorpayPaymentId = paymentId;
    if (signature) {
      order.razorpaySignature = signature;
    }
  }

  await order.save();

  // Post-order confirmation email matching the Thank You page (ONLY sent after successful payment)
  try {
    const fullOrder = await Order.findById(order._id)
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

    await sendOrderConfirmationEmail(fullOrder || order);
  } catch (emailErr) {
    console.error(
      `Order confirmation email notice for ${order.orderId}:`,
      emailErr.message
    );
  }

  return true;
};

// An order should only show up in the admin Order List once the customer has
// actually completed checkout. A plain full-COD order (no online prepayment)
// is "complete" the moment it's placed, since there's no online payment step
// for it to get stuck on. Any order that still requires an online payment
// (razorpay, breeze, or a partial-prepay COD order) but is still sitting on
// "Pending" hasn't actually been completed yet — it's a checkout-in-progress
// (or abandoned) record and belongs in Abandoned Checkout, not the Order List.
const NOT_YET_COMPLETED_FILTER = {
  paymentStatus: "Pending",
  $or: [
    { paymentMethod: "cashfree" },
    { paymentMethod: "razorpay" },
    // { paymentMethod: "breeze" },-----------Update by Pawan---------
    { partialPay: true },
  ],
};

export const getAllOrders2 = asyncHandler(async (req, res) => {
  console.log("GET ORDERS 2");
  let query = {
    $nor: [NOT_YET_COMPLETED_FILTER], // exclude orders whose checkout isn't actually complete yet
  };

  const orders = await Order.find(query)
    .populate("userId", "fullName email")
    .populate("retailerId", "fullName email")
    .populate("items.productId items.jewelryId")
    .sort({ createdAt: -1 }); // populate only needed fields

  return res.status(200).json({
    msg: "Orders fetched",
    orders,
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  console.log("GET All ORDERS");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search, orderStatus } = req.query;

  // base query
  let query = {
    $nor: [NOT_YET_COMPLETED_FILTER], // exclude orders whose checkout isn't actually complete yet
  };

  // Filter by orderStatus if provided
  if (
    orderStatus &&
    ["Pending", "InProgress", "Completed", "Cancelled"].includes(orderStatus)
  ) {
    query.orderStatus = orderStatus;
  }

  // search by orderId, customer name, phone, email, or user
  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    const matchingUsers = await User.find({
      $or: [
        { fullName: searchRegex },
        { email: searchRegex },
        { mobileNo: searchRegex },
      ],
    }).select("_id");

    const userIds = matchingUsers.map((u) => u._id);

    const searchConditions = [
      { orderId: searchRegex },
      { "address.fullName": searchRegex },
      { "address.email": searchRegex },
      { "address.mobileNo": searchRegex },
      { "address.city": searchRegex },
      { cashfreeOrderId: searchRegex },
      { cashfreePaymentId: searchRegex },
      // { breezeTransactionId: searchRegex },  -----------update by Pawan-----------
      { razorpayOrderId: searchRegex },
    ];

    if (userIds.length > 0) {
      searchConditions.push({ userId: { $in: userIds } });
    }

    if (/^[0-9a-fA-F]{24}$/.test(search)) {
      searchConditions.push({ _id: search });
    }

    // NOTE: this was previously `query.$nor = searchConditions`, which (a)
    // excluded matches instead of including them, and (b) clobbered the
    // completion filter above, letting not-yet-completed orders reappear
    // in the Order List whenever an admin searched. Use $and so both the
    // "checkout actually completed" filter and the search match apply.
    query.$and = [{ $or: searchConditions }];
  }
  console.log("query", query);

  const totalOrders = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .skip(skip)
    .limit(limit)
    .populate({
      path: "userId",
      select: "fullName email",
    })
    .populate("items.productId")
    .populate("items.jewelryId")
    .populate("items.customization.jewelryId")
    .populate("items.customization.productId")
    .populate("retailerId")
    .sort({ createdAt: -1, _id: -1 }); // populate only needed fields

  return res.status(200).json({
    msg: "Orders fetched",
    orders,
    totalPage: Math.ceil(totalOrders / limit),
    currentPage: page,
    totalOrders,
  });
});

export const updateOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus, orderStatus } = req.body;
  const order = await Order.findById(orderId).populate("userId retailerId");
  if (!order) {
    return res.status(404).json({ msg: "No order found" });
  }

  // Only update if the field exists in the request
  if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
  if (orderStatus !== undefined) order.orderStatus = orderStatus;

  await order.save();

  await sendEmail({
    to: order?.userId?.email || order?.retailerId?.email,
    subject: `Your Order #${order.orderId} Update`,
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2C3E50;">Order Update Notification</h2>
      <p>Dear ${
        order?.userId?.fullName ||
        order?.retailerId?.fullName ||
        "Valued Customer"
      },</p>
      <p>We wanted to let you know that there has been an update regarding your order:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr>
          <td style="padding: 8px; font-weight: bold;">Order ID:</td>
          <td style="padding: 8px;">${order.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Payment Status:</td>
          <td style="padding: 8px;">${order.paymentStatus}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Order Status:</td>
          <td style="padding: 8px;">${order.orderStatus}</td>
        </tr>
      </table>

      <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:wecare@gemrishi.com">wecare@gemrishi.com</a>.</p>

      <p style="margin-top: 20px;">Thank you for choosing Gemrishi. We appreciate your business!</p>

      <p style="margin-top: 20px;"><strong>Team Gemrishi</strong></p>
    </div>
  `,
  });

  return res.status(200).json({
    msg: "Order updated successfully",
    order,
  });
});

export const getOrdersByUser = asyncHandler(async (req, res) => {
  console.log("GET ORDERS BY USER API HIT");
  const userId = req.user._id || req.user.id;
  const orderStatus = req.query.orderStatus;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // ✅ Base query
  let query = {
    userId: userId,
    $nor: [
      {
        paymentMethod: { $in: ["cashfree", "razorpay"] }, //-----------Update by Pawan-----------
        paymentStatus: "Pending",
      },
    ],
  };

  // ✅ Optional filter
  if (orderStatus) {
    query.orderStatus = orderStatus;
  }

  // ✅ Count and fetch with pagination
  const totalOrders = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate([
      {
        path: "items.productId",
        select: "-reviewRating -wishlistedBy",
      },
      {
        path: "items.jewelryId",
        select: "-reviewRating -wishlistedBy",
      },
      {
        path: "items.customization.jewelryId",
        select: "-reviewRating -wishlistedBy",
      },
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    console.log("USER:", userId);
    console.log("ORDERS FOUND:", orders.length);

  if (!orders.length) {
    return res.status(404).json({ success: false, msg: "No orders found" });
  }

  return res.status(200).json({
    success: true,
    msg: "Orders found",
    totalListItems: totalOrders,
    page,
    totalPage: Math.ceil(totalOrders / limit),
    limit,
    orders,
  });
});

export const getSingleOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId).populate([
    {
      path: "userId",
      select:
        "-password -resetPasswordOtp -resetPasswordExpires -wishlist -cart",
    },
    {
      path: "retailerId",
      select: "-password -resetPasswordOtp -resetPasswordExpires -cart",
    },
    {
      path: "items.productId",
      select: "-wishlistedBy -reviewRating -orderCount",
    },
    {
      path: "items.jewelryId",
      select: "-reviewRating -orderCount",
    },
    {
      path: "items.customization.jewelryId",
      select: "-reviewRating -orderCount",
    },
    {
      path: "items.customization.productId",
      select: "-wishlistedBy -reviewRating -orderCount",
    },
  ]);

  if (!order) {
    return res.status(404).json({ msg: "No Order found" });
  }

  return res.status(200).json({
    msg: "Single Order fetched",
    order,
  });
});

export const getBestSellers = asyncHandler(async (req, res) => {
  const { limit = 5, type = "product" } = req.query;

  const bestSellers = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: type === "product" ? "$items.productId" : "$items.jewelryId",
        totalSold: { $sum: "$items.quantity" },
      },
    },
    { $match: { _id: { $ne: null } } },
    { $sort: { totalSold: -1 } },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: type === "product" ? "products" : "jewelries",
        localField: "_id",
        foreignField: "_id",
        as: "itemDetails",
      },
    },
    { $unwind: "$itemDetails" },
  ]);
  const grouped = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: type === "product" ? "$items.productId" : "$items.jewelryId",
        totalSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: Number(limit) },
    { $match: { _id: { $ne: null } } },
  ]);

  return res.status(200).json({
    msg: "Best seller products",
    bestSellers,
  });
});

export const orderUsersForCSV = asyncHandler(async (req, res) => {
  const users = await Order.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $group: {
        _id: "$userId",
        name: { $first: "$user.fullName" },
        email: { $first: "$user.email" },
        mobileNo: { $first: "$user.mobileNo" },
        address: { $first: { $arrayElemAt: ["$user.address", 0] } },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: { $sum: "$items.itemTotal" } },
        lastOrder: { $max: "$createdAt" },
      },
    },
    {
      $sort: {
        totalSpent: -1,
      },
    },
  ]);
  return res.status(200).json({
    msg: "Users found",
    users,
  });
});

export const getAllOrderUsers = asyncHandler(async (req, res) => {
  console.log("GET ORDERS BY USER API HIT");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search } = req.query;

  let matchStage = {};

  if (search) {
    matchStage = {
      $or: [
        { "user.fullName": { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
      ],
    };
  }

  // First, get total unique users
  const totalUsersAgg = await Order.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: matchStage },
    {
      $group: {
        _id: "$userId",
      },
    },
    {
      $count: "total",
    },
  ]);

  const totalUsers = totalUsersAgg.length > 0 ? totalUsersAgg[0].total : 0;
  const totalPages = Math.ceil(totalUsers / limit);

  // Now, get paginated users
  const users = await Order.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: matchStage },
    {
      $group: {
        _id: "$userId",
        name: { $first: "$user.fullName" },
        email: { $first: "$user.email" },
        mobileNo: { $first: "$user.mobileNo" },
        address: { $first: { $arrayElemAt: ["$user.address", 0] } },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: { $sum: "$items.itemTotal" } },
        lastOrder: { $max: "$createdAt" },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  return res.status(200).json({
    msg: "Users found",
    users,
    currentPage: page,
    totalPages,
    limit,
    totalUsers,
  });
});

export const orderDashboard = asyncHandler(async (req, res) => {
  // need to display total users, revenue, avg order value
  const pipeLine = await Order.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $group: {
        _id: null,
        userCount: { $addToSet: "$userId" },
        revenue: { $sum: { $sum: "$items.itemTotal" } },
        orderCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        userCount: { $size: "$userCount" },
        orderCount: 1,
        revenue: 1,
        avgOrderValue: {
          $cond: [
            { $eq: ["$orderCount", 0] },
            0,
            { $divide: ["$revenue", "$orderCount"] },
          ],
        },
      },
    },
  ]);

  return res.status(200).json(pipeLine[0]);
});

// create order currently using
export const createProductOrder2 = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { address, paymentMethod, promoCode } = req.body; // Added promoCode
  console.log(address);

  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      field: "paymentMethod",
      msg: "Payment method is required",
    });
  }

  if (!address) {
    return res
      .status(400)
      .json({ success: false, field: "address", msg: "Address is required" });
  }

  const user = await User.findById(userId)
    .populate({
      path: "cart.item",
      // Let Mongoose use refPath to populate dynamically for both Product and Jewelry
      // Nested populate for Product's subCategory (for offer validation)
      populate: { path: "subCategory" },
    })
    .populate({
      path: "cart.customization.jewelryId", // This might not be needed if cart.item is populated correctly
      model: "Jewelry",
    });

  if (!user || !user.cart || user.cart.length === 0) {
    return res.status(400).json({ success: false, msg: "Your cart is empty" });
  }

  let cartSubtotal = 0;
  const orderItems = [];

  for (const cartItem of user.cart) {
    // The totalPrice is already calculated and stored in the cart item
    const itemTotal = cartItem.totalPrice * cartItem.quantity;

    cartSubtotal += itemTotal;
    orderItems.push({
      productId: cartItem.itemType === "Product" ? cartItem.item._id : null,
      jewelryId: cartItem.itemType === "Jewelry" ? cartItem.item._id : null,
      quantity: cartItem.quantity,
      itemTotal: itemTotal,
      customization: cartItem.customization,
    });
  }

  let discountAmount = 0;
  let finalTotal = cartSubtotal;
  let appliedOffer = null;

  // --- Promo Code Logic ---
  if (promoCode) {
    const offer = await Offer.findOne({
      promoCode: promoCode.toLowerCase(),
      isActive: true,
      expiryDate: { $gte: new Date() },
    });

    if (!offer || offer.offerType !== "promocode") {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired promo code." });
    }

    let applicableItemsValue = 0;
    const applicableItems = user.cart.filter((cartItem) => {
      if (cartItem.itemType !== offer.productType) {
        return false;
      }

      let isItemApplicable = true;

      if (offer.productType === "Product" && offer.isSubCategory) {
        if (
          !cartItem.item.subCategory ||
          cartItem.item.subCategory._id.toString() !==
            offer.subCategoryTypeId.toString()
        ) {
          isItemApplicable = false;
        }
      }

      if (offer.productType === "Jewelry") {
        if (
          offer.isJewelryType &&
          cartItem.item.jewelryType !== offer.jewelryType
        ) {
          isItemApplicable = false;
        }
        if (
          offer.isJewelryMetal &&
          cartItem.item.metal !== offer.jewelryMetal
        ) {
          isItemApplicable = false;
        }
      }

      if (isItemApplicable) {
        applicableItemsValue += cartItem.totalPrice * cartItem.quantity;
      }
      return isItemApplicable;
    });

    if (applicableItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This promo code is not applicable to any items in your cart.",
      });
    }

    if (offer.totalAmount) {
      if (
        cartSubtotal < offer.minTotalAmount ||
        cartSubtotal > offer.maxTotalAmount
      ) {
        return res.status(400).json({
          success: false,
          message: `This promo code is only valid for orders between ${offer.minTotalAmount} and ${offer.maxTotalAmount}.`,
        });
      }
    }

    if (offer.itemAmount) {
      if (
        applicableItemsValue < offer.minItemAmount ||
        applicableItemsValue > offer.maxItemAmount
      ) {
        return res.status(400).json({
          success: false,
          message: `This promo code requires the total value of applicable items to be between ${offer.minItemAmount} and ${offer.maxItemAmount}.`,
        });
      }
    }

    if (offer.discountType === "percent") {
      discountAmount = (applicableItemsValue * offer.discountValue) / 100;
    } else if (offer.discountType === "flat") {
      discountAmount = offer.discountValue;
    }

    if (discountAmount > applicableItemsValue) {
      discountAmount = applicableItemsValue;
    }
    // Round discountAmount to 2 decimal places
    discountAmount = parseFloat(discountAmount.toFixed(2));

    finalTotal = cartSubtotal - discountAmount;
    appliedOffer = offer._id; // Store reference to the applied offer
  }

  // Round finalTotal and cartSubtotal to 2 decimal places for consistency
  finalTotal = parseFloat(finalTotal.toFixed(2));
  cartSubtotal = parseFloat(cartSubtotal.toFixed(2));
  // --- End of Promo Code Logic ---

  // return res.status(200).json({ success: true, msg: "Testing", finalTotal, discountAmount, appliedOffer, cartSubtotal, orderItems });

  let razorpayOrderId = null;
  let data = null;
  let onlinePayAmount = 0;

  if (paymentMethod !== "cod" || isPartialCOD) {
    const payAmount = isPartialCOD
      ? Math.round(finalTotal * 0.1)
      : Math.round(finalTotal);
    onlinePayAmount = payAmount;

    const orderPayload = {
      amount: payAmount * 100, // Use payAmount and round to avoid floating point issues
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const basicAuth = Buffer.from(
      process.env.RAZOR_PAY_KEY_ID + ":" + process.env.RAZOR_PAY_KEY_SECRET,
    ).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("Razorpay non-JSON response:", parseErr);
      return res.status(500).json({ msg: "Payment gateway is currently unavailable. Please try again." });
    }

    if (!response.ok || !data.id) {
      return res.status(500).json({ msg: "Failed to create Razorpay order" });
    }

    razorpayOrderId = data.id;
  }

  // for (const item of orderItems) {
  //   if (item.productId) {
  //     await Product.findByIdAndUpdate(item.productId, {
  //       $inc: { stock: -item.quantity },
  //     }, { new: true });
  //   }
  // if (item.jewelryId) {
  //   await Jewelry.findByIdAndUpdate(item.jewelryId, {
  //     $inc: { stock: -item.quantity },
  //   }, { new: true });
  // }
  // }

  // Calculate isPartialCOD
  const isPartialCOD =
    paymentMethod === "cod" && finalTotal >= 5000 && finalTotal <= 20000;

  const order = new Order({
    userId: userId,
    orderId: generateOrderId(),
    totalAmount: finalTotal,
    subTotal: cartSubtotal,
    discountAmount: discountAmount,
    offerId: appliedOffer,
    items: orderItems,
    razorpayOrderId,
    address,
    paymentMethod,
    isPartialCOD,
    partialPay: isPartialCOD,
    onlinePayAmount,
  });

  await order.save();

  if (paymentMethod == "cod") {
    user.cart = [];
    await user.save();
  }

  return res.status(200).json({
    msg: "Order initiated successfully",
    order,
    data: paymentMethod === "cod" ? null : data,
  });
});

// create order currently not using its old one but working for the gemstone only purchase
export const createProductOrder33333 = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { address, paymentMethod } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      field: "paymentMethod",
      msg: "Payment method is required",
    });
  }

  if (!address) {
    return res
      .status(400)
      .json({ success: false, field: "address", msg: "Address is required" });
  }

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, field: "User", msg: "User not found" });
  }

  const user = await User.findById(userId)
    .populate({
      path: "cart.item",
      model: "Product",
    })
    .populate({
      path: "cart.customization.jewelryId",
      model: "Jewelry",
    });

  if (!user || !user.cart || user.cart.length === 0) {
    return res.status(400).json({ msg: "Your cart is empty" });
  }

  let alltotal = 0;
  const orderItems = [];

  for (const cartItem of user.cart) {
    let itemTotal = 0;
    if (cartItem.item) {
      itemTotal = cartItem.item.price * cartItem.quantity;
    }

    if (cartItem.customization) {
      if (
        cartItem.customization.certificate &&
        cartItem.customization.certificate.price
      ) {
        itemTotal += cartItem.customization.certificate.price;
      }
      if (
        cartItem.customization.gemstoneWeight &&
        cartItem.customization.gemstoneWeight.price
      ) {
        itemTotal += cartItem.customization.gemstoneWeight.price;
      }
      if (
        cartItem.customization.quality &&
        cartItem.customization.quality.price
      ) {
        itemTotal += cartItem.customization.quality.price;
      }
      if (
        cartItem.customization.jewelryId &&
        cartItem.customization.jewelryId.price
      ) {
        itemTotal += cartItem.customization.jewelryId.price;
      }
    }

    alltotal += itemTotal;
    orderItems.push({
      productId: cartItem.item ? cartItem.item._id : null,
      jewelryId: cartItem.customization
        ? cartItem.customization.jewelryId
        : null,
      quantity: cartItem.quantity,
      itemTotal: itemTotal,
      customization: cartItem.customization,
    });
  }

  let razorpayOrderId = null;
  let data = null;

  console.log(alltotal);

  if (paymentMethod !== "cod") {
    const orderPayload = {
      amount: alltotal * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const basicAuth = Buffer.from(
      process.env.RAZOR_PAY_KEY_ID + ":" + process.env.RAZOR_PAY_KEY_SECRET,
    ).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("Razorpay non-JSON response:", parseErr);
      return res.status(500).json({ msg: "Payment gateway is currently unavailable. Please try again." });
    }

    if (!response.ok || !data.id) {
      return res.status(500).json({ msg: "Failed to create Razorpay order" });
    }

    razorpayOrderId = data.id;
  }

  for (const item of orderItems) {
    if (item.productId) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }
    // if (item.jewelryId) {
    // await Jewelry.findByIdAndUpdate(item.jewelryId, {
    //   $inc: { stock: -item.quantity },
    // });
    // }
  }

  const order = new Order({
    userId: userId,
    orderId: generateOrderId(),
    totalAmount: alltotal,
    items: orderItems,
    razorpayOrderId,
    address,
    paymentMethod,
  });

  await order.save();

  user.cart = [];
  await user.save();

  return res.status(200).json({
    msg: "Order initiated successfully",
    order,
    data: paymentMethod === "cod" ? null : data,
  });
});

export const cancelOrderByUser = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;
  const userId = req.user._id;

  if (!orderId) {
    return res
      .status(400)
      .json({ success: false, msg: "Order ID and Item ID are required." });
  }

  const order = await Order.findOne({
    _id: new mongoose.Types.ObjectId(orderId),
    userId: userId,
  });

  if (!order) {
    return res.status(404).json({ success: false, msg: "No order found" });
  }

  order.orderStatus = "Cancelled";
  order.cancelOrderReason = reason || "Cancelled by user";

  const updatedOrder = await order.save();

  return res.status(200).json({
    success: true,
    msg: "Order Cancelled successfully",
    updatedOrder,
  });
});

export const cancelOrderByUser2 = asyncHandler(async (req, res) => {
  const { orderId, itemId, reason } = req.body;
  const userId = req.user._id;

  if (!orderId || !itemId) {
    return res.status(400).json({
      success: false,
      msg: "Order ID and Item ID are required.",
    });
  }

  // Get order of this user
  const order = await Order.findOne({
    _id: new mongoose.Types.ObjectId(orderId),
    userId,
  });

  if (!order) {
    return res.status(404).json({ success: false, msg: "No order found" });
  }

  // ❌ Cannot cancel after shipped or completed
  if (["Shipped", "Completed"].includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      msg: "Order cannot be cancelled at this stage.",
    });
  }

  // Correct matching for product, jewelry, or customization
  const itemToCancel = order.items.find((item) => {
    const productId = item.productId?._id?.toString();
    const jewelryId = item.jewelryId?._id?.toString();
    const customJewelryId = item.customization?.jewelryId?._id?.toString();

    console.log("COMPARE IDs:", {
      productId,
      jewelryId,
      customJewelryId,
      incoming: itemId,
    });

    return (
      productId === itemId || jewelryId === itemId || customJewelryId === itemId
    );
  });

  if (!itemToCancel) {
    return res.status(404).json({
      success: false,
      msg: "Item not found in this order.",
    });
  }

  // Mark item as cancelled
  itemToCancel.cancelStatus = true;
  itemToCancel.cancelOrderReason = reason || "Cancelled by user";

  // Restore stock
  if (itemToCancel.productId?._id) {
    await Product.findByIdAndUpdate(itemToCancel.productId._id, {
      $inc: { stock: itemToCancel.quantity },
    });
  }

  if (itemToCancel.jewelryId?._id) {
    await Jewelry.findByIdAndUpdate(itemToCancel.jewelryId._id, {
      $inc: { stock: itemToCancel.quantity },
    });
  }

  // Check if all items are cancelled
  const allItemsCancelled = order.items.every(
    (item) => item.cancelStatus === true,
  );

  if (allItemsCancelled) {
    order.orderStatus = "Cancelled";

    // Online payment needs refund
    if (order.paymentMethod === "razorpay" || order.paymentMethod === "cashfree") {
      order.paymentStatus = "Pending Refund";
    }
  }

  // For partial cancel (some items cancelled)
  else {
    // If prepaid → mark refund pending for that item
    if (order.paymentMethod === "razorpay" || order.paymentMethod === "cashfree") {
      order.paymentStatus = "Pending Refund";
    }
  }

  const updatedOrder = await order.save();

  return res.status(200).json({
    success: true,
    msg: "Order cancelled successfully",
    updatedOrder,
  });
});

export const createProductRetailerOrder2 = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { address, paymentMethod } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      field: "paymentMethod",
      msg: "Payment method is required",
    });
  }

  if (!address) {
    return res
      .status(400)
      .json({ success: false, field: "address", msg: "Address is required" });
  }

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, field: "User", msg: "User not found" });
  }

  const user = await Retailer.findById(userId).populate({
    path: "cart.item",
    model: "Product",
  });

  if (!user || !user.cart || user.cart.length === 0) {
    return res.status(400).json({ msg: "Your cart is empty" });
  }

  let alltotal = 0;
  const orderItems = [];

  for (const cartItem of user.cart) {
    let itemTotal = 0;
    const product = await Product.findById(cartItem.item);
    if (!product) {
      return res.status(404).json({ msg: "Product not found in cart" });
    }

    if (product.stock < cartItem.quantity) {
      return res
        .status(400)
        .json({ msg: `Insufficient stock for ${product.name}` });
    }

    const productId = cartItem.item._id;
    const quantity = Number(cartItem.quantity);

    const updated = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } }, // condition
      { $inc: { stock: -quantity } }, // atomic decrement
      { new: true },
    );

    if (!updated) {
      return res.status(400).json({
        success: false,
        msg: `Insufficient stock for ${cartItem.item.name}.`,
      });
    }

    if (product.price !== cartItem.item.price) {
      return res.status(400).json({
        msg: `Price of ${product.name} has changed. Please review your cart.`,
      });
    }

    if (product.stock <= 0) {
      return res
        .status(400)
        .json({ msg: `Product ${product.name} is out of stock.` });
    }

    const prodCertificates = product.certificate.map((cert) => ({
      type: cert.certificateType,
      price: cert.price,
    }));

    if (cartItem.customization?.certificate) {
      const { certificateType, price } = cartItem.customization.certificate;

      const isValid = prodCertificates.some(
        (cert) => cert.type === certificateType && cert.price === price,
      );

      if (!isValid) {
        return res.status(400).json({
          msg: `Certificate option (${certificateType}) for ${product.name} is no longer valid. Please review your cart.`,
        });
      }
    }

    if (cartItem.item) {
      itemTotal = cartItem.item.price * cartItem.quantity;
    }

    if (cartItem.customization) {
      if (
        cartItem.customization.certificate &&
        cartItem.customization.certificate.price
      ) {
        itemTotal += cartItem.customization.certificate.price;
      }
    }

    alltotal += itemTotal;
    orderItems.push({
      productId: cartItem.item ? cartItem.item._id : null,
      // jewelryId: cartItem.customization
      //   ? cartItem.customization.jewelryId
      //   : null,
      quantity: cartItem.quantity,
      itemTotal: itemTotal,
      customization: cartItem.customization,
    });
  }

  let razorpayOrderId = null;
  let data = null;

  console.log(alltotal);

  if (paymentMethod !== "cod") {
    const orderPayload = {
      amount: alltotal * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const basicAuth = Buffer.from(
      process.env.RAZOR_PAY_KEY_ID + ":" + process.env.RAZOR_PAY_KEY_SECRET,
    ).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("Razorpay non-JSON response:", parseErr);
      return res.status(500).json({ msg: "Payment gateway is currently unavailable. Please try again." });
    }
    console.log("Razorpay response data:", data);

    if (!response.ok || !data.id) {
      return res.status(500).json({ msg: "Failed to create Razorpay order" });
    }

    razorpayOrderId = data.id;
  }

  if (paymentMethod === "cod") {
    user.cart = [];
    await user.save();
  }

  // for (const item of orderItems) {
  //   if (item.productId) {
  //     await Product.findByIdAndUpdate(item.productId, {
  //       $inc: { stock: -item.quantity },
  //     });
  //   }
  // }

  const order = new Order({
    retailerId: userId,
    orderId: generateOrderId(),
    totalAmount: alltotal,
    items: orderItems,
    razorpayOrderId,
    address,
    paymentMethod,
  });

  if (paymentMethod === "cod") {
    for (const item of orderItems) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity, orderCount: 1 },
        });
      }
    }

    // 🟢 mark payment completed for COD
    order.paymentStatus = "Pending";
    await order.save();
  }

  await order.save();

  console.log("orderItems", orderItems);

  // for (const item of orderItems) {
  //   if (item.productId) {
  //     await RetailerStock.create({
  //       retailerId: userId,
  //       productId: item.productId,
  //       certificate: item.customization?.certificate
  //         ? {
  //             certificateType: item.customization.certificate.certificateType,
  //             price: item.customization.certificate.price,
  //           }
  //         : null,
  //       quantity: item.quantity,
  //     });
  //   }
  // }

  // user.cart = [];
  // await user.save();

  return res.status(200).json({
    msg: "Order initiated successfully",
    order,
    data: paymentMethod === "cod" ? null : data,
  });
});

export const createProductRetailerOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { totalAmount, items, address, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: "Items array is required" });
  }

  let calculatedTotal = 0;

  // Validate stock for all items
  for (const item of items) {
    const { productId, jewelryId, quantity, itemTotal, customization } = item;

    if (productId) {
      const product = await Product.findById(productId);
      const jewelry = await Jewelry.findById(jewelryId);
      if (!product) {
        return res.status(404).json({ msg: "Product not found:" });
      }

      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ msg: `Insufficient stock for ${product.name}` });
      }
      const basePrice = product.price;
      const certPrices = product.certificate.map((cert) => cert.price);
      const jewelryPrice =
        jewelry && typeof jewelry.price === "number" ? jewelry.price : null;
      const qualityPrices =
        jewelry && Array.isArray(jewelry.quality)
          ? jewelry.quality.map((qual) => qual.price)
          : [];

      let validTotals = new Set();

      if (jewelry) {
        // must include jewelry combinations only
        if (typeof jewelryPrice === "number") {
          validTotals.add(basePrice * quantity + jewelryPrice * quantity);

          certPrices.forEach((cert) => {
            validTotals.add(
              (basePrice + cert) * quantity + jewelryPrice * quantity,
            );
            qualityPrices.forEach((ql) => {
              validTotals.add(
                (basePrice + cert + ql) * quantity + jewelryPrice * quantity,
              );
            });
          });

          qualityPrices.forEach((ql) => {
            validTotals.add(
              (basePrice + ql) * quantity + jewelryPrice * quantity,
            );
          });
        }
      } else {
        // combos without jewelry
        validTotals.add(basePrice * quantity);
        certPrices.forEach((cert) =>
          validTotals.add((basePrice + cert) * quantity),
        );
      }

      const itemValidTotals = Array.from(validTotals);
      console.log({
        basePrice,
        certPrices,
        jewelryPrice,
        qualityPrices,
        quantity,
        itemTotal,
        validTotals: Array.from(validTotals),
      });

      if (!itemValidTotals.includes(itemTotal)) {
        return res
          .status(400)
          .json({ msg: `Amount mismatch for product ${productId}` });
      }

      calculatedTotal = calculatedTotal + itemTotal;
    } else if (jewelryId) {
      // Jewelry-only logic
      const jewelry = await Jewelry.findById(jewelryId);
      if (!jewelry) {
        return res.status(404).json({ msg: `Jewelry not found: ${jewelryId}` });
      }
      if (jewelry.stock < quantity) {
        return res
          .status(400)
          .json({ msg: `Insufficient stock for ${jewelry.jewelryName}` });
      }

      const basePrice = jewelry.price || 0;
      const qualityPrices = Array.isArray(jewelry.quality) && jewelry.quality.length > 0
        ? jewelry.quality.map((q) => q.price)
        : [0, 20000, 100000, 500000];
      const weightPrices = Array.isArray(jewelry.gemstoneWeight)
        ? jewelry.gemstoneWeight.map((w) => w.price)
        : [];
      const certPrices = Array.isArray(jewelry.certificate)
        ? jewelry.certificate.map((c) => c.price)
        : [];

      let validTotals = new Set();

      // base + weight + quality
      weightPrices.forEach((weight) => {
        qualityPrices.forEach((qual) => {
          validTotals.add((basePrice + weight + qual) * quantity);
        });
      });

      // base + weight + quality + certificate
      weightPrices.forEach((weight) => {
        qualityPrices.forEach((qual) => {
          certPrices.forEach((cert) => {
            validTotals.add((basePrice + weight + qual + cert) * quantity);
          });
        });
      });

      const itemValidTotals = Array.from(validTotals);
      console.log("valid totals from jewel", itemValidTotals);

      if (!itemValidTotals.includes(itemTotal)) {
        return res
          .status(400)
          .json({ msg: `Amount mismatch for jewelry ${jewelryId}` });
      }

      calculatedTotal += itemTotal;
    }
  }

  if (calculatedTotal !== totalAmount) {
    return res.status(400).json({ msg: "Final total is mismatched" });
  }
  let razorpayOrderId = null;
  let data = null;

  if (paymentMethod !== "cod") {
    const orderPayload = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const basicAuth = Buffer.from(
      process.env.RAZOR_PAY_KEY_ID + ":" + process.env.RAZOR_PAY_KEY_SECRET,
    ).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("Razorpay non-JSON response:", parseErr);
      return res.status(500).json({ msg: "Payment gateway is currently unavailable. Please try again." });
    }

    if (!response.ok || !data.id) {
      return res.status(500).json({ msg: "Failed to create Razorpay order" });
    }

    razorpayOrderId = data.id;
  }

  // Reduce stock
  for (const item of items) {
    const { productId, quantity } = item;
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity },
    });
  }

  // Reduce stock
  for (const item of items) {
    const { jewelryId, quantity } = item;
    await Jewelry.findByIdAndUpdate(jewelryId, {
      $inc: { stock: -quantity },
    });
  }

  const order = new Order({
    retailerId: userId,
    orderId: generateOrderId(),
    totalAmount,
    items,
    razorpayOrderId,
    address,
    paymentMethod,
  });

  await order.save();

  return res.status(200).json({
    msg: "Order initiated successfully",
    order,
    data: paymentMethod === "COD" ? null : data,
  });
});

// new createProductOrder3 controller

/* -------------------- helpers (same semantics as applyOfferToCart) -------------------- */
function round2(n) {
  return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
}

function normalizeMetal(val) {
  if (!val) return "";
  const s = String(val).trim().toLowerCase();
  if (["panchdhatu", "pachadhatu", "panchadhatu"].includes(s))
    return "panchadhatu";
  if (s.startsWith("gold")) return "gold"; // gold, gold24k, gold22k, gold18k -> gold
  return s; // silver, platinum, etc.
}

// recompute a single cart line's unit price using latest metal rates + customization
function computeUnitPrice({ cartItem, latestRates }) {
  const { itemType, item, customization = {} } = cartItem;

  if (itemType === "Product") {
    const rawCustom = customization && typeof customization.toObject === "function"
      ? customization.toObject()
      : (customization || {});

    const baseStonePrice = getProductDisplayPrice(item);
    let unit = baseStonePrice;

    const couponCandidate =
      rawCustom.appliedCoupon ||
      rawCustom.couponCode ||
      (rawCustom.discountedPrice != null || rawCustom.discountAmount != null
        ? CAMPAIGN_CONFIG.gemstoneOffer.code
        : "");

    const offerEligibility = isGemstoneOfferEligible(baseStonePrice, couponCandidate, cartItem.item);
    if (offerEligibility.eligible) {
      unit = baseStonePrice - offerEligibility.discountAmount;
    } else if (rawCustom.discountedPrice != null && Number(rawCustom.discountedPrice) < unit) {
      unit = Number(rawCustom.discountedPrice);
    } else if (cartItem.totalPrice && (Number(cartItem.totalPrice) / Number(cartItem.quantity || 1)) < (unit + (rawCustom.certificate?.price ? Number(rawCustom.certificate.price) : 0))) {
      const certP = rawCustom.certificate?.price ? Number(rawCustom.certificate.price) : 0;
      unit = Math.max(0, (Number(cartItem.totalPrice) / Number(cartItem.quantity || 1)) - certP);
    }

    if (rawCustom.certificate?.price)
      unit += Number(rawCustom.certificate.price);

    if (rawCustom.jewelryId) {
      const j =
        typeof rawCustom.jewelryId === "object" && rawCustom.jewelryId?._id
          ? rawCustom.jewelryId
          : null;

      if (j) {
        let jewelryPrice = Number(j.jewelryPrice || 0);
        const baseMetal = normalizeMetal(j.metal);
        const w = Number(j.jewelryMetalWeight || 0);

        if (baseMetal === "gold") {
          let karat = String(
            rawCustom.goldKarat?.karatType || "",
          ).toLowerCase();
          if (!["gold24k", "gold22k", "gold18k"].includes(karat)) {
            karat = "gold22k";
          }
          const rate = Number(latestRates?.gold?.[karat]?.withGSTRate || 0);
          if (rate && w > 0 && !j.jewelryPrice) {
            jewelryPrice += w * rate;
          } else if (j.jewelryPrice && karat && karat !== "gold22k") {
            const rSelected = Number(latestRates?.gold?.[karat]?.withoutGSTRate || 0);
            const r22 = Number(latestRates?.gold?.gold22k?.withoutGSTRate || 0);
            const charge = j.makingChargePercent != null ? Number(j.makingChargePercent) : 10;
            if (rSelected && r22 && w > 0) {
              const diff = Math.round((rSelected - r22) * (1 + charge / 100) * w * 1.03);
              jewelryPrice += diff;
            }
          }
        } else if (baseMetal) {
          const rate = Number(latestRates?.[baseMetal]?.withGSTRate || 0);
          if (rate && w > 0 && !j.jewelryPrice) {
            jewelryPrice += w * rate;
          }
        }

        if (rawCustom.diamondSubstitute?.price) {
          jewelryPrice += Number(rawCustom.diamondSubstitute.price);
        }
        unit += jewelryPrice;
      } else {
        if (cartItem.totalPrice && Number(cartItem.totalPrice) > unit) {
          unit = Number(cartItem.totalPrice) / Number(cartItem.quantity || 1);
        }
      }
    }

    return round2(unit);
  }

  if (itemType === "Jewelry") {
    const j = item;
    let unit = Number(j.jewelryPrice || 0);
    const rawCustom = customization && typeof customization.toObject === "function"
      ? customization.toObject()
      : (customization || {});

    if (rawCustom.gemstoneWeight?.price)
      unit += Number(rawCustom.gemstoneWeight.price);
    if (rawCustom.quality?.price)
      unit += Number(rawCustom.quality.price);
    if (rawCustom.certificate?.price)
      unit += Number(rawCustom.certificate.price);

    const baseMetal = normalizeMetal(j.metal);
    const w = Number(j.jewelryMetalWeight || 0);

    if (baseMetal === "gold") {
      let karat = String(
        rawCustom.goldKarat?.karatType || "",
      ).toLowerCase();
      if (!["gold24k", "gold22k", "gold18k"].includes(karat)) {
        karat = "gold22k";
      }
      const rate = Number(latestRates?.gold?.[karat]?.withGSTRate || 0);
      if (rate && w > 0 && !j.jewelryPrice) {
        unit += w * rate;
      }
    } else if (baseMetal) {
      const rate = Number(latestRates?.[baseMetal]?.withGSTRate || 0);
      if (rate && w > 0 && !j.jewelryPrice) {
        unit += w * rate;
      }
    }

    if (rawCustom.diamondSubstitute?.price) {
      unit += Number(rawCustom.diamondSubstitute.price);
    }

    const isMetalEligible = isJewelleryMetalApplicable(baseMetal) || isJewelleryMetalApplicable(j.jewelryName);
    if (isMetalEligible) {
      const silverCouponCandidate =
        rawCustom.appliedCoupon ||
        rawCustom.couponCode ||
        (rawCustom.discountedPrice != null || rawCustom.discountAmount != null
          ? (CAMPAIGN_CONFIG.jewelleryOffer?.code || CAMPAIGN_CONFIG.silverOffer?.code || CAMPAIGN_CONFIG.bagOffer?.code)
          : "");
      const silverEligibility = isSilverOfferEligible(unit, silverCouponCandidate, baseMetal || "silver");
      if (silverEligibility.eligible) {
        unit = Math.max(0, unit - silverEligibility.discountAmount);
      } else if (rawCustom.discountedPrice != null && Number(rawCustom.discountedPrice) < unit) {
        unit = Number(rawCustom.discountedPrice);
      }
    } else if (rawCustom.discountedPrice != null && Number(rawCustom.discountedPrice) < unit) {
      unit = Number(rawCustom.discountedPrice);
    }

    if (cartItem.totalPrice && (Number(cartItem.totalPrice) / Number(cartItem.quantity || 1)) < unit) {
      unit = Number(cartItem.totalPrice) / Number(cartItem.quantity || 1);
    }

    if (rawCustom.productId) {
      const g =
        typeof rawCustom.productId === "object" && rawCustom.productId?._id
          ? rawCustom.productId
          : null;
      if (g) {
        let gPrice = Number(g.price || 0);
        const couponCandidate =
          rawCustom.appliedCoupon ||
          rawCustom.couponCode ||
          (rawCustom.discountedPrice != null || rawCustom.discountAmount != null
            ? CAMPAIGN_CONFIG.gemstoneOffer.code
            : "");
        const offerEligibility = isGemstoneOfferEligible(gPrice, couponCandidate, g);
        if (offerEligibility.eligible) {
          gPrice = gPrice - offerEligibility.discountAmount;
        } else if (rawCustom.discountedPrice != null && Number(rawCustom.discountedPrice) < gPrice) {
          gPrice = Number(rawCustom.discountedPrice);
        }
        unit += gPrice;
      } else if (cartItem.totalPrice && Number(cartItem.totalPrice) > unit) {
        unit = Number(cartItem.totalPrice) / Number(cartItem.quantity || 1);
      }
    }

    if ((!unit || isNaN(unit) || unit === 0) && cartItem.totalPrice) {
      unit = Number(cartItem.totalPrice) / Number(cartItem.quantity || 1);
    }

    return round2(unit);
  }

  throw new Error(`Unknown itemType: ${itemType}`);
}

const getCartOwner = async (req, res) => {
  let user;

  if (req.user && req.user._id) {
    user = await User.findById(req.user._id).select("cart");
  } else {
    let guestId = req.cookies?.guestId;

    if (!guestId) {
      guestId = new mongoose.Types.ObjectId();

      // ✅ FIX 1: Make cross-origin cookies bulletproof for local development
      res.cookie("guestId", guestId, {
        httpOnly: true,
        secure: true, // Required for SameSite None
        sameSite: "None", // Required for cross-origin (frontend 5173 -> backend 7700)
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    user = await User.findById(guestId).select("cart");

    if (!user) {
      user = await User.create({
        _id: guestId,
        name: "Guest User",
        email: `guest_${guestId}@temp.com`,
        password: `guest_${guestId}`,
        isGuest: true,
        cart: [],
      });
    }
  }
  return user;
};

/* -------------------- controller -------------------- */
export const createProductOrder3 = asyncHandler(async (req, res) => {
  const user = await getCartOwner(req, res);

  if (!user) {
    return res.status(400).json({
      success: false,
      msg: "Cart not found",
    });
  }
  
  const { paymentMethod, promoCode, address } = req.body;

  // console.log(req.body);

  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      field: "paymentMethod",
      msg: "Payment method is required",
    });
  }
  // if (!address) {
  //   return res
  //     .status(400)
  //     .json({ success: false, field: "address", msg: "Address is required" });
  // }

  // load user cart fully enough for repricing + eligibility
    await user.populate({
      path: "cart.item",
      populate: { path: "subCategory" }, // for Product subCategory offer checks
    })
    await user.populate({
      path: "cart.customization.jewelryId",
      model: "Jewelry",
      select:
        "jewelryName jewelryPrice jewelryMetalWeight metal certificate gemstoneWeight jewelryType slug sku",
    });
    await user.populate({
      path: "cart.customization.productId",
      model: "Product",
      select:
        "name price stock images slug sku weight origin",
    });

  if (!user || !user.cart || user.cart.length === 0) {
    return res.status(400).json({ success: false, msg: "Your cart is empty" });
  }

  // latest metal rates (required for repricing)
  const latestRates = await getLatestMetalRates();

  // --- Stock Validation ---
  for (const cartItem of user.cart) {
    if (cartItem.itemType === "Product") {
      const productId = cartItem.item._id;
      const quantity = Number(cartItem.quantity);

      const updated = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true },
      );

      if (!updated) {
        return res.status(400).json({
          success: false,
          msg: `Insufficient stock for ${cartItem.item.name}.`,
        });
      }
    } else if (cartItem.itemType === "Jewelry" && cartItem.customization?.productId) {
      const productId = cartItem.customization.productId._id || cartItem.customization.productId;
      const quantity = Number(cartItem.quantity);

      const updated = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true },
      );

      if (!updated) {
        return res.status(400).json({
          success: false,
          msg: `Insufficient stock for selected gemstone.`,
        });
      }
    }
  }

  // Merge incoming items from request body (frontend customizations, applied promo info, and line totals)
  if (Array.isArray(req.body.items) && req.body.items.length > 0) {
    for (const bItem of req.body.items) {
      const bProductId = String(bItem.productId || bItem.itemId || "");
      const bJewelryId = String(bItem.jewelryId || "");
      const bId = String(bItem._id || "");

      const matched = user.cart.find((ci) => {
        if (bId && String(ci._id) === bId) return true;
        const ciProdId = String(ci.item?._id || ci.item || ci.customization?.productId?._id || ci.customization?.productId || "");
        const ciJewelryId = String(ci.customization?.jewelryId?._id || ci.customization?.jewelryId || (ci.itemType === "Jewelry" ? (ci.item?._id || ci.item) : "") || "");
        if (bProductId && ciProdId && bProductId === ciProdId) return true;
        if (bJewelryId && ciJewelryId && bJewelryId === ciJewelryId) return true;
        return false;
      });

      if (matched) {
        if (bItem.customization && typeof bItem.customization === "object") {
          const rawM = matched.customization ? (matched.customization.toObject?.() || matched.customization) : {};
          matched.customization = {
            ...rawM,
            ...bItem.customization,
          };
        }
        if (bItem.itemTotal != null) {
          matched.totalPrice = Number(bItem.itemTotal);
        } else if (bItem.totalPrice != null) {
          matched.totalPrice = Number(bItem.totalPrice);
        }
      }
    }
  }

  // Extract all incoming promo/coupon codes (supports multiple coupons e.g. GEMRISHI10 and FESTIVAL simultaneously)
  const incomingCoupons = Array.isArray(req.body.appliedCoupons)
    ? req.body.appliedCoupons.map((c) => (typeof c === "string" ? c : c?.code)).filter(Boolean)
    : [];
  const allIncomingCodes = [
    ...incomingCoupons,
    req.body.promoCode,
    req.body.couponCode,
    req.body.appliedCoupon?.code,
  ]
    .filter(Boolean)
    .flatMap((s) => String(s).split(/[\s,]+/))
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const activePromoCodes = Array.from(new Set(allIncomingCodes));
  const activePromoCode = activePromoCodes[0] || null;

  const validGemstoneCodes = [
    String(CAMPAIGN_CONFIG.gemstoneOffer?.code || "GEMRISHI10").toUpperCase(),
    "GEMRISHI10",
    "DHANTERAS15",
    ...(CAMPAIGN_CONFIG.gemstoneOffer?.alternateCodes || []).map((c) => String(c).toUpperCase()),
  ];
  const hasGemstonePromo =
    isCampaignActive() &&
    CAMPAIGN_CONFIG.gemstoneOffer.enabled &&
    activePromoCodes.some((code) => validGemstoneCodes.includes(code));

  const jewelleryOfferCode = String(
    CAMPAIGN_CONFIG.jewelleryOffer?.code || CAMPAIGN_CONFIG.silverOffer?.code || "FESTIVAL"
  ).toUpperCase();
  const hasJewelleryPromo =
    isCampaignActive() &&
    (CAMPAIGN_CONFIG.jewelleryOffer?.enabled || CAMPAIGN_CONFIG.silverOffer?.enabled) &&
    activePromoCodes.includes(jewelleryOfferCode);

  // Apply gemstone promo to eligible gemstone cart items if not already applied
  if (hasGemstonePromo) {
    user.cart.forEach((ci) => {
      if (ci.itemType === "Product" && isGemstoneApplicable(ci.item)) {
        if (!ci.customization) ci.customization = {};
        const rawC = ci.customization.toObject ? ci.customization.toObject() : ci.customization;
        ci.customization = {
          ...rawC,
          appliedCoupon: CAMPAIGN_CONFIG.gemstoneOffer.code,
        };
      }
    });
  }

  // Apply jewellery promo to chosen or first eligible silver jewellery item if not already applied
  if (hasJewelleryPromo) {
    const chosenSilverRing = user.cart.find((ci) => isCartItemMatchingBagTarget(ci));
    const targetJewelry = chosenSilverRing || user.cart.find((ci) => {
      if (ci.itemType === "Jewelry") {
        const metal = String(ci.customization?.metal || ci.item?.metal || "").toLowerCase();
        const name = String(ci.item?.jewelryName || ci.item?.name || "").toLowerCase();
        return isJewelleryMetalApplicable(metal) || isJewelleryMetalApplicable(name);
      }
      return false;
    });
    if (targetJewelry) {
      if (!targetJewelry.customization) targetJewelry.customization = {};
      const rawC = targetJewelry.customization.toObject ? targetJewelry.customization.toObject() : targetJewelry.customization;
      targetJewelry.customization = {
        ...rawC,
        appliedCoupon: jewelleryOfferCode,
      };
    }
  }

  // Recompute unit price for each line (do not persist to DB here; order uses recomputed values)
  const recomputed = [];
  let subTotal = 0;
  const priceErrors = [];
  for (const ci of user.cart) {
    try {
      const newUnit = computeUnitPrice({ cartItem: ci, latestRates });
      const lineTotal = newUnit * Number(ci.quantity || 0);
      recomputed.push({
        ...(ci.toObject?.() ? ci.toObject() : ci),
        _unit: newUnit,
        _line: lineTotal,
      });
      subTotal += lineTotal;
    } catch (err) {
      priceErrors.push({ cartItemId: ci._id, reason: err.message });
    }
  }
  subTotal = round2(subTotal);

  // Calculate undiscounted original subtotal and total discount applied
  let undiscountedSubtotal = 0;
  for (const ci of recomputed) {
    const rawC = ci.customization?.toObject ? ci.customization.toObject() : (ci.customization || {});
    const qty = Number(ci.quantity || 1);
    if (ci.itemType === "Product") {
      const origStone = Number(rawC.originalPrice || getProductDisplayPrice(ci.item) || ci._unit || 0);
      const certP = Number(rawC.certificate?.price || 0);
      undiscountedSubtotal += (origStone + certP) * qty;
    } else if (ci.itemType === "Jewelry") {
      const origJewelry = Number(rawC.originalPrice || ci.item?.jewelryPrice || ci._unit || 0);
      undiscountedSubtotal += origJewelry * qty;
    } else {
      undiscountedSubtotal += Number(ci._line || 0);
    }
  }
  undiscountedSubtotal = round2(undiscountedSubtotal);

  // Line-level discount is already accurately reflected in subTotal
  let discountAmount = round2(Math.max(0, undiscountedSubtotal - subTotal));
  let appliedOffer = null;

  // Check if any non-campaign database Offer promo code was passed
  const otherPromoCode = activePromoCodes.find(
    (code) => code !== CAMPAIGN_CONFIG.gemstoneOffer.code.toUpperCase() && code !== jewelleryOfferCode
  );
  if (otherPromoCode) {
    const dbOffer = await Offer.findOne({
      promoCode: otherPromoCode.toLowerCase(),
      isActive: true,
      expiryDate: { $gte: new Date() },
    }).lean();
    if (dbOffer && dbOffer.offerType === "promocode") {
      appliedOffer = dbOffer._id;
      let extraDisc = 0;
      if (dbOffer.discountType === "percent") {
        extraDisc = (subTotal * Number(dbOffer.discountValue)) / 100;
      } else if (dbOffer.discountType === "flat") {
        extraDisc = Number(dbOffer.discountValue);
      }
      extraDisc = round2(extraDisc);
      discountAmount = round2(discountAmount + extraDisc);
      subTotal = round2(Math.max(0, subTotal - extraDisc));
    }
  }

  let partialPay = false;
  if (subTotal > 20000 && paymentMethod === "cod") {
    partialPay = false;
    return res.status(400).json({
      success: false,
      msg: "Can not Order as Cash On Delivery When Total Amount is Greater than ₹20000",
    });
  }

  let finalTotal = round2(subTotal);
  const clientProvidedTotal = Number(req.body.totalAmount);
  if (!isNaN(clientProvidedTotal) && clientProvidedTotal > 0) {
    // Whatever shopping bag value was shown to the user is passed directly to order & Cashfree
    finalTotal = round2(clientProvidedTotal);
  }

  // Ensure subTotal represents the original price before discount
  const computedDiscount = round2(Math.max(0, undiscountedSubtotal - finalTotal));
  if (computedDiscount > 0) {
    discountAmount = computedDiscount;
    subTotal = undiscountedSubtotal;
  } else if (discountAmount > 0) {
    subTotal = round2(finalTotal + discountAmount);
  } else {
    subTotal = finalTotal;
  }

  let onlinePayAmount = 0;
  let offlinePayAmount = 0;

  if (paymentMethod === "cod") {
    if (finalTotal >= 5000 && finalTotal <= 20000) {
      onlinePayAmount = round2((finalTotal * 10) / 100);
      offlinePayAmount = round2((finalTotal * 90) / 100);
      partialPay = true;
    } else {
      onlinePayAmount = 0;
      offlinePayAmount = finalTotal;
      partialPay = false;
    }
  } else {
    // All online/prepaid methods (cashfree, razorpay, online)
    onlinePayAmount = finalTotal;
    offlinePayAmount = 0;
    partialPay = false;
  }

  // Extract and normalize image helper
  const extractCleanImage = (img) => {
    if (!img) return "";
    if (typeof img === "object" && img !== null) {
      return img.url || (img.fileName ? `/public/uploads/product/${img.fileName}` : "") || "";
    }
    if (typeof img === "string") return img.trim();
    return "";
  };

  // Build client items map to preserve exact line pricing from the shopping bag
  const clientItemsMap = new Map();
  if (Array.isArray(req.body.items)) {
    for (const cli of req.body.items) {
      if (cli._id) clientItemsMap.set(String(cli._id), cli);
      if (cli.productId) clientItemsMap.set(String(cli.productId), cli);
      if (cli.jewelryId) clientItemsMap.set(String(cli.jewelryId), cli);
    }
  }

  // Build formatted cart items from recomputed lines for Cashfree and tracking
  const formattedCartItems = recomputed
    .filter((ci) => ci._unit != null)
    .map((ci, index) => {
      const isProduct = ci.itemType === "Product";
      const productObj = isProduct ? ci.item : ci.customization?.productId;
      const jewelryObj = ci.itemType === "Jewelry" ? ci.item : ci.customization?.jewelryId;

      const title =
        jewelryObj?.jewelryName ||
        productObj?.name ||
        ci.item?.name ||
        ci.item?.jewelryName ||
        `Item ${index + 1}`;

      const primaryImgRaw =
        (Array.isArray(productObj?.images) && productObj.images[0]) ||
        productObj?.images ||
        (Array.isArray(jewelryObj?.images) && jewelryObj.images[0]) ||
        jewelryObj?.images ||
        ci.item?.images?.[0];

      const cleanImage = extractCleanImage(primaryImgRaw);
      const publicImageUrl = normalizePublicImageUrl(primaryImgRaw);

      const jewelryImgRaw =
        (Array.isArray(jewelryObj?.images) && jewelryObj.images[0]) ||
        jewelryObj?.images;
      const cleanJewelryImage = extractCleanImage(jewelryImgRaw);

      const description =
        productObj?.slug ||
        jewelryObj?.slug ||
        productObj?.sku ||
        jewelryObj?.sku ||
        "GemRishi Jewelry";

      const clientMatch =
        clientItemsMap.get(String(ci._id)) ||
        clientItemsMap.get(String(productObj?._id)) ||
        clientItemsMap.get(String(jewelryObj?._id)) ||
        clientItemsMap.get(String(ci.item?._id));

      const clientUnitPrice = clientMatch
        ? Number(clientMatch.price ?? (clientMatch.itemTotal != null && clientMatch.quantity ? clientMatch.itemTotal / clientMatch.quantity : clientMatch.itemTotal))
        : null;

      const unitPrice = clientUnitPrice && !isNaN(clientUnitPrice) && clientUnitPrice > 0
        ? round2(clientUnitPrice)
        : round2(ci._unit);

      return {
        item_id: String(productObj?._id || jewelryObj?._id || ci.item?._id || `item_${index + 1}`),
        item_name: String(title).slice(0, 100),
        item_description: String(description).slice(0, 200),
        item_image_url: publicImageUrl,
        image: cleanImage,
        jewelryTitle: jewelryObj?.jewelryName || "",
        jewelryImage: cleanJewelryImage,
        item_quantity: Math.max(1, Number(ci.quantity || 1)),
        quantity: Math.max(1, Number(ci.quantity || 1)),
        item_price: unitPrice,
        price: unitPrice,
        item_original_unit_price: unitPrice,
        item_discounted_unit_price: unitPrice,
        item_currency: "INR",
        customization: ci.customization ? { ...(ci.customization.toObject?.() || ci.customization) } : {},
      };
    });

  // Build order items from recomputed lines
  const orderItems = recomputed
    .filter((ci) => ci._unit != null)
    .map((ci, index) => {
      const isProduct = ci.itemType === "Product";
      const customJewelryId = ci.customization?.jewelryId?._id || ci.customization?.jewelryId || null;
      const customProductId = ci.customization?.productId?._id || ci.customization?.productId || null;
      const jewelryId = ci.itemType === "Jewelry" ? ci.item._id : customJewelryId;
      const productId = isProduct ? ci.item._id : customProductId;

      const cleanCustomization = ci.customization ? { ...(ci.customization.toObject?.() || ci.customization) } : {};
      if (customJewelryId) {
        cleanCustomization.jewelryId = customJewelryId;
      }
      if (customProductId) {
        cleanCustomization.productId = customProductId;
      }

      const fItem = formattedCartItems[index] || {};

      return {
        productId: productId,
        jewelryId: jewelryId,
        quantity: ci.quantity,
        itemTotal: round2((fItem.price || ci._unit) * Number(ci.quantity || 1)),
        customization: cleanCustomization,
        title: fItem.item_name || "GemRishi Item",
        image: fItem.image || "",
        jewelryTitle: fItem.jewelryTitle || "",
        jewelryImage: fItem.jewelryImage || "",
      };
    });

  const isOccBagPromo =
    isCampaignActive() &&
    CAMPAIGN_CONFIG.bagOffer.enabled &&
    (
      activePromoCodes.some((code) => code.toLowerCase() === CAMPAIGN_CONFIG.bagOffer.code.toLowerCase()) ||
      (activePromoCode && String(activePromoCode).trim().toLowerCase() === CAMPAIGN_CONFIG.bagOffer.code.toLowerCase()) ||
      req.body?.hasComplimentaryGift ||
      subTotal >= CAMPAIGN_CONFIG.bagOffer.minBagTotal
    );

  if (isOccBagPromo) {
    if (CAMPAIGN_CONFIG.bagOffer.giftEnabled !== false) {
      orderItems.push({
        quantity: 1,
        itemTotal: 0,
        title: CAMPAIGN_CONFIG.bagOffer.giftName,
        jewelryTitle: `${CAMPAIGN_CONFIG.bagOffer.giftName} (${CAMPAIGN_CONFIG.bagOffer.giftMetal}, Worth ₹${CAMPAIGN_CONFIG.bagOffer.giftValue})`,
        jewelryImage: CAMPAIGN_CONFIG.bagOffer.giftImageUrl || "/ring.png",
        customization: {
          metal: CAMPAIGN_CONFIG.bagOffer.giftMetal || "Rudraksha",
          note: CAMPAIGN_CONFIG.bagOffer.giftDescription,
        },
      });

      formattedCartItems.push({
        item_id: "free_festive_gift",
        item_name: `${CAMPAIGN_CONFIG.bagOffer.giftName}`,
        item_description: CAMPAIGN_CONFIG.bagOffer.giftDescription,
        item_image_url: CAMPAIGN_CONFIG.bagOffer.giftImageUrl,
        image: CAMPAIGN_CONFIG.bagOffer.giftImageUrl || "/ring.png",
        jewelryTitle: `${CAMPAIGN_CONFIG.bagOffer.giftName} (Worth ₹${CAMPAIGN_CONFIG.bagOffer.giftValue})`,
        jewelryImage: CAMPAIGN_CONFIG.bagOffer.giftImageUrl || "/ring.png",
        item_quantity: 1,
        quantity: 1,
        item_price: 0,
        price: 0,
        item_original_unit_price: CAMPAIGN_CONFIG.bagOffer.giftValue,
        item_discounted_unit_price: 0,
        item_currency: "INR",
        customization: {
          metal: CAMPAIGN_CONFIG.bagOffer.giftMetal || "Rudraksha",
          note: CAMPAIGN_CONFIG.bagOffer.giftDescription,
        },
      });
    }
  }

  // (Optional) You might want to fail if some lines couldn't be priced:
  // if (priceErrors.length) { return res.status(400).json({ success:false, message:"Some items couldn't be priced.", priceErrors }); }


  const normalizeOrderAddressField = (value) => {
    if (Array.isArray(value)) {
      return value.join(" ").trim();
    }
    if (value == null) {
      return "";
    }
    return String(value).trim();
  };

  const safeAddress = address || {};
  const hasAddress = Object.keys(safeAddress).length > 0;
  const normalizedAddress = hasAddress
    ? {
        fullName: normalizeOrderAddressField(safeAddress.fullName),
        email: normalizeOrderAddressField(safeAddress.email),
        mobileNo: normalizeOrderAddressField(safeAddress.mobileNo),
        addressLine1: normalizeOrderAddressField(safeAddress.addressLine1),
        addressLine2: normalizeOrderAddressField(safeAddress.addressLine2),
        landmark: normalizeOrderAddressField(safeAddress.landmark),
        city: normalizeOrderAddressField(safeAddress.city),
        district: normalizeOrderAddressField(safeAddress.district),
        state: normalizeOrderAddressField(safeAddress.state),
        pinCode: normalizeOrderAddressField(safeAddress.pinCode),
        country: normalizeOrderAddressField(safeAddress.country),
        addressType: normalizeOrderAddressField(safeAddress.addressType),
        note: normalizeOrderAddressField(safeAddress.note),
      }
    : undefined;

  const generatedOrderId = generateOrderId();
  let cashfreePaymentSessionId = null;
  let cashfreeOrderId = null;
  let razorpayOrderId = null;
  let data = null;

  // CASHFREE ORDER CREATION
  const shouldCreateCashfree =
    (paymentMethod === "cashfree" || paymentMethod === "online" || (paymentMethod === "cod" && partialPay)) &&
    onlinePayAmount > 0;

  if (shouldCreateCashfree) {
    try {
      const customerName = normalizedAddress?.fullName || user.name || user.fullName || "Valued Customer";
      const customerEmail = normalizedAddress?.email || user.email || "customer@gemrishi.com";
      const customerPhone = normalizedAddress?.mobileNo || user.phone || user.mobileNo || "";

      const cfData = await createCashfreeOrderSession({
        orderId: generatedOrderId,
        orderAmount: onlinePayAmount,
        customer: {
          id: user._id,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        cartItems: formattedCartItems,
        returnUrl: (req.headers.origin && req.headers.origin.startsWith("https://"))
          ? `${req.headers.origin.replace(/\/$/, "")}/thank-you?order_id=${generatedOrderId}`
          : `https://gemrishi.com/thank-you?order_id=${generatedOrderId}`,
        orderNote: `GemRishi Order #${generatedOrderId}`,
        orderTags: {
          platform: "web",
          cart_total: String(finalTotal),
        },
      });

      cashfreePaymentSessionId = cfData.payment_session_id;
      cashfreeOrderId = cfData.order_id;
    } catch (cfErr) {
      console.error("Cashfree order session error:", cfErr);
      const isJsonParseError = cfErr.message?.includes("is not valid JSON") || cfErr.message?.includes("Unexpected token");
      const userMessage = isJsonParseError
        ? "Payment gateway is temporarily unavailable. Please try again or choose another payment method."
        : cfErr.message || "Failed to initialize Cashfree payment. Please try again.";
      return res.status(500).json({
        success: false,
        msg: userMessage,
      });
    }
  }

  // LEGACY RAZORPAY ORDER CREATION
  const shouldCreateRazorpay =
    paymentMethod === "razorpay" &&
    onlinePayAmount > 0;

  if (shouldCreateRazorpay) {
    const orderPayload = {
      amount: Math.round(onlinePayAmount * 100), // 🔑 IMPORTANT
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const basicAuth = Buffer.from(
      process.env.RAZOR_PAY_KEY_ID + ":" + process.env.RAZOR_PAY_KEY_SECRET,
    ).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("Razorpay non-JSON response:", parseErr);
      return res.status(500).json({ msg: "Payment gateway is currently unavailable. Please try again." });
    }

    if (!response.ok || !data.id) {
      return res.status(500).json({ msg: "Failed to create Razorpay order" });
    }

    razorpayOrderId = data.id;
  }

  const assignedPaymentMethod =
    paymentMethod === "cod" && !partialPay
      ? "cod"
      : paymentMethod === "razorpay"
      ? "razorpay"
      : "cashfree";

  const order = new Order({
    userId: user._id,
    orderId: generatedOrderId,
    totalAmount: finalTotal, // final after discount
    subTotal: subTotal, // recomputed subtotal
    discountAmount: discountAmount, // from promo
    offerId: appliedOffer || undefined,
    items: orderItems,
    cashfreeOrderId,
    razorpayOrderId,
    address: normalizedAddress,
    paymentMethod: assignedPaymentMethod,
    paymentMode: assignedPaymentMethod === "cod" ? "Cash on Delivery" : "Cashfree (Online)",
    paidAmount: 0,
    onlinePayAmount,
    offlinePayAmount,
    partialPay,
    attribution: req.body.attribution || {},
    // ---- Add By Pawan (START): persist checkout attribution so the payment webhook can use it later ----
    // fbp / fbc / fbclid / page URL / consent come from the browser (validated); IP + user agent are what
    // THIS server saw (never taken from the request body).
    metaTracking: buildOrderMetaTracking({
      metaContext: req.body.metaContext,
      server: getRequestContextForMeta(req),
      userId: String(user._id),
    }),
    // ---- Add By Pawan (END) ----
  });

  console.log("ORDER USER:", user._id);
  console.log("ORDER ID:", order.orderId);

  await order.save();

  // Immediately track in Abandoned Checkout as in-progress checkout
  try {
    await recordAbandonedCheckout({
      order,
      stage: normalizedAddress?.addressLine1 ? "before_payment" : "before_address",
      reason: "Checkout initiated",
      source: "cashfree_checkout",
      customerPhone: normalizedAddress?.mobileNo || user.phone || user.mobileNo,
      customerEmail: normalizedAddress?.email || user.email,
      customerName: normalizedAddress?.fullName || user.fullName || user.name,
      shippingAddress: normalizedAddress,
      cartItems: formattedCartItems,
      clientInfo: getClientInfo(req),
    });
  } catch (trackErr) {
    console.error("Error initial tracking abandoned checkout:", trackErr.message);
  }

  // ---- Server CAPI InitiateCheckout Event (Deduplicated with Browser) ----
  try {
    const checkoutEventId = req.body?.metaContext?.checkoutEventId || req.body?.checkoutEventId || `ic_${order.orderId}`;
    sendMetaCapiEvent({
      eventName: "InitiateCheckout",
      eventId: checkoutEventId,
      eventSourceUrl: req.body?.eventSourceUrl || req.body?.metaContext?.eventSourceUrl || "https://gemrishi.com/checkout",
      userData: {
        email: normalizedAddress?.email || user.email,
        phone: normalizedAddress?.mobileNo || user.phone,
        clientIp: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        firstName: normalizedAddress?.fullName,
        city: normalizedAddress?.city,
        state: normalizedAddress?.state,
        zip: normalizedAddress?.pinCode,
        fbp: req.body?.metaContext?.fbp,
        fbc: req.body?.metaContext?.fbc,
      },
      customData: {
        currency: "INR",
        value: Number(finalTotal) || 0,
        order_id: String(order.orderId),
        content_type: "product",
        contents: orderItems.map((item) => ({
          id: String(item.productId || item.jewelryId || ""),
          quantity: Number(item.quantity) || 1,
          item_price: Number(item.itemTotal) || 0,
        })),
      },
    }).catch((err) => console.error("[Meta CAPI] InitiateCheckout async error:", err?.message || err));
  } catch (capiErr) {
    console.error("[Meta CAPI] InitiateCheckout error:", capiErr?.message || capiErr);
  }

  // ---- Add By Pawan (START) ----
  // REMOVED: a "Purchase" used to be sent here for EVERY new order, immediately after order.save()
  // and before any payment existed (pending / failed / abandoned Cashfree orders all counted as sales).
  // Creating an order is a checkout step, not a purchase:
  //   * online orders  -> Purchase is sent from finalizePaidOrder() after payment verification
  //   * full COD orders -> the agreed COD conversion is sent ONCE below, flagged payment_type:"cod"
  //     so it is never mixed up with collected online revenue
  //     (switch off with META_COD_EVENT_NAME=off).
  if (assignedPaymentMethod === "cod" && !partialPay) {
    dispatchMetaPurchaseForOrder(order, { kind: "cod", fallbackUser: user }).catch(() => {});
  }
  // ---- Add By Pawan (END) ----

  try {
    const io = getIO();
    if (io) {
      io.emit("new_order", order);
      console.log("⚡ Realtime 'new_order' socket event emitted to Admin!");
    }
  } catch (socketErr) {
    console.error("Socket emit error:", socketErr);
  }

  console.log("PAYMENT METHOD:", assignedPaymentMethod);

  if (
    paymentMethod === "cod" && !partialPay
  ) {
    user.cart = [];
    await user.save();
  }

  return res.status(200).json({
    success: true,
    msg: "Order initiated successfully",
    order,
    paymentSessionId: cashfreePaymentSessionId,
    cashfreeEnvironment: ["PROD", "PRODUCTION"].includes(
      (process.env.CASHFREE_ENV || "TEST").toUpperCase()
    )
      ? "production"
      : "sandbox",
  });
});
//----------------------------------End By Pawan---------------------------------------