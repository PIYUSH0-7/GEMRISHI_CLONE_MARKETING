import {
  ArrowRight,
  Gem,
  HelpCircle,
  Home,
  MessageCircle,
  Search,
   Zap
} from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";

// Gemstone SVG Icons
import BlueSapphire from "../../assets/Stone/BlueSapphire.svg";
import Coral from "../../assets/Stone/Coral.svg";
import Emerald from "../../assets/Stone/Emerald.svg";
import Hessonite from "../../assets/Stone/Hessonite.svg";
import Pearl from "../../assets/Stone/Pearl.svg";
import Ruby from "../../assets/Stone/Ruby.svg";
import YellowSapphire from "../../assets/Stone/YellowSapphire.svg";
import catsEye from "../../assets/Stone/catsEye.svg";

export default function NotFound({ customTitle, customMessage, isProductNotFound = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/search-results?keyword=${encodeURIComponent(query)}`);
    }
  };

  const popularStones = [
    { name: "Yellow Sapphire (Pukhraj)", slug: "yellow-sapphire", img: YellowSapphire },
    { name: "Blue Sapphire (Neelam)", slug: "blue-sapphire", img: BlueSapphire },
    { name: "Emerald (Panna)", slug: "emerald", img: Emerald },
    { name: "Ruby (Manik)", slug: "ruby", img: Ruby },
    { name: "Red Coral (Moonga)", slug: "coral", img: Coral },
    { name: "Natural Pearl (Moti)", slug: "pearl", img: Pearl },
    { name: "Hessonite (Gomed)", slug: "hessonite", img: Hessonite },
    { name: "Cat's Eye (Lehsuniya)", slug: "cats-eye", img: catsEye },
  ];

  return (
    <main className="w-full min-h-[80vh] bg-[#FAF9F5] text-gray-800 py-10 sm:py-14 md:py-18 px-4 sm:px-6 lg:px-8">
      {/* 1. SEO METADATA: Instructs search engines not to index 404 pages while preserving link equity */}
      <Helmet>
        <title>{customTitle || (isProductNotFound ? "Product Not Found | GemRishi" : "404 - Page Not Found | GemRishi")}</title>
        <meta name="robots" content="noindex, follow" />
        <meta
          name="description"
          content="The page you are looking for does not exist or may have been moved. Explore certified natural gemstones and fine jewellery at GemRishi."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Top Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#264A3F]/10 border border-[#264A3F]/20 text-[#264A3F] text-xs sm:text-sm font-semibold tracking-wide mb-4">
          <HelpCircle className="w-4 h-4 text-[#264A3F]" />
          <span>{isProductNotFound ? "ITEM NOT FOUND" : "ERROR 404 • PAGE NOT FOUND"}</span>
        </div>

        {/* Big Stylized 404 Visual / Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-extrabold text-[#264A3F] tracking-tight mb-3 text-center">
          {isProductNotFound ? "Oops!" : "404"}
        </h1>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-gray-900 font-semibold mb-3 text-center max-w-2xl">
          {customTitle || "Looking for a Gemstone or Specific Page?"}
        </h2>

        <p className="text-sm sm:text-base text-gray-600 text-center max-w-xl mb-8 leading-relaxed">
          {customMessage ||
            "The link you followed may be outdated, broken, or the page might have been relocated. Don't worry, our entire certified collection is just a click away!"}
        </p>

        {/* 2. INTERACTIVE SEARCH BAR (Min touch target 44px) */}
        <div className="w-full max-w-xl mb-10">
          <form
            onSubmit={handleSearch}
            className="flex items-stretch bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-200/80 focus-within:border-[#264A3F] focus-within:ring-2 focus-within:ring-[#264A3F]/20 transition-all p-1.5"
          >
            <div className="pl-3.5 pr-2 flex items-center justify-center text-gray-400">
              <Search className="w-5 h-5 text-[#264A3F]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gemstones, jewellery, birthstones..."
              className="flex-1 bg-transparent px-2 py-2.5 text-sm sm:text-base text-gray-800 placeholder-gray-400 outline-none min-h-[44px]"
            />
            <button
              type="submit"
              className="px-5 sm:px-7 py-2.5 bg-[#264A3F] hover:bg-gray-900 text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full transition-all duration-300 shadow-sm active:scale-95 min-h-[44px] flex items-center justify-center"
            >
              Search
            </button>
          </form>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-gray-500">
            <span className="font-medium text-gray-700">Popular:</span>
            {["Pukhraj", "Neelam", "Emerald", "Ruby", "Diamond Ring", "Moonga"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => navigate(`/search-results?keyword=${encodeURIComponent(term)}`)}
                className="px-2.5 py-1 rounded-md bg-white border border-gray-200 hover:border-[#264A3F] hover:text-[#264A3F] transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* 3. PROMINENT CALL TO ACTION CARDS */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {/* Main Card: Gemstone Collection (Explicitly requested by user) */}
          <Link
            to="/gemstone"
            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-br from-[#264A3F] to-[#1a342c] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-4 text-[#D4AF37]">
                <Gem className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">
                Primary Destination
              </span>
              <h3 className="text-xl font-serif font-bold mt-1 mb-2">
                Explore Gemstones
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                Browse our verified catalog of 100% natural, lab-certified astrological gemstones with lab testing reports.
              </p>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
              <span>View Full Gemstone Collection</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Astro Recommendation */}
          <Link
            to="/suggest"
            className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md hover:border-[#264A3F]/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#264A3F]/10 flex items-center justify-center mb-4 text-[#264A3F]">
                < Zap className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#264A3F]">
                Free Astrology Tool
              </span>
              <h3 className="text-xl font-serif font-bold text-gray-900 mt-1 mb-2 group-hover:text-[#264A3F] transition-colors">
                Gem Recommendation
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Not sure which stone suits your Kundli? Get instant astrological gemstone recommendations for free.
              </p>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#264A3F] group-hover:translate-x-1 transition-transform">
              <span>Find Your Lucky Gemstone</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: Jewellery Collection */}
          <Link
            to="/jewellery"
            className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md hover:border-[#264A3F]/50 transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#264A3F]/10 flex items-center justify-center mb-4 text-[#264A3F]">
                <Home className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#264A3F]">
                Artisanal Craft
              </span>
              <h3 className="text-xl font-serif font-bold text-gray-900 mt-1 mb-2 group-hover:text-[#264A3F] transition-colors">
                Fine Jewellery
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Discover bespoke rings, pendants, and bracelets handcrafted in hallmark gold, silver, and panchdhatu.
              </p>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#264A3F] group-hover:translate-x-1 transition-transform">
              <span>Browse Designer Jewellery</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* 4. POPULAR GEMSTONES QUICK-LINKS */}
        <div className="w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs mb-10">
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#264A3F]">
              Direct Navigation
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900 mt-1">
              Popular Certified Gemstones
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Select any category to jump straight to certified natural stones
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {popularStones.map((stone) => (
              <Link
                key={stone.slug}
                to={`/gemstone/${stone.slug}`}
                className="group flex flex-col items-center p-3 sm:p-4 rounded-xl border border-gray-100 hover:border-[#264A3F]/30 bg-[#FAF9F5]/50 hover:bg-[#FAF9F5] transition-all duration-200 hover:shadow-xs min-h-[44px]"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center p-2 shadow-xs group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={stone.img}
                    alt={stone.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="mt-2.5 text-xs sm:text-sm font-medium text-gray-800 text-center group-hover:text-[#264A3F] transition-colors line-clamp-1">
                  {stone.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/gemstone"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#264A3F] hover:text-gray-900 transition-colors uppercase tracking-wider"
            >
              <span>View All Gemstones Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 5. NEED EXPERT ASSISTANCE / SUPPORT SECTION */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-100/80 text-gray-800">
          <div className="text-center sm:text-left">
            <h4 className="font-serif font-bold text-gray-900 text-base sm:text-lg">
              Need Help Finding a Specific Gemstone or Report?
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Our certified gemologists and Vedic astrologers are available to assist you directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/919817975978?text=Hello%20GemRishi,%20I%20was%20looking%20for%20a%20page%20or%20gemstone%20on%20your%20site%20and%20need%20help."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1ebc57] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
            >
              <Home className="w-4 h-4 text-gray-600" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
