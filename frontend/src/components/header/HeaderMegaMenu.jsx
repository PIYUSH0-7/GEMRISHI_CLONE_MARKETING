import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { FaGem } from "react-icons/fa";
import { GiBigDiamondRing } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import GemstonesMenuContent from "./GemstonesMenuContent";
import JewelleryMenuContent from "./JewelleryMenuContent";

export default function HeaderMegaMenu({
  activeMenu,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) {
  const menuRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  // 1. Focus scroll container when mega menu opens so arrow keys work immediately
  useEffect(() => {
    if (activeMenu && scrollContainerRef.current) {
      scrollContainerRef.current.focus({ preventScroll: true });
    }
  }, [activeMenu]);

  // 2. Smoothly dismiss mega menu ONLY when user scrolls the main page outside the mega menu
  useEffect(() => {
    if (!activeMenu) return;

    let ticking = false;
    const handleScroll = () => {
      // If user is actively hovering the menu, do NOT dismiss
      if (menuRef.current && menuRef.current.matches(":hover")) {
        return;
      }
      if (!ticking) {
        window.requestAnimationFrame(() => {
          onClose();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeMenu, onClose]);

  // 3. Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (activeMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu, onClose]);

  // 4. Keyboard Navigation: Escape to close, ArrowDown/Up, PageDown/Up, Home/End for smooth scrolling
  useEffect(() => {
    if (!activeMenu) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Do not intercept if user is typing in an input/textarea/select
      const tagName = document.activeElement?.tagName?.toLowerCase();
      if (tagName === "input" || tagName === "textarea" || tagName === "select") {
        return;
      }

      const container = scrollContainerRef.current;
      if (!container) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        container.scrollBy({ top: 90, behavior: "smooth" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        container.scrollBy({ top: -90, behavior: "smooth" });
      } else if (e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        e.preventDefault();
        container.scrollBy({ top: 320, behavior: "smooth" });
      } else if (e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        e.preventDefault();
        container.scrollBy({ top: -320, behavior: "smooth" });
      } else if (e.key === "Home") {
        e.preventDefault();
        container.scrollTo({ top: 0, behavior: "smooth" });
      } else if (e.key === "End") {
        e.preventDefault();
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMenu, onClose]);

  // 5. Forward wheel events from anywhere in the mega menu to the single scroll container
  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
      if (
        e.target !== scrollContainerRef.current &&
        !scrollContainerRef.current.contains(e.target)
      ) {
        scrollContainerRef.current.scrollBy({ top: e.deltaY, behavior: "auto" });
      }
    }
  };

  if (!activeMenu) return null;

  return (
    <AnimatePresence>
      {/* Invisible backdrop to catch clicks outside without dimming/blurring the background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 top-[135px] bg-transparent z-40 pointer-events-auto"
      />

      <motion.div
        ref={menuRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onWheel={handleWheel}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-2xl z-50 overflow-hidden font-sans"
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-5 sm:pt-6 pb-4 max-h-[82vh] flex flex-col">

          {/* Top Header Row of Mega Menu (Sticky shrink-0) */}
          <div className="relative flex items-center justify-center pb-3.5 border-b border-gray-200 mb-4 shrink-0">

            {activeMenu === "design" && (
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                {/* Left: Start with a Gemstone */}
                <div
                  onClick={() => {
                    onClose();
                    navigate("/gemstone");
                  }}
                  className="flex items-center justify-end sm:w-[250px] gap-2 text-sm sm:text-base font-bold text-[#1E3A34] tracking-wide cursor-pointer hover:text-[#D4AF37] transition-colors group"
                >
                  <FaGem className="text-lg sm:text-xl text-[#1E3A34] group-hover:text-[#D4AF37] transition-colors" />
                  <span>Start with a Gemstone</span>
                </div>

                {/* Center: OR */}
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  OR
                </span>

                {/* Right: Start with a Setting */}
                <div
                  onClick={() => {
                    onClose();
                    navigate("/jewellery");
                  }}
                  className="flex items-center justify-start sm:w-[250px] gap-2 text-sm sm:text-base font-bold text-[#1E3A34] tracking-wide cursor-pointer hover:text-[#D4AF37] transition-colors group"
                >
                  <GiBigDiamondRing className="text-lg sm:text-xl text-[#1E3A34] group-hover:text-[#D4AF37] transition-colors" />
                  <span>Start with a Setting</span>
                </div>
              </div>
            )}

            {/* These are left-aligned normally */}
            {activeMenu === "gemstones" && (
              <div className="w-full flex items-center gap-2.5 text-base font-bold text-[#1E3A34] tracking-wide">
                <FaGem className="text-xl text-[#1E3A34]" />
                <span>Shop 100% Natural Gemstones</span>
              </div>
            )}

            {activeMenu === "jewellery" && (
              <div className="w-full flex items-center gap-2.5 text-base font-bold text-[#1E3A34] tracking-wide">
                <GiBigDiamondRing className="text-xl text-[#1E3A34]" />
                <span>Shop Certified Jewellery & Settings</span>
              </div>
            )}

            {/* Close Button - Absolutely positioned to the right so it doesn't affect centering */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 text-gray-400 hover:text-gray-900 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Unified Single Scroll Container for ALL Body Content */}
          <div
            ref={scrollContainerRef}
            tabIndex={0}
            className="flex-1 overflow-y-auto overscroll-y-contain scroll-smooth outline-none pr-3 pb-4 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {activeMenu === "design" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                {/* Left Half: Gemstones */}
                <div className="pr-0 lg:pr-6 flex flex-col">
                  <GemstonesMenuContent onClose={onClose} />
                </div>
                {/* Right Half: Settings */}
                <div className="pt-6 lg:pt-0 lg:pl-10 flex flex-col">
                  <JewelleryMenuContent onClose={onClose} />
                </div>
              </div>
            )}

            {activeMenu === "gemstones" && (
              <div className="w-full flex flex-col">
                <GemstonesMenuContent isFullWidth={true} onClose={onClose} />
              </div>
            )}

            {activeMenu === "jewellery" && (
              <div className="w-full flex flex-col">
                <JewelleryMenuContent isFullWidth={true} onClose={onClose} />
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}