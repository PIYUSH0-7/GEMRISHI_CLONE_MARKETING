import { useEffect, useRef } from "react";

export default function CertificationsCarousel({ items }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const interval = setInterval(() => {
      scrollEl.scrollBy({
        left: 900,    // how much to move each step
        behavior: "smooth",
      });

      // if reached end, go back to start
      if (
        scrollEl.scrollLeft + scrollEl.clientWidth >=
        scrollEl.scrollWidth - 5
      ) {
        scrollEl.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, 2500); // auto scroll speed

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full py-6">
      <div
        ref={scrollRef}
        className="
          flex gap-12 overflow-x-scroll scrollbar-hide
          scroll-smooth
        "
      >
        {items.map((item) => (
          <img
            key={item.id}
            src={item.img}
            alt="cert"
            className="h-20 sm:h-24 object-contain"
          />
        ))}
      </div>
    </div>
  );
}
