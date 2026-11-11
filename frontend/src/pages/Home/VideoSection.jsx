"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";

const gemstoneCards = [
  {
    title: "Yellow Sapphire",
    image: "/yellow sapphire.webp",
    path: "/gemstone/yellow-sapphire",
  },
  {
    title: "Emerald",
    image: "/emerald.webp",
    path: "/gemstone/emerald",
  },
];

export default function VideoSection() {
  const [isMuted, setIsMuted] = useState(true);
  const navigate = useNavigate();

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <section className="w-full flex flex-col lg:flex-row h-auto lg:h-[600px] bg-[#264A3F]">
      {/* ================= LEFT SIDE: VIDEO (Straight 50%) ================= */}
      <div className="relative w-full lg:w-1/2 h-[350px] lg:h-full">
        <video
          className="w-full h-full object-cover"
          src="/videos/mainvideo.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
        />

        {/* Simple dark tint for mute button visibility (No gradients) */}
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Mute Control */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute background video" : "Mute background video"}
          className="absolute bottom-6 left-6 z-20 p-2.5 rounded-full bg-black/40 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* ================= RIGHT SIDE: CONTENT (Straight 50%) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-12 lg:px-20 lg:py-0 bg-[#264A3F]">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F3D34] border border-[#3E7362] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-green-100">
              The Making
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif leading-[1.1] text-white">
              Discover the Journey of <br />
              <span className="text-[#E8C46F]">Authentic Gemstones</span>
            </h2>

            <p className="text-green-100/80 text-sm md:text-base font-light leading-relaxed max-w-md">
              Discover the beauty, power, and astrological significance of
              premium gemstones. Each stone is carefully selected for its
              natural brilliance, authenticity, and spiritual energy.
            </p>
          </div>

          {/* Cards Container */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-green-200/70 mb-6">
              Featured Collections
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              {gemstoneCards.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-5 group cursor-pointer p-3 rounded-xl hover:bg-[#1F3D34] transition-all duration-300 border border-transparent hover:border-[#3E7362]"
                >
                  {/* Image Box - Adjusted for perfect fitting */}
                  <div className="relative w-20 h-20 rounded-lg bg-[#1F3D34] border border-[#3E7362] flex items-center justify-center overflow-hidden flex-shrink-0 ">
                    <img
                      src={item.image}
                      alt={item.title}
                      width="80"
                      height="80"
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Text Info */}
                  <div className="flex flex-col items-start space-y-2">
                    <h3 className="text-base font-serif text-white transition-colors">
                      {item.title}
                    </h3>

                    {/* REFINED PREMIUM BUTTON */}
                    <div
                      className="inline-flex items-center gap-1.5 
  px-3 py-1.5 
  rounded-full 
  bg-[#E8C46F] 
  text-[#264A3F] 
  text-[10px] 
  font-medium 
  uppercase 
  tracking-wider
  transition-all duration-300
  hover:shadow-[0_6px_15px_rgba(232,196,111,0.3)]
  hover:-translate-y-0.5"
                    >
                      <span>View Details</span>
                      <span className="text-xs">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
