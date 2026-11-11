"use client";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import OrderSummary from "./OrderSummary";
import ShoppingMap from "./ShoppingMap";
import UPI from "../../assets/Payment/UPI.svg";
import Netbanking from "../../assets/Payment/Netbanking.svg";
import creditAndDebit from "../../assets/Payment/creditAndDebit.svg";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { openLoginModal } from "../../features/api/authSlice";
import { removeItemFromCart, clearCart, setCartItems } from "../../redux/cartSlice";
// -----------------Add By Pawan ---------------------------------------------------------
import { trackPurchaseEvent, buildItemsFromCartData } from "../../utils/purchaseTracking";
import { trackCustomEvent } from "../../utils/autoTracking";
import { fbqTrack } from "../../utils/metaPixel";
import { getCheckoutMetaContext } from "../../utils/Trackingconfig";
// -----------------Add By Pawan ---------------------------------------------------------

import "react-toastify/dist/ReactToastify.css";
import {
  useApplyOfferMutation,
  useGetUpsellingProductListQuery,
} from "../../features/api/apiSlice";
import WishlistButton from "../../components/wishlistButton";
import VideoModal from "../../components/models/VideoModal";
import { Play } from "lucide-react";
import { getProductUrl } from "../../utils/productUrl";

import { getCashfree } from "../../utils/cashfree";
import { getProductDisplayPrice } from "../../config/campaignOffers.config.js";

const products = [
  {
    _id: "671a3fbc123abc01",
    name: "Blue Sapphire (Neelam)",
    slug: "blue-sapphire-premium",
    origin: "Sri Lanka",
    price: 18500,
    images: [{ url: "https://example.com/images/sapphire1.png" }],
    videos: [{ url: "https://example.com/videos/sapphire1.mp4" }],
  },
  {
    _id: "671a3fbc123abc02",
    name: "Ruby (Manik)",
    slug: "ruby-natural-certified",
    origin: "Myanmar",
    price: 21500,
    images: [{ url: "https://example.com/images/ruby1.png" }],
    videos: [],
  },
  {
    _id: "671a3fbc123abc03",
    name: "Emerald (Panna)",
    slug: "emerald-natural",
    origin: "Colombia",
    price: 9500,
    images: [{ url: "https://example.com/images/emerald1.png" }],
    videos: [{ url: "https://example.com/videos/emerald1.mp4" }],
  },
  {
    _id: "671a3fbc123abc04",
    name: "Yellow Sapphire (Pukhraj)",
    slug: "yellow-sapphire-certified",
    origin: "Thailand",
    price: 12000,
    images: [{ url: "https://example.com/images/yellow-sapphire.png" }],
    videos: [],
  },
];

function PaymentPage() {
  const reduxUserInfo = useSelector((state) => state.auth.userInfo);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const URL = import.meta.env.VITE_URL;
  const dispatch = useDispatch();
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const selectedOfferId = null;
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [paymentTotalAmount, setPaymentTotalAmount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizeAddressField = (value) => {
    if (Array.isArray(value)) {
      return value.join(" ").trim();
    }
    if (value == null) {
      return "";
    }
    return String(value).trim();
  };

  const { data: upSellingProducts } = useGetUpsellingProductListQuery();

  useEffect(() => {
    const fetchData = async () => {
      const userInfoString = localStorage.getItem("userInfo");
      let userToken = null;

      if (userInfoString) {
        try {
          const userInfo = JSON.parse(userInfoString);
          userToken = userInfo.token;
        } catch (e) {
          console.error("Failed to parse userInfo", e);
        }
      }
// --------Commment by Pawan ------------------------------------
      // if (!userToken) {
      //   setLoading(false);
      //   return;
      // }

      // try {
      //   // Fetch cart data
      //   const cartResponse = await axios.get(
      //     `${URL}/cart/get_all_cart_list?page=1&limit=10`,
      //     {
      //       headers: {
      //         "Content-Type": "application/json",
      //         Authorization: `Bearer ${userToken}`,
      //       },
      //     }
      //   );
// --------Commment by Pawan ----------------------------------------
// -----------------Add By Pawan: GA4 begin_checkout ===================================================
 console.log("[DEBUG] userToken:", userToken);

      if (!userToken) {
        console.log("[DEBUG] EXIT: no userToken");
        setLoading(false);
        return;
      }

      try {
        // Fetch cart data
        const cartResponse = await axios.get(
          `${URL}/cart/get_all_cart_list?page=1&limit=10`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        console.log("[DEBUG] cartResponse.data:", cartResponse.data);
        console.log("[DEBUG] success:", cartResponse.data?.success, "| cart:", cartResponse.data?.cart);
 // -----------------Add By Pawan: GA4 begin_checkout ===================================================
        if (cartResponse.data?.success && cartResponse.data?.cart) {
          // ✅ Normalize and store full cart data with customization
          const formattedCart = cartResponse.data.cart.map((item) => {

            const isJewelry =
              item.itemType === "Jewelry";

            return {

              productId:
                !isJewelry
                  ? (
                      item.item?.productId ||
                      item.item?._id ||
                      location.state?.productId
                    )
                  : null,

              jewelryId:
                isJewelry
                  ? item.item?._id
                  : null,

              name:
                isJewelry
                  ? item.item?.jewelryName
                  : item.item?.name,

              // IMPORTANT FIX
              price:
                isJewelry
                  ? Number(item.totalPrice || 0)
                  : Number(item.item?.price || 0),

              quantity:
                Number(item.quantity || 1),

              customization:
                item.customization || {},

              itemType:
                item.itemType || "Product",
                sku: item.item?.sku || "",  // --- add by pawan-----
              
            };
          });
          setCartData(formattedCart);

const beginCheckoutKey = "tracked_begin_checkout";
if (!sessionStorage.getItem(beginCheckoutKey)) {
  sessionStorage.setItem(beginCheckoutKey, "1");
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: "begin_checkout",
    ecommerce: {
      currency: "INR",
      value: formattedCart.reduce(
        (sum, i) => sum + Number(i.price) * Number(i.quantity || 1),
        0
      ),
      items: buildItemsFromCartData(formattedCart),
    },
  });
}
// ===== End Add By Pawan ===================================================================
        }


        // Fetch user profile
        const profileResponse = await axios.get(`${URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setUserProfile(profileResponse.data.user);
      } catch (err) {
        // ----------------Add And comment by  Pawan--------------
        // console.error("Error fetching data:", err);
        console.error("[DEBUG] EXIT: fetchData threw an error:", err);
        console.error("[DEBUG] err.response?.data:", err?.response?.data);
        console.error("[DEBUG] err.response?.status:", err?.response?.status);
        // ----------------Add And comment by  Pawan--------------
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [URL]);

  //console.log("cartdata", cartData);
  useEffect(() => {
    if (cartData.length === 0) {
      setPaymentTotalAmount(0);
      return;
    }

    const total = cartData.reduce((sum, item) => {
      const isJewelry = item.itemType === "Jewelry";
      const basePrice = isJewelry
        ? Number(item.item?.jewelryPrice || item.price || 0)
        : Number(getProductDisplayPrice(item.item) || item.price || 0);
      let itemTotal = Number(item.totalPrice) || (basePrice * Number(item.quantity || 1));

      if (!item.totalPrice && item.customization) {
        if (item.customization.goldKarat?.price)
          itemTotal += Number(item.customization.goldKarat.price);
        if (item.customization.certificate?.price)
          itemTotal += Number(item.customization.certificate.price);
        if (item.customization.gemstoneWeight?.price)
          itemTotal += Number(item.customization.gemstoneWeight.price);
        if (item.customization.quality?.price)
          itemTotal += Number(item.customization.quality.price);
        if (item.customization.diamondSubstitute?.price)
          itemTotal += Number(item.customization.diamondSubstitute.price);
      }

      return sum + itemTotal;
    }, 0);

    console.log("FINAL TOTAL =>", total);

    if (appliedDiscount === 0) {
      setPaymentTotalAmount(total);
    }

  }, [cartData, appliedDiscount]);
  
  console.log("pmethod", paymentMethod)

  // const handleCreateOrder = async () => {
  const handleCreateOrder = async (selectedPaymentMethod) => {
    const userInfoString = localStorage.getItem("userInfo");
    const storedShippingDetails = localStorage.getItem("shippingDetails");

    if (!userInfoString) {
      alert("Please log in first.");
      navigate("/login");
      return null;
    }

    if (cartData.length === 0) {
      alert("Your cart is empty.");
      return null;
    }

    let userInfo = {};
    try {
      userInfo = JSON.parse(userInfoString || "{}");
    } catch (e) {
      userInfo = {};
    }
    let shippingDetails = null;
    try {
      shippingDetails = storedShippingDetails ? JSON.parse(storedShippingDetails) : null;
    } catch (e) {
      shippingDetails = null;
    }

    // Get address from shippingDetails or userProfile
    const addressData = shippingDetails?.address || userProfile?.address;

    if (!addressData) {
      alert("Please complete shipping details first.");
      navigate("/shipping/address");
      return null;
    }

    let address = {};
    if (Array.isArray(addressData)) {
      // Assume first address if array
      const addr = addressData[0] || {};
      address = {
        fullName: normalizeAddressField(addr.fullName || userInfo.name || ""),
        email: normalizeAddressField(addr.email || userInfo.email || ""),
        mobileNo: normalizeAddressField(addr.mobileNo || userInfo.mobileNo || ""),
        addressLine1: normalizeAddressField(addr.addressLine1 || ""),
        addressLine2: normalizeAddressField(addr.addressLine2 || ""),
        landmark: normalizeAddressField(addr.landmark || ""),
        city: normalizeAddressField(addr.city || ""),
        district: normalizeAddressField(addr.district || ""),
        state: normalizeAddressField(addr.state || ""),
        pinCode: normalizeAddressField(addr.pinCode || ""),
        country: normalizeAddressField(addr.country || "India"),
        addressType: normalizeAddressField(addr.addressType || "Home"),
        note: normalizeAddressField(addr.note || ""),
      };
    } else {
      address = {
        fullName: normalizeAddressField(addressData.fullName || userInfo.name || ""),
        email: normalizeAddressField(addressData.email || userInfo.email || ""),
        mobileNo: normalizeAddressField(addressData.mobileNo || userInfo.mobileNo || ""),
        addressLine1: normalizeAddressField(addressData.addressLine1 || ""),
        addressLine2: normalizeAddressField(addressData.addressLine2 || ""),
        landmark: normalizeAddressField(addressData.landmark || ""),
        city: normalizeAddressField(addressData.city || ""),
        district: normalizeAddressField(addressData.district || ""),
        state: normalizeAddressField(addressData.state || ""),
        pinCode: normalizeAddressField(addressData.pinCode || ""),
        country: normalizeAddressField(addressData.country || "India"),
        addressType: normalizeAddressField(addressData.addressType || "Home"),
        note: normalizeAddressField(addressData.note || ""),
      };
    }

    

    // ✅ Build order items
    const orderItems = cartData.map((item) => {
      const isJewelry = item.itemType === "Jewelry";
      const basePrice = isJewelry
        ? Number(item.item?.jewelryPrice || item.price || 0)
        : Number(item.item?.price || item.price || 0);
      let itemTotal = Number(item.totalPrice) || (basePrice * Number(item.quantity || 1));

      if (!item.totalPrice && item.customization) {
        if (item.customization.goldKarat?.price)
          itemTotal += Number(item.customization.goldKarat.price);
        if (item.customization.certificate?.price)
          itemTotal += Number(item.customization.certificate.price);
        if (item.customization.gemstoneWeight?.price)
          itemTotal += Number(item.customization.gemstoneWeight.price);
        if (item.customization.quality?.price)
          itemTotal += Number(item.customization.quality.price);
        if (item.customization.diamondSubstitute?.price)
          itemTotal += Number(item.customization.diamondSubstitute.price);
      }

      return {
        productId: item.itemType === "Product" ? (item.item?._id || item.item || item.productId || location.state?.productId) : (item.productId || undefined),
        jewelryId: item.itemType === "Jewelry" ? (item.item?._id || item.item || item.jewelryId) : (item.customization?.jewelryId?._id || item.customization?.jewelryId || item.jewelryId || undefined),
        quantity: item.quantity || 1,
        itemTotal,
        customization: item.customization || {},
      };
    });


    const activeStoredCoupon = sessionStorage.getItem("activeCartCoupon");
    const resolvedPromoCode = promoCode || activeStoredCoupon || null;
    const orderPayload = {
      address,
      paymentMethod: selectedPaymentMethod,
      promoCode: resolvedPromoCode,
      couponCode: resolvedPromoCode,
      appliedCoupons: resolvedPromoCode ? [resolvedPromoCode] : [],
      items: orderItems,
      metaContext: getCheckoutMetaContext(),
    };

    // console.log("📦 Sending Order Payload:", orderPayload);

    try {
      const response = await axios.post(
        `${URL}/order/create-order`,
        orderPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data?.order) {
        sessionStorage.removeItem("shippingDetails");
        toast.success("Order created successfully!");
        return response.data;
      } else {
        toast.error(
          response.data.message ||
          response.data.msg ||
          "Failed to create order. Please try again."
        );
      }
    } catch (error) {
      const rawErrorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.message ||
        "";
      const isHtmlOrJsonError =
        typeof rawErrorMsg === "string" &&
        (rawErrorMsg.includes("is not valid JSON") ||
          rawErrorMsg.includes("Unexpected token") ||
          rawErrorMsg.includes("<html>") ||
          rawErrorMsg.includes("<html"));
      const displayMsg = isHtmlOrJsonError
        ? "Payment gateway communication error. Please try again."
        : rawErrorMsg || "An error occurred while creating the order. Please try again.";
      toast.error(displayMsg);
      return null;
    }
  };

  console.log("totl", paymentTotalAmount)
// Commment By Pawan -----------------------------------------------------------
  // const handleProceed = async () => {
//   const orderResult = await handleCreateOrder();
  // Comment By Pawan-----------------------------------------------------------
   // Add By Pawan-----------------------------------------------------------
   const handleShippingSubmit = () => {
  // save address so PaymentPage.jsx can read it via localStorage.getItem("shippingDetails")
  localStorage.setItem("shippingDetails", JSON.stringify({ address }));

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: "add_shipping_info",
    ecommerce: {
      currency: "INR",
      value: totalAmount,
      shipping_tier: "Standard",
      items: buildItemsFromCartData(cartData),
    },
  });

  navigate("/payment");
};

  // Add By Pawan-----------------------------------------------------------------------
  const [promoCode, setPromoCode] = useState("");
  const [totalDiscountApplied, setTotalDiscountApplied] = useState(0);

  const [applyOffer] = useApplyOfferMutation();

  /////////////////////////////////////////////////////////
  const handleCODSelect = () => {
    setPaymentMethod("cod");
  };

  ///////////////////////////////////////////////////////////

  const handleOfferApply = async (promoCode) => {
    try {
      const res = await applyOffer(promoCode).unwrap();
      setTotalDiscountApplied(res.cartSummary.totalDiscount);
      setAppliedDiscount(res.cartSummary.totalDiscount);
      setPaymentTotalAmount(res.cartSummary.finalTotal);
      toast.success("Offer applied successfully!");
    } catch (error) {
      toast.error(
        error?.data?.message ||
        error?.data?.msg ||
        error?.error ||
        "Failed to apply offer. Please try again."
      );
      setPromoCode("");
    }
  };

  const handleProceedPayment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const selectedMethod = paymentMethod === "cod" ? "cod" : "cashfree";

      // GA4 add_payment_info
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: "add_payment_info",
        ecommerce: {
          currency: "INR",
          value: paymentTotalAmount,
          payment_type: selectedMethod,
          items: buildItemsFromCartData(cartData),
        },
      });

      const orderResult = await handleCreateOrder(selectedMethod);
      if (!orderResult?.order) {
        setIsSubmitting(false);
        return;
      }

      const { order, paymentSessionId, cashfreeEnvironment, data } = orderResult;
      setPaymentTotalAmount(order.totalAmount);

      // GA4 checkout_progress
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: "checkout_progress",
        ecommerce: {
          currency: "INR",
          value: order.totalAmount,
          payment_type: selectedMethod,
          items: buildItemsFromCartData(cartData),
        },
      });

      // 1. Full COD without online prepayment
      if (order.paymentMethod === "cod" && !order.partialPay) {
        toast.success("Order placed successfully!");
        trackPurchaseEvent({
          orderId: order.orderId,
          subtotal: order.totalAmount,
          coupon: promoCode || "",
          items: buildItemsFromCartData(cartData),
        });
        dispatch(clearCart());
        dispatch(setCartItems([]));
        navigate("/orders/and/purchases", { replace: true });
        return;
      }

      // 2. Cashfree Checkout Modal (100% Online or 10% Partial COD Prepay)
      if (paymentSessionId) {
        // Track AddPaymentInfo & Cashfree Modal Open for Google & Meta
        trackCustomEvent("cashfree_modal_opened", {
          order_id: order.orderId,
          amount: Number(order.totalAmount) || 0,
          payment_method: selectedMethod,
        });

        if (typeof window.clarity === "function") {
          window.clarity("set", "checkout_state", "cashfree_modal_open");
          window.clarity("set", "checkout_order_id", String(order.orderId));
        }

        fbqTrack("AddPaymentInfo", {
          value: Number(order.totalAmount) || 0,
          currency: "INR",
          content_type: "product",
          content_ids: (cartData || []).map((c) => String(c.item?.sku || c.item?._id || c._id || "")).filter(Boolean),
        });

        const cashfree = await getCashfree(cashfreeEnvironment);
        const checkoutOptions = {
          paymentSessionId: paymentSessionId,
          redirectTarget: "_modal",
        };

        const response = await cashfree.checkout(checkoutOptions);

        if (response?.error) {
          console.warn("Cashfree checkout notice:", response.error);

          if (response.error.message === "User closed the modal") {
            // User intentionally closed / abandoned payment modal
            trackCustomEvent("cashfree_modal_closed", {
              order_id: order.orderId,
              amount: Number(order.totalAmount) || 0,
              status: "abandoned",
            });
          } else {
            // Payment error / declined by gateway
            trackCustomEvent("cashfree_payment_failed", {
              order_id: order.orderId,
              amount: Number(order.totalAmount) || 0,
              error_reason: response.error.message || "Unknown error",
            });
          }

          if (
            response.error.message &&
            response.error.message !== "User closed the modal"
          ) {
            toast.error(response.error.message || "Payment cancelled or failed.");
          }
          setIsSubmitting(false);
          return;
        }

        if (response?.paymentDetails) {
          trackCustomEvent("cashfree_payment_success", {
            order_id: order.orderId,
            amount: Number(order.totalAmount) || 0,
          });
          toast.success("Payment completed successfully!");
          const purchaseKey = `tracked_purchase_${order.orderId}`;
          if (!sessionStorage.getItem(purchaseKey)) {
            sessionStorage.setItem(purchaseKey, "1");
            trackPurchaseEvent({
              orderId: order.orderId,
              subtotal: order.totalAmount,
              coupon: promoCode || "",
              currency: "INR",
              items: buildItemsFromCartData(cartData),
              customer: {
                name: selectedAddress?.fullName || "",
                email: selectedAddress?.email || (typeof userToken === "object" ? userToken?.email : "") || "",
                phone: selectedAddress?.phone || "",
                city: selectedAddress?.city || "",
                postalCode: selectedAddress?.pinCode || "",
              },
            });
          }
          dispatch(clearCart());
          dispatch(setCartItems([]));

          // Immediately verify with backend to fetch updated address & completed status
          let verifiedOrder = null;
          try {
            const verifyRes = await axios.get(
              `${URL}/cashfree/verify-order/${order.orderId}`
            );
            if (verifyRes.data?.order) {
              verifiedOrder = verifyRes.data.order;
            }
          } catch (vErr) {
            console.warn("Immediate verify check notice:", vErr.message);
          }

          navigate(`/thank-you?order_id=${order.orderId}`, {
            replace: true,
            state: { order: verifiedOrder || { ...order, paymentStatus: "Completed" } },
          });
          return;
        }

        // Status verification check in case modal returned without paymentDetails
        try {
          const verifyRes = await axios.get(
            `${URL}/cashfree/verify-order/${order.orderId}`
          );
          if (verifyRes.data?.paymentStatus === "Completed") {
            toast.success("Payment verified successfully!");
            dispatch(clearCart());
            dispatch(setCartItems([]));
            const verifiedOrder = verifyRes.data.order || order;
            navigate(`/thank-you?order_id=${order.orderId}`, { replace: true, state: { order: verifiedOrder } });
            return;
          }
        } catch (vErr) {
          console.warn("Cashfree status verify notice:", vErr);
        }
      } else if (order.paymentMethod === "razorpay" && data?.id) {
        navigate("/use-razorpay", {
          state: {
            order,
            razorpay: {
              orderId: data.id,
              amount: data.amount,
              currency: data.currency || "INR",
            },
          },
        });
        return;
      } else {
        toast.error("Failed to initialize secure payment session. Please try again.");
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      toast.error(
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Payment initiation failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen lg:min-h-[1070px] flex flex-col lg:flex-row">
        {/* Left Section */}
        <div className="w-full lg:border-r border-[#D2CFCF] lg:pt-10">
          <ShoppingMap activeStep={3} />
          <div className="w-full flex px-4 md:px-6 lg:px-30">
            <div className="w-full h-auto flex flex-col justify-end">
              {/* <div className="w-full h-auto lg:h-[90px] mb-4">
                <div>
                  <label
                    htmlFor="couponCode"
                    className="block text-md font-medium text-gray-700 mb-2"
                  >
                    Apply coupon code here (if any)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="couponCode"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />

                    <button
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition"
                      onClick={() => handleOfferApply(promoCode)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-4 mt-2">
                  Total discount applied:{" "}
                  <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 font-semibold">
                    Rs. {totalDiscountApplied}
                  </span>
                </p>
              </div> */}

              <div className="text-2xl font-semibold text-[#264A3F] mb-4">
                Payment Options
              </div>

              {/* Online Payment (Cashfree 360) */}
              <div
                className={`w-full rounded-[12px] flex flex-col justify-center p-4 cursor-pointer transition-all duration-200 ${
                  paymentMethod === "online"
                    ? "border-2 border-[#0EC78E] bg-[#f9fdfb] shadow-xs"
                    : "border border-[#AEABAB] hover:border-gray-400 bg-white"
                }`}
                onClick={() => setPaymentMethod("online")}
              >
                <div className="flex items-center gap-4 lg:pl-2">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="w-[22px] h-[22px] accent-[#264A3F] cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <p className="text-[18px] lg:text-[20px] font-serif text-[#264A3F] font-semibold">
                      Online Payment (UPI, Cards, Netbanking)
                    </p>
                    <p className="text-[12px] text-gray-500 font-sans">
                      Fast 1-Click Checkout powered by Cashfree 360
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 pl-10 pt-3">
                  <div className="flex items-center gap-2">
                    <img src={UPI} alt="UPI" className="w-[28px] h-[20px]" />
                    <span className="text-[12px] font-medium text-gray-600 font-sans">UPI / QR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={creditAndDebit} alt="Cards" className="w-[28px] h-[20px]" />
                    <span className="text-[12px] font-medium text-gray-600 font-sans">Cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={Netbanking} alt="Netbanking" className="w-[28px] h-[20px]" />
                    <span className="text-[12px] font-medium text-gray-600 font-sans">Net Banking</span>
                  </div>
                </div>
              </div>

              {/* Cash on Delivery (Available when Total <= Rs. 20,000) */}
              {paymentTotalAmount > 0 && paymentTotalAmount <= 20000 && (
                <div
                  className={`w-full h-auto rounded-[12px] flex flex-col justify-center p-4 mt-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === "cod"
                      ? "border-2 border-[#0EC78E] bg-[#f9fdfb] shadow-xs"
                      : "border border-[#AEABAB] hover:border-gray-400 bg-white"
                  }`}
                  onClick={() => handleCODSelect()}
                >
                  <div className="flex items-center gap-4 lg:pl-2">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => handleCODSelect()}
                      className="w-[22px] h-[22px] accent-[#264A3F] cursor-pointer"
                    />
                    <div>
                      <p className="text-[18px] lg:text-[20px] text-[#264A3F] font-serif font-semibold">
                        Cash on Delivery
                      </p>
                      {paymentTotalAmount > 5000 ? (
                        <p className="text-[12px] text-amber-800 font-medium font-sans mt-0.5">
                          10% (₹{Math.round(paymentTotalAmount * 0.1).toLocaleString()}) advance online prepayment required via Cashfree. Remaining 90% (₹{Math.round(paymentTotalAmount * 0.9).toLocaleString()}) on delivery.
                        </p>
                      ) : (
                        <p className="text-[12px] text-gray-500 font-sans mt-0.5">
                          Pay 100% on delivery with cash or UPI
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Proceed Action Button */}
              <div className="w-full h-auto flex flex-col items-start mt-6">
                <button
                  onClick={handleProceedPayment}
                  disabled={isSubmitting}
                  className="w-full max-w-[458px] h-[55px] text-[18px] font-serif text-white bg-[#264A3F] hover:bg-[#1a3329] disabled:bg-gray-400 rounded-[10px] cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center font-medium"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Processing Secure Payment...
                    </span>
                  ) : paymentMethod === "cod" ? (
                    paymentTotalAmount > 5000 ? (
                      `Pay ₹${Math.round(paymentTotalAmount * 0.1).toLocaleString()} Advance & Confirm COD`
                    ) : (
                      "Place Order with Cash on Delivery"
                    )
                  ) : (
                    `Pay ₹${Math.round(paymentTotalAmount || 0).toLocaleString()} with Cashfree`
                  )}
                </button>
                <div className="mt-3 flex items-center gap-2 text-[12px] text-gray-500">
                  <svg className="w-4 h-4 text-[#264A3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>100% Safe & Encrypted Payments Powered by Cashfree 360</span>
                </div>
              </div>
              </div>
          </div>
        </div>

        {/* Right Section */}
        <OrderSummary />
      </div>
    </>
  );
}

export default PaymentPage;
