import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Ruler, 
  CheckCircle2, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Filter, 
  RefreshCw,
  PhoneCall,
  Info,
  Quote,
  ArrowRight
} from "lucide-react";

import TrustBadges from "../components/trust";

// Stone / Asset Images
import emeraldStone from "../assets/Stone/Emerald.svg";
import yellowSapphireStone from "../assets/Stone/YellowSapphire.svg";
import blueSapphireStone from "../assets/Stone/BlueSapphire.svg";
import rubyStone from "../assets/Stone/Ruby.svg";
import coralStone from "../assets/Stone/Coral.svg";
import pearlStone from "../assets/Stone/Pearl.svg";
import hessoniteStone from "../assets/Stone/Hessonite.svg";
import catsEyeStone from "../assets/Stone/catsEye.svg";
import diamondStone from "../assets/Stone/Diamond.svg";

// 12 Authentic GemRishi Ring Categories from Database
const RING_COLLECTIONS = [
  {
    id: "emerald",
    name: "Emerald Rings",
    hindiName: "Panna Ring",
    planet: "Mercury (Budh)",
    stone: "Emerald",
    image: "/uploads/subCategoryImg-1784113852237-906793657.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784113852237-906793657.webp",
    vector: emeraldStone,
    color: "#059669",
    slug: "emerald-rings"
  },
  {
    id: "yellow-sapphire",
    name: "Yellow Sapphire Rings",
    hindiName: "Pukhraj Ring",
    planet: "Jupiter (Brihaspati)",
    stone: "Yellow Sapphire",
    image: "/uploads/subCategoryImg-1784113867320-663376616.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784113867320-663376616.webp",
    vector: yellowSapphireStone,
    color: "#D97706",
    slug: "yellow-sapphire-rings"
  },
  {
    id: "blue-sapphire",
    name: "Blue Sapphire Rings",
    hindiName: "Neelam Ring",
    planet: "Saturn (Shani)",
    stone: "Blue Sapphire",
    image: "/uploads/subCategoryImg-1784113887256-25721453.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784113887256-25721453.webp",
    vector: blueSapphireStone,
    color: "#2563EB",
    slug: "blue-sapphire-rings"
  },
  {
    id: "ruby",
    name: "Ruby Rings",
    hindiName: "Manik Ring",
    planet: "Sun (Surya)",
    stone: "Ruby",
    image: "/uploads/subCategoryImg-1784113912210-999703630.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784113912210-999703630.webp",
    vector: rubyStone,
    color: "#DC2626",
    slug: "ruby-rings"
  },
  {
    id: "pearl",
    name: "Pearl Rings",
    hindiName: "Moti Ring",
    planet: "Moon (Chandra)",
    stone: "Pearl",
    image: "/uploads/subCategoryImg-1784113930874-49732152.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784113930874-49732152.webp",
    vector: pearlStone,
    color: "#64748B",
    slug: "pearl-rings"
  },
  {
    id: "white-sapphire",
    name: "White Sapphire Rings",
    hindiName: "Safed Pukhraj Ring",
    planet: "Venus (Shukra)",
    stone: "White Sapphire",
    image: "/uploads/subCategoryImg-1784113951120-893624741.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784113951120-893624741.webp",
    vector: diamondStone,
    color: "#475569",
    slug: "white-sapphire-rings"
  },
  {
    id: "red-coral",
    name: "Red Coral Rings",
    hindiName: "Moonga Ring",
    planet: "Mars (Mangal)",
    stone: "Red Coral",
    image: "/uploads/subCategoryImg-1784113973088-6639378.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784113973088-6639378.webp",
    vector: coralStone,
    color: "#EA580C",
    slug: "red-coral-rings"
  },
  {
    id: "cats-eye",
    name: "Cats Eye Rings",
    hindiName: "Lehsuniya Ring",
    planet: "Ketu",
    stone: "Cats Eye",
    image: "/uploads/subCategoryImg-1784113993914-206345424.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784113993914-206345424.webp",
    vector: catsEyeStone,
    color: "#CA8A04",
    slug: "cats-eye-ring-"
  },
  {
    id: "firoza",
    name: "Firoza Rings",
    hindiName: "Turquoise Ring",
    planet: "Jupiter & Mercury",
    stone: "Firoza",
    image: "/uploads/subCategoryImg-1784114008710-920256682.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784114008710-920256682.webp",
    vector: blueSapphireStone,
    color: "#06B6D4",
    slug: "firoza-rings-"
  },
  {
    id: "hessonite",
    name: "Hessonite Rings",
    hindiName: "Gomed Ring",
    planet: "Rahu",
    stone: "Hessonite",
    image: "/uploads/subCategoryImg-1784114024103-193320797.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784114024103-193320797.webp",
    vector: hessoniteStone,
    color: "#B45309",
    slug: "hessonite-rings-"
  },
  {
    id: "amethyst",
    name: "Amethyst Rings",
    hindiName: "Jamunia Ring",
    planet: "Saturn (Shani Sub)",
    stone: "Amethyst",
    image: "/uploads/subCategoryImg-1784114039854-911208168.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784114039854-911208168.webp",
    vector: blueSapphireStone,
    color: "#7E22CE",
    slug: "amethyst-ring"
  },
  {
    id: "opal",
    name: "Opal Rings",
    hindiName: "Doodhiya Ring",
    planet: "Venus (Shukra)",
    stone: "Opal",
    image: "/uploads/subCategoryImg-1784114083607-324046376.webp",
    fallbackUrl: "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784114083607-324046376.webp",
    vector: diamondStone,
    color: "#0284C7",
    slug: "opal-rings"
  }
];

// Client Testimonials matching GemRishi handcrafted rings feedback (8 authentic reviews)
const CLIENT_TESTIMONIALS = [
  {
    id: 1,
    name: "Rakesh Naik",
    location: "Mumbai",
    rating: 5,
    ring: "Yellow Sapphire (Pukhraj) Ring",
    text: "I am beyond satisfied with my Yellow Sapphire ring! The astrological open-back setting allows direct skin contact as recommended by my Pandit ji. Certified authentic by IIGJ and delivered securely.",
    date: "Verified Buyer"
  },
  {
    id: 2,
    name: "Jinu Raj",
    location: "Bengaluru",
    rating: 5,
    ring: "Emerald (Panna) Gold Ring",
    text: "I was searching for an authentic Zambian emerald ring online. GemRishi offered stunning craftsmanship in 18k hallmarked gold. The finish, clarity, and energized prana pratishtha gave me immense peace of mind.",
    date: "Verified Buyer"
  },
  {
    id: 3,
    name: "Upasna Sharma",
    location: "Delhi NCR",
    rating: 5,
    ring: "Italian Red Coral Panchdhatu Ring",
    text: "Bought an Italian Red Coral ring in Panchdhatu. I was initially skeptical about ordering customized jewelry online, but their team verified my ring size and delivered on time. Highly recommended!",
    date: "Verified Buyer"
  },
  {
    id: 4,
    name: "Diksha Choudhary",
    location: "Jaipur",
    rating: 5,
    ring: "Burma Ruby Engagement Ring",
    text: "GemRishi provided the perfect pigeon blood ruby for my customized ring. From Vedic consultation to design and hallmarking, their service was simply outstanding.",
    date: "Verified Buyer"
  },
  {
    id: 5,
    name: "Amitav Sen",
    location: "Kolkata",
    rating: 5,
    ring: "Blue Sapphire (Neelam) Silver Ring",
    text: "Ordered a certified Ceylon Blue Sapphire ring. The clarity and deep cornflower blue hue are breathtaking. My astrologer confirmed the energy alignment immediately.",
    date: "Verified Buyer"
  },
  {
    id: 6,
    name: "Pooja Malhotra",
    location: "Chandigarh",
    rating: 5,
    ring: "South Sea Pearl (Moti) Ring",
    text: "Exquisite South Sea Pearl set in hallmarked sterling silver. The luster is flawless and wearing it brought a noticeable sense of calm and mental clarity.",
    date: "Verified Buyer"
  },
  {
    id: 7,
    name: "Vikramaditya Rathore",
    location: "Ahmedabad",
    rating: 5,
    ring: "Hessonite (Gomed) Ring",
    text: "The honey-colored hessonite ring crafted in sacred Panchdhatu exceeded my expectations. Lab certified and authenticated with complete transparency.",
    date: "Verified Buyer"
  },
  {
    id: 8,
    name: "Sneha Kulkarni",
    location: "Pune",
    rating: 5,
    ring: "Australian Opal Ring",
    text: "The rainbow fire in this opal ring is mesmerizing! Every detail from custom sizing to the smooth open-back finish was handled with supreme perfection.",
    date: "Verified Buyer"
  }
];

const GemstoneRings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active Information Tab (About, Types, Designs, Settings & Metals, FAQs) - Default closed/hidden
  const [activeTab, setActiveTab] = useState(null);

  // Filter States for Live Ring Catalog
  const [selectedGemstone, setSelectedGemstone] = useState("all");
  const [selectedMetal, setSelectedMetal] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);

  // Testimonials Continuous Auto-Scroller State (Exactly like Home Page GemstoneReviews)
  const testimonialScrollRef = useRef(null);
  const [isTestimonialInteracting, setIsTestimonialInteracting] = useState(false);
  const testimonialTimeoutRef = useRef(null);

  // Smart continuous auto-scroll using requestAnimationFrame
  useEffect(() => {
    const el = testimonialScrollRef.current;
    if (!el) return;

    let animationId;
    const speed = 0.8; // Smooth elegant continuous speed

    const scroll = () => {
      if (!isTestimonialInteracting) {
        el.scrollLeft += speed;
      }

      // Infinite loop math: when scroll reaches halfway of the repeated sets, seamlessly reset
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft -= el.scrollWidth / 2;
      } else if (el.scrollLeft <= 0 && isTestimonialInteracting) {
        el.scrollLeft += el.scrollWidth / 2;
      }

      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isTestimonialInteracting]);

  const handleTestimonialTouchStart = () => {
    clearTimeout(testimonialTimeoutRef.current);
    setIsTestimonialInteracting(true);
  };

  const handleTestimonialTouchEnd = () => {
    testimonialTimeoutRef.current = setTimeout(() => {
      setIsTestimonialInteracting(false);
    }, 1000);
  };

  const handleTestimonialMouseEnter = () => {
    clearTimeout(testimonialTimeoutRef.current);
    setIsTestimonialInteracting(true);
  };

  const handleTestimonialMouseLeave = () => {
    setIsTestimonialInteracting(false);
  };

  const scrollTestimonials = (direction) => {
    if (!testimonialScrollRef.current) return;
    const offset = direction === "left" ? -360 : 360;
    testimonialScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Sync with URL query parameters if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gemParam = params.get("gemstone");
    const metalParam = params.get("metal");
    if (gemParam) setSelectedGemstone(gemParam);
    if (metalParam) setSelectedMetal(metalParam);
  }, [location.search]);

  const activeCollection = useMemo(() => {
    return RING_COLLECTIONS.find((c) => c.id === selectedGemstone) || null;
  }, [selectedGemstone]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-gray-900">
      {/* 1. SEO & Metadata */}
      <Helmet>
        <title>Buy Natural Gemstone Rings for Women-Men at Best Price in India | GemRishi</title>
        <meta
          name="description"
          content="Shop an exclusive collection of certified gemstone rings at GemRishi. Order your favorite gemstone rings mounted in gold, silver, and panchdhatu. 100% natural, lab-certified astrological rings."
        />
        <meta
          name="keywords"
          content="Gemstone Rings, Buy Gemstone rings, Online Gemstone rings, Gemstone Engagement rings, Men Gemstone Rings, Gemstone rings for women, Certified Gemstones rings, Gemstones rings price, Panna ring, Pukhraj ring, Neelam ring, Manik ring"
        />
        <meta property="og:title" content="Buy Natural Gemstone Rings for Women-Men at Best Price in India | GemRishi" />
        <meta property="og:description" content="Shop an exclusive collection of certified gemstone rings at GemRishi. Handcrafted in Gold, Silver and Panchdhatu with Vedic energization." />
        <meta property="og:url" content="https://gemrishi.com/rings" />
        <meta property="og:image" content="/RingPAgeBanner.webp" />
      </Helmet>

      {/* 1.5 Full Width Hero Banner - Directly below Navbar */}
      <div className="w-full overflow-hidden border-b border-gray-200 bg-[#0e2a1e]">
        <img
          src="/RingPAgeBanner.webp"
          alt="Gemstone Rings At GemRishi"
          className="w-full h-[200px] sm:h-[280px] md:h-[450px] lg:h-[450px] object-fill object-center block"
          // width="1913"
          // height="822"
          fetchPriority="high"
          loading="eager"
        />
      </div>


      {/* 3. Hero & Page Header Section - Full width with balanced margins */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F2EB]/80 via-white to-[#FAF9F5] pt-6 pb-6 sm:pt-8 sm:pb-7">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
            {activeCollection ? activeCollection.name : "Gemstone Rings"}
          </h1>

          <p className="text-gray-700 text-base sm:text-lg leading-relaxed text-justify">
            {activeCollection ? (
              <>
                Explore handcrafted <strong className="text-[#264A3F]">{activeCollection.name}</strong> ({activeCollection.hindiName}), spiritually energized for {activeCollection.planet}. Each certified ring is masterfully cast in hallmarked Gold, Silver, or sacred Panchdhatu with an open-back setting for maximum astrological aura and direct skin contact.
              </>
            ) : (
              <>
                <strong className="text-[#264A3F]">Gemstone rings</strong> are more than just exquisite pieces of luxury jewelry—they carry rich histories, deep Vedic symbolism, and boundless spiritual beauty. Whether you are searching for an astrological talisman to balance your horoscope, an engagement ring, or a personal statement piece, understanding the sacred science of gemstone rings enables you to appreciate their craftsmanship and planetary resonance.
              </>
            )}
          </p>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-justify">
            Adorn your hand with a <strong>precious gemstone ring from GemRishi</strong> and let its radiant planetary energy harmonize your destiny. Each ring is custom-cast with an authentic <span className="font-semibold text-gray-900">open-back setting</span> for direct skin touch (<em>Kiran Sparsh</em>) and ritualistically energized with planetary Vedic mantras.
          </p>
        </div>
      </section>

      {/* 4. Interactive Knowledge Links (Normal Editorial Text: About, Types, Designs, Settings & Metals, FAQs) */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 pt-5 pb-2">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-6 pb-2">
            {/* Clean Normal Text Navigation Links */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-9 overflow-x-auto scrollbar-none py-1">
              {[
                { id: "about", label: "About" },
                { id: "types", label: "Types" },
                { id: "designs", label: "Designs" },
                { id: "metals", label: "Settings & Metals" },
                { id: "faqs", label: "FAQs" },
              ].map((tab) => {
                const isOpen = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(isOpen ? null : tab.id)}
                    className={`group text-sm sm:text-base font-medium tracking-wide transition-colors cursor-pointer inline-flex items-center py-1 ${
                      isOpen
                        ? "text-[#264A3F] font-semibold"
                        : "text-gray-700 hover:text-[#264A3F]"
                    }`}
                  >
                    <span className={`underline underline-offset-8 transition-all ${
                      isOpen 
                        ? "decoration-2 decoration-[#264A3F]" 
                        : "decoration-1 decoration-gray-400 group-hover:decoration-[#264A3F] group-hover:decoration-2"
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content Display - Only visible when a tab is clicked, rendered as clean editorial text */}
        {activeTab && (
          <div className="pt-6 pb-6 border-b border-gray-200/80 animate-fadeIn">
            {/* TAB 1: ABOUT */}
            {activeTab === "about" && (
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  About Gemstone Rings
                </h2>
                <p>
                  <strong>Gemstone rings</strong> are more than just exquisite pieces of luxury jewelry—they carry rich histories, deep Vedic symbolism, and boundless spiritual beauty. Whether you are searching for an astrological talisman to balance your horoscope, an engagement ring, or a personal statement piece, understanding the sacred science of gemstone rings enables you to appreciate their craftsmanship and planetary resonance.
                </p>
                <p>
                  Transcending their mere aesthetic appeal, astrological gemstone rings embrace profound significance. When natural, unheated, untreated gemstones are set into pure metals with an open-back design, the cosmic rays of ruling planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu) are channeled through the stone directly onto the wearer's skin.
                </p>
                <p>
                  At <strong>GemRishi</strong>, every single gemstone ring is curated from ethical world origins (Zambia, Burma, Ceylon/Sri Lanka, Colombia, Kashmir, Brazil) accompanied by government-approved lab certificates (IGI, GIA, IIGJ). We ensure you experience maximum astrological benefits with pure metals and expert jewelry artisanship.
                </p>
              </div>
            )}

            {/* TAB 2: TYPES */}
            {activeTab === "types" && (
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  Types of Astrological Gemstone Rings
                </h2>
                <p>
                  Each precious and semi-precious gemstone possesses its distinct astrological aura, planetary vibration, and spiritual qualities. Explore the major categories of gemstone rings:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-emerald-800 text-base block mb-1">Emerald (Panna) Rings:</strong>
                    Showcasing vibrant green emeralds representing Mercury (Budh). Promotes intellect, communication, business success, and creative eloquence.
                  </li>
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-amber-800 text-base block mb-1">Yellow Sapphire (Pukhraj) Rings:</strong>
                    The royal gemstone of Jupiter (Brihaspati). Bestows wisdom, knowledge, marital harmony, prosperity, and spiritual growth.
                  </li>
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-blue-800 text-base block mb-1">Blue Sapphire (Neelam) Rings:</strong>
                    The most powerful talisman of Saturn (Shani). Known for bringing rapid fortune, mental focus, discipline, and defense against obstacles.
                  </li>
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-red-800 text-base block mb-1">Ruby (Manik) Rings:</strong>
                    The King of Gemstones ruled by the Sun (Surya). Enhances leadership, vitality, social status, self-confidence, and cardiac health.
                  </li>
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-orange-800 text-base block mb-1">Red Coral (Moonga) Rings:</strong>
                    Organic gemstone of Mars (Mangal). Ignites courage, physical stamina, leadership, and removes Manglik dosha.
                  </li>
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-slate-800 text-base block mb-1">Pearl (Moti) Rings:</strong>
                    Soothing gemstone of the Moon (Chandra). Provides emotional balance, mental tranquility, inner peace, and maternal blessings.
                  </li>
                </ul>
              </div>
            )}

            {/* TAB 3: DESIGNS */}
            {activeTab === "designs" && (
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  Designer Rings for Men and Women
                </h2>
                <p>
                  GemRishi designer rings offer a harmonious blend of Vedic astrological precision and modern haute-joaillerie elegance. Designed for comfort during everyday wear, our rings cater to both men and women across diverse styling preferences:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Designer Rings for Men</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Robust, commanding designs crafted with substantial metal weight for a solid, royal feel.
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                      <li><strong>Signet Rings:</strong> Heavy square and oval crown designs with bold gem placement.</li>
                      <li><strong>Brushed Matte Bands:</strong> Contemporary masculine bands in Panchdhatu and white gold.</li>
                      <li><strong>Vedic Claw Rings:</strong> Four-prong settings ensuring maximum skin contact.</li>
                      <li><strong>Traditional Astrological Rings:</strong> Designed strictly according to Brihat Samhita rules.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50/50 to-white border border-amber-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Designer Rings for Women</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Graceful, delicate, and statement rings tailored for everyday elegance and festive celebrations.
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                      <li><strong>Solitaire Classic:</strong> Timeless focal setting that spotlights the gemstone's natural fire.</li>
                      <li><strong>Halo & Accent Bands:</strong> Encircled with natural zircon or diamond substitutes for regal brilliance.</li>
                      <li><strong>Floral & Filigree Motif:</strong> Ornate hand-engraved metalwork inspired by Indian heritage.</li>
                      <li><strong>Stackable Sleek Bands:</strong> Minimalist designs perfect for pairing with wedding rings.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SETTINGS & METALS */}
            {activeTab === "metals" && (
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  Ring Settings & Sacred Vedic Metals
                </h2>
                <p>
                  In Vedic gemology, the choice of setting and metal is as crucial as the stone itself. A gemstone works when its lower pavilion makes direct, uninterrupted contact with the wearer's skin while allowing sunlight to pass through.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h4 className="font-bold text-gray-900 text-base mb-1">Vedic Open-Back Setting</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Unlike commercial closed rings, GemRishi rings feature an open pavilion underneath the gem so the cosmic planetary rays touch your epidermis continuously.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h4 className="font-bold text-gray-900 text-base mb-1">Prong & Bezel Security</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Precision prongs and protective bezels hold valuable natural gems securely in place, preventing chipping while maximizing light transmission.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h4 className="font-bold text-gray-900 text-base mb-1">Sacred Panchdhatu Alloy</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Our proprietary Panchdhatu is an alloy of 5 sacred metals (Gold, Silver, Copper, Zinc, and Iron) crafted as per Shastras for universal planetary compatibility.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: FAQS */}
            {activeTab === "faqs" && (
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mb-4">
                  Frequently Asked Questions About Gemstone Rings
                </h2>
                {[
                  {
                    q: "Which finger should I wear my gemstone ring on?",
                    a: "Each planetary gemstone is associated with a specific finger: Ruby (Sun) is worn on the ring finger; Yellow Sapphire (Jupiter) on the index finger; Blue Sapphire (Saturn) and Hessonite (Rahu) on the middle finger; Emerald (Mercury) on the little finger; Pearl (Moon) on the little or ring finger. You can also consult our astrologer for custom advice."
                  },
                  {
                    q: "Why is an open-back setting mandatory for astrological rings?",
                    a: "In Vedic Gemology, the bottom facet of the gemstone must remain open to touch the skin (Kiran Sparsh). This allows the gemstone to absorb solar and planetary radiations and transmit electromagnetic vibrations into the human body's nadis."
                  },
                  {
                    q: "What metals are best for gemstone rings?",
                    a: "Gold (18k or 22k) is traditionally recommended for Jupiter (Yellow Sapphire) and Sun (Ruby). Silver (925 Sterling) is auspicious for Moon (Pearl) and Venus (Opal/White Sapphire). Sacred Panchdhatu (5-metal alloy) is universally suitable for all planetary stones, especially Shani, Rahu, and Ketu."
                  },
                  {
                    q: "How do I determine my correct ring size?",
                    a: "You can refer to our interactive Ring Size Guide (/ring-size) which provides standard Indian and international sizing charts. You can also measure the inner diameter of an existing well-fitting ring or wrap a string around your knuckle to find the circumference in millimeters."
                  },
                  {
                    q: "Are GemRishi rings 100% certified and untreated?",
                    a: "Yes. Every natural gemstone set into our rings comes with an authentic government-approved gemological laboratory certificate certifying its species, color, weight, and 100% natural origin without synthetic heat treatments."
                  }
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left px-5 py-3.5 flex items-center justify-between font-semibold text-gray-900 text-sm sm:text-base cursor-pointer hover:bg-gray-100/60 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${
                          openFaq === idx ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. Subcategories / Gemstone Ring Collections Grid (12 GemRishi Categories) */}
      <section id="ring-collections-grid" className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-10 sm:pb-14">
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6">
          {/* <span className="inline-block text-xs uppercase tracking-[0.2em] text-[#264A3F] font-semibold mb-2">
            Exquisite Astrological Creations
          </span> */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 tracking-tight">
            Collection of Colorful Gemstone Rings
          </h2>
          <div className="flex items-center justify-center gap-2 my-2">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#264A3F]"></span>
            <span className="w-2 h-2 rounded-full bg-[#264A3F]"></span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#264A3F]"></span>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Select your desired gemstone to explore tailored astrological ring designs. Click any ring to filter the live showcase below.
          </p>
        </div>

        {/* Ring Collection List - 4 Rings Per Row with Luxury Boutique Styling */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {RING_COLLECTIONS.map((col) => {
            const isSelected = selectedGemstone === col.id;
            return (
              <Link
                key={col.id}
                to={`/jewellery/${col.slug}`}
                className="group flex flex-col items-center cursor-pointer text-center transition-all duration-300 no-underline"
              >
                {/* Ring Image with Luxury Radial Ambient Glow & Smooth Hover Lift */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-72 lg:h-72 flex items-center justify-center mb-3">
                  <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-100/40 via-[#264A3F]/5 to-transparent blur-xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none"></div>
                  <img
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-contain relative z-10 mix-blend-multiply drop-shadow-[0_10px_18px_rgba(0,0,0,0.10)] transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-[0_20px_28px_rgba(0,0,0,0.18)]"
                    onError={(e) => {
                      if (col.fallbackUrl && e.currentTarget.src !== col.fallbackUrl) {
                        e.currentTarget.src = col.fallbackUrl;
                      } else {
                        e.currentTarget.src = "https://api.gemrishi.com/public/uploads/jewelrySubCategory/subCategoryImg-1784113867320-663376616.webp";
                      }
                    }}
                  />
                </div>

                {/* Ring Name & Refined Editorial Typography */}
                <div className="relative flex flex-col items-center">
                  <h3 className={`font-serif text-base sm:text-lg lg:text-xl font-bold tracking-tight transition-colors leading-snug ${
                    isSelected ? "text-[#264A3F]" : "text-gray-900 group-hover:text-[#264A3F]"
                  }`}>
                    {col.name}
                  </h3>
                  {col.hindiName && (
                    <span className="text-xs uppercase tracking-wider text-amber-900/80 font-medium mt-1">
                      {col.hindiName}
                    </span>
                  )}
                  {/* Subtle Underline Indicator */}
                  <span className={`h-0.5 mt-1.5 transition-all duration-300 rounded-full ${
                    isSelected ? "w-10 bg-[#264A3F]" : "w-0 group-hover:w-8 bg-[#264A3F]/60"
                  }`}></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5.1 Quick Assistance & Exploration Bar - Directly below Collection Grid */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 pb-10 sm:pb-14">
        <div className="bg-gradient-to-r from-[#F5F2EB] via-white to-[#F5F2EB] border border-stone-200/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="text-center md:text-left space-y-1">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              Need Help Finding Your Perfect Sacred Ring?
            </h3>
            <p className="text-sm text-gray-600 max-w-xl">
              From calculating your exact ring size to finding your Vedic planetary gemstone match, our experts are here to guide you.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3.5 shrink-0">
            <Link
              to="/ring-size"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-medium text-sm transition-all shadow-xs hover:border-[#264A3F] hover:text-[#264A3F]"
            >
              <Ruler className="w-4 h-4 text-[#264A3F]" />
              Ring Size Guide
            </Link>
            <Link
              to="/suggest"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-medium text-sm transition-all shadow-xs"
            >
              <Award className="w-4 h-4 text-amber-700" />
              Free Astrological Recommendation
            </Link>
            <Link
              to="/jewellery"
              className="px-6 py-2.5 rounded-full bg-[#264A3F] hover:bg-[#1E3B32] text-white font-medium text-sm transition-all shadow-sm hover:shadow"
            >
              Explore All Rings
            </Link>
          </div>
        </div>
      </section>

      {/* 5.5 Bespoke Ring Showcase (Unlock Your Ring - Heritage Visual Collage on Left, Editorial Text on Right) */}
      <section className="w-full bg-[#FAF9F5] border-t border-b border-gray-200/70 py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 xl:gap-20">
            {/* --- LEFT COLUMN: Lookbook Visual Collage --- */}
            <div className="w-full lg:w-7/12 relative">
              {/* Decorative Concentric Circular Background Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px] border border-stone-300/60 rounded-full z-0 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] lg:w-[680px] lg:h-[680px] border border-stone-200/70 rounded-full z-0 pointer-events-none"></div>

              {/* Lookbook Collage Container */}
              <div className="relative h-[380px] sm:h-[480px] lg:h-[560px] w-full z-10 max-w-[500px] lg:max-w-none mx-auto">
                {/* 1. Main Centerpiece (The Ring Edit Finished Halo Emerald Ring) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[190px] h-[260px] sm:w-[260px] sm:h-[360px] lg:w-[310px] lg:h-[420px] bg-[#FDFDFB] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] z-20 group border border-stone-200/80 p-4 sm:p-6 flex flex-col justify-between transition-transform duration-700 hover:-translate-y-[calc(50%+8px)] rounded-xl">
                  <div className="w-full h-[85%] flex items-center justify-center overflow-hidden mix-blend-darken">
                    <img
                      src="/4.png"
                      alt="The Ring Edit - Emerald Diamond Halo Ring"
                      width="300"
                      height="300"
                      className="w-[90%] h-auto object-contain transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="w-full text-center border-t border-stone-200 pt-2 sm:pt-3">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-600 group-hover:text-[#264A3F] transition-colors">
                      The Ring Edit
                    </span>
                  </div>
                </div>

                {/* 2. Top Right Floating (Mount Setting with Diamond Halo) */}
                <div className="absolute top-3 right-0 sm:top-6 sm:right-6 lg:right-10 w-[100px] h-[130px] sm:w-[150px] sm:h-[200px] lg:w-[180px] lg:h-[230px] bg-white shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] z-30 group transition-all duration-700 hover:-translate-y-2 p-2 sm:p-4 flex flex-col justify-between border border-stone-100 rounded-lg">
                  <div className="h-full flex items-center justify-center overflow-hidden mix-blend-darken">
                    <img
                      src="/2.png"
                      alt="Ring Setting Mount"
                      width="160"
                      height="160"
                      className="w-[85%] object-contain transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* 3. Bottom Left Floating (Panchdhatu / Gold Band Mount) */}
                <div className="absolute bottom-3 left-0 sm:bottom-6 sm:left-6 lg:left-8 w-[110px] h-[130px] sm:w-[160px] sm:h-[190px] lg:w-[190px] lg:h-[220px] bg-[#F9F9F8] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] z-30 group transition-all duration-700 hover:-translate-y-2 p-2 sm:p-4 flex flex-col justify-between border border-stone-200/60 rounded-lg">
                  <div className="h-full flex items-center justify-center overflow-hidden mix-blend-darken">
                    <img
                      src="/1.png"
                      alt="Handcrafted Band Mount"
                      width="180"
                      height="180"
                      className="w-[85%] object-contain transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* 4. Top Left Floating Accent Circle (Natural Emerald Gemstone) */}
                <div className="absolute top-8 left-3 sm:top-12 sm:left-8 lg:left-12 w-[75px] h-[75px] sm:w-[120px] sm:h-[120px] lg:w-[140px] lg:h-[140px] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] z-10 group transition-all duration-700 hover:-translate-y-1 rounded-full flex items-center justify-center border border-stone-200/80 overflow-hidden">
                  <img
                    src="/3.png"
                    alt="Natural Vedic Emerald"
                    width="120"
                    height="120"
                    className="w-[65%] h-[65%] object-contain mix-blend-darken opacity-95 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                  />
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN: Editorial Typography & Actions ("Unlock Your Ring") --- */}
            <div className="w-full lg:w-5/12 space-y-5 text-center lg:text-left z-10">
              <div>
                {/* <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#264A3F] mb-3">
                  The Heritage Craftsmanship
                </span> */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900 leading-[1.15] mb-4">
                  Unlock Your <br />
                  <span className="italic font-light text-stone-700">
                    Sacred Ring
                  </span>
                </h2>
                <div className="w-12 h-[1.5px] bg-[#264A3F] mx-auto lg:mx-0 mb-5"></div>
              </div>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                Discover the sacred art of personalized gemstone jewellery. At GemRishi, we unite authentic Jyotish astrology with master goldsmith craftsmanship. Choose your certified natural gemstone, pair it with our signature open-back mountings in hallmarked 18K/22K Gold, Sterling Silver, or sacred Panchdhatu, and unlock celestial harmony designed specifically for your astrological chart.
              </p>

              {/* Feature Highlights Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200/70 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-[#264A3F]/10 flex items-center justify-center text-[#264A3F] shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Open-Back Setting</h4>
                    <p className="text-[11px] text-gray-500">Direct skin touch (Kiran Sparsh)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200/70 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-[#264A3F]/10 flex items-center justify-center text-[#264A3F] shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Vedic Energization</h4>
                    <p className="text-[11px] text-gray-500">Prana Pratishtha by Vedic Pandits</p>
                  </div>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
                <a
                  href="#ring-collections-grid"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1A362D] hover:bg-stone-900 text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-md text-center"
                >
                  Explore Rings
                </a>
                <button
                  type="button"
                  onClick={() => window.open("https://login.zaptriqai.com/widget/form/69da222e8059d", "_blank")}
                  className="flex items-center justify-center gap-2 text-stone-700 hover:text-[#1A362D] transition-colors group text-xs font-bold uppercase tracking-wider py-2 cursor-pointer"
                >
                  <span className="relative pb-0.5 border-b border-stone-400 group-hover:border-[#1A362D] transition-colors">
                    Custom Ring Consultation
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.6 Masterpiece Video Showcase (Text on Left, Ring Video on Right) */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16">
          
          {/* --- LEFT COLUMN: Clean Minimal Editorial Text --- */}
          <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-center gap-5 text-left">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#264A3F]/8 text-[#264A3F] border border-[#264A3F]/20 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Handcrafted Mastery
            </div>

            <div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight">
                Where Ancient{" "}
                <span className="text-[#264A3F] italic">Wisdom</span>
                <br />
                Meets Timeless Artistry
              </h2>
              <p className="text-stone-500 text-sm sm:text-base leading-relaxed mt-4 max-w-md">
                Every GemRishi ring is hand-selected by our Vedic gemologists and set by master artisans — crafted in 18K Gold, Silver, or Panchdhatu with direct skin touch, and ritually consecrated with sacred mantras.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <a
                href="#ring-collections-grid"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#264A3F] hover:bg-[#1a3529] text-white text-sm font-semibold transition-all duration-300 shadow-[0_4px_16px_-4px_rgba(38,74,63,0.5)] hover:-translate-y-0.5"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Ring Video Showcase (Sharp Rectangle Shape) --- */}
          <div className="w-full lg:w-[52%] xl:w-[55%]">
            <div className="relative overflow-hidden shadow-[0_12px_40px_-8px_rgba(38,74,63,0.20)] border border-stone-200/80 bg-stone-900 aspect-video group">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
              >
                <source src="/ringscrx.mp4" type="video/mp4" />
                <source src="/ringcrx.mp4" type="video/mp4" />
              </video>
              {/* Subtle Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Luxury Atelier Corner Tag */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md text-white/95 text-[10px] sm:text-xs font-serif tracking-wider border border-white/15">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  GemRishi Atelier • Handcrafted Ring
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Ring Sizing & Customization Banner */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#264A3F] to-[#162D26] text-white p-8 sm:p-12 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              Perfect Fit Guaranteed
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight">
              Don't Know Your Exact Ring Size?
            </h2>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Wearing a ring with the right snugness is vital for everyday comfort and uninterrupted astrological skin contact. Use our comprehensive sizing guide or request a complimentary ring sizer before we cast your jewelry.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/ring-size"
                className="px-6 py-3 rounded-full bg-white text-[#264A3F] font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors shadow"
              >
                View Ring Size Guide
              </Link>
              <Link
                to="/contactUs"
                className="px-6 py-3 rounded-full bg-emerald-800/60 hover:bg-emerald-800 text-white font-medium text-xs uppercase tracking-wider border border-white/20 transition-colors"
              >
                Custom Design Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Client Testimonials Section - Continuous Auto-Sliding Carousel (Home Page Style) */}
      <section className="bg-[#F5F2EB] py-14 sm:py-18 border-t border-gray-200 overflow-hidden">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-[#264A3F] text-xs font-bold tracking-[0.2em] uppercase mb-2 inline-flex items-center justify-center gap-2">
              <span className="w-6 h-[1.5px] bg-[#264A3F]"></span>
              Client Stories
              <span className="w-6 h-[1.5px] bg-[#264A3F]"></span>
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 tracking-tight">
              Clients Testimonials
            </h2>
            <div className="flex items-center justify-center gap-2 my-3">
              <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#264A3F]"></span>
              <span className="w-2 h-2 rounded-full bg-[#264A3F]"></span>
              <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#264A3F]"></span>
            </div>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Discover what our delighted customers across India and abroad have to say about their custom gemstone rings.
            </p>
          </div>

          {/* Continuous Sliding Gallery with Gradient Edge Masks */}
          <div className="relative w-full">
            {/* Left & Right Gradient Shadows */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24 bg-gradient-to-r from-[#F5F2EB] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24 bg-gradient-to-l from-[#F5F2EB] to-transparent z-10 pointer-events-none"></div>

            {/* Swipeable Continuous Scroll Container */}
            <div
              ref={testimonialScrollRef}
              onMouseEnter={handleTestimonialMouseEnter}
              onMouseLeave={handleTestimonialMouseLeave}
              onTouchStart={handleTestimonialTouchStart}
              onTouchEnd={handleTestimonialTouchEnd}
              className="flex overflow-x-auto no-scrollbar py-4 cursor-grab active:cursor-grabbing select-none"
            >
              {[...CLIENT_TESTIMONIALS, ...CLIENT_TESTIMONIALS, ...CLIENT_TESTIMONIALS, ...CLIENT_TESTIMONIALS].map((t, idx) => (
                <div key={idx} className="flex-shrink-0 px-3">
                  <div className="w-[300px] sm:w-[340px] lg:w-[380px] flex flex-col h-full bg-white p-6 lg:p-7 rounded-2xl shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] border border-gray-200/80 hover:border-[#264A3F]/40 hover:shadow-[0_15px_30px_-10px_rgba(38,74,63,0.12)] transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {t.date}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#264A3F] mb-2 uppercase tracking-wide">
                      {t.ring}
                    </p>

                    <p className="text-gray-700 text-xs sm:text-sm italic leading-relaxed mb-6 flex-1">
                      "{t.text}"
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#264A3F] transition-colors">{t.name}</h4>
                        <span className="text-[11px] text-gray-400">{t.location}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#264A3F]/10 text-[#264A3F] flex items-center justify-center font-bold text-xs">
                        {t.name.charAt(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/testimonals"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#264A3F] hover:underline"
            >
              <span>Read All Customer Reviews</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Hide default browser scrollbar */}
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </section>

      {/* 9. Trust Badges & Verified Reviews Component */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 py-10">
        <TrustBadges />
      </section>
    </div>
  );
};

export default GemstoneRings;
