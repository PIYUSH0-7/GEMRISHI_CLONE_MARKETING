import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  Compass,
  Zap,
  Check,
  X,
  Droplets,
  BookOpen,
  ArrowRight,
  Shield,
  Search,
  Award,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sliders,
  Layers,
  Scale,
  Gem,
  Info,
  ExternalLink,
  Flame,
  CheckCheck,
  Bookmark,
  Heart,
  Globe,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

// Asset imports
import VedicGemstoneHeroBg from "../../assets/vedic_gemstone_hero_bg.jpg";
import NaturalGemstonesCollectionImg from "../../assets/natural_gemstones_collection.jpg";
import YellowSapphireImg from "../../assets/Stone/YellowSapphire.svg";

// Stone SVG imports
import BlueSapphireImg from "../../assets/Stone/BlueSapphire.svg";
import EmeraldImg from "../../assets/Stone/Emerald.svg";
import RubyImg from "../../assets/Stone/Ruby.svg";
import PearlImg from "../../assets/Stone/Pearl.svg";
import CoralImg from "../../assets/Stone/Coral.svg";
import HessoniteImg from "../../assets/Stone/Hessonite.svg";
import CatsEyeImg from "../../assets/Stone/catsEye.svg";

// Lab certification logos
import GiaLogo from "../../assets/gia-certification.webp";
import IgiLogo from "../../assets/igi-certification.webp";
import IigjLogo from "../../assets/iigj-certification.webp";
import MgtiLogo from "../../assets/mgti-certification.webp";
import GiiLogo from "../../assets/GII-1.png.webp";

// Blog thumbnail imports
import BlogThumb1 from "../../assets/mythvsscblogb1-1024x579.webp";
import BlogThumb2 from "../../assets/Emerald-for-Taurus-Good-or-Bad.jpg.webp";

const FEATURED_BLOGS = [
  {
    id: 1,
    title: "Navratri 2026 Colours: 9 Days, 9 Shades & the Perfect Gemstone for Each",
    category: "Gemstones",
    readTime: "8 min read",
    date: "22 Sep 2026",
    desc: "Celebrate Navratri 2026 with all nine sacred colours, from vibrant Orange to Peacock Green, and discover the natural Vedic gemstones that beautifully complement each day.",
    image: "https://gemrishi.com/blogs/storage/blogs/1790058385_6ab21f9123133.png",
    fallbackImage: BlogThumb1,
    link: "https://gemrishi.com/blogs/navratri-2026-colours-9-days-9-shades-the-perfect-gemstone-for-each",
  },
  {
    id: 2,
    title: "How to Identify Morganite Gemstone Physically: A Complete Guide to Genuine Morganite",
    category: "Morganite",
    readTime: "7 min read",
    date: "21 Sep 2026",
    desc: "Learn how to identify Morganite gemstone physically by examining its color, clarity, luster, pleochroism, hardness, cut, and key physical authentication characteristics.",
    image: "https://gemrishi.com/blogs/storage/blogs/1789975558_6ab0dc06464cb.png",
    fallbackImage: BlogThumb2,
    link: "https://gemrishi.com/blogs/how-to-identify-morganite-gemstone-physically-a-complete-guide-to-genuine-morganite",
  },
];

const PADDING_CLASS = "px-4 sm:px-8 md:px-12 lg:px-16";

const POPULAR_GEMSTONES = [
  // ─── LOOSE NATURAL GEMSTONES ───
  {
    itemType: "gemstone",
    name: "Yellow Sapphire",
    hindiName: "Pukhraj",
    slug: "yellow-sapphire",
    planet: "Jupiter (Brihaspati)",
    planetShort: "Jupiter",
    properties: "Wealth, Career & Wisdom",
    startingPrice: "₹3,500",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677210658-442401792.webp",
    fallbackImage: YellowSapphireImg,
    category: "precious",
    purpose: ["wealth", "career"],
  },
  {
    itemType: "gemstone",
    name: "Blue Sapphire",
    hindiName: "Neelam",
    slug: "blue-sapphire",
    planet: "Saturn (Shani)",
    planetShort: "Saturn",
    properties: "Career, Focus & Protection",
    startingPrice: "₹4,500",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677228630-170316570.webp",
    fallbackImage: BlueSapphireImg,
    category: "precious",
    purpose: ["career", "protection"],
  },
  {
    itemType: "gemstone",
    name: "Emerald",
    hindiName: "Panna",
    slug: "emerald",
    planet: "Mercury (Budh)",
    planetShort: "Mercury",
    properties: "Business, Intellect & Speech",
    startingPrice: "₹2,800",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677184844-690209034.webp",
    fallbackImage: EmeraldImg,
    category: "precious",
    purpose: ["career", "wealth"],
  },
  {
    itemType: "gemstone",
    name: "Ruby",
    hindiName: "Manik",
    slug: "ruby",
    planet: "Sun (Surya)",
    planetShort: "Sun",
    properties: "Leadership, Fame & Vitality",
    startingPrice: "₹3,200",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677768161-784237619.webp",
    fallbackImage: RubyImg,
    category: "precious",
    purpose: ["career", "health"],
  },
  {
    itemType: "gemstone",
    name: "Natural Pearl",
    hindiName: "Moti",
    slug: "pearl",
    planet: "Moon (Chandra)",
    planetShort: "Moon",
    properties: "Mental Peace & Emotional Calm",
    startingPrice: "₹1,200",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677798846-445624496.webp",
    fallbackImage: PearlImg,
    category: "precious",
    purpose: ["mental-peace", "health"],
  },
  {
    itemType: "gemstone",
    name: "Red Coral",
    hindiName: "Moonga",
    slug: "red-coral",
    planet: "Mars (Mangal)",
    planetShort: "Mars",
    properties: "Courage, Energy & Stamina",
    startingPrice: "₹1,500",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677247454-950055646.webp",
    fallbackImage: CoralImg,
    category: "precious",
    purpose: ["health", "protection"],
  },
  {
    itemType: "gemstone",
    name: "Hessonite",
    hindiName: "Gomed",
    slug: "hessonite",
    planet: "Rahu",
    planetShort: "Rahu",
    properties: "Ambition, Wealth & Rahu Shanti",
    startingPrice: "₹1,100",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677825105-830137633.webp",
    fallbackImage: HessoniteImg,
    category: "semi-precious",
    purpose: ["career", "protection"],
  },
  {
    itemType: "gemstone",
    name: "Cat's Eye",
    hindiName: "Lehsunia",
    slug: "cats-eye",
    planet: "Ketu",
    planetShort: "Ketu",
    properties: "Protection, Intuition & Ketu Shanti",
    startingPrice: "₹1,400",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783678951982-329794568.webp",
    fallbackImage: CatsEyeImg,
    category: "semi-precious",
    purpose: ["protection", "mental-peace"],
  },
  {
    itemType: "gemstone",
    name: "Opal",
    hindiName: "Doodhiya",
    slug: "opal",
    planet: "Venus (Shukra)",
    planetShort: "Venus",
    properties: "Beauty, Luxury & Creativity",
    startingPrice: "₹950",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784034285756-217540851.webp",
    fallbackImage: PearlImg,
    category: "semi-precious",
    purpose: ["wealth", "marriage"],
  },
  {
    itemType: "gemstone",
    name: "Amethyst",
    hindiName: "Katela",
    slug: "amethyst",
    planet: "Saturn (Shani)",
    planetShort: "Saturn",
    properties: "Mental Clarity & Sobriety",
    startingPrice: "₹750",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783678743331-44566422.webp",
    fallbackImage: BlueSapphireImg,
    category: "semi-precious",
    purpose: ["mental-peace", "protection"],
  },
  {
    itemType: "gemstone",
    name: "Turquoise",
    hindiName: "Firoza",
    slug: "turquoise",
    planet: "Jupiter / Venus",
    planetShort: "Jupiter",
    properties: "Friendship, Travel & Healing",
    startingPrice: "₹850",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677785291-643242275.webp",
    fallbackImage: EmeraldImg,
    category: "semi-precious",
    purpose: ["health", "protection"],
  },
  {
    itemType: "gemstone",
    name: "Citrine",
    hindiName: "Sunela",
    slug: "citrine",
    planet: "Jupiter (Brihaspati)",
    planetShort: "Jupiter",
    properties: "Success, Positivity & Abundance",
    startingPrice: "₹650",
    priceSubtitle: "per carat",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784034223383-782762037.webp",
    fallbackImage: YellowSapphireImg,
    category: "semi-precious",
    purpose: ["wealth", "career"],
  },

  // ─── GEMSTONE JEWELLERY: RINGS ───
  {
    itemType: "jewelry",
    subType: "ring",
    name: "Emerald Ring",
    hindiName: "Panna Ring",
    slug: "emerald-rings",
    planet: "Mercury (Budh)",
    planetShort: "Ring",
    properties: "Custom Gold & Silver Settings",
    startingPrice: "₹18,500",
    priceSubtitle: "complete ring",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113852237-906793657.webp",
    fallbackImage: EmeraldImg,
    category: "jewelry",
    purpose: ["career", "wealth"],
  },
  {
    itemType: "jewelry",
    subType: "ring",
    name: "Yellow Sapphire Ring",
    hindiName: "Pukhraj Ring",
    slug: "yellow-sapphire-rings",
    planet: "Jupiter (Brihaspati)",
    planetShort: "Ring",
    properties: "Hallmarked Astrological Band",
    startingPrice: "₹21,000",
    priceSubtitle: "complete ring",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113867320-663376616.webp",
    fallbackImage: YellowSapphireImg,
    category: "jewelry",
    purpose: ["wealth", "career"],
  },
  {
    itemType: "jewelry",
    subType: "ring",
    name: "Blue Sapphire Ring",
    hindiName: "Neelam Ring",
    slug: "blue-sapphire-rings",
    planet: "Saturn (Shani)",
    planetShort: "Ring",
    properties: "Royal Open-Back Setting",
    startingPrice: "₹24,500",
    priceSubtitle: "complete ring",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113887256-25721453.webp",
    fallbackImage: BlueSapphireImg,
    category: "jewelry",
    purpose: ["career", "protection"],
  },
  {
    itemType: "jewelry",
    subType: "ring",
    name: "Ruby Ring",
    hindiName: "Manik Ring",
    slug: "ruby-rings",
    planet: "Sun (Surya)",
    planetShort: "Ring",
    properties: "Imperial Crown Gold Design",
    startingPrice: "₹19,500",
    priceSubtitle: "complete ring",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113912210-999703630.webp",
    fallbackImage: RubyImg,
    category: "jewelry",
    purpose: ["career", "health"],
  },
  {
    itemType: "jewelry",
    subType: "ring",
    name: "Pearl Ring",
    hindiName: "Moti Ring",
    slug: "pearl-rings",
    planet: "Moon (Chandra)",
    planetShort: "Ring",
    properties: "Pure Silver Astrological Setting",
    startingPrice: "₹9,500",
    priceSubtitle: "complete ring",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113930874-49732152.webp",
    fallbackImage: PearlImg,
    category: "jewelry",
    purpose: ["mental-peace", "health"],
  },
  {
    itemType: "jewelry",
    subType: "ring",
    name: "Red Coral Ring",
    hindiName: "Moonga Ring",
    slug: "red-coral-rings",
    planet: "Mars (Mangal)",
    planetShort: "Ring",
    properties: "Traditional Vedic Copper/Gold",
    startingPrice: "₹11,500",
    priceSubtitle: "complete ring",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113973088-6639378.webp",
    fallbackImage: CoralImg,
    category: "jewelry",
    purpose: ["health", "protection"],
  },
  {
    itemType: "jewelry",
    subType: "ring",
    name: "Cat's Eye Ring",
    hindiName: "Lehsunia Ring",
    slug: "cats-eye-ring-",
    planet: "Ketu",
    planetShort: "Ring",
    properties: "Silver Protective Band",
    startingPrice: "₹10,500",
    priceSubtitle: "complete ring",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113993914-206345424.webp",
    fallbackImage: CatsEyeImg,
    category: "jewelry",
    purpose: ["protection", "mental-peace"],
  },
  {
    itemType: "jewelry",
    subType: "ring",
    name: "Hessonite Ring",
    hindiName: "Gomed Ring",
    slug: "hessonite-rings-",
    planet: "Rahu",
    planetShort: "Ring",
    properties: "Ashtadhatu / Silver Setting",
    startingPrice: "₹10,500",
    priceSubtitle: "complete ring",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784114024103-193320797.webp",
    fallbackImage: HessoniteImg,
    category: "jewelry",
    purpose: ["career", "protection"],
  },
  {
    itemType: "jewelry",
    subType: "ring",
    name: "Opal Ring",
    hindiName: "Doodhiya Ring",
    slug: "opal-rings",
    planet: "Venus (Shukra)",
    planetShort: "Ring",
    properties: "Designer Silver Solitaire",
    startingPrice: "₹8,500",
    priceSubtitle: "complete ring",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784114083607-324046376.webp",
    fallbackImage: PearlImg,
    category: "jewelry",
    purpose: ["wealth", "marriage"],
  },

  // ─── GEMSTONE JEWELLERY: PENDANTS ───
  {
    itemType: "jewelry",
    subType: "pendant",
    name: "Yellow Sapphire Pendant",
    hindiName: "Pukhraj Locket",
    slug: "yellow-sapphire-pendant",
    planet: "Jupiter (Brihaspati)",
    planetShort: "Pendant",
    properties: "Open Pranic Transmission",
    startingPrice: "₹16,500",
    priceSubtitle: "with locket frame",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784117010318-145675788.webp",
    fallbackImage: YellowSapphireImg,
    category: "jewelry",
    purpose: ["wealth", "career"],
  },
  {
    itemType: "jewelry",
    subType: "pendant",
    name: "Emerald Pendant",
    hindiName: "Panna Locket",
    slug: "emerald-pendant",
    planet: "Mercury (Budh)",
    planetShort: "Pendant",
    properties: "Skin Contact Filigree Cage",
    startingPrice: "₹15,000",
    priceSubtitle: "with locket frame",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784117043583-960771548.webp",
    fallbackImage: EmeraldImg,
    category: "jewelry",
    purpose: ["career", "wealth"],
  },
  {
    itemType: "jewelry",
    subType: "pendant",
    name: "Blue Sapphire Pendant",
    hindiName: "Neelam Locket",
    slug: "blue-sapphire-pendant",
    planet: "Saturn (Shani)",
    planetShort: "Pendant",
    properties: "Pranic Chakra Alignment",
    startingPrice: "₹18,000",
    priceSubtitle: "with locket frame",
    image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784117060167-355938531.webp",
    fallbackImage: BlueSapphireImg,
    category: "jewelry",
    purpose: ["career", "protection"],
  },
];

const BEST_SELLING_JEWELRY_DATA = {
  rings: [
    {
      name: "Emerald Rings",
      subtitle: "Panna Gold & Silver Astrological Rings",
      slug: "emerald-rings",
      startingPrice: "₹14,200",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113852237-906793657.webp",
      fallbackImage: EmeraldImg,
      tag: "Mercury",
    },
    {
      name: "Yellow Sapphire Rings",
      subtitle: "Pukhraj 18K Gold Solitaire Rings",
      slug: "yellow-sapphire-rings",
      startingPrice: "₹16,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113867320-663376616.webp",
      fallbackImage: YellowSapphireImg,
      tag: "Jupiter",
    },
    {
      name: "Blue Sapphire Rings",
      subtitle: "Neelam Royal Crown Astrological Rings",
      slug: "blue-sapphire-rings",
      startingPrice: "₹18,000",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113887256-25721453.webp",
      fallbackImage: BlueSapphireImg,
      tag: "Saturn",
    },
    {
      name: "Ruby Rings",
      subtitle: "Manik Imperial Gold Solitaire Rings",
      slug: "ruby-rings",
      startingPrice: "₹15,800",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113912210-999703630.webp",
      fallbackImage: RubyImg,
      tag: "Sun",
    },
    {
      name: "Pearl Rings",
      subtitle: "Moti Pure Silver Astrological Rings",
      slug: "pearl-rings",
      startingPrice: "₹8,200",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113930874-49732152.webp",
      fallbackImage: PearlImg,
      tag: "Moon",
    },
  ],
  earrings: [
    {
      name: "Natural Emerald Stud Earrings",
      subtitle: "18K Gold Screw-Back Setting",
      slug: "emerald-rings",
      startingPrice: "₹14,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113852237-906793657.webp",
      fallbackImage: EmeraldImg,
      tag: "Mercury",
    },
    {
      name: "Natural Blue Sapphire Solitaire Studs",
      subtitle: "Platinum / White Gold Bezel",
      slug: "blue-sapphire-rings",
      startingPrice: "₹18,000",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113887256-25721453.webp",
      fallbackImage: BlueSapphireImg,
      tag: "Saturn",
    },
    {
      name: "Natural Yellow Sapphire Drop Earrings",
      subtitle: "18K Yellow Gold Hallmarked",
      slug: "yellow-sapphire-rings",
      startingPrice: "₹16,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113867320-663376616.webp",
      fallbackImage: YellowSapphireImg,
      tag: "Jupiter",
    },
    {
      name: "Natural Ruby Floral Cluster Earrings",
      subtitle: "Diamond Accent Petals",
      slug: "ruby-rings",
      startingPrice: "₹19,000",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113912210-999703630.webp",
      fallbackImage: RubyImg,
      tag: "Sun",
    },
    {
      name: "Natural Pearl Classic Dangle Earrings",
      subtitle: "925 Pure Sterling Silver",
      slug: "pearl-rings",
      startingPrice: "₹7,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113930874-49732152.webp",
      fallbackImage: PearlImg,
      tag: "Moon",
    },
  ],
  pendants: [
    {
      name: "Natural Yellow Sapphire Vedic Locket",
      subtitle: "Open-Back Pranic Chakra Conduit",
      slug: "yellow-sapphire-pendant",
      startingPrice: "₹16,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784117010318-145675788.webp",
      fallbackImage: YellowSapphireImg,
      tag: "Jupiter (Brihaspati)",
    },
    {
      name: "Natural Emerald Filigree Astrological Pendant",
      subtitle: "Direct Skin Contact Gold Cage",
      slug: "emerald-pendant",
      startingPrice: "₹15,000",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784117043583-960771548.webp",
      fallbackImage: EmeraldImg,
      tag: "Mercury (Budh)",
    },
    {
      name: "Natural Blue Sapphire Royal Crown Pendant",
      subtitle: "Pranic Chakra Alignment Locket",
      slug: "blue-sapphire-pendant",
      startingPrice: "₹18,000",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784117060167-355938531.webp",
      fallbackImage: BlueSapphireImg,
      tag: "Saturn (Shani)",
    },
    {
      name: "Natural Ruby Surya Tejas Gold Pendant",
      subtitle: "Sun Power Vitality Amulet",
      slug: "ruby-rings",
      startingPrice: "₹17,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113912210-999703630.webp",
      fallbackImage: RubyImg,
      tag: "Sun (Surya)",
    },
    {
      name: "Natural Pearl Chandra Shanti Silver Pendant",
      subtitle: "Emotional Calm & Mental Peace",
      slug: "pearl-rings",
      startingPrice: "₹8,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113930874-49732152.webp",
      fallbackImage: PearlImg,
      tag: "Moon (Chandra)",
    },
  ],
  wedding: [
    {
      name: "Natural Yellow Sapphire & Diamond Eternity Band",
      subtitle: "18K Gold Auspicious Wedding Ring",
      slug: "yellow-sapphire-rings",
      startingPrice: "₹26,000",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113867320-663376616.webp",
      fallbackImage: YellowSapphireImg,
      tag: "Auspicious",
    },
    {
      name: "Natural Emerald Bridal Solitaire Ring",
      subtitle: "Handcrafted Luxury Gold Setting",
      slug: "emerald-rings",
      startingPrice: "₹28,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113852237-906793657.webp",
      fallbackImage: EmeraldImg,
      tag: "Bridal",
    },
    {
      name: "Natural Blue Sapphire Classic Couple Band",
      subtitle: "Platinum / 18K White Gold",
      slug: "blue-sapphire-rings",
      startingPrice: "₹31,000",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113887256-25721453.webp",
      fallbackImage: BlueSapphireImg,
      tag: "Couple Band",
    },
    {
      name: "Natural Ruby Royal Heritage Wedding Ring",
      subtitle: "Traditional Vintage Kundan Detailing",
      slug: "ruby-rings",
      startingPrice: "₹27,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113912210-999703630.webp",
      fallbackImage: RubyImg,
      tag: "Heritage",
    },
    {
      name: "Natural Pearl & Diamond Halo Wedding Band",
      subtitle: "Pure Silver & 14K Gold",
      slug: "pearl-rings",
      startingPrice: "₹15,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113930874-49732152.webp",
      fallbackImage: PearlImg,
      tag: "Eternity",
    },
  ],
  bracelets: [
    {
      name: "Navratna Nine Planets Energy Bracelet",
      subtitle: "Complete 9 Vedic Gemstones in Silver",
      slug: "yellow-sapphire-rings",
      startingPrice: "₹12,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113867320-663376616.webp",
      fallbackImage: YellowSapphireImg,
      tag: "Navratna",
    },
    {
      name: "Natural Emerald Beaded Tennis Bracelet",
      subtitle: "Adjustable 18K Gold Clasp",
      slug: "emerald-rings",
      startingPrice: "₹19,000",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113852237-906793657.webp",
      fallbackImage: EmeraldImg,
      tag: "Mercury",
    },
    {
      name: "Natural Blue Sapphire Royal Charm Bracelet",
      subtitle: "Sterling Silver Astral Chain",
      slug: "blue-sapphire-rings",
      startingPrice: "₹16,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113887256-25721453.webp",
      fallbackImage: BlueSapphireImg,
      tag: "Saturn",
    },
    {
      name: "Natural Ruby & Gold Kundli Kada",
      subtitle: "Traditional Astrological Bangle",
      slug: "ruby-rings",
      startingPrice: "₹29,000",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113912210-999703630.webp",
      fallbackImage: RubyImg,
      tag: "Sun",
    },
    {
      name: "Natural Pearl Chandra Mala Bracelet",
      subtitle: "Organic South Sea Pearls",
      slug: "pearl-rings",
      startingPrice: "₹9,500",
      image: "https://api.gemrishi.com/public/uploads/subCategoryImg-1784113930874-49732152.webp",
      fallbackImage: PearlImg,
      tag: "Moon",
    },
  ],
};

const GEMSTONE_OPTIONS = [
  { name: "Yellow Sapphire (Pukhraj)", slug: "yellow-sapphire" },
  { name: "Blue Sapphire (Neelam)", slug: "blue-sapphire" },
  { name: "Emerald (Panna)", slug: "emerald" },
  { name: "Ruby (Manik)", slug: "ruby" },
  { name: "Pearl (Moti)", slug: "pearl" },
  { name: "Red Coral (Moonga)", slug: "red-coral" },
  { name: "Hessonite (Gomed)", slug: "hessonite" },
  { name: "Cat's Eye (Lehsunia)", slug: "cats-eye" },
  { name: "White Sapphire / Opal", slug: "white-sapphire" },
];

const PURPOSE_OPTIONS = [
  { name: "Wealth & Prosperity", slug: "wealth" },
  { name: "Career & Business Growth", slug: "career" },
  { name: "Marriage & Relationships", slug: "marriage" },
  { name: "Health & Vitality", slug: "health" },
  { name: "Mental Peace & Calm", slug: "mental-peace" },
  { name: "Protection & Dosha Relief", slug: "protection" },
];

// 10Cs Interactive Guide Data inspired by Gemfields Buyer's Guide, styled in GemRishi Luxury Emerald & Platinum
const TEN_CS_DATA = [
  {
    id: "colour",
    number: "01",
    title: "Colour",
    tagline: "The Soul & Planetary Vibration of Coloured Gems",
    summary:
      "Unlike white diamonds where colourlessness is prized, colour is the paramount factor when valuing and appreciating coloured gemstones. In Vedic astrology, pure and vibrant planetary colour channels cosmic rays directly into your aura.",
    pillarItems: [
      {
        title: "Hue",
        desc: "The primary color of the gemstone along with subtle secondary undertones (e.g. vivid royal blue vs greenish-blue sapphire).",
      },
      {
        title: "Tone",
        desc: "The relative lightness or darkness of the stone on a scale from very light to very dark. Optimal astrological stones fall in medium to medium-dark tone.",
      },
      {
        title: "Saturation",
        desc: "The purity, intensity, and vivid strength of the color without brown or grey masks. Higher saturation commands exceptional rarity.",
      },
    ],
    vedicTip:
      "Astrological gemology prioritizes natural, unheated color saturation over artificial brilliance created by glass-filling or thermal cooking.",
    sampleImage: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677184844-690209034.webp",
    badgeColor: "from-emerald-900 to-[#1b3d33]",
  },
  {
    id: "clarity",
    number: "02",
    title: "Clarity",
    tagline: "Nature's Unique Fingerprint — The 'Jardin'",
    summary:
      "Natural gemstones are born deep in tectonic crucible matrices. Inclusions (internal crystals, liquid veils, silk needles) are nature's guarantee of 100% natural, untreated origin. In emeralds, this internal garden is celebrated as the 'Jardin'.",
    pillarItems: [
      {
        title: "Eye-Clean vs Included",
        desc: "High astrological clarity allows light to travel unimpeded through the stone into your body while maintaining genuine natural matrix crystals.",
      },
      {
        title: "The 'Jardin' Matrix",
        desc: "Microscopic inclusions authenticate genuine earth-mined gems and prove the absence of lab-grown factory synthesis or glass fillings.",
      },
      {
        title: "Untreated Purity",
        desc: "Beware of chemically glass-filled or heavily oiled stones sold in ordinary bazaars that mask fractures and nullify astrological effects.",
      },
    ],
    vedicTip:
      "A natural inclusion is proof of earth's creation. Never mistake natural character inclusions for factory defects.",
    sampleImage: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677768161-784237619.webp",
    badgeColor: "from-rose-950 to-[#264A3F]",
  },
  {
    id: "cut",
    number: "03",
    title: "Cut",
    tagline: "Proportion, Symmetry & Maximum Light Transmission",
    summary:
      "Cutting coloured gems is an art that preserves both carat weight and maximizes color depth and brilliance. For astrological rings and pendants, an open-back setting ensures the light filtered through the cut facets directly touches the skin.",
    pillarItems: [
      {
        title: "Symmetry & Faceting",
        desc: "Well-proportioned facets bounce light internally (scintillation) rather than allowing light to 'window' or leak out through the bottom.",
      },
      {
        title: "Classic Shapes",
        desc: "Cushion, Oval, Emerald Cut (Octagon), Round, and Pear shapes are meticulously faceted to balance beauty and planetary cosmic radiation.",
      },
      {
        title: "Open-Back Skin Contact",
        desc: "Astrological jewelry requires open-back settings so the culet facet directly contacts your finger for continuous pranic absorption.",
      },
    ],
    vedicTip:
      "GemRishi craftsmen custom-fabricate gold and silver settings engineered specifically for open-back skin contact.",
    sampleImage: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677210658-442401792.webp",
    badgeColor: "from-emerald-950 to-[#264A3F]",
  },
  {
    id: "carat",
    number: "04",
    title: "Carat",
    tagline: "Weight, Density & Astrological Sizing",
    summary:
      "One metric carat equals 0.20 grams (or approx 1.1 ratti). Because different gemstone species have different specific gravities (densities), a 2-carat emerald looks visually larger than a 2-carat ruby or sapphire of the same weight.",
    pillarItems: [
      {
        title: "Carat vs Ratti",
        desc: "In India, Vedic astrologers often prescribe gemstones in Ratti (1 Ratti = 0.91 Carat). Always clarify whether a quote is in Carats or Ratti.",
      },
      {
        title: "Density Differences",
        desc: "Corundum (Sapphire/Ruby) has high density (approx 4.0), while Beryl (Emerald) has lower density (approx 2.7), giving emeralds a larger face-up spread.",
      },
      {
        title: "Body Weight Formula",
        desc: "General Vedic guideline recommends approx 1 Ratti for every 10–12 kg of body weight, calibrated with your Kundli planetary placement.",
      },
    ],
    vedicTip:
      "Use GemRishi's built-in Carat-to-Ratti converter to ensure you purchase the precise astrological weight recommended for your horoscope.",
    sampleImage: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677228630-170316570.webp",
    badgeColor: "from-blue-950 to-[#264A3F]",
  },
  {
    id: "character",
    number: "05",
    title: "Character",
    tagline: "Mine Origin, Geological Story & Individuality",
    summary:
      "Every natural gemstone carries a unique geological autobiography written over 50 to 500 million years. Famous historical origins like Ceylon (Sri Lanka), Burma (Myanmar), Zambia, Colombia, and Kashmir carry distinct trace mineral signatures and cultural prestige.",
    pillarItems: [
      {
        title: "Geographic Terroir",
        desc: "Trace elements like Chromium (in Colombian/Zambian emeralds and Burmese rubies) and Titanium (in Ceylon sapphires) give each origin distinct character.",
      },
      {
        title: "Unheated Rarity",
        desc: "Less than 1% of the world's finest gemstones emerge from the earth with natural perfection requiring zero heat enhancement.",
      },
      {
        title: "One-of-a-Kind Legacy",
        desc: "No two natural gemstones in the universe are identical. Your gemstone is an irreplaceable piece of earth's ancient geological history.",
      },
    ],
    vedicTip:
      "At GemRishi, we trace each gemstone directly to ethical mining sources, ensuring unblemished positive cosmic resonance.",
    sampleImage: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783678951982-329794568.webp",
    badgeColor: "from-emerald-950 to-[#1b3d33]",
  },
  {
    id: "certification",
    number: "06",
    title: "Certification",
    tagline: "Independent Scientific Verification & Lab Reports",
    summary:
      "A genuine laboratory certificate from recognized gemological authorities is your ultimate guarantee of authenticity. Reputable labs like IGI, GIA, GTL, and GII perform advanced spectroscopy to confirm natural origin and the absence of thermal treatments.",
    pillarItems: [
      {
        title: "Verifiable Digital QR",
        desc: "Every GemRishi certificate features an instant QR code linking to the testing laboratory's official online archive database.",
      },
      {
        title: "Origin & Treatment Declaration",
        desc: "Certificates explicitly declare 'Natural' status and state 'No Evidence of Heat / Glass Enhancement' for astrological purity.",
      },
      {
        title: "Laser Inscription & Photo",
        desc: "Detailed micro-photographs, weight to 3 decimal places, dimensions, and color nomenclature protect your investment.",
      },
    ],
    vedicTip:
      "Never buy a gemstone without a third-party testing certificate. GemRishi includes original verifiable lab certificates with every single order.",
    sampleImage: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677825105-830137633.webp",
    badgeColor: "from-teal-950 to-[#264A3F]",
  },
  {
    id: "confidence",
    number: "07",
    title: "Confidence & Care",
    tagline: "Vedic Consecration, Lifetime Custody & Safe Care",
    summary:
      "Buying a sacred gemstone is a lifelong relationship. GemRishi empowers your journey with authentic Vedic Pran Pratishtha (energization ritual), a 10-day inspection guarantee, insured doorstep shipping, and lifelong gemstone care guidance.",
    pillarItems: [
      {
        title: "Vedic Pran Pratishtha",
        desc: "Our Vedic scholars can energize and chant Vedic mantras on your gemstone before dispatch, preparing it for auspicious initial wearing.",
      },
      {
        title: "10-Day Inspection Period",
        desc: "Take 10 full days to inspect your gemstone and certificate with your local astrologer or gemologist with complete peace of mind.",
      },
      {
        title: "Insured Transit",
        desc: "100% insured delivery in tamper-evident sealed packaging across 19,000+ pin codes in India and international destinations.",
      },
    ],
    vedicTip:
      "Store gemstones separately in soft velvet pouches away from direct perfumes and harsh chemicals to preserve planetary lustre.",
    sampleImage: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677798846-445624496.webp",
    badgeColor: "from-emerald-950 to-[#264A3F]",
  },
  {
    id: "origin",
    number: "08",
    title: "Country & Origin",
    tagline: "Geographic Provenance, Mineral Lineage & Astrological Potency",
    summary:
      "A gemstone's geographic origin is its geological birthplace. Classical Vedic texts and modern gemology both recognize that specific mineral mines produce superior crystalline purity and cosmic resonance — from Ceylon (Sri Lanka) and Burma (Myanmar) to Zambia and Colombia.",
    pillarItems: [
      {
        title: "Ceylon (Sri Lanka)",
        desc: "World-renowned for royal blue and cornflower sapphires, yellow sapphires (Pukhraj), and alexandrites with crystalline clarity and high luster.",
      },
      {
        title: "Burma (Myanmar)",
        desc: "Historic source of unheated 'Pigeon Blood' rubies and supreme imperial spinels with deep chromium fluorescence.",
      },
      {
        title: "Zambia & Colombia",
        desc: "Premier sources for lush saturated green emeralds. Zambian stones offer exceptional eye-clarity and deep bluish-green saturation.",
      },
    ],
    vedicTip:
      "Ceylon sapphires and Zambian emeralds are celebrated in Vedic astrology for their energetic clarity and potent planetary vibrations.",
    sampleImage: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677247454-950055646.webp",
    badgeColor: "from-cyan-950 to-[#1b3d33]",
  },
  {
    id: "treatment",
    number: "09",
    title: "Cure-Treatment & Enhancement",
    tagline: "Untreated vs Heated, Beryllated & Glass-Filled Disclosures",
    summary:
      "Gemstone enhancements range from traditional cedarwood oiling in emeralds to severe high-temperature cooking, beryllium diffusion, and lead-glass fracture filling. For Vedic astrological therapy, only 100% natural, unheated, un-diffused gemstones channel planetary energy.",
    pillarItems: [
      {
        title: "100% Unheated / Untreated",
        desc: "Mined from earth and simply cut/polished without thermal cooking. Mandatory for maximum Vedic astrological and Kundli results.",
      },
      {
        title: "Heat Treatment (Standard Commercial)",
        desc: "Thermal treatment used to alter color or melt rutile silk in commercial jewelry. GemRishi explicitly marks and certifies treated vs untreated gems.",
      },
      {
        title: "Glass-Filled & Dye Warnings",
        desc: "Low-grade heavily fractured stones injected with lead glass or dyes. These have ZERO astrological potency and should never be used for healing.",
      },
    ],
    vedicTip:
      "Always demand an independent lab certificate that clearly reads: 'No Indications of Thermal Enhancement / No Glass Infilling'.",
    sampleImage: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677768161-784237619.webp",
    badgeColor: "from-amber-950 to-[#264A3F]",
  },
  {
    id: "cost",
    number: "10",
    title: "Cost & Rarity",
    tagline: "Transparent Mine-to-Market Valuation & Carat Multipliers",
    summary:
      "Coloured gemstone pricing is driven by geometric rarity curves: as carat weight doubles with fine color and eye-clean clarity, the price per carat multiplies exponentially. GemRishi eliminates middleman markups through direct ethical mine sourcing.",
    pillarItems: [
      {
        title: "Per-Carat Pricing Curve",
        desc: "A 4-carat unheated sapphire or emerald is far rarer than two 2-carat stones combined, creating an exponential value curve for large specimen gems.",
      },
      {
        title: "Origin & Rarity Multiplier",
        desc: "A certified unheated Burmese ruby or Kashmir sapphire commands a substantial historic premium over other commercial localities.",
      },
      {
        title: "Direct Mine-to-Market Value",
        desc: "By bypassing traditional layers of brokers and wholesale bazaars, GemRishi delivers fair, certified luxury pricing directly to buyers.",
      },
    ],
    vedicTip:
      "Invest in natural unheated quality and clarity over massive carat size when purchasing for Vedic astrological balancing.",
    sampleImage: "https://api.gemrishi.com/public/uploads/subCategoryImg-1783677210658-442401792.webp",
    badgeColor: "from-emerald-950 to-[#264A3F]",
  },
];

const SEVEN_CS_DATA = TEN_CS_DATA;

const ORIGIN_SHOWCASE_DATA = [
  { id: "ceylon", name: "Ceylon (Sri Lanka)", gem: "Blue & Yellow Sapphire", desc: "Renowned for crystal transparency, velvety cornflower blues, and high astrological conductivity." },
  { id: "burma", name: "Burma (Myanmar)", gem: "Pigeon Blood Ruby & Spinel", desc: "Benchmark for deep crimson color and strong chromium fluorescence, commanding the highest collector prestige." },
  { id: "zambia", name: "Zambia (Kagem)", gem: "Deep Emerald", desc: "Prized for rich saturated bluish-green tones, outstanding clarity, and durable crystal composition." },
  { id: "colombia", name: "Colombia (Muzo)", gem: "Vivid Glow Emerald", desc: "Historic pure emerald green with low iron content, creating an unmatched internal glow." },
];

const TREATMENT_SHOWCASE_DATA = [
  { id: "natural", status: "100% Natural Unheated", grade: "Astrological Grade", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", effect: "Optimal planetary resonance & unhindered cosmic conductivity directly to aura." },
  { id: "heated", status: "Thermally Baked / Heated", grade: "Commercial Fashion", badge: "bg-gray-500/20 text-gray-300 border-gray-500/40", effect: "High heat alters crystalline structure, severely diminishing astrological planetary effectiveness." },
  { id: "glass", status: "Lead-Glass Filled / Resin", grade: "Avoid for Jyotish", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40", effect: "Synthetic glass filler masks internal fractures; completely nullifies astrological value." },
];

const RARITY_SHOWCASE_DATA = [
  { id: "astrological", tier: "Astrological Investment Grade", pct: "< 1% of Mine Yield", desc: "100% unheated natural stones with high color saturation and unblemished crystal purity." },
  { id: "fine", tier: "Fine Jewelry Grade", pct: "Top 5-10% Yield", desc: "Good color with pleasing eye clarity; standard commercial trade stones." },
  { id: "commercial", tier: "Commercial Treated Grade", pct: "90% Market Yield", desc: "Heavily included stones that require artificial heat or glass infusion." },
];

const CUT_SHAPES_DATA = [
  { name: "Emerald Cut (Octagon)", desc: "Step-cut elegance, reveals crystal purity & color depth.", shape: "octagon" },
  { name: "Oval Cut", desc: "Maximizes carat spread and brilliance, popular for astrological rings.", shape: "oval" },
  { name: "Cushion Cut", desc: "Soft pillowed corners with royal heritage and high fire.", shape: "cushion" },
  { name: "Round Brilliant", desc: "Maximum light reflection and classic timeless symmetry.", shape: "round" },
  { name: "Pear Shape", desc: "Teardrop beauty, elongates fingers and ideal for pendants.", shape: "pear" },
  { name: "Marquise Cut", desc: "Dramatic boat shape with intense concentrated light return.", shape: "marquise" },
];

const FAQS = [
  {
    q: "How do I ensure the gemstone I buy online is 100% genuine and unheated?",
    a: "Always insist on an independent testing certificate from a reputable gemological lab such as IGI, GIA, GTL, or GII. The certificate must explicitly state 'Natural' and 'No Evidence of Thermal Treatment / Glass Filling'. At GemRishi, every gemstone comes with an original verifiable lab certificate featuring a scannable QR code.",
  },
  {
    q: "What is the difference between buying gemstones online vs in a local retail store?",
    a: "Buying gemstones online from a specialized brand like GemRishi gives you direct access to certified, unheated natural stones sourced directly from mines (Ceylon, Burma, Zambia) without traditional retail middleman markups. You also receive HD video proof, certified lab reports, custom jewelry fabrication, and 10-day return guarantees that local jewelers rarely offer.",
  },
  {
    q: "What is Vedic Pran Pratishtha (Energization) and why is it important?",
    a: "Vedic Energization is a sacred consecration process where certified Vedic Pandits perform specialized poojas, chant planetary Beej Mantras, and purify the gemstone with raw cow's milk and holy Ganga Jal in your name and Gotra. This activates the stone's latent cosmic energy before you wear it. GemRishi provides this service completely free of charge.",
  },
  {
    q: "How is the correct gemstone carat or ratti weight calculated?",
    a: "In Vedic astrology, a standard guideline is 1 Ratti for every 10–12 kg of body weight (e.g., a person weighing 60 kg typically wears between 5.5 and 6.5 Ratti). However, the planetary strength in your birth chart (Kundli) also plays a crucial role. We recommend consulting our free Astrologer Recommendation tool or speaking with our experts.",
  },
  {
    q: "Why do astrological rings require an open-back design?",
    a: "Astrological gemstones work by absorbing and transmitting cosmic light waves directly into your body. An open-back ring or pendant allows the bottom facet of the gemstone to continuously touch your skin, ensuring uninterrupted planetary energy transfer.",
  },
  {
    q: "What is GemRishi's return and inspection policy?",
    a: "We offer a 10-day hassle-free return and exchange policy. Once you receive your parcel, you or your personal astrologer have 10 full days to inspect the gemstone and its lab certificate. If you are not completely satisfied, you can return it in its original condition for a prompt refund or exchange.",
  },
];

const rawUrl = import.meta.env.VITE_URL;
const URL =
  rawUrl && rawUrl !== "undefined" && rawUrl !== ""
    ? rawUrl.replace(/\/+$/, "")
    : "https://www.gemrishi.com/api/v1";

const BuyGemstoneOnline = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [popularFilter, setPopularFilter] = useState("all");
  const [bestSellingJewelryTab, setBestSellingJewelryTab] = useState("rings");
  const [subcategories, setSubcategories] = useState([]);
  const [loadingGems, setLoadingGems] = useState(true);

  // 10Cs Interactive Guide State
  const [activeSevenCIndex, setActiveSevenCIndex] = useState(0);
  const [activeShapeIndex, setActiveShapeIndex] = useState(0);
  const [interactiveColorTone, setInteractiveColorTone] = useState("vivid"); // 'light' | 'vivid' | 'deep'
  const [activeOriginIndex, setActiveOriginIndex] = useState(0);
  const [activeTreatmentIndex, setActiveTreatmentIndex] = useState(0);
  const [activeRarityIndex, setActiveRarityIndex] = useState(0);
  const tenCsScrollRef = useRef(null);
  const gemSliderRef = useRef(null);
  const jewelrySliderRow1Ref = useRef(null);
  const jewelrySliderRow2Ref = useRef(null);

  const scrollTenCs = (direction) => {
    if (tenCsScrollRef.current) {
      tenCsScrollRef.current.scrollBy({
        left: direction === "left" ? -260 : 260,
        behavior: "smooth",
      });
    }
  };

  const scrollGemSlider = (direction) => {
    if (gemSliderRef.current) {
      const cardWidth = gemSliderRef.current.firstElementChild?.clientWidth || 280;
      gemSliderRef.current.scrollBy({
        left: direction === "left" ? -(cardWidth + 16) : cardWidth + 16,
        behavior: "smooth",
      });
    }
  };

  const scrollJewelryRow1 = (direction) => {
    if (jewelrySliderRow1Ref.current) {
      const cardWidth = jewelrySliderRow1Ref.current.firstElementChild?.clientWidth || 280;
      jewelrySliderRow1Ref.current.scrollBy({
        left: direction === "left" ? -(cardWidth + 16) : cardWidth + 16,
        behavior: "smooth",
      });
    }
  };

  const scrollJewelryRow2 = (direction) => {
    if (jewelrySliderRow2Ref.current) {
      const cardWidth = jewelrySliderRow2Ref.current.firstElementChild?.clientWidth || 280;
      jewelrySliderRow2Ref.current.scrollBy({
        left: direction === "left" ? -(cardWidth + 16) : cardWidth + 16,
        behavior: "smooth",
      });
    }
  };

  // Fetch live subcategories/products data from backend database
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        let res;
        try {
          res = await axios.get(`${URL}/subcategory/get-subcategories`);
        } catch {
          res = await axios.get("https://gemrishi.com/api/v1/subcategory/get-subcategories");
        }
        if (res.data && Array.isArray(res.data.subcategories)) {
          setSubcategories(res.data.subcategories);
        }
      } catch (err) {
        console.error("Error fetching live subcategory details:", err);
      } finally {
        setLoadingGems(false);
      }
    };
    fetchSubcategories();
  }, []);

  // Widget State
  const [searchTab, setSearchTab] = useState("gemstone"); // 'gemstone' | 'purpose'
  const [selectedGemstone, setSelectedGemstone] = useState("yellow-sapphire");
  const [selectedPurpose, setSelectedPurpose] = useState("wealth");
  const [weightUnit, setWeightUnit] = useState("carat"); // 'carat' | 'ratti'
  const [selectedWeightRange, setSelectedWeightRange] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");

  // Merge static metadata with live database details
  const getMergedGemstone = (gem) => {
    if (gem.itemType === "jewelry") {
      return {
        ...gem,
        targetUrl: `/jewelry/${gem.slug}`,
        fallbackImage: gem.fallbackImage || gem.image,
      };
    }

    const liveMatch = subcategories.find((sub) => {
      const subSlug = (sub.slug || "").toLowerCase().trim().replace(/^-+|-+$/g, "");
      const gemSlug = gem.slug.toLowerCase().trim().replace(/^-+|-+$/g, "");
      const subName = (sub.name || "").toLowerCase().trim();
      const gemName = gem.name.toLowerCase().trim();
      return (
        subSlug === gemSlug ||
        subSlug.includes(gemSlug) ||
        gemSlug.includes(subSlug) ||
        subName === gemName ||
        subName.includes(gemName) ||
        gemName.includes(subName) ||
        (gem.hindiName && subName.includes(gem.hindiName.toLowerCase()))
      );
    });

    const activeSlug = liveMatch?.slug || gem.slug;

    let photo = gem.image;
    if (liveMatch?.image?.url) {
      const imgUrl = liveMatch.image.url;
      photo = imgUrl.startsWith("http")
        ? imgUrl
        : `${URL}${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;
    }

    let startingPrice = gem.startingPrice;
    if (liveMatch?.products && Array.isArray(liveMatch.products) && liveMatch.products.length > 0) {
      const validPrices = liveMatch.products
        .map((p) => Number(p.price))
        .filter((p) => !isNaN(p) && p > 0);
      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        startingPrice = `₹${minPrice.toLocaleString("en-IN")}`;
      }
    }

    return {
      ...gem,
      slug: activeSlug,
      targetUrl: `/gemstone/${activeSlug}`,
      image: photo,
      fallbackImage: gem.fallbackImage || gem.image,
      startingPrice,
      liveMatch,
    };
  };

  const filteredPopularGems = POPULAR_GEMSTONES.map(getMergedGemstone).filter((gem) => {
    if (popularFilter === "all") return true;
    if (popularFilter === "gemstone") return gem.itemType === "gemstone";
    if (popularFilter === "ring") return gem.itemType === "jewelry" && gem.subType === "ring";
    if (popularFilter === "pendant") return gem.itemType === "jewelry" && gem.subType === "pendant";
    if (popularFilter === "precious") return gem.category === "precious";
    if (popularFilter === "semi-precious") return gem.category === "semi-precious";
    if (popularFilter === "wealth") return gem.purpose?.includes("wealth") || gem.purpose?.includes("career");
    if (popularFilter === "peace") return gem.purpose?.includes("mental-peace") || gem.purpose?.includes("health");
    return true;
  });

  const handleWidgetSearch = (e) => {
    e.preventDefault();
    if (searchTab === "gemstone") {
      let url = `/gemstone/${selectedGemstone}`;
      if (selectedWeightRange || selectedPriceRange) {
        url = `/gemstone/filter/${selectedGemstone}?subcategory=${encodeURIComponent(selectedGemstone)}`;
        if (selectedWeightRange) {
          const [minC, maxC] = selectedWeightRange.split("-");
          if (minC) url += `&minCarat=${minC}`;
          if (maxC) url += `&maxCarat=${maxC}`;
        }
        if (selectedPriceRange) {
          url += `&maxPrice=${selectedPriceRange}`;
        }
      }
      navigate(url);
    } else {
      navigate(`/gemstone/purpose/${selectedPurpose}`);
    }
  };

  const activeC = SEVEN_CS_DATA[activeSevenCIndex];

  return (
    <div className="w-full bg-[#FEFEFD] text-[#1F2937] font-sans selection:bg-[#264A3F] selection:text-white">
      {/* Helmet SEO Tags */}
      <Helmet>
        <title>Buy Gemstones Online at GemRishi: Choose Your Authentic Gemstones Here</title>
        <meta
          name="description"
          content="Buy 100% natural, lab-certified & energized gemstones online at GemRishi. Discover the 10Cs of coloured gemstones, transparent pricing, insured delivery across India, and clear return policies."
        />
        <meta
          name="keywords"
          content="buy gemstones online at gemrishi, 10cs gemstone guide, buy gemstones online, certified gemstones online, natural gemstones online india, buy pukhraj online, buy neelam online, gemstone return policy, authentic gemstones gemrishi"
        />
        <link rel="canonical" href="https://gemrishi.com/buy-gemstone-online" />
      </Helmet>



      {/* ─────────────────────────────────────────────────────────────────────────────
          H1 HERO BANNER SECTION (Luxury Vedic Authenticity Theme)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full min-h-[500px] sm:min-h-[550px] lg:min-h-[600px] flex items-center justify-center px-4 pt-14 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 lg:pt-20 lg:pb-24 text-center overflow-hidden border-t border-b border-emerald-500/25 shadow-xl bg-[#0f2820] bg-cover bg-bottom bg-no-repeat"
        style={{
          backgroundImage: `url(${VedicGemstoneHeroBg})`,
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
        }}
      >
        {/* Focused vignette for top text and cards while leaving bottom gemstone area completely clear & vibrant */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 95% 70% at 50% 48%, rgba(10, 32, 24, 0.85) 0%, rgba(10, 32, 24, 0.35) 60%, transparent 95%)"
          }}
        />



        {/* SVG Definition for Pure Whitish / Platinum Luminous Gradient */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="pureWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F9FAFB" />
              <stop offset="100%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
        </svg>

        <div className={`relative z-10 max-w-4xl mx-auto flex flex-col items-center px-4 sm:px-6`}>
          {/* Vedic Authenticity & Buying Guide Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a2219]/90 text-emerald-200 border border-emerald-400/40 text-[11px] sm:text-xs font-semibold mb-2.5 tracking-[0.14em] uppercase shadow-md">
            <BookOpen className="w-3.5 h-3.5 text-emerald-150" />
            100% Certified Vedic Gemstones & Buying Guide
          </div>

          {/* Luxury Serif Title */}
          <h1
            className="text-2xl sm:text-4xl md:text-5xl text-white font-normal leading-tight tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}
          >
            Buy Certified Gemstones online at <span className="text-[1.15em]">G</span>emRishi
          </h1>

          {/* 4 Vertical Feature Cards - Pure Whitish Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-5 w-full max-w-2xl md:max-w-3xl">
            {/* Card 1: 100% Lab Certified -> /certificate */}
            <Link
              to="/certificate"
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#092218]/85 backdrop-blur-md hover:bg-[#0c2c20] border border-emerald-400/25 hover:border-emerald-300/70 shadow-lg hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300 group text-center cursor-pointer hover:-translate-y-1"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mb-0.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] transition-transform duration-300 group-hover:scale-110">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="url(#pureWhiteGrad)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18h8" />
                  <path d="M3 22h18" />
                  <path d="M14 22a7 7 0 1 0 0-14h-1" />
                  <path d="M9 14h2" />
                  <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
                  <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white tracking-wide group-hover:text-emerald-100 transition-colors">Certified Gemstones</p>
              <p className="text-[10px] sm:text-[11px] text-gray-300 font-light">100% Lab Verified</p>
            </Link>

            {/* Card 2: Free Vedic Pooja -> Smooth Scroll to Vedic Pooja Section */}
            <button
              onClick={() => {
                const target = document.getElementById("vedic-pooja-section");
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#092218]/85 backdrop-blur-md hover:bg-[#0c2c20] border border-emerald-400/25 hover:border-emerald-300/70 shadow-lg hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300 group text-center cursor-pointer hover:-translate-y-1"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mb-0.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] transition-transform duration-300 group-hover:scale-110">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 48 48" fill="none">
                  <path d="M24 6l3 6 6-2-2 6 6 2-5 4 3 6-6-1-2 6-3-5-3 5-2-6-6 1 3-6-5-4 6-2-2-6 6 2 3-6z" fill="url(#pureWhiteGrad)" fillOpacity="0.18" stroke="url(#pureWhiteGrad)" strokeWidth="1.6" />
                  <circle cx="24" cy="18" r="5" stroke="url(#pureWhiteGrad)" strokeWidth="2" fill="url(#pureWhiteGrad)" fillOpacity="0.25" />
                  <path d="M16 38c0-5 3.5-9 8-9s8 4 8 9" stroke="url(#pureWhiteGrad)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M14 26l4 3 6-3 6 3 4-3" stroke="url(#pureWhiteGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M24 23v6" stroke="url(#pureWhiteGrad)" strokeWidth="2" />
                  <path d="M10 42c4-3 9-4 14-4s10 1 14 4H10z" fill="url(#pureWhiteGrad)" fillOpacity="0.25" stroke="url(#pureWhiteGrad)" strokeWidth="1.6" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white tracking-wide group-hover:text-emerald-100 transition-colors">Free Vedic Pooja</p>
              <p className="text-[10px] sm:text-[11px] text-gray-300 font-light">Pran Pratishtha Ritual</p>
            </button>

            {/* Card 3: Insured Shipping -> /shipping */}
            <Link
              to="/shipping"
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#092218]/85 backdrop-blur-md hover:bg-[#0c2c20] border border-emerald-400/25 hover:border-emerald-300/70 shadow-lg hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300 group text-center cursor-pointer hover:-translate-y-1"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mb-0.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] transition-transform duration-300 group-hover:scale-110">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 48 48" fill="none">
                  <rect x="14" y="16" width="10" height="10" rx="1" stroke="url(#pureWhiteGrad)" strokeWidth="2" fill="url(#pureWhiteGrad)" fillOpacity="0.18" />
                  <path d="M19 16v10M14 21h10" stroke="url(#pureWhiteGrad)" strokeWidth="1.6" />
                  <path d="M6 12h22v18H6V12z" stroke="url(#pureWhiteGrad)" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M28 18h8l5 6v6h-13v-12z" stroke="url(#pureWhiteGrad)" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="14" cy="34" r="4" stroke="url(#pureWhiteGrad)" strokeWidth="2" fill="#092218" />
                  <circle cx="35" cy="34" r="4" stroke="url(#pureWhiteGrad)" strokeWidth="2" fill="#092218" />
                  <path d="M6 30h4M18 30h13M39 30h4" stroke="url(#pureWhiteGrad)" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white tracking-wide group-hover:text-emerald-100 transition-colors">Insured Shipping</p>
              <p className="text-[10px] sm:text-[11px] text-gray-300 font-light">Doorstep Delivery</p>
            </Link>

            {/* Card 4: 10-Day Returns -> /return-policy */}
            <Link
              to="/return-policy"
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#092218]/85 backdrop-blur-md hover:bg-[#0c2c20] border border-emerald-400/25 hover:border-emerald-300/70 shadow-lg hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] transition-all duration-300 group text-center cursor-pointer hover:-translate-y-1"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mb-0.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] transition-transform duration-300 group-hover:scale-110">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4l2.5 4.5 5.1-1.3 1.1 5.2 4.9 1.8-.7 5.2 3.8 3.6-2.4 4.6 2.3 4.7-3.9 3.5.8 5.3-5 1.7-1 5.2-5.1-1.4L24 4l-2.5-4.5-5.1 1.3-1.1-5.2-4.9-1.8.7-5.2-3.8-3.6 2.4-4.6-2.3-4.7 3.9-3.5-.8-5.3 5-1.7 1-5.2 5.1 1.4L24 4z" stroke="url(#pureWhiteGrad)" strokeWidth="2" fill="url(#pureWhiteGrad)" fillOpacity="0.18" strokeLinejoin="round" />
                  <circle cx="24" cy="24" r="13" stroke="url(#pureWhiteGrad)" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x="24" y="23" textAnchor="middle" fill="url(#pureWhiteGrad)" fontSize="11" fontWeight="bold" fontFamily="sans-serif">10</text>
                  <text x="24" y="31" textAnchor="middle" fill="url(#pureWhiteGrad)" fontSize="6.5" fontWeight="600" letterSpacing="0.8" fontFamily="sans-serif">DAY</text>
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white tracking-wide group-hover:text-emerald-100 transition-colors">10-Day Returns</p>
              <p className="text-[10px] sm:text-[11px] text-gray-300 font-light">Inspection Period</p>
            </Link>
          </div>

          {/* Glowing Emerald CTA Action Button */}
          <div className="mt-9 sm:mt-11 lg:mt-14">
            <button
              onClick={() => {
                const target = document.getElementById("masterclass-section");
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-10 sm:px-12 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 text-white border border-emerald-300/35 text-sm sm:text-base font-extrabold tracking-[0.18em] uppercase shadow-[0_6px_20px_rgba(0,0,0,0.35)] hover:shadow-[0_0_30px_rgba(52,211,153,0.55)] hover:border-emerald-200 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>VIEW GUIDE</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION: WHY BUY NATURAL GEMSTONES?
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="masterclass-section" className={`py-12 sm:py-16 bg-[#F9FAF8] border-b border-gray-200/80 ${PADDING_CLASS}`}>
        <div className="max-w-[1400px] w-full mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
            <div className="w-full lg:w-1/2 space-y-3.5">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#264A3F]/10 text-[#264A3F] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Vedic Purity & Cosmic Power
              </div> */}
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight tracking-tight text-[#1C372F]"
                style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}
              >
                Why Buy Natural Gemstones?
              </h2>
              <p className="text-[#4B5563] text-lg sm:text-xl leading-[1.7] font-['Cormorant_Garamond'] font-medium tracking-wide">
                Natural gemstones are nature's rare geological marvels. Formed over millions of years under extreme heat and pressure in the Earth's mantle, their intact, unheated crystalline structure acts as a natural cosmic prism — absorbing, filtering, and transmitting specific planetary wavelengths directly into the human body.
              </p>
              <p className="text-[#4B5563] text-lg sm:text-xl leading-[1.7] font-['Cormorant_Garamond'] font-medium tracking-wide">
                In contrast, synthetic or glass-filled stones lack this organic crystalline resonance. When you invest in a certified 100% natural gemstone from GemRishi, you receive an authentic astrological talisman capable of removing planetary blockages, attracting wealth, enhancing intellect, and restoring emotional harmony.
              </p>
            </div>

            {/* Direct Gemstone Image (No nested card divs) */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <img
                src={NaturalGemstonesCollectionImg}
                alt="Natural Gemstones Collection - Diverse Cuts & Astrological Vibrancy at GemRishi"
                className="w-full h-auto max-h-[460px] object-contain select-none"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          POPULAR GEMSTONES AT GEMRISHI (Modern Zuno-Inspired Luxury Floating Cards)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className={`py-14 sm:py-20 bg-[#FAF8F5] border-t border-b border-stone-200/80 ${PADDING_CLASS}`}>
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Editorial Section Header with Category Tabs & Slide Navigation Controls */}
          <div className="space-y-6 border-b border-stone-200 pb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                {/* <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#264A3F]/10 border border-[#264A3F]/20 text-[#264A3F] text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-[#264A3F]" />
                  <span>Featured Certified Collection</span>
                </div> */}
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-normal leading-tight tracking-tight text-[#1C372F]"
                  style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}
                >
                  Featured Gemstones & Jewellery Collection at <span className="text-[1.12em]">G</span>emRishi
                </h2>

              </div>

              {/* Browse All Link */}
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to={popularFilter === "ring" || popularFilter === "pendant" ? "/jewelry" : "/gemstone"}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#264A3F] hover:text-[#173029] underline"
                >
                  <span>{popularFilter === "ring" || popularFilter === "pendant" ? "Browse All Jewellery" : "Browse All Gemstones"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Category Filter Pills (Gemstone vs Jewellery vs Rings vs Pendants) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "all", label: "All Collections" },
                { id: "gemstone", label: "Natural Gemstones" },
                { id: "ring", label: "Gemstone Rings" },
                { id: "pendant", label: "Gemstone Pendants" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPopularFilter(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer ${popularFilter === tab.id
                      ? "bg-[#264A3F] text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Smooth Horizontal Slider Track with Side Arrow Buttons and End Card */}
          <div className="relative group/slider">
            {/* Left Floating Arrow Button (Hidden on mobile, visible on sm+) */}
            <button
              type="button"
              onClick={() => scrollGemSlider("left")}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#1C372F] hover:text-white hover:bg-[#264A3F] border border-gray-200 shadow-xl items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
              title="Slide Left"
              aria-label="Slide left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Floating Arrow Click Button (Visible on mobile & desktop) */}
            <button
              type="button"
              onClick={() => scrollGemSlider("right")}
              className="flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#1C372F] hover:text-white hover:bg-[#264A3F] border border-gray-200 shadow-xl items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
              title="Slide Right"
              aria-label="Slide right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <div
              ref={gemSliderRef}
              className="flex gap-4 sm:gap-8 md:gap-10 overflow-x-auto scroll-smooth py-4 px-2 scrollbar-none snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filteredPopularGems.map((gem) => (
                <Link
                  key={`${gem.itemType}-${gem.slug}`}
                  to={gem.targetUrl}
                  className="group relative rounded-3xl overflow-hidden bg-gray-100 hover:bg-gray-200/70 border border-gray-200/90 shadow-2xs hover:shadow-xl transition-all duration-500 w-[calc(100vw-5rem)] max-w-[320px] sm:max-w-none sm:w-[260px] md:w-[270px] shrink-0 snap-center sm:snap-start h-[280px] sm:h-[300px] flex flex-col justify-between cursor-pointer"
                >
                  {/* Top Badge: Planet / Category / Jewellery Type */}
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 text-[10px] sm:text-xs font-semibold text-[#1C372F] tracking-wide shadow-2xs">
                    {gem.planetShort || (gem.itemType === "jewelry" ? (gem.subType === "ring" ? "Ring" : "Pendant") : (gem.category === "precious" ? "Precious" : "Semi-Precious"))}
                  </div>

                  {/* Top-Right Floating Bookmark / Save Button */}
                  <div className="absolute top-3 right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#264A3F] group-hover:bg-white group-hover:scale-105 transition-all duration-300">
                    <Bookmark className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#264A3F] transition-colors" />
                  </div>

                  {/* Center Gem / Jewellery Canvas covering full horizontal card space */}
                  <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none" />
                    <div className="absolute w-32 h-32 rounded-full bg-white/70 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                    <img
                      src={gem.image}
                      alt={`${gem.name} (${gem.hindiName})`}
                      loading="lazy"
                      onError={(e) => {
                        if (gem.fallbackImage && e.currentTarget.src !== gem.fallbackImage) {
                          e.currentTarget.src = gem.fallbackImage;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 ease-out"
                    />
                  </div>

                  {/* Bottom Floating White Overlay Card (Compact Zuno-Inspired) */}
                  <div className="p-3 sm:p-3.5 pt-0 w-full z-10">
                    <div className="w-full bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md border border-gray-100 flex items-center justify-between gap-2 group-hover:border-gray-200 transition-all duration-300">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-bold text-[#112922] group-hover:text-[#264A3F] transition-colors truncate">
                          {gem.name}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate mt-0.5">
                          {gem.hindiName ? `${gem.hindiName} • ` : ""}{gem.properties}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-[#112922] block">
                          {gem.startingPrice}
                        </span>
                        <span className="text-[9px] text-gray-400 font-medium block">
                          {gem.priceSubtitle || (gem.itemType === "jewelry" ? "complete ring" : "per carat")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* End Card with Right Arrow (->) linking to All Gemstones / Jewellery */}
              <Link
                to={popularFilter === "ring" || popularFilter === "pendant" ? "/jewelry" : "/gemstone"}
                className="group relative rounded-3xl overflow-hidden bg-white hover:bg-emerald-50/40 border-2 border-dashed border-gray-300 hover:border-[#264A3F] shadow-2xs hover:shadow-xl transition-all duration-500 w-[calc(100vw-5rem)] max-w-[320px] sm:max-w-none sm:w-[220px] shrink-0 snap-center sm:snap-start h-[280px] sm:h-[300px] flex flex-col items-center justify-center text-center p-5 cursor-pointer space-y-3.5"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#264A3F]/10 group-hover:bg-[#264A3F] text-[#264A3F] group-hover:text-white border border-[#264A3F]/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
                  <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-bold text-[#112922] group-hover:text-[#264A3F] transition-colors">
                    View All
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {popularFilter === "ring" || popularFilter === "pendant" ? "Explore Jewellery &rarr;" : "Explore Collection &rarr;"}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Bottom View More Pill Button */}
          <div className="flex justify-center pt-4 sm:pt-6">
            <Link
              to={popularFilter === "ring" || popularFilter === "pendant" ? "/jewelry" : "/gemstone"}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white border border-gray-600 font-bold text-xs sm:text-sm tracking-wide shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_0_24px_rgba(156,163,175,0.4)] hover:border-gray-400 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span>{popularFilter === "ring" || popularFilter === "pendant" ? "View All Jewellery" : "View More Gemstones"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ⭐ GEMFIELDS-INSPIRED 10Cs INTERACTIVE LUXURY GUIDE (GEMRISHI EDITION)
          Features: Sticky Sub-Navigation, Interactive 10Cs Slider, Visual Cut Selector,
          Origin Explorer, Treatment Comparison, Rarity Pyramid, and Luxury Vedic Aesthetics
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-[#FAFDFB] via-white to-[#F4F9F6] border-b border-gray-200 overflow-hidden">
        {/* Subtle Decorative Ambient Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#264A3F]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className={`relative max-w-8xl mx-auto space-y-12 ${PADDING_CLASS}`}>
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#264A3F]/10 border border-[#264A3F]/20 text-[#264A3F] text-xs font-bold uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#264A3F]" />
              <span>THE GEMRISHI 10Cs MASTER GUIDE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-[#112922] tracking-tight">
              The 10C's of Coloured Gemstones
            </h2>

            {/* <p className="text-[#4B5563] text-lg sm:text-xl leading-[1.7] font-['Cormorant_Garamond'] font-medium tracking-wide">
              Unlike diamonds, appreciating and evaluating coloured gemstones requires a comprehensive understanding of ten fundamental pillars: <strong className="text-[#1C372F]">Colour, Clarity, Cut, Carat, Character, Certification, Confidence, Country & Origin, Cure-Treatment & Enhancement, and Cost & Rarity</strong>. Explore each pillar below to choose your authentic gemstone with total certitude.
            </p> */}
          </div>

          {/* ─── Interactive 10Cs Horizontally Scrollable Navigation Box ─── */}
          <div className="relative max-w-8xl mx-auto">
            <div className="bg-green-100/90 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-green-200/90 shadow-sm flex items-center gap-2">
              {/* Left Scroll Button */}
              <button
                type="button"
                onClick={() => scrollTenCs("left")}
                className="shrink-0 w-9 h-9 rounded-xl bg-white hover:bg-[#264A3F] text-gray-700 hover:text-white transition-all duration-200 border border-green-200 flex items-center justify-center cursor-pointer shadow-2xs hover:scale-105"
                title="Scroll Left"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Horizontally Scrollable Pills Track */}
              <div
                ref={tenCsScrollRef}
                className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-none w-full"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {TEN_CS_DATA.map((item, idx) => {
                  const isActive = activeSevenCIndex === idx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSevenCIndex(idx)}
                      className={`group relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-2 border ${isActive
                          ? "bg-[#264A3F] text-white border-[#264A3F] shadow-md shadow-[#264A3F]/20 scale-102"
                          : "bg-white/80 text-gray-700 hover:text-[#264A3F] border-green-200/80 hover:border-[#264A3F]/50 hover:bg-white"
                        }`}
                    >
                      <span
                        className={`text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded-md ${isActive
                            ? "bg-white/20 text-emerald-100"
                            : "bg-green-50 text-emerald-800 border border-green-200 group-hover:bg-[#264A3F]/10 group-hover:text-[#264A3F] group-hover:border-transparent"
                          }`}
                      >
                        {item.number}
                      </span>
                      <span>{item.title}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Scroll Button */}
              <button
                type="button"
                onClick={() => scrollTenCs("right")}
                className="shrink-0 w-9 h-9 rounded-xl bg-white hover:bg-[#264A3F] text-gray-700 hover:text-white transition-all duration-200 border border-green-200 flex items-center justify-center cursor-pointer shadow-2xs hover:scale-105"
                title="Scroll Right"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── Interactive 10Cs Main Showcase Card (Gemfields-Style Editorial Showcase) ─── */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden">
            {/* Top Bar with Step Progress and Next / Prev Controllers */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#1A382F] via-[#23493D] to-[#1A382F] text-white flex items-center justify-between border-b border-emerald-700/60">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="text-lg sm:text-2xl font-serif font-bold text-emerald-200 shrink-0">
                  {activeC.number}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-emerald-150 font-semibold truncate">
                  / 10 Pillars of Excellence
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setActiveSevenCIndex((prev) =>
                      prev === 0 ? TEN_CS_DATA.length - 1 : prev - 1
                    )
                  }
                  className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Previous Pillar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs font-bold px-2 text-emerald-100 hidden sm:block">
                  {activeC.title}
                </div>
                <button
                  onClick={() =>
                    setActiveSevenCIndex((prev) =>
                      prev === TEN_CS_DATA.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Next Pillar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Showcase Body (Two Columns: Rich Narrative + Interactive Visual Widget) */}
            <div className="p-4 sm:p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">

              {/* Left Column: Editorial Insights & Pillars (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#264A3F] text-xs font-bold tracking-wider uppercase border border-emerald-100">
                    <Gem className="w-3.5 h-3.5" />
                    <span>Pillar {activeC.number}: {activeC.title}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#112922]">
                    {activeC.tagline}
                  </h3>
                  <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed pt-1">
                    {activeC.summary}
                  </p>
                </div>

                {/* 3 Key Exploration Items */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeC.pillarItems.map((point, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3.5 rounded-2xl bg-gray-50/90 border border-gray-200/80 hover:border-emerald-300/80 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCheck className="w-3.5 h-3.5 text-[#264A3F]" />
                        <h4 className="text-xs font-bold text-[#112922]">{point.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-normal">{point.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Vedic Gemstone Tip Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50/70 border border-emerald-200/80 text-[#1C372F] flex items-start gap-3 shadow-2xs">
                  <Sparkles className="w-5 h-5 text-[#264A3F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1C372F] block mb-0.5">
                      Vedic Jyotish & Gemological Rule:
                    </span>
                    <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                      {activeC.vedicTip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Interactive Pillar Widget (5 Cols) */}
              <div className="lg:col-span-5 bg-gradient-to-b from-[#1C372F] via-[#22443A] to-[#173029] rounded-3xl p-6 text-white border border-emerald-700/60 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6">

                {/* Floating Ambient Badge */}
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-semibold text-emerald-300 tracking-wider uppercase">
                      Interactive 10Cs Inspector
                    </span>
                  </div>
                  <span className="text-xs text-emerald-100/70 font-medium">GemRishi Lab Standards</span>
                </div>

                {/* 01. Colour Inspector */}
                {activeC.id === "colour" && (
                  <div className="space-y-4 py-2">
                    <div className="text-center space-y-1">
                      <p className="text-xs text-emerald-200 uppercase tracking-widest font-semibold">
                        Tone & Saturation Spectrum
                      </p>
                      <p className="text-sm text-gray-200">
                        Vibrant pure saturation conducts maximal cosmic energy.
                      </p>
                    </div>

                    {/* Interactive Swatch Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "light", label: "Light Tone", color: "bg-emerald-300/70", desc: "Subtle cosmic resonance" },
                        { id: "vivid", label: "Vivid Royal (Optimal)", color: "bg-emerald-500", desc: "Supreme Astrological Grade" },
                        { id: "deep", label: "Deep Velvet", color: "bg-emerald-900", desc: "Rich intense saturation" },
                      ].map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => setInteractiveColorTone(tone.id)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${interactiveColorTone === tone.id
                              ? "bg-white/20 border-emerald-300 ring-2 ring-emerald-400/50 shadow-md"
                              : "bg-white/10 border-white/15 hover:bg-white/15 text-white"
                            }`}
                        >
                          <div className={`w-6 h-6 rounded-full ${tone.color} shadow-md`} />
                          <span className="text-[11px] font-bold text-white">{tone.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-center shadow-inner">
                      <p className="text-xs text-emerald-100">
                        {interactiveColorTone === "vivid"
                          ? "✨ Selected: Optimal Vedic Grade with natural pure chromatic vibrancy & unheated crystal clarity."
                          : interactiveColorTone === "light"
                            ? "💡 Light Tone: Delicate hue with high transparency, ideal for gentle planetary balancing."
                            : "💎 Deep Velvet: High color density and profound color saturation for intense astrological focus."}
                      </p>
                    </div>
                  </div>
                )}

                {/* 03. Cut Inspector */}
                {activeC.id === "cut" && (
                  <div className="space-y-4 py-2">
                    <p className="text-xs text-center text-emerald-200 uppercase tracking-widest font-semibold">
                      Select Astrological Cut Shape
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {CUT_SHAPES_DATA.map((cut, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setActiveShapeIndex(sIdx)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${activeShapeIndex === sIdx
                              ? "bg-emerald-500/35 border-emerald-300 text-white shadow-md ring-1 ring-emerald-400/40"
                              : "bg-white/10 border-white/15 text-white hover:bg-white/15"
                            }`}
                        >
                          <p className="text-xs font-bold text-white">{cut.name}</p>
                          <p className="text-[10px] text-emerald-200/80 truncate">{cut.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-xs text-emerald-100 shadow-inner">
                      <strong className="text-emerald-200">Astrological Note:</strong> {CUT_SHAPES_DATA[activeShapeIndex].desc} Open-back settings ensure direct skin touch.
                    </div>
                  </div>
                )}

                {/* 08. Country & Origin Inspector */}
                {activeC.id === "origin" && (
                  <div className="space-y-4 py-2">
                    <p className="text-xs text-center text-emerald-200 uppercase tracking-widest font-semibold">
                      Legendary Mine Terroirs & Provenance
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {ORIGIN_SHOWCASE_DATA.map((origin, oIdx) => (
                        <button
                          key={origin.id}
                          onClick={() => setActiveOriginIndex(oIdx)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${activeOriginIndex === oIdx
                              ? "bg-emerald-500/35 border-emerald-300 text-white shadow-md ring-1 ring-emerald-400/40"
                              : "bg-white/10 border-white/15 text-white hover:bg-white/15"
                            }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                            <p className="text-xs font-bold text-white truncate">{origin.name}</p>
                          </div>
                          <p className="text-[10px] text-emerald-200/80 truncate mt-0.5">{origin.gem}</p>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-xs text-emerald-100 shadow-inner">
                      <strong className="text-emerald-200">{ORIGIN_SHOWCASE_DATA[activeOriginIndex].name}:</strong> {ORIGIN_SHOWCASE_DATA[activeOriginIndex].desc}
                    </div>
                  </div>
                )}

                {/* 09. Cure-Treatment & Enhancement Inspector */}
                {activeC.id === "treatment" && (
                  <div className="space-y-4 py-2">
                    <p className="text-xs text-center text-emerald-200 uppercase tracking-widest font-semibold">
                      Treatment Purity vs Astrological Power
                    </p>
                    <div className="space-y-2">
                      {TREATMENT_SHOWCASE_DATA.map((treat, tIdx) => (
                        <button
                          key={treat.id}
                          onClick={() => setActiveTreatmentIndex(tIdx)}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${activeTreatmentIndex === tIdx
                              ? "bg-emerald-500/35 border-emerald-300 text-white shadow-md ring-1 ring-emerald-400/40"
                              : "bg-white/10 border-white/15 text-white hover:bg-white/15"
                            }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{treat.status}</p>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono border mt-1 ${treat.badge}`}>
                              {treat.grade}
                            </span>
                          </div>
                          {treat.id === "natural" ? (
                            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-xs text-emerald-100 shadow-inner">
                      <strong className="text-emerald-200">Vedic Verdict:</strong> {TREATMENT_SHOWCASE_DATA[activeTreatmentIndex].effect}
                    </div>
                  </div>
                )}

                {/* 10. Cost & Rarity Inspector */}
                {activeC.id === "cost" && (
                  <div className="space-y-4 py-2">
                    <p className="text-xs text-center text-emerald-200 uppercase tracking-widest font-semibold">
                      Geological Scarcity Pyramid
                    </p>
                    <div className="space-y-2">
                      {RARITY_SHOWCASE_DATA.map((tier, rIdx) => (
                        <button
                          key={tier.id}
                          onClick={() => setActiveRarityIndex(rIdx)}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${activeRarityIndex === rIdx
                              ? "bg-emerald-500/35 border-emerald-300 text-white shadow-md ring-1 ring-emerald-400/40"
                              : "bg-white/10 border-white/15 text-white hover:bg-white/15"
                            }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{tier.tier}</p>
                            <p className="text-[10px] text-emerald-200/80">{tier.pct}</p>
                          </div>
                          <TrendingUp className="w-4 h-4 text-emerald-300 shrink-0" />
                        </button>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-xs text-emerald-100 shadow-inner">
                      <strong className="text-emerald-200">Scarcity Factor:</strong> {RARITY_SHOWCASE_DATA[activeRarityIndex].desc} Direct mine pricing eliminates retail markups.
                    </div>
                  </div>
                )}

                {/* Specimen Showcase for other C's */}
                {activeC.id !== "colour" &&
                  activeC.id !== "cut" &&
                  activeC.id !== "origin" &&
                  activeC.id !== "treatment" &&
                  activeC.id !== "cost" && (
                    <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600/30 to-emerald-800/20 p-3 flex items-center justify-center border border-white/20 shadow-inner">
                        <img
                          src={activeC.sampleImage}
                          alt={activeC.title}
                          className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white font-serif">{activeC.title} Authenticity</p>
                        <p className="text-xs text-gray-300 max-w-xs">
                          Every stone inspected under gemological microscopes and consecrated with authentic Vedic Pran Pratishtha.
                        </p>
                      </div>
                    </div>
                  )}

                {/* Bottom Card Action */}
                <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                  <div className="text-[11px] text-gray-300">
                    Need personalized advice?
                  </div>
                  <Link
                    to="/gemstone"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white transition-colors"
                  >
                    <span>Browse 100% Natural Stones</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────────────────────
          BEST SELLING JEWELRY & RINGS SECTION (GemsNY-Inspired Editorial Grid)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-[#FAF9F6] border-b border-gray-200/90 px-3 sm:px-6 md:px-8">
        <div className="max-w-[1440px] w-full mx-auto space-y-10">

          {/* Section Header with Category Filter Sub-Navigation */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#1C372F] tracking-tight"
              style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}
            >
              Best Selling Jewellery
            </h2>

            {/* Sub-Category Filter Navigation Tabs */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-gray-500 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "rings", label: "Rings" },
                // { id: "earrings", label: "Earrings" },
                { id: "pendants", label: "Pendants" },
                { id: "wedding", label: "Wedding Rings" },
                // { id: "bracelets", label: "Bracelets" },
              ].map((tab, idx, arr) => (
                <React.Fragment key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setBestSellingJewelryTab(tab.id)}
                    className={`cursor-pointer transition-colors relative pb-1 whitespace-nowrap ${bestSellingJewelryTab === tab.id
                        ? "text-[#1C372F] font-bold border-b-2 border-[#1C372F]"
                        : "hover:text-[#1C372F]"
                      }`}
                  >
                    {tab.label}
                  </button>
                  {idx < arr.length - 1 && <span className="text-gray-300 select-none">•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Dual Sliding Rows Container (4 Cards per Row) */}
          <div className="max-w-[1220px] w-full mx-auto space-y-6 sm:space-y-8">

            {/* ═══ ROW 1: SLIDING TRACK ═══ */}
            <div className="relative group/row1">
              {/* Left Floating Arrow Button */}
              <button
                type="button"
                onClick={() => scrollJewelryRow1("left")}
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-[#1C372F] hover:text-white hover:bg-[#264A3F] border border-gray-200 shadow-xl items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
                title="Slide Left"
                aria-label="Slide Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Floating Arrow Button */}
              <button
                type="button"
                onClick={() => scrollJewelryRow1("right")}
                className="flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-[#1C372F] hover:text-white hover:bg-[#264A3F] border border-gray-200 shadow-xl items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
                title="Slide Right"
                aria-label="Slide Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div
                ref={jewelrySliderRow1Ref}
                className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-3 px-1 scrollbar-none snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {(BEST_SELLING_JEWELRY_DATA[bestSellingJewelryTab] || BEST_SELLING_JEWELRY_DATA.rings).map((product, idx) => (
                  <Link
                    key={`row1-${idx}-${product.name}`}
                    to={`/jewelry/${product.slug}`}
                    className="group relative rounded-3xl overflow-hidden bg-gray-100 hover:bg-gray-200/70 border border-gray-200/90 shadow-2xs hover:shadow-xl transition-all duration-500 w-[calc(100vw-5rem)] max-w-[320px] sm:max-w-none sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)] shrink-0 snap-center sm:snap-start h-[280px] sm:h-[300px] flex flex-col justify-between cursor-pointer"
                  >
                    {/* Top Badge: Planet / Category */}
                    {product.tag && (
                      <div className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 text-[10px] sm:text-xs font-semibold text-[#1C372F] tracking-wide shadow-2xs">
                        {product.tag}
                      </div>
                    )}

                    {/* Top-Right Floating Bookmark / Save Button */}
                    <div className="absolute top-3 right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#264A3F] group-hover:bg-white group-hover:scale-105 transition-all duration-300">
                      <Bookmark className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#264A3F] transition-colors" />
                    </div>

                    {/* Center Jewellery Canvas */}
                    <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden p-4">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none" />
                      <div className="absolute w-32 h-32 rounded-full bg-white/70 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => {
                          if (product.fallbackImage && e.currentTarget.src !== product.fallbackImage) {
                            e.currentTarget.src = product.fallbackImage;
                          }
                        }}
                        className="w-full h-full object-contain group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 ease-out"
                      />
                    </div>

                    {/* Bottom Floating White Card */}
                    <div className="p-3 sm:p-3.5 pt-0 w-full z-10">
                      <div className="w-full bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md border border-gray-100 flex items-center justify-between gap-2 group-hover:border-gray-200 transition-all duration-300">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-[#112922] group-hover:text-[#264A3F] transition-colors truncate">
                            {product.name}
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate mt-0.5">
                            {product.subtitle}
                          </p>
                        </div>
                        {product.startingPrice && (
                          <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-[#112922] block">
                              {product.startingPrice}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium block">
                              starting
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ═══ ROW 2: SLIDING TRACK ═══ */}
            <div className="relative group/row2">
              {/* Left Floating Arrow Button */}
              <button
                type="button"
                onClick={() => scrollJewelryRow2("left")}
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-[#1C372F] hover:text-white hover:bg-[#264A3F] border border-gray-200 shadow-xl items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
                title="Slide Left"
                aria-label="Slide Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Floating Arrow Button */}
              <button
                type="button"
                onClick={() => scrollJewelryRow2("right")}
                className="flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-[#1C372F] hover:text-white hover:bg-[#264A3F] border border-gray-200 shadow-xl items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
                title="Slide Right"
                aria-label="Slide Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div
                ref={jewelrySliderRow2Ref}
                className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-3 px-1 scrollbar-none snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {(bestSellingJewelryTab === "rings"
                  ? (BEST_SELLING_JEWELRY_DATA.pendants || []).concat(BEST_SELLING_JEWELRY_DATA.wedding || [])
                  : bestSellingJewelryTab === "pendants"
                    ? (BEST_SELLING_JEWELRY_DATA.rings || []).concat(BEST_SELLING_JEWELRY_DATA.wedding || [])
                    : (BEST_SELLING_JEWELRY_DATA.rings || []).concat(BEST_SELLING_JEWELRY_DATA.pendants || [])
                ).map((product, idx) => (
                  <Link
                    key={`row2-${idx}-${product.name}`}
                    to={`/jewelry/${product.slug}`}
                    className="group relative rounded-3xl overflow-hidden bg-gray-100 hover:bg-gray-200/70 border border-gray-200/90 shadow-2xs hover:shadow-xl transition-all duration-500 w-[calc(100vw-5rem)] max-w-[320px] sm:max-w-none sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)] shrink-0 snap-center sm:snap-start h-[280px] sm:h-[300px] flex flex-col justify-between cursor-pointer"
                  >
                    {/* Top Badge: Planet / Category */}
                    {product.tag && (
                      <div className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 text-[10px] sm:text-xs font-semibold text-[#1C372F] tracking-wide shadow-2xs">
                        {product.tag}
                      </div>
                    )}

                    {/* Top-Right Floating Bookmark / Save Button */}
                    <div className="absolute top-3 right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#264A3F] group-hover:bg-white group-hover:scale-105 transition-all duration-300">
                      <Bookmark className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#264A3F] transition-colors" />
                    </div>

                    {/* Center Jewellery Canvas */}
                    <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden p-4">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none" />
                      <div className="absolute w-32 h-32 rounded-full bg-white/70 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => {
                          if (product.fallbackImage && e.currentTarget.src !== product.fallbackImage) {
                            e.currentTarget.src = product.fallbackImage;
                          }
                        }}
                        className="w-full h-full object-contain group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 ease-out"
                      />
                    </div>

                    {/* Bottom Floating White Card */}
                    <div className="p-3 sm:p-3.5 pt-0 w-full z-10">
                      <div className="w-full bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md border border-gray-100 flex items-center justify-between gap-2 group-hover:border-gray-200 transition-all duration-300">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-[#112922] group-hover:text-[#264A3F] transition-colors truncate">
                            {product.name}
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate mt-0.5">
                            {product.subtitle}
                          </p>
                        </div>
                        {product.startingPrice && (
                          <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-[#112922] block">
                              {product.startingPrice}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium block">
                              starting
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* View All Rings Button */}
          <div className="flex justify-center pt-2">
            <Link
              to="/jewelry"
              className="px-10 py-3 rounded-md bg-white hover:bg-[#1C372F] text-[#1C372F] hover:text-white border border-[#1C372F] text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <span>View All {bestSellingJewelryTab === "rings" ? "Rings" : bestSellingJewelryTab === "pendants" ? "Pendants" : bestSellingJewelryTab === "earrings" ? "Earrings" : bestSellingJewelryTab === "bracelets" ? "Bracelets" : "Jewelry"}</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MAIN SECTION: BUY GEMSTONE ONLINE AT GEMRISHI (LEFT) + FIND YOUR GEM (RIGHT)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className={`py-12 sm:py-16 ${PADDING_CLASS}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">

            {/* ═══════════════════════════════════════════════════════════════════════
                LEFT COLUMN: BUY GEMSTONE ONLINE AT GEMRISHI (High-Weight Text & Links)
            ═══════════════════════════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[62%] space-y-10 text-[#374151]">

              {/* Parent Topic Header */}
              <div className="space-y-3 border-b border-gray-200 pb-5">
                {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#264A3F]/10 text-[#264A3F] text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Online Shopping Experience
                </div> */}
                <h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C372F] tracking-wide"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >

                  <span className="text-[1.35em]">G</span>em
                  <span className="text-[1.35em]">R</span>ishi{" "}
                  <span className="text-[1.35em]">P</span>remises


                </h2>

                <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed">
                  Buying gemstones online at <Link to="/" className="text-[#264A3F] font-semibold underline hover:text-[#173029]">GemRishi</Link> gives you direct access to certified, unheated natural stones with ethical sourcing and personalized astrological guidance.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#264A3F] pt-1">
                  <span>↓ Scroll through our 6 core guarantees:</span>
                </div>
              </div>

              {/* ─── Scrollable Box Cards Container ─── */}
              <div className="max-h-[500px] overflow-y-auto p-3 sm:p-3.5 space-y-3.5 scrollbar-thin scrollbar-thumb-[#264A3F]/25 hover:scrollbar-thumb-[#264A3F]/50 scrollbar-track-gray-100 rounded-2xl border border-gray-200/90 bg-gray-50/40">

                {/* Box 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-[#264A3F]/50 shadow-xs hover:shadow-md transition-all duration-200 space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#264A3F] flex items-center justify-center font-bold text-xs border border-emerald-100 group-hover:bg-[#264A3F] group-hover:text-white transition-colors">
                        <Gem className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1C372F]">
                        Wide Variety of Natural Gemstones Online
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-[#264A3F]">01</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed pl-10">
                    Comprehensive catalog of 100% natural earth-mined Vedic <Link to="/gemstone" className="text-[#264A3F] font-semibold underline">Navratna Gemstones</Link> (<Link to="/gemstone/yellow-sapphire" className="text-[#264A3F] font-semibold underline">Yellow Sapphire</Link>, <Link to="/gemstone/blue-sapphire" className="text-[#264A3F] font-semibold underline">Blue Sapphire</Link>, <Link to="/gemstone/emerald" className="text-[#264A3F] font-semibold underline">Emerald</Link>, <Link to="/gemstone/ruby" className="text-[#264A3F] font-semibold underline">Ruby</Link>, <Link to="/gemstone/pearl" className="text-[#264A3F] font-semibold underline">Pearl</Link>, <Link to="/gemstone/red-coral" className="text-[#264A3F] font-semibold underline">Red Coral</Link>) and rare semi-precious varieties.
                  </p>
                </div>

                {/* Box 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-[#264A3F]/50 shadow-xs hover:shadow-md transition-all duration-200 space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#264A3F] flex items-center justify-center font-bold text-xs border border-emerald-100 group-hover:bg-[#264A3F] group-hover:text-white transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1C372F]">
                        Certified and Authentic Gemstones
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-[#264A3F]">02</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed pl-10">
                    Guaranteed 100% untreated & unheated natural gems. Accompanied by verifiable independent lab certificates from <strong>GIA, IGI, GTL, IIGJ, or GII</strong> with scannable QR codes.
                  </p>

                  {/* Certified Gemstone Lab Badges Container */}
                  <div className="pl-10 pt-1">
                    <div className="p-3 sm:p-4 rounded-2xl bg-green-100/70 border border-green-200/90 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-green-200/80">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#264A3F]" />
                          <span className="text-xs font-bold text-[#1C372F] tracking-tight uppercase">
                            Certified Gemstone • 100% Lab Verified
                          </span>
                        </div>
                        <Link
                          to="/certificate"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#264A3F] hover:text-[#173029] underline shrink-0"
                        >
                          <span>Verify Lab Reports</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Logo Badges Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { name: "GIA", label: "Gemological Institute of America", logo: GiaLogo },
                          { name: "IGI", label: "International Gemological Institute", logo: IgiLogo },
                          { name: "GTL", label: "Gem Testing Laboratory", logo: MgtiLogo },
                          { name: "IIGJ", label: "Indian Institute of Gems & Jewellery", logo: IigjLogo },
                          { name: "GII", label: "Gemmological Institute of India", logo: GiiLogo },
                        ].map((lab, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-xl p-2 sm:p-2.5 border border-green-200/80 hover:border-[#264A3F] shadow-2xs transition-all duration-200 flex flex-col items-center justify-center text-center group/lab"
                          >
                            <div className="w-full h-8 sm:h-9 flex items-center justify-center">
                              <img
                                src={lab.logo}
                                alt={`${lab.name} Certification`}
                                className="max-h-full max-w-full object-contain filter group-hover/lab:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <div className="mt-1 pt-1 border-t border-gray-100 w-full">
                              <span className="text-[11px] font-bold text-gray-900 block">{lab.name}</span>
                              <span className="text-[8.5px] text-gray-500 block truncate" title={lab.label}>
                                {lab.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 3 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-[#264A3F]/50 shadow-xs hover:shadow-md transition-all duration-200 space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#264A3F] flex items-center justify-center font-bold text-xs border border-emerald-100 group-hover:bg-[#264A3F] group-hover:text-white transition-colors">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1C372F]">
                        Easy Quality & Transparent Pricing Comparison
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-[#264A3F]">03</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed pl-10">
                    Transparent direct mine-to-market pricing with 360° HD video inspection. Use our <Link to="/carat-to-ratti-converter" className="text-[#264A3F] font-semibold underline">Carat to Ratti Converter</Link> to accurately calculate your prescribed weight.
                  </p>
                </div>

                {/* Box 4 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-[#264A3F]/50 shadow-xs hover:shadow-md transition-all duration-200 space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#264A3F] flex items-center justify-center font-bold text-xs border border-emerald-100 group-hover:bg-[#264A3F] group-hover:text-white transition-colors">
                        <Truck className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1C372F]">
                        Convenient Home Delivery Across India
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-[#264A3F]">04</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed pl-10">
                    Insured doorstep delivery across 19,000+ PIN codes and international destinations. Packed in tamper-proof security cases with <strong>100% full transit insurance</strong>.
                  </p>
                </div>

                {/* Box 5 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-[#264A3F]/50 shadow-xs hover:shadow-md transition-all duration-200 space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#264A3F] flex items-center justify-center font-bold text-xs border border-emerald-100 group-hover:bg-[#264A3F] group-hover:text-white transition-colors">
                        <Shield className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1C372F]">
                        Secure & Transparent Payment Options
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-[#264A3F]">05</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed pl-10">
                    Bank-grade 256-bit SSL encrypted checkout adhering to RBI standards. Supports UPI (Google Pay, PhonePe, Paytm), Cards, Net Banking, and flexible low-cost EMI options.
                  </p>
                </div>

                {/* Box 6 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-[#264A3F]/50 shadow-xs hover:shadow-md transition-all duration-200 space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#264A3F] flex items-center justify-center font-bold text-xs border border-emerald-100 group-hover:bg-[#264A3F] group-hover:text-white transition-colors">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1C372F]">
                        Clear 10-Day Return & Exchange Policy
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-[#264A3F]">06</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed pl-10">
                    Enjoy a full 10-day inspection period to consult your family astrologer or gemologist with our <strong>"No-Questions-Asked" Return & Exchange Policy</strong>.
                  </p>
                </div>

              </div>

            </div>

            {/* ═══════════════════════════════════════════════════════════════════════
                RIGHT COLUMN: FIND YOUR GEM INTERACTIVE WIDGET (Vertically Centered with Generous Navbar Clearance)
            ═══════════════════════════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[38%] lg:sticky lg:top-[max(140px,calc(50vh-210px))] self-start">
              <div className="bg-gradient-to-b from-[#FAFDFB] to-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-xl space-y-6">

                {/* Top Badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#264A3F]/10 border border-[#264A3F]/20 text-[#264A3F] text-xs font-bold tracking-wider uppercase">
                    <span>ॐ</span>
                    <span>AUTHENTIC VEDIC GEMS</span>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
                    Find Your Gem
                  </h3>
                  <p className="text-sm font-semibold text-[#0284C7]">
                    Begin your journey here
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleWidgetSearch} className="space-y-4">
                  {/* Tab Selector: By Gemstone vs By Purpose */}
                  <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-gray-100/90 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setSearchTab("gemstone")}
                      className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${searchTab === "gemstone"
                          ? "bg-white text-gray-900 shadow-xs"
                          : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      By Gemstone
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchTab("purpose")}
                      className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${searchTab === "purpose"
                          ? "bg-white text-gray-900 shadow-xs"
                          : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      By Purpose
                    </button>
                  </div>

                  {/* Dynamic Selector based on Tab */}
                  {searchTab === "gemstone" ? (
                    <div>
                      <select
                        value={selectedGemstone}
                        onChange={(e) => setSelectedGemstone(e.target.value)}
                        className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 bg-white focus:border-[#264A3F] focus:ring-1 focus:ring-[#264A3F] outline-hidden cursor-pointer"
                      >
                        {GEMSTONE_OPTIONS.map((gem) => (
                          <option key={gem.slug} value={gem.slug}>
                            {gem.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <select
                        value={selectedPurpose}
                        onChange={(e) => setSelectedPurpose(e.target.value)}
                        className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 bg-white focus:border-[#264A3F] focus:ring-1 focus:ring-[#264A3F] outline-hidden cursor-pointer"
                      >
                        {PURPOSE_OPTIONS.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Weight Toggle & Sub-selectors */}
                  {searchTab === "gemstone" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          WEIGHT
                        </span>
                        <div className="inline-flex p-0.5 rounded-lg bg-gray-100 border border-gray-200 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setWeightUnit("carat")}
                            className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${weightUnit === "carat"
                                ? "bg-[#264A3F] text-white"
                                : "text-gray-600 hover:text-gray-900"
                              }`}
                          >
                            Carat
                          </button>
                          <button
                            type="button"
                            onClick={() => setWeightUnit("ratti")}
                            className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${weightUnit === "ratti"
                                ? "bg-[#264A3F] text-white"
                                : "text-gray-600 hover:text-gray-900"
                              }`}
                          >
                            Ratti
                          </button>
                        </div>
                      </div>

                      {/* Two Selectors: Carat Weight & Price Range */}
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={selectedWeightRange}
                          onChange={(e) => setSelectedWeightRange(e.target.value)}
                          className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:border-[#264A3F] outline-hidden cursor-pointer"
                        >
                          <option value="">{weightUnit === "carat" ? "Carat Weight" : "Ratti Weight"}</option>
                          <option value="2-3">2 - 3 {weightUnit}</option>
                          <option value="3-4">3 - 4 {weightUnit}</option>
                          <option value="4-5">4 - 5 {weightUnit}</option>
                          <option value="5-6">5 - 6 {weightUnit}</option>
                          <option value="6-8">6 - 8 {weightUnit}</option>
                          <option value="8-12">8+ {weightUnit}</option>
                        </select>

                        <select
                          value={selectedPriceRange}
                          onChange={(e) => setSelectedPriceRange(e.target.value)}
                          className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:border-[#264A3F] outline-hidden cursor-pointer"
                        >
                          <option value="">Price Range</option>
                          <option value="10000">Under ₹10,000</option>
                          <option value="25000">Under ₹25,000</option>
                          <option value="50000">Under ₹50,000</option>
                          <option value="100000">Under ₹1,00,000</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0E6C54] via-[#0284C7] to-[#0E6C54] hover:opacity-95 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Search Now</span>
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {/* Footer Micro Trust Items */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-3 border-t border-gray-100 text-center">
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 mb-1" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-700 uppercase tracking-tight">100% CERTIFIED</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-gray-200">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 mb-1" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-700 uppercase tracking-tight">EST. 1904</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 mb-1" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-700 uppercase tracking-tight">GLOBAL SHIPPING</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>



      {/* ─────────────────────────────────────────────────────────────────────────────
          ARTICLE CONTINUATION: HOW TO CHOOSE, PRICING, & COMPARISON
      ───────────────────────────────────────────────────────────────────────────── */}
      <article className={`py-12 sm:py-16 bg-[#F9FAF8] border-t border-gray-200/80 ${PADDING_CLASS}`}>
        <div className="max-w-6xl mx-auto space-y-14 text-[#374151]">

          {/* ─────────────────────────────────────────────────────────────────────────
              H2: GEMSTONES FOR ASTROLOGICAL PURPOSES (Comprehensive Vedic Jyotish Guide)
          ───────────────────────────────────────────────────────────────────────── */}
          <section className="space-y-8">
            {/* Header */}
            <div className="space-y-3 border-b border-gray-200 pb-5">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#264A3F]/10 text-[#264A3F] text-xs font-semibold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                Vedic Jyotish & Planetary Energy
              </div> */}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1C372F] tracking-tight">
                Gemstones for Astrological Purposes
              </h2>
              {/* <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed max-w-4xl">
                In Vedic Astrology (<em>Jyotish Shastra</em>), gemstones act as cosmic prisms. They capture and channel specific electro-magnetic planetary wavelengths into the human bio-energy field (aura), strengthening weak functional benefic planets and harmonizing planetary periods (<em>Mahadasha / Antardasha</em>).
              </p> */}
            </div>

            {/* 3 Core Vedic Astrological Principles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md transition-all duration-300 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#264A3F] border border-emerald-100 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1C372F]">1. Lagna & Yoga Karaka Analysis</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Always wear stones ruled by your birth chart's functional benefic houses (1st, 5th, and 9th). Wearing stones for functional malefic planets can bring unfavorable results.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md transition-all duration-300 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#264A3F] border border-emerald-100 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1C372F]">2. 100% Untreated Vedic Quality</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Heat-treated, dyed, or glass-filled stones lose their natural molecular conductivity. Only 100% natural, unheated, eye-clean gemstones produce genuine astrological effects.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md transition-all duration-300 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#264A3F] border border-emerald-100 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1C372F]">3. Pran Pratishtha & Muhurat</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Before wearing, the stone must undergo Vedic purification in raw cow milk and Gangajal, followed by 108 Beej Mantra recitations on an auspicious Shukla Paksha weekday.
                </p>
              </div>
            </div>



            {/* Astrology Consultation Banner */}
            <div className="bg-gradient-to-r from-[#172D26] via-[#1C372F] to-[#264A3F] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-800/60">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-white/10">
                    <Sparkles className="w-3.5 h-3.5" />
                    Free AI Kundli Astrological Analysis
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold">Unsure Which Gemstone Suits Your Horoscope?</h3>
                  <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
                    Get an instant, customized gemstone recommendation based on your date, time, and exact place of birth with complete Dasha analysis.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => navigate("/suggest")}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-[#1C372F] hover:bg-gray-100 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#264A3F]" />
                    <span>Free Gem Recommendation</span>
                  </button>
                  <a
                    href="https://wa.me/919817975978?text=Hello%20GemRishi,%20I%20need%20astrological%20advice%20for%20buying%20a%20gemstone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* ─────────────────────────────────────────────────────────────────────────
              H2: FEATURED BLOGS BY GEMRISHI (Latest Astrological & Gemological Insights)
          ───────────────────────────────────────────────────────────────────────── */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#264A3F]/10 text-[#264A3F] text-xs font-semibold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  Editorial Insights & Vedic Wisdom
                </div>
                <h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1C372F] tracking-tight"
                  style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}
                >
                  <span className="text-[1.18em]">G</span>emRishi{" "}
                  <span className="text-[1.18em]">B</span>logs
                </h2>
              </div>

              <a
                href="https://gemrishi.com/blogs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#264A3F] hover:text-[#173029] underline shrink-0 cursor-pointer"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* 2 Featured Cards Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2">
              {FEATURED_BLOGS.map((blog) => (
                <a
                  key={blog.id}
                  href={blog.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-white rounded-3xl border border-gray-200 hover:border-[#264A3F]/60 shadow-xs hover:shadow-2xl hover:shadow-[#1A3C34]/10 transition-all duration-500 overflow-hidden hover:-translate-y-1.5 cursor-pointer"
                >
                  {/* Image Container with Zoom Effect */}
                  <div className="relative aspect-[16/8] sm:aspect-[16/8.5] overflow-hidden bg-gray-100">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      onError={(e) => {
                        if (blog.fallbackImage) {
                          e.target.onerror = null;
                          e.target.src = blog.fallbackImage;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none"
                      loading="lazy"
                    />

                    {/* Top Category Badge */}
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3C34]/95 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase shadow-md border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {blog.category}
                      </span>
                    </div>

                    {/* Top Read Time Badge */}
                    <div className="absolute top-3.5 right-3.5 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-gray-700 text-[10px] font-medium shadow-sm border border-gray-100">
                        <BookOpen className="w-3 h-3 text-[#264A3F]" />
                        {blog.readTime}
                      </span>
                    </div>

                    {/* Bottom overlay badge */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0F2820]/85 backdrop-blur-md text-emerald-200 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase border border-emerald-400/30">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-300" />
                        {blog.id === 1 ? "FEATURED COVER STORY" : "CURATED JOURNAL"}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
                        <span className="tracking-wider uppercase">{blog.date}</span>
                        <span className="text-[#264A3F] font-serif italic font-semibold">The GemRishi Journal</span>
                      </div>

                      <h3
                        className="text-lg sm:text-xl font-bold text-[#1A3C34] group-hover:text-[#264A3F] transition-colors duration-200 line-clamp-2 leading-snug tracking-tight"
                        style={{ fontFamily: "'Bodoni Moda', 'Playfair Display', Georgia, serif" }}
                      >
                        {blog.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {blog.desc}
                      </p>
                    </div>

                    {/* Author & Read Story Action Footer */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-[#1A3C34] flex-shrink-0 shadow-2xs">
                          G
                        </div>
                        <div className="leading-tight truncate">
                          <div className="text-xs font-bold text-[#1A3C34] truncate">Gemrishi</div>
                          <div className="text-[10px] text-gray-500 truncate">GemRishi Expert</div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A3C34] group-hover:bg-[#264A3F] text-white text-xs font-semibold tracking-wide transition-colors duration-300 shadow-xs flex-shrink-0">
                        <span>Read Story</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-200" />
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* ─────────────────────────────────────────────────────────────────────────
              H2: FAQS ABOUT BUYING GEMSTONES ONLINE (Accordion)
          ───────────────────────────────────────────────────────────────────────── */}
          <section className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C372F] tracking-tight">
              FAQs About Buying Gemstones Online
            </h2>
            <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed">
              Common questions answered by GemRishi's expert gemologists and astrologers:
            </p>

            <div className="space-y-3.5 pt-1">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-gray-900 text-sm sm:text-base">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${openFaqIndex === idx ? "rotate-180 text-[#264A3F]" : ""
                        }`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[#4B5563] leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Conclusion / Bottom Action Box */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[#F2F7F4] border border-[#264A3F]/20 text-center space-y-3.5">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1C372F]">
              Ready to Buy Your Certified Natural Gemstone?
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563] max-w-2xl mx-auto">
              Explore our 100% natural, unheated, lab-certified gemstone collection with free Vedic energization and insured worldwide shipping.
            </p>
            <div className="pt-1">
              <button
                onClick={() => navigate("/gemstone")}
                className="px-7 py-3 bg-[#264A3F] hover:bg-[#1A332B] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer inline-flex items-center gap-2"
              >
                <span>Browse All Certified Gemstones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

        </div>
      </article>
    </div>
  );
};

export default BuyGemstoneOnline;