import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * PendantEditInteractiveBanner
 * Displays the high-resolution "THE PENDANT EDIT" banner just below the video section.
 * Features precision interactive hotspot zones over each of the three featured pendants:
 * - Center Card: Emerald Halo Pendant -> /jewellery/emerald-pendant
 * - Top-Right Card: Blue Sapphire Teardrop Pendant -> /jewellery/blue-sapphire-pendant
 * - Bottom-Left Card: Yellow Sapphire Oval Pendant -> /jewellery/yellow-sapphire-pendant
 * - "EXPLORE PENDANTS" Button -> scrolls to #pendant-collections-grid or /jewellery
 * - "FIND YOUR SIGNATURE PIECE" -> /suggest
 */
export default function PendantEditInteractiveBanner({ className = "" }) {
  const navigate = useNavigate();
  const [activeHover, setActiveHover] = useState(null);

  const handleExploreClick = (e) => {
    e.preventDefault();
    const gridEl = document.getElementById("pendant-collections-grid");
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/jewellery");
    }
  };

  return (
    <section
      aria-label="The Pendant Edit - Handcrafted Gemstone Pendants"
      className={`w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 pb-10 sm:pb-14 select-none ${className}`}
    >
      {/* Banner Container */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 shadow-[0_10px_35px_-10px_rgba(38,74,63,0.12)] bg-[#FAF8F5]">
        
        {/* Main Pristine Banner Image with Sleek Proportions */}
        <div className="relative w-full aspect-[1024/360]">
          <img
            src="/the-pendant-edit-banner.jpg"
            alt="The Pendant Edit - A Little Light, Close to the Heart | GemRishi"
            className="w-full h-full object-cover block"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/the-pendant-edit-banner.png";
            }}
          />

          {/* =================================================================== */}
          {/* INTERACTIVE HOTSPOT 1: CENTER - EMERALD HALO PENDANT CARD          */}
          {/* =================================================================== */}
          <Link
            to="/jewellery/emerald-pendant"
            aria-label="View Emerald Pendants Collection"
            title="Emerald Pendants - Click to explore products"
            onMouseEnter={() => setActiveHover("emerald")}
            onMouseLeave={() => setActiveHover(null)}
            className="group absolute z-20 cursor-pointer rounded-lg transition-all duration-300"
            style={{
              left: "56.4%",
              top: "22.8%",
              width: "15.0%",
              height: "61.0%",
            }}
          >
            {/* Subtle glow ring & lift on hover */}
            <div className="w-full h-full rounded-lg transition-all duration-300 group-hover:ring-2 group-hover:ring-emerald-600/70 group-hover:bg-emerald-500/10 group-hover:shadow-[0_18px_36px_-8px_rgba(5,150,105,0.45)]" />

            {/* Floating Tooltip / Product Pill on Hover */}
            <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A362D] text-white text-[10px] sm:text-xs font-medium tracking-wide shadow-lg border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Emerald Pendant • View Products
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>
          </Link>

          {/* =================================================================== */}
          {/* INTERACTIVE HOTSPOT 2: TOP-RIGHT - BLUE SAPPHIRE PENDANT CARD       */}
          {/* =================================================================== */}
          <Link
            to="/jewellery/blue-sapphire-pendant"
            aria-label="View Blue Sapphire Pendants Collection"
            title="Blue Sapphire Pendants - Click to explore products"
            onMouseEnter={() => setActiveHover("blue")}
            onMouseLeave={() => setActiveHover(null)}
            className="group absolute z-20 cursor-pointer rounded-lg transition-all duration-300"
            style={{
              left: "68.8%",
              top: "10.3%",
              width: "11.2%",
              height: "38.8%",
            }}
          >
            {/* Subtle glow ring & lift on hover */}
            <div className="w-full h-full rounded-lg transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-600/70 group-hover:bg-blue-500/10 group-hover:shadow-[0_14px_30px_-6px_rgba(37,99,235,0.45)]" />

            {/* Floating Tooltip / Product Pill on Hover */}
            <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 text-white text-[10px] sm:text-xs font-medium tracking-wide shadow-lg border border-blue-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Blue Sapphire • View Products
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>
          </Link>

          {/* =================================================================== */}
          {/* INTERACTIVE HOTSPOT 3: BOTTOM-LEFT - YELLOW SAPPHIRE PENDANT CARD    */}
          {/* =================================================================== */}
          <Link
            to="/jewellery/yellow-sapphire-pendant"
            aria-label="View Yellow Sapphire Pendants Collection"
            title="Yellow Sapphire Pendants - Click to explore products"
            onMouseEnter={() => setActiveHover("yellow")}
            onMouseLeave={() => setActiveHover(null)}
            className="group absolute z-20 cursor-pointer rounded-lg transition-all duration-300"
            style={{
              left: "48.1%",
              top: "63.8%",
              width: "9.5%",
              height: "32.5%",
            }}
          >
            {/* Subtle glow ring & lift on hover */}
            <div className="w-full h-full rounded-lg transition-all duration-300 group-hover:ring-2 group-hover:ring-amber-600/70 group-hover:bg-amber-500/10 group-hover:shadow-[0_14px_30px_-6px_rgba(217,119,6,0.45)]" />

            {/* Floating Tooltip / Product Pill on Hover */}
            <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-white text-[10px] sm:text-xs font-medium tracking-wide shadow-lg border border-amber-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Yellow Sapphire • View Products
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>
          </Link>

          {/* =================================================================== */}
          {/* INTERACTIVE HOTSPOT 4: "EXPLORE PENDANTS" PRIMARY BUTTON            */}
          {/* =================================================================== */}
          <button
            type="button"
            onClick={handleExploreClick}
            aria-label="Explore All Pendants"
            title="Explore All Gemstone Pendants"
            className="group absolute z-20 cursor-pointer rounded-sm sm:rounded-md transition-all duration-300"
            style={{
              left: "17.4%",
              top: "71.2%",
              width: "13.0%",
              height: "8.5%",
            }}
          >
            <div className="w-full h-full rounded-sm sm:rounded-md transition-all duration-300 group-hover:bg-white/20 group-hover:ring-1 group-hover:ring-white/40 group-hover:shadow-[0_4px_16px_rgba(26,54,45,0.6)]" />
          </button>

          {/* =================================================================== */}
          {/* INTERACTIVE HOTSPOT 5: "FIND YOUR SIGNATURE PIECE →" LINK           */}
          {/* =================================================================== */}
          <Link
            to="/suggest"
            aria-label="Find Your Signature Piece Astrological Recommendation"
            title="Get Personalized Gemstone Recommendation"
            className="group absolute z-20 cursor-pointer rounded-sm sm:rounded-md transition-all duration-300"
            style={{
              left: "31.2%",
              top: "71.2%",
              width: "13.8%",
              height: "8.5%",
            }}
          >
            <div className="w-full h-full rounded-sm sm:rounded-md transition-all duration-300 group-hover:bg-[#264A3F]/10 group-hover:ring-1 group-hover:ring-[#264A3F]/30" />
          </Link>

        </div>

        {/* Mobile Quick Tap Bar (ensures flawless mobile experience on small screens) */}
        <div className="sm:hidden bg-[#F5F2EB]/90 border-t border-stone-200/80 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-serif font-bold text-stone-800 shrink-0">
            Tap to View:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/jewellery/emerald-pendant"
              className="px-2.5 py-1 rounded-full bg-emerald-900 text-white text-[10px] font-medium tracking-wide shadow-2xs"
            >
              Emerald
            </Link>
            <Link
              to="/jewellery/blue-sapphire-pendant"
              className="px-2.5 py-1 rounded-full bg-blue-900 text-white text-[10px] font-medium tracking-wide shadow-2xs"
            >
              Blue Sapphire
            </Link>
            <Link
              to="/jewellery/yellow-sapphire-pendant"
              className="px-2.5 py-1 rounded-full bg-amber-800 text-white text-[10px] font-medium tracking-wide shadow-2xs"
            >
              Yellow Sapphire
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
