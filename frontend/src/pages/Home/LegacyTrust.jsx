"use client";

import React, { useRef, useState } from "react";
// ✅ IMPORTED Volume2 and VolumeX icons
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

// --- Video Component (Reusable) ---
const StoryCard = ({ src, poster, title, description }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // ✅ ADDED state to manage mute/unmute (defaulting to false so sound plays on click)
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // ✅ ADDED function to toggle volume
  const toggleMute = (e) => {
    e.stopPropagation(); // Prevents the video from pausing/playing when clicking the volume button
    setIsMuted(!isMuted);
  };

  return (
      <div className="group relative bg-white rounded-sm overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Video Container */}
        <div
            className="relative aspect-video w-full cursor-pointer"
            onClick={togglePlay}
        >
          <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={src}
              poster={poster}
              preload="none"
              muted={isMuted} // ✅ CHANGED from hardcoded 'muted' to dynamic state
              playsInline
              onEnded={() => setIsPlaying(false)}
          />

          {/* Custom Play Overlay */}
          <div
              className={`absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all duration-300 ${
                  isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
              }`}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              {isPlaying ? (
                  <Pause className="w-6 h-6 text-white fill-white" />
              ) : (
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
              )}
            </div>
          </div>

          {/* ✅ ADDED Volume Toggle Button */}
          <button
              onClick={toggleMute}
              className={`absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all duration-300 ${
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              }`}
          >
            {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
            ) : (
                <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 text-center bg-white relative z-10 -mt-2">
          <h3 className="text-xl font-serif text-[#264A3F] mb-3">{title}</h3>
          <p className="text-stone-500 text-sm font-light leading-relaxed px-4">
            {description}
          </p>

          {/* Decorative bottom line */}
          <div className="w-12 h-[1px] bg-[#264A3F]/20 mx-auto mt-6"></div>
        </div>
      </div>
  );
};

function LegacyTrust() {
  return (
      <section className="w-full font-sans py-5 lg:py-13 bg-[#F5F5F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* --- HEADER --- */}
          <div className="text-center mb-16 space-y-4">
          <span className="text-[#264A3F] text-[10px] font-bold tracking-[0.25em] uppercase">
            Our Promise
          </span>
            <h2 className="text-3xl md:text-5xl font-serif text-stone-900 leading-tight">
              A Legacy of Trust
            </h2>
            <p className="text-stone-500 text-base max-w-xl mx-auto">
              120 years of trust, authenticity, and craftsmanship captured in
              motion.
            </p>
          </div>

          {/* --- VIDEO GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <StoryCard
                src="/GR - WB 2 ( less ).mp4"
                poster="/gemvideo2_thumbnail.png"
                title="The Art of Process"
                description="From sourcing raw, authentic gemstones to the delicate hands of our master artisans, witness the journey of purity and precision."
            />

            <StoryCard
                src="/GR - WB 3 ( less ).mp4"
                poster="/gemvideo3_thumbnail.png"
                title="120 Years of Heritage"
                description="Since 1904, five generations have upheld a single promise: Uncompromised authenticity tailored for your spiritual journey."
            />
          </div>
        </div>
      </section>
  );
}

export default LegacyTrust;