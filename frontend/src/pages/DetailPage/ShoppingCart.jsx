"use client";
import axios from "axios";
import { AlertCircle, CheckCircle2, Gift, Tag, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RingSvg from "../../assets/Jwellery/Ring.svg";
import BlueSapphire from "../../assets/Stone/BlueSapphire.svg";

import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import SelectJewelryModal from "../../components/cart/SelectJewelryModal";
import { openLoginModal } from "../../features/api/authSlice";
import { removeItemFromCart, setCartItems } from "../../redux/cartSlice";
import { getCashfree } from "../../utils/cashfree";
import { getProductUrl } from "../../utils/productUrl";
// ----------Add by Pawan for GA4 Tracking----------------
import { getAttributionData } from "../../utils/attribution";
import { buildItemsFromRawCart, trackPurchaseEvent } from "../../utils/purchaseTracking";
// ===== Add by Pawan For Meta Pixel =============
import { fbqTrack } from "../../utils/metaPixel";
import { getCheckoutMetaContext } from "../../utils/Trackingconfig";
import { trackCustomEvent, tagClarityCart } from "../../utils/autoTracking";
// ===== End Add by Pawan For Meta Pixel =========
// -------Add by Pawan for GA4 Tracking----------------
// ----------Add By Pawan for the currency-------------------------------
import {
  CAMPAIGN_CONFIG,
  getGemstoneDiscountPercent,
  getProductDisplayPrice,
  isCampaignActive,
  isCartItemMatchingBagTarget,
  isGemstoneApplicable,
  isJewelleryMetalApplicable
} from "../../config/campaignOffers.config.js";
import { ConvertFromINR, formatCurrency } from "../../utils/currency";
// ----------Add By Pawan for the currency-------------------------------
// --- Premium Skeleton Loader (Mobile Optimized) ---
const CartItemSkeleton = () => (
  <div className="w-full bg-white rounded-[20px] sm:rounded-[24px] border border-gray-200 shadow-sm p-4 sm:p-6 flex gap-4 sm:gap-6 animate-pulse mb-4 sm:mb-6">
    <div className="w-[85px] h-[85px] sm:w-[140px] sm:h-[140px] rounded-[12px] sm:rounded-[16px] bg-gray-100 flex-shrink-0"></div>
    <div className="flex-1 flex flex-col py-1">
      <div className="flex justify-between items-start gap-2">
        <div className="h-5 sm:h-6 w-3/4 sm:w-2/3 bg-gray-200 rounded-md"></div>
        <div className="h-5 w-5 bg-gray-200 rounded-md flex-shrink-0"></div>
      </div>
      <div className="h-3 sm:h-4 w-1/3 bg-gray-100 rounded-md mt-3"></div>
      <div className="h-3 sm:h-4 w-1/4 bg-gray-100 rounded-md mt-2"></div>
      <div className="mt-auto pt-4">
        <div className="h-5 sm:h-7 w-20 sm:w-28 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  </div>
);
// --- UpSelling Component (Mobile Optimized) ---
function UpSellingProducts({ products = [], loading = false }) {
  const navigate = useNavigate();

  if (loading) return <div className="mt-8 text-gray-400 text-center animate-pulse text-sm">Curating suggestions...</div>;

  if (!products.length) return null;
  return (
    <div className="mt-12 sm:mt-16 mb-20">
      <h3 className="text-xl sm:text-2xl font-serif text-gray-900 mb-6 border-b border-gray-200 pb-3">You may also desire</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {products.slice(0, 4).map((p) => {
          const name = p.name || p.jewelryName || "Gemstone";
          const route = getProductUrl(p);
          return (
            <div
              key={p._id}
              onClick={() => navigate(route)}
              className="group cursor-pointer bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 sm:mb-4 border border-gray-100 flex items-center justify-center p-3">
                <img
                  src={p.images?.[0]?.url || BlueSapphire}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                  alt={name}
                />
              </div>
              <p className="text-[13px] sm:text-[15px] font-medium text-gray-800 line-clamp-1 px-1">{name}</p>
              <p className="text-[11px] sm:text-[13px] text-gray-500 mt-0.5 sm:mt-1 uppercase tracking-wider px-1 pb-1">Discover</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// --- Main Cart Component ---
function ShoppingCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const URL = import.meta.env.VITE_URL;
  const userInfo = useSelector((state) => state.auth.userInfo);
  const { currency, rates } = useSelector((s) => s.currency);
  const formatPrice = (price) =>
    formatCurrency(ConvertFromINR(Number(price) || 0, rates, currency), currency);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [upsellLoading, setUpsellLoading] = useState(true);
  const hasTrackedViewCart = useRef(false);
  const lastFiredPaymentMethod = useRef(null);

  const [isCashfreeLoading, setIsCashfreeLoading] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const getUserToken = () => {
    if (userInfo?.token) return userInfo.token;
    if (userInfo?.user?.token) return userInfo.user.token;
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.token) return parsed.token;
        if (parsed?.user?.token) return parsed.user.token;
        if (parsed?.data?.token) return parsed.data.token;
      } catch (e) {}
    }
    const plainToken = localStorage.getItem("token");
    if (plainToken) return plainToken;
    return null;
  };
  const [cartData, setCartData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const appliedCoupon = appliedCoupons[0] || null;
  const isGemstoneCouponApplied = appliedCoupons.some(
    (c) => c.code.toUpperCase() === String(CAMPAIGN_CONFIG.gemstoneOffer?.code || "DHANTERAS15").toUpperCase()
  );
  const jewelleryCode = String(
    CAMPAIGN_CONFIG.bagOffer?.code ||
    CAMPAIGN_CONFIG.jewelleryOffer?.code ||
    CAMPAIGN_CONFIG.silverOffer?.code ||
    "FESTIVAL"
  ).toUpperCase();
  const isJewelleryCouponApplied = appliedCoupons.some(
    (c) => c.code.toUpperCase() === jewelleryCode
  );
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [giftDismissed, setGiftDismissed] = useState(false);

  // Modal State for "Forgot to add Ring / Pendant?" feature
  const [jewelryModalOpen, setJewelryModalOpen] = useState(false);
  const [selectedGemstoneForMount, setSelectedGemstoneForMount] = useState(null);

  const handleOpenJewelryModal = (cartItem) => {
    setSelectedGemstoneForMount(cartItem);
    setJewelryModalOpen(true);
  };

  const calculateCartSubtotal = () => {
    return cartData.reduce((total, ci) => total + (Number(ci.totalPrice) || 0), 0);
  };

  // Helper to find chosen ring matching shopping bag offer conditions in cart
  const getChosenSilverRing = (items = cartData) => {
    return (items || []).find((ci) => isCartItemMatchingBagTarget(ci));
  };

  // --- COMPLETE CAMPAIGN OFFERS & MULTI-COUPON PRICING ENGINE ---
  const {
    rawSubtotal,
    gemstoneDiscountTotal,
    jewelleryDiscountTotal,
    totalDiscount,
    finalEstimatedTotal,
    pricingByItemId,
  } = useMemo(() => {
    let rawSub = 0;
    let gemDisc = 0;
    let jewDisc = 0;

    const gemstoneCode = String(CAMPAIGN_CONFIG.gemstoneOffer?.code || "DHANTERAS15").toUpperCase();
    const jewelleryCode = String(
      CAMPAIGN_CONFIG.jewelleryOffer?.code || CAMPAIGN_CONFIG.silverOffer?.code || "FESTIVAL"
    ).toUpperCase();

    const gemstoneApplied = appliedCoupons.some((c) => c.code.toUpperCase() === gemstoneCode);
    const jewelleryApplied = appliedCoupons.some((c) => c.code.toUpperCase() === jewelleryCode);

    // Single eligible silver jewellery item for FESTIVAL discount
    let eligibleJewelleryId = null;
    if (jewelleryApplied) {
      const chosenRing = getChosenSilverRing(cartData);
      if (chosenRing) {
        eligibleJewelleryId = chosenRing._id;
      } else {
        const firstEligible = (cartData || []).find((ci) => {
          if (ci.itemType === "Jewelry") {
            const metal = String(ci.customization?.metal || ci.item?.metal || "").toLowerCase();
            const name = String(ci.item?.jewelryName || ci.item?.name || "").toLowerCase();
            return isJewelleryMetalApplicable(metal) || isJewelleryMetalApplicable(name);
          }
          return false;
        });
        if (firstEligible) eligibleJewelleryId = firstEligible._id;
      }
    }

    const pricingMap = {};

    (cartData || []).forEach((ci) => {
      const qty = Number(ci.quantity || 1);
      if (ci.itemType === "Product") {
        const baseStone = Number(
          ci.customization?.originalPrice || getProductDisplayPrice(ci.item) || ci.totalPrice || 0
        );
        const certPrice = Number(ci.customization?.certificate?.price || 0);
        const lineUndiscounted = (baseStone + certPrice) * qty;
        rawSub += lineUndiscounted;

        let itemDiscount = 0;
        let appliedPercent = 0;
        const isEligibleStone = isGemstoneApplicable(ci.item);

        if (gemstoneApplied && isEligibleStone) {
          appliedPercent = getGemstoneDiscountPercent(ci.item);
          const discPerUnit = Math.round(baseStone * (appliedPercent / 100));
          itemDiscount = discPerUnit * qty;
          gemDisc += itemDiscount;
        }

        const lineDiscounted = Math.max(0, lineUndiscounted - itemDiscount);

        pricingMap[ci._id] = {
          basePrice: baseStone,
          certPrice,
          lineUndiscounted,
          itemDiscount,
          discountPercent: appliedPercent,
          lineDiscounted,
          appliedCoupon: gemstoneApplied && isEligibleStone ? gemstoneCode : (ci.customization?.appliedCoupon || null),
        };
      } else if (ci.itemType === "Jewelry") {
        const baseJewelry = Number(
          ci.customization?.originalPrice || ci.item?.jewelryPrice || ci.totalPrice || 0
        );
        const lineUndiscounted = baseJewelry * qty;
        rawSub += lineUndiscounted;

        let itemDiscount = 0;
        if (jewelleryApplied && ci._id === eligibleJewelleryId) {
          itemDiscount = Math.min(
            baseJewelry,
            Number(CAMPAIGN_CONFIG.bagOffer?.discountAmount || CAMPAIGN_CONFIG.bagOffer?.ringDiscountAmount || CAMPAIGN_CONFIG.jewelleryOffer?.discountAmount || 1200)
          );
          jewDisc += itemDiscount;
        }

        const lineDiscounted = Math.max(0, lineUndiscounted - itemDiscount);

        pricingMap[ci._id] = {
          basePrice: baseJewelry,
          certPrice: 0,
          lineUndiscounted,
          itemDiscount,
          discountPercent: baseJewelry > 0 ? Math.round((itemDiscount / baseJewelry) * 100) : 0,
          lineDiscounted,
          appliedCoupon: itemDiscount > 0 ? jewelleryCode : (ci.customization?.appliedCoupon || null),
        };
      } else {
        const fallbackPrice = Number(ci.totalPrice || 0);
        rawSub += fallbackPrice;
        pricingMap[ci._id] = {
          basePrice: fallbackPrice,
          certPrice: 0,
          lineUndiscounted: fallbackPrice,
          itemDiscount: 0,
          discountPercent: 0,
          lineDiscounted: fallbackPrice,
          appliedCoupon: null,
        };
      }
    });

    const totDisc = gemDisc + jewDisc;
    const estTot = Math.max(0, rawSub - totDisc);

    return {
      rawSubtotal: rawSub,
      gemstoneDiscountTotal: gemDisc,
      jewelleryDiscountTotal: jewDisc,
      totalDiscount: totDisc,
      finalEstimatedTotal: estTot,
      pricingByItemId: pricingMap,
    };
  }, [cartData, appliedCoupons]);

  const totalAmount = rawSubtotal;

  // Advanced Clarity VIP & Cart Value Tagging
  useEffect(() => {
    if (cartData && cartData.length > 0) {
      tagClarityCart(rawSubtotal, cartData.length);
    }
  }, [rawSubtotal, cartData.length]);


  // Redirect choose ring to open the Select Ring or Pendant Mount modal
  const handleChooseSilverRing = () => {
    const looseGemstone =
      (cartData || []).find(
        (ci) => ci.itemType === "Product" && !ci.customization?.jewelryId
      ) ||
      (cartData || []).find((ci) => ci.itemType === "Product") ||
      null;

    setSelectedGemstoneForMount(looseGemstone);
    setJewelryModalOpen(true);
  };

  // Open jewelry modal if requested via URL param (e.g. from offers page or external link)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("selectMount") === "true" || params.get("chooseRing") === "true") {
      handleChooseSilverRing();
    }
  }, [location.search]);

  const isBagCampaignActive = isCampaignActive() && CAMPAIGN_CONFIG.bagOffer.enabled;
  const isGiftEnabled = isBagCampaignActive && CAMPAIGN_CONFIG.bagOffer.giftEnabled !== false;

  const bagTargetMetal = CAMPAIGN_CONFIG.bagOffer.conditions?.targetMetal || "silver";
  const bagTargetJewelry = CAMPAIGN_CONFIG.bagOffer.conditions?.targetJewelryType || "ring";
  const bagDiscountAmt = Number(CAMPAIGN_CONFIG.bagOffer.discountAmount || CAMPAIGN_CONFIG.bagOffer.ringDiscountAmount || 1200);
  const bagMinTotal = Number(CAMPAIGN_CONFIG.bagOffer.conditions?.minBagTotal || CAMPAIGN_CONFIG.bagOffer.minBagTotal || 10000);
  const displayTarget = `${bagTargetMetal === "all" ? "" : bagTargetMetal.charAt(0).toUpperCase() + bagTargetMetal.slice(1)} ${bagTargetJewelry.charAt(0).toUpperCase() + bagTargetJewelry.slice(1)}`.trim();

  const handleRemoveGift = () => {
    sessionStorage.setItem("dismissedGiftOffer", "true");
    setGiftDismissed(true);
    toast.info("Complimentary gift removed from your shopping cart.", { position: "top-center" });
  };

  const isGiftAutoAdded =
    isBagCampaignActive &&
    isGiftEnabled &&
    !giftDismissed &&
    sessionStorage.getItem("dismissedGiftOffer") !== "true" &&
    (rawSubtotal || calculateCartSubtotal()) >= bagMinTotal;


  const handleApplyCoupon = (codeToApply) => {
    const rawCode = String(codeToApply || couponInput).trim().toUpperCase();
    setCouponError("");

    if (!rawCode) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const gemstoneCode = String(CAMPAIGN_CONFIG.gemstoneOffer?.code || "DHANTERAS15").toUpperCase();
    const jewelleryCode = String(
      CAMPAIGN_CONFIG.jewelleryOffer?.code ||
      CAMPAIGN_CONFIG.silverOffer?.code ||
      "FESTIVAL"
    ).toUpperCase();

    // 1. Gemstone Offer Coupon (DHANTERAS15)
    if (rawCode === gemstoneCode) {
      if (appliedCoupons.some((c) => c.code.toUpperCase() === gemstoneCode)) {
        toast.info("Coupon DHANTERAS15 is already applied.", { position: "top-center" });
        setCouponInput("");
        return;
      }

      const eligibleGemstones = (cartData || []).filter(
        (ci) => ci.itemType === "Product" && isGemstoneApplicable(ci.item)
      );

      if (eligibleGemstones.length === 0) {
        const errorMsg = "Coupon DHANTERAS15 is only applicable on eligible gemstones.";
        setCouponError(errorMsg);
        toast.error(errorMsg, { position: "top-center" });
        return;
      }

      sessionStorage.setItem("activeCartCoupon", gemstoneCode);
      setAppliedCoupons((prev) => [
        ...prev.filter((c) => c.code.toUpperCase() !== gemstoneCode),
        {
          code: gemstoneCode,
          type: "gemstone_discount",
          title: "Festive Gemstone Discount",
        },
      ]);
      setPromoCode(gemstoneCode);
      setCouponInput("");
      setCouponError("");
      toast.success(
        `Coupon ${gemstoneCode} applied! Festive gemstone discount applied.`,
        { position: "top-center" }
      );
      return;
    }

    // 2. Jewellery / Silver Offer Coupon (FESTIVAL)
    if (rawCode === jewelleryCode) {
      if (appliedCoupons.some((c) => c.code.toUpperCase() === jewelleryCode)) {
        toast.info(`Coupon ${jewelleryCode} is already applied.`, { position: "top-center" });
        setCouponInput("");
        return;
      }

      const currentSubtotal = rawSubtotal || calculateCartSubtotal();
      if (bagMinTotal > 0 && currentSubtotal < bagMinTotal) {
        const remaining = bagMinTotal - currentSubtotal;
        const errorMsg = `Coupon ${jewelleryCode} requires a minimum cart total of ₹${bagMinTotal.toLocaleString("en-IN")}. Add ₹${remaining.toLocaleString("en-IN")} more to unlock ₹${bagDiscountAmt.toLocaleString("en-IN")} OFF on your Silver Ring!`;
        setCouponError(errorMsg);
        toast.error(errorMsg, { position: "top-center" });
        return;
      }

      const eligibleItem = getChosenSilverRing() || (cartData || []).find((ci) => {
        if (ci.itemType === "Jewelry") {
          const metal = String(ci.customization?.metal || ci.item?.metal || "").toLowerCase();
          const name = String(ci.item?.jewelryName || ci.item?.name || "").toLowerCase();
          return isJewelleryMetalApplicable(metal) || isJewelleryMetalApplicable(name);
        }
        return false;
      });

      if (!eligibleItem) {
        const infoMsg = `Your cart qualifies! Please choose a silver ring or setting to get ₹${bagDiscountAmt.toLocaleString("en-IN")} OFF.`;
        setCouponError(infoMsg);
        toast.info(infoMsg, { position: "top-center" });
        handleChooseSilverRing();
        return;
      }

      const discountAmt = Math.min(
        Number(eligibleItem.customization?.originalPrice || eligibleItem.totalPrice || eligibleItem.item?.jewelryPrice || bagDiscountAmt),
        bagDiscountAmt
      );

      setAppliedCoupons((prev) => [
        ...prev.filter((c) => c.code.toUpperCase() !== jewelleryCode),
        {
          code: jewelleryCode,
          type: "chosen_ring_discount",
          discountAmount: discountAmt,
          ringId: eligibleItem._id,
          ringName: eligibleItem.item?.jewelryName || eligibleItem.item?.name || "Silver Jewellery",
        },
      ]);
      setPromoCode(jewelleryCode);
      setCouponInput("");
      setCouponError("");
      toast.success(
        `Coupon ${jewelleryCode} applied! ₹${discountAmt.toLocaleString("en-IN")} discount applied to your Silver Jewellery.`,
        { position: "top-center" }
      );
      return;
    }

    setCouponError("Invalid coupon code.");
    toast.error("Invalid coupon code.", { position: "top-center" });
  };

  const handleRemoveCoupon = (codeToRemove) => {
    const targetCode = String(codeToRemove || "").toUpperCase();
    const gemstoneCode = String(CAMPAIGN_CONFIG.gemstoneOffer?.code || "DHANTERAS15").toUpperCase();
    if (targetCode === gemstoneCode) {
      sessionStorage.removeItem("activeCartCoupon");
    }
    setAppliedCoupons((prev) => prev.filter((c) => c.code.toUpperCase() !== targetCode));
    setCouponError("");
    toast.info(`Coupon ${targetCode} removed.`, { position: "top-center" });
  };

  // Keep applied coupons valid if cart items change
  useEffect(() => {
    setAppliedCoupons((prev) => {
      const gemCode = String(CAMPAIGN_CONFIG.gemstoneOffer?.code || "DHANTERAS15").toUpperCase();
      const jewCode = String(CAMPAIGN_CONFIG.jewelleryOffer?.code || CAMPAIGN_CONFIG.silverOffer?.code || "FESTIVAL").toUpperCase();
      return prev.filter((c) => {
        if (c.code.toUpperCase() === gemCode) {
          return (cartData || []).some((ci) => ci.itemType === "Product" && isGemstoneApplicable(ci.item));
        }
        if (c.code.toUpperCase() === jewCode) {
          const currentTotal = (cartData || []).reduce((sum, ci) => sum + (Number(ci.totalPrice) || 0), 0);
          if (bagMinTotal > 0 && currentTotal < bagMinTotal) {
            return false;
          }
          return Boolean(getChosenSilverRing(cartData) || (cartData || []).some((ci) => {
            if (ci.itemType === "Jewelry") {
              const metal = String(ci.customization?.metal || ci.item?.metal || "").toLowerCase();
              const name = String(ci.item?.jewelryName || ci.item?.name || "").toLowerCase();
              return isJewelleryMetalApplicable(metal) || isJewelleryMetalApplicable(name);
            }
            return false;
          }));
        }
        return true;
      });
    });
  }, [cartData]);

  const getMetalWeight = (item) => {
    if (!item) return null;
    const w = item.jewelryMetalWeight;
    if (w == null || w === "") return null;
    if (typeof w === "object") return w.weight || null;
    return w;
  };

  const formatMetalName = (customization, item) => {
    const karat = customization?.goldKarat?.karatType;
    if (karat) {
      const k = String(karat).toLowerCase();
      if (k === "gold24k") return "24K Gold";
      if (k === "gold22k") return "22K Gold";
      if (k === "gold18k") return "18K Gold";
      if (k === "gold14k") return "14K Gold";
      return karat;
    }
    const m = String(customization?.metal || item?.metal || "").trim().toLowerCase();
    if (m === "gold") return "Gold";
    if (m === "silver") return "Silver";
    if (m === "platinum") return "Platinum";
    if (["panchdhatu", "pachadhatu", "panchadhatu"].includes(m)) return "Panchadhatu";
    if (!m) return null;
    return m.charAt(0).toUpperCase() + m.slice(1);
  };

  const isRingItem = (item) => {
    if (!item) return false;
    const type = String(item.jewelryType || "").toLowerCase();
    const name = String(item.jewelryName || item.name || "").toLowerCase();
    return type === "ring" || name.includes("ring") || name.includes("signet") || name.includes("band");
  };

  const formatSizeDisplay = (customization, item, isRing) => {
    const sizeNum =
      customization?.sizeSystem?.sizeNumber ||
      customization?.size?.size ||
      customization?.size?.sizeNumber ||
      customization?.sizeNumber;
    const sizeType =
      customization?.sizeSystem?.sizeType ||
      customization?.size?.sizeType;

    if (sizeNum && typeof sizeNum === "string" && sizeNum.toLowerCase().includes("ring sizer")) {
      return "Send me a ring sizer";
    }

    if (sizeNum && sizeNum !== "NA") {
      if (sizeType && sizeType !== "Ring Size" && sizeType !== "Standard" && sizeType !== "Ring Sizer") {
        return `${sizeNum} (${sizeType})`;
      }
      return String(sizeNum);
    }

    if (isRing) {
      return "Send me a ring sizer";
    }

    return null;
  };
  // --- UPSELL LOGIC ---
  useEffect(() => {
    let mounted = true;
    const buildSkusFromCart = (cart) => {
      if (!Array.isArray(cart) || cart.length === 0) return [];
      return { id: cart[0].item?._id };
    };
    const fetchUpsellForSkus = async (skus) => {
      if (!mounted) return;
      if (!skus || skus.length === 0) {
        if (mounted) {
          setProducts([]);
          setUpsellLoading(false);
        }
        return;
      }

      try {
        if (mounted) setUpsellLoading(true);
        const res = await axios.get(
          `${URL}/product/upselling-product-list/${skus.id}`,
          { withCredentials: true },
        );
        let data = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (Array.isArray(res.data?.products)) data = res.data.products;
        else if (Array.isArray(res.data?.data)) data = res.data.data;
        else if (res.data && typeof res.data === "object" && res.data._id)
          data = [res.data];

        if (mounted) setProducts(data);
      } catch (err) {
        console.error("Upsell fetch error:", err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setUpsellLoading(false);
      }
    };

    (async () => {
      const skus = buildSkusFromCart(cartData);
      if (!skus || !skus.id) {
        if (mounted) setUpsellLoading(false);
        return;
      }
      await fetchUpsellForSkus(skus);
    })();

    return () => {
      mounted = false;
    };
  }, [URL, cartData]);

  const initialCartCount = cartData?.length || 1;

  // --- FETCH CART ITEMS ---
  const fetchCartItems = async () => {
    const userInfoString = localStorage.getItem("userInfo");
    let userToken = null;

    if (userInfoString) {
      try {
        userToken = JSON.parse(userInfoString).token;
      } catch (e) {
        console.error("Failed to parse userInfo", e);
      }
    }

    try {
      setLoading(true);
      setError(null);

      const headers = { "Content-Type": "application/json" };
      if (userToken) headers.Authorization = `Bearer ${userToken}`;

      const response = await axios.get(
        `${URL}/cart/get_all_cart_list?page=1&limit=10`,
        { headers, withCredentials: true }
      );

      if (response.data?.success && response.data?.cart) {
        // Normalize promotional pricing for gemstones & jewellery
        const normalizedCart = response.data.cart.map((ci) => {
          if (
            isCampaignActive() &&
            CAMPAIGN_CONFIG.gemstoneOffer.enabled &&
            ci.itemType === "Product"
          ) {
            const rawCustom = ci.customization || {};
            const isStoneApplicable = isGemstoneApplicable(ci.item);
            if (!isStoneApplicable) {
              return ci;
            }
            const rawCode = String(rawCustom.appliedCoupon || "").toUpperCase();
            const stoneBasePrice = Number(rawCustom.originalPrice || getProductDisplayPrice(ci.item) || 0);
            const certPrice = Number(rawCustom.certificate?.price || 0);
            const qty = Number(ci.quantity || 1);

            const activeStoredCoupon = sessionStorage.getItem("activeCartCoupon");
            const isCouponMatched =
              rawCode === CAMPAIGN_CONFIG.gemstoneOffer.code.toUpperCase() ||
              (activeStoredCoupon && activeStoredCoupon.toUpperCase() === CAMPAIGN_CONFIG.gemstoneOffer.code.toUpperCase()) ||
              (promoCode && promoCode.toUpperCase() === CAMPAIGN_CONFIG.gemstoneOffer.code.toUpperCase());
            const isEligible = isCouponMatched && stoneBasePrice >= CAMPAIGN_CONFIG.gemstoneOffer.minGemstonePrice;

            if (isEligible || rawCustom.discountedPrice != null) {
              const stonePct = getGemstoneDiscountPercent(ci.item);
              const appliedPct = rawCustom.discountPercent || stonePct;
              const discountAmt = rawCustom.discountAmount != null && rawCustom.appliedCoupon
                ? Number(rawCustom.discountAmount)
                : Math.round((stoneBasePrice * appliedPct) / 100);
              const discountedStonePrice = stoneBasePrice - discountAmt;
              const expectedLineTotal = (discountedStonePrice + certPrice) * qty;

              return {
                ...ci,
                totalPrice: expectedLineTotal,
                customization: {
                  ...rawCustom,
                  appliedCoupon: CAMPAIGN_CONFIG.gemstoneOffer.code,
                  originalPrice: stoneBasePrice,
                  discountedPrice: discountedStonePrice,
                  discountAmount: discountAmt,
                  discountPercent: rawCustom.discountPercent || getGemstoneDiscountPercent(ci.item),
                },
              };
            } else if (isCampaignActive()) {
              const expectedLineTotal = (stoneBasePrice + certPrice) * qty;
              return {
                ...ci,
                totalPrice: expectedLineTotal,
                customization: {
                  ...rawCustom,
                  originalPrice: stoneBasePrice,
                },
              };
            }
          }

          if (
            isCampaignActive() &&
            (CAMPAIGN_CONFIG.jewelleryOffer?.enabled || CAMPAIGN_CONFIG.silverOffer?.enabled || CAMPAIGN_CONFIG.bagOffer?.enabled) &&
            ci.itemType === "Jewelry"
          ) {
            const rawCustom = ci.customization || {};
            const metal = String(rawCustom.metal || ci.item?.metal || "").toLowerCase();
            const name = String(ci.item?.jewelryName || "").toLowerCase();
            const isEligibleMetal = isJewelleryMetalApplicable(metal) || isJewelleryMetalApplicable(name);
            if (isEligibleMetal) {
              const rawCode = String(rawCustom.appliedCoupon || "").toUpperCase();
              const offerCode = jewelleryCode;
              const isCouponMatched = rawCode === offerCode;
              if (isCouponMatched || rawCustom.discountedPrice != null) {
                const jBasePrice = Number(rawCustom.originalPrice || ci.item?.jewelryPrice || ci.totalPrice || 0);
                const discountAmt = rawCustom.discountAmount != null
                  ? Number(rawCustom.discountAmount)
                  : Math.min(jBasePrice, bagDiscountAmt);
                const discountedPrice = Math.max(0, jBasePrice - discountAmt);
                return {
                  ...ci,
                  totalPrice: discountedPrice,
                  customization: {
                    ...rawCustom,
                    appliedCoupon: jewelleryCode,
                    originalPrice: jBasePrice,
                    discountedPrice,
                    discountAmount: discountAmt,
                  },
                };
              }
            }
          }

          return ci;
        });

        // Sync backend in background if prices differed
        normalizedCart.forEach((ci) => {
          const originalFromBackend = response.data.cart.find((o) => o._id === ci._id);
          if (originalFromBackend && originalFromBackend.totalPrice !== ci.totalPrice && ci.customization?.appliedCoupon) {
            axios.post(
              `${URL}/cart/add_item_in_cart`,
              {
                itemId: ci.item?._id || ci.item,
                quantity: ci.quantity,
                customization: ci.customization,
              },
              { headers, withCredentials: true }
            ).catch(() => {});
          }
        });

        // Auto-apply coupons if already applied on product page or in session
        if (isCampaignActive() && CAMPAIGN_CONFIG.gemstoneOffer.enabled) {
          const gemCode = CAMPAIGN_CONFIG.gemstoneOffer.code.toUpperCase();
          const hasEligibleGem = normalizedCart.some(
            (ci) => ci.itemType === "Product" && isGemstoneApplicable(ci.item)
          );
          const hasGemCouponApplied =
            normalizedCart.some(
              (ci) =>
                ci.itemType === "Product" &&
                String(ci.customization?.appliedCoupon || "").toUpperCase() === gemCode
            ) ||
            (sessionStorage.getItem("activeCartCoupon") &&
              sessionStorage.getItem("activeCartCoupon").toUpperCase() === gemCode);

          if (hasEligibleGem && hasGemCouponApplied) {
            setAppliedCoupons((prev) => {
              if (prev.some((c) => c.code.toUpperCase() === gemCode)) return prev;
              return [
                ...prev,
                {
                  code: CAMPAIGN_CONFIG.gemstoneOffer.code,
                  type: "gemstone_discount",
                  title: "Festive Gemstone Discount",
                },
              ];
            });
            sessionStorage.setItem("activeCartCoupon", CAMPAIGN_CONFIG.gemstoneOffer.code);
          }
        }

        const jewCode = String(CAMPAIGN_CONFIG.jewelleryOffer?.code || CAMPAIGN_CONFIG.silverOffer?.code || "FESTIVAL").toUpperCase();
        const hasJewelleryCouponApplied = normalizedCart.some(
          (ci) =>
            ci.itemType === "Jewelry" &&
            String(ci.customization?.appliedCoupon || "").toUpperCase() === jewCode
        );
        if (hasJewelleryCouponApplied) {
          const eligibleJ = getChosenSilverRing(normalizedCart) || normalizedCart.find((ci) => ci.itemType === "Jewelry");
          setAppliedCoupons((prev) => {
            if (prev.some((c) => c.code.toUpperCase() === jewCode)) return prev;
            return [
              ...prev,
              {
                code: jewCode,
                type: "chosen_ring_discount",
                title: "Silver Jewellery Offer (₹1,200 OFF)",
                ringId: eligibleJ?._id,
                ringName: eligibleJ?.item?.jewelryName || eligibleJ?.item?.name || "Silver Jewellery",
              },
            ];
          });
        }

        setCartData(normalizedCart);
        dispatch(setCartItems(normalizedCart));

        if (!hasTrackedViewCart.current && normalizedCart.length > 0) {
          hasTrackedViewCart.current = true;

          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ ecommerce: null });
          window.dataLayer.push({
            event: "view_cart",
            ecommerce: {
              currency: "INR",
              value: normalizedCart.reduce(
                (sum, ci) => sum + (Number(ci.totalPrice) || 0),
                0
              ),
              items: response.data.cart.map((ci) => {
                const isJewelry = ci.itemType === "Jewelry";
                const hasJewelryCustomization = !!ci.customization?.jewelryId;
                const name = isJewelry
                  ? ci.item?.jewelryName
                  : hasJewelryCustomization
                  ? ci.customization.jewelryId?.jewelryName
                  : ci.item?.name;
                const qty = Number(ci.quantity) || 1;
                return {
                  item_id: String(ci.item?.sku || ci.item?._id || ci._id || ""), /// add by pawan
                  item_name: name || "Unnamed Item",
                  item_brand: "Gemrishi",
                  item_category: ci.itemType || "",
                  price: qty ? Number((ci.totalPrice / qty).toFixed(2)) : Number(ci.totalPrice) || 0,
                  quantity: qty,
                };
              }),
            },
          });
        }
      } else {
        setCartData([]);
        dispatch(setCartItems([]));
      }
    } catch (err) {
      console.error("Error fetching cart items:", err);
      if (err.response?.status === 401) {
        setError("Please log in to view your cart items.");
      } else if (err.response?.data?.message) {
        setError(`Failed to retrieve cart: ${err.response.data.message}`);
      } else {
        setError("We are facing a temporary connection issue.");
      }
    } finally {
      setLoading(false);
    }
  };
  // --- REMOVE ITEM ---
  const handleRemoveItem = async (cartItemId) => {
    const userInfoString = localStorage.getItem("userInfo");
    let userToken = null;
    if (userInfoString) {
      try {
        userToken = JSON.parse(userInfoString).token;
      } catch (e) { }
    }

    //Add by pawan----------------------------------------------------------------
    const removedItem = cartData.find((ci) => ci._id === cartItemId);
    //Add by pawan----------------------------------------------------------------
    setLoading(true);

    try {
      const headers = {};
      if (userToken) headers.Authorization = `Bearer ${userToken}`;

      await axios.delete(
        `${URL}/cart/remove_item_from_cart?cartItemId=${cartItemId}`,
        { headers, withCredentials: true }
      );
      //Add by pawan-------------------------------------------------------------------------------
      if (removedItem) {
        const isJewelry = removedItem.itemType === "Jewelry";
        const hasJewelryCustomization = !!removedItem.customization?.jewelryId;
        const name = isJewelry
          ? removedItem.item?.jewelryName
          : hasJewelryCustomization
          ? removedItem.customization.jewelryId?.jewelryName
          : removedItem.item?.name;
        const qty = Number(removedItem.quantity) || 1;

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push({
          event: "remove_from_cart",
          ecommerce: {
            currency: "INR",
            value: Number(removedItem.totalPrice) || 0,
            items: [
              {
                item_id: String(removedItem.item?.sku || removedItem.item?._id || removedItem._id || ""), // add by pawan
                item_name: name || "Unnamed Item",
                item_brand: "Gemrishi",
                item_category: removedItem.itemType || "",
                price: qty ? Number((removedItem.totalPrice / qty).toFixed(2)) : Number(removedItem.totalPrice) || 0,
                quantity: qty,
              },
            ],
          },
        });
      }
      //Add by pawan------------------------------------------------------------------------------

      dispatch(removeItemFromCart(cartItemId));
      await fetchCartItems();
    } catch (err) {
      console.error("Error removing item:", err.response?.data || err.message);
      toast.error("Failed to remove item. Please try again.", { position: "top-center" });
      await fetchCartItems();
    }
  };

  // --- PROCEED TO CHECKOUT ---
  const handleProceedToCheckout = () => {
    const userToken = getUserToken();

    if (userToken) {
      // ===== Add by Pawan For Meta Pixel =====
      const checkoutValue = cartData.reduce(
        (total, cartItem) => total + (Number(cartItem.totalPrice) || 0),
        0
      );
      const items = buildItemsFromRawCart(cartData);
      const checkoutEventId = `ic_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem("gemrishi_checkout_event_id", checkoutEventId);
      fbqTrack(
        "InitiateCheckout",
        {
          value: checkoutValue,
          currency: "INR",
          content_type: "product",
          content_ids: cartData.map((c) => c.item?.sku || c.item?._id || c._id),
          contents: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        },
        { eventID: checkoutEventId }
      );

      // GA4 begin_checkout
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: "INR",
          value: checkoutValue,
          items: items.map((it) => ({
            item_id: String(it.id),
            item_name: it.name,
            item_category: it.category,
            price: it.price,
            quantity: it.quantity,
          })),
        },
      });
      // ===== End Add by Pawan For Meta Pixel =====

      navigate("/shipping/address", { state: { productId: location?.state?.productId } });
    } else {
      dispatch(openLoginModal("/shipping/address"));
      window.dispatchEvent(
        new CustomEvent("open-login-modal", { detail: { redirect: "/shipping/address" } })
      );
      toast.info("Please log in to proceed to checkout", { position: "top-center", autoClose: 3000 });
    }
  };

  const handleCreateOrder = async (selectedPaymentMethod, shippingAddress = null) => {
    //-------------------------fix by pawan: start--------------
    if (cartData.length === 0) {
      toast.error("Your cart is empty.", { position: "top-center" });
      return null;
    }

    const userInfoString = localStorage.getItem("userInfo");
    let userToken = null;
    if (userInfoString) {
      try {
        userToken = JSON.parse(userInfoString).token;
      } catch (e) { }
    }
    //----------------fix by pawan: end------------------------

    // ✅ Build order items with exact line-level pricing & customizations
    const orderItems = cartData.map((item) => {
      const pricing = pricingByItemId[item._id] || {};
      const lineTotal = pricing.lineDiscounted != null ? pricing.lineDiscounted : Number(item.totalPrice || 0);
      const qty = Number(item.quantity || 1);
      const unitPrice = qty > 0 ? lineTotal / qty : lineTotal;

      const itemCustomization = { ...(item.customization || {}) };
      if (pricing.appliedCoupon) {
        itemCustomization.appliedCoupon = pricing.appliedCoupon;
        itemCustomization.originalPrice = pricing.basePrice;
        itemCustomization.discountAmount = pricing.itemDiscount;
        itemCustomization.discountPercent = pricing.discountPercent;
        itemCustomization.discountedPrice = Math.max(0, pricing.basePrice - (pricing.itemDiscount / qty));
      }

      return {
        _id: item._id,
        productId: item.itemType === "Product" ? (item.item?._id || item.item || item.productId || location.state?.productId) : (item.customization?.productId?._id || item.customization?.productId || item.productId || undefined),
        jewelryId: item.itemType === "Jewelry" ? (item.item?._id || item.item || item.jewelryId) : (item.customization?.jewelryId?._id || item.customization?.jewelryId || item.jewelryId || undefined),
        quantity: qty,
        itemTotal: lineTotal,
        totalPrice: lineTotal,
        price: unitPrice,
        customization: itemCustomization,
      };
    });

    const couponCodesList = appliedCoupons.map((c) => c.code);
    const orderPayload = {
      paymentMethod: selectedPaymentMethod,
      promoCode: couponCodesList.join(", ") || null,
      couponCode: couponCodesList.join(", ") || null,
      appliedCoupon: appliedCoupons[0] || null,
      appliedCoupons: appliedCoupons,
      totalAmount: finalEstimatedTotal,
      subtotal: rawSubtotal,
      discountAmount: totalDiscount,
      hasComplimentaryGift: isGiftAutoAdded,
      items: orderItems,
      attribution: getAttributionData(),
      address: shippingAddress || undefined,
      metaContext: getCheckoutMetaContext(),
    };

    try {
      //------------------------fix by pawan: start---------------------
      const headers = {
        "Content-Type": "application/json",
      };
      if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
      }
      //------------------------fix by pawan: end-----------------------

      const response = await axios.post(
        `${URL}/order/create-order`,
        orderPayload,
        {
          withCredentials: true,
          headers,
        }
      );

      if (response.data?.order) {
        sessionStorage.removeItem("shippingDetails");
        //----------------fix by pawan: start---------------------------
        if (selectedPaymentMethod === "cod") {
          toast.success("Order created successfully!");
        }
        //----------------fix by pawan: end-----------------------------
        return response.data;
      } else {
        toast.error(
          response.data.message ||
          response.data.msg ||
          "Failed to create order. Please try again."
        );
        return null;
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

  const normalizeAddressField = (value) => {
    if (Array.isArray(value)) {
      return value.join(" ").trim();
    }
    if (value == null) {
      return "";
    }
    return String(value).trim();
  };

  // --- CASHFREE 360 ONE-CLICK CHECKOUT ---
  // -------------------- Add By Pawan For Buy Now (START) --------------------
  // skipPhonePrompt === true -> don't ask for phone on our page, let Cashfree page collect it
  const handleCashfreeOneClickCheckout = async (explicitPhone = null, skipPhonePrompt = false) => {
  // -------------------- Add By Pawan For Buy Now (END) --------------------
    if (cartData.length === 0) {
      toast.error("Your cart is empty.", { position: "top-center" });
      return;
    }

    // Check for existing phone number
    let storedShipping = null;
    try {
      storedShipping = JSON.parse(localStorage.getItem("shippingDetails") || "null");
    } catch (e) {
      storedShipping = null;
    }
    const rawUserInfo = localStorage.getItem("userInfo");
    let userInfoObj = {};
    try {
      userInfoObj = JSON.parse(rawUserInfo || "{}");
    } catch (e) {}

    const knownPhone =
      explicitPhone ||
      userInfo?.mobileNo ||
      userInfo?.phone ||
      userInfo?.user?.mobileNo ||
      userInfo?.user?.phone ||
      userInfoObj?.mobileNo ||
      userInfoObj?.phone ||
      userInfoObj?.user?.mobileNo ||
      userInfoObj?.user?.phone ||
      storedShipping?.address?.mobileNo ||
      localStorage.getItem("customerPhone");

    const cleanPhone = String(knownPhone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      // -------------------- Add By Pawan For Buy Now (START) --------------------
      if (skipPhonePrompt !== true) {
        setShowPhonePrompt(true);
        return;
      }
      // Buy Now: continue without phone, Cashfree checkout page will ask for it
      // -------------------- Add By Pawan For Buy Now (END) --------------------
    }

    if (isCashfreeLoading) return;
    setIsCashfreeLoading(true);

    try {
      const savedAddress =
        storedShipping?.address ||
        (Array.isArray(userInfoObj?.address) ? userInfoObj.address[0] : userInfoObj?.address) ||
        (Array.isArray(userInfoObj?.user?.address) ? userInfoObj.user.address[0] : userInfoObj?.user?.address) ||
        {};

      // -------------------- Add By Pawan For Buy Now (START) --------------------
      const hasValidPhone = cleanPhone.length >= 10;
      const addressWithPhone = hasValidPhone
        ? { ...savedAddress, mobileNo: cleanPhone.slice(-10) }
        : Object.keys(savedAddress).length > 0
          ? savedAddress
          : null; // no phone/address yet -> Cashfree page will collect them
      // -------------------- Add By Pawan For Buy Now (END) --------------------

      // 1. Create order on backend with Cashfree OCC
      const orderResult = await handleCreateOrder("cashfree", addressWithPhone);
      if (!orderResult?.order || !orderResult?.paymentSessionId) {
        setIsCashfreeLoading(false);
        return;
      }

      const { order, paymentSessionId, cashfreeEnvironment } = orderResult;

      // 2. Initialize Cashfree JS SDK
      const cashfree = await getCashfree(cashfreeEnvironment);

      // 3. Launch Cashfree 360 Checkout Modal
      const checkoutOptions = {
        paymentSessionId,
        redirectTarget: "_modal",
      };

      const response = await cashfree.checkout(checkoutOptions);

      if (response?.error) {
        console.warn("Cashfree checkout notice:", response.error);
        if (
          response.error.message &&
          response.error.message !== "User closed the modal"
        ) {
          toast.error(response.error.message || "Payment cancelled or failed.");
        }

        // Notify backend of modal drop-off / abandonment immediately
        try {
          const backendBase = URL ? URL.replace(/\/api\/v1\/?$/, "") : "http://localhost:7788";
          await axios.post(`${backendBase}/api/v1/cashfree/track-abandoned`, {
            orderId: order.orderId,
            reason: response.error?.message || "User closed checkout modal",
          });
        } catch (abandonErr) {
          console.warn("Could not post track-abandoned:", abandonErr.message);
        }

        setIsCashfreeLoading(false);
        return;
      }

      if (response?.paymentDetails) {
        toast.success("Payment completed successfully!");
        const purchaseKey = `tracked_purchase_${order.orderId}`;
        if (!sessionStorage.getItem(purchaseKey)) {
          sessionStorage.setItem(purchaseKey, "1");
          trackPurchaseEvent({
            orderId: order.orderId,
            subtotal: order.totalAmount,
            coupon: promoCode || "",
            currency: "INR",
            items: buildItemsFromRawCart(cartData),
          });
        }
        dispatch(setCartItems([]));

        // Immediately verify with backend to fetch updated address & completed status
        let verifiedOrder = null;
        try {
          const backendBase = URL ? URL.replace(/\/api\/v1\/?$/, "") : "http://localhost:7788";
          const verifyRes = await axios.get(
            `${backendBase}/api/v1/cashfree/verify-order/${order.orderId}`
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

      // Check backend status in case modal closed after redirect
      try {
        const backendBase = URL ? URL.replace(/\/api\/v1\/?$/, "") : "http://localhost:7788";
        const verifyRes = await axios.get(
          `${backendBase}/api/v1/cashfree/verify-order/${order.orderId}`
        );
        if (verifyRes.data?.paymentStatus === "Completed") {
          toast.success("Payment verified successfully!");
          dispatch(setCartItems([]));
          const verifiedOrder = verifyRes.data.order || order;
          navigate(`/thank-you?order_id=${order.orderId}`, { replace: true, state: { order: verifiedOrder } });
          return;
        }
      } catch (vErr) {
        console.warn("Status verify check notice:", vErr);
      }
    } catch (err) {
      console.error("1-Click Checkout Error:", err);
      toast.error(err?.response?.data?.msg || err?.message || "Checkout failed. Please try again.");
    } finally {
      setIsCashfreeLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [userInfo]);

  // -------------------- Add By Pawan For Buy Now (START) --------------------
  // Buy Now: detail pages navigate here with state { autoCashfree: true }.
  // Once the cart is loaded, open the Cashfree checkout automatically (only once).
  const autoCashfreeTriggeredRef = useRef(false);
  useEffect(() => {
    if (!location.state?.autoCashfree) return;
    if (autoCashfreeTriggeredRef.current) return;
    if (loading || cartData.length === 0) return;

    autoCashfreeTriggeredRef.current = true;
    // clear the flag so a refresh / back navigation doesn't re-open payment
    navigate(location.pathname, { replace: true, state: {} });
    handleCashfreeOneClickCheckout(null, true); // true = skip our phone popup, Cashfree asks for phone
  }, [loading, cartData, location.state]);
  // -------------------- Add By Pawan For Buy Now (END) --------------------


  // --- ERROR DISPLAY ---
  if (error && !loading) {
    const isAuthError = error.includes("log in") || error.includes("Authentication");
    return (
      <div className="w-full h-[80vh] flex flex-col justify-center items-center px-4 bg-gray-50">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-200 max-w-md text-center">
          <svg className="w-12 h-12 text-[#264A3F] mb-6 mx-auto opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-900 mb-3 text-xl sm:text-2xl font-serif">{isAuthError ? "Access Denied" : "Something Went Wrong"}</p>
          <p className="text-gray-500 mb-8 text-[14px] sm:text-[15px]">{error}</p>
          <button onClick={() => fetchCartItems()} className="px-8 py-3 bg-[#264A3F] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#1a3329] transition-colors w-full sm:w-auto">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- EMPTY CART ---
  if (!loading && (!cartData || cartData.length === 0)) {
    return (
      <div className="w-full h-[80vh] flex flex-col justify-center items-center px-4 bg-gray-50">
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center max-w-lg text-center">
          <svg className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-gray-900 text-xl sm:text-2xl font-serif mb-2 sm:mb-3">Your Cart is Empty</p>
          <p className="text-gray-500 text-[14px] sm:text-[15px] mb-8">Discover our exquisite collections and find your next treasure.</p>
          <button onClick={() => navigate("/")} className="px-8 sm:px-10 py-3.5 bg-[#264A3F] text-white rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#1a3329] transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto">
            Explore Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen py-6 sm:py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation & Header */}
        <div className="mb-6 sm:mb-10">
          <button
            className="text-[12px] sm:text-[13px] uppercase tracking-wider text-gray-500 hover:text-[#264A3F] transition-colors flex items-center gap-2 font-medium mb-4 sm:mb-6"
            onClick={() => navigate(-1)}
          >
            <span>&larr;</span> Continue Shopping
          </button>
          <div className="flex items-end justify-between border-b border-gray-200 pb-4 sm:pb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gray-900">
              Shopping Cart
            </h1>
            <span className="text-gray-500 text-sm sm:text-lg mb-1">
              {loading ? "..." : cartData.length} {cartData.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>

        {/* Campaign Bag Special Jewellery Offer Banner */}
        {isCampaignActive() && (CAMPAIGN_CONFIG.jewelleryOffer?.enabled || CAMPAIGN_CONFIG.silverOffer?.enabled || CAMPAIGN_CONFIG.bagOffer?.enabled) && (
          <div className="mb-6 sm:mb-8 rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-[#173228] via-[#214436] to-[#122820] text-white p-4 sm:p-6 shadow-md border border-amber-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0 text-amber-300 shadow-inner">
                  <Gift className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30">
                       Festive Silver Ring Offer
                    </span>
                    <span className="text-[11px] sm:text-xs text-amber-200/90 font-medium">
                      ₹{bagDiscountAmt.toLocaleString("en-IN")} OFF on Orders ≥ ₹{bagMinTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-serif text-white font-medium">
                    {CAMPAIGN_CONFIG.bagOffer?.ringDiscountTitle || CAMPAIGN_CONFIG.jewelleryOffer?.title || `Festive Offer • ₹${bagDiscountAmt.toLocaleString("en-IN")} OFF on Silver Ring`}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-200 mt-0.5">
                    {(rawSubtotal || calculateCartSubtotal()) < bagMinTotal ? (
                      `Add ₹${(bagMinTotal - (rawSubtotal || calculateCartSubtotal())).toLocaleString("en-IN")} more to unlock ₹${bagDiscountAmt.toLocaleString("en-IN")} OFF on your Silver Ring! Apply coupon ${jewelleryCode}.`
                    ) : (
                      `Unlocked! Apply coupon ${jewelleryCode} to get ₹${bagDiscountAmt.toLocaleString("en-IN")} OFF on your Silver Ring!`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleChooseSilverRing}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-amber-400/60 text-amber-300 hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm min-h-[44px]"
                >
                   Choose Ring / Setting
                </button>

                {isJewelleryCouponApplied ? (
                  <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-4 py-2.5 rounded-full text-emerald-200 text-xs sm:text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{jewelleryCode} Applied (₹{jewelleryDiscountTotal || bagDiscountAmt} OFF)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(jewelleryCode)}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-950 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                  >
                    <Gift className="w-4 h-4" /> Apply {jewelleryCode}
                  </button>
                )}

                <Link
                  to="/offers"
                  className="text-center text-xs text-amber-300 hover:text-white underline underline-offset-2 py-1 px-2 transition-colors"
                >
                  Offer T&C
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Cart Content */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">

          {/* Left: Item List */}
          <div className="w-full lg:w-2/3 space-y-4 sm:space-y-6">
            {isGiftAutoAdded && (
              <div className="relative w-full bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 rounded-[20px] sm:rounded-[24px] border-2 border-emerald-500/50 shadow-sm p-4 sm:p-6 flex gap-3 sm:gap-6 hover:shadow-md transition-all duration-300">
                {/* Gift Image */}
                <div className="w-[85px] h-[85px] sm:w-[130px] sm:h-[130px] rounded-[12px] sm:rounded-[16px] bg-white flex items-center justify-center p-2 flex-shrink-0 border border-emerald-200 shadow-sm relative overflow-hidden group select-none">
                  <img
                    src={CAMPAIGN_CONFIG.bagOffer.giftImageUrl || RingSvg}
                    alt={CAMPAIGN_CONFIG.bagOffer.giftName}
                    className="w-full h-full object-cover rounded-lg filter drop-shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = RingSvg;
                    }}
                  />
                  <span className="absolute top-1.5 left-1.5 bg-emerald-700 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider shadow-sm select-none z-10">
                    FREE GIFT
                  </span>
                </div>

                {/* Details Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Complimentary Festive Gift
                          </span>
                          {CAMPAIGN_CONFIG.bagOffer.giftMetal && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              {CAMPAIGN_CONFIG.bagOffer.giftMetal}
                            </span>
                          )}
                        </div>
                        <h2 className="text-[16px] sm:text-[22px] font-serif text-gray-900 leading-snug">
                          {CAMPAIGN_CONFIG.bagOffer.giftName}
                        </h2>
                      </div>
                      <button
                        onClick={handleRemoveGift}
                        className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove gift"
                        aria-label="Remove gift"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1">
                      <p className="text-[11px] sm:text-[13px] text-gray-600">
                        {CAMPAIGN_CONFIG.bagOffer.giftDescription}
                      </p>
                      <p className="text-[11px] sm:text-[13px] text-gray-600">
                        Valuation: <span className="font-medium text-gray-800">₹{CAMPAIGN_CONFIG.bagOffer.giftValue.toLocaleString("en-IN")}</span> • Included Free on orders ≥ ₹{CAMPAIGN_CONFIG.bagOffer.minBagTotal.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] sm:text-[13px] text-emerald-700 font-medium">
                        ✓ Vedic Energization (Pooja) & Insured Delivery Included
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm text-gray-400 line-through">₹{CAMPAIGN_CONFIG.bagOffer.giftValue.toLocaleString("en-IN")}</span>
                      <span className="text-base sm:text-xl font-bold text-emerald-700">FREE</span>
                      <span className="text-[11px] text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-md font-medium">
                        Saved ₹{CAMPAIGN_CONFIG.bagOffer.giftValue.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {loading ? Array.from({ length: initialCartCount }).map((_, index) => <CartItemSkeleton key={index} />)
              : cartData?.map((cartItem) => {
                const certificateType = cartItem.customization?.certificate?.certificateType;
                const isJewelry = cartItem.itemType === "Jewelry";
                const isProduct = cartItem.itemType === "Product";
                const jewelryObj = cartItem.customization?.jewelryId;
                const attachedGemstone = cartItem.customization?.productId;
                const hasJewelryCustomization = isProduct && !!jewelryObj;
                const hasGemstoneCustomization = isJewelry && !!attachedGemstone;
                const isBundle = hasJewelryCustomization || hasGemstoneCustomization;

                const gemstoneEntity = isProduct ? cartItem.item : (hasGemstoneCustomization ? attachedGemstone : null);
                const jewelryEntity = isJewelry ? cartItem.item : (hasJewelryCustomization ? jewelryObj : null);

                const getEntityImage = (entity, fallback = null) => {
                  if (!entity || !entity.images || !entity.images.length) return fallback;
                  const first = entity.images[0];
                  if (typeof first === "string") return first;
                  return first?.url || fallback;
                };

                const gemstoneImg = getEntityImage(gemstoneEntity, BlueSapphire);
                const jewelryImg = getEntityImage(jewelryEntity, null);
                const showBothImages = isBundle && !!gemstoneImg && !!jewelryImg;

                let itemName = "Unnamed Item";
                if (isBundle && gemstoneEntity?.name && jewelryEntity?.jewelryName) {
                  itemName = `${gemstoneEntity.name} with ${jewelryEntity.jewelryName}`;
                } else if (isJewelry) {
                  itemName = cartItem.item?.jewelryName || "Jewelry Item";
                } else if (isProduct) {
                  itemName = cartItem.item?.name || "Gemstone Item";
                }

                const gemstoneUrl = gemstoneEntity ? getProductUrl(gemstoneEntity) : "";
                const jewelryUrl = jewelryEntity ? getProductUrl(jewelryEntity) : "";

                const isLooseGemstone = isProduct && !isBundle;
                const totalJewelryInCart = (cartData || []).filter(
                  (ci) => ci.itemType === "Jewelry" || ci.customization?.jewelryId
                ).length;
                const totalLooseGemstones = (cartData || []).filter(
                  (ci) => ci.itemType === "Product" && !ci.customization?.jewelryId
                ).length;
                const shouldShowJewelryPrompt = isLooseGemstone && totalJewelryInCart < totalLooseGemstones;

                return (
                  <div key={cartItem._id} className="w-full flex flex-col space-y-2.5">
                    <div className="relative w-full bg-white rounded-[20px] sm:rounded-[24px] border border-gray-200 shadow-sm p-4 sm:p-6 flex gap-3 sm:gap-6 hover:shadow-md transition-all duration-300">

                    {/* Image Container: Both images if customized gemstone + jewelry, else single */}
                    {showBothImages ? (
                      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
                        {/* Gemstone Image */}
                        <div
                          onClick={() => gemstoneUrl && navigate(gemstoneUrl)}
                          title={`View Gemstone: ${gemstoneEntity?.name || "Gemstone"}`}
                          className="relative w-[58px] h-[58px] sm:w-[95px] sm:h-[95px] rounded-[10px] sm:rounded-[14px] bg-gray-50 flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0 border border-gray-100 shadow-xs cursor-pointer hover:border-[#264A3F]/50 hover:shadow-sm transition-all duration-200 group"
                        >
                          <img
                            src={gemstoneImg}
                            alt={gemstoneEntity?.name || "Gemstone"}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                          />
                          <span className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-black/65 backdrop-blur-xs text-white text-[7px] sm:text-[9px] font-medium leading-none whitespace-nowrap">
                            Gemstone
                          </span>
                        </div>

                        {/* Plus Sign */}
                        <span className="text-gray-400 font-bold text-xs sm:text-base select-none">+</span>

                        {/* Jewelry Image */}
                        <div
                          onClick={() => jewelryUrl && navigate(jewelryUrl)}
                          title={`View Jewelry: ${jewelryEntity?.jewelryName || "Jewelry"}`}
                          className="relative w-[58px] h-[58px] sm:w-[95px] sm:h-[95px] rounded-[10px] sm:rounded-[14px] bg-gray-50 flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0 border border-gray-100 shadow-xs cursor-pointer hover:border-[#264A3F]/50 hover:shadow-sm transition-all duration-200 group"
                        >
                          <img
                            src={jewelryImg}
                            alt={jewelryEntity?.jewelryName || "Jewelry"}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                          />
                          <span className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-[#264A3F] text-white text-[7px] sm:text-[9px] font-medium leading-none whitespace-nowrap">
                            {jewelryEntity?.jewelryType || "Jewelry"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          const targetUrl = isProduct ? gemstoneUrl : jewelryUrl;
                          if (targetUrl) navigate(targetUrl);
                        }}
                        title={`View ${itemName}`}
                        className="w-[85px] h-[85px] sm:w-[140px] sm:h-[140px] rounded-[12px] sm:rounded-[16px] bg-gray-50 flex items-center justify-center p-2 sm:p-3 flex-shrink-0 border border-gray-100 cursor-pointer hover:border-[#264A3F]/50 hover:shadow-sm transition-all duration-200 group"
                      >
                        <img
                          src={isJewelry ? getEntityImage(cartItem.item, BlueSapphire) : gemstoneImg}
                          alt={itemName}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}

                    {/* Details Column */}
                    <div className="flex-1 min-w-0 flex flex-col">

                      {/* Title & Delete button Row */}
                      <div className="flex justify-between items-start gap-2">
                        <h2
                          onClick={() => {
                            const targetUrl = isProduct ? gemstoneUrl : (jewelryUrl || gemstoneUrl);
                            if (targetUrl) navigate(targetUrl);
                          }}
                          title={`View ${itemName}`}
                          className="text-[15px] sm:text-[22px] font-serif text-gray-900 leading-snug line-clamp-2 pr-2 cursor-pointer hover:text-[#264A3F] transition-colors"
                        >
                          {itemName}
                        </h2>
                        <button
                          onClick={() => handleRemoveItem(cartItem._id)}
                          className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>

                      {/* Specs */}
                      <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
                        <p className="text-[11px] sm:text-[13px] text-gray-500">
                          ID: <span className="text-gray-700">{cartItem.item?._id?.slice(-6).toUpperCase()}</span>
                        </p>
                        <p className="text-[11px] sm:text-[13px] text-gray-500">
                          QTY: <span className="text-gray-700">{cartItem.quantity}</span>
                        </p>

                        {/* 1. Bundled Product (Gemstone + Jewelry from either entry point) */}
                        {isBundle && (() => {
                          const weight = getMetalWeight(jewelryEntity);
                          const metal = formatMetalName(cartItem.customization, jewelryEntity);
                          const isRing = isRingItem(jewelryEntity);
                          const sizeDisplay = formatSizeDisplay(cartItem.customization, jewelryEntity, isRing);

                          return (
                            <>
                              <p className="text-[11px] sm:text-[13px] text-gray-500 line-clamp-1">
                                Gemstone:{" "}
                                <span
                                  onClick={() => gemstoneUrl && navigate(gemstoneUrl)}
                                  className="text-gray-700 font-medium cursor-pointer hover:text-[#264A3F] hover:underline"
                                >
                                  {gemstoneEntity?.name}
                                </span>
                              </p>
                              <p className="text-[11px] sm:text-[13px] text-gray-500 line-clamp-1">
                                Jewelry:{" "}
                                <span
                                  onClick={() => jewelryUrl && navigate(jewelryUrl)}
                                  className="text-gray-700 font-medium cursor-pointer hover:text-[#264A3F] hover:underline"
                                >
                                  {jewelryEntity?.jewelryName}
                                </span>
                                {jewelryEntity?.jewelryType && (
                                  <span className="text-gray-400"> ({jewelryEntity.jewelryType})</span>
                                )}
                              </p>
                              {weight != null && weight !== "" && (
                                <p className="text-[11px] sm:text-[13px] text-gray-500">
                                  Weight: <span className="text-gray-700 font-medium">{weight} g</span>
                                </p>
                              )}
                              {metal && (
                                <p className="text-[11px] sm:text-[13px] text-gray-500">
                                  Metal: <span className="text-gray-700 font-medium">{metal}</span>
                                </p>
                              )}
                              {sizeDisplay && (
                                <p className="text-[11px] sm:text-[13px] text-gray-500">
                                  {isRing ? "Ring Size" : "Size"}:{" "}
                                  <span className="text-gray-700 font-medium">{sizeDisplay}</span>
                                </p>
                              )}
                              {cartItem.customization?.gemstoneWeight?.weight != null && (
                                <p className="text-[11px] sm:text-[13px] text-gray-500">
                                  Gemstone:{" "}
                                  <span className="text-gray-700 font-medium">{cartItem.customization.gemstoneWeight.weight} ct</span>
                                </p>
                              )}
                              {cartItem.customization?.quality?.qualityType && (
                                <p className="text-[11px] sm:text-[13px] text-gray-500">
                                  Quality:{" "}
                                  <span className="text-gray-700 font-medium">{cartItem.customization.quality.qualityType}</span>
                                </p>
                              )}
                            </>
                          );
                        })()}

                        {/* 2. Standalone Jewelry (no gemstone attached) */}
                        {isJewelry && !isBundle && (() => {
                          const weight = getMetalWeight(cartItem.item);
                          const metal = formatMetalName(cartItem.customization, cartItem.item);
                          const isRing = isRingItem(cartItem.item);
                          const sizeDisplay = formatSizeDisplay(cartItem.customization, cartItem.item, isRing);

                          return (
                            <>
                              <p className="text-[11px] sm:text-[13px] text-gray-500 line-clamp-1">
                                Jewelry:{" "}
                                <span
                                  onClick={() => jewelryUrl && navigate(jewelryUrl)}
                                  className="text-gray-700 font-medium cursor-pointer hover:text-[#264A3F] hover:underline"
                                >
                                  {cartItem.item?.jewelryName}
                                </span>
                                {cartItem.item?.jewelryType && (
                                  <span className="text-gray-400"> ({cartItem.item.jewelryType})</span>
                                )}
                              </p>
                              {weight != null && weight !== "" && (
                                <p className="text-[11px] sm:text-[13px] text-gray-500">
                                  Weight: <span className="text-gray-700 font-medium">{weight} g</span>
                                </p>
                              )}
                              {metal && (
                                <p className="text-[11px] sm:text-[13px] text-gray-500">
                                  Metal: <span className="text-gray-700 font-medium">{metal}</span>
                                </p>
                              )}
                              {sizeDisplay && (
                                <p className="text-[11px] sm:text-[13px] text-gray-500">
                                  {isRing ? "Ring Size" : "Size"}:{" "}
                                  <span className="text-gray-700 font-medium">{sizeDisplay}</span>
                                </p>
                              )}
                            </>
                          );
                        })()}

                        {/* 3. Standalone Gemstone (no jewelry attached) */}
                        {isProduct && !isBundle && (
                          <p className="text-[11px] sm:text-[13px] text-gray-500 line-clamp-1">
                            Gemstone:{" "}
                            <span
                              onClick={() => gemstoneUrl && navigate(gemstoneUrl)}
                              className="text-gray-700 font-medium cursor-pointer hover:text-[#264A3F] hover:underline"
                            >
                              {cartItem.item?.name}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Certificate Badge */}
                      {certificateType && (
                        <div className="mt-2 inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-[#264A3F]/5 border border-[#264A3F]/20">
                          <p className="text-[#264A3F] text-[9px] sm:text-[11px] uppercase tracking-widest font-bold line-clamp-1">
                            Cert: {certificateType}
                          </p>
                        </div>
                      )}

                      {/* Price (Pushed to bottom) */}
                      <div className="mt-auto pt-3 sm:pt-4">
                        {pricingByItemId[cartItem._id]?.itemDiscount > 0 ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1">
                              {pricingByItemId[cartItem._id].discountPercent > 0
                                ? `${pricingByItemId[cartItem._id].discountPercent}% Discounted`
                                : `₹${pricingByItemId[cartItem._id].itemDiscount.toLocaleString("en-IN")} OFF Applied`}
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs sm:text-sm text-gray-400 line-through">
                                {formatPrice(pricingByItemId[cartItem._id].lineUndiscounted)}
                              </span>
                              <span className="text-[16px] sm:text-[22px] font-bold text-emerald-700 tracking-tight">
                                {pricingByItemId[cartItem._id].lineDiscounted <= 0 ? "FREE" : formatPrice(pricingByItemId[cartItem._id].lineDiscounted)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[16px] sm:text-[22px] font-medium text-gray-900 tracking-tight">
                            {formatPrice(pricingByItemId[cartItem._id]?.lineUndiscounted || cartItem.totalPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Forgot to add Ring / Pendant Prompt Banner */}
                  {shouldShowJewelryPrompt && (
                      <div className="w-full bg-gradient-to-r from-[#F4FAF7] via-[#FAF9F5] to-[#F0F7F4] border border-[#20A079]/35 hover:border-[#20A079]/65 rounded-[18px] sm:rounded-[20px] p-3.5 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs transition-all duration-300">
                        <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#264A3F]/10 flex items-center justify-center flex-shrink-0 text-xl shadow-xs">
                            💍
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-[#264A3F] tracking-wide">
                                Forgot to add a Ring or Pendant?
                              </h4>
                              <span className="px-2 py-0.5 text-[9px] font-bold bg-[#20A079] text-white rounded-full uppercase tracking-wider">
                                Custom Mount
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-relaxed">
                              Mount your <span className="font-semibold text-gray-800">{cartItem.item?.name || "gemstone"}</span> in Pure 925 Silver, Gold (18K/22K), Platinum or Panchdhatu without leaving your cart.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenJewelryModal(cartItem)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#264A3F] hover:bg-[#1b362f] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 flex-shrink-0 cursor-pointer min-h-[44px]"
                        >
                          <span>Select Ring / Pendant</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Right: Order Summary */}
          {!loading && cartData.length > 0 && (
            <div className="w-full lg:w-1/3">
              <div className="lg:sticky lg:top-24 bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 shadow-sm border border-gray-200 flex flex-col">
                <h3 className="text-lg sm:text-xl font-serif text-gray-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">Order Summary</h3>

                {/* Coupon Code Section */}
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#264A3F]" /> Have a Coupon?
                    </label>
                    <Link to="/offers" className="text-[11px] text-[#264A3F] hover:underline font-medium">
                      All Offers
                    </Link>
                  </div>

                  {/* List of currently applied coupons (Supports Multiple Coupons) */}
                  {appliedCoupons.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {appliedCoupons.map((c) => {
                        const isGem = c.code.toUpperCase() === String(CAMPAIGN_CONFIG.gemstoneOffer?.code || "DHANTERAS15").toUpperCase();
                        const isJew = c.code.toUpperCase() === String(CAMPAIGN_CONFIG.jewelleryOffer?.code || CAMPAIGN_CONFIG.silverOffer?.code || "FESTIVAL").toUpperCase();
                        return (
                          <div
                            key={c.code}
                            className={`border rounded-xl p-3 flex items-start justify-between ${
                              isGem ? "bg-emerald-50/80 border-emerald-200" : "bg-amber-50/80 border-amber-200"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <CheckCircle2
                                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                  isGem ? "text-emerald-600" : "text-amber-600"
                                }`}
                              />
                              <div>
                                <p
                                  className={`text-xs font-bold font-mono tracking-wider ${
                                    isGem ? "text-emerald-900" : "text-amber-900"
                                  }`}
                                >
                                  {c.code} APPLIED
                                </p>
                                <p
                                  className={`text-[11px] mt-0.5 ${
                                    isGem ? "text-emerald-700" : "text-amber-800"
                                  }`}
                                >
                                  {isGem
                                    ? `Festive gemstone discount applied! (-${formatPrice(gemstoneDiscountTotal)})`
                                    : isJew
                                    ? `₹${(c.discountAmount || jewelleryDiscountTotal || 1200).toLocaleString("en-IN")} OFF applied on ${c.ringName || "Silver Jewellery"}!`
                                    : `Discount applied (-${formatPrice(c.discountAmount)})`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveCoupon(c.code)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer"
                              title={`Remove ${c.code}`}
                              aria-label={`Remove ${c.code}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Coupon Input Form (Always available to apply additional coupons) */}
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="e.g. DHANTERAS15 or FESTIVAL"
                        className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm font-mono border border-gray-200 rounded-xl uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#264A3F] focus:border-transparent bg-gray-50/50"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="px-4 py-2.5 bg-[#264A3F] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#1a3329] transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="text-[10px] text-gray-400 uppercase font-medium">Quick:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isGemstoneCouponApplied) handleApplyCoupon(CAMPAIGN_CONFIG.gemstoneOffer.code);
                        }}
                        disabled={isGemstoneCouponApplied}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                          isGemstoneCouponApplied
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold"
                            : "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {isGemstoneCouponApplied && "✓ "}
                        {`${CAMPAIGN_CONFIG.gemstoneOffer.code} (15% OFF Gemstones)`}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isJewelleryCouponApplied) handleApplyCoupon(jewelleryCode);
                        }}
                        disabled={isJewelleryCouponApplied}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                          isJewelleryCouponApplied
                            ? "bg-amber-100 text-amber-800 border border-amber-300 font-bold"
                            : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        {isJewelleryCouponApplied && "✓ "}
                        {`${jewelleryCode} (₹${bagDiscountAmt.toLocaleString("en-IN")} OFF Silver Ring)`}
                      </button>
                    </div>

                    {couponError && (
                      <div className="mt-2 text-xs text-red-600 flex items-start gap-1 bg-red-50 p-2 rounded-lg border border-red-200">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{couponError}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-gray-600 mb-2.5 text-[14px] sm:text-[15px]">
                  <span>Subtotal</span>
                  <span>{formatPrice(rawSubtotal)}</span>
                </div>

                {isGiftAutoAdded && (
                  <div className="flex justify-between items-center text-emerald-700 mb-2.5 text-[14px] sm:text-[15px]">
                    <span className="flex items-center gap-1">
                      <Gift className="w-4 h-4 text-emerald-600" />
                      {CAMPAIGN_CONFIG.bagOffer.giftName} (Worth ₹{Number(CAMPAIGN_CONFIG.bagOffer.giftValue).toLocaleString("en-IN")})
                    </span>
                    <span className="font-semibold text-emerald-700">FREE</span>
                  </div>
                )}

                {gemstoneDiscountTotal > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 mb-2.5 text-[14px] sm:text-[15px]">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      {`${CAMPAIGN_CONFIG.gemstoneOffer.code} Gemstone Discount`}
                    </span>
                    <span className="font-semibold">- {formatPrice(gemstoneDiscountTotal)}</span>
                  </div>
                )}

                {jewelleryDiscountTotal > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 mb-2.5 text-[14px] sm:text-[15px]">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      {CAMPAIGN_CONFIG.bagOffer.ringDiscountTitle || `${CAMPAIGN_CONFIG.jewelleryOffer?.code || "FESTIVAL"} Silver Discount`}
                    </span>
                    <span className="font-semibold">- {formatPrice(jewelleryDiscountTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-gray-600 mb-5 sm:mb-6 text-[14px] sm:text-[15px]">
                  <span>Shipping & Insurance</span>
                  <span className="text-[#264A3F] font-medium text-right">Free / Calculated at checkout</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-4 sm:pt-6 mb-6 sm:mb-8">
                  <span className="text-base sm:text-lg text-gray-900 font-medium">Estimated Total</span>
                  <span className="text-xl sm:text-2xl font-serif text-[#264A3F]">
                    {formatPrice(finalEstimatedTotal)}
                  </span>
                </div>
                <button
                  onClick={handleCashfreeOneClickCheckout} disabled={isCashfreeLoading}
                  className="w-full h-[50px] sm:h-[60px] bg-[#264A3F] rounded-full text-[12px] sm:text-[13px] uppercase tracking-[0.15em] text-white font-bold hover:bg-[#1a3329] hover:shadow-lg transition-all duration-300"
                >
                  {isCashfreeLoading ? "Processing..." : "Secure Checkout"}
                </button>

                <div className="mt-4 sm:mt-6 flex justify-center items-center gap-2 sm:gap-3 text-gray-400">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-medium">Encrypted & Secure Payment</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>




      {/* UpSelling Component */}
      <div className="max-w-7xl mx-auto">
        <UpSellingProducts products={products} loading={upsellLoading} />
      </div>

      {/* 1-Click Fast Checkout Mobile Prompt for Guests */}
      {showPhonePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPhonePrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#214436]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">1-Click Checkout</h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter your mobile number to auto-fill your delivery address and verify via OTP
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const clean = guestPhone.replace(/\D/g, "");
                if (clean.length !== 10) {
                  setPhoneError("Please enter a valid 10-digit mobile number");
                  return;
                }
                localStorage.setItem("customerPhone", clean);
                setShowPhonePrompt(false);
                handleCashfreeOneClickCheckout(clean);
              }}
            >
              <div className="mb-4">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestPhone(e.target.value.replace(/\D/g, ""));
                      setPhoneError("");
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#214436] focus:bg-white transition"
                    autoFocus
                  />
                </div>
                {phoneError && <p className="text-xs text-red-600 mt-1.5 font-medium">{phoneError}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-[#214436] text-white rounded-xl font-bold hover:bg-[#1a372c] transition shadow-md"
              >
                Continue to Checkout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for selecting Ring or Pendant Setting directly from cart */}
      <SelectJewelryModal
        isOpen={jewelryModalOpen}
        onClose={() => setJewelryModalOpen(false)}
        gemstoneItem={selectedGemstoneForMount}
        onSuccess={async () => {
          await fetchCartItems();
        }}
      />
    </div>
  );
}

export default ShoppingCart;
