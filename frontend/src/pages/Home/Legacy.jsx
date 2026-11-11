"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Keeps your exact imports
import ContainerImg from "../../../public/gemRishioldshop.jpeg";
import FrameImg from "../../../public/gemrishi histroy.jpeg";
import CompassImg from "../../assets/legacyphotos/kk.jpg";

const Legacy = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full py-5 lg:py-13 bg-[#FDFCF8] overflow-hidden font-sans">
      {/* --- BACKGROUND WATERMARK --- */}
      <div className="absolute top-4 lg:top-12 left-0 w-full flex justify-center pointer-events-none opacity-[0.03] select-none" aria-hidden="true">
        <span className="text-[120px] sm:text-[180px] lg:text-[280px] font-serif font-bold text-[#264A3F] leading-none m-0 p-0">
          1904
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        {/* --- LEFT: OPTIMIZED IMAGE COLLAGE --- */}
        {/* By adding padding, we prevent the absolutely positioned child images from causing horizontal scroll on mobile */}
        <div className="w-full flex justify-center py-6 lg:py-10">
          <div className="relative w-[80%] sm:w-[70%] lg:w-[85%] max-w-[450px]">
            {/* Decorative Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#264A3F]/5 rounded-full blur-3xl -z-10"></div>

            {/* 1. Main Large Image (Anchors the layout height) */}
            <div className="relative z-10 w-full rounded-sm shadow-2xl border-[6px] border-white overflow-hidden group">
              <img
                src={ContainerImg}
                alt="GemRishi Old Shop"
                width="450"
                height="350"
                className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-white text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium">
                  Established 1904
                </span>
              </div>
            </div>

            {/* 2. Compass Image (Top Left Floater) */}
            <div className="absolute -top-8 -left-8 sm:-top-12 sm:-left-12 z-20 w-[40%] rounded-sm shadow-xl border-4 border-white transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <img
                src={CompassImg}
                alt="Heritage Detail"
                width="180"
                height="180"
                className="w-full h-auto object-cover sepia-[0.2]"
              />
            </div>

            {/* 3. Frame Image (Bottom Right Floater) */}
            <div className="absolute -bottom-8 -right-8 sm:-bottom-12 sm:-right-12 z-20 w-[45%] rounded-sm shadow-xl border-4 border-white transform rotate-6 hover:rotate-0 transition-transform duration-500">
              <img
                src={FrameImg}
                alt="Gemstone History"
                width="200"
                height="200"
                className="w-full h-auto object-cover sepia-[0.2]"
              />
            </div>
          </div>
        </div>

        {/* --- RIGHT: CONTENT --- */}
        <div className="flex flex-col space-y-6 lg:space-y-8 text-center lg:text-left mt-4 lg:mt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-center lg:justify-start">
              <span className="inline-block px-4 py-1.5 bg-[#264A3F]/10 text-[#264A3F] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase rounded-full">
                Our History & Heritage
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 leading-[1.25]">
              Over a Century and Five Generations of Experience
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-5 text-gray-600 font-light text-base lg:text-lg leading-relaxed lg:border-l-2 lg:border-[#264A3F]/20 lg:pl-6 text-justify sm:text-center lg:text-left">
            <p>
              GemRishi, with over 120 years of legacy, stands for authenticity,
              craftsmanship, and trust. Rooted in a deep reverence for natural
              gemstones, our journey reflects a commitment to purity and
              astrological integrity.
            </p>
            <p>
              Since 1904, our fifth-generation experts and artisans have carried
              forward timeless traditions — carefully sourcing, evaluating, and
              hand-selecting gemstones that hold both natural beauty and
              spiritual significance.
            </p>
          </div>

          {/* Link Button */}
          <div className="pt-4 flex justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => navigate("/aboutUs")}
              aria-label="Read more about our rich history"
              className="group inline-flex items-center gap-3 text-[#264A3F] font-bold text-xs sm:text-sm uppercase tracking-[0.15em] border-b border-[#264A3F]/30 pb-1 hover:border-[#264A3F] transition-all duration-300 cursor-pointer"
            >
              Read more about our rich history
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Legacy;
