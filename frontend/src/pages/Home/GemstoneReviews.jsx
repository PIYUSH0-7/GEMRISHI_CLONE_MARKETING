"use client";

import React, { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Pari Joshi",
    rating: 5,
    text: "It was really an amazing experience. I am thankful for the genuine and original gemstone.",
    image: "./reviewgem1.jpeg",
    location: "Mumbai, India",
  },
  {
    name: "Amit Verma",
    rating: 4.5,
    text: "Overall, I have had a good experience with the Pukhraj stone and am satisfied with the results so far.",
    image: "./reviewgem2jpeg",
    location: "Delhi, India",
  },
  {
    name: "Rohit Malhotra",
    rating: 5,
    text: "From sourcing to delivery, everything was smooth. Genuine quality gemstones and great guidance.",
    image: "./reviewgem3.jpeg",
    location: "Bangalore, India",
  },
  {
    name: "Sneha Kulkarni",
    rating: 4.5,
    text: "Had rings made for panna and zircon. Using now and everything is good. Thanks to the team.",
    image: "./reviewgem4.jpeg",
    location: "Pune, India",
  },
];

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-0.5 leading-none">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className="fill-[#E8C46F] text-[#E8C46F] align-middle"
        />
      ))}
      {halfStar && (
        <Star
          size={14}
          className="fill-[#E8C46F] text-[#E8C46F] opacity-60 align-middle"
        />
      )}
    </div>
  );
};

export default function GemstoneReviews() {
  const scrollRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeout = useRef(null);

  // --- SMART AUTO-SCROLLER LOGIC ---
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId;
    // Increased speed (1.5 pixels per frame = ~90px per second)
    const speed = 0.5;

    const scroll = () => {
      if (!isInteracting) {
        el.scrollLeft += speed;
      }

      // Flawless Infinite Loop Math
      // We render 4 sets of reviews. When we scroll exactly halfway (2 sets), we seamlessly jump back to 0.
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft -= el.scrollWidth / 2;
      } else if (el.scrollLeft <= 0 && isInteracting) {
        // If the user swipes backwards past the start, jump to the middle to allow infinite reverse swiping!
        el.scrollLeft += el.scrollWidth / 2;
      }

      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isInteracting]);

  // Interaction Handlers (Pauses auto-scroll so the user can swipe comfortably)
  const handleTouchStart = () => {
    clearTimeout(interactionTimeout.current);
    setIsInteracting(true);
  };

  const handleTouchEnd = () => {
    // Wait 1 second after lifting finger before resuming, allowing native momentum scrolling to finish smoothly
    interactionTimeout.current = setTimeout(() => {
      setIsInteracting(false);
    }, 1000);
  };

  const handleMouseEnter = () => {
    clearTimeout(interactionTimeout.current);
    setIsInteracting(true);
  };

  const handleMouseLeave = () => {
    setIsInteracting(false);
  };

  return (
    <section className="w-full bg-[#FDFCF8] py-5 lg:py-13 overflow-hidden font-sans border-[#E8C46F]/20">
      {/* --- HEADER --- */}
      <div className="container mx-auto px-6 mb-12 lg:mb-16 text-center">
        <span className="text-[#E8C46F] text-[10px] font-bold tracking-[0.25em] uppercase mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-[1px] bg-[#E8C46F]"></span>
          Client Stories
          <span className="w-8 h-[1px] bg-[#E8C46F]"></span>
        </span>

        <h2 className="text-3xl md:text-5xl font-serif text-[#264A3F] leading-tight mb-4">
          Voices of <span className="italic text-gray-400">Trust</span>
        </h2>
      </div>

      {/* --- SCROLLING GALLERY --- */}
      <div className="relative w-full">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 lg:w-32 bg-gradient-to-r from-[#FDFCF8] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 lg:w-32 bg-gradient-to-l from-[#FDFCF8] to-transparent z-10 pointer-events-none"></div>

        {/* SWIPEABLE SCROLL CONTAINER */}
        <div
          ref={scrollRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex overflow-x-auto no-scrollbar py-4 cursor-grab active:cursor-grabbing"
        >
          {/* We render 4 sets to guarantee the container has enough width to loop seamlessly */}
          {[...reviews, ...reviews, ...reviews, ...reviews].map(
            (review, index) => (
              <div key={index} className="flex-shrink-0 px-3 lg:px-4">
                <div
                  className="
                    w-[280px] sm:w-[320px] lg:w-[350px]
                    flex flex-col h-full
                    bg-white p-6 lg:p-8 rounded-sm 
                    shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] 
                    border border-gray-100
                    hover:border-[#E8C46F]/30 hover:shadow-[0_15px_30px_-10px_rgba(38,74,63,0.1)]
                    transition-all duration-500 group
                "
                >
                  {/* Quote Icon */}
                  <Quote className="w-6 h-6 lg:w-8 h-8 text-[#E8C46F]/20 mb-4 lg:mb-6 group-hover:text-[#E8C46F] transition-colors duration-500" />

                  {/* Review Text */}
                  <p className="text-gray-600 font-serif text-base lg:text-lg italic leading-relaxed mb-6 lg:mb-8 flex-1">
                    "{review.text}"
                  </p>

                  {/* User Profile */}
                  <div className="flex items-center gap-4 pt-4 lg:pt-6 border-t border-gray-50 mt-auto">
                    <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border border-gray-100 group-hover:border-[#E8C46F] transition-colors flex-shrink-0">
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.target.src = "/placeholder-avatar.png")
                        }
                      />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h4 className="text-[#264A3F] text-xs lg:text-sm font-bold uppercase tracking-wide leading-tight">
                        {review.name}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 leading-none">
                        <div className="flex items-center">
                          <StarRating rating={review.rating} />
                        </div>

                        <span className="text-[10px] text-gray-400 font-medium flex items-center">
                          {review.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Hide the default browser scrollbar for a clean look */}
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
  );
}
