import asyncHandler from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { Jewelry } from "../models/jewelry.model.js";
import { MetalRates } from "../models/metalRates.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { sendMetaCapiEvent } from "../utils/metacapi.js";
import {
  CAMPAIGN_CONFIG,
  getProductDisplayPrice,
  isCampaignActive,
  isGemstoneOfferEligible,
  isGemstoneApplicable,
  getGemstoneDiscountPercent,
  isJewelleryMetalApplicable,
  isSilverOfferEligible,
} from "../config/campaignOffers.config.js";

// ==============================================================================
// 1. HELPER: Get Cart Owner (User or Guest)
// ==============================================================================
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

// ==============================================================================
// 2. HELPER: Parse Customization JSON
// ==============================================================================
function parseLooseObjectString(str) {
  try {
    if (!str || typeof str !== "string") return str;
    let s = str.trim();
    try {
      return JSON.parse(s);
    } catch (_) {}

    s = s.replace(/,\s*(?=[}\]])/g, "");
    s = s.replace(/([{,]\s*)([A-Za-z0-9_@$]+)\s*:/g, '$1"$2":');
    s = s.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_m, g1) => {
      return `"${g1.replace(/"/g, '\\"')}"`;
    });
    return JSON.parse(s);
  } catch (err) {
    throw new Error("Invalid customization format");
  }
}

// ==============================================================================
// 3. HELPER: Recompute Price (Dynamic Pricing)
// ==============================================================================
function recomputeCartItemPrice({ cartItem, latestRates }) {
  const { itemType, item, customization = {}, quantity = 1 } = cartItem;
  const round2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;

  if (!item) return 0;

  const normalizeMetal = (val) => {
    if (!val) return "";
    const s = String(val).trim().toLowerCase();
    if (["panchdhatu", "pachadhatu", "panchadhatu"].includes(s))
      return "panchadhatu";
    if (s.startsWith("gold")) return "gold";
    return s;
  };

  let unitPrice = 0;

  if (itemType === "Product") {
    const rawCustom = customization?.toObject ? customization.toObject() : (customization || {});
    const baseStonePrice = getProductDisplayPrice(item);
    let gemstonePrice = baseStonePrice;

    // Whatever price got passed from the product page (discountedPrice), preserve and show it!
    if (rawCustom.discountedPrice != null && Number(rawCustom.discountedPrice) >= 0) {
      gemstonePrice = Number(rawCustom.discountedPrice);
    } else if (cartItem.totalPrice && (Number(cartItem.totalPrice) / Number(quantity || 1)) < gemstonePrice) {
      gemstonePrice = Math.max(0, (Number(cartItem.totalPrice) / Number(quantity || 1)) - (rawCustom.certificate?.price ? Number(rawCustom.certificate.price) : 0));
    } else {
      const couponCandidate =
        rawCustom.appliedCoupon ||
        (rawCustom.discountAmount != null ? CAMPAIGN_CONFIG.gemstoneOffer.code : "");
      const offerEligibility = isGemstoneOfferEligible(gemstonePrice, couponCandidate, item);
      if (offerEligibility.eligible) {
        gemstonePrice = gemstonePrice - offerEligibility.discountAmount;
        if (customization && typeof customization === "object") {
          customization.appliedCoupon = CAMPAIGN_CONFIG.gemstoneOffer.code;
          customization.originalPrice = baseStonePrice;
          customization.discountedPrice = gemstonePrice;
          customization.discountAmount = offerEligibility.discountAmount;
          customization.discountPercent = offerEligibility.discountPercent;
        }
      }
    }

    unitPrice = gemstonePrice;

    if (customization.certificate?.price) {
      unitPrice += Number(customization.certificate.price);
    }

    const hasDiscountInCustomization = Boolean(
      rawCustom.appliedCoupon ||
      rawCustom.discountAmount != null ||
      (rawCustom.discountedPrice != null && Number(rawCustom.discountedPrice) >= 0)
    );
    if (!hasDiscountInCustomization && !customization.jewelryId && cartItem.totalPrice != null && Number(cartItem.totalPrice) > 0) {
      unitPrice = Number(cartItem.totalPrice) / Number(quantity || 1);
    }

    if (customization.jewelryId) {
      const attachedJewelry =
        typeof customization.jewelryId === "object" && customization.jewelryId?._id
          ? customization.jewelryId
          : null;

      if (attachedJewelry) {
        let jewelryComponentPrice = Number(attachedJewelry.jewelryPrice || 0);

        const baseMetal = normalizeMetal(customization.metal || attachedJewelry.metal);
        const metalWeight = Number(attachedJewelry.jewelryMetalWeight || 0);

        if (baseMetal === "gold") {
          const karat = String(customization.goldKarat?.karatType || "").toLowerCase();
          if (!attachedJewelry.jewelryPrice) {
            const rate = Number(latestRates?.gold?.[karat]?.withGSTRate || 0);
            if (rate) jewelryComponentPrice += metalWeight * rate;
          } else if (karat && karat !== "gold22k") {
            const rSelected = Number(latestRates?.gold?.[karat]?.withoutGSTRate || 0);
            const r22 = Number(latestRates?.gold?.gold22k?.withoutGSTRate || 0);
            const charge = attachedJewelry.makingChargePercent != null ? Number(attachedJewelry.makingChargePercent) : 10;
            if (rSelected && r22) {
              const diff = Math.round((rSelected - r22) * (1 + charge / 100) * metalWeight * 1.03);
              jewelryComponentPrice += diff;
            }
          }
        } else {
          if (!attachedJewelry.jewelryPrice) {
            const rate = Number(latestRates?.[baseMetal]?.withGSTRate || 0);
            if (rate) jewelryComponentPrice += metalWeight * rate;
          }
        }

        if (customization.diamondSubstitute?.price) {
          jewelryComponentPrice += Number(customization.diamondSubstitute.price);
        }

        unitPrice += jewelryComponentPrice;
      } else {
        if (cartItem.totalPrice && Number(cartItem.totalPrice) > unitPrice) {
          return Number(cartItem.totalPrice);
        }
      }
    }
  } else if (itemType === "Jewelry") {
    const jewelry = item;
    unitPrice = Number(jewelry.jewelryPrice || 0);

    if (customization.gemstoneWeight?.price)
      unitPrice += Number(customization.gemstoneWeight.price);
    if (customization.quality?.price)
      unitPrice += Number(customization.quality.price);
    else if (customization.gemstoneQuality?.price)
      unitPrice += Number(customization.gemstoneQuality.price);
    if (customization.certificate?.price)
      unitPrice += Number(customization.certificate.price);

    const baseMetal = normalizeMetal(jewelry.metal);
    const metalWeight = Number(jewelry.jewelryMetalWeight || 0);

    if (baseMetal === "gold") {
      const karat = String(customization.goldKarat?.karatType || "").toLowerCase();
      if (!jewelry.jewelryPrice) {
        const rate = Number(latestRates?.gold?.[karat]?.withGSTRate || 0);
        if (rate) unitPrice += metalWeight * rate;
      } else if (karat && karat !== "gold22k") {
        const rSelected = Number(latestRates?.gold?.[karat]?.withoutGSTRate || 0);
        const r22 = Number(latestRates?.gold?.gold22k?.withoutGSTRate || 0);
        const charge = jewelry.makingChargePercent != null ? Number(jewelry.makingChargePercent) : 10;
        if (rSelected && r22) {
          const diff = Math.round((rSelected - r22) * (1 + charge / 100) * metalWeight * 1.03);
          unitPrice += diff;
        }
      }
    } else {
      if (!jewelry.jewelryPrice) {
        const rate = Number(latestRates?.[baseMetal]?.withGSTRate || 0);
        if (rate) unitPrice += metalWeight * rate;
      }
    }

    if (customization.diamondSubstitute?.price) {
      unitPrice += Number(customization.diamondSubstitute.price);
    }

    const rawCustom = customization?.toObject ? customization.toObject() : (customization || {});
    const isMetalEligible = isJewelleryMetalApplicable(baseMetal) || isJewelleryMetalApplicable(jewelry.jewelryName);
    if (isMetalEligible) {
      const silverCouponCandidate =
        rawCustom.appliedCoupon ||
        (rawCustom.discountedPrice != null || rawCustom.discountAmount != null
          ? (CAMPAIGN_CONFIG.jewelleryOffer?.code || CAMPAIGN_CONFIG.silverOffer?.code || CAMPAIGN_CONFIG.bagOffer?.code)
          : "");
      const silverEligibility = isSilverOfferEligible(unitPrice, silverCouponCandidate, baseMetal || "silver");
      if (silverEligibility.eligible) {
        unitPrice = Math.max(0, unitPrice - silverEligibility.discountAmount);
        if (customization && typeof customization === "object") {
          customization.appliedCoupon = CAMPAIGN_CONFIG.jewelleryOffer?.code || CAMPAIGN_CONFIG.silverOffer?.code || CAMPAIGN_CONFIG.bagOffer?.code;
          customization.originalPrice = Number(jewelry.jewelryPrice || unitPrice);
          customization.discountedPrice = unitPrice;
          customization.discountAmount = silverEligibility.discountAmount;
        }
      } else if (rawCustom.discountedPrice != null && Number(rawCustom.discountedPrice) < unitPrice) {
        unitPrice = Number(rawCustom.discountedPrice);
      }
    } else if (rawCustom.discountedPrice != null && Number(rawCustom.discountedPrice) < unitPrice) {
      unitPrice = Number(rawCustom.discountedPrice);
    }

    if (cartItem.totalPrice && (Number(cartItem.totalPrice) / Number(quantity || 1)) < unitPrice) {
      unitPrice = Number(cartItem.totalPrice) / Number(quantity || 1);
    }

    if (customization.productId) {
      const attachedProduct =
        typeof customization.productId === "object" && customization.productId?._id
          ? customization.productId
          : null;
      if (attachedProduct) {
        let attachedPrice = Number(attachedProduct.price || 0);
        const couponCandidate =
          customization.appliedCoupon ||
          (customization.discountedPrice != null || customization.discountAmount != null
            ? CAMPAIGN_CONFIG.gemstoneOffer.code
            : "");
        const offerEligibility = isGemstoneOfferEligible(attachedPrice, couponCandidate, attachedProduct);
        if (offerEligibility.eligible) {
          attachedPrice = attachedPrice - offerEligibility.discountAmount;
        }
        unitPrice += attachedPrice;
      } else if (cartItem.totalPrice && Number(cartItem.totalPrice) > unitPrice) {
        return Number(cartItem.totalPrice);
      }
    }
  }

  return round2(unitPrice * quantity);
}

// ==============================================================================
// 4. CONTROLLER: Add Item to Cart
// ==============================================================================
const addItemInCart = async (req, res) => {
  try {
    const { itemId, quantity = 1, customization } = req.body;

    const user = await getCartOwner(req, res);

    if (!user) {
      return res.status(500).json({ success: false, message: "Failed to initialize cart session." });
    }

    if (!itemId || !customization || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Please Enter all required fields." });
    }

    let item;
    let itemType;

    item = await Product.findById(itemId).select("-wishlistedBy -reviewRating");
    if (item) {
      itemType = "Product";
    } else {
      item = await Jewelry.findById(itemId).select("-wishlistedBy -reviewRating");
      if (item) itemType = "Jewelry";
    }

    if (!item) {
      return res.status(404).json({ success: false, field: "itemId", message: "Item not found." });
    }

    if (item.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${item.name || item.jewelryName}`,
      });
    }

    const cartItem = user.cart.find(
        (cartEntry) => cartEntry.item.toString() === itemId && cartEntry.itemType === itemType
    );

    // --- GEMSTONE LOGIC (Product) ---
    if (itemType === "Product") {
      let custom_data_json = null;
      try {
        custom_data_json = parseLooseObjectString(customization);
      } catch (err) {
        return res.status(400).json({ success: false, message: `Failed to parse customization` });
      }

      let item_certificate_obj = null;
      if (custom_data_json?.certificate?.certificateType && Array.isArray(item.certificate)) {
        item_certificate_obj = item.certificate.find(
          (c) => c.certificateType === custom_data_json.certificate.certificateType
        );
      }
      if (!item_certificate_obj && Array.isArray(item.certificate) && item.certificate.length > 0) {
        item_certificate_obj = item.certificate[0];
      }

      const baseStonePrice = getProductDisplayPrice(item);
      let gemstonePrice = baseStonePrice;

      // Respect the exact price passed from product page (discountedPrice or price)
      if (custom_data_json?.discountedPrice != null && Number(custom_data_json.discountedPrice) >= 0) {
        gemstonePrice = Number(custom_data_json.discountedPrice);
      } else if (req.body?.price != null && Number(req.body.price) > 0 && !custom_data_json?.jewelryId) {
        gemstonePrice = Math.max(0, Number(req.body.price) - Number(item_certificate_obj?.price || 0));
      } else {
        const couponCandidate =
          custom_data_json?.appliedCoupon ||
          (custom_data_json?.discountAmount != null ? CAMPAIGN_CONFIG.gemstoneOffer.code : "");
        const offerEligibility = isGemstoneOfferEligible(gemstonePrice, couponCandidate, item);
        if (offerEligibility.eligible) {
          gemstonePrice = gemstonePrice - offerEligibility.discountAmount;
        }
      }

      let unitPrice = gemstonePrice + Number(item_certificate_obj?.price || 0);

      let product_customization = {
        certificate: item_certificate_obj ? {
          certificateType: item_certificate_obj.certificateType,
          price: Number(item_certificate_obj.price || 0),
        } : undefined,
      };

      // Always persist coupon and discount details from product page
      if (custom_data_json?.appliedCoupon || custom_data_json?.discountedPrice != null || gemstonePrice < baseStonePrice) {
        product_customization.appliedCoupon = custom_data_json?.appliedCoupon || CAMPAIGN_CONFIG.gemstoneOffer.code;
        product_customization.originalPrice = Number(custom_data_json?.originalPrice || baseStonePrice);
        product_customization.discountedPrice = gemstonePrice;
        product_customization.discountAmount = Number(custom_data_json?.discountAmount || (product_customization.originalPrice - gemstonePrice));
        product_customization.discountPercent = Number(custom_data_json?.discountPercent || (product_customization.originalPrice > 0 ? Math.round((product_customization.discountAmount / product_customization.originalPrice) * 100) : 0));
      }

      if (custom_data_json.jewelryId) {
        const jewelry = await Jewelry.findById(custom_data_json.jewelryId);
        if (!jewelry) return res.status(404).json({ success: false, message: `Jewelry not found` });

        let jewelryPrice = Number(jewelry.jewelryPrice || 0);
        const latestMetalRates = await MetalRates.findOne().sort({ createdAt: -1 });

        if (jewelry.metal === "gold") {
          if (custom_data_json.goldKarat) {
            const { karatType } = custom_data_json.goldKarat;
            const metalPricePerGram = latestMetalRates?.gold?.[karatType]?.withGSTRate || 0;
            const calculatedPrice = metalPricePerGram * (jewelry.jewelryMetalWeight || 0);
            if (!jewelry.jewelryPrice) {
              jewelryPrice += calculatedPrice;
            } else if (karatType && karatType !== "gold22k") {
              const rSelected = Number(latestMetalRates?.gold?.[karatType]?.withoutGSTRate || 0);
              const r22 = Number(latestMetalRates?.gold?.gold22k?.withoutGSTRate || 0);
              const charge = jewelry.makingChargePercent != null ? Number(jewelry.makingChargePercent) : 10;
              if (rSelected && r22) {
                const diff = Math.round((rSelected - r22) * (1 + charge / 100) * (jewelry.jewelryMetalWeight || 0) * 1.03);
                jewelryPrice += diff;
              }
            }
            product_customization.goldKarat = { karatType, price: calculatedPrice };
          }
        } else {
          const metalInfo = latestMetalRates?.[jewelry.metal];
          const metalPrice = (metalInfo?.withGSTRate || 0) * (jewelry.jewelryMetalWeight || 0);
          if (!jewelry.jewelryPrice) {
            jewelryPrice += metalPrice;
          }
        }
        unitPrice += jewelryPrice;

        if (jewelry.isDiamondSubstitute && custom_data_json.diamondSubstitute) {
          const selectedSubstitute = jewelry.diamondSubstitute.find(
              (d) => d.name === custom_data_json.diamondSubstitute.name
          );
          if (selectedSubstitute) {
            unitPrice += Number(selectedSubstitute.price || 0);
            product_customization.isDiamondSubstitute = true;
            product_customization.diamondSubstitute = selectedSubstitute;
          }
        }

        if (custom_data_json.sizeSystem) {
          const { sizeType, sizeNumber } = custom_data_json.sizeSystem;
          product_customization.sizeSystem = { sizeType, sizeNumber };
        } else if (custom_data_json.size) {
          product_customization.sizeSystem = {
            sizeType: custom_data_json.size.sizeType || "Ring Size",
            sizeNumber: custom_data_json.size.size || custom_data_json.size.sizeNumber,
          };
        }
        product_customization.metal = custom_data_json.metal || jewelry.metal;
        product_customization.jewelryId = jewelry._id;
      }

      const finalTotalPrice = req.body?.totalPrice != null && Number(req.body.totalPrice) > 0 ? Number(req.body.totalPrice) : (unitPrice * quantity);

      let updatedUser;
      if (cartItem) {
        cartItem.quantity = quantity;
        cartItem.totalPrice = finalTotalPrice;
        cartItem.customization = product_customization;
        user.markModified("cart");
        await user.save();
        updatedUser = user;
      } else {
        const cartPayload = {
          itemType,
          item: itemId,
          quantity,
          totalPrice: finalTotalPrice,
          customization: product_customization,
        };

        updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $push: { cart: cartPayload } },
            { new: true } // Returns the newly updated document
        );
      }

      const candidateUrl = req.body?.eventSourceUrl || req.body?.metaContext?.eventSourceUrl || req.headers.referer || "https://gemrishi.com/cart";
      const resolvedEventId =
        req.body?.eventId ||
        req.body?.metaContext?.eventId ||
        req.body?.metaContext?.cartEventId ||
        req.body?.cartEventId ||
        `cart_${item._id}_${Date.now()}`;
      sendMetaCapiEvent({
        eventName: "AddToCart",
        eventId: resolvedEventId,
        eventSourceUrl: candidateUrl,
        userData: {
          email: user?.email && !user?.isGuest ? user.email : undefined,
          phone: user?.phone && !user?.isGuest ? user.phone : undefined,
          clientIp: req.ip || req.headers["x-forwarded-for"],
          userAgent: req.headers["user-agent"],
          fbp: req.body?.metaContext?.fbp,
          fbc: req.body?.metaContext?.fbc,
        },
        customData: {
          currency: "INR",
          value: Number(finalTotalPrice) || 0,
          content_type: "product",
          contents: [{
            id: String(item._id),
            quantity: Number(quantity) || 1,
            item_price: Number(unitPrice) || 0,
          }],
        },
      });

      return res.status(200).json({ success: true, message: "Item added to cart", cart: updatedUser.cart });
    }

    // --- JEWELRY LOGIC ---
    if (itemType === "Jewelry") {
      let custom_data_json = null;
      try {
        custom_data_json = parseLooseObjectString(customization);
      } catch (err) {
        return res.status(400).json({ success: false, message: `Failed to parse customization` });
      }

      let unitPrice = Number(item.jewelryPrice || 0);
      const jewelry_customization = {};
      const latestMetalRates = await MetalRates.findOne().sort({ createdAt: -1 });

      if (custom_data_json.gemstoneWeight) {
        const selectedWeight = item.gemstoneWeight.find(
            (w) => w.weight === custom_data_json.gemstoneWeight.weight
        );
        if (selectedWeight) {
          unitPrice += Number(selectedWeight.price || 0);
          jewelry_customization.gemstoneWeight = selectedWeight;
        } else if (custom_data_json.gemstoneWeight.price) {
          unitPrice += Number(custom_data_json.gemstoneWeight.price || 0);
          jewelry_customization.gemstoneWeight = custom_data_json.gemstoneWeight;
        }
      }

      const qualityPayload = custom_data_json.quality || custom_data_json.gemstoneQuality;
      if (qualityPayload) {
        const qualityPrice = Number(qualityPayload.price || 0);
        unitPrice += qualityPrice;
        jewelry_customization.quality = {
          qualityType: qualityPayload.qualityType || "",
          price: qualityPrice,
        };
        jewelry_customization.gemstoneQuality = jewelry_customization.quality;
      }

      if (custom_data_json.certificate) {
        const selectedCert = item.certificate.find(
            (c) => c.certificateType === custom_data_json.certificate.certificateType
        );
        if (selectedCert) {
          unitPrice += Number(selectedCert.price || 0);
          jewelry_customization.certificate = selectedCert;
        }
      }

      if (item.metal === "gold") {
        if (custom_data_json.goldKarat) {
          const { karatType } = custom_data_json.goldKarat;
          const metalPricePerGram = latestMetalRates?.gold?.[karatType]?.withGSTRate || 0;
          const calculatedPrice = metalPricePerGram * (item.jewelryMetalWeight || 0);
          if (!item.jewelryPrice) {
            unitPrice += calculatedPrice;
          } else if (karatType && karatType !== "gold22k") {
            const rSelected = Number(latestMetalRates?.gold?.[karatType]?.withoutGSTRate || 0);
            const r22 = Number(latestMetalRates?.gold?.gold22k?.withoutGSTRate || 0);
            const charge = item.makingChargePercent != null ? Number(item.makingChargePercent) : 10;
            if (rSelected && r22) {
              const diff = Math.round((rSelected - r22) * (1 + charge / 100) * (item.jewelryMetalWeight || 0) * 1.03);
              unitPrice += diff;
            }
          }
          jewelry_customization.goldKarat = { karatType, price: calculatedPrice };
        }
      } else {
        const metalInfo = latestMetalRates?.[item.metal];
        const metalPrice = (metalInfo?.withGSTRate || 0) * (item.jewelryMetalWeight || 0);
        if (!item.jewelryPrice) {
          unitPrice += metalPrice;
        }
      }

      if (item.isDiamondSubstitute && custom_data_json.diamondSubstitute) {
        const selectedSubstitute = item.diamondSubstitute.find(
            (d) => d.name === custom_data_json.diamondSubstitute.name
        );
        if (selectedSubstitute) {
          unitPrice += Number(selectedSubstitute.price || 0);
          jewelry_customization.isDiamondSubstitute = true;
          jewelry_customization.diamondSubstitute = selectedSubstitute;
        }
      }

      if (custom_data_json.sizeSystem) {
        jewelry_customization.sizeSystem = custom_data_json.sizeSystem;
      } else if (custom_data_json.size) {
        jewelry_customization.sizeSystem = {
          sizeType: custom_data_json.size.sizeType || "Ring Size",
          sizeNumber: custom_data_json.size.size || custom_data_json.size.sizeNumber,
        };
      }
      jewelry_customization.metal = custom_data_json.metal || item.metal;

      // Check for Jewellery Offer
      const targetMetal = custom_data_json.metal || item.metal || "";
      const isMetalEligible = isJewelleryMetalApplicable(targetMetal) || isJewelleryMetalApplicable(item.jewelryName);
      if (isMetalEligible) {
        const silverCouponCandidate =
          custom_data_json?.appliedCoupon ||
          (custom_data_json?.discountedPrice != null || custom_data_json?.discountAmount != null
            ? (CAMPAIGN_CONFIG.jewelleryOffer?.code || CAMPAIGN_CONFIG.silverOffer?.code || CAMPAIGN_CONFIG.bagOffer?.code)
            : "");
        const silverEligibility = isSilverOfferEligible(unitPrice, silverCouponCandidate, targetMetal);
        if (silverEligibility.eligible) {
          const discountAmt = silverEligibility.discountAmount;
          jewelry_customization.appliedCoupon = CAMPAIGN_CONFIG.jewelleryOffer?.code || CAMPAIGN_CONFIG.silverOffer?.code || CAMPAIGN_CONFIG.bagOffer?.code;
          jewelry_customization.originalPrice = unitPrice;
          jewelry_customization.discountAmount = discountAmt;
          jewelry_customization.discountedPrice = Math.max(0, unitPrice - discountAmt);
          unitPrice = Math.max(0, unitPrice - discountAmt);
        } else if (custom_data_json?.discountedPrice != null && Number(custom_data_json.discountedPrice) < unitPrice) {
          unitPrice = Number(custom_data_json.discountedPrice);
        }
      }

      if (custom_data_json.productId) {
        const attachedProduct = await Product.findById(custom_data_json.productId);
        if (attachedProduct) {
          const couponCandidate =
            custom_data_json?.appliedCoupon ||
            (custom_data_json?.discountedPrice != null || custom_data_json?.discountAmount != null
              ? CAMPAIGN_CONFIG.gemstoneOffer.code
              : "");
          const offerEligibility = isGemstoneOfferEligible(attachedPrice, couponCandidate, attachedProduct);
          if (offerEligibility.eligible) {
            attachedPrice -= offerEligibility.discountAmount;
            jewelry_customization.appliedCoupon = CAMPAIGN_CONFIG.gemstoneOffer.code;
            jewelry_customization.originalPrice = Number(attachedProduct.price || 0);
            jewelry_customization.discountedPrice = attachedPrice;
            jewelry_customization.discountAmount = offerEligibility.discountAmount;
            jewelry_customization.discountPercent = offerEligibility.discountPercent;
          }
          unitPrice += attachedPrice;
          jewelry_customization.productId = attachedProduct._id;
        }
      }

      const finalTotalPrice = unitPrice * quantity;

      let updatedUser;
      if (cartItem) {
        cartItem.quantity = quantity;
        cartItem.totalPrice = finalTotalPrice;
        cartItem.customization = jewelry_customization;
        user.markModified("cart");
        await user.save();
        updatedUser = user;
      } else {
        const cartPayload = {
          itemType,
          item: itemId,
          quantity,
          totalPrice: finalTotalPrice,
          customization: jewelry_customization,
        };

        updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $push: { cart: cartPayload } },
            { new: true }
        );
      }

      const candidateJewelryUrl = req.body?.eventSourceUrl || req.body?.metaContext?.eventSourceUrl || req.headers.referer || "https://gemrishi.com/cart";
      const resolvedJewelryEventId =
        req.body?.eventId ||
        req.body?.metaContext?.eventId ||
        req.body?.metaContext?.cartEventId ||
        req.body?.cartEventId ||
        `cart_${item._id}_${Date.now()}`;
      sendMetaCapiEvent({
        eventName: "AddToCart",
        eventId: resolvedJewelryEventId,
        eventSourceUrl: candidateJewelryUrl,
        userData: {
          email: user?.email && !user?.isGuest ? user.email : undefined,
          phone: user?.phone && !user?.isGuest ? user.phone : undefined,
          clientIp: req.ip || req.headers["x-forwarded-for"],
          userAgent: req.headers["user-agent"],
          fbp: req.body?.metaContext?.fbp,
          fbc: req.body?.metaContext?.fbc,
        },
        customData: {
          currency: "INR",
          value: Number(finalTotalPrice) || 0,
          content_type: "product",
          contents: [{
            id: String(item._id),
            quantity: Number(quantity) || 1,
            item_price: Number(unitPrice) || 0,
          }],
        },
      });

      return res.status(200).json({ success: true, message: "Jewelry added to cart", cart: updatedUser.cart });
    }
  } catch (error) {
    console.error("Add Cart Error:", error);
    return res.status(500).json({ success: false, message: "Server Error." });
  }
};

// ==============================================================================
// 5. CONTROLLER: Remove Item from Cart
// ==============================================================================
const removeItemFromCart = async (req, res) => {
  try {
    const cartItemId = req.query.cartItemId;
    const user = await getCartOwner(req, res);

    if (!cartItemId) return res.status(400).json({ success: false, message: "Item ID is required." });
    if (!user) return res.status(404).json({ success: false, message: "User/Cart not found." });

    await User.updateOne({ _id: user._id }, { $pull: { cart: { _id: cartItemId } } });
    const updatedUser = await User.findById(user._id).select("cart");

    return res.status(200).json({ success: true, message: "Item removed successfully.", cart: updatedUser.cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ==============================================================================
// 6. CONTROLLER: Get All Cart Items
// ==============================================================================
const getAllCartList = async (req, res) => {
  try {
    const userOwner = await getCartOwner(req, res);

    if (!userOwner) {
      return res.status(200).json({ success: true, cart: [], totalItems: 0 });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userOwner._id)
      .select("cart")
      .populate({
        path: "cart.item",
        select:
          "name price certificate subCategory sellPrice images stock slug sku jewelryName jewelryType jewelryPrice jewelryMetalWeight metal gemstoneWeight isDiamondSubstitute diamondSubstitute sizeSystem makingChargePercent",
      })
      .populate({
        path: "cart.customization.jewelryId",
        model: "Jewelry",
        select:
          "name price certificate subCategory sellPrice images stock slug sku jewelryName jewelryType jewelryPrice jewelryMetalWeight metal gemstoneWeight isDiamondSubstitute diamondSubstitute sizeSystem makingChargePercent",
      })
      .populate({
        path: "cart.customization.productId",
        model: "Product",
        select:
          "name price certificate subCategory sellPrice images stock slug sku jewelryName jewelryType jewelryPrice jewelryMetalWeight metal gemstoneWeight isDiamondSubstitute diamondSubstitute sizeSystem makingChargePercent origin weight",
      });

    if (!user) {
      return res.status(200).json({ success: true, cart: [], totalItems: 0 });
    }

    const totalItems = user.cart.length;
    if (totalItems === 0) {
      return res.status(200).json({ success: true, message: "Your cart is empty.", totalItems: 0, cart: [] });
    }

    const latestMetalRates = await MetalRates.findOne().sort({ createdAt: -1 }).lean();

    if (latestMetalRates) {
      let isCartModified = false;
      user.cart.forEach((cartItem) => {
        try {
          const newTotalPrice = recomputeCartItemPrice({
            cartItem,
            latestRates: latestMetalRates,
          });
          if (cartItem.totalPrice !== newTotalPrice) {
            cartItem.totalPrice = newTotalPrice;
            isCartModified = true;
          }
        } catch (error) {
          console.error("Price recalc error", error.message);
        }
      });

      if (isCartModified) {
        await User.updateOne(
          { _id: userOwner._id },
          { $set: { cart: user.cart } }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cart items fetched successfully.",
      totalItems: user.cart.length,
      totalPages: Math.ceil(user.cart.length / limit),
      currentPage: page,
      cart: user.cart.slice(skip, skip + limit),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export { addItemInCart, removeItemFromCart, getAllCartList };