import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * ThePendantEditShowcase
 * Custom luxury 3-pendant editorial showcase replicating the exact high-end design:
 * - Left: Editorial typography ("THE PENDANT EDIT", "A Little Light, Close to the Heart", CTAs)
 * - Right: Asymmetric floating collage of 3 gemstone pendants (Center: Emerald, Top-Right: Blue Sapphire, Bottom-Left: Yellow Sapphire)
 * - Interactive: Clicking any pendant card or button navigates directly to the corresponding gemstone pendant product collection.
 */
export default function ThePendantEditShowcase({ className = "" }) {
  const navigate = useNavigate();

  const handleExploreClick = (e) => {
    // If the pendant collections grid exists on this page, smoothly scroll to it;
    // otherwise navigate to /jewellery
    const gridEl = document.getElementById("pendant-collections-grid");
    if (gridEl) {
      e.preventDefault();
      gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/jewellery");
    }
  };

  return (
    <section
      aria-label="The Pendant Edit - GemRishi Handcrafted Gemstone Pendants"
      className={`relative w-full bg-[#FAF9F5] border-y border-stone-200/80 overflow-hidden py-10 sm:py-14 md:py-16 lg:py-20 select-none ${className}`}
    >
      {/* Dynamic Keyframe Styles for Subtle Idle Floating & Ambient Glint Sweeps */}
      <style>{`
        @keyframes pendantFloatCenter {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes pendantFloatTop {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pendantFloatBottom {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .anim-pendant-center {
          animation: pendantFloatCenter 5s ease-in-out infinite;
        }
        .anim-pendant-top {
          animation: pendantFloatTop 4.2s ease-in-out infinite 0.6s;
        }
        .anim-pendant-bottom {
          animation: pendantFloatBottom 4.6s ease-in-out infinite 1.2s;
        }
        .anim-pendant-center:hover,
        .anim-pendant-top:hover,
        .anim-pendant-bottom:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 sm:gap-12 lg:gap-8 xl:gap-14">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: EDITORIAL TYPOGRAPHY & CALL TO ACTIONS                       */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-[46%] xl:w-[44%] text-left z-10 flex flex-col items-start justify-center">
            
            {/* 1. Kicker / Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#264A3F] font-mono">
                THE PENDANT EDIT
              </span>
            </div>

            {/* 2. Main Title */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px] font-normal text-stone-900 tracking-tight leading-[1.12] sm:leading-[1.14]">
              A Little Light, <br />
              <span className="italic font-serif font-light text-stone-800">
                Close to the Heart
              </span>
            </h2>

            {/* 3. Subtle Elegant Divider Line */}
            <div className="w-14 h-[1.5px] bg-[#264A3F] my-4 sm:my-5" />

            {/* 4. Description Paragraph */}
            <p className="text-stone-600 text-sm sm:text-base md:text-[17px] font-light leading-relaxed max-w-lg mb-6 sm:mb-8 text-left">
              Discover gemstone pendants crafted to hold meaning, beauty, and timeless elegance.
            </p>

            {/* 5. Action Buttons & Navigation */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              {/* Primary CTA: Explore Pendants */}
              <button
                type="button"
                onClick={handleExploreClick}
                className="group relative inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 rounded-md bg-[#1A362D] hover:bg-[#122620] text-white text-xs sm:text-[13px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 shadow-[0_8px_20px_-4px_rgba(26,54,45,0.35)] hover:shadow-[0_12px_28px_-4px_rgba(26,54,45,0.45)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden"
              >
                {/* Subtle Shimmer Sheen on Button Hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-[260%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none -skew-x-12" />
                <span className="relative z-10">EXPLORE PENDANTS</span>
              </button>

              {/* Secondary CTA: Find Your Signature Piece */}
              <Link
                to="/suggest"
                className="group inline-flex items-center gap-2 py-2 text-stone-800 hover:text-[#264A3F] text-xs sm:text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 no-underline cursor-pointer"
              >
                <span>FIND YOUR SIGNATURE PIECE</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#264A3F] transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>

            {/* Trust Micro-Tagline */}
            <div className="mt-6 sm:mt-8 pt-4 border-t border-stone-200/70 w-full flex items-center gap-2 text-stone-500 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>100% Certified Natural Gemstones • Vedic Heart-Chakra Energized</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: 3-PENDANTS CREATIVE ASYMMETRIC COLLAGE                      */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-[54%] xl:w-[56%] relative flex items-center justify-center pt-4 lg:pt-0">
            
            {/* Background Graphic: Concentric Fine Rings matching the design */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[540px] md:h-[540px] lg:w-[580px] lg:h-[580px] pointer-events-none z-0">
              {/* Outer Ring 1 */}
              <div className="absolute inset-0 rounded-full border border-stone-300/40" />
              {/* Ring 2 */}
              <div className="absolute inset-8 sm:inset-12 rounded-full border border-stone-300/50" />
              {/* Ring 3 */}
              <div className="absolute inset-20 sm:inset-28 rounded-full border border-stone-300/60" />
              {/* Ring 4 (Inner subtle) */}
              <div className="absolute inset-32 sm:inset-44 rounded-full border border-stone-300/40" />
            </div>

            {/* Botanical Leaf Accents */}
            {/* Leaf 1: Top-Left of center card */}
            <div className="absolute top-2 left-6 sm:top-6 sm:left-14 lg:left-10 w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 pointer-events-none z-10 mix-blend-multiply opacity-85 transition-transform duration-700 hover:rotate-3">
              <img
                src="/botanical-leaf-top.png"
                alt=""
                className="w-full h-full object-contain drop-shadow-xs"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            {/* Leaf 2: Bottom-Right */}
            <div className="absolute -bottom-4 right-0 sm:bottom-0 sm:right-4 w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 pointer-events-none z-10 mix-blend-multiply opacity-80">
              <img
                src="/botanical-leaf-bottom.png"
                alt=""
                className="w-full h-full object-contain drop-shadow-xs"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            {/* Main Stage for the 3 Layered Floating Cards */}
            <div className="relative w-full max-w-[480px] sm:max-w-[540px] lg:max-w-[580px] h-[360px] sm:h-[440px] md:h-[490px] lg:h-[510px] z-20 flex items-center justify-center">

              {/* ------------------------------------------------------------------- */}
              {/* CARD 1: TOP-RIGHT - TEARDROP BLUE SAPPHIRE PENDANT CARD             */}
              {/* ------------------------------------------------------------------- */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-6 lg:right-4 z-20 anim-pendant-top">
                <Link
                  to="/jewellery/blue-sapphire-pendant"
                  title="Blue Sapphire Pendants - Click to view collection"
                  className="group relative block w-[130px] h-[135px] sm:w-[165px] sm:h-[175px] md:w-[185px] md:h-[195px] lg:w-[195px] lg:h-[205px] bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.10)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_24px_45px_-8px_rgba(37,99,235,0.28)] hover:border-blue-400/60 overflow-hidden cursor-pointer"
                >
                  {/* Subtle Shimmer Sweep on Card Hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[260%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none z-30 -skew-x-12" />

                  {/* Pendant Image Display */}
                  <div className="w-full h-full p-2 sm:p-3 flex items-center justify-center relative">
                    <img
                      src="/pendant-card-bluesapphire-2x.png"
                      alt="Royal Blue Sapphire Pendant on Silver Chain"
                      className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-108"
                      onError={(e) => {
                        e.currentTarget.src = "/uploads/subCategoryImg-1784117060167-355938531.webp";
                      }}
                    />
                  </div>

                  {/* Floating Action Pill Tag on Hover */}
                  <div className="absolute bottom-2 inset-x-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-900/90 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-medium tracking-wide shadow-sm">
                      Blue Sapphire
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </span>
                  </div>
                </Link>
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* CARD 2: CENTER - TALL OVAL EMERALD HALO PENDANT (MAIN CENTERPIECE)  */}
              {/* ------------------------------------------------------------------- */}
              <div className="absolute top-1/2 left-1/2 -translate-x-[48%] -translate-y-1/2 z-25 anim-pendant-center">
                <Link
                  to="/jewellery/emerald-pendant"
                  title="Emerald Pendants - Click to view collection"
                  className="group relative block w-[160px] h-[280px] sm:w-[210px] sm:h-[370px] md:w-[235px] md:h-[420px] lg:w-[250px] lg:h-[440px] bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 shadow-[0_22px_50px_-12px_rgba(0,0,0,0.14)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_28px_55px_-10px_rgba(5,150,105,0.32)] hover:border-emerald-500/60 overflow-hidden cursor-pointer"
                >
                  {/* Subtle Shimmer Sweep on Card Hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[260%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none z-30 -skew-x-12" />

                  {/* Emerald Halo Pendant Artwork */}
                  <div className="w-full h-full p-2.5 sm:p-3.5 flex items-center justify-center relative">
                    <img
                      src="/pendant-card-emerald-2x.png"
                      alt="Oval Emerald Diamond Halo Pendant on Fine Chain"
                      className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-106"
                      onError={(e) => {
                        e.currentTarget.src = "/uploads/subCategoryImg-1784117043583-960771548.webp";
                      }}
                    />
                  </div>

                  {/* Floating Action Pill Tag on Hover */}
                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A362D]/95 backdrop-blur-xs text-white text-[11px] sm:text-xs font-medium tracking-wide shadow-sm">
                      Emerald Halo
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* CARD 3: BOTTOM-LEFT - OVAL YELLOW SAPPHIRE PENDANT CARD             */}
              {/* ------------------------------------------------------------------- */}
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-6 lg:left-4 z-30 anim-pendant-bottom">
                <Link
                  to="/jewellery/yellow-sapphire-pendant"
                  title="Yellow Sapphire Pendants - Click to view collection"
                  className="group relative block w-[120px] h-[135px] sm:w-[155px] sm:h-[175px] md:w-[170px] md:h-[195px] lg:w-[180px] lg:h-[205px] bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.10)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_24px_45px_-8px_rgba(217,119,6,0.30)] hover:border-amber-400/60 overflow-hidden cursor-pointer"
                >
                  {/* Subtle Shimmer Sweep on Card Hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[260%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none z-30 -skew-x-12" />

                  {/* Pendant Image Display */}
                  <div className="w-full h-full p-2 sm:p-3 flex items-center justify-center relative">
                    <img
                      src="/pendant-card-yellowsapphire-2x.png"
                      alt="Golden Yellow Sapphire Pendant on Silver Chain"
                      className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-108"
                      onError={(e) => {
                        e.currentTarget.src = "/uploads/subCategoryImg-1784117010318-145675788.webp";
                      }}
                    />
                  </div>

                  {/* Floating Action Pill Tag on Hover */}
                  <div className="absolute bottom-2 inset-x-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-900/90 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-medium tracking-wide shadow-sm">
                      Yellow Sapphire
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </span>
                  </div>
                </Link>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
