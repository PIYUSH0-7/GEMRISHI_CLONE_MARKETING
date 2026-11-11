import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  CheckCircle,
  Home,
  Package,
  Copy,
  Check,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { setCartItems } from "../../redux/cartSlice";
import { openLoginModal } from "../../features/api/authSlice";
// ----------add by pawan----------------
import { trackPurchaseEvent, buildItemsFromOrder } from "../../utils/purchaseTracking";
const API_URL = import.meta.env.VITE_URL || "http://localhost:7788/api/v1";
const BACKEND_BASE = API_URL.replace(/\/api\/v1\/?$/, "");
let merchantWidgetStarted = false;

const resolveItemImage = (img) => {
  if (!img) return "https://gemrishi.com/logo.png";
  let raw = "";
  if (typeof img === "object" && img !== null) {
    raw = img.url || (img.fileName ? `/public/uploads/product/${img.fileName}` : "") || "";
  } else if (typeof img === "string") {
    raw = img.trim();
  }
  if (!raw || raw === "[object Object]") return "https://gemrishi.com/logo.png";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `${BACKEND_BASE}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

export default function ThankYouPage({ onRequireLogin, onRequireSignup }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const queryOrderId = searchParams.get("order_id") || searchParams.get("orderId");
  const stateOrder = location.state?.order;
  const targetOrderId = queryOrderId || stateOrder?.orderId;

  const [order, setOrder] = useState(stateOrder || null);
  const [loading, setLoading] = useState(!stateOrder);
  const [isVerifying, setIsVerifying] = useState(
    !stateOrder ||
      stateOrder.paymentStatus !== "Completed" ||
      !stateOrder.address?.addressLine1
  );
  const [copied, setCopied] = useState(false);

  // Clear cart immediately upon successful payment landing
  useEffect(() => {
    dispatch(setCartItems([]));
  }, [dispatch]);

  // Google Merchant widget: start only after payment is completed
  useEffect(() => {
    if (order?.paymentStatus !== "Completed" || merchantWidgetStarted) return;

    const scriptId = "merchantWidgetScript";
    let isMounted = true;
    let script = document.getElementById(scriptId);

    const startWidget = () => {
      if (!isMounted || merchantWidgetStarted) return;

      if (typeof window.merchantwidget?.start !== "function") {
        console.error("Google Merchant widget loaded without exposing merchantwidget.start.");
        return;
      }

      window.merchantwidget.start({
        merchant_id: 5714305904,
        position: "RIGHT_BOTTOM",
        region: "IN",
      });
      merchantWidgetStarted = true;
    };

    const handleScriptError = () => {
      console.error("Failed to load the Google Merchant widget script.");
    };

    if (typeof window.merchantwidget?.start === "function") {
      startWidget();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://www.gstatic.com/shopping/merchant/merchantwidget.js";
        script.async = true;
      }

      script.addEventListener("load", startWidget);
      script.addEventListener("error", handleScriptError);

      if (!script.isConnected) {
        document.head.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      script?.removeEventListener("load", startWidget);
      script?.removeEventListener("error", handleScriptError);
    };
  }, [order?.paymentStatus]);

  // Helper to trigger GA4 & purchase analytics once
  // Helper to trigger GA4, Google Ads & Meta Pixel purchase analytics once (with deduplication)
  const handleTrackPurchase = (completedOrder) => {
    if (!completedOrder) return;
    const isOnlinePaid = completedOrder.paymentStatus === "Completed";
    const isCod = completedOrder.paymentMethod === "cod";
    if (!isOnlinePaid && !isCod) return;

    trackPurchaseEvent({
      orderId: completedOrder.orderId,
      subtotal: completedOrder.totalAmount,
      shipping: completedOrder.shippingCost || 0,
      currency: "INR",
      coupon: completedOrder.couponCode || "",
      items: buildItemsFromOrder(completedOrder),
      customer: {
        name: completedOrder.address?.fullName || userInfo?.name || "",
        email: completedOrder.address?.email || userInfo?.email || "",
        phone: completedOrder.address?.phone || userInfo?.phone || "",
        city: completedOrder.address?.city || "",
        postalCode: completedOrder.address?.pinCode || completedOrder.address?.postalCode || "",
      },
    });

    // Link Microsoft Clarity session to completed Order ID
    if (typeof window.clarity === "function" && completedOrder.orderId) {
      try {
        window.clarity("identify", String(completedOrder.orderId));
        window.clarity("set", "order_status", "completed");
        window.clarity("set", "order_amount", String(completedOrder.totalAmount));
      } catch (cErr) {
        console.warn("[Clarity identify notice]:", cErr);
      }
    }
  };

  // Verify and fetch latest order details from backend with smart polling
  useEffect(() => {
    if (!targetOrderId) {
      setLoading(false);
      setIsVerifying(false);
      return;
    }

    let isMounted = true;
    let pollCount = 0;
    const maxPolls = 10;
    let timeoutId = null;

    const pollVerify = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE}/api/v1/cashfree/verify-order/${targetOrderId}`);

        if (!isMounted) return;

        if (res.data?.order) {
          const fresh = res.data.order;
          setOrder(fresh);

          const isComplete =
            fresh.paymentStatus === "Completed" || res.data.paymentStatus === "Completed";
          const hasAddress = !!(fresh.address?.addressLine1 || fresh.address?.city);

          if (isComplete && hasAddress) {
            setIsVerifying(false);
            setLoading(false);
            handleTrackPurchase(fresh);
            return;
          }

          if (isComplete && !hasAddress) {
            handleTrackPurchase(fresh);
            if (pollCount < 4) {
              pollCount++;
              timeoutId = setTimeout(pollVerify, 1500);
              return;
            }
            setIsVerifying(false);
            setLoading(false);
            return;
          }

          if (!isComplete && pollCount < maxPolls) {
            pollCount++;
            timeoutId = setTimeout(pollVerify, 2000);
            return;
          }
        } else if (pollCount < maxPolls) {
          // API responded but without an order: retry instead of spinning forever
          pollCount++;
          timeoutId = setTimeout(pollVerify, 2000);
          return;
        }
      } catch (err) {
        console.warn("verify-order notice:", err.message);
        if (pollCount < maxPolls) {
          pollCount++;
          timeoutId = setTimeout(pollVerify, 2000);
          return;
        }
      } finally {
        if (isMounted && pollCount >= maxPolls) {
          setIsVerifying(false);
          setLoading(false);
        }
      }
    };

    pollVerify();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [targetOrderId]);

  const handleCopyOrderId = () => {
    const idToCopy = order?.orderId || queryOrderId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      toast.success("Order ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLoginClick = () => {
    if (onRequireLogin) {
      onRequireLogin();
    } else {
      dispatch(openLoginModal("/orders/and/purchases"));
    }
  };

  const customerName =
    (order?.address?.fullName && order.address.fullName !== "Valued Customer" ? order.address.fullName : null) ||
    (userInfo?.fullName && userInfo.fullName !== "Valued Customer" ? userInfo.fullName : null) ||
    (userInfo?.user?.fullName && userInfo.user.fullName !== "Valued Customer" ? userInfo.user.fullName : null) ||
    order?.address?.fullName ||
    "Valued Customer";
  const customerPhone =
    order?.address?.mobileNo ||
    userInfo?.mobileNo ||
    userInfo?.user?.mobileNo ||
    "";
  const customerEmail =
    order?.address?.email ||
    userInfo?.email ||
    userInfo?.user?.email ||
    "";

  const orderItems = order?.items || [];
  const orderTotal = Number(order?.totalAmount || order?.onlinePayAmount || 0);
  const orderDiscount = Number(order?.discountAmount || 0);
  const orderSubtotal = Number(
    Number(order?.subTotal) > orderTotal
      ? order?.subTotal
      : orderTotal + orderDiscount
  );
  const orderPaidAmount = Number(
    order?.paidAmount !== undefined
      ? order?.paidAmount
      : (order?.paymentStatus === "Completed" ? orderTotal : 0)
  );
  const paymentMode =
    order?.paymentMode ||
    (order?.paymentMethod === "cod" ? "Cash on Delivery" : "Cashfree (Online)");
  const isPaymentCompleted = order?.paymentStatus === "Completed";
  const totalAmount = orderTotal;

  return (
    <div className="min-h-screen bg-[#f1f3f2] pb-10">
      {/* ===== Confirmation banner (Flipkart-style hero strip) ===== */}
      <div className="bg-[#214436]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-10 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-4 sm:gap-5"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              {isPaymentCompleted ? (
                <CheckCircle className="w-8 h-8 sm:w-11 sm:h-11 text-[#214436]" />
              ) : isVerifying ? (
                <div className="w-7 h-7 sm:w-10 sm:h-10 border-4 border-[#214436] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Package className="w-8 h-8 sm:w-11 sm:h-11 text-amber-700" />
              )}
            </div>

            <div className="min-w-0 flex-1 text-white">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-white/15 text-emerald-50 mb-2">
                {isPaymentCompleted
                  ? "Payment Verified & Successful"
                  : isVerifying
                  ? "Confirming Payment with Cashfree..."
                  : "Payment Verification Pending"}
              </span>

              <h1 className="text-xl sm:text-3xl font-bold leading-tight">
                {isPaymentCompleted
                  ? "Thank You for Your Order!"
                  : isVerifying
                  ? "Processing Your Order..."
                  : "Order Awaiting Confirmation"}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-emerald-50/85 max-w-xl">
                {isPaymentCompleted
                  ? "Your payment has been successfully verified by Cashfree. We are preparing your order with the highest care and authentic certification."
                  : isVerifying
                  ? "Please wait a moment while we verify your payment with Cashfree. Do not close or refresh this page."
                  : "We are waiting for Cashfree to confirm your payment. If your payment was deducted, your order will automatically be confirmed within a few minutes."}
              </p>

              {/* Order ID */}
              {(order?.orderId || queryOrderId) && (
                <div className="mt-4 inline-flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 text-xs sm:text-sm">
                  <span className="text-emerald-50/80 font-medium">Order Reference:</span>
                  <span className="font-mono font-bold text-white break-all">
                    #{order?.orderId || queryOrderId}
                  </span>
                  <button
                    onClick={handleCopyOrderId}
                    className="p-1 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-200" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== Content (overlaps the banner) ===== */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 space-y-3 sm:space-y-4">
        {/* Order status tracker */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-8 py-5">
          <div className="flex items-center">
            {["Order Confirmed", "Packed", "Shipped", "Delivered"].map((step, i, arr) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center text-center w-16 sm:w-24 flex-shrink-0">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white ${
                      i === 0 ? "bg-[#214436]" : "bg-gray-300"
                    }`}
                  >
                    {i === 0 ? <Check className="w-4 h-4" /> : <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] sm:text-xs leading-tight ${
                      i === 0 ? "font-semibold text-[#120213]" : "text-gray-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 -mt-5 ${i === 0 ? "bg-[#214436]/40" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-[#214436] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading order summary...
          </div>
        ) : order ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Left column: items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="px-4 sm:px-6 py-3.5 border-b border-gray-100 text-sm sm:text-base font-semibold text-[#120213] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#214436]" />
                  Items in Your Order ({orderItems.length})
                </h2>

                <div className="divide-y divide-gray-100">
                  {orderItems.map((item, idx) => {
                    const title = item.title || item.jewelryTitle || item.productId?.name || item.jewelryId?.jewelryName || "GemRishi Jewelry Item";
                    const imageSrc = resolveItemImage(item.image || item.jewelryImage || item.productId?.images?.[0] || item.jewelryId?.images?.[0]);

                    return (
                      <div key={item._id || idx} className="px-4 sm:px-6 py-4 flex items-start gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-md border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={imageSrc}
                            alt={title}
                            className="w-full h-full object-contain mix-blend-multiply"
                            onError={(e) => {
                              e.target.src = "https://gemrishi.com/logo.png";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#120213] text-sm sm:text-base line-clamp-2">
                            {title}
                          </h3>
                          {item.customization && (
                            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                              {item.customization.goldKarat?.karat && (
                                <p>Metal: {item.customization.goldKarat.karat}</p>
                              )}
                              {item.customization.certificate?.certificateType && (
                                <p>Cert: {item.customization.certificate.certificateType}</p>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Qty: <span className="font-medium text-gray-700">{item.quantity || 1}</span>
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-[#120213] text-sm sm:text-base">
                            ₹{Number(item.itemTotal || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assistance Banner */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <p className="font-semibold text-[#120213] text-sm">Need help with your order?</p>
                  <p className="text-xs text-gray-600">Our gem experts are ready to assist you on WhatsApp.</p>
                </div>
                <a
                  href={`https://wa.me/919817975978?text=${encodeURIComponent(
                    `Hi GemRishi team, I have a question about my order #${order.orderId || queryOrderId}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Right column: delivery + price */}
            <div className="space-y-3 sm:space-y-4">
              {/* Delivery & Customer Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="px-4 sm:px-5 py-3.5 border-b border-gray-100 text-sm sm:text-base font-semibold text-[#120213] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#214436]" />
                  Delivery Details
                </h2>

                <div className="px-4 sm:px-5 py-4 text-sm text-gray-700 space-y-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#120213] text-base">{customerName}</p>
                    {customerPhone && (
                      <p className="flex items-center gap-1.5 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {customerPhone}
                      </p>
                    )}
                    {customerEmail && (
                      <p className="flex items-center gap-1.5 text-gray-600 break-all">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {customerEmail}
                      </p>
                    )}
                  </div>

                  <div className="bg-[#f6f8f7] p-3 rounded-md border border-gray-100 text-xs sm:text-sm space-y-1">
                    <p className="font-medium text-[#120213]">Shipping Address:</p>
                    {order.address?.addressLine1 ? (
                      <>
                        <p>{order.address.addressLine1}</p>
                        {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                        <p>
                          {order.address.city}
                          {order.address.state ? `, ${order.address.state}` : ""}
                          {order.address.pinCode ? ` - ${order.address.pinCode}` : ""}
                        </p>
                        <p>{order.address.country || "India"}</p>
                      </>
                    ) : isVerifying ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-800 py-1">
                        <div className="w-3.5 h-3.5 border-2 border-[#214436] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <span>Confirming delivery address with Cashfree...</span>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Address collected via Cashfree OCC</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Payment Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <h2 className="px-4 sm:px-5 py-3.5 border-b border-gray-100 text-sm sm:text-base font-semibold text-[#120213] flex items-center justify-between">
                  <span>Order & Payment Summary</span>
                  {isPaymentCompleted && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Paid
                    </span>
                  )}
                </h2>
                <div className="px-4 sm:px-5 py-4 space-y-2.5 text-sm">
                  {/* Subtotal (Price before discount) */}
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal (Price before discount)</span>
                    <span className="font-semibold text-gray-900">
                      ₹{orderSubtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Discount Applied */}
                  {orderDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 bg-emerald-50/80 px-2.5 py-1.5 rounded border border-emerald-100 font-medium">
                      <span>Discount</span>
                      <span className="font-bold">
                        - ₹{orderDiscount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="flex justify-between text-base font-bold text-[#120213] pt-2 border-t border-gray-100">
                    <span>Total Order Amount</span>
                    <span className="text-[#214436]">
                      ₹{orderTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Amount Paid */}
                  <div className="flex justify-between text-sm font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200">
                    <span>Amount Paid</span>
                    <span>
                      ₹{orderPaidAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Mode of Payment */}
                  <div className="flex justify-between text-xs text-gray-600 pt-1">
                    <span>Mode of Payment</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[65%] break-words">
                      {paymentMode}
                    </span>
                  </div>

                  {/* Gateway */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Payment Gateway</span>
                    <span className="font-medium text-gray-700">
                      {order.paymentMethod === "cod" ? "Cash on Delivery" : "Cashfree Payments"}
                    </span>
                  </div>

                  {/* Payment Status */}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Payment Status</span>
                    {isPaymentCompleted ? (
                      <span className="font-semibold text-emerald-700">Payment Verified (Completed)</span>
                    ) : isVerifying ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                        <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        Verifying with Cashfree...
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-700">
                        {order.paymentStatus || "Pending"}
                      </span>
                    )}
                  </div>

                  {/* Savings Banner */}
                  {orderDiscount > 0 && (
                    <div className="mt-2 text-center text-xs text-emerald-800 bg-emerald-100/70 font-semibold py-2 px-2.5 rounded-md border border-emerald-200">
                      🎉 You saved ₹{orderDiscount.toLocaleString("en-IN")} on this order!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ===== Primary actions ===== */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* 1. Go to Homepage Button */}
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-md font-semibold text-sm bg-[#214436] text-white hover:bg-[#1a372c] transition-colors shadow-sm cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </button>

          {/* 2. View Orders (only when logged in) */}
          {userInfo && (
            <button
              onClick={() => navigate("/orders/and/purchases")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-md font-semibold text-sm bg-white text-[#214436] border border-[#214436] hover:bg-emerald-50/60 transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4" />
              View My Orders
            </button>
          )}

          {/* LOGIN/SIGNUP BUTTON COMMENTED OUT
          <button
            onClick={handleLoginClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-md font-semibold text-sm bg-white text-[#214436] border border-[#214436] hover:bg-emerald-50/60 transition-colors cursor-pointer"
          >
            <User className="w-4 h-4" />
            Login or Sign Up to Track Order
          </button>
          */}
        </div>
      </div>
    </div>
  );
}