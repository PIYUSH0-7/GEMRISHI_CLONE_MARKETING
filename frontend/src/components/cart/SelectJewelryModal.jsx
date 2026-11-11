import { fbqTrack } from "../../utils/metaPixel.js";
"use client";

import axios from "axios";
import { Check, ExternalLink, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getJewelryByFilter } from "../../api/jewelryfilter";
import { getLatestMetalRates } from "../../api/metalRates";
import { addItemToCart } from "../../redux/cartSlice";
import { ConvertFromINR, formatCurrency } from "../../utils/currency";
import { getAbsoluteProductUrl } from "../../utils/productUrl";
import { CODE_CONFIG } from "../../config/code.config.js";

import PendantIcon from "../../assets/DetailPage/PendantP.svg";
import RingIcon from "../../assets/DetailPage/RingP.svg";

const DEFAULT_RING_SIZE_SYSTEMS = [
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

const METAL_OPTIONS = [
  { label: "Pure 925 Silver", value: "silver", base: "silver" },
  { label: "Gold 18K", value: "gold18k", base: "gold" },
  { label: "Gold 22K", value: "gold22k", base: "gold" },
  { label: "Platinum", value: "platinum", base: "platinum" },
  { label: "Panchadhatu", value: "panchadhatu", base: "panchadhatu" },
];

export default function SelectJewelryModal({
  isOpen,
  onClose,
  gemstoneItem,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const URL = import.meta.env.VITE_URL;
  const { currency, rates } = useSelector((s) => s.currency);
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("Ring");
  const [selectedMetal, setSelectedMetal] = useState("silver");
  const [jewelryList, setJewelryList] = useState([]);
  const [jewelryLoading, setJewelryLoading] = useState(false);
  const [metalRates, setMetalRates] = useState(null);

  // Selected Design & Customization States
  // done by piyush gangwar
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSizeSystem, setSelectedSizeSystem] = useState("Indian Ring Size System");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedDiamondSubstitute, setSelectedDiamondSubstitute] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Custom Design Request State
  const [customRequestModalOpen, setCustomRequestModalOpen] = useState(false);
  const [customNote, setCustomNote] = useState("");

  // Token helper
  const getUserToken = () => {
    if (userInfo?.token) return userInfo.token;
    if (userInfo?.user?.token) return userInfo.user.token;
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.token) return parsed.token;
        if (parsed?.user?.token) return parsed.user.token;
      } catch (e) {}
    }
    return localStorage.getItem("token") || null;
  };

  // Fetch Metal Rates on open
  useEffect(() => {
    if (!isOpen) return;
    const loadRates = async () => {
      try {
        const r = await getLatestMetalRates();
        setMetalRates(r);
      } catch (err) {
        console.error("Error fetching metal rates:", err);
      }
    };
    loadRates();
  }, [isOpen]);

  // Fetch Designs when Category or Metal changes
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const fetchDesigns = async () => {
      setJewelryLoading(true);
      try {
        const selectedMetalObj = METAL_OPTIONS.find((m) => m.value === selectedMetal);
        const baseMetal = selectedMetalObj?.base || selectedMetal;

        // Try fetching designs matching gemstone subcategory first
        const subCatId =
          gemstoneItem?.item?.subCategory?._id ||
          (typeof gemstoneItem?.item?.subCategory === "string" ? gemstoneItem.item.subCategory : "");

        let res = null;
        if (subCatId) {
          try {
            res = await getJewelryByFilter({
              limit: 24,
              jewelryType: selectedCategory,
              metal: baseMetal,
              productSubCategory: subCatId,
            });
          } catch (e) {
            // fallback
          }
        }

        // If no results for specific subcategory, fetch all general designs for this category and metal
        if (!res?.jeweleries || res.jeweleries.length === 0) {
          res = await getJewelryByFilter({
            limit: 24,
            jewelryType: selectedCategory,
            metal: baseMetal,
          });
        }

        if (isMounted) {
          setJewelryList(res?.jeweleries || []);
          // If previously selected design doesn't match new list, clear it
          setSelectedProduct(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching designs:", err);
          setJewelryList([]);
        }
      } finally {
        if (isMounted) setJewelryLoading(false);
      }
    };

    fetchDesigns();

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedCategory, selectedMetal, gemstoneItem]);

  // Price formatting
  const formatPrice = (p) => formatCurrency(ConvertFromINR(Number(p) || 0, rates, currency), currency);

  // Dynamic price calculation matching HeaderDetailPage.jsx
  const calculateDesignPrice = (item) => {
    if (!item) return 0;
    const basePrice = Number(item.jewelryPrice || 0);
    const weight = Number(item.jewelryMetalWeight || 0);
    const metalKey = selectedMetal?.toLowerCase() || item.metal?.toLowerCase();

    let computed = basePrice;

    if (metalKey?.startsWith("gold")) {
      const selectedKarat = metalKey.includes("18") ? "gold18k" : "gold22k";
      if (!basePrice && metalRates?.gold) {
        const rate = Number(metalRates.gold?.[selectedKarat]?.withGSTRate || 0);
        computed = Math.round(rate * weight);
      } else if (basePrice && selectedKarat !== "gold22k" && metalRates?.gold) {
        const rSelected = Number(metalRates.gold?.[selectedKarat]?.withoutGSTRate || 0);
        const r22 = Number(metalRates.gold?.gold22k?.withoutGSTRate || 0);
        const charge = item.makingChargePercent != null ? Number(item.makingChargePercent) : 10;
        if (rSelected && r22) {
          const diff = Math.round((rSelected - r22) * (1 + charge / 100) * weight * 1.03);
          computed = Math.max(0, basePrice + diff);
        }
      }
    } else {
      const rateKey = metalKey === "panchdhatu" ? "panchadhatu" : metalKey;
      if (!basePrice && metalRates?.[rateKey]) {
        const rate = Number(metalRates[rateKey]?.withGSTRate || 0);
        computed = Math.round(rate * weight);
      }
    }

    if (selectedDiamondSubstitute && item.isDiamondSubstitute) {
      const subPrice = parseFloat(selectedDiamondSubstitute.split("₹")[1]) || 0;
      computed += subPrice;
    }

    return computed;
  };

  const isRingCategory = useMemo(() => {
    return (
      selectedCategory.toLowerCase() === "ring" ||
      (selectedProduct?.jewelryType || "").toLowerCase() === "ring" ||
      (selectedProduct?.jewelryName || "").toLowerCase().includes("ring")
    );
  }, [selectedCategory, selectedProduct]);

  const availableSizeSystems = useMemo(() => {
    if (
      selectedProduct?.sizeSystem &&
      selectedProduct.sizeSystem.length > 0 &&
      selectedProduct.sizeSystem.some((s) => s.sizeNumbers?.some((n) => n !== "NA"))
    ) {
      return selectedProduct.sizeSystem;
    }
    return isRingCategory ? DEFAULT_RING_SIZE_SYSTEMS : [];
  }, [selectedProduct, isRingCategory]);

  // Handle Add to Cart
  const handleAddToBag = async () => {
    if (!selectedProduct?._id) {
      toast.error("Please select a design first.", { position: "top-center" });
      return;
    }

    if (isRingCategory && !selectedSize) {
      toast.error("Please select a ring size or choose 'Send me a ring sizer'.", {
        position: "top-center",
      });
      return;
    }

    setIsAdding(true);
    const userToken = getUserToken();

    try {
      const isRingSizer =
        selectedSize === "Send me a ring sizer" ||
        selectedSizeSystem === "Send me a ring sizer";

      const sizeSystemPayload = isRingSizer
        ? {
            sizeType:
              selectedSizeSystem === "Send me a ring sizer"
                ? "Ring Sizer"
                : selectedSizeSystem || "Ring Sizer",
            sizeNumber: "Send me a ring sizer",
          }
        : selectedSize
        ? {
            sizeType: selectedSizeSystem || "Standard",
            sizeNumber: selectedSize,
          }
        : null;

      const diamondSubPayload = selectedDiamondSubstitute
        ? {
            name: selectedDiamondSubstitute.split(" - ₹ ")[0],
            price: parseFloat(selectedDiamondSubstitute.split("₹")[1]) || 0,
          }
        : null;

      const goldKaratPayload =
        selectedMetal && (selectedProduct.metal === "gold" || selectedMetal.startsWith("gold"))
          ? {
              karatType: selectedMetal,
              price:
                (metalRates?.gold?.[selectedMetal]?.withGSTRate || 0) *
                (selectedProduct.jewelryMetalWeight || 0),
            }
          : null;

      const jewelryCustomization = {
        metal: selectedMetal || selectedProduct.metal,
        sizeSystem: sizeSystemPayload,
        size: sizeSystemPayload
          ? {
              sizeType: sizeSystemPayload.sizeType,
              size: sizeSystemPayload.sizeNumber,
            }
          : null,
        diamondSubstitute: diamondSubPayload,
        goldKarat: goldKaratPayload,
      };

      const jewelryPayload = {
        itemId: selectedProduct._id,
        quantity: 1,
        customization: jewelryCustomization,
      };

      const headers = { "Content-Type": "application/json" };
      if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
      }

      const atcEventId = `add_to_cart_jewelry_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const enrichedPayload = { ...jewelryPayload, eventId: atcEventId };
      const res = await axios.post(`${URL}/cart/add_item_in_cart`, enrichedPayload, {
        headers,
        withCredentials: true,
      });

      if (res.data?.success) {
        dispatch(addItemToCart(jewelryPayload));
        fbqTrack(
          "AddToCart",
          {
            content_ids: [String(selectedProduct.sku || selectedProduct._id || "")],
            content_type: "product",
            content_name: selectedProduct.jewelryName || "Jewelry",
            content_category: selectedProduct.jewelryType || "Jewelry",
            value: Number(currentPrice) || 0,
            currency: "INR",
          },
          { eventID: atcEventId }
        );
        toast.success(
          ` ${selectedProduct.jewelryName} added to your shopping cart!`,
          { position: "top-center" }
        );
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to add jewelry setting to cart.", {
          position: "top-center",
        });
      }
    } catch (err) {
      console.error("Error adding jewelry setting to cart:", err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.", {
        position: "top-center",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const currentPrice = selectedProduct ? calculateDesignPrice(selectedProduct) : 0;
  const gemstoneName = gemstoneItem?.item?.name || "Your Gemstone";

  const customWhatsAppUrl = useMemo(() => {
    const metalLabel = METAL_OPTIONS.find((m) => m.value === selectedMetal)?.label || selectedMetal;
    let msg = `Hello GemRishi! I would like to request a Custom ${selectedCategory} Design in ${metalLabel} for my ${gemstoneName}.`;
    if (customNote.trim()) {
      msg += ` Note: ${customNote.trim()}`;
    }
    const phone = CODE_CONFIG.customDesignRequest?.whatsappNumber || "919817975978";
    return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(msg)}`;
  }, [selectedCategory, selectedMetal, gemstoneName, customNote]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-[#FAF9F5] via-white to-[#F0F7F4] border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#264A3F]/10 flex items-center justify-center text-xl flex-shrink-0">
              💍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#264A3F] leading-tight">
                  Select Ring or Pendant Mount
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-[#20A079] text-white rounded-full uppercase tracking-wider">
                  Live Preview
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {gemstoneItem?.item?.name ? (
                  <>
                    Customizing setting for: <span className="font-semibold text-gray-800">{gemstoneItem.item.name}</span>
                  </>
                ) : (
                  <span>Choose your handcrafted ring or pendant setting</span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* STEP 1: CATEGORY & METAL SELECTOR */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                  1. Choose Mounting Type:
                </label>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {[
                  { label: "Ring", icon: RingIcon },
                  { label: "Pendant", icon: PendantIcon },
                ].map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.label);
                      setSelectedProduct(null);
                    }}
                    className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[44px] ${
                      selectedCategory === cat.label
                        ? "bg-[#264A3F] text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <img
                      src={cat.icon}
                      alt={cat.label}
                      className={`w-4 h-4 object-contain ${
                        selectedCategory === cat.label ? "brightness-0 invert" : ""
                      }`}
                    />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Metal Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                Select Metal Purity:
              </label>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {METAL_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => {
                      setSelectedMetal(m.value);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer min-h-[38px] flex items-center gap-1.5 ${
                      selectedMetal === m.value
                        ? "bg-[#264A3F] text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {selectedMetal === m.value && <Check className="w-3 h-3 text-white" />}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2: AVAILABLE DESIGNS GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                {selectedProduct ? "2. Selected Setting:" : "2. Select a Design:"}
              </label>
              {selectedProduct && (
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-xs font-semibold text-[#264A3F] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>← Change / View All Designs</span>
                </button>
              )}
            </div>

            {jewelryLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-9 h-9 border-3 border-gray-200 border-t-[#264A3F] rounded-full animate-spin mb-3"></div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Loading handcrafted designs...</p>
              </div>
            ) : jewelryList.length === 0 ? (
              <div className="space-y-4">
                {CODE_CONFIG.customDesignRequest?.enabled && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {/* 🎨 Bespoke Custom Design Request Card */}
                    <div
                      onClick={() => setCustomRequestModalOpen(true)}
                      className="relative p-3 rounded-xl border-2 border-dashed border-[#20A079] bg-gradient-to-b from-[#F2F9F5] via-white to-[#F2F9F5] hover:border-[#264A3F] hover:shadow-md transition-all duration-200 flex flex-col items-center text-center cursor-pointer group"
                    >
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#20A079] text-white text-[9px] font-bold rounded-full uppercase tracking-wider shadow-2xs">
                        Custom CAD
                      </span>

                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center p-2 mb-2">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#264A3F]/10 text-[#264A3F] flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 group-hover:bg-[#264A3F]/15 transition-all duration-300 shadow-inner">
                          ✍️
                        </div>
                      </div>

                      <h5 className="text-xs sm:text-sm font-bold text-[#264A3F] line-clamp-1 w-full">
                        Custom Design Request
                      </h5>

                      <p className="text-[11px] text-gray-500 capitalize mt-0.5">
                        {selectedCategory} • {selectedMetal}
                      </p>

                      <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                        Share Sketch, Photo or CAD
                      </p>

                      <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1.5">
                        Bespoke Quote
                      </p>

                      <div className="mt-2 pt-2 border-t border-emerald-100 w-full flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomRequestModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#264A3F] hover:bg-[#1b362f] text-white text-[10px] sm:text-[11px] font-semibold rounded-lg transition-colors cursor-pointer min-h-[30px]"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-300" />
                          <span>Request Design</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="py-6 text-center rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="text-sm text-gray-600 font-medium">No pre-made designs found for {selectedCategory} in {selectedMetal}.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {CODE_CONFIG.customDesignRequest?.enabled
                      ? "You can request a custom bespoke design above or choose another metal."
                      : "Please try choosing another metal type or category."}
                  </p>
                </div>
              </div>
            ) : (
              <div className={selectedProduct ? "flex justify-center" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4"}>
                {/* 🎨 Bespoke Custom Design Request Card (only when no design selected) */}
                {!selectedProduct && CODE_CONFIG.customDesignRequest?.enabled && (
                  <div
                    onClick={() => setCustomRequestModalOpen(true)}
                    className="relative p-3 rounded-xl border-2 border-dashed border-[#20A079] bg-gradient-to-b from-[#F2F9F5] via-white to-[#F2F9F5] hover:border-[#264A3F] hover:shadow-md transition-all duration-200 flex flex-col items-center text-center cursor-pointer group"
                  >
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#20A079] text-white text-[9px] font-bold rounded-full uppercase tracking-wider shadow-2xs">
                      Custom CAD
                    </span>

                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center p-2 mb-2">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#264A3F]/10 text-[#264A3F] flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 group-hover:bg-[#264A3F]/15 transition-all duration-300 shadow-inner">
                        ✍️
                      </div>
                    </div>

                    <h5 className="text-xs sm:text-sm font-bold text-[#264A3F] line-clamp-1 w-full">
                      Custom Design Request
                    </h5>

                    <p className="text-[11px] text-gray-500 capitalize mt-0.5">
                      {selectedCategory} • {selectedMetal}
                    </p>

                    <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                      Share Sketch, Photo or CAD
                    </p>

                    <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1.5">
                      Bespoke Quote
                    </p>

                    <div className="mt-2 pt-2 border-t border-emerald-100 w-full flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomRequestModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#264A3F] hover:bg-[#1b362f] text-white text-[10px] sm:text-[11px] font-semibold rounded-lg transition-colors cursor-pointer min-h-[30px]"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-300" />
                        <span>Request Design</span>
                      </button>
                    </div>
                  </div>
                )}

                {(selectedProduct ? jewelryList.filter((item) => item._id === selectedProduct._id) : jewelryList).map((item) => {
                  const isSelected = selectedProduct?._id === item._id;
                  const itemImg =
                    item.images?.[0]?.url ||
                    (typeof item.images?.[0] === "string" ? item.images[0] : "/placeholder.svg");
                  const itemPrice = calculateDesignPrice(item);

                  return (
                    <div
                      key={item._id}
                      onClick={() => setSelectedProduct(isSelected ? null : item)}
                      className={`relative p-3 rounded-xl border-2 flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-[#20A079] bg-emerald-50/70 shadow-md scale-[1.01] w-full max-w-sm"
                          : "border-gray-200 bg-white hover:border-[#264A3F]/50 hover:shadow-sm"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#264A3F] text-white text-[9px] font-bold rounded-full uppercase tracking-wider">
                          Selected Setting
                        </span>
                      )}

                      <div className={`w-20 h-20 ${isSelected ? "sm:w-28 sm:h-28" : "sm:w-24 sm:h-24"} flex items-center justify-center p-2 mb-2`}>
                        <img
                          src={itemImg}
                          alt={item.jewelryName}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>

                      <h5 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1 w-full">
                        {item.jewelryName || "Unnamed Design"}
                      </h5>

                      <p className="text-[11px] text-gray-500 capitalize mt-0.5">
                        {item.jewelryType} • {selectedMetal}
                      </p>

                      {item.jewelryMetalWeight != null && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Weight: {item.jewelryMetalWeight} g
                        </p>
                      )}

                      <p className="text-xs sm:text-sm font-bold text-[#264A3F] mt-1.5">
                        {formatPrice(itemPrice)}
                      </p>

                      <div className="mt-2 pt-2 border-t border-gray-100 w-full flex items-center justify-center gap-3">
                        <a
                          href={getAbsoluteProductUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-[#264A3F] hover:underline font-medium"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(null);
                            }}
                            className="text-[10px] sm:text-[11px] text-[#264A3F] hover:text-[#173029] font-bold underline cursor-pointer"
                          >
                            Change Setting
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 3: RING SIZE & CUSTOMIZATION (WHEN DESIGN IS SELECTED) */}
          {selectedProduct && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <label className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider block">
                3. Configure Size & Customization:
              </label>

              {/* Ring Size Configuration */}
              {isRingCategory && availableSizeSystems.length > 0 && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Size System */}
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Ring Size System:
                      </label>
                      <select
                        value={selectedSizeSystem}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedSizeSystem(val);
                          if (val === "Send me a ring sizer") {
                            setSelectedSize("Send me a ring sizer");
                          } else {
                            setSelectedSize("");
                          }
                        }}
                        className="w-full h-[44px] px-3 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#264A3F] outline-none"
                      >
                        <option value="">Select Size System</option>
                        {availableSizeSystems.map((s) => (
                          <option key={s.sizeType} value={s.sizeType}>
                            {s.sizeType}
                          </option>
                        ))}
                        <option value="Send me a ring sizer">Don't know size? Send me a ring sizer</option>
                      </select>
                    </div>

                    {/* Size Number */}
                    {selectedSizeSystem && selectedSizeSystem !== "Send me a ring sizer" && (
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Select Ring Size:
                        </label>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-full h-[44px] px-3 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#264A3F] outline-none"
                        >
                          <option value="">Select Size</option>
                          <option value="Send me a ring sizer">Send me a ring sizer</option>
                          {availableSizeSystems
                            .find((s) => s.sizeType === selectedSizeSystem)
                            ?.sizeNumbers?.filter((n) => n !== "NA")
                            ?.map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Ring Sizer Info */}
                  {(selectedSize === "Send me a ring sizer" ||
                    selectedSizeSystem === "Send me a ring sizer") && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      <span>💍</span>
                      <span>Complimentary ring sizer will be dispatched or our team will contact you.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSizeSystem("Ring Sizer");
                        setSelectedSize("Send me a ring sizer");
                      }}
                      className="text-[#264A3F] font-semibold hover:underline cursor-pointer"
                    >
                      📏 Don't know size? Send me a ring sizer
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
              )}

              {/* Diamond Substitute */}
              {selectedProduct?.isDiamondSubstitute &&
                selectedProduct?.diamondSubstitute?.length > 0 && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Diamond Substitute (Optional):
                    </label>
                    <select
                      value={selectedDiamondSubstitute}
                      onChange={(e) => setSelectedDiamondSubstitute(e.target.value)}
                      className="w-full h-[44px] px-3 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#264A3F] outline-none"
                    >
                      <option value="">None (Standard)</option>
                      {selectedProduct.diamondSubstitute.map((d, idx) => (
                        <option key={idx} value={`${d.name} - ₹ ${d.price}`}>
                          {d.name} — ₹{d.price.toLocaleString("en-IN")}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER (Sticky) */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {selectedProduct ? (
              <div>
                <p className="text-xs text-gray-500 font-medium line-clamp-1">
                  Selected Setting: <span className="font-semibold text-gray-900">{selectedProduct.jewelryName}</span>
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-base sm:text-lg font-bold text-[#264A3F]">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    ({selectedMetal} {isRingCategory && selectedSize ? `• Size ${selectedSize}` : ""})
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Choose a design above to see total price and add setting to your cart.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isAdding}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={isAdding || !selectedProduct}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 min-h-[44px] cursor-pointer ${
                !selectedProduct || isAdding
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#264A3F] hover:bg-[#1a3a2a] hover:shadow-md active:scale-95"
              }`}
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding Setting...</span>
                </>
              ) : (
                <>

                  <span>Add Setting to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOM DESIGN REQUEST SUB-MODAL */}
      {CODE_CONFIG.customDesignRequest?.enabled && customRequestModalOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
          onClick={() => setCustomRequestModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 border border-gray-100 my-auto text-left animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#264A3F]/10 flex items-center justify-center text-2xl flex-shrink-0">
                  ✍️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#264A3F]">
                    Custom Design Request
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Bespoke handcrafted setting for your gemstone
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomRequestModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="py-4 space-y-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F4FAF7] to-[#FAF9F5] border border-[#20A079]/30 text-xs text-gray-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gemstone:</span>
                  <span className="font-semibold text-gray-900">{gemstoneName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mounting Type:</span>
                  <span className="font-semibold text-gray-900">{selectedCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Preferred Metal:</span>
                  <span className="font-semibold text-gray-900 capitalize">{selectedMetal}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Have a photo from Pinterest, Instagram, a sketch, or CAD reference? Share it directly with our master jewelry artisans on WhatsApp. We will match your gemstone dimensions and share a 3D CAD render with a transparent price estimate.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Design Notes / Preferences (Optional):
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Lotus shank with double prongs, low height setting, matte finish..."
                  rows={2}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#264A3F] focus:bg-white outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2.5 pt-1">
                <a
                  href={customWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-h-[46px]"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Share Reference on WhatsApp ({CODE_CONFIG.customDesignRequest?.contactPhone || "+91 98179 75978"})</span>
                </a>

                <a
                  href={`tel:${CODE_CONFIG.customDesignRequest?.whatsappNumber || "919817975978"}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer min-h-[44px]"
                >
                  <Phone className="w-4 h-4 text-[#264A3F]" />
                  <span>Call Master Goldsmith: {CODE_CONFIG.customDesignRequest?.contactPhone || "+91 98179 75978"}</span>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setCustomRequestModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Back to Catalog Designs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}