//  import { Order } from "../models/order.model.js";

//   export const platformWebhook = async (req, res) => {
//     const payload = req.body;
//     const { content } = payload;
//     const breezeOrderId = content?.orderId || payload.id || "unknown";

//     try {
//       const apiKey = req.headers["x-api-key"];

//       if (!apiKey || apiKey !== process.env.BREEZE_WEBHOOK_API_KEY) {
//         console.warn("BREEZE WEBHOOK: Invalid or missing x-api-key");
//         return res.status(401).json({ success: false, message: "Unauthorized" });
//       }

//       console.log("BREEZE WEBHOOK PAYLOAD:", JSON.stringify(payload, null, 2));

//       const { eventName } = payload;

//       if (eventName === "ORDER_SUCCEEDED" && content) {
//         const { orderId, txnId, status, payment, shippingAddress, customer, cart } = content;

//         const paymentStatusMap = {
//           SUCCESS: "Completed",
//           PENDING: "Pending",
//           FAILED: "Failed",
//         };

//         const paymentMethodRaw = payment?.paymentMethod || "";
//         const paymentMethod = paymentMethodRaw === "CASH" ? "cod" : "breeze";
//         const paymentStatus = paymentStatusMap[status] || "Pending";

//         // Only include productId if it's a valid MongoDB ObjectId (24 hex chars)
//         const items = (cart?.items || []).map((item) => {
//           const entry = {
//             quantity: item.quantity || 1,
//             itemTotal: item.finalPrice || item.initialPrice || 0,
//           };
//           if (item.id && /^[a-f\d]{24}$/i.test(item.id)) {
//             entry.productId = item.id;
//           }
//           return entry;
//         });

//         const address = shippingAddress
//           ? {
//               fullName: shippingAddress.name || customer?.name,
//               email: shippingAddress.emailAddress || customer?.emailAddress,
//               mobileNo: shippingAddress.phoneNumber || customer?.phoneNumber,
//               addressLine1: shippingAddress.line1,
//               addressLine2: shippingAddress.line2,
//               city: shippingAddress.city,
//               state: shippingAddress.state,
//               pinCode: shippingAddress.postalCode,
//               country: shippingAddress.country,
//               addressType: shippingAddress.type || "Home",
//             }
//           : {};

//         try {
//           const existing = await Order.findOne({ orderId });

//           if (!existing) {
//             await Order.create({
//               orderId,
//               razorpayOrderId: txnId,
//               totalAmount: String(payment?.amount || cart?.totalPrice || 0),
//               subTotal: cart?.totalPrice || 0,
//               discountAmount: cart?.totalDiscount || 0,
//               paymentStatus,
//               orderStatus: "Pending",
//               paymentMethod,
//               items,
//               address,
//             });
//             console.log("BREEZE ORDER CREATED:", orderId);
//           } else {
//             existing.paymentStatus = paymentStatus;
//             await existing.save();
//             console.log("BREEZE ORDER UPDATED:", orderId);
//           }
//         } catch (dbErr) {
//           console.error("BREEZE WEBHOOK DB ERROR (non-fatal):", dbErr.message);
//         }
//       }

//       return res.status(200).json({
//         id: payload.id,
//         status: "SUCCESS",
//         message: "Order created successfully",
//         content: {
//           orderId: breezeOrderId,
//         },
//       });
//     } catch (err) {
//       console.error("BREEZE WEBHOOK ERROR:", err);
//       return res.status(200).json({
//         id: payload?.id || "unknown",
//         status: "SUCCESS",
//         message: "Order received",
//         content: { orderId: breezeOrderId },
//       });
//     }
//   }
