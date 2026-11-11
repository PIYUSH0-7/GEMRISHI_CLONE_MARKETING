"use client";

import React from "react";
import { ArrowRight, Play, MoveRight } from "lucide-react";

const youtubeVideos = [
  "https://www.youtube.com/embed/ZamC-c4obGM",
  "https://www.youtube.com/embed/YY1FlMlEhhc",
  "https://www.youtube.com/embed/djivPMg5tLc",
  "https://www.youtube.com/embed/lX8sOJ9mYsA",
  "https://www.youtube.com/embed/oOGhXwvTzq0",
];

export default function GemstoneEducationYoutubeSection() {
  return (
    <section className="w-full bg-[#FDFCF8] py-5 lg:py-13 font-sans relative overflow-hidden">
      {/* Decorative Gold Top Border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8C46F]/40 to-transparent"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* --- HEADER --- */}
        <div className="text-center mb-10 lg:mb-16 space-y-4">
          <span className="text-[#E8C46F] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-[#E8C46F]"></span>
            Masterclass Series
            <span className="w-8 h-[1px] bg-[#E8C46F]"></span>
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-[#264A3F] leading-tight">
            The Knowledge <span className="italic text-gray-400">Archive</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto font-light leading-relaxed">
            Curated insights into the astrological and geological significance
            of precious gemstones.
          </p>
        </div>

        {/* --- VIDEO GALLERY CONTAINER --- */}
        <div className="relative w-full">
          {/* Scrollable List - Clean (No Gradient Overlay) */}
          <div
            className="
            flex gap-5 overflow-x-auto pb-6 px-1
            snap-x snap-mandatory no-scrollbar 
            sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0
          "
          >
            {youtubeVideos.map((src, index) => (
              <div
                key={index}
                className="
                  group relative min-w-[280px] sm:min-w-0 snap-center
                  bg-white rounded-lg shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(38,74,63,0.15)] 
                  transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden
                "
              >
                {/* Rectangular Video Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <iframe
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                    src={src}
                    title={`Gemstone Education Video ${index + 1}`}
                    loading="lazy"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                  {/* Gold Border Overlay */}
                  <div className="absolute inset-0 border-[2px] border-transparent group-hover:border-[#E8C46F]/50 transition-colors duration-500 pointer-events-none z-10"></div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 shadow-lg">
                      <Play className="w-4 h-4 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* Footer Caption */}
                <div className="px-4 py-3 bg-white flex justify-between items-center border-t border-gray-50">
                  <span className="text-[#264A3F] text-[10px] font-bold uppercase tracking-widest group-hover:text-[#E8C46F] transition-colors">
                    Episode 0{index + 1}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-[#E8C46F] transition-colors duration-300"></div>
                </div>
              </div>
            ))}

            {/* Spacer for right padding to prevent cut-off on mobile */}
            <div className="min-w-[1px] h-full sm:hidden"></div>
          </div>

          {/* Minimal Swipe Hint (Optional - Clean and subtle) */}
          <div className="flex justify-center items-center gap-2 mt-2 lg:hidden opacity-40">
            <span className="text-[9px] uppercase tracking-widest text-[#264A3F]">
              Swipe for more
            </span>
            <MoveRight className="w-3 h-3 text-[#264A3F]" />
          </div>
        </div>

        {/* --- FOOTER LINK --- */}
        <div className="mt-12 text-center">
          <a
            href="https://www.youtube.com/@GemRishi"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Full Channel - GemRishi YouTube Channel"
            className="inline-flex items-center gap-3 px-8 py-3 border border-[#264A3F]/20 text-[#264A3F] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#264A3F] hover:text-white transition-all duration-300 rounded-sm"
          >
            View Full Channel <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
