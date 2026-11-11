// //------------------Add By Pawan implement the whole code --------------
// import crypto from "crypto";
// import fs from "fs";
// import path from "path";
// import { Order } from "../models/order.model.js";
// import { User } from "../models/user.model.js";
// import { AbandonedCheckout } from "../models/abandonedCheckout.model.js";
// import { sendMetaCapiEvent } from "../utils/metacapi.js";
// //-------------------Abandoned Checkout helpers----------------------
// const getDropOffStage = (customer = {}, cartDetails = {}) => {
//   const hasAddress =
//     (Array.isArray(customer.shippingAddress) && customer.shippingAddress.length > 0) ||
//     (Array.isArray(customer.billingAddress) && customer.billingAddress.length > 0);
//   const hasAmountPaid =
//     cartDetails.amountPaid !== undefined && cartDetails.amountPaid !== null;

//   if (!hasAddress) {
// //---------------Only phone number, or phone + email present -> left before address page
//     return "before_address";
//   }

//   if (!hasAmountPaid) {
// //--------------Full details present except amountPaid -> left after reaching payment page
//     return "before_payment";
//   }

// //--------------All details present, including amountPaid -> checkout was completed
//   return "completed";
// };

// export const handleAbandonedCheckout = async (content = {}, payload = {}) => {
//   const cartDetails = content.cartDetails || content.cart || payload.cartDetails || payload.cart || {};
//   const customer = content.customer || payload.customer || {};
//   const comments = content.comments || payload.comments;
//   const checkoutUrl =
//     content.checkoutUrl ||
//     content.checkout_url ||
//     content.sessionUrl ||
//     payload.checkoutUrl ||
//     `https://gemrishi.com/checkout/${content.orderId || payload.id || Date.now()}`;

//   const items = cartDetails.items || [];
//   const initialPrice = cartDetails.initialPrice || cartDetails.totalPrice || 0;
//   const totalPrice = cartDetails.totalPrice || initialPrice || 0;
//   const itemCount = cartDetails.itemCount || items.length || 1;

//   const normalizedCartDetails = {
//     initialPrice,
//     totalPrice,
//     totalDiscount: cartDetails.totalDiscount || 0,
//     weight: cartDetails.weight,
//     itemCount,
//     items: items.map((it) => ({
//       title: it.title || it.name || "Product",
//       quantity: it.quantity || 1,
//       finalPrice: it.finalPrice || it.price || 0,
//     })),
//     tax: cartDetails.tax || 0,
//     shippingCharge: cartDetails.shippingCharge || 0,
//     surcharge: cartDetails.surcharge || 0,
//     amountPaid: cartDetails.amountPaid,
//   };

//   const phoneNumber =
//     customer.phoneNumber ||
//     customer.mobileNo ||
//     customer.phone ||
//     content.phoneNumber ||
//     payload.phoneNumber ||
//     "unknown";
//   const emailAddress =
//     customer.emailAddress ||
//     customer.email ||
//     content.emailAddress ||
//     payload.emailAddress;
//   const shippingAddress =
//     customer.shippingAddress ||
//     (content.shippingAddress ? [content.shippingAddress] : undefined);
//   const billingAddress =
//     customer.billingAddress ||
//     (content.billingAddress ? [content.billingAddress] : undefined);

//   const normalizedCustomer = {
//     phoneNumber,
//     emailAddress,
//     shippingAddress,
//     billingAddress,
//     gst: customer.gst,
//   };

//   // Per policy: don't save anything until we actually have a contact
//   // number for the customer — a bare cart/browsing signal isn't a
//   // checkout attempt yet.
//   if (!phoneNumber || phoneNumber === "unknown") {
//     console.log("ABANDONED CHECKOUT SKIPPED: no contact number captured yet");
//     return;
//   }

//   const dropOffStage = getDropOffStage(normalizedCustomer, normalizedCartDetails);

//   let matchedUser = null;
//   try {
//     if (emailAddress) {
//       matchedUser = await User.findOne({ email: emailAddress }).select("_id");
//     }
//     if (!matchedUser && phoneNumber && phoneNumber !== "unknown") {
//       matchedUser = await User.findOne({ mobileNo: phoneNumber }).select("_id");
//     }
//   } catch (lookupErr) {
//     console.error("ABANDONED CHECKOUT USER LOOKUP ERROR (non-fatal):", lookupErr.message);
//   }

//   try {
//     await AbandonedCheckout.findOneAndUpdate(
//       {
//         checkoutUrl,
//         "customer.phoneNumber": phoneNumber,
//       },
//       {
//         userId: matchedUser?._id,
//         checkoutUrl,
//         cartDetails: normalizedCartDetails,
//         customer: normalizedCustomer,
//         comments,
//         dropOffStage,
//         rawPayload: payload,
//         source: "breeze",
//       },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );
//     console.log("ABANDONED CHECKOUT SAVED:", checkoutUrl, "| Phone:", phoneNumber, "| Stage:", dropOffStage);
//   } catch (dbErr) {
//     console.error("ABANDONED CHECKOUT DB ERROR (non-fatal):", dbErr.message);
//   }
// };

// let devPrivateKey = null;

// const getBreezePrivateKey = () => { 
// //----------- Check environment variable------------------
//   if (process.env.BREEZE_PRIVATE_KEY) {
//     let key = process.env.BREEZE_PRIVATE_KEY.trim();
//     if (key.includes("\\n")) {
//       key = key.replace(/\\n/g, "\n");
//     }
//     if (!key.includes("BEGIN") && !key.includes("END")) {
//       key = `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`;
//     }
//     return key;
//   }

//   //------------------Check standard file paths-------------------------
//   const possiblePaths = [
//     path.join(process.cwd(), "private-key.pem"),
//     path.join(process.cwd(), "backend", "private-key.pem"),
//     path.join(process.cwd(), "..", "private-key.pem"),
//   ];

//   for (const p of possiblePaths) {
//     try {
//       if (fs.existsSync(p)) {
//         const content = fs.readFileSync(p, "utf8").trim();
//         if (content.length > 50) {
//           return content;
//         }
//       }
//     } catch (e) {}
//   }

//   //----------------Auto-generate a local dev key-------------------
//   if (devPrivateKey) return devPrivateKey;

//   try {
//     const { privateKey } = crypto.generateKeyPairSync("rsa", {
//       modulusLength: 2048,
//       publicKeyEncoding: { type: "spki", format: "pem" },
//       privateKeyEncoding: { type: "pkcs8", format: "pem" },
//     });
//     devPrivateKey = privateKey;
//     return devPrivateKey;
//   } catch (e) {
//     throw new Error("Unable to load or generate Breeze private key: " + e.message);
//   }
// };

// export const signCart = async (req, res) => {
//   try {
//     const breezeCart = req.body.cart;

//     const cartString = JSON.stringify(breezeCart);

//     const privateKey = getBreezePrivateKey();

//     const signer = crypto.createSign("RSA-SHA256");

//     signer.update(cartString, "utf8");
//     signer.end();

//     const signature = signer.sign(
//       {
//         key: privateKey,
//         padding: crypto.constants.RSA_PKCS1_PADDING,
//       },
//       "base64"
//     );

//     return res.json({
//       success: true,
//       cart: cartString,
//       signature,
//     });
//   } catch (err) {
//     console.error("SIGN ERROR:", err);

//     return res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

// export const platformWebhook = async (req, res) => {
//   const payload = req.body || {};
//   const { content } = payload;
//   const breezeOrderId = content?.orderId || payload.id || "unknown";

//   try {
//     const rawAuthHeader =
//       req.headers["x-api-key"] ||
//       req.headers["authorization"] ||
//       req.headers["x-breeze-signature"] ||
//       req.query?.apiKey;

//     // Strip a "Bearer " prefix if present so we compare the raw key value,
//     // not "Bearer <key>", against BREEZE_WEBHOOK_API_KEY.
//     const apiKey =
//       typeof rawAuthHeader === "string"
//         ? rawAuthHeader.replace(/^Bearer\s+/i, "").trim()
//         : rawAuthHeader;

//     console.log("INCOMING BREEZE WEBHOOK:", {
//       headers: req.headers,
//       eventName: payload.eventName || payload.event,
//       payloadSummary: { id: payload.id, orderId: breezeOrderId },
//       rawBody: JSON.stringify(payload),
//     });

//     if (
//       process.env.BREEZE_WEBHOOK_API_KEY &&
//       apiKey &&
//       apiKey !== process.env.BREEZE_WEBHOOK_API_KEY
//     ) {
//       console.warn("BREEZE WEBHOOK: Invalid or mismatching x-api-key provided:", apiKey);
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const eventName = String(payload.eventName || payload.event || payload.type || "").toUpperCase();

//     const isAbandoned =
//       eventName.includes("ABANDON") ||
//       eventName.includes("DROP") ||
//       eventName.includes("CART") ||
//       (content && !eventName.includes("SUCCEED") && !eventName.includes("COMPLETE") && (content.checkoutUrl || content.cartDetails || content.cart));

//     if (isAbandoned) {
//       await handleAbandonedCheckout(content || payload, payload);

//       return res.status(200).json({
//         id: payload.id || "evt_" + Date.now(),
//         status: "SUCCESS",
//         message: "Abandoned checkout received",
//       });
//     }

//     if (eventName === "ORDER_SUCCEEDED" && content) {
//       const { orderId, txnId, status, payment, shippingAddress, customer, cart } = content;

//       const paymentStatusMap = {
//         SUCCESS: "Completed",
//         PENDING: "Pending",
//         FAILED: "Failed",
//       };

//       const paymentMethodRaw = payment?.paymentMethod || "";
//       const paymentMethod = paymentMethodRaw === "CASH" ? "cod" : "breeze";
//       const paymentStatus = paymentStatusMap[status] || "Pending";

// //---------Only include productId if it's a valid MongoDB ObjectId (24 hex chars)
//       const items = (cart?.items || []).map((item) => {
//         const entry = {
//           quantity: item.quantity || 1,
//           itemTotal: item.finalPrice || item.initialPrice || 0,
//         };
//         if (item.id && /^[a-f\d]{24}$/i.test(item.id)) {
//           entry.productId = item.id;
//         }
//         return entry;
//       });

//       const address = shippingAddress
//         ? {
//             fullName: shippingAddress.name || customer?.name,
//             email: shippingAddress.emailAddress || customer?.emailAddress,
//             mobileNo: shippingAddress.phoneNumber || customer?.phoneNumber,
//             addressLine1: shippingAddress.line1,
//             addressLine2: shippingAddress.line2,
//             city: shippingAddress.city,
//             state: shippingAddress.state,
//             pinCode: shippingAddress.postalCode,
//             country: shippingAddress.country,
//             addressType: shippingAddress.type || "Home",
//           }
//         : {};

//       try {
//         const existing = await Order.findOne({
//           orderId: cart?.id,
//         });

//         if (!existing) {
//           console.warn("ORDER NOT FOUND:", cart?.id);

//           return res.status(200).json({
//             status: "SUCCESS",
//           });
//         }

//         existing.paymentStatus = paymentStatus;
//         existing.orderStatus = "Pending";
//         existing.breezeTransactionId = txnId;
// //--------------------Save Breeze Address-----------------------   
//         existing.address = {
//           fullName: shippingAddress?.name || customer?.name || "",
//           email: customer?.emailAddress || "",
//           mobileNo: shippingAddress?.phoneNumber || customer?.phoneNumber || "",
//           addressLine1: shippingAddress?.line1 || "",
//           addressLine2: shippingAddress?.line2 || "",
//           city: shippingAddress?.city || "",
//           state: shippingAddress?.state || "",
//           pinCode: shippingAddress?.postalCode || "",
//           country: shippingAddress?.country || "India",
//           addressType: shippingAddress?.type || "Home",
//         };

//         await existing.save();

//         sendMetaCapiEvent({
//           eventName: "Purchase",
//           eventId: String(existing.orderId),
//           eventSourceUrl: "https://gemrishi.com/checkout",
//           userData: {
//             email: existing.address?.email,
//             phone: existing.address?.mobileNo,
//             firstName: existing.address?.fullName,
//             city: existing.address?.city,
//             state: existing.address?.state,
//             zip: existing.address?.pinCode,
//           },
//           customData: {
//             currency: "INR",
//             value: Number(existing.totalAmount) || 0,
//             order_id: String(existing.orderId),
//             content_type: "product",
//           },
//         });

//         console.log("ORDER UPDATED FROM BREEZE:", existing.orderId);
//       } catch (dbErr) {
//         console.error("BREEZE WEBHOOK DB ERROR (non-fatal):", dbErr.message);
//       }
//     }

//     return res.status(200).json({
//       id: payload.id,
//       status: "SUCCESS",
//       message: "Order created successfully",
//       content: {
//         orderId: breezeOrderId,
//       },
//     });
//   } catch (err) {
//     console.error("BREEZE WEBHOOK ERROR:", err);
//     return res.status(200).json({
//       id: payload?.id || "unknown",
//       status: "SUCCESS",
//       message: "Order received",
//       content: { orderId: breezeOrderId },
//     });
//   }
// };

// //----------------Real-time Checkout Session Tracker----------------
// export const trackCheckoutSession = async (req, res) => {
//   try {
//     const { cart, customer, shippingAddress, checkoutUrl, dropOffStage, isResolved } = req.body;

//     if (!cart && !customer) {
//       return res.status(400).json({ success: false, message: "Missing cart or customer data" });
//     }

//     const phoneNumber = customer?.phoneNumber || shippingAddress?.phoneNumber || "unknown";
//     const emailAddress = customer?.email || customer?.emailAddress || shippingAddress?.email;
//     const sessionUrl = checkoutUrl || `https://gemrishi.com/checkout/${cart?.id || Date.now()}`;

//     // Per policy: nothing gets saved to Abandoned Checkout (or anywhere)
//     // until the customer has actually provided a contact number. A cart
//     // session with no real phone number yet is still just "browsing" /
//     // "add to cart", not a checkout attempt worth recording.
//     if (!phoneNumber || phoneNumber === "unknown") {
//       return res.status(200).json({
//         success: true,
//         message: "No contact info yet — skipped tracking",
//       });
//     }
//   //---------------------Format cart details---------------------------
//     const cartItems = (cart?.items || []).map((item) => ({
//       title: item.title || item.name || "Product",
//       quantity: item.quantity || 1,
//       finalPrice: item.finalPrice || item.price || 0,
//       image: item.image || item.images?.[0]?.url || (typeof item.images?.[0] === "string" ? item.images[0] : "") || "",
//       jewelryTitle: item.jewelryTitle || item.customization?.jewelryId?.jewelryName || "",
//       jewelryImage: item.jewelryImage || item.customization?.jewelryId?.images?.[0]?.url || (typeof item.customization?.jewelryId?.images?.[0] === "string" ? item.customization.jewelryId.images[0] : "") || "",
//       customization: item.customization || undefined,
//     }));
//     const cartDetails = {
//       initialPrice: cart?.initialPrice || cart?.totalPrice || 0,
//       totalPrice: cart?.totalPrice || 0,
//       totalDiscount: cart?.totalDiscount || 0,
//       itemCount: cart?.items?.length || 1,
//       items: cartItems,
//       tax: cart?.tax || 0,
//       shippingCharge: cart?.shippingCharge || 0,
//     };

//     const customerObj = {
//       emailAddress,
//       phoneNumber,
//       shippingAddress: shippingAddress ? [shippingAddress] : undefined,
//     };

//     let calculatedStage = dropOffStage;
//     if (!calculatedStage) {
//       calculatedStage = shippingAddress?.line1 || shippingAddress?.city
//         ? "before_payment"
//         : "before_address";
//     }

//     let matchedUser = null;
//     try {
//       if (emailAddress) {
//         matchedUser = await User.findOne({ email: emailAddress }).select("_id");
//       }
//       if (!matchedUser && phoneNumber && phoneNumber !== "unknown") {
//         matchedUser = await User.findOne({ mobileNo: phoneNumber }).select("_id");
//       }
//     } catch (e) {}

//     const updateDoc = {
//       userId: matchedUser?._id,
//       checkoutUrl: sessionUrl,
//       cartDetails,
//       customer: customerObj,
//       dropOffStage: calculatedStage,
//       source: "breeze_realtime",
//     };

//     if (isResolved !== undefined) {
//       updateDoc.isResolved = isResolved;
//     }

//     await AbandonedCheckout.findOneAndUpdate(
//       {
//         checkoutUrl: sessionUrl,
//         "customer.phoneNumber": phoneNumber,
//       },
//       updateDoc,
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     console.log("REALTIME CHECKOUT TRACKED:", sessionUrl, "| Phone:", phoneNumber, "| Stage:", calculatedStage);

//     return res.status(200).json({ success: true, message: "Checkout session tracked" });
//   } catch (err) {
//     console.error("TRACK CHECKOUT ERROR:", err);
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };
// //-------------------Add By Pawan implement the whole code --------------