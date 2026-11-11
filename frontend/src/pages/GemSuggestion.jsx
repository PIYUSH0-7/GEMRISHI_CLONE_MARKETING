import { fbqTrack } from "../utils/metaPixel";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Price from "../components/Price";
import { getProductDisplayPrice, getProductOriginalPrice } from "../config/campaignOffers.config.js";
import { computeVedicChart } from "../lib/vedicEngine.js";
import { getCashfree } from "../utils/cashfree";
import { getProductUrl } from "../utils/productUrl";

import blueSapphireImg from "../assets/Stone/BlueSapphire.svg";
import catsEyeImg from "../assets/Stone/catsEye.svg";
import coralImg from "../assets/Stone/Coral.svg";
import diamondImg from "../assets/Stone/Diamond.svg";
import emeraldImg from "../assets/Stone/Emerald.svg";
import hessoniteImg from "../assets/Stone/Hessonite.svg";
import pearlImg from "../assets/Stone/Pearl.svg";
import rubyImg from "../assets/Stone/Ruby.svg";
import yellowSapphireImg from "../assets/Stone/YellowSapphire.svg";

// Home section components for post-dossier trust and certification viewer
import GemrishiCertificates from "./Home/Certificates.jsx";
import GemstoneReviews from "./Home/GemstoneReviews.jsx";

const PLANET_REAL_STONE_IMAGES = {
  Sun: rubyImg,
  Moon: pearlImg,
  Mars: coralImg,
  Mercury: emeraldImg,
  Jupiter: yellowSapphireImg,
  Venus: diamondImg,
  Saturn: blueSapphireImg,
  Rahu: hessoniteImg,
  Ketu: catsEyeImg,
};

// ---------------------------------------------------------------------------
// CONFIG — point these at your real services before going live
// ---------------------------------------------------------------------------
const CONFIG = {
  BRAND_NAME: "GemRishi",
  SITE_BASE: "", // "" = relative links (deploy on gemrishi.com); else "https://gemrishi.com"
  GEOCODE_API: "https://nominatim.openstreetmap.org/search",
  WHATSAPP_NUMBER: "919817975978", // Real GemRishi WhatsApp support line
};

// ---------------------------------------------------------------------------
// Classical Vedic reference data (static domain knowledge — safe to hardcode)
// ---------------------------------------------------------------------------
const RASHIS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// Real Devanagari rashi names (not transliteration guesses) — same order as RASHIS
const RASHIS_HI = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];

const RASHI_LORD = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

const PLANET_NAME_HI = { Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "बृहस्पति", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु" };
const PLANET_ABBR_HI = { Sun: "सू", Moon: "चं", Mars: "मं", Mercury: "बु", Jupiter: "गु", Venus: "शु", Saturn: "श", Rahu: "रा", Ketu: "के" };

const DIGNITY_LABEL = {
  Exalted: { en: "Exalted", hi: "उच्च" }, Debilitated: { en: "Debilitated", hi: "नीच" },
  "Own House": { en: "Own House", hi: "स्वग्रही" }, Friendly: { en: "Friendly", hi: "मित्र" },
  Enemy: { en: "Enemy", hi: "शत्रु" }, Neutral: { en: "Neutral", hi: "सम" }, "Shadow Planet": { en: "Shadow Planet", hi: "छाया ग्रह" },
};
const CLASSIFICATION_LABEL = {
  yogakaraka: { en: "Yogakaraka", hi: "योगकारक" }, benefic: { en: "Benefic", hi: "शुभ" },
  malefic: { en: "Malefic", hi: "अशुभ" }, neutral: { en: "Neutral", hi: "सम" },
};

// Approximate, decorative gem colors for the illustration only
const GEM_COLORS = {
  Sun: ["#E0483E", "#7E1C1C"], Moon: ["#F6F1E4", "#C9BF9C"], Mars: ["#E2652B", "#7A2E0E"],
  Mercury: ["#2E8B57", "#0E4A31"], Jupiter: ["#F4C430", "#A87A0A"], Venus: ["#EAF3F6", "#AFCBD6"],
  Saturn: ["#31518C", "#101B3B"], Rahu: ["#A9662E", "#4E2A0D"], Ketu: ["#5B7B4F", "#243521"],
};

// Mooltrikona signs (whole-sign)
const MOOLTRIKONA_SIGN = {
  Sun: "Leo", Moon: "Taurus", Mars: "Aries", Mercury: "Virgo",
  Jupiter: "Sagittarius", Venus: "Libra", Saturn: "Aquarius",
};

// Real GemRishi catalog slugs + subcategory labels
const PLANET_GEMSTONE = {
  Sun: { stone: "Ruby (Manik)", stoneHi: "माणिक्य (रूबी)", slug: "ruby", subcategory: "Ruby", mantra: "Om Ghrinih Suryaya Namah", finger: "Ring Finger", fingerHi: "अनामिका", metal: "Copper / Gold", metalHi: "तांबा / सोना", day: "Sunday, Sunrise (1 hr after)", dayHi: "रविवार, सूर्योदय के 1 घंटे बाद" },
  Moon: { stone: "Pearl (Moti)", stoneHi: "मोती", slug: "pearl", subcategory: "Pearl", mantra: "Om Som Somaya Namah", finger: "Little Finger", fingerHi: "कनिष्ठा (छोटी उंगली)", metal: "Silver", metalHi: "चांदी", day: "Monday, Evening", dayHi: "सोमवार शाम" },
  Mars: { stone: "Red Coral (Moonga)", stoneHi: "मूंगा", slug: "red-coral", subcategory: "Red Coral", mantra: "Om Angarakaya Namah", finger: "Ring Finger", fingerHi: "अनामिका", metal: "Copper / Gold", metalHi: "तांबा / सोना", day: "Tuesday, Dawn", dayHi: "मंगलवार, भोर" },
  Mercury: { stone: "Emerald (Panna)", stoneHi: "पन्ना", slug: "emerald", subcategory: "Emerald", mantra: "Om Budhaya Namah", finger: "Little Finger", fingerHi: "कनिष्ठा (छोटी उंगली)", metal: "Gold / Panchdhatu", metalHi: "सोना / पंचधातु", day: "Wednesday, Morning", dayHi: "बुधवार सुबह" },
  Jupiter: { stone: "Yellow Sapphire (Pukhraj)", stoneHi: "पुखराज", slug: "yellow-sapphire", subcategory: "Yellow Sapphire", mantra: "Om Graam Greem Groom Sah Gurave Namah", finger: "Index Finger", fingerHi: "तर्जनी", metal: "Gold / Panchdhatu", metalHi: "सोना / पंचधातु", day: "Thursday, Dawn, Shukla Paksha", dayHi: "गुरुवार, भोर, शुक्ल पक्ष" },
  Venus: { stone: "White Sapphire (Heera alternative)", stoneHi: "सफ़ेद पुखराज", slug: "white-sapphire", subcategory: "White Sapphire", mantra: "Om Shum Shukraya Namah", finger: "Middle Finger", fingerHi: "मध्यमा", metal: "Platinum / Silver", metalHi: "प्लैटिनम / चांदी", day: "Friday, Morning", dayHi: "शुक्रवार सुबह" },
  Saturn: { stone: "Blue Sapphire (Neelam)", stoneHi: "नीलम", slug: "blue-sapphire", subcategory: "Blue Sapphire", mantra: "Om Sham Shanicharaya Namah", finger: "Middle Finger", fingerHi: "मध्यमा", metal: "Silver / Panchdhatu", metalHi: "चांदी / पंचधातु", day: "Saturday, Dusk (trial period mandatory)", dayHi: "शनिवार, संध्या (ट्रायल अवधि अनिवार्य)" },
  Rahu: { stone: "Hessonite (Gomed)", stoneHi: "गोमेद", slug: "hessonite", subcategory: "Hessonite", mantra: "Om Raam Rahave Namah", finger: "Middle Finger", fingerHi: "मध्यमा", metal: "Silver / Panchdhatu", metalHi: "चांदी / पंचधातु", day: "Saturday, Dusk", dayHi: "शनिवार, संध्या" },
  Ketu: { stone: "Cat's Eye (Lehsunia)", stoneHi: "लहसुनिया", slug: "cats-eye", subcategory: "Cats Eye", mantra: "Om Kem Ketave Namah", finger: "Middle Finger", fingerHi: "मध्यमा", metal: "Silver / Panchdhatu", metalHi: "चांदी / पंचधातु", day: "Tuesday, Dusk", dayHi: "मंगलवार, संध्या" },
};

// Life-focus chips
const LIFE_FOCUS_OPTIONS = [
  { id: "fortune", label: "Overall Fortune", houses: [9] },
  { id: "career", label: "Career & Wealth", houses: [2, 10] },
  { id: "love", label: "Love & Harmony", houses: [7] },
  { id: "health", label: "Health & Vitality", houses: [1, 6] },
  { id: "mind", label: "Mental Clarity", houses: [4] },
  { id: "business", label: "Business & Legal", houses: [3, 11] },
];

const BUDGET_TIERS = [
  {
    id: "essential",
    label: "Effective Jyotish (Under ₹40,000)",
    sublabel: "100% natural, certified Vedic gems with authentic astrological potency",
    chatLabel: "Under ₹40,000 (Effective Jyotish)",
  },
  {
    id: "grade",
    label: "Astrological Grade (₹40,000 – ₹1,20,000)",
    sublabel: "Superior clarity, high luster & certified planetary energy (Most Chosen)",
    chatLabel: "₹40,000 – ₹1.2 Lakh (Astrological Grade)",
  },
  {
    id: "premium",
    label: "Premium Jyotish (₹1,20,000 – ₹3,00,000)",
    sublabel: "Rare unheated origin, exceptional brilliance & deep astrological resonance",
    chatLabel: "₹1.2 Lakh – ₹3 Lakh (Premium Jyotish)",
  },
  {
    id: "royal",
    label: "Royal Heirloom (₹3,00,000+)",
    sublabel: "Untreated museum-grade gemstones of prime historical provenance",
    chatLabel: "₹3 Lakh+ (Royal Heirloom)",
  },
  {
    id: "flexible",
    label: "Flexible / Open to Astrologer's Guidance",
    sublabel: "Let our senior astrologer suggest the ideal grade based on your chart",
    chatLabel: "Flexible / Open to Guidance",
  },
];

// Vedic Planetary Compatibility (Friendship & Incompatibility Matrix)
const PLANETARY_FRIENDS = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury", "Mars", "Jupiter"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus", "Rahu"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn", "Rahu"],
  Saturn: ["Mercury", "Venus", "Rahu"],
  Rahu: ["Venus", "Saturn", "Mercury"],
  Ketu: ["Mars", "Venus", "Jupiter"],
};

const PLANETARY_INCOMPATIBLE = {
  Sun: ["Saturn", "Venus", "Rahu", "Ketu"],
  Moon: ["Rahu", "Ketu"],
  Mars: ["Mercury", "Rahu"],
  Mercury: ["Moon"],
  Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon"],
  Saturn: ["Sun", "Moon", "Mars"],
  Rahu: ["Sun", "Moon", "Mars"],
  Ketu: ["Sun", "Moon"],
};

// Vedic Gemstone Astrological Purpose Specifications (Bilingual: EN & HI)
const GEMSTONE_PURPOSE = {
  Sun: {
    en: "Strengthens executive leadership, self-confidence, career vitality, administrative authority & fatherly blessings.",
    hi: "आत्मविश्वास, नेतृत्व क्षमता, प्रशासनिक सफलता, जीवन ऊर्जा और मान-सम्मान में वृद्धि।",
  },
  Moon: {
    en: "Fosters emotional serenity, mental calmness, intuitive clarity, psychological harmony & peaceful sleep.",
    hi: "मानसिक शांति, भावनात्मक स्थिरता, अनिद्रा से राहत, एकाग्रता और आंतरिक संतुलन।",
  },
  Mars: {
    en: "Boosts courageous determination, physical stamina, leadership drive, real estate success & triumph over hurdles.",
    hi: "साहस, शारीरिक ऊर्जा, पराक्रम, भूमि-संपत्ति लाभ और बाधाओं पर विजय।",
  },
  Mercury: {
    en: "Sharpens intellect, business acumen, articulate speech, financial growth & analytical mastery.",
    hi: "बुद्धि, व्यापारिक लाभ, वाकपटुता, तार्किक निर्णय और वित्तीय उन्नति।",
  },
  Jupiter: {
    en: "Attracts divine wisdom, spiritual expansion, higher education, prosperity, righteous fortune & marital bliss.",
    hi: "ज्ञान, समृद्धि, गुरु कृपा, वैवाहिक सुख, उच्च शिक्षा और भाग्य वृद्धि।",
  },
  Venus: {
    en: "Enhances luxury, creative artistry, magnetic charisma, relationship harmony & refined material comforts.",
    hi: "सौंदर्य, कला, प्रेम संबंध, वैवाहिक सामंजस्य, विलासिता और आकर्षण।",
  },
  Saturn: {
    en: "Accelerates disciplined focus, karmic protection, structural wealth, perseverance & shielding from adversity.",
    hi: "गहन एकाग्रता, त्वरित सफलता, कर्म सुरक्षा, न्याय और दीर्घकालिक स्थिरता।",
  },
  Rahu: {
    en: "Unlocks breakthrough opportunities, foreign ventures, political prowess & shields against sudden deception.",
    hi: "अचानक अप्रत्याशित सफलता, विदेशी व्यापार, राजनीतिक प्रभाव और भ्रम से सुरक्षा।",
  },
  Ketu: {
    en: "Deepens spiritual insight, mystical intuition, self-realization & shields against unforeseen risks.",
    hi: "आध्यात्मिक जागृति, गूढ़ अंतर्ज्ञान, दुर्घटनाओं से सुरक्षा और आत्मिक शुद्धि।",
  },
};

function getGemstonePurpose(planet, focusId, lang = "en") {
  const p = GEMSTONE_PURPOSE[planet];
  if (!p) return lang === "hi" ? "ग्रह शक्ति और ज्योतिषीय संतुलन के लिए अनुशंसित।" : "Recommended for planetary empowerment and astrological harmony.";
  return p[lang] || p.en;
}

// ---------------------------------------------------------------------------
// Pure helper functions
// ---------------------------------------------------------------------------
const rashiIndex = (sign) => RASHIS.indexOf(sign);

const houseFromLagna = (lagnaSign, targetSign) =>
  ((rashiIndex(targetSign) - rashiIndex(lagnaSign) + 12) % 12) + 1;

const PLANET_SIGNS_RULED = Object.keys(PLANET_GEMSTONE)
  .filter((p) => p !== "Rahu" && p !== "Ketu")
  .reduce((acc, planet) => {
    acc[planet] = RASHIS.filter((sign) => RASHI_LORD[sign] === planet);
    return acc;
  }, {});

const TRIKONA = [1, 5, 9];
const KENDRA_ONLY = [4, 7, 10];
const MALEFIC_GROUP = [3, 6, 8, 11, 12];
const HOUSE_RANK = { 9: 1, 5: 2, 1: 3, 10: 4, 4: 5, 7: 6, 3: 7, 11: 8, 2: 9, 6: 10, 8: 11, 12: 12 };

function computeFunctionalNature(lagnaSign, planets = []) {
  const result = {};
  Object.keys(PLANET_SIGNS_RULED).forEach((planet) => {
    const housesRuled = PLANET_SIGNS_RULED[planet].map((s) => houseFromLagna(lagnaSign, s));
    const hasTrikona = housesRuled.some((h) => TRIKONA.includes(h));
    const hasMalefic = housesRuled.some((h) => MALEFIC_GROUP.includes(h));
    const hasKendra = housesRuled.some((h) => KENDRA_ONLY.includes(h));
    let classification;
    if (hasTrikona && hasMalefic) {
      const moolHouse = houseFromLagna(lagnaSign, MOOLTRIKONA_SIGN[planet]);
      classification = [6, 8, 12].includes(moolHouse) ? "malefic" : "benefic";
    } else if (hasTrikona) {
      classification = hasKendra ? "yogakaraka" : "benefic";
    } else if (hasMalefic) {
      classification = "malefic";
    } else {
      classification = "neutral";
    }

    result[planet] = { housesRuled, classification };
  });

  ["Rahu", "Ketu"].forEach((shadow) => {
    const entry = planets.find((p) => p.planet === shadow);
    const house = entry ? houseFromLagna(lagnaSign, entry.sign) : null;
    let classification = "neutral";
    if (house !== null) {
      if (TRIKONA.includes(house) || KENDRA_ONLY.includes(house)) classification = "benefic";
      else if (MALEFIC_GROUP.includes(house)) classification = "malefic";
    }
    result[shadow] = { housesRuled: house !== null ? [house] : [], classification };
  });

  return result;
}

const CLASS_PRIORITY = { yogakaraka: 0, benefic: 1 };

function pickGemstonePair(functionalNature, unknownTime, focusId) {
  const focus = LIFE_FOCUS_OPTIONS.find((f) => f.id === focusId);
  const candidates = Object.entries(functionalNature)
    .filter(([, v]) => CLASS_PRIORITY[v.classification] !== undefined)
    .map(([planet, v]) => {
      const baseScore = Math.min(...v.housesRuled.map((h) => HOUSE_RANK[h] || 99));
      const focusBonus = focus && v.housesRuled.some((h) => focus.houses.includes(h)) ? 0.5 : 0;
      return { planet, classification: v.classification, score: baseScore - focusBonus };
    })
    .sort((a, b) => CLASS_PRIORITY[a.classification] - CLASS_PRIORITY[b.classification] || a.score - b.score);

  let primary = candidates[0] || null;

  if (primary && primary.planet === "Saturn" && unknownTime) {
    primary = candidates.find((c) => c.planet !== "Saturn") || null;
  }

  if (!primary) return { primary: null, secondary: null };

  const incompatible = PLANETARY_INCOMPATIBLE[primary.planet] || [];
  const friendly = PLANETARY_FRIENDS[primary.planet] || [];

  // Filter candidates for compatible secondary stone
  let secondary = candidates
    .filter((c) => c.planet !== primary.planet && !incompatible.includes(c.planet))
    .sort((a, b) => {
      const aFriend = friendly.includes(a.planet) ? 1 : 0;
      const bFriend = friendly.includes(b.planet) ? 1 : 0;
      return bFriend - aFriend || a.score - b.score;
    })[0] || null;

  if (secondary && secondary.planet === "Saturn" && unknownTime) {
    secondary = candidates.find((c) => c.planet !== primary.planet && c.planet !== "Saturn" && !incompatible.includes(c.planet)) || null;
  }

  // Fallback: If no second candidate from benefic list, pick natural friendly planet
  if (!secondary) {
    const fallbackPlanet = friendly.find((p) => p !== primary.planet && (!unknownTime || p !== "Saturn"));
    if (fallbackPlanet && PLANET_GEMSTONE[fallbackPlanet]) {
      secondary = {
        planet: fallbackPlanet,
        classification: functionalNature[fallbackPlanet]?.classification || "benefic",
        score: 10,
      };
    }
  }

  return { primary, secondary };
}

function pickPrimaryStone(functionalNature, unknownTime, focusId) {
  return pickGemstonePair(functionalNature, unknownTime, focusId).primary;
}

function computeCaratRange(weightKg) {
  const w = parseFloat(weightKg);
  if (!w || w <= 0) return null;
  const minCt = w / 14;
  const maxCt = w / 12;
  const roundUpQuarter = (n) => Math.ceil(n * 4) / 4;
  const RATTI_PER_CARAT = 1.0989;
  const tradeMin = roundUpQuarter(minCt);
  const tradeMax = roundUpQuarter(maxCt);
  return {
    rawMinCt: Math.round(minCt * 100) / 100,
    rawMaxCt: Math.round(maxCt * 100) / 100,
    tradeMinCt: tradeMin,
    tradeMaxCt: tradeMax,
    tradeMinRatti: Math.round(tradeMin * RATTI_PER_CARAT * 100) / 100,
    tradeMaxRatti: Math.round(tradeMax * RATTI_PER_CARAT * 100) / 100,
  };
}

function buildShopUrl(planetInfo, carat) {
  const base = `${CONFIG.SITE_BASE}/gemstone/filter/${planetInfo.slug}`;
  const params = new URLSearchParams({ subcategory: planetInfo.subcategory });
  if (carat) {
    params.set("minCarat", String(Math.floor(carat.tradeMinCt)));
    params.set("maxCarat", String(Math.ceil(carat.tradeMaxCt)));
  }
  return `${base}?${params.toString()}`;
}
const buildCategoryUrl = (planetInfo) => `${CONFIG.SITE_BASE}/gemstone/${planetInfo.slug}`;

async function geocodeCity(query) {
  if (!query || query.length < 3) return [];
  const url = `${CONFIG.GEOCODE_API}?format=json&addressdetails=0&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((d) => ({ label: d.display_name, lat: parseFloat(d.lat), lon: parseFloat(d.lon) }));
}

function buildWhatsAppLink(name, reportId) {
  const msg = `Hi ${name || "there"}, my ${CONFIG.BRAND_NAME} Vedic Dossier (#${reportId}) is ready — please send my certified gemstone match.`;
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function buildQuickIntakeWhatsAppLink() {
  const msg =
    `Hi ${CONFIG.BRAND_NAME}! I'd like my free Vedic gemstone match. Here are my details:\n\n` +
    `Name: \nGender: \nDate of birth (DD-MM-YYYY): \nTime of birth (or "don't know"): \n` +
    `Birth city: \nWeight (kg): \nWhat matters most (career / love / health / fortune): `;
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
//---------Add By Pawan for contact vailation-----------------------
function isValidPhone(value) {
  if (!value) return false;
  const digits = value.replace(/[^0-9]/g, "");
  return digits.length >= 10;
}
// ---------------------------------------------------------------------------
// North Indian Kundli — vector SVG
// ---------------------------------------------------------------------------
const HOUSE_LABEL_POS = {
  1: [150, 75],
  2: [80, 36],
  3: [34, 76],
  4: [76, 150],
  5: [34, 224],
  6: [80, 264],
  7: [150, 225],
  8: [220, 264],
  9: [266, 224],
  10: [224, 150],
  11: [266, 76],
  12: [220, 36],
};
const PLANET_ABBR = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" };

function KundliChart({ lagnaSign, planets, lang = "en" }) {
  const byHouse = {};
  (planets || []).forEach((p) => {
    const h = houseFromLagna(lagnaSign, p.sign);
    byHouse[h] = byHouse[h] || [];
    byHouse[h].push(lang === "hi" ? (PLANET_ABBR_HI[p.planet] || p.planet.slice(0, 2)) : (PLANET_ABBR[p.planet] || p.planet.slice(0, 2)));
  });

  return (
    <div className="grv-kundli-wrapper">
      {/* Elevated 3D Kundli Frame with Golden-Lime Aura Glow */}
      <div className="grv-kundli-frame grv-kundli-frame-lg">
        <div className="grv-kundli-corner-glow" />
        <svg viewBox="0 0 300 300" className="grv-kundli" role="img" aria-label="Vedic birth chart">
          {/* Base Vedic Green Background */}
          <rect x="3" y="3" width="294" height="294" fill="#EAF6F0" stroke="#1E6E50" strokeWidth="2.5" className="grv-kundli-bg" />

          {/* Outer Inner Border & Geometric Lines in Forest Emerald */}
          <rect x="8" y="8" width="284" height="284" fill="none" stroke="#237A58" strokeWidth="1.25" />
          <line x1="8" y1="8" x2="292" y2="292" stroke="#237A58" strokeWidth="1.25" />
          <line x1="292" y1="8" x2="8" y2="292" stroke="#237A58" strokeWidth="1.25" />
          <polygon points="150,8 292,150 150,292 8,150" fill="none" stroke="#1E6E50" strokeWidth="1.6" />

          {/* Corner Bindus */}
          {[[3, 3], [297, 3], [3, 297], [297, 297]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="4.5" fill="#1E6E50" />
          ))}

          {/* House Numbers, Signs & Planet Abbreviations */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
            const [x, y] = HOUSE_LABEL_POS[house];
            const signIdx = (rashiIndex(lagnaSign) + house - 1) % 12;
            const signLabel = lang === "hi" ? RASHIS_HI[signIdx] : RASHIS[signIdx].slice(0, 3);
            return (
              <g key={house}>
                <text x={x} y={y - 10} textAnchor="middle" className="grv-kundli-house-num">{house}</text>
                <text x={x} y={y + 1} textAnchor="middle" className="grv-kundli-sign">{signLabel}</text>
                <text x={x} y={y + 12} textAnchor="middle" className="grv-kundli-planets">{(byHouse[house] || []).join(" ")}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function GemstoneHeroImage({ planet, label }) {
  const imgSrc = PLANET_REAL_STONE_IMAGES[planet] || emeraldImg;
  return (
    <div className="grv-stone-hero-wrapper">
      <div className="grv-stone-photo-medallion">
        <img
          src={imgSrc}
          alt={label || `${planet} Gemstone`}
          className="grv-stone-photo-img"
          crossOrigin="anonymous"
        />
      </div>
      <div className="grv-stone-verified-tag">
        <span className="grv-verified-icon">✓</span> 100% Natural & Certified
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UI subcomponents
// ---------------------------------------------------------------------------
function CityAutocomplete({ value, onChange, onSelect, selected, onAdvance }) {
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 3) { setOptions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await geocodeCity(value);
      setOptions(results);
      setOpen(true);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Tab" || e.key === "Enter") {
      if (open && options.length > 0) {
        onSelect(options[0]);
        setOpen(false);
        if (e.key === "Enter") e.preventDefault();
        if (onAdvance) {
          e.preventDefault();
          setTimeout(() => onAdvance(), 40);
        }
      } else if (selected && onAdvance && (e.key === "Enter" || e.key === "Tab")) {
        if (e.key === "Enter") e.preventDefault();
        onAdvance();
      }
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      if (options.length > 0 && !selected) {
        onSelect(options[0]);
      }
    }, 200);
  };

  return (
    <div className="grv-field grv-autocomplete">
      <label>Birthplace (city) *</label>
      <div className="grv-input-with-icon">
        <input
          type="text"
          value={value}
          placeholder="Search your birth city"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => options.length && setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="grv-input"
        />
        <svg
          className="grv-input-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      {open && options.length > 0 && (
        <ul className="grv-autocomplete-list">
          {options.map((opt, i) => (
            <li
              key={i}
              onMouseDown={() => {
                onSelect(opt);
                setOpen(false);
                if (onAdvance) setTimeout(() => onAdvance(), 40);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <div className="grv-subtext">Coordinates locked: {selected.lat.toFixed(4)}°N, {selected.lon.toFixed(4)}°E</div>
      )}
    </div>
  );
}

function AmPmTimeSelector({ value, onChange, disabled, idPrefix = "grv-time", onAdvance }) {
  const { hour, minute, ampm } = useMemo(() => {
    if (!value || !value.includes(":")) {
      return { hour: "10", minute: "30", ampm: "AM" };
    }
    const [hRaw, mRaw] = value.split(":");
    let h = parseInt(hRaw, 10);
    const m = String(mRaw || "00").padStart(2, "0");
    const period = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return { hour: String(h), minute: m, ampm: period };
  }, [value]);

  const updateTime = (newH, newM, newP) => {
    let h = parseInt(newH, 10);
    if (isNaN(h) || h < 1 || h > 12) h = 12;
    const m = String(newM || "00").padStart(2, "0");
    if (newP === "PM" && h !== 12) h += 12;
    if (newP === "AM" && h === 12) h = 0;
    const time24 = `${String(h).padStart(2, "0")}:${m}`;
    onChange(time24);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
      if (onAdvance) {
        e.preventDefault();
        onAdvance();
      }
    }
  };

  return (
    <div className={`grv-time-picker ${disabled ? "grv-time-disabled" : ""}`}>
      <div className="grv-time-controls">
        <select
          id={`${idPrefix}-hour`}
          value={hour}
          disabled={disabled}
          onChange={(e) => updateTime(e.target.value, minute, ampm)}
          onKeyDown={handleKeyDown}
          className="grv-time-select"
          aria-label="Hour (1-12)"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={String(h)}>
              {String(h).padStart(2, "0")}
            </option>
          ))}
        </select>

        <span className="grv-time-colon">:</span>

        <select
          id={`${idPrefix}-min`}
          value={minute}
          disabled={disabled}
          onChange={(e) => updateTime(hour, e.target.value, ampm)}
          onKeyDown={handleKeyDown}
          className="grv-time-select"
          aria-label="Minute (00-59)"
        >
          {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <div className="grv-ampm-toggle" role="radiogroup" aria-label="AM or PM">
          <button
            type="button"
            disabled={disabled}
            className={`grv-ampm-btn ${ampm === "AM" ? "grv-ampm-active" : ""}`}
            onClick={() => updateTime(hour, minute, "AM")}
            onKeyDown={handleKeyDown}
          >
            AM
          </button>
          <button
            type="button"
            disabled={disabled}
            className={`grv-ampm-btn ${ampm === "PM" ? "grv-ampm-active" : ""}`}
            onClick={() => updateTime(hour, minute, "PM")}
            onKeyDown={handleKeyDown}
          >
            PM
          </button>
        </div>
      </div>
      <div className="grv-time-preview">
        {disabled ? "Exact time not required" : `Selected: ${String(hour).padStart(2, "0")}:${minute} ${ampm}`}
      </div>
    </div>
  );
}

function SuggestionYouTubeVideo() {
  return (
    <section className="grv-legacy-video-section">
      <div className="grv-section-heading-center">
        <span className="grv-gold-pill">Consultation Archive</span>
        <h2>How GemRishi Consults <span className="grv-amp">&amp;</span> Selects Your Vedic Gemstone</h2>
        <p>Watch our authentic masterclass on gemstone energization, Vedic planetary alignment, and genuine certificate verification.</p>
      </div>
      <div className="grav-super">
      <div className="grv-legacy-video-card">
        <div className="grv-video-aspect">
          <iframe
            src="https://www.youtube.com/embed/_5Li-DKLSJc"
            title="GemRishi Gemstone Consultation Guide"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </div>
       <div className="grv-legacy-video-card">
        <div className="grv-video-aspect">
          <iframe
            src="https://www.youtube.com/embed/IRFFfvXkZGk?si=Wjf90u4YjH1htVlj"
            title="GemRishi Gemstone Consultation Guide"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      </div>
    </section>
  );
}

function CaratPill({ weightKg }) {
  const carat = computeCaratRange(weightKg);
  if (!carat) return null;
  return (
    <div className="grv-pill">
      Minimum potency: {carat.tradeMinCt.toFixed(2)}+ Carats (≈ {carat.tradeMinRatti.toFixed(2)} Ratti)
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function GemSuggestion() {
  const [showUnknownTimeInfo, setShowUnknownTimeInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [intakeMode, setIntakeMode] = useState("form");

  const [agreeWhatsApp, setAgreeWhatsApp] = useState(true);
  const [agreeContact, setAgreeContact] = useState(true);

  const [form, setForm] = useState({
    name: "", phone: "", gender: "male", dob: "", time: "", unknownTime: false,
    placeLabel: "", place: null, focus: "fortune", weightKg: "",
    budgetTier: "essential", whatsapp: "", email: "",
  });
  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

const canSubmit = form.name && form.dob && form.place && (form.time || form.unknownTime) && form.weightKg && (form.phone || form.whatsapp);

  const leadSentRef = useRef(false);

  // Silent automatic background lead dispatch with compiled PDF when gemstone match is revealed
  useEffect(() => {
    if (!result || leadSentRef.current) return;
    leadSentRef.current = true;

    // 1. Send customer and Vedic data immediately (instant lead & email notification)
    sendLeadSuggestion({
      form,
      result,
      pdfBase64: null,
    }).catch((e) => console.warn("Instant lead dispatch note:", e));

    // 2. Generate PDF in background and update record
    const timer = setTimeout(async () => {
      try {
        const doc = await buildDossierPdfDocument(result);
        if (doc?.pdfBase64) {
          await sendLeadSuggestion({
            form,
            result,
            pdfBase64: doc.pdfBase64,
          });
        }
      } catch (pdfErr) {
        console.warn("Silent PDF render note:", pdfErr);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [result, form]);

  // Automatically scroll to the top of the report whenever gemstone match is revealed
  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [result]);

  const handleRestart = () => {
    leadSentRef.current = false;
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 60));
    try {
      const chart = computeVedicChart({
        name: form.name, dob: form.dob,
        time: form.unknownTime ? null : form.time, unknownTime: form.unknownTime,
        place: form.place,
      });
      const functionalNature = computeFunctionalNature(chart.lagnaSign, chart.planets);
      const { primary, secondary } = pickGemstonePair(functionalNature, form.unknownTime, form.focus);
      const carat = computeCaratRange(form.weightKg);
      setResult({ chart, functionalNature, primary, secondary, carat });

      // Analytics & Meta Lead Conversion Tracking
      const sharedReportId = String(chart?.reportId || form.leadEventId || `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
      form.leadEventId = sharedReportId;
      const reportId = sharedReportId;
      const userPhone = form.phone || form.whatsapp || "";

      // Meta Pixel Standard "Lead" event with eventID matching Backend CAPI for deduplication
      fbqTrack(
        "Lead",
        {
          content_name: "Gemstone Recommendation Consultation",
          content_category: primary?.name ? `${primary.name} Gemstone` : "Natural Gemstone",
          currency: "INR",
          value: 0,
        },
        { eventID: reportId }
      );

      if (typeof window.clarity === "function") {
        window.clarity("set", "astrology_recommended_gem", String(primary?.name || ""));
        window.clarity("set", "astrology_user_focus", String(form.focus || "general"));
      }

      // Google Analytics 4 & GTM DataLayer
      window.dataLayer = window.dataLayer || [];
      if (form.email || userPhone) {
        const rawPhone = userPhone.replace(/\D/g, "");
        const cleanPhone = rawPhone.length === 10 ? `+91${rawPhone}` : rawPhone ? `+${rawPhone}` : undefined;
        window.dataLayer.push({
          user_data: {
            email: form.email ? form.email.trim().toLowerCase() : undefined,
            phone_number: cleanPhone,
            address: {
              first_name: form.name ? form.name.split(" ")[0] : undefined,
              country: "IN",
            },
          },
        });
      }

      window.dataLayer.push({
        event: "generate_lead",
        form_id: "vedic_recommender",
        form_name: "Vedic Gemstone Recommender",
        lead_id: reportId,
        primary_stone: primary?.name,
        currency: "INR",
        value: 0,
      });
      window.dataLayer.push({
        event: "form_submit",
        form_id: "vedic_recommender",
        form_name: "Vedic Gemstone Recommender",
      });
      window.dataLayer.push({
        event: "recommendation_submit",
        recommendation_type: "Vedic Birth Chart",
        primary_stone: primary?.name,
        secondary_stone: secondary?.name,
        lagna_sign: chart?.lagnaSign,
      });
      window.dataLayer.push({
        event: "recommendation_view",
        recommendation_type: "Vedic Birth Chart",
        primary_stone: primary?.name,
      });

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    } catch (e) {
      setError(e.message || "Could not compute a chart for that birth place/time — please double-check the city and try again.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <div className="grv-root">
      <Helmet>
        <title>Vedic Gemstone Recommendation | GemRishi</title>
        <meta
          name="description"
          content="Find your certified Vedic gemstone match based on your real birth chart, computed instantly with GemRishi."
        />
      </Helmet>
      <style>{STYLES}</style>

      <header className="grv-header">
        <div className="grv-logo">
          <span className="grv-brand-title">{CONFIG.BRAND_NAME}</span>
          <span className="grv-brand-subtitle">Quality Gemstones</span>
        </div>
        <div className="grv-top-cert-badge">
          <div className="grv-top-cert-top">100% Unheated</div>
          <div className="grv-top-cert-bottom"> • GIA • IGI • GUBELIN CERTIFIED</div>
        </div>
      </header>

      {!result && (
        <>
          <div className="grv-hero-section">
            {/* <div className="grv-hero-badge">
              <span className="grv-badge-sparkle">✦</span>
              <span>PERSONALISED VEDIC GUIDANCE</span>
              <span className="grv-badge-sparkle">✦</span>
            </div> */}

            <h1 className="grv-hero-heading">
              Find Your Certified Vedic Gemstone
            </h1>

            <p className="grv-hero-description">
              Explore recommendations computed instantly from your birth details and authentic Vedic astrology.
            </p>

            {/* <div className="grv-hero-trust-badges">
              <span className="grv-trust-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Instant Kundli Analysis
              </span>
              <span className="grv-trust-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                100% Private &amp; Secure
              </span>
              <span className="grv-trust-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="6 3 18 3 22 9 12 22 2 9 6 3"/><line x1="12" y1="22" x2="6" y2="9"/><line x1="12" y1="22" x2="18" y2="9"/><line x1="2" y1="9" x2="22" y2="9"/></svg>
                Certified Natural Gems
              </span>
            </div> */}
          </div>

          <div className="grv-mode-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={intakeMode === "form"}
              className={`grv-mode-tab ${intakeMode === "form" ? "grv-mode-tab-active" : ""}`}
              onClick={() => setIntakeMode("form")}>
              📝 Quick Form
            </button>
            <button type="button" role="tab" aria-selected={intakeMode === "chat"}
              className={`grv-mode-tab ${intakeMode === "chat" ? "grv-mode-tab-active" : ""}`}
              onClick={() => setIntakeMode("chat")}>
              💬 Chat Mode
            </button>
          </div>

          {intakeMode === "chat" ? (
            <ChatIntake
              form={form} update={update} canSubmit={canSubmit} loading={loading} error={error}
              onSubmit={handleSubmit}
              agreeWhatsApp={agreeWhatsApp} setAgreeWhatsApp={setAgreeWhatsApp}
              agreeContact={agreeContact} setAgreeContact={setAgreeContact}
            />
          ) : (
            <QuickForm
              form={form} update={update} canSubmit={canSubmit} loading={loading} error={error}
              onSubmit={handleSubmit}
              showUnknownTimeInfo={showUnknownTimeInfo} setShowUnknownTimeInfo={setShowUnknownTimeInfo}
              agreeWhatsApp={agreeWhatsApp} setAgreeWhatsApp={setAgreeWhatsApp}
              agreeContact={agreeContact} setAgreeContact={setAgreeContact}
            />
          )}
        </>
      )}

      {result && (
        <ResultDossier form={form} result={result} onUpdateContact={update} onRestart={handleRestart} />
      )}

      {/* ========================================================================= */}
      {/* POST-CONTENT WEB SECTIONS (EXCLUDED FROM 2-PAGE DOSSIER PDF)              */}
      {/* 1. YouTube video of old suggestion page                                   */}
      {/* 2. Voice of trust part of website (Voices of Trust - GemstoneReviews)     */}
      {/* 3. Certificate section of website (GemrishiCertificates)                  */}
      {/* ========================================================================= */}
      <div className="grv-web-only-footer-sections" data-pdf-exclude="true">
        <SuggestionYouTubeVideo />
        <GemstoneReviews />
        <GemrishiCertificates />
      </div>
    </div>
  );
}

export { GemSuggestion as GemstoneSuggest };

// ---------------------------------------------------------------------------
// WhatsApp-easy intake
// ---------------------------------------------------------------------------
function WhatsAppQuickIntake() {
  return (
    <a className="grv-wa-banner" href={buildQuickIntakeWhatsAppLink()} target="_blank" rel="noreferrer">
      <span className="grv-wa-icon" aria-hidden="true">💬</span>
      <span className="grv-wa-copy">
        <b>In a hurry? Just WhatsApp us your details</b>
        <span className="grv-wa-sub">Tap, fill in the blanks, hit send — no form needed.</span>
      </span>
      <span className="grv-wa-arrow" aria-hidden="true">→</span>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Quick Form
// ---------------------------------------------------------------------------
function QuickForm({ form, update, canSubmit, loading, error, onSubmit, showUnknownTimeInfo, setShowUnknownTimeInfo, agreeWhatsApp, setAgreeWhatsApp, agreeContact, setAgreeContact }) {
  return (
    <section className="grv-card">
      {/* Card Header with Gemstone icon */}
      <div className="grv-form-card-header">
        {/* <div className="grv-form-card-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17382d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="6 3 18 3 22 9 12 22 2 9 6 3"></polygon>
            <line x1="12" y1="22" x2="6" y2="9"></line>
            <line x1="12" y1="22" x2="18" y2="9"></line>
            <line x1="2" y1="9" x2="22" y2="9"></line>
            <line x1="6" y1="3" x2="10" y2="9"></line>
            <line x1="18" y1="3" x2="14" y2="9"></line>
          </svg>
        </div> */}
      </div>

      {/* 01 Personal details */}
      <div className="grv-form-section-header">
        <span className="grv-section-badge">01</span>
        <span className="grv-section-title">Personal details</span>
        <div className="grv-section-divider" />
      </div>

      <div className="grv-grid-2">
        <div className="grv-field">
          <label>Full name *</label>
          <input
            type="text"
            value={form.name || ""}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Enter your full name"
            className="grv-input"
          />
        </div>
        <div className="grv-field">
          <label>Gender</label>
          <div className="grv-gender-row">
            {[
              { id: "male", label: "Male" },
              { id: "female", label: "Female" },
              { id: "other", label: "Other" },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                className={`grv-gender-pill ${form.gender === g.id ? "grv-gender-pill-active" : ""}`}
                onClick={() => update({ gender: g.id })}
              >
                <span className="grv-radio-circle">
                  {form.gender === g.id && <span className="grv-radio-inner-dot" />}
                </span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grv-grid-2">
        <div className="grv-field">
          <label>  Mobile number *</label>
          <div className="grv-phone-input-group">
            <span className="grv-phone-prefix">+91</span>
            <input
              type="tel"
              value={form.phone || form.whatsapp || ""}
              onChange={(e) => update({ phone: e.target.value, whatsapp: e.target.value })}
              placeholder="Enter mobile number"
              className="grv-input grv-phone-field"
            />
          </div>
        </div>
        <div className="grv-field">
          <label>Email address (optional)</label>
          <input
            type="email"
            value={form.email || ""}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="Enter email address"
            className="grv-input"
          />
        </div>
      </div>

      {/* 02 Birth details */}
      <div className="grv-form-section-header">
        <span className="grv-section-badge">02</span>
        <span className="grv-section-title">Birth details</span>
        <div className="grv-section-divider" />
      </div>

      <div className="grv-grid-2">
        <div className="grv-field">
          <label>Date of birth *</label>
          <input
            type="date"
            value={form.dob || ""}
            onChange={(e) => update({ dob: e.target.value })}
            className="grv-input"
            placeholder="dd/mm/yyyy"
          />
        </div>
        <CityAutocomplete
          value={form.placeLabel}
          selected={form.place}
          onChange={(v) => update({ placeLabel: v, place: null })}
          onSelect={(opt) => update({ placeLabel: opt.label, place: opt })}
        />
      </div>

      <div className="grv-grid-2 grv-time-row-align">
        <div className="grv-field">
          <label>Time of birth {form.unknownTime ? "" : "*"}</label>
          <AmPmTimeSelector
            value={form.time || "10:30"}
            disabled={form.unknownTime}
            onChange={(t) => update({ time: t })}
            idPrefix="quickform-time"
          />
        </div>
        <div className="grv-field grv-unknown-time-box">
          <label className="grv-custom-checkbox">
            <input
              type="checkbox"
              checked={!!form.unknownTime}
              onChange={(e) => {
                update({ unknownTime: e.target.checked });
                setShowUnknownTimeInfo(e.target.checked);
              }}
            />
            <span className="grv-checkbox-text">I don't know my exact birth time</span>
          </label>
          {showUnknownTimeInfo && (
            <div className="grv-tooltip">
              We'll calibrate from your Solar Ascendant instead, and skip sensitive stones like Neelam until exact birth time is available.
            </div>
          )}
        </div>
      </div>

      {/* 03 Your preferences */}
      <div className="grv-form-section-header">
        <span className="grv-section-badge">03</span>
        <span className="grv-section-title">Your preferences</span>
        <div className="grv-section-divider" />
      </div>

      <div className="grv-grid-2">
        <div className="grv-field">
          <label>Body weight (kg) *</label>
          <input
            type="number"
            min="1"
            value={form.weightKg || ""}
            onChange={(e) => update({ weightKg: e.target.value })}
            placeholder="Enter weight"
            className="grv-input"
          />
          <CaratPill weightKg={form.weightKg} />
        </div>
        <div className="grv-field">
          <label>Gemstone budget</label>
          <div className="grv-select-wrapper">
            <select
              value={form.budgetTier}
              onChange={(e) => update({ budgetTier: e.target.value })}
              className="grv-input grv-select"
            >
              {BUDGET_TIERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grv-field grv-focus-field">
        <div className="grv-focus-header">
          <label className="grv-focus-label">

            <span className="grv-focus-label-text">What matters most to you?</span>
          </label>
        </div>
        <div className="grv-focus-grid">
          {LIFE_FOCUS_OPTIONS.map((opt) => {
            const isActive = form.focus === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`grv-focus-btn ${isActive ? "grv-focus-btn-active" : ""}`}
                onClick={() => update({ focus: opt.id })}
              >
                {isActive && (
                  <span className="grv-focus-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                )}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <div className="grv-error">{error}</div>}

      <div className="grv-consultation-consent-box">
        <label className="grv-consent-item">
          <input
            type="checkbox"
            checked={agreeWhatsApp}
            onChange={(e) => setAgreeWhatsApp(e.target.checked)}
            className="grv-consent-checkbox"
          />
          <span className="grv-consent-text">
            I agree to receive my Kundli, Gemstone and relevant GemRishi updates and offers on WhatsApp.
          </span>
        </label>

        <label className="grv-consent-item">
          <input
            type="checkbox"
            checked={agreeContact}
            onChange={(e) => setAgreeContact(e.target.checked)}
            className="grv-consent-checkbox"
          />
          <span className="grv-consent-text">
            I agree to be contacted by GemRishi Expert regarding my astrology consultation and recommendations.
          </span>
        </label>

        <button
          type="button"
          className="grv-btn-find grv-btn-get-consultation"
          disabled={!canSubmit || loading || !agreeWhatsApp || !agreeContact}
          onClick={onSubmit}
        >
          <span>{loading ? "Reading your chart…" : "GET FREE CONSULTATION"}</span>
          {!loading && <span className="grv-btn-arrow-right">&gt;</span>}
        </button>

        <div className="grv-trust-secure-note">
          <span className="grv-trust-lock-icon" aria-hidden="true">🔒</span>
          <span>Your details are safe and confidential with us.</span>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Chat Mode
// ---------------------------------------------------------------------------
const CHAT_STEPS = [
  {
    key: "name", bot: () => "Hi! I'm the GemRishi assistant 🙏 Let's find your certified gemstone match. What's your name?",
    isValid: (f) => !!f.name,
    render: ({ form, update, onNext }) => (
      <ChatTextInput placeholder="Your full name" value={form.name}
        onChange={(v) => update({ name: v })} onSubmit={onNext} />
    ),
    answer: (f) => f.name,
  },
  {
    key: "gender", bot: (f) => `Nice to meet you, ${f.name.split(" ")[0]}! And your gender?`,
    isValid: () => true,
    render: ({ form, update, onNext }) => (
      <ChatChoices options={["male", "female", "other"]} labels={["Male", "Female", "Other"]}
        value={form.gender} onPick={(v) => { update({ gender: v }); onNext(v); }} />
    ),
    answer: (f) => f.gender[0].toUpperCase() + f.gender.slice(1),
  },
  {
    key: "phone", bot: (f) => `Got it, ${f.name.split(" ")[0]}. Please enter your WhatsApp or mobile number (to send your certified match):`,
      isValid: (f) => isValidPhone(f.phone || f.whatsapp),
    render: ({ form, update, onNext }) => (
      <ChatTextInput type="tel" placeholder="+91 98179 75978" value={form.phone || form.whatsapp || ""}
        onChange={(v) => update({ phone: v, whatsapp: v })} onSubmit={onNext} />
    ),
    answer: (f) => f.phone || f.whatsapp,
  },
  {
    key: "email", bot: () => "What's your email address? (Optional — press Tab or click ➤ to skip):",
    isValid: () => true,
    render: ({ form, update, onNext }) => (
      <ChatTextInput type="email" placeholder="email@example.com (optional)" value={form.email || ""}
        onChange={(v) => update({ email: v })} onSubmit={onNext} allowEmpty={true} />
    ),
    answer: (f) => f.email || "Skipped",
  },
  {
    key: "dob", bot: () => "What's your date of birth?",
    isValid: (f) => !!f.dob,
    render: ({ form, update, onNext }) => (
      <ChatDateInput value={form.dob} onChange={(v) => update({ dob: v })} onSubmit={onNext} />
    ),
    answer: (f) => f.dob,
  },
  {
    key: "place", bot: () => "Which city were you born in?",
    isValid: (f) => !!f.place,
    render: ({ form, update, onNext }) => (
      <div className="grv-chat-input-row">
        <CityAutocomplete
          value={form.placeLabel} selected={form.place}
          onChange={(v) => update({ placeLabel: v, place: null })}
          onSelect={(opt) => { update({ placeLabel: opt.label, place: opt }); }}
          onAdvance={onNext}
        />
        <button type="button" className="grv-chat-send" disabled={!form.place} onClick={onNext}>➤</button>
      </div>
    ),
    answer: (f) => f.place?.label,
  },
  {
    key: "unknownTime", bot: () => "Do you know your exact time of birth?",
    isValid: () => true,
    render: ({ form, update, onNext }) => (
      <ChatChoices options={[false, true]} labels={["Yes, I know it", "No, unsure"]}
        value={form.unknownTime} onPick={(v) => { update({ unknownTime: v }); onNext(v); }} />
    ),
    answer: (f) => (f.unknownTime ? "I don't know my exact time" : "Yes, I know it"),
  },
  {
    key: "time", bot: () => "What time were you born?",
    isValid: (f) => !!f.time,
    skip: (f) => f.unknownTime,
    render: ({ form, update, onNext }) => (
      <ChatTimeInput value={form.time} onChange={(v) => update({ time: v })} onSubmit={onNext} />
    ),
    answer: (f) => f.time,
  },
  {
    key: "weightKg", bot: () => "What's your body weight in kg? (Used to work out the right carat weight for your ring.)",
    isValid: (f) => !!f.weightKg,
    render: ({ form, update, onNext }) => (
      <ChatTextInput type="number" placeholder="e.g. 72" value={form.weightKg}
        onChange={(v) => update({ weightKg: v })} onSubmit={onNext} />
    ),
    answer: (f) => `${f.weightKg} kg`,
  },
  {
    key: "budgetTier", bot: () => "Every natural unheated gemstone holds a unique astrological purity and planetary vibration. What investment preference feels most comfortable for your journey?",
    isValid: () => true,
    render: ({ form, update, onNext }) => (
      <ChatChoices
        options={BUDGET_TIERS.map((t) => t.id)}
        labels={BUDGET_TIERS.map((t) => t.chatLabel || t.label)}
        sublabels={BUDGET_TIERS.map((t) => t.sublabel)}
        value={form.budgetTier}
        onPick={(v) => { update({ budgetTier: v }); onNext(v); }}
      />
    ),
    answer: (f) => BUDGET_TIERS.find((t) => t.id === f.budgetTier)?.chatLabel || BUDGET_TIERS.find((t) => t.id === f.budgetTier)?.label,
  },
  {
    key: "focus", bot: () => "Last one — what life area would you most like to energize right now?",
    isValid: () => true,
    render: ({ form, update, onNext }) => (
      <ChatChoices options={LIFE_FOCUS_OPTIONS.map((o) => o.id)} labels={LIFE_FOCUS_OPTIONS.map((o) => o.label)}
        value={form.focus} onPick={(v) => { update({ focus: v }); onNext(v); }} />
    ),
    answer: (f) => LIFE_FOCUS_OPTIONS.find((o) => o.id === f.focus)?.label,
  },
];

function ChatIntake({ form, update, canSubmit, loading, error, onSubmit, agreeWhatsApp, setAgreeWhatsApp, agreeContact, setAgreeContact }) {
  const [step, setStep] = useState(0);
  const bodyRef = useRef(null);
  useEffect(() => { bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight); }, [step, loading, error]);

  const activeSteps = CHAT_STEPS.filter((s) => !s.skip || !s.skip(form));
  const current = activeSteps[step];
  const done = step >= activeSteps.length;

  const goNext = () => setStep((s) => Math.min(s + 1, activeSteps.length));
  const goBack = (targetKey) => {
    const idx = activeSteps.findIndex((s) => s.key === targetKey);
    if (idx >= 0) setStep(idx);
  };

  return (
    <section className="grv-chat">
      <div className="grv-chat-header">
        <div className="grv-chat-avatar">{CONFIG.BRAND_NAME[0]}</div>
        <div>
          <div className="grv-chat-title">{CONFIG.BRAND_NAME} Assistant</div>
          <div className="grv-chat-status"><span className="grv-chat-dot" />Online</div>
        </div>
      </div>

      <div className="grv-chat-body" ref={bodyRef}>
        {activeSteps.slice(0, step).map((s) => (
          <React.Fragment key={s.key}>
            <ChatBubble side="in">{typeof s.bot === "function" ? s.bot(form) : s.bot}</ChatBubble>
            <ChatBubble side="out" onEdit={() => goBack(s.key)}>{s.answer(form)}</ChatBubble>
          </React.Fragment>
        ))}

        {!done && current && (
          <>
            <ChatBubble side="in">{typeof current.bot === "function" ? current.bot(form) : current.bot}</ChatBubble>
            <div className="grv-chat-composer-inline">
              {current.render({ form, update, onNext: () => { if (current.isValid(form)) goNext(); } })}
            </div>
          </>
        )}

        {done && (
          <>
            <ChatBubble side="in">That's everything I need. Ready to see your certified gemstone match?</ChatBubble>
            {error && <ChatBubble side="in">⚠️ {error}</ChatBubble>}
            <div className="grv-chat-composer-inline">
              <div className="grv-consultation-consent-box">
                <label className="grv-consent-item">
                  <input
                    type="checkbox"
                    checked={agreeWhatsApp}
                    onChange={(e) => setAgreeWhatsApp(e.target.checked)}
                    className="grv-consent-checkbox"
                  />
                  <span className="grv-consent-text">
                    I agree to receive my Kundli, Gemstone and relevant GemRishi updates and offers on WhatsApp.
                  </span>
                </label>

                <label className="grv-consent-item">
                  <input
                    type="checkbox"
                    checked={agreeContact}
                    onChange={(e) => setAgreeContact(e.target.checked)}
                    className="grv-consent-checkbox"
                  />
                  <span className="grv-consent-text">
                    I agree to be contacted by GemRishi Expert regarding my astrology consultation and recommendations.
                  </span>
                </label>

                <button
                  type="button"
                  className="grv-btn-cta grv-btn-get-consultation"
                  disabled={!canSubmit || loading || !agreeWhatsApp || !agreeContact}
                  onClick={onSubmit}
                >
                  <span>{loading ? "Reading your chart…" : "GET FREE CONSULTATION"}</span>
                  {!loading && <span className="grv-btn-arrow-right">&gt;</span>}
                </button>

                <div className="grv-trust-secure-note">
                  <span className="grv-trust-lock-icon" aria-hidden="true">🔒</span>
                  <span>Your details are safe and confidential with us.</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ChatBubble({ side, children, onEdit }) {
  return (
    <div className={`grv-chat-row grv-chat-row-${side}`}>
      <div className={`grv-chat-bubble grv-chat-bubble-${side}`}>
        {children}
        {onEdit && <button type="button" className="grv-chat-edit" onClick={onEdit}>edit</button>}
      </div>
    </div>
  );
}

function ChatTextInput({ value, onChange, onSubmit, placeholder, type = "text", allowEmpty = false }) {
  return (
    <div className="grv-chat-input-row">
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
            if (value || allowEmpty) {
              e.preventDefault();
              onSubmit();
            }
          }
        }}
      />
      <button
        type="button"
        className="grv-chat-send"
        disabled={!value && !allowEmpty}
        onClick={onSubmit}
        tabIndex={0}
      >
        ➤
      </button>
    </div>
  );
}

function ChatDateInput({ value, onChange, onSubmit }) {
  return (
    <div className="grv-chat-input-row">
      <input
        type="date"
        value={value}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
            if (value) {
              e.preventDefault();
              onSubmit();
            }
          }
        }}
      />
      <button
        type="button"
        className="grv-chat-send"
        disabled={!value}
        onClick={onSubmit}
        tabIndex={0}
      >
        ➤
      </button>
    </div>
  );
}

function ChatTimeInput({ value, onChange, onSubmit }) {
  const timeVal = value || "10:30";
  useEffect(() => {
    if (!value) onChange("10:30");
  }, [value, onChange]);

  return (
    <div className="grv-chat-time-wrapper">
      <AmPmTimeSelector
        value={timeVal}
        onChange={onChange}
        idPrefix="chat-time"
        onAdvance={onSubmit}
      />
      <button
        type="button"
        className="grv-chat-time-confirm"
        onClick={onSubmit}
        title="Confirm time and advance (or press Tab / Enter)"
      >
        Set Time & Continue ➤
      </button>
    </div>
  );
}

function ChatChoices({ options, labels, sublabels, value, onPick }) {
  return (
    <div className="grv-chip-column" role="group">
      {options.map((opt, i) => (
        <button
          key={String(opt)}
          type="button"
          className={`grv-chip-choice ${value === opt ? "grv-chip-active" : ""}`}
          onClick={() => onPick(opt)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPick(opt);
            }
          }}
        >
          <div className="grv-choice-title">{labels[i]}</div>
          {sublabels && sublabels[i] && (
            <div className="grv-choice-sub">{sublabels[i]}</div>
          )}
        </button>
      ))}
    </div>
  );
}

// Dossier copy, English + Hindi
const DOSSIER_TXT = {
  dossierTitle: { en: "Vedic Astrological Dossier", hi: "वैदिक ज्योतिष रिपोर्ट" },
  report: { en: "Report #", hi: "रिपोर्ट #" },
  timeUnknown: { en: "time unknown", hi: "समय अज्ञात" },
  ascendantMahadasha: { en: "Ascendant & Mahadasha", hi: "लग्न और महादशा" },
  lagna: { en: "Lagna", hi: "लग्न" },
  lagnaLord: { en: "Lagna Lord", hi: "लग्न स्वामी" },
  moonSign: { en: "Moon Sign", hi: "चंद्र राशि" },
  mahadasha: { en: "Mahadasha", hi: "महादशा" },
  antardasha: { en: "Antardasha", hi: "अंतर्दशा" },
  activeUntil: { en: "Active Until", hi: "तक सक्रिय" },
  birthChart: { en: "Birth Chart (Lagna Kundli)", hi: "जन्म कुंडली (लग्न कुंडली)" },
  planetaryStatus: { en: "Planetary Status", hi: "ग्रह स्थिति" },
  colPlanet: { en: "Planet", hi: "ग्रह" }, colSign: { en: "Sign", hi: "राशि" },
  colHouse: { en: "House", hi: "भाव" }, colDignity: { en: "Dignity", hi: "अवस्था" }, colNature: { en: "Nature", hi: "स्वभाव" },
  certifiedRecommendation: { en: "Certified Recommendation", hi: "प्रमाणित सिफारिश" },
  preparedFor: { en: "Prepared for", hi: "के लिए तैयार" },
  yourPrimaryStone: { en: "Your Primary Stone", hi: "आपका मुख्य रत्न" },
  rulingPlanet: { en: "Ruling Planet", hi: "स्वामी ग्रह" },
  classification: { en: "Classification", hi: "वर्गीकरण" },
  finger: { en: "Finger", hi: "उंगली" }, wearingDay: { en: "Wearing Day", hi: "धारण करने का दिन" }, metal: { en: "Metal", hi: "धातु" },
  recommendedWeight: { en: "Recommended Weight", hi: "अनुशंसित वज़न" },
  rattiEquivalent: { en: "Ratti Equivalent", hi: "रत्ती के बराबर" },
  carats: { en: "Carats", hi: "कैरेट" }, ratti: { en: "Ratti", hi: "रत्ती" },
  doubleCheck: { en: "Double-check this conversion →", hi: "यह रूपांतरण जांचें →" },
  mantra: { en: "Mantra", hi: "मंत्र" },
  shopCta: { en: "Shop Certified", hi: "प्रमाणित" },
  inYourCaratRange: { en: "in Your Carat Range →", hi: "अपनी कैरेट रेंज में खरीदें →" },
  browseAll: { en: "Browse all", hi: "सभी देखें:" },
  buyingGuide: { en: "Gemstone Buying Guide", hi: "रत्न खरीद गाइड" },
  certInfo: { en: "Certification Info", hi: "प्रमाणन जानकारी" },
  assurance: {
    en: "100% Natural, Unheated, Certified by GIA / IGI / Gübelin / SSEF. Includes Vedic Consecration Puja & 3-Day Astrological Trial Guarantee.",
    hi: "100% प्राकृतिक, अनहीटेड, GIA / IGI / Gübelin / SSEF द्वारा प्रमाणित। वैदिक अभिमंत्रण पूजा और 3-दिन ज्योतिषीय ट्रायल गारंटी शामिल है।",
  },
  suryaLagnaNote: {
    en: "Birth time wasn't provided, so the Lagna above is your Surya Lagna (Solar Ascendant) — a real, classical substitute technique, computed for a fully precise Ascendant once the birth time is added.",
    hi: "जन्म समय उपलब्ध नहीं था, इसलिए ऊपर दिया गया लग्न आपका सूर्य लग्न (सोलर एसेंडेंट) है — एक वास्तविक, शास्त्रीय वैकल्पिक विधि। सटीक लग्न के लिए जन्म समय जोड़ें।",
  },
  talkToAstrologer: {
    en: "For this specific chart, we'd love to hand-match your gemstone in person — message us on WhatsApp below and one of our astrologers will confirm it with you directly.",
    hi: "इस विशेष कुंडली के लिए, हम आपका रत्न व्यक्तिगत रूप से चुनना चाहेंगे — नीचे WhatsApp पर संदेश भेजें और हमारे ज्योतिषी सीधे आपसे पुष्टि करेंगे।",
  },
  startOver: { en: "Start Over", hi: "फिर से शुरू करें" },
  preparingPdf: { en: "Preparing your PDF…", hi: "आपकी PDF तैयार हो रही है…" },
  downloadPdf: { en: "Download 2-Page PDF", hi: "2-पेज PDF डाउनलोड करें" },
  liveInventoryTitle: {
    en: "Certified Gemstones in Your Recommended Range",
    hi: "आपकी अनुशंसित रेंज में उपलब्ध प्रमाणित रत्न",
  },
  liveInventorySub: {
    en: "Direct from GemRishi's live inventory, 100% natural & certified",
    hi: "जेमऋषि के लाइव संग्रह से, 100% प्राकृतिक और प्रमाणित",
  },
  viewStoneDetails: {
    en: "View Stone Details →",
    hi: "विवरण देखें →",
  },
  inStock: {
    en: "In Stock",
    hi: "उपलब्ध है",
  },
  loadingProducts: {
    en: "Finding matching certified gemstones in your range...",
    hi: "आपकी रेंज में प्रमाणित रत्नों की खोज की जा रही है...",
  },
  astroConsultBadge: {
    en: "1-on-1 Vedic Astrologer Consultation",
    hi: "1-ऑन-1 वरिष्ठ वैदिक ज्योतिषी परामर्श",
  },
  astroConsultTitle: {
    en: "Personalized Birth Chart & Gemstone Consultation",
    hi: "व्यक्तिगत जन्म कुंडली एवं रत्न परामर्श",
  },
  astroConsultSub: {
    en: "Speak directly with a Senior Jyotish Acharya before wearing. Choose the consultation tier that fits your journey — from quick 20-min clarity to year-round astrological guidance.",
    hi: "रत्न धारण करने से पहले वरिष्ठ ज्योतिषाचार्य से सीधी बात करें। अपनी आवश्यकता अनुसार उपयुक्त परामर्श पैकेज चुनें — 20 मिनट की त्वरित पुष्टि से लेकर वार्षिक मार्गदर्शन तक।",
  },
  astroConsultPolicyNotice: {
    en: "10 Days Product Return / Exchange Policy Included",
    hi: "10 दिन उत्पाद वापसी / विनिमय नीति शामिल",
  },
  astroConsultTrustBar: {
    en: "15+ Yrs Senior Vedic Acharyas · 4,800+ Consultations · Slots within 24h · 100% Confidential",
    hi: "15+ वर्ष अनुभवी ज्योतिषी · 4,800+ सफल परामर्श · 24 घंटे में स्लॉट · 100% गोपनीय",
  },
  astroConsultBookBtn: {
    en: "Book Plan",
    hi: "प्लान बुक करें",
  },
};
const tr = (lang, key) => DOSSIER_TXT[key]?.[lang] ?? DOSSIER_TXT[key]?.en ?? key;

function ResultDossier({ form, result, onUpdateContact, onRestart }) {
  const { chart, functionalNature, primary, secondary, carat } = result;
  const primaryInfo = primary ? PLANET_GEMSTONE[primary.planet] : null;
  const secondaryInfo = secondary ? PLANET_GEMSTONE[secondary.planet] : null;
  const [pdfBusy, setPdfBusy] = useState(false);
  const [lang, setLang] = useState("en");

  const handleDownloadPdf = async () => {
    setPdfBusy(true);
    try {
      await generateDossierPdf(result);
    } catch (e) {
      window.alert("Couldn't generate the PDF — please try again.");
    } finally {
      setPdfBusy(false);
    }
  };

  const planetName = (p) => (lang === "hi" ? PLANET_NAME_HI[p] || p : p);
  const signName = (s) => (lang === "hi" ? RASHIS_HI[rashiIndex(s)] : s);
  const dignityName = (d) => DIGNITY_LABEL[d]?.[lang] ?? d;
  const classificationName = (c) => CLASSIFICATION_LABEL[c]?.[lang] ?? c;
  const stoneName = (info) => (lang === "hi" ? info.stoneHi : info.stone);

  return (
    <div className="grv-dossier">
      <div className="grv-lang-toggle" role="tablist" aria-label="Report language">
        <button type="button" aria-selected={lang === "en"} className={lang === "en" ? "grv-lang-active" : ""} onClick={() => setLang("en")}>English</button>
        <button type="button" aria-selected={lang === "hi"} className={lang === "hi" ? "grv-lang-active" : ""} onClick={() => setLang("hi")}>हिंदी</button>
      </div>

      {!chart.ascendantIsExact && (
        <div className="grv-demo-badge">ⓘ {tr(lang, "suryaLagnaNote")}</div>
      )}

      {/* PAGE 1: KUNDLI & PLANETARY STATUS */}
      <div className="grv-page">
        <div className="grv-page-header">
          <div>{CONFIG.BRAND_NAME} {tr(lang, "dossierTitle")}</div>
          <div>{tr(lang, "report")}{chart.reportId}</div>
        </div>
        <div className="grv-page-sub">
          {form.name} &nbsp;|&nbsp; {form.dob}, {form.unknownTime ? tr(lang, "timeUnknown") : form.time} &nbsp;|&nbsp; {form.place?.label}
        </div>

        <h3><span className="grv-h3-sparkle">✦</span> {tr(lang, "ascendantMahadasha")}</h3>
        <div className="grv-grid-2 grv-astro-card-details">
          <div className="grv-kv">
            <div><span className="grv-icon-dot">♊</span> <b>{tr(lang, "lagna")}:</b> {signName(chart.lagnaSign)}</div>
            <div><span className="grv-icon-dot">⭐</span> <b>{tr(lang, "lagnaLord")}:</b> {planetName(RASHI_LORD[chart.lagnaSign])}</div>
            <div><span className="grv-icon-dot">🌙</span> <b>{tr(lang, "moonSign")}:</b> {signName(chart.moonSign)}</div>
          </div>
          <div className="grv-kv">
            <div><span className="grv-icon-dot">💫</span> <b>{tr(lang, "mahadasha")}:</b> {planetName(chart.mahadasha?.planet)}</div>
            <div><span className="grv-icon-dot">🔮</span> <b>{tr(lang, "antardasha")}:</b> {planetName(chart.antardasha?.planet)}</div>
            <div><span className="grv-icon-dot">📅</span> <b>{tr(lang, "activeUntil")}:</b> {chart.mahadasha?.until}</div>
          </div>
        </div>

        <h3><span className="grv-h3-sparkle">✦</span> {tr(lang, "birthChart")}</h3>
        <KundliChart lagnaSign={chart.lagnaSign} planets={chart.planets} lang={lang} />

        <h3><span className="grv-h3-sparkle">✦</span> {tr(lang, "planetaryStatus")}</h3>
        <table className="grv-table">
          <thead><tr><th>{tr(lang, "colPlanet")}</th><th>{tr(lang, "colSign")}</th><th>{tr(lang, "colHouse")}</th><th>{tr(lang, "colDignity")}</th><th>{tr(lang, "colNature")}</th></tr></thead>
          <tbody>
            {chart.planets.map((p) => {
              const fn = functionalNature[p.planet];
              return (
                <tr key={p.planet}>
                  <td>{planetName(p.planet)}</td><td>{signName(p.sign)}</td>
                  <td>{houseFromLagna(chart.lagnaSign, p.sign)}</td>
                  <td>{dignityName(p.dignity)}</td>
                  <td className={`grv-fn-${fn?.classification || "neutral"}`}>{classificationName(fn?.classification || "neutral")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGE 2: CERTIFIED RECOMMENDATION & REAL GEMRISHI PRODUCTS */}
      <div className="grv-page">
        <div className="grv-page-header"><div>{tr(lang, "certifiedRecommendation")}</div><div>{tr(lang, "preparedFor")} {form.name}</div></div>

        {primary && (
          <>
            <div className="grv-dual-gems-grid">
              {/* PRIMARY GEMSTONE */}
              <div className="grv-gem-card grv-gem-card-primary">
                <div className="grv-gem-badge grv-gem-badge-primary">
                  ★ {lang === "hi" ? "मुख्य रत्न" : "Primary Gemstone"}
                </div>
                <GemstoneHeroImage planet={primary.planet} label={stoneName(primaryInfo)} />
                <h3 className="grv-gem-card-title">{stoneName(primaryInfo)}</h3>

                <div className="grv-gem-specs">
                  <div><b>{tr(lang, "rulingPlanet")}:</b> {planetName(primary.planet)}</div>
                  <div><b>{tr(lang, "classification")}:</b> {classificationName(primary.classification)}</div>
                  <div><b>{tr(lang, "finger")}:</b> {lang === "hi" ? primaryInfo.fingerHi : primaryInfo.finger}</div>
                  <div><b>{tr(lang, "wearingDay")}:</b> {lang === "hi" ? primaryInfo.dayHi : primaryInfo.day}</div>
                  <div style={{ gridColumn: "span 2" }}><b>{tr(lang, "metal")}:</b> {lang === "hi" ? primaryInfo.metalHi : primaryInfo.metal}</div>
                </div>

                {/* Purpose written above Recommended Weight in same form */}
                <div className="grv-gem-purpose-box">
                  <b>{lang === "hi" ? "उद्देश्य (Purpose):" : "Purpose:"}</b>{" "}
                  <span>{getGemstonePurpose(primary.planet, form.focus, lang)}</span>
                </div>
              </div>

              {/* SECONDARY GEMSTONE */}
              {secondary && secondaryInfo && (
                <div className="grv-gem-card grv-gem-card-secondary">
                  <div className="grv-gem-badge grv-gem-badge-secondary">
                    ✦ {lang === "hi" ? "सहायक रत्न" : "Secondary Gemstone"}
                  </div>
                  <GemstoneHeroImage planet={secondary.planet} label={stoneName(secondaryInfo)} />
                  <h3 className="grv-gem-card-title">{stoneName(secondaryInfo)}</h3>

                  <div className="grv-gem-specs">
                    <div><b>{tr(lang, "rulingPlanet")}:</b> {planetName(secondary.planet)}</div>
                    <div><b>{tr(lang, "classification")}:</b> {classificationName(secondary.classification || "benefic")}</div>
                    <div><b>{tr(lang, "finger")}:</b> {lang === "hi" ? secondaryInfo.fingerHi : secondaryInfo.finger}</div>
                    <div><b>{tr(lang, "wearingDay")}:</b> {lang === "hi" ? secondaryInfo.dayHi : secondaryInfo.day}</div>
                    <div style={{ gridColumn: "span 2" }}><b>{tr(lang, "metal")}:</b> {lang === "hi" ? secondaryInfo.metalHi : secondaryInfo.metal}</div>
                  </div>

                  {/* Purpose written above Recommended Weight in same form */}
                  <div className="grv-gem-purpose-box">
                    <b>{lang === "hi" ? "उद्देश्य (Purpose):" : "Purpose:"}</b>{" "}
                    <span>{getGemstonePurpose(secondary.planet, form.focus, lang)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* RECOMMENDED WEIGHT & MANTRAS (DIRECTLY BELOW BOTH GEMSTONES) */}
            {carat && (
              <div className="grv-weight-mantra-section">
                <div className="grv-grid-2">
                  <div className="grv-kv">
                    <div><b>{tr(lang, "recommendedWeight")}:</b> {carat.tradeMinCt} – {carat.tradeMaxCt} {tr(lang, "carats")}</div>
                    <div><b>{tr(lang, "rattiEquivalent")}:</b> {carat.tradeMinRatti} – {carat.tradeMaxRatti} {tr(lang, "ratti")}</div>
                    <div className="grv-weight-subnote">
                      {lang === "hi"
                        ? `(शरीर के वज़न ${form.weightKg} kg के आधार पर दोनों रत्नों के लिए अनुशंसित)`
                        : `(Calibrated for your ${form.weightKg} kg body weight; applies to both gemstones)`}
                    </div>
                    <a className="grv-inline-link" href={`${CONFIG.SITE_BASE}/carat-to-ratti-converter`} target="_blank" rel="noreferrer">{tr(lang, "doubleCheck")}</a>
                  </div>
                  <div className="grv-kv">
                    <div><b>{stoneName(primaryInfo)} {tr(lang, "mantra")}:</b> {primaryInfo.mantra} (108x)</div>
                    {secondaryInfo && (
                      <div style={{ marginTop: "6px" }}>
                        <b>{stoneName(secondaryInfo)} {tr(lang, "mantra")}:</b> {secondaryInfo.mantra} (108x)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* REAL PRODUCTS OF GEMRISHI IN RECOMMENDED CARAT RANGE */}
            <ProductsPanel planetInfo={primaryInfo} secondaryInfo={secondaryInfo} carat={carat} lang={lang} />

            <div className="grv-shop-actions">
              <a className="grv-btn-cta grv-shop-btn" data-pdf-link href={buildShopUrl(primaryInfo, carat)} target="_blank" rel="noreferrer">
                {tr(lang, "shopCta")} {stoneName(primaryInfo)} {tr(lang, "inYourCaratRange")}
              </a>
              {secondaryInfo && (
                <a className="grv-btn-cta grv-shop-btn grv-shop-btn-sec" data-pdf-link href={buildShopUrl(secondaryInfo, carat)} target="_blank" rel="noreferrer">
                  {tr(lang, "shopCta")} {stoneName(secondaryInfo)} →
                </a>
              )}
            </div>
            <div className="grv-browse-links">
              <a className="grv-inline-link" href={buildCategoryUrl(primaryInfo)} target="_blank" rel="noreferrer">
                {tr(lang, "browseAll")} {stoneName(primaryInfo)} →
              </a>
              {secondaryInfo && (
                <a className="grv-inline-link" href={buildCategoryUrl(secondaryInfo)} target="_blank" rel="noreferrer">
                  {tr(lang, "browseAll")} {stoneName(secondaryInfo)} →
                </a>
              )}
            </div>
          </>
        )}
        {!primary && (
          <div className="grv-fallback-note">{tr(lang, "talkToAstrologer")}</div>
        )}

        <div className="grv-trust-links">
          <a href={`${CONFIG.SITE_BASE}/gemstone-buy-guide`} target="_blank" rel="noreferrer">{tr(lang, "buyingGuide")}</a>
          <a href={`${CONFIG.SITE_BASE}/certificate`} target="_blank" rel="noreferrer">{tr(lang, "certInfo")}</a>
        </div>

        <div className="grv-assurance">{tr(lang, "assurance")}</div>
      </div>

      <SaveDossier form={form} onUpdateContact={onUpdateContact} reportId={chart.reportId} />

      {/* 1-on-1 Astrological Consultation Banner at ₹1,099 */}
      <AstroConsultationBanner reportId={chart.reportId} form={form} lang={lang} />

      <div className="grv-actions">
        <button className="grv-btn-ghost" onClick={onRestart}>{tr(lang, "startOver")}</button>
        <button className="grv-btn-ghost" disabled={pdfBusy} onClick={handleDownloadPdf}>
          {pdfBusy ? tr(lang, "preparingPdf") : tr(lang, "downloadPdf")}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Real Products Panel — Live GemRishi Inventory
// ---------------------------------------------------------------------------
function ProductsPanel({ planetInfo, carat, lang = "en" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const rawBase = import.meta.env.VITE_URL || "https://api.gemrishi.com/api/v1";
        const cleanBase = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;
        const subcategorySlug = planetInfo.slug; // e.g. "emerald", "ruby", "blue-sapphire"

        let queryParams = `subcategory=${encodeURIComponent(subcategorySlug)}`;
        if (carat && carat.tradeMinCt && carat.tradeMaxCt) {
          const minC = Math.max(0, Math.floor(carat.tradeMinCt));
          const maxC = Math.ceil(carat.tradeMaxCt);
          queryParams += `&minCarat=${minC}&maxCarat=${maxC}`;
        }
        queryParams += `&limit=4`;

        let res = await fetch(`${cleanBase}/product/filter?${queryParams}`);
        let data = res.ok ? await res.json() : null;
        let prods = data?.products || [];

        // Fallback: If no inventory in narrow carat range, fetch by subcategory
        if ((!prods || prods.length === 0) && carat) {
          const fallbackRes = await fetch(
            `${cleanBase}/product/filter?subcategory=${encodeURIComponent(subcategorySlug)}&limit=4`
          );
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            prods = fallbackData?.products || [];
          }
        }

        // Secondary fallback to production API if local/configured URL returned nothing
        if (!prods || prods.length === 0) {
          try {
            const prodApiRes = await fetch(`https://api.gemrishi.com/api/v1/product/filter?${queryParams}`);
            if (prodApiRes.ok) {
              const prodData = await prodApiRes.json();
              prods = prodData?.products || [];
            }
          } catch (e) {
            // ignore
          }
        }

        if (!cancelled) {
          setProducts(Array.isArray(prods) ? prods.slice(0, 4) : []);
        }
      } catch (err) {
        console.error("Error loading GemRishi products:", err);
        try {
          const fallbackRes = await fetch(
            `https://api.gemrishi.com/api/v1/product/filter?subcategory=${encodeURIComponent(planetInfo.slug)}&limit=4`
          );
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (!cancelled && fallbackData?.products?.length > 0) {
              setProducts(fallbackData.products.slice(0, 4));
            }
          }
        } catch (fbErr) {
          console.error("Fallback product lookup failed:", fbErr);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (planetInfo?.slug) {
      fetchProducts();
    }

    return () => {
      cancelled = true;
    };
  }, [planetInfo, carat]);

  if (loading) {
    return (
      <div className="grv-products-section">
        <div className="grv-products-header">
          <h4>{tr(lang, "liveInventoryTitle")}</h4>
          <p>{tr(lang, "loadingProducts")}</p>
        </div>
        <div className="grv-products-loading">
          <div className="grv-spinner" />
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div className="grv-products-section">
      <div className="grv-products-header">
        <h4>{tr(lang, "liveInventoryTitle")}</h4>
        <p>{tr(lang, "liveInventorySub")}</p>
      </div>
      <div className="grv-products-grid">
        {products.map((p) => {
          const prodUrl = getProductUrl(p);
          const rawImg = p.images && p.images.length > 0 ? p.images[0].url : "";
          const imgUrl = rawImg
            ? (rawImg.startsWith("http") ? rawImg : `https://api.gemrishi.com${rawImg.startsWith("/") ? "" : "/"}${rawImg}`)
            : "https://gemrishi.com/logo.jpg";

          return (
            <a
              key={p._id || p.sku}
              className="grv-product-card"
              href={prodUrl}
              target="_blank"
              rel="noreferrer"
            >
              <div className="grv-product-img-wrapper">
                <img
                  src={imgUrl}
                  alt={p.name}
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.src = "https://gemrishi.com/logo.jpg";
                  }}
                />
                <span className="grv-product-badge">
                  {p.origin ? `${p.origin} • ` : ""}{tr(lang, "inStock")}
                </span>
              </div>
              <div className="grv-product-info">
                <div className="grv-product-name" title={p.name}>
                  {p.name}
                </div>
                <div className="grv-product-meta">
                  {p.carat ? <span>{p.carat} {tr(lang, "carats")}</span> : null}
                  {p.ratti ? <span> • {p.ratti} {tr(lang, "ratti")}</span> : null}
                </div>
                <div className="grv-product-pricing">
                  <Price amount={getProductDisplayPrice(p)} className="grv-price-current" />
                  {getProductOriginalPrice(p) && (
                    <Price amount={getProductOriginalPrice(p)} className="grv-price-orig" />
                  )}
                </div>
                <span className="grv-product-cta-btn">
                  {tr(lang, "viewStoneDetails")}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function SaveDossier({ form, onUpdateContact, reportId }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="grv-card grv-save-card">
      <h3>Save or send this dossier (optional)</h3>
      <div className="grv-grid-2">
        <input placeholder="WhatsApp number" value={form.whatsapp} onChange={(e) => onUpdateContact({ whatsapp: e.target.value })} />
        <input placeholder="Email address" type="email" value={form.email} onChange={(e) => onUpdateContact({ email: e.target.value })} />
      </div>
      <a className="grv-btn-primary" href={buildWhatsAppLink(form.name, reportId)} target="_blank" rel="noreferrer" onClick={() => setSent(true)}>
        Send to WhatsApp
      </a>
      {sent && <div className="grv-subtext">Opening WhatsApp…</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1-on-1 Astrological Consultation Banner (Light Emerald & Multi-Tier Plans)
// ---------------------------------------------------------------------------
const ASTRO_CONSULT_PLANS = [
  {
    id: "plan-499",
    price: "₹499",
    duration: "20 Min Call",
    durationHi: "20 मिनट कॉल",
    title: "Personalised Kundli + 20 Min Call",
    titleHi: "पर्सनलाइज़्ड कुंडली + 20 मिनट कॉल",
    pillClass: "grv-astro-pill-starter",
    badge: "Value Starter",
    badgeHi: "किफायती शुरुआत",
    popular: false,
    details: [
      "Personalised Written Kundli",
      "Personalised Recommendation",
      "Free Handbook",
      "1 × 20 Minute Video Call",
      "Transit Alerts & Remedies",
      "10 Days Product Return / Exchange Policy",
    ],
    detailsHi: [
      "पर्सनलाइज़्ड लिखित कुंडली",
      "पर्सनलाइज़्ड रत्न सिफारिश",
      "नि:शुल्क रत्न हैंडबुक",
      "1 × 20 मिनट वीडियो कॉल",
      "गोचर अलर्ट एवं उपाय",
      "10 दिन उत्पाद वापसी / विनिमय नीति",
    ],
  },
  {
    id: "plan-1199",
    price: "₹1,199",
    duration: "30–40 Min",
    durationHi: "30–40 मिनट",
    title: "Personalised Kundli + 30–40 Min Call",
    titleHi: "पर्सनलाइज़्ड कुंडली + 30–40 मिनट कॉल",
    pillClass: "grv-astro-pill-popular",
    badge: "Most Popular",
    badgeHi: "सर्वाधिक लोकप्रिय",
    popular: true,
    details: [
      "Personalised Written Kundli",
      "Personalised Recommendation",
      "Free Handbook",
      "1 × 30–40 Minute Video Call",
      "Transit Alerts & Remedies",
      "Prana Pratishtha & Muhurta Timing",
      "10 Days Product Return / Exchange Policy",
    ],
    detailsHi: [
      "पर्सनलाइज़्ड लिखित कुंडली",
      "पर्सनलाइज़्ड रत्न सिफारिश",
      "नि:शुल्क रत्न हैंडबुक",
      "1 × 30–40 मिनट वीडियो कॉल",
      "गोचर अलर्ट एवं उपाय",
      "प्राण प्रतिष्ठा व शुभ मुहूर्त समय",
      "10 दिन उत्पाद वापसी / विनिमय नीति",
    ],
  },
  {
    id: "plan-2999",
    price: "₹2,999",
    duration: "40–60 Min",
    durationHi: "40–60 मिनट",
    title: "Senior Acharya + 40–60 Min Call",
    titleHi: "वरिष्ठ ज्योतिषाचार्य + 40–60 मिनट कॉल",
    pillClass: "grv-astro-pill-master",
    badge: "In-Depth Master",
    badgeHi: "विस्तृत परामर्श",
    popular: false,
    details: [
      "Personalised Written Kundli & Navamsha",
      "Personalised Recommendation & Substitutes",
      "Free Handbook & Remedial Compendium",
      "1 × 40–60 Minute Video Call",
      "Transit Alerts & Custom Remedies",
      "Career, Wealth & Life Roadmap Deep-Dive",
      "10 Days Product Return / Exchange Policy",
    ],
    detailsHi: [
      "पर्सनलाइज़्ड लिखित कुंडली व नवमांश",
      "पर्सनलाइज़्ड रत्न व उपरत्न सिफारिश",
      "नि:शुल्क हैंडबुक व उपाय संग्रह",
      "1 × 40–60 मिनट वीडियो कॉल",
      "गोचर अलर्ट व विशेष उपाय",
      "कैरियर, धन व जीवन रोडमैप परामर्श",
      "10 दिन उत्पाद वापसी / विनिमय नीति",
    ],
  },
  {
    id: "plan-4999",
    price: "₹4,999",
    duration: "Annual",
    durationHi: "वार्षिक",
    title: "Annual Vedic Astro Membership",
    titleHi: "वार्षिक वैदिक ज्योतिष सदस्यता",
    pillClass: "grv-astro-pill-annual",
    badge: "Year-Round Guidance",
    badgeHi: "वार्षिक मार्गदर्शन",
    popular: false,
    details: [
      "Personalised Written Kundli & Varshphal",
      "Personalised Recommendation",
      "Free Handbook & Astro Reference Kit",
      "4 × Video Calls (Quarterly Guidance)",
      "Year-Round Transit & Eclipse Alerts",
      "Direct Priority WhatsApp Astrologer Access",
      "10 Days Product Return / Exchange Policy",
    ],
    detailsHi: [
      "पर्सनलाइज़्ड लिखित कुंडली व वर्षफल",
      "पर्सनलाइज़्ड रत्न सिफारिश",
      "नि:शुल्क हैंडबुक व संदर्भ किट",
      "4 × वीडियो कॉल (त्रैमासिक परामर्श)",
      "वर्ष भर गोचर व ग्रहण अलर्ट",
      "सीधा प्राथमिकता WhatsApp ज्योतिषी संपर्क",
      "10 दिन उत्पाद वापसी / विनिमय नीति",
    ],
  },
];

function AstroConsultationBanner({ reportId, form, lang = "en" }) {
  const navigate = useNavigate();
  const [bookingLoading, setBookingLoading] = useState(null);

  const getWhatsAppLink = (plan) => {
    const planTitle = lang === "hi" ? plan.titleHi : plan.title;
    const planDur = lang === "hi" ? plan.durationHi : plan.duration;
    const lines = [
      lang === "hi" ? "नमस्ते जेमऋषि! 🙏" : "Namaste GemRishi! 🙏",
      lang === "hi"
        ? `मैं ${plan.price} (${planDur}) वाला वैदिक ज्योतिष परामर्श पैकेज "${planTitle}" बुक करना चाहता/चाहती हूँ।`
        : `I would like to book the ${plan.price} (${planDur}) Astro Consultation plan: "${planTitle}".`,
      reportId ? `${lang === "hi" ? "रिपोर्ट संख्या" : "Dossier Report"}: #${reportId}` : null,
      form?.name ? `${lang === "hi" ? "नाम" : "Name"}: ${form.name}` : null,
      form?.dob ? `${lang === "hi" ? "जन्म तिथि" : "Date of Birth"}: ${form.dob}` : null,
      (form?.place?.label || form?.placeLabel)
        ? `${lang === "hi" ? "जन्म स्थान" : "Birth Place"}: ${form?.place?.label || form?.placeLabel}`
        : null,
      lang === "hi"
        ? "कृपया उपलब्ध समय (Slots) और पेमेंट लिंक साझा करें। धन्यवाद!"
        : "Please share available appointment slots and payment link. Thank you!",
    ].filter(Boolean);

    return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const handleBookPlan = async (plan) => {
    try {
      setBookingLoading(plan.id);
      const rawBase = (import.meta.env.VITE_URL || "https://api.gemrishi.com/api/v1").replace(/\/$/, "");

      const res = await axios.post(`${rawBase}/cashfree/create-consultation-order`, {
        planId: plan.id,
        reportId,
        form,
        customer: {
          name: form?.name,
          phone: form?.phone || form?.whatsapp,
          email: form?.email,
        },
      });

      if (!res.data?.paymentSessionId) {
        throw new Error(res.data?.message || "Failed to initialize payment");
      }

      const { paymentSessionId, cashfreeEnvironment, orderId } = res.data;
      const cashfree = await getCashfree(cashfreeEnvironment);

      const response = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      });

      if (response?.error) {
        console.warn("Cashfree modal notice:", response.error);
        if (response.error.message && response.error.message !== "User closed the modal") {
          window.open(getWhatsAppLink(plan), "_blank", "noopener,noreferrer");
        }
      } else {
        navigate(`/thank-you?order_id=${orderId}&consultation=true`);
      }
    } catch (err) {
      console.warn("Cashfree consultation booking error, falling back to WhatsApp:", err);
      // Fallback: If network issue or error, open WhatsApp so user is never blocked!
      window.open(getWhatsAppLink(plan), "_blank", "noopener,noreferrer");
    } finally {
      setBookingLoading(null);
    }
  };

  return (
    <aside className="grv-astro-banner" data-pdf-exclude="true" aria-label="Vedic Astrologer Consultation">
      <div className="grv-astro-header">
        <div className="grv-astro-badge">

          <span>{tr(lang, "astroConsultBadge")}</span>
        </div>
        <h3 className="grv-astro-title">{tr(lang, "astroConsultTitle")}</h3>
        <p className="grv-astro-sub">{tr(lang, "astroConsultSub")}</p>
      </div>

      <div className="grv-astro-plans-grid">
        {ASTRO_CONSULT_PLANS.map((plan) => {
          const title = lang === "hi" ? plan.titleHi : plan.title;
          const duration = lang === "hi" ? plan.durationHi : plan.duration;
          const badge = lang === "hi" ? plan.badgeHi : plan.badge;
          const details = lang === "hi" ? plan.detailsHi : plan.details;
          const isPop = plan.popular;

          return (
            <div
              key={plan.id}
              className={`grv-astro-plan-card ${isPop ? "grv-astro-plan-card-popular" : ""}`}
            >
              <div className="grv-astro-card-top">
                <span className={`grv-astro-card-pill ${plan.pillClass}`}>
                  {isPop ? `★ ${badge}` : badge}
                </span>
                <span className="grv-astro-duration">{duration}</span>
              </div>

              <div className="grv-astro-price">{plan.price}</div>
              <h4 className="grv-astro-plan-title">{title}</h4>
              <div className="grv-astro-divider" />

              <ul className="grv-astro-features">
                {details.map((item, idx) => (
                  <li key={idx} className="grv-astro-feature-item">
                    <span className="grv-astro-check" aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`grv-astro-btn ${isPop ? "grv-astro-btn-popular" : "grv-astro-btn-default"}`}
                onClick={() => handleBookPlan(plan)}
                disabled={bookingLoading === plan.id}
              >
                <span>{bookingLoading === plan.id ? "⏳" : "💳"}</span>
                <span>
                  {bookingLoading === plan.id
                    ? "Opening Cashfree…"
                    : `${tr(lang, "astroConsultBookBtn")} ${plan.price} →`}
                </span>
              </button>

              <a
                href={getWhatsAppLink(plan)}
                target="_blank"
                rel="noreferrer"
                className="grv-astro-wa-sublink"
                title="Prefer to book via WhatsApp?"
              >
                💬 Or Book via WhatsApp
              </a>
            </div>
          );
        })}
      </div>

      <div className="grv-astro-footer">
        <div className="grv-astro-policy-badge">
          <span aria-hidden="true">🛡️</span>
          <span>{tr(lang, "astroConsultPolicyNotice")}</span>
        </div>
        <div className="grv-astro-trust-points">
          <span aria-hidden="true">🕉️</span>
          <span>{tr(lang, "astroConsultTrustBar")}</span>
        </div>
      </div>
    </aside>
  );
}

// URL Helper for PDF: Ensure every link in the PDF points to the real GemRishi live site
function getAbsoluteSiteUrl(rawHref) {
  if (!rawHref) return "https://gemrishi.com";
  try {
    if (rawHref.startsWith("http://") || rawHref.startsWith("https://")) {
      const u = new URL(rawHref);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        return `https://gemrishi.com${u.pathname}${u.search}${u.hash}`;
      }
      return rawHref;
    }
    const clean = rawHref.startsWith("/") ? rawHref : `/${rawHref}`;
    return `https://gemrishi.com${clean}`;
  } catch (e) {
    return "https://gemrishi.com";
  }
}

// Build Dossier PDF Document & Base64 Data String
async function buildDossierPdfDocument(result) {
  const pageEls = Array.from(document.querySelectorAll(".grv-dossier .grv-page"));
  if (pageEls.length === 0) return null;

  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const availW = pageWidth - margin * 2;
  const availH = pageHeight - margin * 2;

  for (let i = 0; i < pageEls.length; i++) {
    const el = pageEls[i];
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");

    const fitScale = Math.min(availW / canvas.width, availH / canvas.height);
    const drawWidth = canvas.width * fitScale;
    const drawHeight = canvas.height * fitScale;
    const offsetX = margin + (availW - drawWidth) / 2;
    const offsetY = margin + (availH - drawHeight) / 2;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", offsetX, offsetY, drawWidth, drawHeight);

    // Annotate ALL interactive links in the page onto the PDF with canonical gemrishi.com URLs
    const pageRect = el.getBoundingClientRect();
    const scaleX = drawWidth / pageRect.width;
    const scaleY = drawHeight / pageRect.height;

    const links = Array.from(el.querySelectorAll("a[href]"));
    links.forEach((aEl) => {
      const rawHref = aEl.getAttribute("href") || aEl.href;
      if (!rawHref || rawHref === "#" || rawHref.startsWith("javascript:")) return;
      const absUrl = getAbsoluteSiteUrl(rawHref);

      const aRect = aEl.getBoundingClientRect();
      if (aRect.width === 0 || aRect.height === 0) return;

      const pdfX = offsetX + (aRect.left - pageRect.left) * scaleX;
      const pdfY = offsetY + (aRect.top - pageRect.top) * scaleY;
      const pdfW = aRect.width * scaleX;
      const pdfH = aRect.height * scaleY;

      pdf.link(pdfX, pdfY, pdfW, pdfH, { url: absUrl });
    });
  }

  const pdfBase64 = pdf.output("datauristring");
  return { pdf, pdfBase64 };
}

// Client manual download handler
async function generateDossierPdf(result) {
  const doc = await buildDossierPdfDocument(result);
  if (doc?.pdf) {
    doc.pdf.save(`${result.chart.reportId}-GemRishi-Vedic-Dossier.pdf`);
  }
}

// Background silent dispatch of lead + astrology + PDF to orders@gemrishi.com
async function sendLeadSuggestion({ form, result, pdfBase64 }) {
  try {
    const rawBase = import.meta.env.VITE_URL || "https://api.gemrishi.com/api/v1";
    const cleanBase = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

    const { chart, functionalNature, primary, secondary, carat } = result;
    const primaryInfo = primary ? PLANET_GEMSTONE[primary.planet] : null;
    const secondaryInfo = secondary ? PLANET_GEMSTONE[secondary.planet] : null;
    const primaryPurpose = primary ? getGemstonePurpose(primary.planet, form.focus, "en") : "";
    const secondaryPurpose = secondary ? getGemstonePurpose(secondary.planet, form.focus, "en") : "";

    const payload = {
      eventSourceUrl: typeof window !== "undefined" ? window.location.href.split("?")[0] : "https://gemrishi.com/suggest",
      reportId: chart?.reportId || form.leadEventId || `lead_${Date.now()}`,
      name: form.name,
      phone: form.phone || form.whatsapp || "",
      email: form.email || "",
      gender: form.gender,
      dob: form.dob,
      time: form.unknownTime ? "" : form.time,
      unknownTime: form.unknownTime,
      place: form.place?.label || form.placeLabel || "",
      latitude: form.place?.lat || null,
      longitude: form.place?.lon || null,
      weightKg: form.weightKg,
      budgetTier: form.budgetTier,
      focus: form.focus,
      lagnaSign: chart?.lagnaSign || "",
      moonSign: chart?.moonSign || "",
      mahadasha: chart?.mahadasha?.planet || "",
      antardasha: chart?.antardasha?.planet || "",
      primaryPlanet: primary?.planet || "",
      primaryStone: primaryInfo?.stone || "",
      primaryPurpose,
      secondaryPlanet: secondary?.planet || "",
      secondaryStone: secondaryInfo?.stone || "",
      secondaryPurpose,
      classification: primary?.classification || "",
      recommendedCarats: carat ? `${carat.tradeMinCt} – ${carat.tradeMaxCt}` : "",
      recommendedRatti: carat ? `${carat.tradeMinRatti} – ${carat.tradeMaxRatti}` : "",
      wearingFinger: primaryInfo?.finger || "",
      wearingDay: primaryInfo?.day || "",
      metal: primaryInfo?.metal || "",
      mantra: primaryInfo?.mantra || "",
      pdfBase64: pdfBase64 || "",
    };

    // Dispatch lead in background
    console.log("🚀 [GemRishi] Dispatching lead to:", `${cleanBase}/recommended/lead-suggestion`, payload);
    const res = await fetch(`${cleanBase}/recommended/lead-suggestion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("✅ [GemRishi] Lead submission status:", res.status);

    if (!res.ok && cleanBase !== "https://api.gemrishi.com/api/v1") {
      // Optional fallback if local dev proxy was offline
      await fetch("https://api.gemrishi.com/api/v1/recommended/lead-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
  } catch (err) {
    console.warn("Silent background lead notification note:", err);
  }
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@300;400;500;600&display=swap');

.grv-root, .grv-root *, .grv-root *::before, .grv-root *::after { box-sizing: border-box; }
.grv-root {
  --grv-emerald: #264A3F;
  --grv-emerald-dark: #142E27;
  --grv-gold: #2F8F6B;
  --grv-gold-soft: #8FC7AE;
  --grv-bronze: #4C7C68;
  --grv-cream: #FDFCF8;
  --grv-cream-2: #F3F8F5;
  --grv-border: #DCE7E1;
  --grv-text: #1C332B;
  --grv-muted: #5C7A6E;
  --grv-danger: #B3453A;
  --grv-warn: #2F6B52;
  background: var(--grv-cream);
  color: var(--grv-text);
  font-family: 'Montserrat', -apple-system, "Segoe UI", sans-serif;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 64px;
}
.grv-root h1, .grv-root h2, .grv-root h3, .grv-brand-title { font-family: 'Playfair Display', Georgia, serif; }
.grv-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; border-bottom:1px solid var(--grv-border); padding-bottom:16px; margin-bottom:24px; }
.grv-logo { display:flex; flex-direction:column; }
.grv-brand-title { font-size:26px; font-weight:700; color: var(--grv-emerald); line-height:1.1; letter-spacing:.3px; }
.grv-brand-subtitle { font-family: 'Montserrat', sans-serif; font-size:10px; font-weight:500; color: var(--grv-muted); letter-spacing:.16em; text-transform:uppercase; margin-top:3px; }
.grv-top-cert-badge {
  background: #FFFFFF;
  border: 1.5px solid var(--grv-emerald);
  border-radius: 12px;
  padding: 6px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 2px 6px rgba(23, 56, 45, 0.04);
}
.grv-top-cert-top {
  font-size: 13px;
  font-weight: 700;
  color: var(--grv-emerald);
  letter-spacing: 0.02em;
  line-height: 1.25;
}
.grv-top-cert-bottom {
  font-size: 11px;
  font-weight: 600;
  color: var(--grv-muted);
  letter-spacing: 0.04em;
  line-height: 1.25;
  margin-top: 2px;
}
.grv-hero-section {
  text-align: center;
  margin: 6px auto 26px;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grv-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #EEF5F1;
  border: 1px solid #D2E4DA;
  color: #17382D;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  padding: 4px 14px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.grv-badge-sparkle {
  color: #8C6A29;
  font-size: 10px;
}

.grv-hero-heading {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(26px, 3.8vw, 38px);
  font-weight: 700;
  color: #17382D;
  margin: 0 0 10px;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.grv-hero-description {
  font-size: clamp(13.5px, 1.6vw, 15px);
  color: #557266;
  margin: 0 0 16px;
  line-height: 1.5;
  max-width: 580px;
}

.grv-hero-trust-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2px;
}

.grv-trust-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: #2D5A43;
  background: #F4F8F5;
  border: 1px solid #DFEBE3;
  padding: 4px 12px;
  border-radius: 999px;
}

/* Quick Form vs Chat Mode toggle */
.grv-mode-tabs { display:flex; gap:8px; justify-content:center; margin-bottom:20px; }
.grv-mode-tab {
  background:#fff; border:1px solid #D5E5DD; border-radius:999px; padding:8px 20px;
  font-size:13px; font-weight:600; cursor:pointer; color: #557266; font-family:inherit;
  transition: all 0.2s ease;
}
.grv-mode-tab:hover { background: #F4F8F5; }
.grv-mode-tab-active {
  background: #1B3E32 !important;
  border-color: #1B3E32 !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(27,62,50,0.18);
}

/* Chat Mode */
.grv-chat {
  background:#E7F0EB; border:1px solid var(--grv-border); border-radius:14px; overflow:hidden;
  margin-bottom:20px; box-shadow: 0 2px 12px rgba(38,74,63,0.06);
}
.grv-chat-header { display:flex; align-items:center; gap:12px; background: var(--grv-emerald); color:#fff; padding:14px 18px; }
.grv-chat-avatar {
  width:36px; height:36px; border-radius:50%; background: var(--grv-gold-soft); color: var(--grv-emerald-dark);
  display:flex; align-items:center; justify-content:center; font-weight:700; font-family:'Playfair Display',serif;
}
.grv-chat-title { font-weight:600; font-size:14px; }
.grv-chat-status { font-size:11px; opacity:.85; display:flex; align-items:center; gap:5px; }
.grv-chat-dot { width:7px; height:7px; border-radius:50%; background:#5CE07A; display:inline-block; }
.grv-chat-body { padding:18px; max-height:480px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; }
.grv-chat-row { display:flex; margin:5px 0; }
.grv-chat-row-in { justify-content:flex-start; }
.grv-chat-row-out { justify-content:flex-end; }
.grv-chat-bubble {
  max-width:78%; padding:9px 13px; border-radius:12px; font-size:13.5px; line-height:1.4; position:relative;
}
.grv-chat-bubble-in { background:#fff; color: var(--grv-text); border-bottom-left-radius:2px; }
.grv-chat-bubble-out { background:#DCF3D9; color: var(--grv-text); border-bottom-right-radius:2px; }
.grv-chat-edit { margin-left:8px; border:none; background:none; color: var(--grv-bronze); font-size:11px; text-decoration:underline; cursor:pointer; padding:0; }
.grv-chat-composer-inline { margin:8px 0 8px 2px; }
.grv-chat-input-row { display:flex; gap:8px; align-items:flex-end; width:100%; max-width:420px; }
.grv-chat-input-row .grv-field { flex:1 1 auto; min-width:0; }
.grv-chat-input-row input, .grv-chat-input-row .grv-field input {
  box-sizing:border-box; flex:1 1 auto; min-width:0; background:#fff; border:1px solid var(--grv-border);
  border-radius:20px; padding:10px 16px; font-size:14px; font-family:inherit; outline:none; width:100%;
}
.grv-chat-send {
  box-sizing:border-box; width:38px; height:38px; min-width:38px; flex:0 0 38px; border-radius:50%; border:none;
  background: var(--grv-emerald); color:#fff; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center;
}
.grv-chat-send:disabled { opacity:.35; cursor:not-allowed; }
.grv-card {
  background: #FFFFFF;
  border: 1px solid #E2ECE6;
  border-radius: 16px;
  padding: 30px 32px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(23, 56, 45, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
}
@media (max-width: 640px) {
  .grv-card { padding: 20px 16px; border-radius: 14px; }
}

.grv-form-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.grv-form-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #17382d;
}
.grv-form-card-title {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 'Montserrat', sans-serif !important;
  font-size: 20px;
  font-weight: 700;
  color: #17382d;
  margin: 0;
  letter-spacing: -0.01em;
}

/* Section Dividers with Badges */
.grv-form-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 0 16px;
}
.grv-section-badge {
  background: #EEF5F1;
  color: #2D5A43;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.02em;
}
.grv-section-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #17382d;
  white-space: nowrap;
}
.grv-section-divider {
  flex: 1;
  height: 1px;
  background: #E8EFEA;
}

.grv-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
  margin-bottom: 16px;
}
@media (max-width: 700px) {
  .grv-grid-2 { grid-template-columns: 1fr; gap: 14px; }
}

.grv-field { display: flex; flex-direction: column; gap: 6px; position: relative; }
.grv-field label {
  font-size: 12px;
  font-weight: 600;
  color: #17382d;
  text-transform: none;
  letter-spacing: 0;
}

.grv-input,
.grv-field input[type="text"],
.grv-field input[type="email"],
.grv-field input[type="date"],
.grv-field input[type="number"],
.grv-field select {
  width: 100%;
  height: 42px;
  background: #FDFEFC;
  border: 1px solid #D5E5DD;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13.5px;
  color: #17382d;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.grv-input:focus,
.grv-field input:focus,
.grv-field select:focus {
  border-color: #1B3E32;
  box-shadow: 0 0 0 3px rgba(27, 62, 50, 0.08);
  background: #FFFFFF;
}
.grv-input::placeholder,
.grv-field input::placeholder {
  color: #9ab4a8;
  font-size: 13px;
}

/* Phone input with +91 prefix */
.grv-phone-input-group {
  display: flex;
  width: 100%;
}
.grv-phone-prefix {
  height: 42px;
  padding: 0 12px;
  background: #F4F8F5;
  border: 1px solid #D5E5DD;
  border-right: none;
  border-radius: 8px 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #17382d;
}
.grv-phone-field {
  flex: 1;
  border-radius: 0 8px 8px 0 !important;
}

/* Gender Row */
.grv-gender-row {
  display: flex;
  gap: 8px;
  height: 42px;
}
.grv-gender-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #FDFEFC;
  border: 1px solid #D5E5DD;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #17382d;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.grv-gender-pill:hover {
  background: #F4F8F5;
  border-color: #A3C9B8;
}
.grv-gender-pill-active {
  background: #EEF5F1 !important;
  border-color: #1B3E32 !important;
  font-weight: 600;
}
.grv-radio-circle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid #78998b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.grv-gender-pill-active .grv-radio-circle {
  border-color: #1B3E32;
  background: #1B3E32;
}
.grv-radio-inner-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #FFFFFF;
}

/* Input with icon (location) */
.grv-input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}
.grv-input-with-icon input {
  padding-right: 34px !important;
}
.grv-input-icon {
  position: absolute;
  right: 11px;
  color: #78998b;
  pointer-events: none;
}

/* Time Picker Controls */
.grv-time-picker {
  display: flex;
  flex-direction: column;
}
.grv-time-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 42px;
}
.grv-time-select {
  height: 42px;
  flex: 1;
  background: #FDFEFC;
  border: 1px solid #D5E5DD;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: #17382d;
  outline: none;
}
.grv-time-colon {
  font-weight: 700;
  color: #78998b;
  font-size: 14px;
}
.grv-ampm-toggle {
  display: flex;
  height: 42px;
  border: 1px solid #D5E5DD;
  border-radius: 8px;
  overflow: hidden;
  background: #FDFEFC;
}
.grv-ampm-btn {
  border: none;
  background: transparent;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: #637e72;
  cursor: pointer;
  transition: all 0.15s ease;
}
.grv-ampm-active {
  background: #D9EADF !important;
  color: #17382d !important;
  font-weight: 700;
}
.grv-time-preview {
  font-size: 11px;
  color: #637e72;
  margin-top: 4px;
}

/* Checkbox */
.grv-unknown-time-box {
  justify-content: center;
}
.grv-custom-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #17382d;
  cursor: pointer;
  margin-top: 14px;
}
.grv-custom-checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1B3E32;
}

/* Focus Field Highlighted Section */
.grv-focus-field {
  margin-top: 10px;
  background: #F6FAF7;
  border: 1px solid #D8EADB;
  border-radius: 12px;
  padding: 16px 16px 14px;
}
.grv-focus-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.grv-focus-label {
  font-size: 14.5px !important;
  font-weight: 700 !important;
  color: #14382C !important;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  letter-spacing: -0.01em;
  text-transform: none !important;
}
.grv-focus-label-icon {
  font-size: 14px;
  color: #8C6A29;
}
.grv-focus-label-text {
  font-size: 14.5px;
  font-weight: 700;
  color: #14382C;
}

/* Focus Grid Chips */
.grv-focus-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 2px;
}
@media (max-width: 640px) {
  .grv-focus-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
.grv-focus-btn {
  height: 40px;
  background: #FDFEFC;
  border: 1px solid #D5E5DD;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: #17382d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;
  transition: all 0.15s ease;
}
.grv-focus-btn:hover {
  background: #F4F8F5;
  border-color: #A3C9B8;
}
.grv-focus-btn-active {
  background: #D9EADF !important;
  border-color: #87B99C !important;
  color: #17382d !important;
  font-weight: 600;
}
.grv-focus-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #1B3E32;
  color: #FFFFFF;
}

/* CTA Button */
.grv-btn-find {
  width: 100%;
  height: 46px;
  background: #1B3E32 !important;
  color: #FFFFFF !important;
  border: none;
  border-radius: 8px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  transition: all 0.2s ease;
}
.grv-btn-find:hover:not(:disabled) {
  background: #142F27 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 62, 50, 0.2);
}
.grv-btn-find:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.grv-btn-arrow {
  font-size: 16px;
  transition: transform 0.2s ease;
}
.grv-btn-find:hover:not(:disabled) .grv-btn-arrow {
  transform: translateX(3px);
}

.grv-tooltip { font-size:12px; color: var(--grv-muted); background: var(--grv-cream-2); border:1px solid var(--grv-border); border-radius:8px; padding:10px; margin-top:4px; }
.grv-autocomplete-list { position:absolute; top:100%; left:0; right:0; background:#fff; border:1px solid var(--grv-border); border-radius:8px; margin-top:4px; max-height:180px; overflow-y:auto; z-index:20; list-style:none; padding:4px; box-shadow:0 4px 16px rgba(0,0,0,.08); }
.grv-autocomplete-list li { padding:8px; font-size:13px; cursor:pointer; border-radius:6px; }
.grv-autocomplete-list li:hover { background: var(--grv-cream-2); }
.grv-subtext { font-size:11px; color: var(--grv-bronze); }
.grv-pill { display:inline-block; margin-top:6px; font-size:12px; background:#E3F2EA; color:#1F5C46; padding:4px 10px; border-radius:999px; width:fit-content; }
.grv-btn-primary, .grv-btn-ghost, .grv-btn-cta {
  padding:12px 20px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; border:1px solid transparent;
  text-decoration:none; display:inline-flex; align-items:center; justify-content:center; font-family:inherit;
}
.grv-btn-primary { background: var(--grv-emerald); color:#fff; }
.grv-btn-ghost { background:transparent; border-color: var(--grv-border); color: var(--grv-text); }
.grv-shop-btn { margin-top:16px; }
.grv-inline-link { display:inline-block; margin-top:8px; font-size:13px; color: var(--grv-emerald); text-decoration:underline; }
.grv-lockline { text-align:center; font-size:11px; color: var(--grv-muted); margin-top:10px; }
.grv-error { color: var(--grv-danger); font-size:13px; margin-top:10px; }
.grv-demo-badge { background:#EAF6F0; color: var(--grv-warn); border:1px solid #BFE3D3; padding:8px 12px; border-radius:8px; font-size:12px; margin-bottom:16px; }
.grv-lang-toggle { display:flex; justify-content:center; gap:8px; margin-bottom:16px; }
.grv-lang-toggle button {
  background:#fff; border:1px solid var(--grv-border); border-radius:999px; padding:7px 18px; font-size:13px;
  font-weight:600; cursor:pointer; color: var(--grv-muted); font-family:inherit;
}
.grv-lang-active { background: var(--grv-emerald) !important; border-color: var(--grv-emerald) !important; color:#fff !important; }
.grv-page {
  position:relative; background:#fff; border:1px solid var(--grv-border); border-top:5px solid var(--grv-gold);
  border-radius:4px 4px 14px 14px; padding:48px 44px; margin-bottom:20px; box-shadow: 0 4px 20px rgba(38,74,63,0.08);
}
.grv-page-header { display:flex; justify-content:space-between; font-size:13px; color: var(--grv-bronze); text-transform:uppercase; letter-spacing:.06em; font-weight:700; border-bottom:1px solid var(--grv-border); padding-bottom:14px; margin-bottom:18px; }
.grv-page-sub { font-size:13px; color: var(--grv-muted); margin-bottom:24px; }
.grv-page h3 {
  font-family: 'Playfair Display', Georgia, serif;
  color: var(--grv-emerald);
  font-size: 16px;
  letter-spacing: .02em;
  margin: 24px 0 12px;
  display: flex;
  align-items: center;
}
.grv-page h3:first-of-type { margin-top: 10px; }
.grv-h3-sparkle {
  color: #2F8F6B;
  font-size: 13px;
  margin-right: 7px;
  display: inline-block;
}
.grv-astro-card-details {
  background: #FBFDFB;
  border: 1px solid #E1EFE7;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 20px;
}
.grv-icon-dot {
  font-size: 13px;
  display: inline-block;
  margin-right: 5px;
}

/* Kundli Stage with Lotus Watermark & Celestial Sparkles */
.grv-kundli-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 18px 0 28px;
  overflow: visible;
}

.grv-kundli-lotus-bg {
  position: absolute;
  left: 6%;
  top: 50%;
  transform: translateY(-50%);
  width: 135px;
  height: 135px;
  opacity: 0.25;
  pointer-events: none;
  filter: drop-shadow(0 2px 8px rgba(47, 143, 107, 0.15));
}
@media (max-width: 680px) {
  .grv-kundli-lotus-bg {
    left: 0;
    width: 90px;
    height: 90px;
    opacity: 0.15;
  }
}

.grv-kundli-orbit-bg {
  position: absolute;
  right: 7%;
  top: 48%;
  transform: translateY(-50%);
  width: 110px;
  height: 110px;
  opacity: 0.38;
  pointer-events: none;
}
@media (max-width: 680px) {
  .grv-kundli-orbit-bg {
    right: 0;
    width: 80px;
    height: 80px;
    opacity: 0.22;
  }
}

/* Elevated 3D White Kundli Frame with Emerald Aura Shadow */
.grv-kundli-frame {
  max-width: 360px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: #FFFFFF;
  border: 1.5px solid rgba(210, 235, 222, 0.85);
  border-radius: 20px;
  box-shadow:
    0 16px 45px rgba(47, 143, 107, 0.20),
    0 32px 70px rgba(47, 143, 107, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.03);
  position: relative;
  z-index: 2;
  overflow: hidden;
}
.grv-kundli-frame-lg { max-width: 470px; padding: 22px; }

/* Top-Right Golden-Lime Aura Highlight */
.grv-kundli-corner-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 90px;
  height: 90px;
  background: radial-gradient(circle at top right, rgba(214, 245, 153, 0.8) 0%, rgba(120, 220, 160, 0.35) 45%, transparent 75%);
  pointer-events: none;
  border-top-right-radius: 20px;
}

.grv-kundli {
  width: 100%;
  max-width: 320px;
  display: block;
  margin: 0 auto;
}
.grv-kundli-frame-lg .grv-kundli { max-width: 100%; }

.grv-kundli-bg {
  fill: #EAF6F0;
  stroke: #1E6E50;
  stroke-width: 2.5;
}
.grv-kundli-line {
  stroke: #237A58;
  stroke-width: 1.25;
}
.grv-kundli-diamond {
  stroke-width: 1.6;
  stroke: #1E6E50;
}
.grv-kundli-bindu {
  fill: #1E6E50;
}
.grv-kundli-house-num {
  font-size: 8.5px;
  fill: #406D5B;
  font-weight: 600;
}
.grv-kundli-sign {
  font-size: 9.5px;
  fill: #1E6E50;
  font-weight: 700;
}
.grv-kundli-planets {
  font-size: 8px;
  fill: #0F2D23;
  font-weight: 800;
  letter-spacing: 0.02em;
}
.grv-stone-heading { text-align:center; font-size:22px !important; margin-top:8px !important; }

/* Real Gemstone Photo Hero above Recommendation */
.grv-stone-hero-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 18px auto 14px;
}
.grv-stone-photo-medallion {
  position: relative;
  width: 170px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #ffffff 40%, #F1F7F4 85%, #E3EFE9 100%);
  border: 2px solid #DCE7E1;
  border-radius: 50%;
  box-shadow: 0 6px 20px rgba(38, 74, 63, 0.12), inset 0 0 12px rgba(47, 143, 107, 0.08);
  padding: 12px;
}
.grv-stone-photo-img {
  max-width: 140px;
  max-height: 130px;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgba(20, 46, 39, 0.22));
  transition: transform 0.3s ease;
}
.grv-stone-photo-img:hover {
  transform: scale(1.05);
}
.grv-stone-verified-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1F7A44;
  background: #EAFBEF;
  border: 1px solid #BFE9CC;
  padding: 4px 12px;
  border-radius: 999px;
}
.grv-verified-icon {
  font-weight: 800;
  font-size: 12px;
}

/* Real Products Section */
.grv-products-section {
  margin: 28px 0 20px;
  padding-top: 22px;
  border-top: 1px solid var(--grv-border);
}
.grv-products-header {
  text-align: center;
  margin-bottom: 20px;
}
.grv-products-header h4 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 19px;
  color: var(--grv-emerald);
  margin: 0 0 6px;
  font-weight: 600;
}
.grv-products-header p {
  font-size: 12.5px;
  color: var(--grv-muted);
  margin: 0;
}
.grv-products-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
}
.grv-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(38, 74, 63, 0.15);
  border-top-color: var(--grv-emerald);
  border-radius: 50%;
  animation: grv-spin 0.8s linear infinite;
}
@keyframes grv-spin {
  to { transform: rotate(360deg); }
}
.grv-products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 860px) {
  .grv-products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .grv-products-grid {
    grid-template-columns: 1fr;
  }
}
.grv-product-card {
  border: 1px solid var(--grv-border);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: var(--grv-text);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(38, 74, 63, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.grv-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(38, 74, 63, 0.12);
  border-color: var(--grv-gold-soft);
}
.grv-product-img-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f7faf8;
  overflow: hidden;
}
.grv-product-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.grv-product-card:hover .grv-product-img-wrapper img {
  transform: scale(1.05);
}
.grv-product-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(38, 74, 63, 0.9);
  color: #fff;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  font-weight: 500;
  backdrop-filter: blur(4px);
}
.grv-product-info {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.grv-product-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--grv-text);
  line-height: 1.35;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 36px;
}
.grv-product-meta {
  font-size: 11.5px;
  color: var(--grv-muted);
  margin-bottom: 8px;
}
.grv-product-pricing {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
  margin-bottom: 10px;
}
.grv-price-current {
  font-size: 15px;
  font-weight: 700;
  color: var(--grv-emerald);
}
.grv-price-orig {
  font-size: 11.5px;
  color: #8fa39a;
  text-decoration: line-through;
}
.grv-product-cta-btn {
  display: block;
  text-align: center;
  font-size: 11.5px;
  font-weight: 600;
  color: #ffffff;
  background: var(--grv-emerald);
  padding: 7px 10px;
  border-radius: 6px;
  transition: background 0.15s ease;
  letter-spacing: 0.02em;
}
.grv-product-card:hover .grv-product-cta-btn {
  background: #1a362e;
}

.grv-table { width:100%; border-collapse:collapse; font-size:13.5px; margin-top:10px; }
.grv-table th, .grv-table td { text-align:left; padding:11px; border-bottom:1px solid var(--grv-border); }
.grv-table th { color: var(--grv-bronze); text-transform:uppercase; font-size:11px; letter-spacing:.04em; }
.grv-fn-yogakaraka { color:#1E8465; font-weight:600; }
.grv-fn-benefic { color:#3E7362; }
.grv-fn-malefic { color:#5A6B60; }
.grv-fn-neutral { color: var(--grv-muted); }
.grv-fallback-note { text-align:center; padding:32px 12px; font-size:14px; color: var(--grv-text); background: var(--grv-cream-2); border-radius:10px; }
.grv-trust-links { display:flex; gap:16px; margin-top:16px; flex-wrap:wrap; }
.grv-trust-links a { font-size:12px; color: var(--grv-emerald); text-decoration:underline; }
.grv-assurance { font-size:11px; color: var(--grv-muted); border-top:1px solid var(--grv-border); padding-top:14px; margin-top:20px; }
.grv-save-card h3 { margin-top:0; }
.grv-actions { display:flex; justify-content:center; gap:12px; margin-top:8px; flex-wrap:wrap; }

/* Dual Gemstones Presentation (Page 2) */
.grv-dual-gems-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 14px 0 16px;
}
@media (max-width: 640px) {
  .grv-dual-gems-grid {
    grid-template-columns: 1fr;
  }
}
.grv-gem-card {
  background: #FCFDFB;
  border: 1px solid var(--grv-border);
  border-radius: 12px;
  padding: 16px 14px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: 0 2px 8px rgba(38,74,63,0.04);
}
.grv-gem-card-primary {
  border-top: 4px solid var(--grv-gold);
}
.grv-gem-card-secondary {
  border-top: 4px solid #6E9B85;
}
.grv-gem-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 12px;
  border-radius: 999px;
  margin-bottom: 6px;
}
.grv-gem-badge-primary {
  background: #EAFBEF;
  color: #1F7A44;
  border: 1px solid #BFE9CC;
}
.grv-gem-badge-secondary {
  background: #EDF4F1;
  color: #355E50;
  border: 1px solid #CFE0D8;
}
.grv-gem-card-title {
  font-size: 18px !important;
  color: var(--grv-emerald);
  margin: 6px 0 10px !important;
  text-align: center;
}
.grv-gem-specs {
  width: 100%;
  font-size: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 8px;
  margin-bottom: 10px;
  line-height: 1.45;
  background: #ffffff;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #EAEFEA;
}
.grv-gem-purpose-box {
  width: 100%;
  background: #F4F8F5;
  border: 1px solid #DCE7E1;
  border-left: 3px solid #2F8F6B;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 11.5px;
  color: #1C332B;
  line-height: 1.45;
  margin-top: auto;
}
.grv-gem-purpose-box b {
  color: #1F7A44;
  display: inline-block;
  margin-right: 4px;
}
.grv-weight-subnote {
  font-size: 11.5px;
  color: var(--grv-muted);
  margin-top: -4px;
  margin-bottom: 6px;
}
.grv-shop-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.grv-shop-actions .grv-shop-btn {
  flex: 1 1 240px;
  margin-top: 0 !important;
}
.grv-shop-btn-sec {
  background: #2F6B52 !important;
}
.grv-browse-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;
}

/* Product Stone Inventory Toggle */
.grv-product-stone-toggle {
  display: inline-flex;
  background: #EAEFEA;
  padding: 2px;
  border-radius: 999px;
  gap: 2px;
}
.grv-product-stone-toggle button {
  border: none;
  background: transparent;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--grv-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}
.grv-product-stone-toggle .grv-pst-active {
  background: #fff;
  color: var(--grv-emerald);
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

/* AM/PM Time Selector */
.grv-time-picker {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.grv-time-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.grv-time-select {
  background: var(--grv-cream-2);
  border: 1px solid var(--grv-border);
  color: var(--grv-text);
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  font-family: inherit;
  cursor: pointer;
}
.grv-time-select:focus {
  border-color: var(--grv-gold);
}
.grv-time-colon {
  font-size: 18px;
  font-weight: 700;
  color: var(--grv-bronze);
}
.grv-ampm-toggle {
  display: flex;
  border: 1px solid var(--grv-border);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.grv-ampm-btn {
  border: none;
  background: transparent;
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  color: var(--grv-muted);
  font-family: inherit;
  transition: all 0.15s ease;
}
.grv-ampm-btn:focus {
  outline: 2px solid var(--grv-gold);
}
.grv-ampm-active {
  background: var(--grv-emerald) !important;
  color: #fff !important;
}
.grv-time-preview {
  font-size: 11.5px;
  color: var(--grv-muted);
  margin-top: 2px;
}
.grv-time-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Chat Mode Time & Choices */
.grv-chat-time-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fff;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--grv-border);
  max-width: 360px;
}
.grv-chat-time-confirm {
  background: var(--grv-emerald);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}
.grv-chat-time-confirm:hover {
  background: #1a362e;
}
.grv-chip-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 440px;
}
.grv-chip-choice {
  background: #fff;
  border: 1px solid var(--grv-border);
  border-radius: 10px;
  padding: 10px 14px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.grv-chip-choice:hover, .grv-chip-choice:focus {
  border-color: var(--grv-gold);
  background: #F4F8F5;
  outline: none;
}
.grv-chip-choice.grv-chip-active {
  background: var(--grv-emerald);
  color: #fff;
  border-color: var(--grv-emerald);
}
.grv-choice-title {
  font-size: 13px;
  font-weight: 600;
}
.grv-choice-sub {
  font-size: 11px;
  opacity: 0.8;
  margin-top: 2px;
  line-height: 1.35;
}

/* Web-Only Post-Dossier Sections */
.grv-web-only-footer-sections {
  margin-top: 48px;
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  background: #FDFCF8;
  border-top: 1px solid var(--grv-border);
  padding: 48px 0 20px;
}
  .grav-super {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    gap: 52px;
    width: 100%;
  }
  @media (max-width: 768px) {
    .grav-super {
      flex-direction: column;
      align-items: center;
      gap: 28px;
    }
  }
  .grav-super .grv-legacy-video-card {
    flex: 1 1 0;
    max-width: 440px;
    width: 100%;
  }
  @media (max-width: 768px) {
    .grav-super .grv-legacy-video-card {
      max-width: 100%;
    }
  }
.grv-legacy-video-section {
  max-width: 1020px;
  margin: 0 auto 52px;
  padding: 0 20px;
}
.grv-section-heading-center {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 32px;
}
.grv-gold-pill {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: #8C6A29;
  margin-bottom: 12px;
  font-family: 'Montserrat', sans-serif;
}
.grv-gold-pill::before,
.grv-gold-pill::after {
  content: '';
  display: inline-block;
  width: 38px;
  height: 1px;
  background: #D4C39C;
}
.grv-section-heading-center h2 {
  font-size: clamp(28px, 3.5vw, 36px);
  font-weight: 600;
  color: #17382d;
  margin: 0 0 12px;
  font-family: 'Playfair Display', Georgia, serif;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.grv-amp {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-weight: 500;
  font-style: normal;
  display: inline-block;
  padding: 0 1px;
}
.grv-section-heading-center p {
  color: #557266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 auto;
  max-width: 600px;
  font-family: 'Montserrat', sans-serif;
}
.grv-legacy-video-card {
  width: 100%;
  max-width: none;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 14px 40px rgba(23, 56, 45, 0.12);
  border: 1px solid var(--grv-border);
  background: #000;
}
.grv-video-aspect {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
}
.grv-video-aspect iframe {
  width: 100%;
  height: 100%;
  display: block;
  border: none;
}
/* ---------------------------------------------------------------------------
   Astro Consultation Banner (Light Emerald Theme) — Multi-Tier Consultation
   --------------------------------------------------------------------------- */
.grv-astro-banner {
  position: relative;
  background: linear-gradient(145deg, #F3F9F6 0%, #E9F4EE 50%, #DFEFE7 100%);
  border: 1.5px solid #C1DFD1;
  box-shadow: 0 10px 32px rgba(38, 74, 63, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 32px 28px 24px;
  margin: 24px 0 20px;
  color: var(--grv-text);
  overflow: hidden;
}
.grv-astro-banner::before {
  content: "";
  position: absolute;
  top: -80px;
  right: -80px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(143, 199, 174, 0.28) 0%, rgba(143, 199, 174, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}
.grv-astro-banner::after {
  content: "";
  position: absolute;
  bottom: -60px;
  left: -60px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(47, 143, 107, 0.16) 0%, rgba(47, 143, 107, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}
.grv-astro-header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 26px;
  position: relative;
  z-index: 1;
}
.grv-astro-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #D8EDE2;
  border: 1px solid #A4CEB9;
  color: #166442;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 10px;
}
.grv-astro-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(22px, 2.8vw, 30px);
  font-weight: 700;
  color: #14362C;
  margin: 0 0 8px;
  line-height: 1.25;
}
.grv-astro-sub {
  font-size: 13.5px;
  line-height: 1.55;
  color: #496C5F;
  margin: 0 auto;
}
.grv-astro-plans-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}
@media (max-width: 960px) {
  .grv-astro-plans-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 580px) {
  .grv-astro-plans-grid {
    grid-template-columns: 1fr;
  }
}
.grv-astro-plan-card {
  background: #FFFFFF;
  border: 1.5px solid #D5E7DF;
  border-radius: 14px;
  padding: 20px 18px 18px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 4px 14px rgba(38, 74, 63, 0.04);
  position: relative;
}
.grv-astro-plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 26px rgba(38, 74, 63, 0.12);
  border-color: var(--grv-emerald);
}
.grv-astro-plan-card-popular {
  border: 2px solid var(--grv-emerald);
  box-shadow: 0 8px 24px rgba(38, 74, 63, 0.12);
  background: #FDFFFE;
}
.grv-astro-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.grv-astro-card-pill {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 999px;
  width: fit-content;
}
.grv-astro-pill-starter {
  background: #EAFBEF;
  border: 1px solid #BFE9CC;
  color: #1F7A44;
}
.grv-astro-pill-popular {
  background: var(--grv-emerald);
  color: #FFFFFF;
}
.grv-astro-pill-master {
  background: #F4EEDC;
  border: 1px solid #DFCE9F;
  color: #7D5C1E;
}
.grv-astro-pill-annual {
  background: #EAF0FA;
  border: 1px solid #C4D5F2;
  color: #244E94;
}
.grv-astro-duration {
  font-size: 11.5px;
  font-weight: 700;
  color: #2D6B53;
  background: #EBF5F0;
  padding: 3px 9px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 8px;
  width: fit-content;
}
.grv-astro-price {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 32px;
  font-weight: 800;
  color: #14362C;
  line-height: 1;
  margin: 2px 0 6px;
}
.grv-astro-plan-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #19382E;
  margin: 0 0 12px;
  line-height: 1.35;
  min-height: 36px;
}
.grv-astro-divider {
  border-top: 1px solid #E4EFE8;
  margin: 0 0 14px;
}
.grv-astro-features {
  list-style: none;
  padding: 0;
  margin: 0 0 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.grv-astro-feature-item {
  font-size: 12px;
  line-height: 1.38;
  color: #2D4D41;
  display: flex;
  align-items: flex-start;
  gap: 7px;
}
.grv-astro-check {
  font-size: 13px;
  font-weight: 800;
  color: #1F7A44;
  line-height: 1.2;
  flex-shrink: 0;
}
.grv-astro-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s ease;
  font-family: inherit;
  cursor: pointer;
  margin-top: auto;
  border: 1px solid transparent;
}
.grv-astro-btn-popular {
  background: var(--grv-emerald);
  color: #FFFFFF !important;
  box-shadow: 0 4px 14px rgba(38, 74, 63, 0.22);
}
.grv-astro-btn-popular:hover {
  background: #142E27;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(38, 74, 63, 0.3);
}
.grv-astro-btn-default {
  background: #F1F8F4;
  border-color: #B9DACB;
  color: #1A4637 !important;
}
.grv-astro-btn-default:hover {
  background: var(--grv-emerald);
  border-color: var(--grv-emerald);
  color: #FFFFFF !important;
  transform: translateY(-2px);
}
.grv-astro-footer {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid #CEE4D8;
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #375C4E;
  position: relative;
  z-index: 1;
}
.grv-astro-policy-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  color: #194636;
}
.grv-astro-trust-points {
  display: flex;
  align-items: center;
  gap: 8px;
}
@media (max-width: 768px) {
  .grv-astro-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  .grv-astro-banner {
    padding: 24px 16px 20px;
  }
}

@media print {
  .grv-header, .grv-hero, .grv-actions, .grv-demo-badge, .grv-save-card, .grv-shop-btn, .grv-inline-link,
  .grv-trust-links, .grv-wa-banner, .grv-mode-tabs, .grv-lang-toggle, .grv-product-cta-btn,
  .grv-astro-banner, .grv-web-only-footer-sections, [data-pdf-exclude="true"] { display:none !important; }
  .grv-root { background:#fff; }
  .grv-page { page-break-after: always; border:none; box-shadow:none; }
}
/* Consultation Consent & CTA */
.grv-consultation-consent-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 14px;
  background: #F9FCFA;
  border: 1px solid #D6EAE0;
  padding: 14px 16px;
  border-radius: 12px;
}
.grv-consent-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  user-select: none;
}
.grv-consent-checkbox {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: #1E6E50;
  cursor: pointer;
  flex-shrink: 0;
}
.grv-consent-text {
  font-size: 12.5px;
  line-height: 1.45;
  color: #2D3748;
  font-weight: 500;
}
.grv-btn-get-consultation {
  width: 100%;
  padding: 14px 22px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: linear-gradient(135deg, #1E6E50 0%, #2F8F6B 100%);
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(30, 110, 80, 0.28);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
}
.grv-btn-get-consultation:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(30, 110, 80, 0.38);
  background: linear-gradient(135deg, #175a41 0%, #26795a 100%);
}
.grv-btn-get-consultation:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.grv-btn-arrow-right {
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
}
.grv-trust-secure-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #4A6B5D;
  font-weight: 600;
  margin-top: 4px;
  text-align: center;
}
.grv-trust-lock-icon {
  font-size: 13px;
}
.grv-astro-wa-sublink {
  display: block;
  text-align: center;
  font-size: 11.5px;
  color: #128C7E;
  font-weight: 600;
  margin-top: 6px;
  text-decoration: none;
}
.grv-astro-wa-sublink:hover {
  text-decoration: underline;
}
.grv-astro-btn:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none !important;
}

`;
