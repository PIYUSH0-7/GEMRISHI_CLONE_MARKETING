/**
 * ==============================================================================
 * GEMRISHI CAMPAIGN & PROMOTIONAL OFFERS CONFIGURATION (CENTRAL CONTROL PANEL)
 * ==============================================================================
 * THIS IS THE SINGLE CENTRAL FILE for all promotional offers, coupons, prices,
 * discounts, and festive campaigns across GemRishi.
 *
 * TO TURN OFF ALL OFFERS AND RESTORE THE WEBSITE 100% BACK TO ORIGINAL:
 *   Set `enabled: false` below. That's it!
 * ==============================================================================
 */

export const CAMPAIGN_CONFIG = {
  enabled: true,

  campaignName: "Festive Offer",
  startDate: "2026-10-01T00:00:00Z",
  endDate: "2026-11-11T23:59:59Z",

  // ----------------------------------------------------------------------------
  // 1. GEMSTONE PRODUCT OFFER (Valid on Gemstone Product Pages)
  // ----------------------------------------------------------------------------
  gemstoneOffer: {
    enabled: true,
    code: "DHANTERAS15",

    // Default / 10% tier percentage
    discountPercent: 15,
    // Flat 18% tier percentage
    flat18DiscountPercent: 18,
    minGemstonePrice: 0,

    // Tier 1: 10% Flat Discount Gemstones
    flat10Gemstones: [
      "emerald",
      "yellow-sapphire",
      "blue-sapphire",
      "ruby",
      "white-sapphire",
      "purple-sapphire",
      "kunzite",
      "paraiba-tourmaline",
      "alexandrite",
      "colombian-emerald",
      "kashmir-blue-sapphire",
      "pink-sapphire",
      "bi-color-sapphire",
      "tourmaline",
      "red-coral",
      "turquoise",
      "pearl",
      "hessonite",
      "cats-eye",
      "amethyst",
      "citrine",
      "moonstone",
      "opal",
      "white-coral",
      "morganite",
      "aquamarine",
      "zircon",
      "black-opal",
      "tigers-eye",
      "tiger-s-eye",
      "green-onyx",
      "pyrite",
      "rose-quartz",
      "lapis-lazuli",
      "red-garnet",
      "iolite",
      "iolite-neeli",
      "black-onyx",
      "gun-metal",
      "hakik",
      "hakik-agate",
      "peridot",
      "peridot-zabarjad",
      "yellow-topaz",
      "sunstone",
    ],

    // Tier 2: Flat 18% Discount Gemstones
    flat18Gemstones: [],

    // Full union of all eligible gemstones
    get applicableGemstones() {
      return [...this.flat10Gemstones, ...this.flat18Gemstones];
    },

    badgeText: "15% OFF Gemstones",
    title: "Festive Offer • Flat 10% & 18% Discounts",
    description:
      "Apply coupon DHANTERAS15 to get 10% discount on premium gemstones and flat 18% discount on select gemstones.",
    termsUrl: "/offers",
  },

  // ----------------------------------------------------------------------------
  // 2. JEWELLERY PRODUCT OFFER (Valid on Jewellery Product Pages)
  // ----------------------------------------------------------------------------
  jewelleryOffer: {
    enabled: false,
    code: "FESTIVAL",
    applicableMetals: ["silver"],
    discountType: "fixed",
    discountAmount: 1200,
    discountPercent: 0,
    minPrice: 0,
    badgeText: "Festive Silver Offer • ₹1,200 OFF",
    title: "Festive Offer • ₹1,200 OFF on Silver Ring",
    description:
      "Apply coupon FESTIVAL to get ₹1,200 discount on silver rings for orders of ₹10,000 and above!",
    termsUrl: "/offers",
  },

  get silverOffer() {
    return this.jewelleryOffer;
  },

  // ----------------------------------------------------------------------------
  // 3. SHOPPING CART OFFER (Valid on Cart Total >= ₹10,000)
  // ----------------------------------------------------------------------------
  bagOffer: {
    enabled: true,
    code: "FESTIVAL",
    conditions: {
      minBagTotal: 10000,
      targetProductType: "Jewelry",
      targetJewelryType: "ring",
      targetMetal: "silver",
    },
    discountType: "fixed",
    discountAmount: 1200,
    discountPercent: 0,
    minBagTotal: 10000,
    ringDiscountAmount: 1200,
    ringDiscountTitle: "Silver Ring Offer (₹1,200 OFF)",

    /**
     * =========================================================================
     * 1-CLICK COMPLIMENTARY GIFT TOGGLE:
     * Set `giftEnabled: false` to immediately stop the complimentary
     * 5-MUKHI RUDRAKSHA gift across the entire site (Shopping Bag, Order Summary,
     * Checkout, and Backend) in 1 click!
     * Set `giftEnabled: true` to re-enable it.
     * =========================================================================
     */
    giftEnabled: true,
    giftName: "Complimentary 5-MUKHI RUDRAKSHA",
    giftDescription: "Festive Offer: Free 5 MUKHI RUDRAKSHA",
    giftMetal: "5 MUKHI RUDRAKSHA",
    giftValue: 1200,
    giftImageUrl:
      "https://rudraksha.gemrishi.com/cdn/shop/files/IMG_1377_dd132b41-d1eb-4690-900d-f7649bd8a122.jpg?v=1792138423&width=1100",
  },

  // ----------------------------------------------------------------------------
  // 4. UI BADGES, POPUPS, & NAVIGATION
  // ----------------------------------------------------------------------------
  ui: {
    showNavbarLink: true,
    showFooterLink: true,
    showFestivePopup: true,
    navbarBadgeText: "OFFERS",
    popupOfferText: "Exclusive Festive Offers",
  },
};

/**
 * Check if the campaign is active and unexpired
 */
export function isCampaignActive() {
  if (!CAMPAIGN_CONFIG.enabled) return false;
  if (CAMPAIGN_CONFIG.endDate) {
    const expiry = new Date(CAMPAIGN_CONFIG.endDate).getTime();
    if (!Number.isNaN(expiry) && Date.now() > expiry) return false;
  }
  return true;
}

/**
 * Resolves the active base price of a gemstone product considering campaign state:
 * - When campaign is active (CAMPAIGN_CONFIG.enabled: true):
 *   Returns sellPrice ("Price Before Discount" from admin) as the product price,
 *   hiding the real product price until offers are active.
 * - When campaign is inactive (CAMPAIGN_CONFIG.enabled: false):
 *   Returns the regular product price (falling back to sellPrice if price is absent).
 */
export function getProductDisplayPrice(product) {
  if (!product) return 0;
  const sellPrice = Number(product.sellPrice);
  const regularPrice = Number(
    product.price != null ? product.price : product.jewelryPrice,
  );

  if (isCampaignActive() && Number.isFinite(sellPrice) && sellPrice > 0) {
    return sellPrice;
  }
  if (Number.isFinite(regularPrice) && regularPrice > 0) {
    return regularPrice;
  }
  return Number.isFinite(sellPrice) && sellPrice > 0 ? sellPrice : 0;
}

/**
 * Resolves the original strikethrough / cut price:
 * - When campaign is active: returns null (completely hidden, no strikethrough).
 * - When campaign is inactive: returns sellPrice ("Price Before Discount") if higher than regular price,
 *   allowing standard strikethrough display (e.g. ~₹25,000~ ₹18,000).
 */
export function getProductOriginalPrice(product) {
  if (!product || isCampaignActive()) return null;
  const sellPrice = Number(product.sellPrice);
  const regularPrice = Number(
    product.price != null ? product.price : product.jewelryPrice,
  );
  if (
    Number.isFinite(sellPrice) &&
    sellPrice > 0 &&
    Number.isFinite(regularPrice) &&
    sellPrice > regularPrice
  ) {
    return sellPrice;
  }
  return null;
}

/**
 * Canonical gemstone family extractor.
 * Supports names, slugs, titles, subcategories, and Vedic/Hindi astrological aliases.
 */
export function extractGemstoneFamily(input) {
  if (!input) return null;
  const str = (
    typeof input === "object"
      ? `${input.name || ""} ${input.slug || ""} ${input.title || ""} ${input.subCategory?.name || ""} ${input.subCategory?.slug || ""} ${input.subCategory || ""}`
      : String(input)
  )
    .trim()
    .toLowerCase();

  // --- Special multi-word cases FIRST ---
  if (str.includes("colombian") && str.includes("emerald"))
    return "colombian-emerald";
  if (str.includes("kashmir") && str.includes("sapphire"))
    return "kashmir-blue-sapphire";
  if (str.includes("paraiba") && str.includes("tourmaline"))
    return "paraiba-tourmaline";
  if (str.includes("bi-color") || str.includes("bicolor"))
    return "bi-color-sapphire";
  if (str.includes("yellow sapphire") || str.includes("pukhraj"))
    return "yellow-sapphire";
  if (str.includes("blue sapphire") || str.includes("neelam"))
    return "blue-sapphire";
  if (str.includes("white sapphire") || str.includes("safed pukhraj"))
    return "white-sapphire";
  if (str.includes("pink sapphire")) return "pink-sapphire";
  if (str.includes("purple sapphire")) return "purple-sapphire";

  if (str.includes("white coral") || str.includes("safed moonga"))
    return "white-coral";
  if (str.includes("red coral") || str.includes("moonga")) return "red-coral";
  if (str.includes("black opal")) return "black-opal";
  if (str.includes("black onyx")) return "black-onyx";
  if (str.includes("green onyx")) return "green-onyx";
  if (str.includes("rose quartz")) return "rose-quartz";
  if (str.includes("tiger") && str.includes("eye")) return "tigers-eye";
  if (str.includes("cat") && str.includes("eye")) return "cats-eye";
  if (str.includes("lapis") || str.includes("lajward")) return "lapis-lazuli";
  if (str.includes("gun metal") || str.includes("gunmetal")) return "gun-metal";
  if (str.includes("yellow topaz")) return "yellow-topaz";
  // Peridot (Zabarjad) - check before zircon
  if (
    str.includes("peridot") ||
    str.includes("zabarjad") ||
    str.includes("zabar jad")
  )
    return "peridot";
  if (
    str.includes("hakik") ||
    str.includes("agate") ||
    str.includes("sulemani")
  )
    return "hakik";
  if (str.includes("iolite") || str.includes("neeli")) return "iolite";
  if (str.includes("red garnet") || str.includes("tamra")) return "red-garnet";

  // --- Single-word families ---
  if (str.includes("emerald") || str.includes("panna")) return "emerald";
  if (str.includes("ruby") || str.includes("manik")) return "ruby";
  if (str.includes("coral")) return "red-coral";
  if (str.includes("pearl") || str.includes("moti")) return "pearl";
  if (str.includes("hessonite") || str.includes("gomed")) return "hessonite";
  if (str.includes("opal")) return "opal";
  if (
    str.includes("turquoise") ||
    str.includes("firoza") ||
    str.includes("feroza")
  )
    return "turquoise";
  if (
    str.includes("amethyst") ||
    str.includes("jamunia") ||
    str.includes("katela")
  )
    return "amethyst";
  if (str.includes("citrine") || str.includes("sunela")) return "citrine";
  if (str.includes("moonstone") || str.includes("chandrakant"))
    return "moonstone";
  if (str.includes("morganite")) return "morganite";
  if (str.includes("aquamarine") || str.includes("beruj")) return "aquamarine";
  if (str.includes("zircon") || str.includes("jarkan")) return "zircon";
  if (str.includes("onyx")) return "green-onyx";
  if (str.includes("pyrite")) return "pyrite";
  if (str.includes("garnet")) return "red-garnet";
  if (str.includes("topaz")) return "yellow-topaz";
  if (str.includes("sunstone")) return "sunstone";
  if (str.includes("kunzite")) return "kunzite";
  if (str.includes("tourmaline")) return "tourmaline";
  if (str.includes("alexandrite")) return "alexandrite";

  // Fallback: first alphanumeric token
  const words = str
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/);
  return words[0] || null;
}

/**
 * Check whether a gemstone belongs to the Flat 18% tier
 */
export function isGemstoneFlat18(gemstoneData) {
  if (!gemstoneData) return false;
  const family = (extractGemstoneFamily(gemstoneData) || "").toLowerCase();

  const flat18Families = new Set([]);

  if (flat18Families.has(family)) return true;

  const targets = CAMPAIGN_CONFIG.gemstoneOffer?.flat18Gemstones || [];
  const text = (
    typeof gemstoneData === "object"
      ? `${gemstoneData?.name || ""} ${gemstoneData?.slug || ""} ${gemstoneData?.subCategory?.name || ""} ${gemstoneData?.subCategory?.slug || ""} ${gemstoneData?.subCategory || ""}`
      : String(gemstoneData)
  ).toLowerCase();

  return targets.some((t) => {
    const rawT = String(t).toLowerCase().trim();
    const spaceT = rawT.replace(/-/g, " ");
    const cleanT = rawT.replace(/[^a-z0-9]/g, "");
    const cleanText = text.replace(/[^a-z0-9]/g, "");

    return (
      text.includes(rawT) ||
      text.includes(spaceT) ||
      (cleanT.length >= 4 && cleanText.includes(cleanT))
    );
  });
}

/**
 * Check whether a gemstone belongs to the Flat 10% tier
 */
export function isGemstoneFlat10(gemstoneData) {
  if (!gemstoneData) return false;
  const family = (extractGemstoneFamily(gemstoneData) || "").toLowerCase();

  const flat10Families = new Set([
    "emerald",
    "yellow-sapphire",
    "blue-sapphire",
    "ruby",
    "white-sapphire",
    "purple-sapphire",
    "kunzite",
    "paraiba-tourmaline",
    "alexandrite",
    "colombian-emerald",
    "kashmir-blue-sapphire",
    "pink-sapphire",
    "bi-color-sapphire",
    "tourmaline",
    "red-coral",
    "turquoise",
    "pearl",
    "hessonite",
    "cats-eye",
    "amethyst",
    "citrine",
    "moonstone",
    "opal",
    "white-coral",
    "morganite",
    "aquamarine",
    "zircon",
    "black-opal",
    "tigers-eye",
    "green-onyx",
    "pyrite",
    "rose-quartz",
    "lapis-lazuli",
    "red-garnet",
    "iolite",
    "black-onyx",
    "gun-metal",
    "hakik",
    "peridot",
    "yellow-topaz",
    "sunstone",
  ]);

  if (flat10Families.has(family)) return true;

  const targets = CAMPAIGN_CONFIG.gemstoneOffer?.flat10Gemstones || [];
  const text = (
    typeof gemstoneData === "object"
      ? `${gemstoneData?.name || ""} ${gemstoneData?.slug || ""} ${gemstoneData?.subCategory?.name || ""} ${gemstoneData?.subCategory?.slug || ""} ${gemstoneData?.subCategory || ""}`
      : String(gemstoneData)
  ).toLowerCase();

  return targets.some((t) => {
    const rawT = String(t).toLowerCase().trim();
    const spaceT = rawT.replace(/-/g, " ");
    const cleanT = rawT.replace(/[^a-z0-9]/g, "");
    const cleanText = text.replace(/[^a-z0-9]/g, "");

    return (
      text.includes(rawT) ||
      text.includes(spaceT) ||
      (cleanT.length >= 4 && cleanText.includes(cleanT))
    );
  });
}

/**
 * Check whether a gemstone is applicable for promotional coupon
 */
export function isGemstoneApplicable(gemstoneData) {
  if (!gemstoneData) return false;
  return isGemstoneFlat18(gemstoneData) || isGemstoneFlat10(gemstoneData);
}

/**
 * Returns the exact discount percentage (10 or 18) for any given gemstone
 */
export function getGemstoneDiscountPercent(gemstoneData) {
  if (!gemstoneData) {
    return Number(CAMPAIGN_CONFIG.gemstoneOffer?.discountPercent || 10);
  }
  if (isGemstoneFlat18(gemstoneData)) {
    return Number(CAMPAIGN_CONFIG.gemstoneOffer?.flat18DiscountPercent || 18);
  }
  return Number(CAMPAIGN_CONFIG.gemstoneOffer?.discountPercent || 10);
}

/**
 * Main eligibility check for gemstone coupon
 */
export function isGemstoneOfferEligible(stonePrice, couponCode, gemstoneData) {
  if (!isCampaignActive() || !CAMPAIGN_CONFIG.gemstoneOffer.enabled) {
    return { eligible: false, discountAmount: 0, discountPercent: 0 };
  }
  const code = String(couponCode || "")
    .trim()
    .toUpperCase();
  const validGemstoneCodes = [
    String(CAMPAIGN_CONFIG.gemstoneOffer?.code || "DHANTERAS15").toUpperCase(),
    "DHANTERAS15",
    ...(CAMPAIGN_CONFIG.gemstoneOffer?.alternateCodes || []).map((c) =>
      String(c).toUpperCase(),
    ),
  ].filter(Boolean);
  if (!validGemstoneCodes.includes(code)) {
    return { eligible: false, discountAmount: 0, discountPercent: 0 };
  }

  if (gemstoneData && !isGemstoneApplicable(gemstoneData)) {
    return {
      eligible: false,
      reason: `Coupon is only applicable on selected festive gemstones.`,
      discountAmount: 0,
      discountPercent: 0,
    };
  }

  const price = Number(stonePrice || 0);
  if (price < CAMPAIGN_CONFIG.gemstoneOffer.minGemstonePrice) {
    return {
      eligible: false,
      reason: `Coupon not applicable if gemstone value less than ₹${CAMPAIGN_CONFIG.gemstoneOffer.minGemstonePrice.toLocaleString("en-IN")}.`,
      discountAmount: 0,
      discountPercent: 0,
    };
  }

  const appliedPercent = gemstoneData
    ? getGemstoneDiscountPercent(gemstoneData)
    : Number(CAMPAIGN_CONFIG.gemstoneOffer.discountPercent || 10);

  const discountAmount = Math.round(price * (appliedPercent / 100));
  return {
    eligible: true,
    discountAmount,
    discountPercent: appliedPercent,
  };
}

/* ==============================================================================
 * 2. JEWELLERY / SILVER PRODUCT OFFER HELPERS
 * ============================================================================== */

export function isJewelleryMetalApplicable(
  metal,
  applicableMetals = CAMPAIGN_CONFIG.jewelleryOffer?.applicableMetals ||
    CAMPAIGN_CONFIG.silverOffer?.applicableMetals,
) {
  if (
    !applicableMetals ||
    applicableMetals === "all" ||
    (Array.isArray(applicableMetals) &&
      (applicableMetals.length === 0 ||
        applicableMetals.includes("*") ||
        applicableMetals.includes("all")))
  ) {
    return true;
  }
  const normalizedTargets = (
    Array.isArray(applicableMetals)
      ? applicableMetals
      : String(applicableMetals).split(",")
  )
    .map((s) => String(s).trim().toLowerCase())
    .filter(Boolean);
  if (
    normalizedTargets.length === 0 ||
    normalizedTargets.includes("all") ||
    normalizedTargets.includes("*")
  ) {
    return true;
  }
  const m = String(
    typeof metal === "object"
      ? metal?.metal || metal?.jewelryName || metal?.name || ""
      : metal || "",
  ).toLowerCase();
  return normalizedTargets.some((t) => m.includes(t));
}

export function isJewelleryOfferEligible(
  priceInput,
  couponCode,
  metal,
  category,
) {
  const offer = CAMPAIGN_CONFIG.jewelleryOffer || CAMPAIGN_CONFIG.silverOffer;
  if (!isCampaignActive() || !offer?.enabled) {
    return { eligible: false, discountAmount: 0 };
  }
  if (!isJewelleryMetalApplicable(metal, offer.applicableMetals)) {
    const metalsStr = Array.isArray(offer.applicableMetals)
      ? offer.applicableMetals.join(", ")
      : String(offer.applicableMetals);
    return {
      eligible: false,
      discountAmount: 0,
      reason: `Offer is only valid on ${metalsStr} jewellery.`,
    };
  }
  const code = String(couponCode || "")
    .trim()
    .toUpperCase();
  const offerCode = String(offer.code || CAMPAIGN_CONFIG.bagOffer?.code || "")
    .trim()
    .toUpperCase();
  if (code !== offerCode) return { eligible: false, discountAmount: 0 };

  const price = Number(priceInput || 0);
  if (offer.minPrice && price < offer.minPrice) {
    return {
      eligible: false,
      reason: `Coupon not applicable if value is less than ₹${offer.minPrice.toLocaleString("en-IN")}.`,
      discountAmount: 0,
    };
  }
  let discountAmount = 0;
  if (offer.discountType === "percent" && offer.discountPercent > 0) {
    discountAmount = Math.round(price * (offer.discountPercent / 100));
  } else {
    discountAmount = Math.min(price, Number(offer.discountAmount || 1200));
  }
  return {
    eligible: true,
    discountAmount,
    discountPercent:
      price > 0 ? Math.round((discountAmount / price) * 100) : 100,
  };
}

export function isSilverOfferEligible(silverPrice, couponCode, metal) {
  return isJewelleryOfferEligible(silverPrice, couponCode, metal || "silver");
}

/* ==============================================================================
 * 3. SHOPPING CART OFFER HELPERS (FESTIVAL / ₹1,200 OFF on Silver Ring)
 * ============================================================================== */

export function isBagOfferEligible(subTotal, couponCode, bagItems) {
  if (!isCampaignActive() || !CAMPAIGN_CONFIG.bagOffer?.enabled) {
    return {
      eligible: false,
      reason: "Shopping cart offer is currently deactivated.",
    };
  }
  const code = String(couponCode || "")
    .trim()
    .toUpperCase();
  if (code !== CAMPAIGN_CONFIG.bagOffer.code.toUpperCase()) {
    return { eligible: false, reason: "Invalid coupon code." };
  }
  const total = Number(subTotal || 0);
  const minRequired = Number(
    CAMPAIGN_CONFIG.bagOffer.conditions?.minBagTotal ||
      CAMPAIGN_CONFIG.bagOffer.minBagTotal ||
      0,
  );
  if (total < minRequired) {
    return {
      eligible: false,
      reason: `Coupon not applicable if shopping cart value is less than ₹${minRequired.toLocaleString("en-IN")}.`,
      minBagTotal: minRequired,
    };
  }
  const targetMetal =
    CAMPAIGN_CONFIG.bagOffer.conditions?.targetMetal || "silver";
  const targetJewelryType =
    CAMPAIGN_CONFIG.bagOffer.conditions?.targetJewelryType || "ring";
  const discountAmount = Number(
    CAMPAIGN_CONFIG.bagOffer.discountAmount ||
      CAMPAIGN_CONFIG.bagOffer.ringDiscountAmount ||
      1200,
  );
  return {
    eligible: true,
    minBagTotal: minRequired,
    discountAmount,
    targetMetal,
    targetJewelryType,
    giftEnabled: CAMPAIGN_CONFIG.bagOffer.giftEnabled !== false,
    giftValue: CAMPAIGN_CONFIG.bagOffer.giftValue,
    ringDiscountAmount: discountAmount,
  };
}

export function isCartItemMatchingBagTarget(ci, config = CAMPAIGN_CONFIG) {
  if (!ci) return false;
  const bagOffer = config.bagOffer || {};
  const conditions = bagOffer.conditions || {};
  const targetJewelryType = (
    conditions.targetJewelryType || "ring"
  ).toLowerCase();
  const targetMetal = (conditions.targetMetal || "silver").toLowerCase();
  const targetProductType = (
    conditions.targetProductType || "Jewelry"
  ).toLowerCase();

  const isJewelry =
    ci.itemType === "Jewelry" || ci.customization?.jewelryId != null;
  if (targetProductType === "jewelry" && !isJewelry) return false;

  const jewelryObj =
    ci.itemType === "Jewelry" ? ci.item : ci.customization?.jewelryId;
  const metal = String(
    ci.customization?.metal || jewelryObj?.metal || ci.item?.metal || "",
  ).toLowerCase();
  const type = String(
    jewelryObj?.jewelryType || ci.item?.jewelryType || "",
  ).toLowerCase();
  const name = String(
    jewelryObj?.jewelryName || ci.item?.jewelryName || "",
  ).toLowerCase();

  const categoryMatched =
    targetJewelryType === "all" ||
    type.includes(targetJewelryType) ||
    name.includes(targetJewelryType);
  if (!categoryMatched) return false;

  const metalMatched =
    targetMetal === "all" ||
    isJewelleryMetalApplicable(metal, [targetMetal]) ||
    name.includes(targetMetal);

  return metalMatched;
}

export function getChosenRingFromCart(
  cartItems = [],
  config = CAMPAIGN_CONFIG,
) {
  return (cartItems || []).find((ci) =>
    isCartItemMatchingBagTarget(ci, config),
  );
}

export function buildChooseRingUrl(cartItems = [], config = CAMPAIGN_CONFIG) {
  const bagOffer = config.bagOffer || {};
  const conditions = bagOffer.conditions || {};
  const targetMetal = (conditions.targetMetal || "silver").toLowerCase();
  const targetJewelryType = (
    conditions.targetJewelryType || "ring"
  ).toLowerCase();

  const gemstoneInCart = (cartItems || []).find((ci) => {
    return ci.itemType === "Product" || ci.customization?.productId;
  });

  if (gemstoneInCart) {
    const rawName =
      gemstoneInCart.item?.name ||
      gemstoneInCart.customization?.productId?.name ||
      gemstoneInCart.item?.slug ||
      "";
    const family = extractGemstoneFamily(rawName);
    if (family) {
      const subcategorySlug = `${family}-${targetJewelryType}s`;
      return `/jewelry/${subcategorySlug}/${targetMetal}?metal=${targetMetal}`;
    }
  }
  return `/jewelry-list?jewelryType=${encodeURIComponent(
    targetJewelryType,
  )}&metal=${encodeURIComponent(targetMetal)}`;
}
