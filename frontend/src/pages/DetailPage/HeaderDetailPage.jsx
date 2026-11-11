"use client";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion"; // ✅ Added for Modal Animation
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"; // Add By Pawan For Buy Now: added useRef
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addItemToCart } from "../../redux/cartSlice";
// Import all assets
import { XMarkIcon } from "@heroicons/react/24/outline"; // ✅ Icon for closing modal
import ReactImageMagnify from "react-image-magnify";
import { useSelector } from "react-redux";
import { getLatestMetalRates } from "../../api/metalRates";
import BraceletIcon from "../../assets/DetailPage/BraceletP.svg";
import Clock from "../../assets/DetailPage/Clock.svg";
import EarringsIcon from "../../assets/DetailPage/earring.svg";
import Energized from "../../assets/DetailPage/Energized.svg";
import NecklaceIcon from "../../assets/DetailPage/necklace.svg";
import Original from "../../assets/DetailPage/Original.svg";
import PendantIcon from "../../assets/DetailPage/PendantP.svg";
import RingIcon from "../../assets/DetailPage/RingP.svg";
import Shipping from "../../assets/DetailPage/Shipping.svg";
import Truck from "../../assets/DetailPage/Truck.svg";
import SharePopup from "../../components/SharePopup";
import WishlistButton from "../../components/wishlistButton";
import {
  CAMPAIGN_CONFIG,
  getGemstoneDiscountPercent,
  getProductDisplayPrice,
  getProductOriginalPrice,
  isCampaignActive,
  isGemstoneApplicable,
  isGemstoneOfferEligible,
} from "../../config/campaignOffers.config.js";
import { CODE_CONFIG } from "../../config/code.config.js";
import { useJewelryByFilter } from "../../hooks/useJewelryByFilter";
import { ConvertFromINR, formatCurrency } from "../../utils/currency";
import { getAbsoluteProductUrl } from "../../utils/productUrl";
// ===== Add by Pawan For Meta Pixel =====
import { fbqTrack } from "../../utils/metaPixel";
import { trackCustomEvent, trackCustomizerChange, trackCertificateInspection } from "../../utils/autoTracking";
// =======================End Add by Pawan For Meta Pixel==========================
// ------------------------add for currency by pawan-------------------------------
// Helper function to extract user token
const getUserToken = () => {
  const userInfoString = localStorage.getItem("userInfo");
  if (userInfoString) {
    try {
      const userInfo = JSON.parse(userInfoString);
      return userInfo.token;
    } catch (e) {
      console.error("Failed to parse userInfo from localStorage", e);
      return null;
    }
  }
  return null;
};

//--------------------- Add By Pawan For Dynamic Delivery (START) --------------------
const CERTIFICATE_DELIVERY_DAYS = [
  { keyword: "free", days: [1 , 1] },
  { keyword: "iigj", days: [3, 6] },
  { keyword: "igi", days: [11, 14] },
  { keyword: "grs", days: [10, 15] },
  { keyword: "ssef", days: [15, 20] },
];
const GEMSTONE_DELIVERY_DAYS = [0, 1];
const DEFAULT_CERTIFICATE_DAYS = [0, 0];
// -----------------------------Add By Pawan-------------------------------------------
const getCertificateDeliveryRange = (productData, selectedCertValue) => {
  const selectedCert = productData?.certificate?.find(
    (cert) => String(cert._id || cert.type || cert) === String(selectedCertValue)
  );

  const certName = String(
    selectedCert?.certificateType ||
      selectedCert?.type ||
      selectedCert?.name ||
      selectedCertValue ||
      ""
  ).toLowerCase();

  let certificateDays = DEFAULT_CERTIFICATE_DAYS;

  if (selectedCert?.deliveryDays) {
    const match = String(selectedCert.deliveryDays).match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      certificateDays = [Number(match[1]), Number(match[2])];
    } else if (Number.isFinite(Number(selectedCert.deliveryDays))) {
      const d = Number(selectedCert.deliveryDays);
      certificateDays = [d, d];
    }
  } else {
    const matched = CERTIFICATE_DELIVERY_DAYS.find((c) =>
      certName.includes(c.keyword)
    );
    if (matched) certificateDays = matched.days;
  }

  return [
    GEMSTONE_DELIVERY_DAYS[0] + certificateDays[0],
    GEMSTONE_DELIVERY_DAYS[1] + certificateDays[1],
  ];
};

// [1, 7] -> "1-7", [5, 5] -> "5"
const formatDaysRange = ([min, max]) => (min === max ? `${min}` : `${min}-${max}`);

// Used by the gemstone-only text (the "Why GemRishi" section)
const getCertificateDeliveryDays = (productData, selectedCertValue) =>
  formatDaysRange(getCertificateDeliveryRange(productData, selectedCertValue));

// Reads the admin jewelry days. Works with 10 or "10-15"
const getJewelryDaysRange = (jewelry) => {
  const raw = jewelry?.deliveryDays;
  if (raw === undefined || raw === null || raw === "") return null;

  const match = String(raw).match(/(\d+)\s*-\s*(\d+)/);
  if (match) return [Number(match[1]), Number(match[2])];

  const d = Number(raw);
  return Number.isFinite(d) && d > 0 ? [d, d] : null;
};

// Gemstone (+ certificate) days PLUS jewelry days
const getCombinedDeliveryText = (productData, selectedCertValue, jewelry) => {
  const gem = getCertificateDeliveryRange(productData, selectedCertValue);
  const jw = getJewelryDaysRange(jewelry);

  if (!jw) return `${formatDaysRange(gem)} Business days`;

  const total = [gem[0] + jw[0], gem[1] + jw[1]];
  return `${formatDaysRange(total)} Business days`;
};
// ----------------------------- Add By Pawan --------------------------------------


// -------------------- Dynamic Delivery Logic (END) --------------------

// --- Component Definition ---
function HeaderDetailPage({ onSendId, slug: propSlug, name: propName, sku: propSku }) {
  const navigate = useNavigate();
  const { name: paramName, sku: paramSku, slug: paramSlug, slugOrId } = useParams();
  const URL = import.meta.env.VITE_URL;
  const dispatch = useDispatch();
  const frontendUrl = (import.meta.env.VITE_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "https://gemrishi.com")).split(",")[0].trim().replace(/\/+$/, "");

  const finalName = propName || paramName;
  const finalSku = propSku || paramSku;
  const activeIdentifier = propSlug || (finalName && finalSku ? `${finalName}/${finalSku}` : (finalSku || paramSlug || slugOrId || ""));

  // Gemstone States
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificate, setCertificate] = useState("");
  const [certificatePrice, setCertificatePrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  // ✅ Mini Cart Modal State
  const [showCartModal, setShowCartModal] = useState(false);
  // -------------------- Add By Pawan For Buy Now (START) --------------------
  const buyNowRef = useRef(false);
  const addToCartLockRef = useRef(false);
  // -------------------- Add By Pawan For Buy Now (END) --------------------
  // Jewelry Customization States
  const [isInterestedInJewelry, setIsInterestedInJewelry] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Ring");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedMetal, setSelectedMetal] = useState("");
  const [selectedSizeSystem, setSelectedSizeSystem] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [metalRates, setMetalRates] = useState(null);
  const [selectedGemstoneValue, setSelectedGemstoneValue] = useState("");
  const [selectedDiamondSubstitute, setSelectedDiamondSubstitute] =
    useState("");
  const [totalPrice, setTotalPrice] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 90;
  const { currency, rates } = useSelector((s) => s.currency);

  // --- Festive Coupon State for Gemstone Offer (GEMRISHI20) ---
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const isGemstoneOfferActive = isCampaignActive() && CAMPAIGN_CONFIG.gemstoneOffer.enabled;

  const handleApplyCoupon = (codeToApply) => {
    if (!isGemstoneOfferActive) {
      setCouponError("No active promotion at this time.");
      return;
    }
    const rawCode = String(codeToApply || couponCode).trim().toUpperCase();
    setCouponError("");

    if (!rawCode) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (rawCode === CAMPAIGN_CONFIG.gemstoneOffer.code.toUpperCase()) {
      const stonePrice = getProductDisplayPrice(productData);
      const offerCheck = isGemstoneOfferEligible(stonePrice, rawCode, productData);

      if (!offerCheck.eligible) {
        setCouponError(offerCheck.reason || `Coupon not applicable if gemstone value less than ${CAMPAIGN_CONFIG.gemstoneOffer.minGemstonePrice}.`);
        toast.error(offerCheck.reason || `Coupon not applicable if gemstone value less than ${CAMPAIGN_CONFIG.gemstoneOffer.minGemstonePrice}.`, {
          position: "top-center",
        });
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon({
        code: CAMPAIGN_CONFIG.gemstoneOffer.code,
        discountPercent: offerCheck.discountPercent,
        discountAmount: offerCheck.discountAmount,
      });
      setCouponCode(CAMPAIGN_CONFIG.gemstoneOffer.code);
      setCouponError("");
      sessionStorage.setItem("activeCartCoupon", CAMPAIGN_CONFIG.gemstoneOffer.code);
      toast.success(
        `Coupon ${CAMPAIGN_CONFIG.gemstoneOffer.code} applied! ${offerCheck.discountPercent}% discount applied to this gemstone.`,
        { position: "top-center" }
      );
    } else {
      setCouponError("Invalid coupon code for this gemstone.");
      toast.error("Invalid coupon code.", { position: "top-center" });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    sessionStorage.removeItem("activeCartCoupon");
    toast.info("Coupon removed.", { position: "top-center" });
  };

  // Auto-restore active festive coupon for gemstones >= 10,000 from sessionStorage
  useEffect(() => {
    if (!isGemstoneOfferActive || !productData) return;
    const storedCoupon = sessionStorage.getItem("activeCartCoupon");
    if (storedCoupon && storedCoupon.toUpperCase() === CAMPAIGN_CONFIG.gemstoneOffer.code.toUpperCase()) {
      const stonePrice = getProductDisplayPrice(productData);
      const offerCheck = isGemstoneOfferEligible(stonePrice, storedCoupon, productData);
      if (offerCheck.eligible) {
        setAppliedCoupon({
          code: CAMPAIGN_CONFIG.gemstoneOffer.code,
          discountPercent: offerCheck.discountPercent,
          discountAmount: offerCheck.discountAmount,
        });
        setCouponCode(CAMPAIGN_CONFIG.gemstoneOffer.code);
        setCouponError("");
      }
    }
  }, [productData?.price, isGemstoneOfferActive]);

  // Fetch metal rates
  const fetchMetalRates = async () => {
    try {
      const rates = await getLatestMetalRates();
      setMetalRates(rates);
    } catch (error) {
      console.error("Error fetching metal rates:", error);
    }
  };

  // --- Product Data Fetching Effect ---
  useEffect(() => {
    const fetchProductData = async () => {
      if (!activeIdentifier) {
        setError("No product identifier provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let apiEndpoint = "";
        if (finalName && finalSku) {
          apiEndpoint = `${URL}/product/single-product/${encodeURIComponent(finalName)}/${encodeURIComponent(finalSku)}`;
        } else if (activeIdentifier.includes("/")) {
          const [n, s] = activeIdentifier.split("/");
          apiEndpoint = `${URL}/product/single-product/${encodeURIComponent(n)}/${encodeURIComponent(s)}`;
        } else {
          apiEndpoint = `${URL}/product/single-product/${encodeURIComponent(activeIdentifier)}`;
        }

        const response = await axios.get(apiEndpoint);

        let fetchedData =
          response.data.data || response.data.product || response.data.jewelry || response.data;
        if (Array.isArray(fetchedData) && fetchedData.length > 0) {
          fetchedData = fetchedData[0];
        }

        if (fetchedData && (fetchedData.name || fetchedData.jewelryName || fetchedData._id)) {
          setProductData(fetchedData);

          // 301 Seamless Canonical URL Replacement
          if (response.data.canonicalUrl && window.location.pathname !== response.data.canonicalUrl) {
            navigate(response.data.canonicalUrl, { replace: true });
          } else if (response.data.isRedirect && response.data.activeSlug) {
            const targetUrl = response.data.cleanSku
              ? `/products/${response.data.cleanName}/${response.data.cleanSku}`
              : `/products/${response.data.activeSlug}`;
            if (window.location.pathname !== targetUrl) {
              navigate(targetUrl, { replace: true });
            }
          }

          const freeCert = fetchedData.certificate?.find(
            (cert) =>
              (cert.type || cert.name || "").toLowerCase().includes("free") ||
              cert.price === 0,
          );
          const initialCert =
            freeCert || (fetchedData.certificate && fetchedData.certificate[0]);
          if (initialCert) {
            const certValue =
              initialCert._id || initialCert.type || initialCert;
            setCertificate(certValue);
            setCertificatePrice(initialCert.price || 0);
          } else {
            setCertificate("");
            setCertificatePrice(0);
          }
        } else {
          setError("No product data found in API response.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        const status = err.response?.status;
        if (status === 404) {
          // FIX: `slug` was undefined here and threw a ReferenceError on every 404
          setError(`Product not found for: ${activeIdentifier}`);
        } else if (status === 500) {
          setError("Server error - please try again later.");
        } else {
          setError(
            `Failed to load product data: ${err.message || "Network error"}`,
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
    fetchMetalRates();
  }, [finalName, finalSku, activeIdentifier, URL]);
  // --- Certificate Price Update Effect ---
  useEffect(() => {
    if (productData && certificate) {
      const selectedCert = productData.certificate?.find(
        (cert) => (cert._id || cert.type || cert) === certificate,
      );
      setCertificatePrice(selectedCert?.price || 0);
    } else if (!certificate && productData) {
      setCertificatePrice(0);
    }
  }, [certificate, productData]);

  // --- Selected Image Transition Effect ---
  useEffect(() => {
    setIsTransitioning(true);
    const t = setTimeout(() => setIsTransitioning(false), 220);
    return () => clearTimeout(t);
  }, [selectedImageIndex]);

  useEffect(() => {
    setShowPopup(true);
  }, []);

  // Auto-hide cart modal after 6 seconds
  useEffect(() => {
    if (showCartModal) {
      const timer = setTimeout(() => setShowCartModal(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showCartModal]);

  // --- Helper Functions ---
  const getProductMedia = useCallback(() => {
    const media = [];
    if (productData?.images && Array.isArray(productData.images)) {
      productData.images.forEach((img) => {
        media.push({
          type: "image",
          url: img.url || img,
          alt: productData.name || "Product Image",
        });
      });
    }
    if (productData?.videos && Array.isArray(productData.videos)) {
      productData.videos.forEach((video) => {
        media.push({
          type: "video",
          url: video.url || video,
          alt: productData.name || "Product Video",
        });
      });
    }
    return media;
  }, [productData]);
  const mediaItems = useMemo(() => {
    if (!productData) return [];
    return getProductMedia();
  }, [getProductMedia]);
  const handlePrevImage = () => {
    if (!mediaItems.length) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? mediaItems.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    if (!mediaItems.length) return;
    setSelectedImageIndex((prev) =>
      prev === mediaItems.length - 1 ? 0 : prev + 1,
    );
  };
  //-------------------Add By Pawan for currency----------------------------
 const formatPrice = (price) => {
  return formatCurrency(ConvertFromINR(price || 0, rates, currency), currency);
};
  //-------------------Add By Pawan for currency----------------------------
  const getMetalRate = (metalType) => {
    if (!metalRates || !metalType) return 0;
    const metalKey = metalType?.toLowerCase();

    if (metalKey?.includes("gold")) {
      if (metalKey.includes("18")) {
        return metalRates.gold?.gold18k?.withGSTRate || 0;
      } else if (metalKey.includes("22")) {
        return metalRates.gold?.gold22k?.withGSTRate || 0;
      } else {
        return metalRates.gold?.gold24k?.withGSTRate || 0;
      }
    } else if (metalKey === "silver") {
      return metalRates.silver?.withGSTRate || 0;
    } else if (metalKey === "platinum") {
      return metalRates.platinum?.withGSTRate || 0;
    } else if (metalKey === "panchadhatu") {
      return metalRates.panchadhatu?.withGSTRate || 0;
    }
    return 0;
  };

  const isInStock = productData?.inStock !== false && productData?.stock !== 0;

  // --- Add to Cart Handler for Gemstone ---
  const handleAddToCart = async () => {
    if (addToCartLockRef.current) return; // already running -> ignore duplicate click/tap
    addToCartLockRef.current = true;
    try {
      if (!isInterestedInJewelry) {
        await handleGemstoneAddToCart();
      } else {
        await handleJewelryAddToCart();
      }
    } finally {
      addToCartLockRef.current = false;
    }
  };

  // -------------------- Add By Pawan For Buy Now (START) --------------------
  // Buy Now: add to cart, then redirect to Cashfree checkout
  const handleBuyNow = async () => {
    if (addToCartLockRef.current) return; // ignore duplicate clicks while a cart request is running
    buyNowRef.current = true;
    try {
      await handleAddToCart();
    } finally {
      buyNowRef.current = false;
    }
  };
  // -------------------- Add By Pawan For Buy Now (END) --------------------

  const handleGemstoneAddToCart = async () => {
    if (!productData?._id) {
      toast.error("Product ID not found. Cannot add to cart.", {
        position: "top-center",
      });
      return;
    }
    if (!isInStock) {
      toast.error("This item is currently out of stock.", {
        position: "top-center",
      });
      return;
    }
    const userToken = getUserToken();
    try {
      setIsAddingToCart(true);

      let customizationPayload = {};

      if (certificate) {
        const selectedCert = productData.certificate?.find(
          (cert) => (cert._id || cert.type || cert) === certificate,
        );

        if (selectedCert) {
          const certDisplayName =
            selectedCert.type ||
            selectedCert.name ||
            selectedCert.certificateType ||
            certificate;

          customizationPayload = {
            certificate: {
              certificateType: certDisplayName,
              price: selectedCert.price || 0,
            },
          };
        }
      }

      const stonePrice = getProductDisplayPrice(productData);
      const activeCouponCode =
        appliedCoupon?.code ||
        sessionStorage.getItem("activeCartCoupon") ||
        (couponCode?.trim().toUpperCase() === CAMPAIGN_CONFIG.gemstoneOffer.code.toUpperCase() ? couponCode.trim() : null);

      const offerCheck = activeCouponCode ? isGemstoneOfferEligible(stonePrice, activeCouponCode, productData) : { eligible: false };
      const hasDiscount = Boolean(appliedCoupon || (offerCheck.eligible && activeCouponCode));
      const discountVal = appliedCoupon?.discountAmount != null
        ? appliedCoupon.discountAmount
        : (offerCheck.eligible ? offerCheck.discountAmount : 0);
      const finalStonePrice = Math.max(0, stonePrice - discountVal);
      const certPrice = Number(customizationPayload.certificate?.price || 0);
      const finalItemUnitPrice = finalStonePrice + certPrice;
      const finalTotalPrice = finalItemUnitPrice * (quantity || 1);

      if (hasDiscount) {
        customizationPayload.appliedCoupon = appliedCoupon?.code || activeCouponCode || CAMPAIGN_CONFIG.gemstoneOffer.code;
        customizationPayload.originalPrice = stonePrice;
        customizationPayload.discountedPrice = finalStonePrice;
        customizationPayload.discountAmount = discountVal;
        customizationPayload.discountPercent = appliedCoupon?.discountPercent || (stonePrice > 0 ? Math.round((discountVal / stonePrice) * 100) : 15);
        sessionStorage.setItem("activeCartCoupon", customizationPayload.appliedCoupon);
      }

      // Add By Pawan: Shared event ID for Meta Pixel and CAPI deduplication
        const eventId = `add_to_cart_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const payload = {
        itemId: productData._id,
         itemType: "Product",
         quantity: quantity || 1,
          price: finalItemUnitPrice,
          totalPrice: finalTotalPrice,
          customization: customizationPayload,
          eventId, // Backend CAPI receives the same event ID
           };

      const headers = { "Content-Type": "application/json" };
      if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
      }

      const response = await axios.post(
        `${URL}/cart/add_item_in_cart`,
        payload,
        {
          headers: headers,
          withCredentials: true,
        },
      );

      if (response.data.success) {
        // Dispatch only after the API confirms success
        dispatch(addItemToCart(payload));

        // GA4 Add To Cart Tracking
        window.dataLayer = window.dataLayer || [];

        // Clear previous ecommerce object
        window.dataLayer.push({
          ecommerce: null
        });

        window.dataLayer.push({
          event: "add_to_cart",
          ecommerce: {
            currency: "INR",

            value: (productData.price || 0) + certificatePrice,

            items: [
              {
                item_id: productData.sku || productData._id,
                item_name: productData.name,
                item_brand:  "GemRishi",
                item_category: "Gemstones",
                item_variant: productData.origin || "",
                price: (productData.price || 0) + certificatePrice,
                quantity: quantity || 1
              }
            ]
          }
        });

        console.log("GA4 add_to_cart fired");

        // Add By Pawan: Meta Pixel AddToCart with matching CAPI event ID
         const addSku = String(productData.sku || productData._id || "");
         fbqTrack(
          "AddToCart",
           {
           content_ids: [addSku],
           content_type: "product",
           content_name: productData.name || "Gemstone",
           content_category: "Gemstones",
           value: finalTotalPrice,
           currency: "INR",
           contents: [
          {
           id: addSku,
          quantity: quantity || 1,
         item_price: finalItemUnitPrice,
          },
          ],
          },
          { eventID: eventId }
           );
        // ===== End Add by Pawan For Meta Pixel =====

        // -------------------- Add By Pawan For Buy Now (START) --------------------
        if (buyNowRef.current) {

          navigate("/shopping/cart", { state: { autoCashfree: true } });
        } else {
          // Existing mini cart popup
          setShowCartModal(true);
        }
        // -------------------- Add By Pawan For Buy Now -----------------------
      } else {
        toast.error(response.data.message || "Failed to add item to cart", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);

      if (error.response?.status === 401) {
        toast.warn("Guest cart is not enabled on server. Please log in.", {
          position: "top-center",
        });
      } else if (error.response?.status === 400 && buyNowRef.current) {
        // -------------------- Add By Pawan For Buy Now (START) --------------------
        navigate("/shopping/cart", { state: { autoCashfree: true } });
        // -------------------- Add By Pawan For Buy Now (END) --------------------
      } else if (error.response?.status === 400) {

        // It tries to grab the exact message from your backend, or falls back to a default message.
        const errorMsg = error.response?.data?.message || error.response?.data?.msg || "This item is already in your cart!";
        toast.info(errorMsg, { position: "top-center" });
      } else {
        toast.error("Failed to add item to cart.", { position: "top-center" });
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedProduct) return;
    let basePrice = Number(selectedProduct.jewelryPrice || 0);
    let jewelryCompPrice = basePrice;
    const selectedMetalKey = selectedMetal?.toLowerCase() || "";
    const productMetalKey = selectedProduct.metal?.toLowerCase() || "";

    if (productMetalKey === "gold") {
      const weight = Number(selectedProduct.jewelryMetalWeight || 0);
      const charge = Number(selectedProduct.makingChargePercent || 10);
      if (!basePrice && metalRates?.gold) {
        const rate = Number(metalRates.gold?.[selectedMetalKey]?.withGSTRate || metalRates.gold?.gold22k?.withGSTRate || 0);
        jewelryCompPrice += weight * rate;
      } else if (basePrice && selectedMetalKey && selectedMetalKey !== "gold22k" && metalRates?.gold) {
        const rSelected = Number(metalRates.gold?.[selectedMetalKey]?.withoutGSTRate || 0);
        const r22 = Number(metalRates.gold?.gold22k?.withoutGSTRate || 0);
        if (rSelected && r22 && weight > 0) {
          const diff = Math.round((rSelected - r22) * (1 + charge / 100) * weight * 1.03);
          jewelryCompPrice += diff;
        }
      }
    } else if (productMetalKey) {
      if (!basePrice && metalRates) {
        const rate = Number(metalRates[productMetalKey]?.withGSTRate || 0);
        const weight = Number(selectedProduct.jewelryMetalWeight || 0);
        jewelryCompPrice += weight * rate;
      }
    }

    if (selectedDiamondSubstitute) {
      const parts = selectedDiamondSubstitute.split("₹");
      if (parts[1]) {
        const subPrice = parseFloat(parts[1].replace(/,/g, "")) || 0;
        jewelryCompPrice += subPrice;
      }
    }

    const gemstonePrice = getProductDisplayPrice(productData);
    const effectiveGemstonePrice = appliedCoupon
      ? Math.max(0, gemstonePrice - (appliedCoupon.discountAmount || 0))
      : gemstonePrice;
    const fullBundlePrice = Math.round(jewelryCompPrice + effectiveGemstonePrice + (certificatePrice || 0));

    setCalculatedPrice(fullBundlePrice);
    setTotalPrice(fullBundlePrice);
  };

  useEffect(() => {
    if (isInterestedInJewelry && selectedProduct) {
      calculateTotalPrice();
    }
  }, [selectedProduct, selectedMetal, selectedDiamondSubstitute, metalRates, isInterestedInJewelry, certificatePrice, productData, appliedCoupon]);

  useEffect(() => {
    if (productData?._id && typeof onSendId === "function") {
      onSendId(productData._id);
    }
  }, [productData]);


  // GA4 Ecommerce Tracking for Product View
  useEffect(() => {
    if (!productData?._id) return;
    const finalPrice = Number(productData.price || productData.jewelryPrice || 0);
    if (finalPrice <= 0) return;

    window.dataLayer = window.dataLayer || [];

    // clear previous ecommerce object
    window.dataLayer.push({
      ecommerce: null
    });

    // fire GA4 product view
    window.dataLayer.push({
      event: "view_item",
      ecommerce: {
        currency: "INR",
        value: finalPrice,

        items: [
          {
            item_id: productData.sku || productData._id,
            item_name: productData.name,
            item_brand: "GemRishi", //---- add by pawan
            item_category: "Gemstones",
            item_variant: productData.origin || "",
            price: finalPrice,
            quantity: 1
          }
        ]
      }
    });

    console.log("GA4 view_item fired");

    // ===== Add by Pawan For Meta Pixel (Catalog Aligned) =====
    const viewSku = String(productData.sku || productData._id || "");
    const viewEventId = `view_${viewSku}_${Math.floor(Date.now() / 60000)}`;
    fbqTrack(
      "ViewContent",
      {
        content_ids: [viewSku],
        content_type: "product",
        content_name: productData.name || productData.jewelryName || "Gemstone",
        content_category: "Gemstones",
        value: finalPrice,
        currency: "INR",
        contents: [{ id: viewSku, quantity: 1, item_price: finalPrice }],
      },
      { eventID: viewEventId }
    );
    // ===== End Add by Pawan For Meta Pixel =====

  }, [productData]);

  const handleJewelryAddToCart = async () => {
    const userToken = getUserToken();

    // FIX 1: `headers` was used below but never declared
    const headers = { "Content-Type": "application/json" };
    if (userToken) {
      headers.Authorization = `Bearer ${userToken}`;
    }

    if (!selectedProduct?._id) {
      toast.error("Select a product first.", { position: "top-center" });
      return;
    }

    setIsAddingToCart(true);

    const selectedCertObj = productData.certificate?.find(
      (c) => (c._id || c.type || c.certificateType) === certificate,
    );

    try {
      const isRingSizer =
        selectedSize === "Send me a ring sizer" ||
        selectedSizeSystem === "Send me a ring sizer";

      const sizeSystemPayload = isRingSizer
        ? {
            sizeType: selectedSizeSystem === "Send me a ring sizer" ? "Ring Sizer" : (selectedSizeSystem || "Ring Sizer"),
            sizeNumber: "Send me a ring sizer",
          }
        : selectedSize
        ? {
            sizeType: selectedSizeSystem || "Standard",
            sizeNumber: selectedSize,
          }
        : null;

      // 1️⃣ Gemstone Item Customization (Standalone, no joined jewelryId)
      const stonePrice = getProductDisplayPrice(productData);
      const activeCouponCode =
        appliedCoupon?.code ||
        sessionStorage.getItem("activeCartCoupon") ||
        (couponCode?.trim().toUpperCase() === CAMPAIGN_CONFIG.gemstoneOffer.code.toUpperCase() ? couponCode.trim() : null);

      const gemstoneCustomization = {};
      if (selectedCertObj) {
        gemstoneCustomization.certificate = {
          certificateType:
            selectedCertObj.certificateType ||
            selectedCertObj.type ||
            selectedCertObj.name,
          price: selectedCertObj.price || 0,
        };
      }

      const offerCheck = activeCouponCode ? isGemstoneOfferEligible(stonePrice, activeCouponCode, productData) : { eligible: false };
      const hasDiscount = Boolean(appliedCoupon || (offerCheck.eligible && activeCouponCode));
      const discountVal = appliedCoupon?.discountAmount != null
        ? appliedCoupon.discountAmount
        : (offerCheck.eligible ? offerCheck.discountAmount : 0);
      const finalStonePrice = Math.max(0, stonePrice - discountVal);
      const certPrice = Number(gemstoneCustomization.certificate?.price || 0);
      const finalItemUnitPrice = finalStonePrice + certPrice;
      const finalTotalPrice = finalItemUnitPrice * (quantity || 1);

      if (hasDiscount) {
        gemstoneCustomization.appliedCoupon = appliedCoupon?.code || activeCouponCode || CAMPAIGN_CONFIG.gemstoneOffer.code;
        gemstoneCustomization.originalPrice = stonePrice;
        gemstoneCustomization.discountedPrice = finalStonePrice;
        gemstoneCustomization.discountAmount = discountVal;
        gemstoneCustomization.discountPercent = appliedCoupon?.discountPercent || (stonePrice > 0 ? Math.round((discountVal / stonePrice) * 100) : 15);
        sessionStorage.setItem("activeCartCoupon", gemstoneCustomization.appliedCoupon);
      }

      // Add By Pawan: Separate event ID for gemstone
      const gemstoneEventId = `add_to_cart_gem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      const gemstonePayload = {
        itemId: productData._id,
        itemType: "Product",
        quantity: quantity || 1,
        price: finalItemUnitPrice,
        totalPrice: finalTotalPrice,
        customization: gemstoneCustomization,
        eventId: gemstoneEventId,
      };

      // 2️⃣ Jewelry Setting Item Customization (Standalone, no joined productId)
      const jewelryCustomization = {
        metal: selectedMetal || selectedProduct.metal,
        sizeSystem: sizeSystemPayload,
        size: sizeSystemPayload
          ? {
              sizeType: sizeSystemPayload.sizeType,
              size: sizeSystemPayload.sizeNumber,
            }
          : null,
        gemstoneWeight: selectedGemstoneValue
          ? {
            weight: parseFloat(selectedGemstoneValue.split(" ")[0]),
            price: parseFloat(selectedGemstoneValue.split("₹")[1]),
          }
          : null,
        diamondSubstitute: selectedDiamondSubstitute
          ? {
            name: selectedDiamondSubstitute.split(" - ₹ ")[0],
            price: parseFloat(selectedDiamondSubstitute.split("₹")[1]),
          }
          : null,
        goldKarat: selectedMetal && selectedProduct.metal === "gold"
          ? {
            karatType: selectedMetal,
            price:
              metalRates?.gold?.[selectedMetal]?.withGSTRate *
              (selectedProduct.jewelryMetalWeight || 0),
          }
          : null,
      };

      // Add By Pawan: Separate event ID for jewelry
      const jewelryEventId = `add_to_cart_jewelry_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;

      // Backend detects Product vs Jewelry from itemId and calculates the jewelry price
      // from its customization data, so itemType / price / totalPrice are NOT sent.
      const jewelryPayload = {
        itemId: selectedProduct._id,
        quantity: 1,
        customization: jewelryCustomization,
        eventId: jewelryEventId,
      };

      // Add gemstone first and fire its matching Pixel event on success
      const resGemstone = await axios.post(
        `${URL}/cart/add_item_in_cart`,
        gemstonePayload,
        {
          headers,
          withCredentials: true,
        }
      );

      if (!resGemstone.data?.success) {
        toast.error(resGemstone.data?.message || "Failed to add gemstone to cart", {
          position: "top-center",
        });
        return;
      }

      dispatch(addItemToCart(gemstonePayload));

      // Read the server-calculated gemstone total
      const gemstoneCartItem = resGemstone.data.cart?.find(
        (cartItem) =>
          String(cartItem.item?._id || cartItem.item) === String(productData._id)
      );

      const gemstoneServerTotal = gemstoneCartItem
        ? Number(gemstoneCartItem.totalPrice)
        : undefined;

      const gemstoneSku = String(productData.sku || productData._id || "");

      fbqTrack(
        "AddToCart",
        {
          content_ids: [gemstoneSku],
          content_type: "product",
          content_name: productData.name || "Gemstone",
          content_category: "Gemstones",
          ...(Number.isFinite(gemstoneServerTotal)
            ? { value: gemstoneServerTotal }
            : {}),
          currency: "INR",
          ...(Number.isFinite(gemstoneServerTotal)
            ? {
                contents: [
                  {
                    id: gemstoneSku,
                    quantity: Number(gemstoneCartItem.quantity) || 1,
                    item_price:
                      gemstoneServerTotal /
                      (Number(gemstoneCartItem.quantity) || 1),
                  },
                ],
              }
            : {}),
        },
        { eventID: gemstoneEventId }
      );

      // Add jewelry separately
      const resJewelry = await axios.post(
        `${URL}/cart/add_item_in_cart`,
        jewelryPayload,
        {
          headers,
          withCredentials: true,
        }
      );

      if (!resJewelry.data?.success) {
        toast.error(resJewelry.data?.message || "Gemstone added, but jewelry could not be added.", {
          position: "top-center",
        });
        return;
      }

      dispatch(addItemToCart(jewelryPayload));

      // Read the server-calculated jewelry total, including customizations
      const jewelryCartItem = resJewelry.data.cart?.find(
        (cartItem) =>
          String(cartItem.item?._id || cartItem.item) === String(selectedProduct._id)
      );

      const jewelryServerTotal = jewelryCartItem
        ? Number(jewelryCartItem.totalPrice)
        : undefined;

      const jewelrySku = String(selectedProduct.sku || selectedProduct._id || "");

      fbqTrack(
        "AddToCart",
        {
          content_ids: [jewelrySku],
          content_type: "product",
          content_name: selectedProduct.jewelryName || "Jewelry",
          content_category: selectedProduct.jewelryType || "Jewelry",
          ...(Number.isFinite(jewelryServerTotal)
            ? { value: jewelryServerTotal }
            : {}),
          currency: "INR",
          ...(Number.isFinite(jewelryServerTotal)
            ? {
                contents: [
                  {
                    id: jewelrySku,
                    quantity: Number(jewelryCartItem.quantity) || 1,
                    item_price:
                      jewelryServerTotal /
                      (Number(jewelryCartItem.quantity) || 1),
                  },
                ],
              }
            : {}),
        },
        { eventID: jewelryEventId }
      );

      // Both items were added successfully
      if (buyNowRef.current) {
        navigate("/shopping/cart", { state: { autoCashfree: true } });
      } else {
        setShowCartModal(true);
        toast.success("Gemstone & jewelry setting added to cart as 2 separate items!", {
          position: "top-center",
        });
      }

      // FIX 3: the old duplicate gemstone Pixel block (second `gemstoneSku` + fbqTrack) was removed here.
    } catch (err) {
      console.error("Error adding item to cart:", err);
      toast.error("Something went wrong. Please try again later.", {
        position: "top-center",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Jewelry Filters
  const sidebarFilters = [
    { label: "Ring", icon: RingIcon },
    { label: "Pendant", icon: PendantIcon },
    { label: "Bracelet", icon: BraceletIcon },
    { label: "Necklace", icon: NecklaceIcon },
    { label: "Earrings", icon: EarringsIcon },
  ];

  const sizeOptions = {
    Size_system: [
      "Indian Ring Size System",
      "US Ring Size System",
      "UK/Australia Ring Size System",
      "Europe Ring Size System",
    ],
    Size_number: Array.from({ length: 19 }, (_, i) => i + 1),
    Quality: [
      { label: "Gold 18K", value: "gold18k", base: "gold" },
      { label: "Gold 22K", value: "gold22k", base: "gold" },
      { label: "Silver", value: "silver", base: "silver" },
      { label: "Platinum", value: "platinum", base: "platinum" },
      { label: "Panchadhatu", value: "panchadhatu", base: "panchadhatu" },
    ],
  };

  const selectedMetalObj = sizeOptions.Quality.find(
    (m) => m.value === selectedMetal,
  );
  const baseMetal = selectedMetalObj?.base || selectedMetal;

  const jewelryFilters = useMemo(() => {
    if (!productData || !productData.subCategory?._id) {
      return {
        limit: 12,
        jewelryType: selectedCategory,
        metal: baseMetal,
        productSubCategory: "",
      };
    }

    return {
      limit: 12,
      jewelryType: selectedCategory,
      metal: baseMetal,
      productSubCategory: productData.subCategory._id,
    };
  }, [selectedCategory, baseMetal, productData]);

  const { data: jewelryData, loading: jewelryLoading } =
    useJewelryByFilter(jewelryFilters);

  if (loading) {
    return (
      <div className="w-full min-h-[500px] flex items-center justify-center bg-[#FDFCF8] py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-[#264A3F] rounded-full animate-spin"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Loading gemstone details...</p>
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-20">
        <p className="text-red-600 mb-4 ">{error || "No product data found"}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#264A3F] text-white rounded-lg hover:bg-[#1a3329] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentMedia = mediaItems[selectedImageIndex];
  const stoneOriginalPrice = getProductDisplayPrice(productData);
  const stoneDiscountAmount = appliedCoupon ? (appliedCoupon.discountAmount || 0) : 0;
  const stoneEffectivePrice = Math.max(0, stoneOriginalPrice - stoneDiscountAmount);
  const totalItemPrice = stoneOriginalPrice + certificatePrice;
  const discountedTotalItemPrice = stoneEffectivePrice + certificatePrice;
  const originalStrikePrice = getProductOriginalPrice(productData);
// ------------------Add By Pawan For Admin Delivery Days--------------------------------
  const getJewelryDeliveryText = (jewelry) => {
  const days = Number(jewelry?.deliveryDays);
  if (!Number.isFinite(days) || days <= 0) return "Contact us for delivery time";
  return `${days} ${days === 1 ? "day" : "days"}`;
};
// ----------------------Add By Pawan For Admin Delivery Days-------------------------------
// ----------------------Fix By Pawan disbale why gemrishi option---------------------------
  const renderJewelryCustomizationSection = () => (
    <div className="w-full max-w-5xl mx-auto mb-6 space-y-8 mt-8">
      {/* Title */}
      <div className="flex items-center flex-col mb-4 text-center">
        <h3 className="text-2xl font-semibold text-[#264A3F]">
          Select for Ring / Pendant / Bracelets / Necklace / Earrings
        </h3>
        <p className="text-blue-400 text-sm ">
          Choose a category or upload your custom design.
        </p>
      </div>

{/*----------fix By Pawan------------Main Layout — now a single column: category row on top, content below */}
      <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex flex-row flex-wrap justify-center gap-3 sm:gap-4 w-full">
          {sidebarFilters.map((item) => (
            <div
              key={item.label}
              onClick={() => setSelectedCategory(item.label)}
              className={`flex-1 min-w-[110px] max-w-[150px] h-[100px] sm:h-[120px] border-2 rounded-2xl
                flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${selectedCategory === item.label
                ? "border-[#20A079] bg-green-50 shadow-lg scale-105"
                : "border-gray-200 hover:shadow-md hover:-translate-y-[2px]"
                }`}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="w-9 h-9 object-contain mb-3"
              />
              <p className="text-[16px] font-medium text-gray-800 text-center">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="w-full max-w-5xl mx-auto px-4 space-y-10">
          {/* Metal Selector */}
          <div className="flex flex-row flex-wrap justify-center items-center gap-4 p-6 rounded-xl">
            <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
              <label className="text-base font-medium text-gray-700 whitespace-nowrap">
                Metal Type:
              </label>
              <select
                value={selectedMetal}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedMetal(val);
                  setSelectedProduct(null);
                  if (val) {
                    trackCustomizerChange({ optionType: "Metal", selectedValue: val });
                  }
                }}
                className="w-full sm:w-[300px] max-w-full h-[50px] border-2 rounded-lg border-gray-300 px-4 text-gray-700 focus:ring-2 focus:ring-[#264A3F] outline-none text-base"
              >
                <option value="">Select Metal</option>
                {sizeOptions.Quality.map((metal) => (
                  <option key={metal.value} value={metal.value}>
                    {metal.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {selectedMetal && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-xl font-semibold text-[#264A3F]">
                  {selectedProduct?._id ? "Selected Design" : "Available Designs"}
                </h4>
                {selectedProduct?._id && (
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#264A3F] bg-white border border-[#264A3F]/30 hover:bg-[#264A3F] hover:text-white rounded-lg transition-all duration-200 shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Change Design</span>
                  </button>
                )}
              </div>

              {jewelryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#264A3F] mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading designs...</p>
                </div>
              ) : (selectedProduct?._id ? [selectedProduct] : (jewelryData?.jeweleries || [])).length > 0 ? (
                <div className={selectedProduct?._id ? "flex justify-center w-full" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"}>
                  {/* Custom Design Request Card */}
                  {!selectedProduct?._id && CODE_CONFIG.customDesignRequest?.enabled && (
                    <div
                      onClick={() => {
                        const metalLabel = sizeOptions.Quality.find((m) => m.value === selectedMetal)?.label || selectedMetal;
                        const msg = `Hello GemRishi! I would like to request a Custom ${selectedCategory} Design in ${metalLabel} for my gemstone: ${productData?.name || "Gemstone"}. I have a photo/sketch to share.`;
                        const phone = CODE_CONFIG.customDesignRequest?.whatsappNumber || "919817975978";
                        window.open(`https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(msg)}`, "_blank");
                      }}
                      className="w-full p-4 border-2 border-dashed border-[#20A079] bg-gradient-to-b from-[#F2F9F5] via-white to-[#F2F9F5] rounded-xl flex flex-col items-center text-center cursor-pointer hover:border-[#264A3F] hover:shadow-lg hover:-translate-y-[2px] transition-all duration-200 group"
                    >
                      <span className="self-end px-2.5 py-0.5 mb-2 bg-[#20A079] text-white text-[11px] font-semibold uppercase tracking-wider rounded-full shadow-2xs">
                        Custom CAD
                      </span>
                      <div className="w-24 h-24 rounded-2xl bg-[#264A3F]/10 text-[#264A3F] flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-[#264A3F]/15 transition-all duration-300 shadow-inner mb-4">
                        ✍️
                      </div>
                      <p className="text-base font-semibold text-[#264A3F] mb-1">
                        Custom Design Request
                      </p>
                      <p className="text-sm text-gray-600 mb-2 capitalize">
                        {selectedCategory} • {selectedMetal}
                      </p>
                      <p className="text-xs text-emerald-700 font-medium mb-1">
                        Share Sketch, Photo or CAD
                      </p>
                      <p className="text-base font-bold text-gray-900 mb-3">
                        Bespoke Quote
                      </p>
                      <div className="mt-auto w-full flex items-center justify-center">
                        <span className="inline-block px-4 py-1.5 bg-[#25D366] text-white rounded-md text-xs font-semibold hover:bg-[#20ba59] transition shadow-xs">
                          Request on WhatsApp
                        </span>
                      </div>
                    </div>
                  )}

                  {(selectedProduct?._id ? [selectedProduct] : jewelryData.jeweleries).map((item, index) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        setSelectedProduct({ ...item, index });
                      }}
                      className={`${selectedProduct?._id ? "w-full max-w-sm" : "w-full"} p-4 border-2 rounded-xl bg-white flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${
                        selectedProduct?._id === item._id
                          ? "border-[#20A079] bg-green-50 shadow-lg scale-105"
                          : "border-gray-200 hover:shadow-lg hover:-translate-y-[2px]"
                      }`}
                    >
                      {selectedProduct?._id === item._id && (
                        <span className="self-end px-2.5 py-0.5 mb-2 bg-[#264A3F] text-white text-[11px] font-semibold uppercase tracking-wider rounded-full">
                          Selected Design
                        </span>
                      )}
                      <img
                        src={item.images?.[0]?.url || (typeof item.images?.[0] === "string" ? item.images[0] : "/placeholder.svg")}
                        alt={item.jewelryName}
                        className="w-24 h-24 object-contain mb-4"
                      />
                      <p className="text-base font-semibold text-gray-800 mb-2">
                        {item.jewelryName || "Unnamed"}
                      </p>
                      <p className="text-sm text-gray-600 mb-2 capitalize">
                        {item.jewelryType} • {item.metal}
                      </p>
                      {(item.jewelryMetalWeight != null && item.jewelryMetalWeight !== "") && (
                        <p className="text-xs text-gray-600 mb-1 font-medium">
                          Weight: {item.jewelryMetalWeight} g
                        </p>
                      )}
                      {item.origin && (
                        <p className="text-xs text-gray-500 mb-2">
                          Origin: {item.origin}
                        </p>
                      )}
                      {/* Price */}
                      <div className="text-center w-full">
                        <p className="text-base font-bold text-[#264A3F] mb-1">
                          {formatPrice(item.jewelryPrice)}
                        </p>
                        {/* Clean Description (NO word cut, max 2 lines) */}
                        <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                          {item.jewelryDesc}
                        </p>

                        <div className="flex items-center justify-center gap-2">
                          {/* View Details */}
                          <a
                            href={getAbsoluteProductUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block px-4 py-1.5 bg-[#264A3F] text-white rounded-md text-sm hover:bg-[#1b362f] transition"
                          >
                            View Details
                          </a>
                          {selectedProduct?._id === item._id && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(null);
                              }}
                              className="inline-block px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition"
                            >
                              Deselect
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-xl ">
                  <p className="text-gray-500 text-base">
                    No jewelry found for selected type and metal.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try selecting a different metal type or category.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Size Selection for Rings */}
          {(() => {
            const isRingCategory =
              selectedCategory === "Ring" ||
              (selectedProduct?.jewelryType || "").toLowerCase() === "ring" ||
              (selectedProduct?.jewelryName || "").toLowerCase().includes("ring") ||
              (selectedProduct?.jewelryName || "").toLowerCase().includes("signet");

            const defaultRingSizeSystems = [
              {
                sizeType: "Indian Ring Size System",
                sizeNumbers: Array.from({ length: 26 }, (_, i) => String(i + 5)),
              },
              {
                sizeType: "US Ring Size System",
                sizeNumbers: [
                  "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5",
                  "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12",
                ],
              },
              {
                sizeType: "UK/Australia Ring Size System",
                sizeNumbers: [
                  "H", "I", "J", "K", "L", "M", "N", "O",
                  "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
                ],
              },
              {
                sizeType: "Europe Ring Size System",
                sizeNumbers: Array.from({ length: 26 }, (_, i) => String(i + 45)),
              },
            ];

   // -----------------------Add By Pawan-------------------------------------
            const usableProductSystems = (selectedProduct?.sizeSystem || []).filter(
              (s) => s.sizeType && s.sizeNumbers?.some((n) => n && n !== "NA")
            );
            const productTypes = new Set(usableProductSystems.map((s) => s.sizeType));

            const availableSystems = isRingCategory
              ? [
                  ...usableProductSystems,
                  ...defaultRingSizeSystems.filter((d) => !productTypes.has(d.sizeType)),
                ]
              : usableProductSystems;
  // -----------------------Add By Pawan-------------------------------------

            if (!selectedMetal || availableSystems.length === 0) return null;

            return (
              <div className="flex flex-col gap-4 p-6 rounded-xl bg-gray-50 border border-gray-100 max-w-2xl mx-auto w-full">
                <div className="flex flex-row flex-wrap justify-center gap-6">
                  {/* Size System */}
                  <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
                    <label className="text-base font-medium text-gray-700 whitespace-nowrap">
                      {isRingCategory ? "Ring Size Type:" : "Size System:"}
                    </label>

                    <select
                      value={selectedSizeSystem}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedSizeSystem(val);
                        if (val === "Send me a ring sizer") {
                          setSelectedSize("Send me a ring sizer");
                          trackCustomEvent("Ring_Sizer_Requested", {
                            product_name: productData?.name || "Gemstone",
                            category: "Customer Service",
                          });
                        } else {
                          setSelectedSize("");
                        }
                        if (val) {
                          trackCustomizerChange({ optionType: "SizeSystem", selectedValue: val });
                        }
                      }}
                      className="w-full sm:w-[260px] h-[50px] border-2 rounded-lg border-gray-300 px-4 text-gray-700 focus:ring-2 focus:ring-[#264A3F] outline-none"
                    >
                      <option value="">Select Size System</option>

                      {availableSystems.map((system) => (
                        <option key={system._id || system.sizeType} value={system.sizeType}>
                          {system.sizeType}
                        </option>
                      ))}
                      <option value="Send me a ring sizer">
                        Don't know size? Send me a ring sizer
                      </option>
                    </select>
                  </div>

                  {/* Ring Size */}
                  {selectedSizeSystem && selectedSizeSystem !== "Send me a ring sizer" && (
                    <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
                      <label className="text-base font-medium text-gray-700 whitespace-nowrap">
                        {isRingCategory ? "Ring Size:" : "Size:"}
                      </label>

                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full sm:w-[220px] h-[50px] border-2 rounded-lg border-gray-300 px-4 text-gray-700 focus:ring-2 focus:ring-[#264A3F] outline-none"
                      >
                        <option value="">Select Size</option>
                        <option value="Send me a ring sizer">Send me a ring sizer</option>

                        {/* show sizes only for selected system */}
                        {availableSystems
                          .find((s) => s.sizeType === selectedSizeSystem)
                          ?.sizeNumbers?.filter((num) => num !== "NA")
                          ?.map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Ring Sizer Info Banner */}
                {(selectedSize === "Send me a ring sizer" ||
                  selectedSizeSystem === "Send me a ring sizer") && (
                  <div className="flex items-start gap-2.5 p-3 bg-green-50 border border-[#20A079]/30 rounded-lg text-xs sm:text-sm text-[#264A3F] mt-2">
                    <span className="text-base select-none">💍</span>
                    <div>
                      <p className="font-semibold">Ring Sizer Selected</p>
                      <p className="text-gray-600 mt-0.5">
                       Our sales person will contact you for ring sizer.
                      </p>
                    </div>
                  </div>
                )}

                {/* Ring Sizer Helper & Guide Link */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSizeSystem("Ring Sizer");
                      setSelectedSize("Send me a ring sizer");
                    }}
                    className="text-[#264A3F] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>📏</span> Don't know your size? Send me a ring sizer
                  </button>
                  <a
                    href="/ring-size"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-[#264A3F] hover:underline"
                  >
                    Ring Size Guide →
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Jewelry Customization Options */}
          {selectedProduct && (
            <div className="space-y-6 border-t pt-6">
              <h4 className="text-xl font-semibold text-[#264A3F] text-center lg:text-left">
                Customization Options
              </h4>

              <div className="flex flex-row flex-wrap justify-center gap-6">
                {/* Diamond Substitute */}
                {selectedProduct?.isDiamondSubstitute &&
                  selectedProduct?.diamondSubstitute?.length > 0 && (
                    <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Diamond Substitute
                      </label>
                      <select
                        value={selectedDiamondSubstitute}
                        onChange={(e) =>
                          setSelectedDiamondSubstitute(e.target.value)
                        }
                        className="w-full sm:w-[300px] h-[50px] border-2 rounded-lg border-gray-300 px-4 text-gray-700 focus:ring-2 focus:ring-[#264A3F] outline-none"
                      >
                        <option value="">Select Substitute</option>
                        {selectedProduct.diamondSubstitute.map(
                          (d, index) => (
                            <option
                              key={index}
                              value={`${d.name} - ₹ ${d.price}`}
                            >
                              {d.name} — ₹
                              {d.price.toLocaleString("en-IN")}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  )}
              </div>

              {/* Add to Cart Button for Jewelry */}
              <div className="flex flex-col gap-4  pt-6">
                <div className="flex items-center justify-center gap-2 text-gray-700 text-sm sm:text-base">
                  <img src={Truck} alt="Truck" className="w-5 h-5" />
{/* -------------------add By Pawan for admin delivery days--------------------- */}
                  <span className="text-sm sm:text-base lg:text-[18px]">
                     Estimated Delivery: {getCombinedDeliveryText(productData, certificate, selectedProduct)}
                  </span>
{/* -------------------add By Pawan for admin delivery days--------------------- */}
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !selectedProduct?._id}
                  className={`w-full max-w-[580px] h-[50px] sm:h-[60px] rounded-[12px] text-white text-base sm:text-base lg:text-[18px] font-bold transition-colors duration-200 mx-auto block ${!selectedProduct
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#264A3F] hover:bg-[#1a3a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                >
                  {isAddingToCart
                    ? "Adding to Cart..."
                    : !selectedProduct
                      ? "Select a Design First"
                      : "Add to Cart"}
                </button>
                {/* -------------------- Add By Pawan For Buy Now (START) -------------------- */}
                <button
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || !selectedProduct?._id}
                  className="w-full max-w-[580px] h-[50px] sm:h-[60px] mx-auto block rounded-md border-2 border-green-950 text-green-950 hover:text-white lg:text-lg sm:text-[13px]   font-bold hover:bg-[#1a3329] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? "Processing..." : "Buy Now"}
               </button>
                {/* -------------------- Add By Pawan For Buy Now (END) -------------------- */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ✅ Add to Cart Success Modal */}
      <AnimatePresence>
        {showCartModal && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[70px] lg:top-[130px] right-4 sm:right-8 w-full max-w-[370px] bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="font-semibold text-gray-800 text-sm">Added to Cart Successfully</span>
              </div>
              <button onClick={() => setShowCartModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex gap-3 sm:gap-4 items-center">
              {isInterestedInJewelry && (selectedProduct?.images?.[0]?.url || (typeof selectedProduct?.images?.[0] === "string" ? selectedProduct?.images?.[0] : null)) ? (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="relative w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center p-1 border border-gray-100 flex-shrink-0">
                    <img
                      src={mediaItems[0]?.url || "/placeholder.svg"}
                      alt={productData?.name || "Gemstone"}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded bg-black/60 text-white text-[7px] font-medium leading-none whitespace-nowrap">
                      Gem
                    </span>
                  </div>
                  <span className="text-gray-400 font-bold text-xs select-none">+</span>
                  <div className="relative w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center p-1 border border-gray-100 flex-shrink-0">
                    <img
                      src={typeof selectedProduct.images[0] === "string" ? selectedProduct.images[0] : (selectedProduct.images[0]?.url || "/placeholder.svg")}
                      alt={selectedProduct?.jewelryName || "Jewelry"}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded bg-[#264A3F] text-white text-[7px] font-medium leading-none whitespace-nowrap">
                      {selectedProduct?.jewelryType || "Jewelry"}
                    </span>
                  </div>
                </div>
              ) : (
                <img
                  src={mediaItems[0]?.url || "/placeholder.svg"}
                  alt="Product"
                  className="w-16 h-16 object-cover rounded-md border border-gray-100 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                  {isInterestedInJewelry
                    ? `${productData?.name || "Gemstone"} + ${selectedProduct?.jewelryName || "Jewelry"}`
                    : productData?.name}
                </p>
                <p className="text-sm font-bold text-[#264A3F] mt-1">
                  {formatPrice(
                    isInterestedInJewelry
                      ? totalPrice
                      : ((appliedCoupon ? discountedTotalItemPrice : totalItemPrice) * quantity)
                  )}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-4 pb-4 flex flex-col gap-2">
              <button
                onClick={() => { setShowCartModal(false); navigate("/shopping/cart"); }}
                className="w-full py-2.5 bg-[#264A3F] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#1a3329] transition-colors"
              >
                View Cart / Checkout
              </button>
              <button
                onClick={() => setShowCartModal(false)}
                className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="text-[14px] lg:text-[15px]">
        {/* Breadcrumbs */}
        <div className="w-full flex flex-wrap items-center px-3 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-3 gap-1 sm:gap-2">
          <a
            href="/"
            className="text-[#444445] cursor-pointer text-[16px] sm:text-[18px] md:text-[20px] lg:text-[16px] hover:text-[#264A3F] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            Home
          </a>
          <span className="text-[#444445] text-[16px] sm:text-[18px]">
            {">"}
          </span>
          <a
            onClick={() => navigate(-1)}
            className="text-[#444445] cursor-pointer text-[16px] sm:text-[18px] md:text-[20px] lg:text-[16px] hover:text-[#264A3F] transition-colors"
          >
            Gemstone
          </a>
          <span className="text-[#444445] text-[16px] sm:text-[18px]">
            {">"}
          </span>
          <span className="text-[#444445] cursor-pointer font-medium text-[16px] sm:text-[18px] md:text-[20px] lg:text-[16px] truncate max-w-[200px] sm:max-w-none">
            {productData?.name || "Product"}
          </span>
        </div>

{/* ------------------------Main Content---------------fix by pawan-------------------*/}
        <div className="w-full  flex flex-col lg:flex-row px-4 sm:px-6 md:px-8 lg:px-20 gap-6 lg:gap-0">
          {/* Left Column - Images */}
          <div className="w-full lg:w-[45%] flex flex-col items-center lg:items-start pt-4 lg:pt-6">
            <div className="w-full max-w-[500px] flex flex-col items-center">
              {/* Stock Status Badge */}
              <div className="flex items-center gap-2 mb-4">
                {isInStock ? (
                  <>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-[33px] lg:h-[33px] bg-[#0B9519] rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-[#0B9519] text-sm sm:text-base lg:text-[18px] font-bold">
                      This item is available
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-[33px] lg:h-[33px] bg-[#DC2626] rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-[#DC2626] text-sm sm:text-base lg:text-[18px] font-bold">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>

              {/* Main Image/Video */}
              <div className="relative w-full max-w-[320px] h-[200px] sm:h-[250px] lg:h-[284px] flex items-center justify-center mb-4 overflow-visible">
                <button
                  onClick={handlePrevImage}
                  className="absolute left-[-20px] sm:left-[-30px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 text-2xl font-bold text-gray-800"
                >
                  ‹
                </button>
                {currentMedia?.type === "video" ? (
                  <video
                    src={currentMedia.url}
                    className={`w-full h-full object-contain rounded-lg transition-opacity duration-200 ${isTransitioning ? "opacity-0" : "opacity-100"
                      }`}
                    controls
                  />
                ) : (
                  <div className="relative w-full h-full overflow-visible flex items-center justify-center">
                    <ReactImageMagnify
                      {...{
                        smallImage: {
                          alt: currentMedia?.alt || productData.name,
                          isFluidWidth: true,
                          src: currentMedia?.url || "/placeholder.svg",
                        },
                        largeImage: {
                          src: currentMedia?.url || "/placeholder.svg",
                          width: 900,
                          height: 600,
                        },
                        enlargedImagePosition: "beside",
                        enlargedImageContainerDimensions: {
                          width: 680,
                          height:400,
                        },
                        enlargedImageContainerClassName:
                          "zoom-right-fix z-50 bg-white shadow-xl border rounded-lg overflow-hidden",
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={handleNextImage}
                  className="absolute right-[-20px] sm:right-[-30px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-gray-800 hover:bg-gray-100 "
                >
                  ›
                </button>

                {isTransitioning && (
                  <div className="absolute inset-0 rounded-lg bg-gray-100 animate-pulse pointer-events-none" />
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-5 gap-1 sm:gap-2 lg:gap-3 w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[500px] px-2 sm:px-5">
                {mediaItems.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-full aspect-square rounded-md bg-white flex items-center justify-center shadow-sm transition-all ${selectedImageIndex === idx
                      ? "border-b-[3px] border-[#264A3F]"
                      : "border-b-[3px] border-transparent"
                      }`}
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt="thumbnail"
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover rounded"
                        muted
                      />
                    )}

                    {media.type === "video" && (
                      <span className="absolute top-1 left-1">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <circle cx="9" cy="9" r="9" fill="rgba(0,0,0,0.35)" />
                          <polygon points="7,5 13,9 7,13" fill="#fff" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="w-full lg:w-[50%] pt-4 lg:pt-6">
            <div className="w-full">
              {/* Title and Actions */}
              <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <h1 className="text-xl font-bold text-gray-800">
                  {productData.name || "Gemstone"}
                </h1>
                <div className="flex gap-4 items-center sm:self-center">
                  <WishlistButton
                    itemId={productData?._id}
                    itemType="Product"
                    product={productData}
                  />
                  {/* ------------fix  by Pawan-------------------------------------------- */}
                  <SharePopup
                  productUrl={window.location.href}
                  productName={productData?.name || "Our Product"}
                   />{" "}
                   {/* ------------fix  by Pawan-------------------------------------------- */}
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-3 mb-4">
                <p className="text-gray-700">
                  <span>SKU</span> : {productData.sku}
                </p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  {appliedCoupon ? (
                    <>
                      <h2 className="font-bold text-2xl sm:text-3xl lg:text-[28px] text-[#264A3F]">
                        {formatPrice(discountedTotalItemPrice * quantity)}
                      </h2>
                      <h2 className="font-medium line-through text-lg sm:text-xl text-gray-400">
                        {formatPrice(totalItemPrice * quantity)}
                      </h2>
                      <span className="bg-emerald-100 text-[#264A3F] border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {appliedCoupon.discountPercent || CAMPAIGN_CONFIG.gemstoneOffer.discountPercent}% OFF Applied
                      </span>
                    </>
                  ) : (
                    <>
                      <h2 className="font-bold text-2xl sm:text-3xl lg:text-[28px] text-black">
                        {formatPrice(totalItemPrice * quantity)}
                      </h2>
                      {originalStrikePrice ? (
                        <h2 className="font-bold line-through text-xl sm:text-xl text-gray-500">
                          {formatPrice(originalStrikePrice * quantity)}
                        </h2>
                      ) : null}
                    </>
                  )}
                </div>
              </div>

              {/* Gemstone Campaign Offer Box */}
              {isGemstoneOfferActive && isGemstoneApplicable(productData) && (
                <div className="mb-6 p-4 rounded-xl border border-emerald-400 bg-gradient-to-r from-emerald-50/90 via-green-50/40 to-emerald-50/90 shadow-2xs">

                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        {`Festive Offer • Flat ${getGemstoneDiscountPercent(productData)}% Discount`}
                      </span>
                    </div>
                    <Link
                      to={CAMPAIGN_CONFIG.gemstoneOffer.termsUrl || "/offers"}
                      className="text-[11px] font-semibold text-amber-800 hover:underline whitespace-nowrap"
                    >
                      View Offer T&C
                    </Link>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {`Apply coupon ${CAMPAIGN_CONFIG.gemstoneOffer.code} to get  ${getGemstoneDiscountPercent(productData)}% OFF on this natural certified gemstone!`}
                  </p>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs font-bold text-emerald-800">
                          Coupon {appliedCoupon.code} Applied! Saved {formatPrice(appliedCoupon.discountAmount * quantity)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs font-bold text-red-600 hover:text-red-800 ml-2 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            if (couponError) setCouponError("");
                          }}
                          placeholder={`Enter coupon (e.g. ${CAMPAIGN_CONFIG.gemstoneOffer.code})`}
                          className="flex-1 px-3 py-1.5 text-xs font-mono uppercase bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264A3F] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(couponCode || CAMPAIGN_CONFIG.gemstoneOffer.code)}
                          className="px-4 py-1.5 bg-[#264A3F] hover:bg-[#1a3329] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-xs font-medium text-red-600 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {couponError}
                        </p>
                      )}

                      {Number(getProductDisplayPrice(productData)) < CAMPAIGN_CONFIG.gemstoneOffer.minGemstonePrice && !couponError && (
                        <p className="text-[11px] text-amber-700 mt-1">
                          * Note: Gemstone value is {formatPrice(getProductDisplayPrice(productData))}. Coupon requires minimum gemstone value of {formatPrice(CAMPAIGN_CONFIG.gemstoneOffer.minGemstonePrice)}.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Specifications */}
              <div className="flex flex-col gap-2 mb-6">
                <p className="text-base text-gray-700">
                  <span className="text-black">{productData.name}:</span>{" "}
                  Natural & Certified Gemstone
                </p>
                <p className="text-base text-gray-700">
                  <span className="text-black">Origin:</span>{" "}
                  {productData.origin || "Not specified"}
                </p>
                <p className="text-base text-gray-700">
                  <span className="text-black">Carat:</span>{" "}
                  {productData.carat || "Not specified"} carats
                </p>
                <p className="text-base text-gray-700">
                  <span className="text-black">Ratti:</span>{" "}
                  {productData.ratti || "Not specified"} ratti
                </p>
              </div>

              {/* Certification */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-start gap-4 sm:gap-8 lg:gap-20 mb-6 ">
                <label className="text-base text-gray-700 text-center">
                  Certification :
                </label>
                <select
                  value={certificate}
                  onChange={(e) => setCertificate(e.target.value)}
                  className="border border-gray-500 p-2 rounded-[10px] w-full sm:w-[300px] lg:w-[366px] h-[46px] text-sm sm:text-base text-center"
                >
                  {productData.certificate &&
                    Array.isArray(productData.certificate) &&
                    productData.certificate.length > 0 ? (
                    productData.certificate.map((cert, index) => {
                      const certValue = cert._id || cert.type || cert;
                      const certName =
                        cert.type ||
                        cert.name ||
                        cert.certificateType ||
                        certValue;
                      return (
                        <option key={index} value={certValue}>
                          {certName}
                          {cert.price > 0 && ` (+${formatPrice(cert.price)})`}
                          {cert.price === 0 &&
                            certName.toLowerCase().includes("free") &&
                            ` (Free)`}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">No options available</option>
                  )}
                </select>
              </div>

              {/* Jewelry Toggle */}
              <div className="w-full mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-md text-gray-700 font-medium">
                    Select Ring/Pendant
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInterestedInJewelry}
                      onChange={(e) =>
                        setIsInterestedInJewelry(e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#264A3F]"></div>
                  </label>
                </div>
              </div>

 {/* --------------fix by pawan Why Gemrishi — only shown when NOT customizing jewelry--------------------- */}
              {!isInterestedInJewelry && (
                <div className="w-full mb-6">
                  <p className="text-base sm:text-base lg:text-[15px] mb-4">
                    Why GemRishi ?
                  </p>
                 <div className="flex flex-row gap-2 sm:gap-4 lg:gap-5">
               <div className="w-[160px] h-[70px] lg:w-[200px] lg:h-[80px] bg-gray-200 flex items-center justify-center gap-3 rounded-lg px-4">
             <img src={Energized} alt="Energized" className="w-8 h-8" />
             <p className="text-[12px] font-bold leading-tight">
                Effectively <br/>Energized
              </p>
              </div>
              <div className="w-[160px] h-[70px] lg:w-[200px] lg:h-[80px] bg-gray-200 flex items-center justify-center gap-3 rounded-lg px-4">
             <img src={Original} alt="Original" className="w-8 h-8" />
            <p className="text-[12px] font-bold leading-tight">
             100% Original <br /> and Authentic
            </p>
            </div>
        <div className="w-[160px] h-[70px] lg:w-[200px] lg:h-[80px] bg-gray-200 flex items-center justify-center gap-3 rounded-lg px-4">
          <img src={Shipping} alt="Shipping" className="w-8 h-8" />
             <p className="text-[12px] font-bold leading-tight">
               Free Shipping <br /> Available
             </p>
            </div>
           </div>
                  <div className="w-full flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start mt-2 gap-4 lg:gap-30">
                    <div className="flex items-center gap-2">
                      <img
                        src={Clock || "/placeholder.svg"}
                        alt="Clock"
                        className="w-5 h-5"
                      />
                      {/* -------------------- Add By Pawan For Dynamic Delivery (START) -------------------- */}
                      <span className="text-sm sm:text-base lg:text-base">
                        Estimated Delivery: {getCertificateDeliveryDays(productData, certificate)}  Business days
                      </span>
                      {/* -------------------- Add By Pawan For Dynamic Delivery (END) -------------------- */}
                  </div>
                </div>
 {/* --------------fix by pawan Why Gemrishi — only shown when NOT customizing jewelry--------------------- */}
                {!isInterestedInJewelry && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={
                        isAddingToCart || !productData?._id || !isInStock
                      }
                      className={`w-full h-[50px] lg:w-[580px] sm:h-[60px] rounded-[12px] text-white text-base sm:text-base lg:text-[18px] font-bold transition-colors duration-200 ${!isInStock
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#264A3F] hover:bg-[#1a3a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                    >
                      {isAddingToCart
                        ? "Adding to Cart..."
                        : !isInStock
                          ? "Out of Stock"
                          : "Add to Cart"}
                    </button>

                    {/* -------------------- Add By Pawan For Buy Now (START) -------------------- */}
                    <button
                      onClick={handleBuyNow}
                      disabled={isAddingToCart || !productData?._id || !isInStock}
                      className="w-full h-[50px] lg:w-[580px] sm:h-[60px] border-2 border-green-900 rounded-sm text-green-950 hover:text-white lg:text-lg  font-bold sm:text-[13px]  hover:bg-[#093c28] hover:shadow-lg transition-all duration-300"
                    >
                   {isAddingToCart ? "Processing..." : "Buy Now"}
                   </button>
                    {/* -------------------- Add By Pawan For Buy Now (END) -------------------- */}
                  </div>
                )}
              </div>
                </div>
              )}
              {/* ----------------------------this is upper div----------------------------------------------- */}
            </div>
          </div>
        </div>

        {/* ------------------------Add By Pawan for fixing  alignment----------------------*/}
        {isInterestedInJewelry && (
          <div className="w-full flex justify-center px-4 sm:px-6 md:px-8 lg:px-10">
            {renderJewelryCustomizationSection()}
          </div>
        )}
      </div>
    </>
  );
}

export default HeaderDetailPage;