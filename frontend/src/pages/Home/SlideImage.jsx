import { useState, useEffect, useCallback } from "react";

import bg1 from "../../assets/Slideimage/Sonam Bajwa 2.jpg.jpeg";
import bg2 from "../../assets/Slideimage/Rubina Dilaik 3.jpg.jpeg";
import bg3 from "../../assets/Slideimage/Bandaru Dattatraya.jpg.jpeg";
import bg4 from "../../assets/Slideimage/Karisma Kapoor.jpg.jpeg";
import bg5 from "../../assets/Slideimage/Rubina Dilaik 2.jpg.jpeg";
import bg6 from "../../assets/Slideimage/Mouni Roy.jpg.jpeg";
import bg7 from "../../assets/Slideimage/Malaika Arora.jpg.jpeg";
import bg8 from "../../assets/Slideimage/Arbaaz Khan.jpg.jpeg";
import bg9 from "../../assets/Slideimage/Sonam Bajwa.jpg.jpeg";
import bg10 from "../../assets/Slideimage/TiE CHANDIGARH.jpg.jpeg";

const baseImages = [
  { src: bg1, name: "Sonam Bajwa" },
  { src: bg2, name: "Rubina Dilaik" },
  { src: bg3, name: "Bandaru Dattatraya" },
  { src: bg4, name: "Karisma Kapoor" },
  { src: bg5, name: "Rubina Dilaik" },
  { src: bg6, name: "Mouni Roy" },
  { src: bg7, name: "Malaika Arora" },
  { src: bg8, name: "Arbaaz Khan" },
  { src: bg9, name: "Sonam Bajwa" },
  { src: bg10, name: "TiE Chandigarh" },
];

// Duplicated so the track always looks full on wide screens
const images = [...baseImages, ...baseImages];
const AUTO_DELAY = 2500;

export default function SlideImage() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // -------------------- Responsive --------------------
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Card size + gap (step must equal width + gap, otherwise the track drifts)
  const cardW = isMobile ? 190 : 330;
  const cardH = isMobile ? 260 : 380;
  const gap = isMobile ? 12 : 20;
  const step = cardW + gap;

  const next = useCallback(
    () => setCurrent((prev) => (prev + 1) % images.length),
    []
  );
  const prev = useCallback(
    () => setCurrent((p) => (p - 1 + images.length) % images.length),
    []
  );

  // -------------------- Auto slider --------------------
  // Stops while the cursor is on the slider, starts again when it leaves.
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(next, AUTO_DELAY);
    return () => clearInterval(interval);
  }, [paused, next]);

  // Tap / click on an image -> show that image and hold it
  const handleSelect = (index) => {
    setCurrent(index);
    setPaused(true);
  };

  const activeDot = current % baseImages.length;

  return (
    <section className="relative overflow-hidden py-10 md:py-14">
      {/* Blurred background that follows the active image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 transition-all duration-1000"
        style={{ backgroundImage: `url(${images[current].src})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90 backdrop-blur-xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-10">
          <span className="inline-block text-[#D4AF37] uppercase tracking-[0.35em] text-[10px] md:text-xs font-semibold">
            Our Gallery
          </span>

          <h2 className="mt-2 text-2xl md:text-4xl font-bold font-serif text-white">
            Celebrating Excellence
          </h2>

          <div className="mx-auto mt-3 h-[2px] w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

          <p className="mt-3 max-w-xl mx-auto text-white/70 text-xs md:text-sm leading-relaxed">
            Every photograph reflects our heritage, craftsmanship, and the
            trust we've built over generations.
          </p>
        </div>

        {/* Slider */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 md:w-32 z-20 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-32 z-20 bg-gradient-to-l from-black/70 to-transparent" />

          {/* Arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 h-9 w-9 md:h-11 md:w-11 rounded-full bg-white/10 hover:bg-[#D4AF37] text-white hover:text-black backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 h-9 w-9 md:h-11 md:w-11 rounded-full bg-white/10 hover:bg-[#D4AF37] text-white hover:text-black backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="overflow-hidden py-6">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                gap: `${gap}px`,
                transform: `translateX(calc(50% - ${current * step}px - ${
                  cardW / 2
                }px))`,
              }}
            >
              {images.map((img, index) => {
                const isActive = index === current;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(index)}
                    aria-label={`Show ${img.name}`}
                    aria-current={isActive}
                    className={`group relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] transition-all duration-700 ${
                      isActive
                        ? "scale-105 opacity-100 z-10 ring-2 ring-[#D4AF37] shadow-[0_0_45px_rgba(212,175,55,0.35)]"
                        : "scale-90 opacity-50 hover:opacity-80 shadow-xl"
                    }`}
                    style={{ width: cardW, height: cardH }}
                  >
                    <img
                      src={img.src}
                      alt={img.name}
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Counter + Dots */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <p className="text-white/60 text-xs tracking-widest">
            <span className="text-[#D4AF37] font-semibold">
              {String(activeDot + 1).padStart(2, "0")}
            </span>{" "}
            / {String(baseImages.length).padStart(2, "0")}
          </p>

          <div className="flex justify-center items-center gap-1.5">
            {baseImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                aria-label={`View slide ${i + 1}`}
                className="min-w-[24px] min-h-[24px] flex items-center justify-center p-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded cursor-pointer"
              >
                <span
                  className={`block rounded-full transition-all duration-500 ${
                    activeDot === i
                      ? "w-8 h-1.5 bg-[#D4AF37]"
                      : "w-2 h-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}