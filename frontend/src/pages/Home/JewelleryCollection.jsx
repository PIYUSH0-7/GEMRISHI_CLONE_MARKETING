"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
//------------------Images------------------------
import Ring from "/4.png";
import Pendants from "/3.png";
import Bracelets from "/1.png";
import Earrings from "/2.png";
function JwelleryCollection() {
  const navigate = useNavigate();
  return (
    <section className="w-full bg-[#FCFCFA] py-5 lg:py-13 font-sans overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          {/* --- LEFT COLUMN: Editorial Typography & Actions --- */}
          <div className="w-full lg:w-5/12 space-y-6 md:space-y-8 z-10 text-center lg:text-left mt-4 md:mt-0">
            <div>
              {/* Premium Kicker */}
              <span className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#264A3F] mb-4">
                The Heritage Collection
              </span>
              <h2 className="text-4xl md:text-6xl lg:text-[60px] font-serif text-stone-900 leading-[1.1] mb-6">
                Unveil Your <br />
                <span className="italic font-light text-stone-700">
                  Inner Radiance
                </span>
              </h2>
              {/* Elegant thin divider */}
              <div className="w-12 h-[1px] bg-stone-300 mx-auto lg:mx-0 mb-6 md:mb-8"></div>
            </div>
            <p className="text-stone-500 text-sm md:text-base lg:text-lg leading-relaxed font-light max-w-md mx-auto lg:mx-0">
              Discover an exclusive curation of natural gemstones set in
              timeless, architectural designs. From vibrant sapphires to classic
              diamonds, find the piece that resonates with your legacy.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 md:pt-6 justify-center lg:justify-start w-full">
              {/* Premium Primary Button */}
              <button
                type="button"
                onClick={() => navigate("/jewelry")}
                className="w-full sm:w-auto px-10 py-4 bg-[#1A362D] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-stone-900 transition-all duration-500 shadow-[0_10px_30px_-10px_rgba(26,54,45,0.4)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] cursor-pointer"
              >
                Shop Collection
              </button>
              {/* Refined Secondary Link */}
              <button
                type="button"
                className="flex items-center justify-center gap-3 text-stone-500 hover:text-[#1A362D] transition-colors group text-xs font-bold uppercase tracking-widest w-full sm:w-auto py-2 sm:py-0 cursor-pointer"
                onClick={() => window.open("https://login.zaptriqai.com/widget/form/69da222e8059d", "_blank")}
              >
                <span className="relative overflow-hidden pb-1">
                  Create Your Dream Jewellery
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#1A362D] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500 ease-out" />
              </button>
            </div>
          </div>
          {/* --- RIGHT COLUMN: VISUALS (Unified Desktop & Mobile Collage) --- */}
          <div className="w-full lg:w-7/12 relative mt-10 lg:mt-0">
            {/* Decorative Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[500px] md:h-[500px] border border-stone-200/60 rounded-full z-0 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[700px] md:h-[700px] border border-stone-100 rounded-full z-0 pointer-events-none"></div>

            {/* Editorial Lookbook Collage Container (Scales based on screen size) */}
            <div className="relative h-[420px] md:h-[600px] lg:h-[700px] w-full z-10 max-w-[500px] md:max-w-none mx-auto">
              {/* 1. Main Centerpiece (Rings) */}
              <a
                 href="/jewelry"
                 aria-label="View fine rings collection - The Ring Edit"
                 onClick={(e) => { e.preventDefault(); navigate("/jewelry"); }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[280px] md:w-[340px] md:h-[460px] bg-[#FDFDFB] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] z-20 cursor-pointer group border border-stone-100 p-4 md:p-6 flex flex-col justify-between transition-transform duration-700 hover:-translate-y-[calc(50%+10px)]"
              >
                <div className="w-full h-[85%] flex items-center justify-center overflow-hidden mix-blend-darken">
                  <img
                    src={Ring}
                    alt="Diamond Ring"
                    width="300"
                    height="300"
                    className="w-[90%] h-auto object-contain transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="w-full text-center border-t border-stone-200 pt-2 md:pt-4">
                  <span className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-500 group-hover:text-[#1A362D] transition-colors">
                    The Ring Edit
                  </span>
                </div>
              </a>

              {/* 2. Top Right Floating (Earrings) */}
              <a
                href="/jewelry"
                aria-label="View fine earrings collection"
                onClick={(e) => { e.preventDefault(); navigate("/jewelry"); }}
                className="absolute top-4 right-0 md:top-4 md:right-8 w-[110px] h-[140px] md:w-[200px] md:h-[260px] bg-white shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] z-30 cursor-pointer group transition-all duration-700 hover:-translate-y-3 p-2 md:p-4 flex flex-col justify-between border border-stone-50"
              >
                <div className="h-full flex items-center justify-center overflow-hidden mix-blend-darken">
                  <img
                    src={Earrings}
                    alt="Earrings"
                    width="160"
                    height="160"
                    className="w-[80%] object-contain transition-transform duration-1000 ease-out group-hover:scale-110"
                  />
                </div>
              </a>

              {/* 3. Bottom Left Floating (Bracelets) */}
              <a
                 href="/jewelry"
                 aria-label="View fine bracelets collection"
                 onClick={(e) => { e.preventDefault(); navigate("/jewelry"); }}
                className="absolute bottom-4 left-0 md:bottom-8 md:left-8 w-[120px] h-[140px] md:w-[220px] md:h-[240px] bg-[#F9F9F8] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] z-30 cursor-pointer group transition-all duration-700 hover:-translate-y-3 p-2 md:p-4 flex flex-col justify-between border border-stone-100"
              >
                <div className="h-full flex items-center justify-center overflow-hidden mix-blend-darken">
                  <img
                    src={Bracelets}
                    alt="Bracelets"
                    width="180"
                    height="180"
                    className="w-[85%] object-contain transition-transform duration-1000 ease-out group-hover:scale-110"
                  />
                </div>
              </a>

              {/* 4. Top Left Floating Accent (Pendants) */}
              <a
               href="/jewelry"
               aria-label="View fine pendants collection"
               onClick={(e) => { e.preventDefault(); navigate("/jewelry"); }}
                className="absolute top-12 left-4 md:top-16 md:left-12 w-[90px] h-[90px] md:w-[160px] md:h-[160px] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] z-10 cursor-pointer group transition-all duration-700 hover:-translate-y-2 rounded-full flex items-center justify-center border border-stone-100 overflow-hidden"
              >
                <img
                  src={Pendants}
                  alt="Pendants"
                  width="120"
                  height="120"
                  className="w-[65%] h-[65%] object-contain mix-blend-darken opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JwelleryCollection;
