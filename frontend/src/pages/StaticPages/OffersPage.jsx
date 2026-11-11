import {
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Gem,
  Gift,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tag,
  Truck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { FaHandsPraying } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { addItemToCart as addToCartAction } from "../../redux/cartSlice";
import { fbqTrack, fbqTrackCustom } from "../../utils/metaPixel";
import RingImg from "../../assets/Jwellery/Ring.svg";
import PendantImg from "../../assets/Jwellery/Pendants.svg";
import EmeraldImg from "../../assets/Stone/Emerald.svg";
import {
  CAMPAIGN_CONFIG,
  isCampaignActive,
} from "../../config/campaignOffers.config.js";
// ------------Add By Pawan__________
const LOGO = "/GemRishi.svg";
const FESTIVAL_NAME = CAMPAIGN_CONFIG.campaignName || "Festive Offer";
const OFFER_END_DATE = CAMPAIGN_CONFIG.endDate || "2026-12-31T23:59:59+05:30";
const OFFER_VALID_TILL = (() => {
  if (!CAMPAIGN_CONFIG.endDate) return "Limited Time";
  const d = new Date(CAMPAIGN_CONFIG.endDate);
  return Number.isNaN(d.getTime())
    ? "Limited Time"
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
})();
const WHATSAPP_NUMBER = "919817975978";
const PHONE_DISPLAY = "+91 98179 75978";
const WHATSAPP_TEXT = encodeURIComponent(`Hello GemRishi, I have a query about the ${FESTIVAL_NAME} Offer.`);
const SHOW_FREE_RING_CONTENT = Boolean(
  CAMPAIGN_CONFIG.bagOffer?.enabled || CAMPAIGN_CONFIG.jewelleryOffer?.enabled
);
const TIMED_CTA_DELAY_MS = 5000; // CTA appears once, 5 seconds after load
const TIMED_CTA_KEY = "gr_timed_cta_seen"; // remembers that the popup was already shown
const BANNER_INTERVAL_MS = 5000;

// ---------------- SEO: edit these values ----------------
const SITE_URL = "https://www.gemrishi.com"; // no trailing slash. Confirm this is your real domain
const PAGE_PATH = "/offers"; // route of this page
const SEO_TITLE = `${FESTIVAL_NAME} Gemstone Offers – Special Discounts | GemRishi`;
const SEO_DESCRIPTION =
  `Celebrate with exclusive discounts on gemstones and jewellery at GemRishi. Explore Pukhraj, Neelam, Panna, Ruby, Moonga, Silver rings and more.`;
const SEO_KEYWORDS =
  "gemstone offers, festive offers 2026, 15% off gemstones, silver ring offer, buy gemstones online, Pukhraj, Neelam, Panna, Ruby, Moonga, certified natural gemstones, GemRishi";
const SEO_IMAGE = `${SITE_URL}/offers-assets/Banner.webp`; // shown when the link is shared

// ---------------- Banner slides: edit images and CTAs here ----------------
// ctaPos: per-slide Tailwind margin/position tweaks for the CTA group.
// ml-* moves the button right, mb-* moves it up (the group is anchored to the bottom).
const BANNERS = [
  {
    desktop: "/offers-assets/Banner.webp",
    mobile: "/offers-assets/Bannermobile.webp",
    alt: `${FESTIVAL_NAME} Festive Offers at GemRishi`,
    ctaPos: "md:ml-12 lg:ml-20 mb-1 sm:mb-1.5 md:mb-2",
    ctas: [
      { label: "Shop Gemstones", to: "/gemstone" },
    ],
  },
  {
    desktop: "/offers-assets/Banner2.webp",
    mobile: "/offers-assets/Bannermobile2.webp",
    alt: "Designer gemstone rings and pendants",
    ctaPos: "md:ml-12 lg:ml-20 mb-1 sm:mb-1.5 md:mb-2",
    ctas: [
      { label: "Shop Rings", to: "/rings" },
    ],
  },
  {
    desktop: "/offers-assets/Banner3.webp",
    mobile: "/offers-assets/Bannermobile3.webp",
    alt: "Authentic Rudraksha and gifting",
    ctaPos: "md:ml-12 lg:ml-20 mb-1 sm:mb-1.5 md:mb-2",
    ctas: [
      { label: "Shop Rudraksha", to: "https://rudraksha.gemrishi.com/", external: true },
    ],
  },
];

// Dynamic offer details directly controlled by CAMPAIGN_CONFIG
const OFFER = {
  gemstone: {
    code: CAMPAIGN_CONFIG.gemstoneOffer?.code || "GEMRISHI10",
    alternateCodes: CAMPAIGN_CONFIG.gemstoneOffer?.alternateCodes || ["DHANTERAS15"],
    discountPercent: CAMPAIGN_CONFIG.gemstoneOffer?.discountPercent || 15,
    minGemstonePrice: CAMPAIGN_CONFIG.gemstoneOffer?.minGemstonePrice || 0,
  },
  bag: {
    code: CAMPAIGN_CONFIG.bagOffer?.code || "FESTIVAL",
    giftName: CAMPAIGN_CONFIG.bagOffer?.giftName || "Complimentary 5-MUKHI RUDRAKSHA",
    giftValue: CAMPAIGN_CONFIG.bagOffer?.giftValue || 1200,
    giftDescription: CAMPAIGN_CONFIG.bagOffer?.giftDescription || "Festive Offer: Free 5 MUKHI RUDRAKSHA",
    minBagTotal: CAMPAIGN_CONFIG.bagOffer?.conditions?.minBagTotal || CAMPAIGN_CONFIG.bagOffer?.minBagTotal || 10000,
  },
  silverRing: {
    code: CAMPAIGN_CONFIG.bagOffer?.code || CAMPAIGN_CONFIG.jewelleryOffer?.code || "FESTIVAL",
    discountAmount: CAMPAIGN_CONFIG.bagOffer?.discountAmount || CAMPAIGN_CONFIG.bagOffer?.ringDiscountAmount || 1200,
    minBagTotal: CAMPAIGN_CONFIG.bagOffer?.conditions?.minBagTotal || CAMPAIGN_CONFIG.bagOffer?.minBagTotal || 10000,
    title: CAMPAIGN_CONFIG.bagOffer?.ringDiscountTitle || CAMPAIGN_CONFIG.jewelleryOffer?.title || "Festive Silver Ring Offer",
  },
};

// CSS selectors hidden ONLY while /offers is open.
const HIDE_ON_OFFERS = [
  "footer:not([data-offers-footer])",
  "header:not([data-offers-header])",
].join(",");

// One card style used everywhere so corners and shadows stay identical
const CARD = "rounded-2xl bg-white border border-gray-100 shadow-lg shadow-orange-900/10";
const CARD_HOVER = "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-900/20 transition-all duration-300";
const SECTION = "max-w-6xl mx-auto px-4 sm:px-6 mt-10 sm:mt-16";
const SHIMMER_BTN = "bg-[linear-gradient(110deg,#F5B301_0%,#FFE08A_25%,#F5B301_50%,#FF9F1C_75%,#F5B301_100%)] bg-[length:200%_100%] animate-[gr-shimmer_3s_linear_infinite] motion-reduce:animate-none";
const HERO_BG = "bg-[linear-gradient(120deg,#3A0A24,#7A0C2E,#B8400A,#7A0C2E,#3A0A24)] bg-[length:300%_300%] animate-[gr-bg_14s_ease-in-out_infinite] motion-reduce:animate-none";

const TICKER = [
  "Flat 15% off natural gemstones",
  "Free insured shipping across India",
  "Free Traditional Blessing Service on orders above ₹20,000",
  "Lab-certified natural gemstones",
  "Free gifts on orders above ₹10,000",
];

const BENEFITS = [
  { icon: Tag, title: "Flat Discount", sub: "On all natural gemstones" },
  { icon: Gift, title: "Free Gifts", sub: "On orders above ₹10,000" },
  { icon: Gem, title: "Festive Pricing", sub: "Special making charges" },
  { icon: Truck, title: "Free Shipping", sub: "Insured, across India" },
  { icon: ShieldCheck, title: "On-Time Delivery", sub: "Guaranteed for the festival" },
];

const CATEGORIES = [
  { img: EmeraldImg, name: "Gemstones", sub: "Certified & natural", to: "/gemstone", color: "from-amber-300 to-orange-600" },
  { img: RingImg, name: "Rings", sub: "Elegant & powerful", to: "/rings", color: "from-fuchsia-400 to-rose-600" },
  { img: PendantImg, name: "Pendants", sub: "Divine & stylish", to: "/pendants", color: "from-orange-400 to-red-600" },
  {
    img: "/offers-assets/rudraksha.jpg",
    name: "Rudraksha",
    sub: "Authentic & certified",
    to: "https://rudraksha.gemrishi.com/",
    external: true,
    color: "from-amber-600 to-red-800",
  },
  { img: "/offers-assets/gift.png", icon: Gift, name: "Gifting", sub: "Thoughtful & meaningful", to: "https://mandalagoodvibes.com/", external: true, color: "from-yellow-300 to-amber-600" },
];

// ---------------- Featured products: four rows, 6 products each ----------------
// `path` comes from the product links. Fill in `_id`, `price` and `img` if you want
// "Add to cart" (needs _id). Without `_id` the button becomes "View details".
// A row with `external: true` opens its links on another site (new tab).
const FEATURED_ROWS = [
  {
    title: "Certified natural gemstones",
    viewAll: "/gemstone",
    items: [
      { path: "/products/emerald-8-15-carats/panna-222", name: "Emerald (Panna) 8.15 Carats", _id: "", price: 0, img: "" },
      { path: "/products/blue-sapphire-5-04-carats/nelam-28", name: "Blue Sapphire (Neelam) 5.04 Carats", _id: "", price: 0, img: "" },
      { path: "/products/ruby-manik-6-00-carats/ruby-200", name: "Ruby (Manik) 6.00 Carats", _id: "", price: 0, img: "" },
      { path: "/products/pearl-stone-moti-5-17-carats/moti-210", name: "Pearl (Moti) 5.17 Carats", _id: "", price: 0, img: "" },
      { path: "/products/emerald-5-05-carats/panna-493", name: "Emerald (Panna) 5.05 Carats", _id: "", price: 0, img: "" },
      { path: "/products/rose-quartz-8-10-carats/turma-24", name: "Rose Quartz 8.10 Carats", _id: "", price: 0, img: "" },
    ],
  },
  {
    title: "Designer gemstone rings",
    viewAll: "/rings",
    items: [
      { path: "/products/the-royal-filigree-sovereign/grys15-1", name: "The Royal Filigree Sovereign", _id: "", price: 0, img: "" },
      { path: "/products/the-celestial-sovereign/grbs12", name: "The Celestial Sovereign", _id: "", price: 0, img: "" },
      { path: "/products/the-verdant-heirloom-a/grce1-01", name: "The Verdant Heirloom A", _id: "", price: 0, img: "" },
      { path: "/products/the-crimson-meridian-split-shank-a/grrc14-01", name: "The Crimson Meridian Split Shank A", _id: "", price: 0, img: "" },
      { path: "/products/the-stellar-meridian-bypass/grws8-01", name: "The Stellar Meridian Bypass", _id: "", price: 0, img: "" },
      { path: "/products/the-azure-filigree/grtq14", name: "The Azure Filigree", _id: "", price: 0, img: "" },
    ],
  },
  {
    title: "Designer gemstone pendants",
    viewAll: "/pendants",
    items: [
      { path: "/products/the-sovereign-majestic-red-coral-double-frame-halo-pendant/grrc-p6", name: "The Sovereign Majestic Red Coral Halo Pendant", _id: "", price: 0, img: "" },
      { path: "/products/the-celestial-sovereign-white-sapphire-sunburst-pendant/grws-p3-g", name: "The Celestial Sovereign White Sapphire Sunburst Pendant", _id: "", price: 0, img: "" },
      { path: "/products/the-celestial-halo-octagon-amethyst-pendant/gram-p6", name: "The Celestial Halo Octagon Amethyst Pendant", _id: "", price: 0, img: "" },
      { path: "/products/the-sovereign-silver-octagonal-double-frame-hessonite-gomed-pendant/grhes-p5", name: "The Sovereign Silver Octagonal Hessonite (Gomed) Pendant", _id: "", price: 0, img: "" },
      { path: "/products/the-sovereign-silver-fluted-sunburst-feroza-turquoise-pendant/grtq-p3", name: "The Sovereign Silver Fluted Sunburst Feroza Turquoise Pendant", _id: "", price: 0, img: "" },
      { path: "/products/the-sovereign-aureole-white-sapphire-rope-bezel-pendant/grws-p4-g", name: "The Sovereign Aureole White Sapphire Rope Bezel Pendant", _id: "", price: 0, img: "" },
    ],
  },
  {
    title: "Authentic rudraksha",
    viewAll: "https://rudraksha.gemrishi.com/",
    external: true, // items open on the rudraksha site
    items: [
      // PLACEHOLDERS: replace path with the real product URL and img with the real image
      { path: "https://rudraksha.gemrishi.com/collections/5-mukhi-rudraksha", name: "5 Mukhi Rudraksha", _id: "", price: 0, img: "/offers-assets/rudraksha1.webp" },
      { path: "https://rudraksha.gemrishi.com/collections/7-mukhi-rudraksha", name: "7 Mukhi Rudraksha", _id: "", price: 0, img: "/offers-assets/rudraksha2.webp" },
      { path: "https://rudraksha.gemrishi.com/collections/siddha-mala", name: "Rudraksha Mala", _id: "", price: 0, img: "/offers-assets/mala.webp" },
      { path: "https://rudraksha.gemrishi.com/collections/11-mukhi", name: "11 Mukhi Rudraksha", _id: "", price: 0, img: "/offers-assets/rudraksha3.webp" },
      { path: "https://rudraksha.gemrishi.com/collections/bracelet", name: "Bracelet Rudraksha", _id: "", price: 0, img: "/offers-assets/braclate.webp" },
      { path: "https://rudraksha.gemrishi.com/products/gauri-shankar-rudraksha-nepal?_pos=1&_sid=935ce1699&_ss=r", name: "Gauri Shankar Rudraksha", _id: "", price: 0, img: "/offers-assets/rudraksha4.webp" },
    ],
  },
];

// Pulls the real product image for every featured item from the same API the product pages use
const getProductImage = (product) => {
  const first = product?.images?.[0];
  return (
    product?.image?.url ||
    (typeof product?.image === "string" ? product.image : null) ||
    first?.url ||
    (typeof first === "string" ? first : null) ||
    null
  );
};

const useFeaturedImages = (rows) => {
  const [images, setImages] = useState({});
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let alive = true;
    const base = import.meta.env.VITE_URL;
    // Skip external (rudraksha) items and items that already have an image
    const items = rows
      .flatMap((r) => r.items)
      .filter((i) => !i.external && !i.img && i.path.startsWith("/products/"));
    Promise.all(
      items.map(async (item) => {
        try {
          const [, , name, sku] = item.path.split("/");
          const url = sku
            ? `${base}/product/single-product/${encodeURIComponent(name)}/${encodeURIComponent(sku)}`
            : `${base}/product/single-product/${encodeURIComponent(name)}`;
          const res = await axios.get(url);
          const product = res.data?.product || res.data?.jewelry || res.data?.data;
          return [item.path, getProductImage(product)];
        } catch {
          return [item.path, null];
        }
      })
    ).then((pairs) => {
      if (!alive) return;
      setImages(Object.fromEntries(pairs.filter(([, img]) => img)));
      setSettled(true);
    });
    return () => {
      alive = false;
    };
  }, [rows]);
  return { images, settled };
};

const GIFTS = [
  { img: "/offers-assets/gift.png", icon: Gift, title: "Free Gift Box (Worth ₹1,999)", sub: "On orders above ₹10,000", color: "from-slate-300 to-slate-600" },
  { img: "/offers-assets/rudraksha.jpg", icon: Gem, title: "Free Authentic 5 Mukhi Rudraksha", sub: "On orders above ₹10,000 + Certificate", color: "from-amber-700 to-red-900" },
  { img: "/offers-assets/certification.png", icon: Award, title: "Free Govt. Lab Certificate", sub: "On orders above ₹20,000 · IIGJ-GJEPC", color: "from-yellow-400 to-amber-600" },
  { img: "/offers-assets/pooja-priest.jpg", icon: FaHandsPraying, title: "Free Traditional Blessing Service", sub: "On orders above ₹20,000 · By Expert Priests", color: "from-orange-500 to-rose-700" },
];

const DELIVERY = [
  { icon: Gem, title: "Gold & Bespoke CAD", lines: ["First Come First Serve", "Contact Us"], result: "Delivers by festival" },
  { icon: Award, title: "Silver & Fast-Craft", lines: ["First Come First Serve", "Contact Us"], result: "Delivers by festival" },
  { icon: Tag, title: "Ready-to-Ship Loose Gems", lines: ["First Come First Serve", "Contact Us"], result: "Delivers in 2 days" },
];

const WHY = [
  { icon: Award, title: "100% Certified", result: "Natural gemstones" },
  { icon: ShieldCheck, title: "Lab Tested", result: "For authenticity" },
  { icon: FaHandsPraying, title: "Traditional Blessing Service", result: "By expert priests" },
  { icon: ShoppingBag, title: "Secure Packaging", result: "Perfect for gifting" },
  { icon: Truck, title: "Free Shipping", result: "Across India" },
];

const CUSTOM_POINTS = [
  { title: "Silver, Gold & Panchdhatu", sub: "Choose the metal that suits you" },
  { title: "Expert Craftsmanship", sub: "Made by skilled artisans" },
  { title: "Specialist Guidance", sub: "Help from gemstone experts" },
];

const REVIEWS = [
  { name: "Priya Sharma", text: "I bought a yellow sapphire ring for the festival. The quality and service were excellent." },
  { name: "Amit Verma", text: "Authentic gemstones and great guidance from the team. My order arrived well before the festival." },
  { name: "Neha Kapoor", text: "Loved the festive offers and the free gift. It made our celebrations even more special." },
];

const FAQS = [
  { q: "Are the gemstones natural and certified?", a: "Yes. Every gemstone is natural, lab tested and comes with a certificate. IIGJ-GJEPC certification is free on eligible orders." },
  { q: "How do I apply the coupon code?", a: "Copy the code from this page and apply it on the gemstone product page or in your cart before checkout." },
  { q: "Will I receive my order before the festival?", a: "Yes, if you book within the timelines shown in the delivery section. Orders placed later may be delivered after the festival." },
  { q: "Can I return a customised ring or pendant?", a: "Customised and mounted jewellery is non-returnable once crafted. Loose gemstones follow our standard return policy." },
];

const TERMS = [
  {
    title: "Offer Validity & Order Eligibility",
    points: [
      `Valid on new orders placed from 28th October 2026 until ${OFFER_VALID_TILL}.`,
      `Benefits apply on a minimum net gemstone value of ₹${OFFER.gemstone.minGemstonePrice.toLocaleString("en-IN")} (before tax and custom settings).`,
      "Gifts are added automatically at checkout once the order value qualifies.",
      "The offer cannot be applied to past orders, pending quotes, or cancelled and rebooked orders.",
    ],
  },
  ...(SHOW_FREE_RING_CONTENT
    ? [{
        title: "Complimentary Silver Ring Guidelines",
        points: [
          "Applies only to basic prong or bezel handcrafted settings.",
          "Ring value is ₹1,200, with weight calculated at the day's silver rate.",
          "Designer or CAD-based mountings are charged at standard rates.",
          "The free ring cannot be adjusted as a discount if not availed.",
        ],
      }]
    : []),
  {
    title: "Gold & Custom Metal Upgrades",
    points: [
      "The gold rate on the date of order confirmation is locked.",
      "An 80% advance is required to begin CAD design, casting and hallmarking.",
      "Design, CAD/CAM, casting and making charges apply separately.",
    ],
  },
  {
    title: "Returns, Replacement & Cancellation",
    points: [
      "Customised or mounted jewellery has no returns or refunds once crafted.",
      "Remakes are considered only for verified manufacturing defects, transit damage or stone mismatch.",
      "Loose gemstones must be returned in original, untampered packaging with certificate.",
    ],
  },
  {
    title: "Dispatch & Delivery",
    points: [
      "Festive volumes and the blessing service may add 2 to 3 business days to standard timelines.",
      "All shipments go via insured priority express logistics at no extra charge.",
    ],
  },
  {
    title: "Traditional Blessing Service & Authenticity Guarantee",
    points: [
      "A complimentary traditional blessing service by expert priests is provided on orders above ₹20,000, before dispatch.",
      "Traditional beliefs are based on cultural significance.",
      "A lifetime authenticity card certifies your gemstone is natural and exactly as described.",
    ],
  },
];

// Footer gemstone links, grouped by stone: [label, slug under /gemstone/]
const FOOTER_GEMS = [
  {
    group: "Precious Gemstones",
    items: [
      ["Emerald", "emerald"],
      ["Ruby", "ruby"],
      ["Blue Sapphire", "blue-sapphire"],
      ["Yellow Sapphire", "yellow-sapphire"],
      ["Red Coral", "red-coral"],
      ["Pearl", "pearl"],
      ["Opal", "opal"],
      ["Garnet", "garnet"],
      ["Moonstone", "moonstone"],
      ["Tourmaline", "tourmaline"],
    ],
  },
];

// Finds the site's floating Call / WhatsApp widgets (fixed-position elements outside this page) and hides them.
const FLOATING_HINTS =
  'a[href^="tel:"], a[href*="wa.me"], a[href*="whatsapp"], [aria-label*="whatsapp" i], [aria-label*="call" i], [class*="whatsapp" i], [class*="float" i]';

const hideFloatingWidgets = (rootEl, hidden) => {
  document.querySelectorAll(FLOATING_HINTS).forEach((node) => {
    if (rootEl && rootEl.contains(node)) return;
    let el = node;
    while (el && el !== document.body) {
      if (window.getComputedStyle(el).position === "fixed") {
        if (!hidden.has(el) && !(rootEl && rootEl.contains(el))) {
          hidden.set(el, el.style.getPropertyValue("display"));
          el.style.setProperty("display", "none", "important");
        }
        break;
      }
      el = el.parentElement;
    }
  });
};

// ---------------- Helpers ----------------
const trackEvent = (name, params = {}) => {
  try {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
    fbqTrackCustom(name, params);
  } catch {
    /* tracking must never break the page */
  }
};

// Internal links use the router; external links open in a new tab
const SmartLink = ({ to, external, children, ...props }) =>
  external ? (
    <a href={to} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
  ) : (
    <Link to={to} {...props}>{children}</Link>
  );

// Scroll-reveal wrapper (no extra dependency)
const Reveal = ({ children, delay = 0, className = "", as: Tag = "div" }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${shown ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-7 scale-[0.98] motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100"} ${className}`}
    >
      {children}
    </Tag>
  );
};

const useCountdown = (target) => {
  const [left, setLeft] = useState(() => Math.max(0, new Date(target).getTime() - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, new Date(target).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.floor(left / 1000);
  return {
    done: left <= 0,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
  };
};

// Fills its parent with a real image; if the file is missing, falls back to an icon tile
const CardImage = ({ src, icon: Icon = Gem, color = "from-amber-300 to-orange-600" }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-16 h-16 text-white/90 drop-shadow-lg animate-[gr-float_4s_ease-in-out_infinite] motion-reduce:animate-none" />
      </div>
    );
  }
  const isSvg = typeof src === "string" && src.endsWith(".svg");
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`w-full h-full ${isSvg ? "object-contain p-3" : "object-cover"} group-hover:scale-110 transition-transform duration-500`}
    />
  );
};

const SectionTitle = ({ children, sub, link, light = false }) => (
  <Reveal className="flex flex-col items-center text-center gap-2 mb-6 sm:mb-9 px-2">
    <span className="h-1 w-14 rounded-full bg-gradient-to-r from-[#F5B301] via-[#FF7A00] to-[#D6246E]" />
    <h2 className={`text-2xl sm:text-4xl font-serif font-normal leading-tight capitalize ${light ? "text-white" : "text-[#3A0A24]"}`}>
      {children}
    </h2>
    {sub && <p className={`text-sm sm:text-base max-w-xl ${light ? "text-amber-100/90" : "text-[#6B4A3A]"}`}>{sub}</p>}
    {link}
  </Reveal>
);

// Logo image; falls back to the text name if the file is missing
const HeaderLogo = () => {
  const [failed, setFailed] = useState(false);
  if (failed) return <span>GemRishi</span>;
  return <img src={LOGO} alt="GemRishi" onError={() => setFailed(true)} className="h-8 sm:h-10 w-auto object-contain" />;
};

// Landing-page header: logo in the centre, help number on the right, no mega menu
const LandingHeader = () => (
  <header data-offers-header className="w-full bg-white border-b border-gray-100 pl-5 pr-3 sm:pl-12 sm:pr-8 lg:pl-16 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
    <a
      href={`tel:+${WHATSAPP_NUMBER}`}
      onClick={() => trackEvent("offer_header_call")}
      aria-label={`Call ${PHONE_DISPLAY}`}
      className="justify-self-start inline-flex items-center gap-2 text-[#3A0A24] font-semibold"
    >
      <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFE08A] to-[#FF7A00] text-[#4A1200] flex items-center justify-center shadow-md shadow-orange-300/50">
        <PhoneCall className="w-4 h-4" />
      </span>
      <span className="hidden sm:block text-sm leading-tight">
        <span className="block text-[11px] text-[#6B4A3A] font-medium">Need Help?</span>
        {PHONE_DISPLAY}
      </span>
    </a>
    <Link to="/" className="justify-self-center inline-flex items-center gap-2 text-xl sm:text-2xl font-serif text-[#3A0A24]" aria-label="GemRishi home">
      <HeaderLogo />
    </Link>
    <a
      href={`https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${WHATSAPP_TEXT}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("offer_header_whatsapp")}
      aria-label="Reach out to our Experts"
      className="justify-self-end inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-bold rounded-full h-9 px-2.5 sm:px-4 transition-all"
    >
      <MessageCircle className="w-4 h-4" />
      <span className="hidden sm:inline">Reach out to our Experts</span>
    </a>
  </header>
);

// Banner slider: 3 slides, auto-advance, swipe on mobile, arrows on desktop, CTA buttons on every slide.
// Mouse users: hovering pauses, clicking the banner stops autoplay until reload.
// Touch users: autoplay keeps running; only an active finger pauses it.
const BannerSlider = () => {
  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [stopped, setStopped] = useState(false);
  const touch = useRef(null);
  const count = BANNERS.length;

  const go = (i) => setIndex((i + count) % count);

  // Real mouse devices only; phones emit fake mouse events after touch
  const canHover = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

  const stopAutoplay = () => {
    if (stopped || !canHover()) return;
    setStopped(true);
    trackEvent("offer_banner_stopped", { slide: index + 1 });
  };

  // setTimeout + [index] dependency: a manual swipe/dot click restarts the timer
  useEffect(() => {
    if (hoverPaused || touching || stopped || count < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), BANNER_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [index, hoverPaused, touching, stopped, count]);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
    setTouching(true);
  };
  const onTouchEnd = (e) => {
    const start = touch.current;
    touch.current = null;
    setTouching(false);
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
  };
  const onTouchCancel = () => {
    touch.current = null;
    setTouching(false);
  };

  return (
    <section
      className="relative w-full bg-[#3A0A24] overflow-hidden touch-pan-y"
      aria-roledescription="carousel"
      aria-label="Festive offers"
      onClick={stopAutoplay}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHoverPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHoverPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {BANNERS.map((b, i) => (
          <div key={i} className="relative min-w-full" aria-hidden={i !== index}>
            <picture>
              <source media="(max-width: 767px)" srcSet={b.mobile} />
              <img
                src={b.desktop}
                alt={b.alt}
                loading="eager"
                decoding="async"
                draggable={false}
                className="block w-full h-auto object-contain select-none"
              />
            </picture>

            {/* CTA raised on mobile so the dots never overlap it */}
            <div className="absolute inset-x-0 md:left-1/2 z-20 bottom-2 sm:bottom-3 md:bottom-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-3">
              {b.ctas.map((c, k) => (
                <SmartLink
                  key={c.label}
                  to={c.to}
                  external={c.external}
                  tabIndex={i === index ? 0 : -1}
                  onClick={() => trackEvent("offer_banner_cta", { slide: i + 1, label: c.label })}
                  className={`${
                    k === 0
                      ? `${SHIMMER_BTN} text-[#4A1200]`
                      : "bg-white/15 backdrop-blur border border-amber-200/70 text-white hover:bg-white/25"
                  } inline-flex items-center justify-center gap-1.5 sm:gap-2 min-w-[120px] sm:min-w-[160px] lg:min-w-[190px] px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap shadow-xl shadow-black/40 hover:scale-105 active:scale-95 transition-transform group ${b.ctaPos || ""}`}
                >
                  {c.label}
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </SmartLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous banner"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next banner"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* pointer-events-none so this strip never blocks the CTA; only the dots are tappable */}
          <div className="pointer-events-none absolute bottom-0.5 sm:bottom-1.5 md:bottom-3 inset-x-0 z-10 flex justify-center gap-2">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`pointer-events-auto h-1 rounded-full transition-all duration-200 ${i === index ? "w-4 bg-[#F5B301]" : "w-1 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

// Same compact rectangle card for "Guaranteed delivery" and "Why choose GemRishi"
const InfoCard = ({ icon: Icon, title, lines = [], result, delay = 0, className = "" }) => (
  <Reveal
    delay={delay}
    className={`group ${CARD} ${CARD_HOVER} px-4 py-3 flex flex-col items-center justify-center gap-2 text-center ${className}`}
  >
    <span className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-[#FFE08A] to-[#FF7A00] flex items-center justify-center text-[#4A1200] shadow-md shadow-orange-300/50 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-5 h-5" />
    </span>
    <div className="min-w-0 flex-1 text-center">
      <p className="text-sm font-normal text-[#3A0A24] leading-tight">{title}</p>
      {lines.length > 0 && <p className="text-[11px] text-[#6B4A3A] mt-0.5">{lines.join(" · ")}</p>}
      {result && (
        <span className="inline-block mt-1.5 rounded-md bg-gradient-to-r from-[#E8590C] to-[#D6246E] text-white text-[11px] font-bold px-2 py-0.5">
          {result}
        </span>
      )}
    </div>
  </Reveal>
);

const Accordion = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${CARD} overflow-hidden transition-all duration-300 ${open ? "border-[#F5B301]" : "hover:border-amber-300"}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-center gap-3 px-4 py-4 text-center text-sm sm:text-base font-semibold text-[#3A0A24] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8590C]"
      >
        <span>{title}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-[#E8590C] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 text-sm text-[#6B4A3A] text-center leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

// A whole group (FAQs / Terms) that opens and closes when its header is tapped
const AccordionSet = ({ icon: Icon, title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${CARD} overflow-hidden transition-all duration-300 ${open ? "border-[#F5B301]" : "hover:border-amber-300"}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-center gap-3 px-4 sm:px-5 py-4 text-center bg-gradient-to-r from-[#3A0A24] via-[#7A0C2E] to-[#B8400A] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5B301]"
      >
        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFE08A] to-[#FF7A00] text-[#4A1200] flex items-center justify-center shrink-0 shadow-md shadow-black/30">
          <Icon className="w-5 h-5" />
        </span>
        <span className="text-center">
          <span className="block text-base sm:text-lg font-serif font-normal leading-tight capitalize">{title}</span>
          <span className="block text-xs text-amber-100/80 mt-0.5">{open ? "Tap to close" : "Tap to open"}</span>
        </span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-[#FFE08A] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="p-3 sm:p-4 space-y-3 bg-white">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Compact rectangle coupon card: details on top, code strip below
const CouponCard = ({ badge, icon: Icon, title, subtitle, description, code, footerLabel, footerValue, linkTo, linkText, copiedCode, onCopy }) => (
  <div className="group h-full relative rounded-2xl p-[2px] bg-gradient-to-br from-[#F5B301] via-[#FF7A00] to-[#D6246E] bg-[length:200%_200%] animate-[gr-flow_6s_linear_infinite] motion-reduce:animate-none shadow-lg shadow-orange-900/10">
    <div className="bg-white rounded-[14px] relative overflow-hidden h-full flex flex-col">
      <span className="absolute top-0 right-0 bg-gradient-to-l from-[#D6246E] to-[#FF7A00] text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
        {badge}
      </span>

      <div className="flex-1 flex flex-col items-center gap-3 text-center p-4 pt-7">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 border border-amber-300 flex items-center justify-center text-[#B8400A] group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 text-center">
          <h3 className="text-base sm:text-lg font-serif font-normal text-[#3A0A24] leading-snug capitalize">{title}</h3>
          <p className="text-[11px] text-[#B8400A] font-normal mt-0.5">{subtitle}</p>
          <p className="text-xs text-[#6B4A3A] leading-relaxed mt-1.5">{description}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#3A0A24] via-[#7A0C2E] to-[#B8400A] px-4 py-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#F5B301] bg-black/20 px-3 py-1.5 animate-[gr-glow_2.2s_ease-out_infinite] motion-reduce:animate-none">
          <span className="font-mono text-base sm:text-lg font-bold tracking-wider text-[#FFE08A]">{code}</span>
          <button
            type="button"
            onClick={() => onCopy(code)}
            className="bg-[linear-gradient(110deg,#F5B301_0%,#FFE08A_25%,#F5B301_50%,#FF9F1C_75%,#F5B301_100%)] bg-[length:200%_100%] animate-[gr-shimmer_3s_linear_infinite] motion-reduce:animate-none flex items-center gap-1.5 px-3 py-1.5 hover:brightness-105 active:scale-95 text-[#4A1200] text-xs font-extrabold rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F5B301]"
          >
            {copiedCode === code ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy code</>}
          </button>
        </div>
        <div className="flex flex-col items-center justify-center text-center gap-y-1 text-[11px] text-amber-100/90">
          <p>
            {footerLabel}: <strong className="text-white">{footerValue}</strong>
          </p>
          <Link to={linkTo} className="font-bold text-[#FFE08A] hover:text-white inline-flex items-center gap-1 group/link">
            {linkText} <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const TimeBox = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="w-14 sm:w-[72px] py-2.5 rounded-xl bg-gradient-to-b from-[#FFE08A] to-[#F5B301] text-[#4A1200] shadow-lg shadow-black/30 font-serif font-bold text-2xl sm:text-3xl tabular-nums">
      {String(value).padStart(2, "0")}
    </div>
    <span className="mt-1.5 text-[10px] sm:text-xs uppercase tracking-widest text-amber-100">{label}</span>
  </div>
);

// Footer gemstone directory: collapsed by default, can be opened
const FooterGemLinks = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
      <div className="border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mx-auto flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#FFE08A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B301] rounded"
        >
          Popular gemstones
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6 text-center">
              {FOOTER_GEMS.map(({ group, items }) => (
                <div key={group}>
                  <p className="text-xs font-normal uppercase tracking-wider text-[#FFE08A] mb-2">{group}</p>
                  <ul className="space-y-1.5">
                    {items.map(([label, slug]) => (
                      <li key={slug}>
                        <Link
                          to={`/gemstone/${slug}`}
                          onClick={() => trackEvent("offer_footer_gem_link", { gem: slug })}
                          className="text-[13px] text-amber-100/90 hover:text-white transition-colors"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Timed CTA: appears ONCE, 5 seconds after load, on the LEFT side.
// Once shown (or closed), it won't come back, even if the visitor leaves and returns during the same session.
const TimedCta = ({ copiedCode, onCopy }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Already shown earlier in this session? Don't show again.
    try {
      if (sessionStorage.getItem(TIMED_CTA_KEY)) return;
    } catch {
      /* storage unavailable: fall through and show once per page load */
    }

    const t = setTimeout(() => {
      setShow(true);
      try {
        sessionStorage.setItem(TIMED_CTA_KEY, "1");
      } catch {
        /* ignore */
      }
      trackEvent("offer_timed_cta_shown");
    }, TIMED_CTA_DELAY_MS);

    return () => clearTimeout(t);
  }, []);

  if (!show) return null;
  return (
    <div
      role="dialog"
      aria-label="Festive offer"
      className="fixed z-50 left-3 right-3 bottom-20 sm:right-auto sm:left-5 sm:w-[340px] lg:bottom-6 animate-[gr-pop_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both] motion-reduce:animate-none rounded-2xl p-[2px] bg-gradient-to-br from-[#F5B301] via-[#FF7A00] to-[#D6246E] shadow-2xl shadow-black/30"
    >
      <div className="relative rounded-[14px] bg-white p-4 text-center">
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label="Close"
          className="absolute top-1.5 right-2.5 text-xl leading-none text-[#6B4A3A] hover:text-[#3A0A24]"
        >
          &times;
        </button>
        <p className="text-[11px] uppercase tracking-widest text-[#B8400A]">{FESTIVAL_NAME} special</p>
        <p className="mt-1 text-lg font-serif font-normal text-[#3A0A24] leading-snug">
          Flat 15% off natural gemstones
        </p>
        <p className="mt-1 text-xs text-[#6B4A3A]">Use code at checkout. Offer valid till {OFFER_VALID_TILL}.</p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onCopy(OFFER.gemstone.code)}
            className={`${SHIMMER_BTN} flex items-center justify-center gap-2 py-2.5 rounded-lg text-[#4A1200] text-sm font-extrabold active:scale-95 transition-transform`}
          >
            {copiedCode === OFFER.gemstone.code ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy code {OFFER.gemstone.code}</>}
          </button>
          <a
            href={`https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${WHATSAPP_TEXT}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("offer_timed_cta_expert")}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-bold transition-all"
          >
            <MessageCircle className="w-4 h-4" /> Reach out to our Experts
          </a>
        </div>
      </div>
    </div>
  );
};

// SEO: title, description, canonical, social tags and structured data for this page
const OffersSeo = () => {
  const pageUrl = `${SITE_URL}${PAGE_PATH}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: pageUrl,
    inLanguage: "en-IN",
    isPartOf: { "@type": "WebSite", name: "GemRishi", url: SITE_URL },
    mainEntity: {
      "@type": "Offer",
      name: `${FESTIVAL_NAME} Gemstone Offer: Flat 15% Off`,
      description: SEO_DESCRIPTION,
      url: pageUrl,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validThrough: OFFER_END_DATE,
      seller: { "@type": "Organization", name: "GemRishi", url: SITE_URL },
    },
  };

  return (
    <Helmet>
      <title>{SEO_TITLE}</title>
      <meta name="description" content={SEO_DESCRIPTION} />
      <meta name="keywords" content={SEO_KEYWORDS} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="GemRishi" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO_TITLE} />
      <meta property="og:description" content={SEO_DESCRIPTION} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={SEO_IMAGE} />
      <meta property="og:image:alt" content={`${FESTIVAL_NAME} gemstone offers at GemRishi`} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SEO_TITLE} />
      <meta name="twitter:description" content={SEO_DESCRIPTION} />
      <meta name="twitter:image" content={SEO_IMAGE} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

// ---------------- Page ----------------
const OffersPage = () => {
  const dispatch = useDispatch();
  const [addingId, setAddingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const countdown = useCountdown(OFFER_END_DATE);
  const { images: featuredImages, settled: featuredSettled } = useFeaturedImages(FEATURED_ROWS);

  // Hide the site header and footer while this page is open; they come back when you leave
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-offers-hide-chrome", "true");
    style.textContent = `${HIDE_ON_OFFERS}{display:none !important}`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Hide the site's floating Call / WhatsApp buttons on this page only (the header has both)
  useEffect(() => {
    const hidden = new Map();
    const run = () => hideFloatingWidgets(document.querySelector("[data-offers-root]"), hidden);
    run();
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(run);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
      hidden.forEach((prev, el) => {
        if (prev) el.style.setProperty("display", prev);
        else el.style.removeProperty("display");
      });
    };
  }, []);

  const getUserToken = () => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "{}")?.token || null;
    } catch {
      return null;
    }
  };

  const handleAddToCart = async (product) => {
    const atcEventId = `add_to_cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const payload = { itemId: product._id, quantity: 1, customization: {}, eventId: atcEventId };
    const token = getUserToken();
    try {
      setAddingId(product._id);
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await axios.post(`${import.meta.env.VITE_URL}/cart/add_item_in_cart`, payload, {
        headers,
        withCredentials: true,
      });
      dispatch(addToCartAction(payload));
      if (res.data?.success !== false) {
        fbqTrack(
          "AddToCart",
          {
            content_ids: [String(product.sku || product._id || "")],
            content_type: "product",
            content_name: product.name || "Gemstone",
            content_category: "Gemstone",
            value: Number(product.price) || 0,
            currency: "INR",
          },
          { eventID: atcEventId }
        );
        trackEvent("offer_add_to_cart", { item_id: product._id });
        toast.success("Added to cart", { position: "top-center" });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not add this item to the cart.", { position: "top-center" });
    } finally {
      setAddingId(null);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    trackEvent("offer_coupon_copy", { coupon: code });
    toast.success(`Coupon code ${code} copied`, { position: "top-center", autoClose: 2500 });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Category cards (5 per row on large screens)
  const cardWidth = "w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(20%-0.8rem)]";

  // Featured product cards: 6 in ONE row on desktop; sideways scroll on smaller screens
  const productCardWidth = "shrink-0 snap-start w-[44%] sm:w-[30%] lg:w-[calc((100%-5rem)/6)]";

  return (
    <div data-offers-root className="w-full bg-white min-h-screen text-gray-800 font-sans text-center overflow-x-hidden">
      <OffersSeo />

      {/* Keyframes only; every animation is applied with Tailwind className */}
      <style>{`
        @keyframes gr-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes gr-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes gr-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes gr-glow{0%,100%{box-shadow:0 0 0 0 rgba(245,179,1,.5)}50%{box-shadow:0 0 0 8px rgba(245,179,1,0)}}
        @keyframes gr-flow{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes gr-bg{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes gr-pop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes gr-shine{from{left:-60%}to{left:160%}}
        @keyframes gr-ring{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.7);opacity:0}}
        .gr-hide-scroll{scrollbar-width:none;-ms-overflow-style:none}
        .gr-hide-scroll::-webkit-scrollbar{display:none}
      `}</style>

      {/* Landing header (replaces the global mega menu on this page) */}
      <LandingHeader />

      {/* Banner slider with CTAs */}
      <BannerSlider />

      {/* Ticker - sits directly below the banner */}
      <section className="bg-gradient-to-r from-[#D6246E] via-[#E8590C] to-[#F5B301] text-white overflow-hidden" aria-label="Offer highlights">
        <div className="flex w-max animate-[gr-marquee_32s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none py-2.5">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap">
              <span className="mx-6">{t}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-100" aria-hidden="true" />
            </span>
          ))}
        </div>
      </section>

      {/* Hero content */}
      <section className={`relative w-full ${HERO_BG} overflow-hidden`}>
        <div className="relative max-w-3xl mx-auto px-4 py-8 sm:py-14 text-white flex flex-col items-center gap-4 sm:gap-5">
          <span className="animate-[gr-pop_0.7s_cubic-bezier(0.2,0.9,0.3,1.2)_both] motion-reduce:animate-none inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-amber-300/40 text-amber-200 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur">
            {FESTIVAL_NAME} &amp; Diwali Special
          </span>
          <h1 className="lg:text-3xl sm:text-5xl font-serif font-bold leading-tight capitalize">
            Certified natural gemstones with{" "}
            <span className="bg-gradient-to-r from-[#FFE08A] via-[#FFB703] to-[#FF7A00] bg-clip-text text-transparent">
              flat 15% off
            </span>{" "}
            this {FESTIVAL_NAME}
          </h1>
          <p className="text-sm sm:text-lg text-amber-50/90 max-w-xl">
            Lab-tested, authentic gemstones with free gifts, free insured shipping and delivery before the festival.
          </p>

          {!countdown.done && (
            <div className="mt-1" role="timer" aria-label={`Time left until the offer ends on ${OFFER_VALID_TILL}`}>
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-amber-200 mb-3">Offer ends in</p>
              <div className="flex items-start justify-center gap-2.5 sm:gap-4">
                <TimeBox value={countdown.days} label="Days" />
                <TimeBox value={countdown.hours} label="Hours" />
                <TimeBox value={countdown.mins} label="Mins" />
                <TimeBox value={countdown.secs} label="Secs" />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mt-2">
            <Link
              to="/gemstone"
              onClick={() => trackEvent("offer_cta_shop")}
              className={`${SHIMMER_BTN} w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[#4A1200] text-sm font-extrabold shadow-xl shadow-orange-900/40 hover:scale-105 active:scale-95 transition-transform group`}
            >
              Shop gemstones <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={`https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${WHATSAPP_TEXT}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("offer_cta_whatsapp")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-amber-200/60 hover:bg-white/15 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" /> Talk to an expert
            </a>
          </div>
        </div>

        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B301] via-[#FF7A00] to-[#D6246E]" />
      </section>

      {/* Benefits strip */}
      <section className="bg-gradient-to-b from-[#3A0A24] to-[#2A0618] text-white">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
          {BENEFITS.map(({ icon: Icon, title, sub }, i) => {
            const isLastOdd = BENEFITS.length % 2 === 1 && i === BENEFITS.length - 1;
            return (
              <Reveal
                key={title}
                delay={i * 80}
                className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/[0.07] border border-white/10 shadow-lg shadow-black/40 backdrop-blur-sm px-2.5 py-2.5 sm:px-3 sm:py-3 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center min-w-0 sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(20%-0.8rem)] hover:-translate-y-1 hover:bg-white/[0.12] hover:border-[#F5B301]/60 hover:shadow-xl hover:shadow-black/50 transition-all duration-300 ${isLastOdd ? "col-span-2 justify-center sm:col-span-1 sm:justify-start" : ""}`}
              >
                <span className="pointer-events-none absolute top-0 -left-[60%] h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:animate-[gr-shine_0.9s_ease-out]" aria-hidden="true" />
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#F5B301] via-[#FF7A00] to-[#D6246E]" aria-hidden="true" />
                <span className="relative w-9 h-9 sm:w-11 sm:h-11 shrink-0">
                  <span className="absolute inset-0 rounded-full bg-[#FFE08A]/50 animate-[gr-ring_2.4s_ease-out_infinite] motion-reduce:animate-none" aria-hidden="true" />
                  <span className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#FFE08A] to-[#FF7A00] text-[#4A1200] flex items-center justify-center shadow-md shadow-orange-900/50 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                </span>
                <div className="min-w-0 text-center">
                  <p className="text-[13px] sm:text-base font-normal leading-tight">{title}</p>
                  <p className="text-[11px] sm:text-[13px] text-white/85 leading-snug mt-0.5">{sub}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 1. Shop by category */}
      <section className={SECTION}>
        <SectionTitle>Shop by category</SectionTitle>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {CATEGORIES.map((c, i) => {
            const inner = (
              <>
                <div className="relative h-24 sm:h-28 lg:h-32 bg-white overflow-hidden">
                  <CardImage src={c.img} icon={c.icon} color={c.color} />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" aria-hidden="true" />
                  <span className="pointer-events-none absolute top-0 -left-[60%] h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:animate-[gr-shine_0.8s_ease-out]" aria-hidden="true" />
                </div>
                <div className="px-3 py-2.5 flex flex-col items-center text-center border-t border-gray-100">
                  <p className="text-sm font-normal text-[#3A0A24] leading-tight">{c.name}</p>
                  <p className="text-[11px] text-[#8A6A58] leading-tight mt-0.5">{c.sub}</p>
                  <span className="mt-2 inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-gradient-to-r from-[#E8590C] to-[#D6246E] group-hover:from-[#D6246E] group-hover:to-[#E8590C] text-white text-xs font-bold shadow-md shadow-orange-900/20 transition-all duration-300">
                    Shop now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </span>
                </div>
              </>
            );
            const cls = `group ${CARD} ${CARD_HOVER} overflow-hidden block hover:border-[#FF9F1C]`;
            return (
              <Reveal key={c.name} delay={i * 80} className={cardWidth}>
                {c.external ? (
                  <a href={c.to} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                ) : (
                  <Link to={c.to} className={cls}>{inner}</Link>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 2. Coupons */}
      <section className={SECTION}>
        <SectionTitle sub="Copy a code and apply it at checkout.">Festive coupon codes</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Reveal className="w-full">
            <CouponCard
              badge="Gemstone offer"
              icon={Tag}
              title={`Flat ${OFFER.gemstone.discountPercent}% discount`}
              subtitle="On all natural certified gemstones"
              description={`Applies to natural, certified gemstones. Apply coupon ${OFFER.gemstone.code} on any gemstone product page.`}
              code={OFFER.gemstone.code}
              footerLabel="Min. gemstone value"
              footerValue={OFFER.gemstone.minGemstonePrice > 0 ? `₹${OFFER.gemstone.minGemstonePrice.toLocaleString("en-IN")}` : "No Minimum"}
              linkTo="/gemstone"
              linkText="Shop gemstones"
              copiedCode={copiedCode}
              onCopy={handleCopy}
            />
          </Reveal>
          <Reveal className="w-full" delay={120}>
            <CouponCard
              badge="Silver Ring offer"
              icon={Gem}
              title={`₹${OFFER.silverRing.discountAmount.toLocaleString("en-IN")} OFF on Silver Ring`}
              subtitle={`Coupon ${OFFER.silverRing.code}`}
              description={`Get ₹${OFFER.silverRing.discountAmount.toLocaleString("en-IN")} OFF on your silver ring for orders of ₹${OFFER.silverRing.minBagTotal.toLocaleString("en-IN")} and above.`}
              code={OFFER.silverRing.code}
              footerLabel="Min. cart value"
              footerValue={`₹${OFFER.silverRing.minBagTotal.toLocaleString("en-IN")}`}
              linkTo="/shopping/cart"
              linkText="Go to cart"
              copiedCode={copiedCode}
              onCopy={handleCopy}
            />
          </Reveal>
          <Reveal className="w-full" delay={240}>
            <CouponCard
              badge="Free gift offer"
              icon={Gift}
              title={`${OFFER.bag.giftName} (worth ₹${OFFER.bag.giftValue.toLocaleString("en-IN")})`}
              subtitle={`Coupon ${OFFER.bag.code}`}
              description={`${OFFER.bag.giftDescription} Added automatically on orders of ₹${OFFER.bag.minBagTotal.toLocaleString("en-IN")} and above.`}
              code={OFFER.bag.code}
              footerLabel="Min. cart value"
              footerValue={`₹${OFFER.bag.minBagTotal.toLocaleString("en-IN")}`}
              linkTo="/shopping/cart"
              linkText="Go to cart"
              copiedCode={copiedCode}
              onCopy={handleCopy}
            />
          </Reveal>
        </div>
      </section>

      {/* 3. Featured products: 6 per row, single row each */}
      <section className={SECTION}>
        <SectionTitle>{FESTIVAL_NAME} featured collection</SectionTitle>
        <div className="space-y-10 sm:space-y-14">
          {FEATURED_ROWS.map((row) => (
            <div key={row.title}>
              <Reveal className="flex justify-center text-center mb-4 px-1">
                <h3 className="text-lg sm:text-2xl font-serif font-normal text-[#3A0A24] capitalize">{row.title}</h3>
              </Reveal>

              {/* Single row: 6 cards on desktop, swipe/scroll on smaller screens */}
              <div className="gr-hide-scroll flex flex-nowrap gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-3 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                {row.items.map((p, i) => {
                  const adding = addingId === p._id;
                  const imgSrc = p.img || featuredImages[p.path];
                  return (
                    <Reveal
                      key={`${row.title}-${i}`}
                      delay={(i % 6) * 70}
                      className={`group ${CARD} ${CARD_HOVER} overflow-hidden flex flex-col min-w-0 ${productCardWidth}`}
                    >
                      <SmartLink to={p.path} external={row.external} className="block h-32 sm:h-36 bg-white p-2 overflow-hidden">
                        {imgSrc || featuredSettled || row.external ? (
                          <img
                            src={imgSrc || "/ring.png"}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full rounded-lg bg-gray-100 animate-pulse" aria-hidden="true" />
                        )}
                      </SmartLink>
                      <div className="p-3 flex flex-col flex-1 items-center text-center border-t border-gray-100">
                        <p className="text-sm font-normal text-[#3A0A24] leading-snug line-clamp-2 min-h-[2.5rem]">{p.name}</p>
                        {p.price > 0 && (
                          <p className="mt-1 text-base font-normal text-[#B8400A]">₹{p.price.toLocaleString("en-IN")}</p>
                        )}
                        {p._id && !row.external ? (
                          <button type="button" onClick={() => handleAddToCart(p)} disabled={adding} className="mt-auto pt-2 w-full">
                            <span className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-gradient-to-r from-[#E8590C] to-[#D6246E] group-hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-md shadow-orange-900/20 transition-all">
                              <ShoppingBag className="w-3.5 h-3.5" /> {adding ? "Adding..." : "Add to cart"}
                            </span>
                          </button>
                        ) : (
                          <SmartLink to={p.path} external={row.external} className="mt-auto pt-2 w-full">
                            <span className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-gradient-to-r from-[#E8590C] to-[#D6246E] group-hover:brightness-110 text-white text-xs font-bold shadow-md shadow-orange-900/20 transition-all">
                              View details <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </SmartLink>
                        )}
                      </div>
                    </Reveal>
                  );
                })}
              </div>

              {/* View all: below the products */}
              <Reveal className="flex justify-center mt-5">
                <SmartLink
                  to={row.viewAll}
                  external={row.external}
                  onClick={() => trackEvent("offer_view_all", { row: row.title })}
                  className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#E8590C] to-[#D6246E] hover:brightness-110 hover:scale-105 active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-orange-900/20 transition-all group/va"
                >
                  View all {row.title.toLowerCase()} <ArrowRight className="w-3.5 h-3.5 group-hover/va:translate-x-1 transition-transform" />
                </SmartLink>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* Gifts */}
      <section className="mt-10 sm:mt-16 relative bg-gradient-to-br from-[#3A0A24] via-[#7A0C2E] to-[#B8400A] py-10 sm:py-14 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#F5B301]/20 blur-3xl animate-[gr-float_4s_ease-in-out_infinite] motion-reduce:animate-none" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[#D6246E]/30 blur-3xl animate-[gr-float_4s_ease-in-out_infinite] motion-reduce:animate-none" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <SectionTitle
            light
            sub={`Receive special festive gifts with your order. Valid till ${OFFER_VALID_TILL}. All gifts auto-added at checkout.`}
          >
            Free gifts with your order
          </SectionTitle>

          <p className="text-xs sm:text-sm font-normal text-[#FFE08A] mb-4">
            Gift Unlock: Above ₹10k = 2 Gifts, Above ₹20k = All 4 Gifts
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {GIFTS.map((g, i) => (
              <Reveal
                key={g.title}
                delay={i * 90}
                className={`group ${CARD} ${CARD_HOVER} overflow-hidden shadow-black/30`}
              >
                <div className="h-28 sm:h-40 overflow-hidden bg-white w-full">
                  <CardImage src={g.img} icon={g.icon} color={g.color} />
                </div>
                <div className="p-3 border-t border-gray-100">
                  <p className="text-sm font-normal text-[#3A0A24] leading-snug">{g.title}</p>
                  <p className="text-xs text-black font-medium mt-1">{g.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Link
            to="/collections/certified-gemstones"
            onClick={() => trackEvent("offer_cta_gifts_shop")}
            className={`${SHIMMER_BTN} inline-flex items-center justify-center gap-2 mt-7 px-6 sm:px-8 py-3.5 rounded-xl text-[#4A1200] text-sm font-extrabold shadow-xl shadow-black/30 hover:scale-105 active:scale-95 transition-transform group`}
          >
            Shop Dhanteras Eligible Gemstones <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="mt-4 text-[11px] text-gray-300 max-w-xl mx-auto">
            *T&amp;C apply. Gifts auto-added at checkout. Offer valid till {OFFER_VALID_TILL}. Traditional beliefs based on cultural significance.
          </p>

          <div className="mt-3 inline-flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] font-semibold text-amber-100">
            <span>Lab Certified</span><span aria-hidden="true">|</span>
            <span>Free Shipping</span><span aria-hidden="true">|</span>
            <span>10 Day Return</span>
          </div>
        </div>
      </section>

      {/* Custom jewellery */}
      <section className={SECTION}>
        <Reveal className={`${CARD} overflow-hidden`}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="group h-40 sm:h-56 lg:h-64 overflow-hidden bg-white">
              <CardImage src="/offers-assets/custom.png" icon={Gem} color="from-fuchsia-400 to-rose-600" />
            </div>
            <div className="group h-40 sm:h-56 lg:h-64 overflow-hidden bg-white">
              <CardImage src="/offers-assets/custom1.png" icon={Gem} color="from-fuchsia-400 to-rose-600" />
            </div>
          </div>
          <div className="px-5 sm:px-10 py-7 sm:py-10 flex flex-col items-center text-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#3A0A24] capitalize">Customise your {FESTIVAL_NAME} jewellery</h2>
            <p className="text-sm sm:text-base text-[#5A3322] max-w-xl">
              Create a ring or pendant with your chosen gemstone in silver, gold or Panchdhatu, for personal wear or gifting.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-3">
              {CUSTOM_POINTS.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl bg-white border border-gray-100 shadow-md shadow-orange-900/10 px-4 py-4 flex flex-col items-center justify-center text-center"
                >
                  <p className="text-sm font-normal text-[#3A0A24]">{p.title}</p>
                  <p className="text-xs text-[#6B4A3A] mt-1">{p.sub}</p>
                </div>
              ))}
            </div>
            <Link
              to="/jewellery"
              onClick={() => trackEvent("offer_cta_custom_jewellery")}
              className="inline-flex items-center justify-center gap-2 mt-3 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#7A0C2E] to-[#D6246E] hover:brightness-110 hover:scale-105 active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-900/30 transition-all group"
            >
              Customise jewellery <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Delivery */}
      <section className={SECTION}>
        <SectionTitle sub={`Book within these timelines to receive your order on or before ${FESTIVAL_NAME}.`}>
          Guaranteed {FESTIVAL_NAME} delivery
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {DELIVERY.map(({ icon, title, lines, result }, i) => (
            <InfoCard key={title} icon={icon} title={title} lines={lines} result={result} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* Why choose */}
      <section className={SECTION}>
        <SectionTitle>Why choose GemRishi</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {WHY.map(({ icon, title, result }, i) => (
            <InfoCard key={title} icon={icon} title={title} result={result} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={SECTION}>
        <SectionTitle>What our customers say</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 110} className="h-full">
              <figure className={`h-full ${CARD} ${CARD_HOVER} p-6 flex flex-col items-center`}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8590C] to-[#D6246E] text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {r.name[0]}
                </div>
                <figcaption className="mt-2">
                  <p className="text-sm font-normal text-[#3A0A24]">{r.name}</p>
                  <div className="flex justify-center mt-0.5" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, k) => (
                      <Star key={k} className="w-4 h-4 fill-[#F5B301] text-[#F5B301]" />
                    ))}
                  </div>
                </figcaption>
                <blockquote className="text-sm text-[#6B4A3A] mt-3 italic">“{r.text}”</blockquote>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ & Terms */}
      <section className={SECTION}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start text-center">
          <Reveal>
            <AccordionSet icon={MessageCircle} title="Frequently asked questions">
              {FAQS.map((f) => (
                <Accordion key={f.q} title={f.q}>{f.a}</Accordion>
              ))}
            </AccordionSet>
          </Reveal>
          <Reveal delay={100}>
            <AccordionSet icon={ShieldCheck} title="Terms & conditions">
              {TERMS.map((t, i) => (
                <Accordion key={t.title} title={`${i + 1}. ${t.title}`}>
                  <ul className="list-disc list-inside space-y-1.5">
                    {t.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </Accordion>
              ))}
            </AccordionSet>
          </Reveal>
        </div>
      </section>

      {/* Help CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 sm:mt-16 pb-10 sm:pb-16">
        <Reveal className={`relative overflow-hidden ${HERO_BG} rounded-2xl p-7 sm:p-12 text-white flex flex-col items-center justify-center text-center gap-5 shadow-xl shadow-rose-900/30`}>
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl font-serif font-normal mb-2 capitalize">Questions about the festive offer?</h3>
            <p className="text-amber-100 text-sm sm:text-base max-w-lg mx-auto">
              Our gem experts can help you choose a gemstone, arrange the traditional blessing service and confirm your ring size.
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <a
              href={`https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${WHATSAPP_TEXT}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("offer_help_whatsapp")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 hover:scale-105 active:scale-95 text-white font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg shadow-black/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp us
            </a>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              onClick={() => trackEvent("offer_help_call")}
              className={`${SHIMMER_BTN} w-full sm:w-auto flex items-center justify-center gap-2 text-[#4A1200] font-extrabold px-7 py-3.5 rounded-xl text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-transform`}
            >
              <PhoneCall className="w-4 h-4" /> Reach To Our Expert
            </a>
          </div>
        </Reveal>
      </section>

      {/* Footer (matches the page theme; the site footer is hidden on this page) */}
      <footer data-offers-footer className="bg-gradient-to-br from-[#3A0A24] via-[#7A0C2E] to-[#B8400A] text-white pb-20 lg:pb-0">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B301] via-[#FF7A00] to-[#D6246E]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl font-serif font-normal text-[#FFE08A]">GemRishi</p>
            <p className="text-sm text-amber-100/90 max-w-xs">
              Certified natural gemstones, lab tested and authentic, delivered across India.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-normal uppercase tracking-widest text-[#FFE08A]">Quick links</p>
            <Link to="/gemstone" className="text-sm text-amber-100/90 hover:text-white transition-colors">Gemstones</Link>
            <Link to="/jewelry-list" className="text-sm text-amber-100/90 hover:text-white transition-colors">Jewellery</Link>
            <Link to="/jewellery" className="text-sm text-amber-100/90 hover:text-white transition-colors">Customise jewellery</Link>
            <a href="https://rudraksha.gemrishi.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-amber-100/90 hover:text-white transition-colors">Rudraksha</a>
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-normal uppercase tracking-widest text-[#FFE08A]">Need help?</p>
            <a
              href={`https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${WHATSAPP_TEXT}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("offer_footer_whatsapp")}
              className="w-full max-w-[220px] flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-lg shadow-black/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp us
            </a>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              onClick={() => trackEvent("offer_footer_call")}
              className="w-full max-w-[220px] flex items-center justify-center gap-2 border border-amber-200/60 hover:bg-white/15 active:scale-95 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all"
            >
              <PhoneCall className="w-4 h-4" /> Call an expert
            </a>
          </div>
        </div>
        <FooterGemLinks />
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-amber-100/80">
          &copy; {new Date().getFullYear()} GemRishi. All rights reserved.
        </div>
      </footer>

      <TimedCta copiedCode={copiedCode} onCopy={handleCopy} />

      {/* Sticky mobile action bar */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-3 py-2.5 flex items-center gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
      >
        <Link
          to="/gemstone"
          onClick={() => trackEvent("offer_sticky_shop")}
          className={`${SHIMMER_BTN} flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[#4A1200] text-sm font-extrabold`}
        >
          <ShoppingBag className="w-4 h-4" /> Shop offers
        </Link>
        <a
          href={`https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${WHATSAPP_TEXT}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("offer_sticky_whatsapp")}
          aria-label="Chat on WhatsApp"
          className="w-12 h-12 flex items-center justify-center rounded-lg bg-emerald-500 text-white"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default OffersPage;