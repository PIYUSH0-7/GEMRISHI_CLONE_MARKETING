
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
import PendantEditInteractiveBanner from "../components/PendantEditInteractiveBanner";

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

// 12 Authentic GemRishi Pendant Categories from Database
const PENDANT_COLLECTIONS = [
  {
    id: "emerald",
    name: "Emerald Pendants",
    hindiName: "Panna Locket",
    planet: "Mercury (Budh)",
    stone: "Emerald",
    benefit: "Intellect, Communication & Wealth",
    imgScale: "scale-105 sm:scale-110",
    image: "/uploads/subCategoryImg-1784117043583-960771548.webp",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784117043583-960771548.webp",
    vector: emeraldStone,
    color: "#059669",
    slug: "emerald-pendant"
  },
  {
    id: "yellow-sapphire",
    name: "Yellow Sapphire Pendants",
    hindiName: "Pukhraj Locket",
    planet: "Jupiter (Brihaspati)",
    stone: "Yellow Sapphire",
    benefit: "Wisdom, Prosperity & Grace",
    imgScale: "scale-105 sm:scale-110",
    image: "/uploads/subCategoryImg-1784117010318-145675788.webp",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784117010318-145675788.webp",
    vector: yellowSapphireStone,
    color: "#D97706",
    slug: "yellow-sapphire-pendant"
  },
  {
    id: "blue-sapphire",
    name: "Blue Sapphire Pendants",
    hindiName: "Neelam Locket",
    planet: "Saturn (Shani)",
    stone: "Blue Sapphire",
    benefit: "Career Focus, Discipline & Shani Shield",
    imgScale: "scale-105 sm:scale-110",
    image: "/uploads/subCategoryImg-1784117060167-355938531.webp",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784117060167-355938531.webp",
    vector: blueSapphireStone,
    color: "#2563EB",
    slug: "blue-sapphire-pendant"
  },
  {
    id: "ruby",
    name: "Ruby Pendants",
    hindiName: "Manik Locket",
    planet: "Sun (Surya)",
    stone: "Ruby",
    benefit: "Leadership, Vitality & Royal Fame",
    imgScale: "scale-105 sm:scale-110",
    image: "/uploads/subCategoryImg-1784117024350-665532170.webp",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784117024350-665532170.webp",
    vector: rubyStone,
    color: "#DC2626",
    slug: "ruby-pendant"
  },
  {
    id: "pearl",
    name: "Pearl Pendants",
    hindiName: "Moti Locket",
    planet: "Moon (Chandra)",
    stone: "Pearl",
    benefit: "Mental Calm, Harmony & Emotional Balance",
    imgScale: "scale-[1.8] sm:scale-[1.9]",
    image: "/uploads/subCategoryImg-1784886942296-861380904.jpeg",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784886942296-861380904.jpeg",
    vector: pearlStone,
    color: "#64748B",
    slug: "pearl-pendant-"
  },
  {
    id: "white-sapphire",
    name: "White Sapphire Pendants",
    hindiName: "Safed Pukhraj Locket",
    planet: "Venus (Shukra)",
    stone: "White Sapphire",
    benefit: "Luxury, Artistic Success & Radiance",
    imgScale: "scale-[1.8] sm:scale-[1.9]",
    image: "/uploads/subCategoryImg-1784791661988-660482806.jpeg",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784791661988-660482806.jpeg",
    vector: diamondStone,
    color: "#475569",
    slug: "white-sapphire-pendant"
  },
  {
    id: "red-coral",
    name: "Red Coral Pendants",
    hindiName: "Moonga Locket",
    planet: "Mars (Mangal)",
    stone: "Red Coral",
    benefit: "Courage, Stamina & Manglik Shield",
    imgScale: "scale-[1.8] sm:scale-[1.9]",
    image: "/uploads/subCategoryImg-1784886153264-821562180.jpeg",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784886153264-821562180.jpeg",
    vector: coralStone,
    color: "#EA580C",
    slug: "red-coral-pendant-"
  },
  {
    id: "cats-eye",
    name: "Cats Eye Pendants",
    hindiName: "Lehsuniya Locket",
    planet: "Ketu",
    stone: "Cats Eye",
    benefit: "Intuition, Spiritual Defense & Quick Fortune",
    imgScale: "scale-[1.8] sm:scale-[1.9]",
    image: "/uploads/subCategoryImg-1784886505760-750525058.jpeg",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784886505760-750525058.jpeg",
    vector: catsEyeStone,
    color: "#CA8A04",
    slug: "cat's-eye-pendant"
  },
  {
    id: "firoza",
    name: "Firoza Pendants",
    hindiName: "Turquoise Locket",
    planet: "Jupiter & Mercury",
    stone: "Firoza",
    benefit: "Positive Energy & Evil-Eye Protection",
    imgScale: "scale-[1.8] sm:scale-[1.9]",
    image: "/uploads/subCategoryImg-1784882538521-992709720.jpeg",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784882538521-992709720.jpeg",
    vector: blueSapphireStone,
    color: "#06B6D4",
    slug: "firoza-pendant"
  },
  {
    id: "hessonite",
    name: "Hessonite Pendants",
    hindiName: "Gomed Locket",
    planet: "Rahu",
    stone: "Hessonite",
    benefit: "Ambition, Victory & Rahu Shanti",
    imgScale: "scale-[1.8] sm:scale-[1.9]",
    image: "/uploads/subCategoryImg-1784887176355-425412842.jpeg",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784887176355-425412842.jpeg",
    vector: hessoniteStone,
    color: "#B45309",
    slug: "hessonite-pendant"
  },
  {
    id: "amethyst",
    name: "Amethyst Pendants",
    hindiName: "Jamunia Locket",
    planet: "Saturn (Shani Sub)",
    stone: "Amethyst",
    benefit: "Deep Meditation, Focus & Sobriety",
    imgScale: "scale-[1.8] sm:scale-[1.9]",
    image: "/uploads/subCategoryImg-1784885635890-881881407.jpeg",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784885635890-881881407.jpeg",
    vector: blueSapphireStone,
    color: "#7E22CE",
    slug: "amethyst-pendant"
  },
  {
    id: "opal",
    name: "Opal Pendants",
    hindiName: "Doodhiya Locket",
    planet: "Venus (Shukra)",
    stone: "Opal",
    benefit: "Romance, Glamour & Creative Magnetism",
    imgScale: "scale-[1.8] sm:scale-[1.9]",
    image: "/uploads/subCategoryImg-1784886255100-99131778.jpeg",
    fallbackUrl: "https://gemrishi.com/uploads/subCategoryImg-1784886255100-99131778.jpeg",
    vector: diamondStone,
    color: "#0284C7",
    slug: "opal-pendant"
  }
];

// Client Testimonials matching GemRishi handcrafted pendants & lockets feedback (8 authentic reviews)
const CLIENT_TESTIMONIALS = [
  {
    id: 1,
    name: "Rakesh Naik",
    location: "Mumbai",
    rating: 5,
    pendant: "Yellow Sapphire (Pukhraj) Locket",
    text: "I am beyond satisfied with my Yellow Sapphire pendant! The astrological open-back setting allows direct skin contact with the heart chakra as recommended by my Pandit ji. Certified authentic by IIGJ and delivered securely.",
    date: "Verified Buyer"
  },
  {
    id: 2,
    name: "Jinu Raj",
    location: "Bengaluru",
    rating: 5,
    pendant: "Emerald (Panna) Gold Pendant",
    text: "I was searching for an authentic Zambian emerald pendant online. GemRishi offered stunning craftsmanship in 18k hallmarked gold. The finish, clarity, and energized prana pratishtha gave me immense peace of mind.",
    date: "Verified Buyer"
  },
  {
    id: 3,
    name: "Upasna Sharma",
    location: "Delhi NCR",
    rating: 5,
    pendant: "Italian Red Coral Panchdhatu Locket",
    text: "Bought an Italian Red Coral pendant in Panchdhatu. I was initially skeptical about ordering customized jewelry online, but their team verified the bail compatibility with my gold chain and delivered on time. Highly recommended!",
    date: "Verified Buyer"
  },
  {
    id: 4,
    name: "Diksha Choudhary",
    location: "Jaipur",
    rating: 5,
    pendant: "Burma Ruby Surya Tejas Gold Pendant",
    text: "GemRishi provided the perfect pigeon blood ruby for my customized locket. From Vedic astrological consultation to design, hallmarking, and energization, their service was simply outstanding.",
    date: "Verified Buyer"
  },
  {
    id: 5,
    name: "Amitav Sen",
    location: "Kolkata",
    rating: 5,
    pendant: "Blue Sapphire (Neelam) Silver Pendant",
    text: "Ordered a certified Ceylon Blue Sapphire pendant. The clarity and deep cornflower blue hue are breathtaking. Wearing it over the Anahata chakra brought instant mental focus and discipline.",
    date: "Verified Buyer"
  },
  {
    id: 6,
    name: "Pooja Malhotra",
    location: "Chandigarh",
    rating: 5,
    pendant: "South Sea Pearl (Moti) Silver Locket",
    text: "Exquisite South Sea Pearl set in hallmarked sterling silver. The luster is flawless and wearing it brought a noticeable sense of calm, emotional stability, and inner tranquility.",
    date: "Verified Buyer"
  },
  {
    id: 7,
    name: "Vikramaditya Rathore",
    location: "Ahmedabad",
    rating: 5,
    pendant: "Hessonite (Gomed) Sacred Locket",
    text: "The honey-colored hessonite pendant crafted in sacred Panchdhatu exceeded my expectations. Lab certified and authenticated with complete transparency.",
    date: "Verified Buyer"
  },
  {
    id: 8,
    name: "Sneha Kulkarni",
    location: "Pune",
    rating: 5,
    pendant: "Australian Opal Halo Pendant",
    text: "The rainbow fire in this opal pendant is mesmerizing! Every detail from the delicate diamond halo to the smooth open-back finish was handled with supreme perfection.",
    date: "Verified Buyer"
  }
];

const GemstonePendants = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active Information Tab (About, Types, Designs, Settings & Metals, FAQs) - Default closed/hidden
  const [activeTab, setActiveTab] = useState(null);

  // Filter States for Live Pendant Catalog
  const [selectedGemstone, setSelectedGemstone] = useState("all");
  const [selectedMetal, setSelectedMetal] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);

  // Testimonials Continuous Auto-Scroller State (Matching GemstoneReviews continuous loop)
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

  // Sync with URL query parameters if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gemParam = params.get("gemstone");
    const metalParam = params.get("metal");
    if (gemParam) setSelectedGemstone(gemParam);
    if (metalParam) setSelectedMetal(metalParam);
  }, [location.search]);

  const activeCollection = useMemo(() => {
    return PENDANT_COLLECTIONS.find((c) => c.id === selectedGemstone) || null;
  }, [selectedGemstone]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-gray-900">
      {/* 1. SEO & Metadata */}
      <Helmet>
        <title>Buy Natural Gemstone Pendants & Lockets Online at Best Price in India | GemRishi</title>
        <meta
          name="description"
          content="Shop certified gemstone pendants & lockets at GemRishi. Handcrafted in 18K/22K Gold, 925 Sterling Silver, and sacred Panchdhatu. 100% natural, lab-certified astrological pendants with Vedic energization."
        />
        <meta
          name="keywords"
          content="Gemstone Pendants, Buy Gemstone pendants, Online Gemstone locket, Gemstone Pendants for women, Men Gemstone Pendants, Certified Gemstones lockets, Gemstones pendants price, Panna pendant, Pukhraj pendant, Neelam locket, Manik pendant, Astrological pendants"
        />
        <meta property="og:title" content="Buy Natural Gemstone Pendants & Lockets Online at Best Price in India | GemRishi" />
        <meta property="og:description" content="Shop an exclusive collection of certified gemstone pendants and lockets at GemRishi. Handcrafted in Gold, Silver and Panchdhatu with Vedic heart-chakra energization." />
        <meta property="og:url" content="https://gemrishi.com/pendants" />
        <meta property="og:image" content="/pendantbanner.png" />
      </Helmet>

      {/* 1.5 Full Width Hero Banner - Directly below Navbar (100% Uncropped) */}
      <div className="w-full overflow-hidden border-b border-gray-200">
        <img
          src="/pendantbanner.png"
          alt="Pendants - Discover the Art of Elegance | GemRishi"
          className="w-full h-[200px] sm:h-[280px] md:h-[450px] lg:h-[450px] object-fill object-center block"
          fetchPriority="high"
          loading="eager"
          onError={(e) => {
            e.currentTarget.src = "/pendants-banner.png";
          }}
        />
      </div>

      {/* 3. Hero & Page Header Section - Full width with balanced margins */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F2EB]/80 via-white to-[#FAF9F5] pt-6 pb-6 sm:pt-8 sm:pb-7">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
            {activeCollection ? activeCollection.name : "Gemstone Pendants & Lockets"}
          </h1>

          <p className="text-gray-700 text-base sm:text-lg leading-relaxed text-justify">
            {activeCollection ? (
              <>
                Discover the natural radiance of handcrafted <strong className="text-[#264A3F]">{activeCollection.name}</strong> ({activeCollection.hindiName}), designed to honor the planetary grace of {activeCollection.planet}. Masterfully set in hallmarked Gold, pure Sterling Silver, or sacred Panchdhatu, each pendant features an open back that keeps the natural stone in gentle, continuous touch with your skin—bringing mental clarity, calm confidence, and effortless luxury to your everyday style.
              </>
            ) : (
              <>
                There is something deeply personal about wearing a gemstone close to your heart. More than exquisite fine jewellery, a genuine <strong className="text-[#264A3F]">gemstone pendant or locket</strong> becomes your daily anchor—a quiet source of positive energy, confidence, and inner balance. Whether you are seeking an astrologically aligned gemstone for career and peace, celebrating life’s milestones, or curating a timeless signature piece, each handcrafted pendant is made to resonate with your personal journey.
              </>
            )}
          </p>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-justify">
            Every gemstone at <strong>GemRishi</strong> is 100% natural and lab-certified, meticulously handset with an authentic <span className="font-semibold text-gray-900">open-back setting</span> for direct skin touch (<em>Kiran Sparsh</em>) so you experience its pure, unfiltered essence. Consecrated with sacred Vedic blessings (<em>Prana Pratishtha</em>) before reaching your hands, your pendant arrives blessed, radiant, and ready to wear with complete peace of mind.
          </p>
        </div>
      </section>

      {/* 4. Interactive Knowledge Links (Editorial Navigation Links: About, Types, Designs, Settings & Metals, FAQs) */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 pt-5 pb-2">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-6 pb-2">
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

        {/* Tab Content Display - Only visible when a tab is clicked */}
        {activeTab && (
          <div className="pt-6 pb-6 border-b border-gray-200/80 animate-fadeIn">
            {/* TAB 1: ABOUT */}
            {activeTab === "about" && (
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  About Astrological Gemstone Pendants
                </h2>
                <p>
                  There is a quiet, transformative power in wearing a natural gemstone close to your heart. Unlike rings that are worn on specific fingers, a pendant rests naturally over the chest near the <em>Anahata Chakra</em> (Heart Center), gently sharing its grounding energy throughout your day with every breath and heartbeat.
                </p>
                <p>
                  When a pure, unheated gemstone is cast with an open-back setting, natural light filters freely through the crystalline facets and makes direct contact with your skin (<em>Kiran Sparsh</em>). This seamless touch helps channel clarity, emotional warmth, and planetary balance directly into your daily routine.
                </p>
                <p>
                  At <strong>GemRishi</strong>, we believe true luxury begins with complete trust. Every single gemstone is ethically handpicked from celebrated global origins—including Zambian emeralds, Ceylon sapphires, and Burmese rubies—and comes certified by government-recognized gemological laboratories (IGI, GIA, IIGJ) for guaranteed authenticity and lifelong joy.
                </p>
              </div>
            )}

            {/* TAB 2: TYPES */}
            {activeTab === "types" && (
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  Types of Astrological Gemstone Pendants
                </h2>
                <p>
                  Each natural planetary gemstone emits a unique cosmic wavelength that influences specific aspects of health, intellect, prosperity, and emotional equilibrium. Explore the core gemstone pendant collections:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-emerald-800 text-base block mb-1">Emerald (Panna) Pendants:</strong>
                    The vibrant green talisman of Mercury (Budh). Enhances cognitive sharpness, public speaking, academic prowess, financial acumen, and merchant success.
                  </li>
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-amber-800 text-base block mb-1">Yellow Sapphire (Pukhraj) Pendants:</strong>
                    The divine jewel of Jupiter (Brihaspati). Fosters spiritual wisdom, marital harmony, judicial success, immense good fortune, and higher philosophical learning.
                  </li>
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-blue-800 text-base block mb-1">Blue Sapphire (Neelam) Pendants:</strong>
                    The supreme catalyst of Saturn (Shani). Bestows rapid career advancement, mental fortitude, steadfast discipline, and defense against unforeseen adversity.
                  </li>
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-red-800 text-base block mb-1">Ruby (Manik) Pendants:</strong>
                    The royal gemstone of the Sun (Surya). Ignites leadership presence, executive authority, self-worth, social fame, and cardiovascular vitality.
                  </li>
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-orange-800 text-base block mb-1">Red Coral (Moonga) Pendants:</strong>
                    The organic talisman of Mars (Mangal). Bolsters physical endurance, courage, administrative grit, and neutralizes debilitating Manglik dosha.
                  </li>
                  <li className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <strong className="text-slate-800 text-base block mb-1">Pearl (Moti) Pendants:</strong>
                    The serene gemstone of the Moon (Chandra). Bestows deep emotional healing, stress relief, maternal tranquility, and balanced intuition.
                  </li>
                </ul>
              </div>
            )}

            {/* TAB 3: DESIGNS */}
            {activeTab === "designs" && (
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  Designer Pendants for Men and Women
                </h2>
                <p>
                  GemRishi designer pendants harmoniously unite strict Vedic Jyotish tenets with contemporary fine jewelry aesthetics. Designed for all-day comfort and chain security, our lockets cater to diverse lifestyles:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Pendants for Men</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Substantial, structured, and commanding designs engineered with generous bails to support heavy gold chains or sacred rudraksha threads.
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                      <li><strong>Architectural Bezel Lockets:</strong> Heavy, clean-lined protective frames with exposed pavilion for skin touch.</li>
                      <li><strong>Surya Tejas & Yantra Motifs:</strong> Sacred sacred geometric backs carrying auspicious solar & planetary yantras.</li>
                      <li><strong>Four-Prong Sovereign Pendants:</strong> Minimalist masculine mountings maximizing gem visibility and light absorption.</li>
                      <li><strong>Panchdhatu Daily Amulets:</strong> Robust traditional alloys crafted strictly as per Brihat Samhita guidelines.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50/50 to-white border border-amber-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Pendants for Women</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Graceful, luminous, and versatile lockets tailored for office elegance, evening celebrations, and everyday spiritual balance.
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                      <li><strong>Classic Solitaire Drop:</strong> Understated luxury spotlighting the gem's cut, clarity, and planetary sparkle.</li>
                      <li><strong>Halo Diamond Lockets:</strong> Accented with sparkling conflict-free natural zircons or diamond surrounds.</li>
                      <li><strong>Heritage Filigree & Floral:</strong> Hand-chiseled vintage lattice work inspired by royal temple jewelry.</li>
                      <li><strong>Floating Bail Modern Pendants:</strong> Seamless contemporary silhouettes that slide smoothly along fine gold chains.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SETTINGS & METALS */}
            {activeTab === "metals" && (
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  Pendant Settings & Sacred Vedic Metals
                </h2>
                <p>
                  In authentic Jyotish science, a gemstone locket must be crafted with an open pavilion (under-setting) so the stone's base continually touches the skin over the sternum, allowing planetary pranic energy to transfer unhindered.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h4 className="font-bold text-gray-900 text-base mb-1">Open-Back Heart Setting</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Every GemRishi pendant incorporates a specially calculated open back that permits skin contact (Kiran Sparsh) while comfortably preventing pinching during movement.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h4 className="font-bold text-gray-900 text-base mb-1">Reinforced Safety Bail</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Our cast bails are solid and soldered seamlessly to prevent accidental chain slippage, accommodating various chain thicknesses and sacred threads.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h4 className="font-bold text-gray-900 text-base mb-1">Sacred Panchdhatu & Pure Gold</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Available in hallmarked 18K/22K Gold, 925 Sterling Silver, or authentic Panchdhatu (Gold, Silver, Copper, Zinc, Iron) crafted in strict adherence to Vedic shastras.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: FAQS */}
            {activeTab === "faqs" && (
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mb-4">
                  Frequently Asked Questions About Gemstone Pendants
                </h2>
                {[
                  {
                    q: "What are the benefits of wearing a gemstone pendant instead of a ring?",
                    a: "Wearing a gemstone pendant is especially advantageous when someone cannot wear rings due to professional constraints, hand swelling, or skin sensitivities. Resting over the Anahata (Heart) chakra, a pendant transmits planetary energy directly to the central pranic meridians."
                  },
                  {
                    q: "Why is an open-back setting mandatory for astrological pendants?",
                    a: "In Vedic Gemology, the lower pavilion of the gemstone must remain unobstructed to touch the skin (Kiran Sparsh). This allows the natural crystal to absorb solar and cosmic radiations and channel electromagnetic vibrations into the bloodstream."
                  },
                  {
                    q: "Which chain or thread should I use with my gemstone pendant?",
                    a: "Gold chains (18k/22k) are ideal for Jupiter (Yellow Sapphire) and Sun (Ruby). 925 Sterling Silver chains suit Moon (Pearl) and Venus (Opal/White Sapphire). A sacred silk thread (red for Sun/Mars, yellow for Jupiter, black for Saturn/Rahu) is also traditionally auspicious."
                  },
                  {
                    q: "Can both men and women wear gemstone pendants?",
                    a: "Yes. Vedic gemstone pendants are completely gender-neutral in their astrological effects. We offer bold, substantial geometric designs tailored for men as well as delicate, ornamental halo and solitaire settings for women."
                  },
                  {
                    q: "Are GemRishi pendants 100% natural, certified, and energized?",
                    a: "Yes. Every natural gemstone set into our lockets comes with an authentic gemological laboratory certificate from recognized bodies (IGI, GIA, IIGJ) certifying natural origin without heat treatments, and is energized through Vedic Prana Pratishtha rituals."
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

      {/* 5. Subcategories / Gemstone Pendant Collections Grid (12 GemRishi Categories) */}
      <section id="pendant-collections-grid" className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-10 sm:pb-14">
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 tracking-tight">
            Collection of Colorful Gemstone Pendants
          </h2>
          <div className="flex items-center justify-center gap-2 my-2">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#264A3F]"></span>
            <span className="w-2 h-2 rounded-full bg-[#264A3F]"></span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#264A3F]"></span>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Select your desired gemstone to explore tailored astrological pendant designs. Click any pendant to view our live collection.
          </p>
        </div>

        {/* Dynamic Keyframes for Pendant Floating & Ambient Sheen Animations */}
        <style>{`
          @keyframes subtlePendantFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          .animate-pendant-idle {
            animation: subtlePendantFloat 4.2s ease-in-out infinite;
          }
          .group:hover .animate-pendant-idle {
            animation-play-state: paused;
          }
        `}</style>

        {/* Pendant Collection Cards Grid - Compact Luxury Cards with Prominent Filled Images */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
          {PENDANT_COLLECTIONS.map((col, index) => {
            const isSelected = selectedGemstone === col.id;
            return (
              <Link
                key={col.id}
                to={`/jewellery/${col.slug}`}
                className={`group relative flex flex-col justify-between bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all duration-400 ease-out hover:-translate-y-1.5 overflow-hidden cursor-pointer no-underline text-left ${
                  isSelected 
                    ? "border-[#264A3F] shadow-[0_12px_28px_-6px_rgba(38,74,63,0.18)] ring-1 ring-[#264A3F]" 
                    : "border-stone-200/80 hover:border-[#264A3F]/50 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_32px_-6px_rgba(38,74,63,0.14)]"
                }`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* 1. Shimmer Sheen Glint Sweep on Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[260%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-30 -skew-x-12" />

                {/* 2. Top Accent Border Glow */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#264A3F]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-20" />

                <div>
                  {/* Gemstone Pendant Showcase Canvas - Filled & Compact */}
                  <div className="relative w-full h-44 sm:h-52 md:h-56 flex items-center justify-center overflow-hidden rounded-lg bg-white mb-2">
                    {/* Planetary Ambient Radial Aura */}
                    <div 
                      className="absolute inset-2 rounded-full opacity-25 group-hover:opacity-65 blur-lg group-hover:scale-125 transition-all duration-500 ease-out pointer-events-none"
                      style={{ background: `radial-gradient(circle, ${col.color}45 0%, transparent 70%)` }}
                    />

                    {/* Floating & Scaled Pendant Image that Fills the Card */}
                    <div className="w-full h-full flex items-center justify-center animate-pendant-idle transition-transform duration-500 ease-out group-hover:scale-115 group-hover:-translate-y-1">
                      <img
                        src={col.image}
                        alt={col.name}
                        className={`w-full h-full object-contain ${col.imgScale || "scale-110 sm:scale-115"} p-1 relative z-10 mix-blend-multiply drop-shadow-[0_6px_14px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out group-hover:drop-shadow-[0_16px_24px_rgba(0,0,0,0.18)]`}
                        onError={(e) => {
                          if (col.fallbackUrl && e.currentTarget.src !== col.fallbackUrl) {
                            e.currentTarget.src = col.fallbackUrl;
                          } else {
                            e.currentTarget.src = "/pendent.png";
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Gemstone Name */}
                  <div className="text-left px-0.5">
                    <h3 className={`font-serif text-sm sm:text-base md:text-lg font-bold tracking-tight transition-colors leading-snug truncate ${
                      isSelected ? "text-[#264A3F]" : "text-gray-900 group-hover:text-[#264A3F]"
                    }`}>
                      {col.name}
                    </h3>
                  </div>
                </div>

                {/* Interactive Bottom Action Bar: Explore Lockets Button */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between relative z-10 px-0.5">
                  <span className="text-xs font-semibold text-[#264A3F] group-hover:text-emerald-800 transition-colors">
                    Explore Lockets
                  </span>
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-stone-50 group-hover:bg-[#264A3F] text-stone-600 group-hover:text-white border border-stone-200/80 group-hover:border-[#264A3F] flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 shadow-2xs">
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Thin divider after collection */}
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 mb-10 sm:mb-12">
        <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
      </div>

      {/* Video Showcase Section - Half-Screen Video Left + Minimal Text Right */}

      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 pb-12 sm:pb-16">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10 items-stretch">

          {/* LEFT: Video ~half screen width */}
          <div className="relative w-full md:w-[50%] shrink-0">
            <div className="relative overflow-hidden shadow-[0_12px_40px_-8px_rgba(38,74,63,0.20)] border border-stone-200/60 h-64 sm:h-80 md:h-[420px]">
              <video
                src="/videos/GemstonePendants.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* RIGHT: Clean minimal content */}
          <div className="flex-1 flex flex-col justify-center gap-5 py-2">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#264A3F]/8 text-[#264A3F] border border-[#264A3F]/20 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Handcrafted Mastery
            </div>

            <div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight">
                Where Ancient{" "}
                <span className="text-[#264A3F] italic">Wisdom</span>
                <br />
                Meets Timeless Elegance
              </h2>
              <p className="text-stone-500 text-sm sm:text-base leading-relaxed mt-4 max-w-md">
                Every GemRishi pendant is hand-selected by our Vedic gemologists and set by master artisans — crafted in 18K Gold, Silver, or Panchdhatu, and ritually consecrated with sacred mantras.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <a
                href="/jewellery"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#264A3F] hover:bg-[#1a3529] text-white text-sm font-semibold transition-all duration-300 shadow-[0_4px_16px_-4px_rgba(38,74,63,0.5)] hover:-translate-y-0.5"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* The Pendant Edit - Interactive 3-Pendant Banner (Directly Below Video Showcase) */}
      <PendantEditInteractiveBanner />

      {/* 5.1 Quick Assistance & Exploration Bar - Directly below Collection Grid */}

      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 pb-10 sm:pb-14">
        <div className="bg-gradient-to-r from-[#F5F2EB] via-white to-[#F5F2EB] border border-stone-200/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="text-center md:text-left space-y-1">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              Need Help Finding Your Perfect Gemstone Pendant?
            </h3>
            <p className="text-sm text-gray-600 max-w-xl">
              Whether you are choosing your first Vedic gemstone or deciding between 18K Gold, Silver, and Panchdhatu, our friendly gemologists are always here to guide you with care.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3.5 shrink-0">
            <Link
              to="/suggest"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-medium text-sm transition-all shadow-xs"
            >
              <Award className="w-4 h-4 text-amber-700" />
              Free Astrological Recommendation
            </Link>
            <Link
              to="/contactUs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-medium text-sm transition-all shadow-xs hover:border-[#264A3F] hover:text-[#264A3F]"
            >
              <PhoneCall className="w-4 h-4 text-[#264A3F]" />
              Expert Consultation
            </Link>
            <Link
              to="/jewellery"
              className="px-6 py-2.5 rounded-full bg-[#264A3F] hover:bg-[#1E3B32] text-white font-medium text-sm transition-all shadow-sm hover:shadow"
            >
              Explore All Jewelry
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Pendant Energization & Muhurat Guide Banner */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#264A3F] to-[#162D26] text-white p-8 sm:p-12 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              Sacred Consecration
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight">
              Blessed & Consecrated for Your Journey
            </h2>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Every GemRishi pendant is traditionally energized with sacred planetary mantras through Vedic Prana Pratishtha. Along with your certificate and luxury packaging, we provide personal guidance on the most auspicious day and time (<em>Shubh Muhurat</em>) to wear your pendant for the first time, ensuring your journey begins with divine harmony.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/suggest"
                className="px-6 py-3 rounded-full bg-white text-[#264A3F] font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors shadow"
              >
                Get Free Astrological Advice
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

      {/* 8. Client Testimonials Section - Continuous Auto-Sliding Carousel (Matching GemstoneReviews Style) */}
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
              Discover what our delighted customers across India and abroad have to say about their custom gemstone pendants and lockets.
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
                      {t.pendant}
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

export default GemstonePendants;
