import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CAMPAIGN_CONFIG, isCampaignActive } from "../../config/campaignOffers.config.js";
import HeaderMegaMenu from "./HeaderMegaMenu";

// Desktop Dropdown Wrapper (Rendered on lg screens inside relative <li>)
const DesktopNavDropdownWrapper = ({
  children,
  align = "center",
  onMouseEnter,
  onMouseLeave,
}) => (
  <motion.div
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    initial={{ opacity: 0, y: 8, scale: 0.99 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 6, scale: 0.99 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className={`hidden lg:block absolute top-full pt-2 z-50 pointer-events-auto ${
      align === "left"
        ? "left-0"
        : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2"
    }`}
  >
    <div className="bg-white rounded-md shadow-2xl border border-gray-100 overflow-hidden min-w-[220px] w-max">
      <div className="w-full h-[2px] bg-[#D4AF37]" />
      <div className="max-h-[75vh] overflow-y-auto scroll-smooth [scrollbar-width:thin]">{children}</div>
    </div>
  </motion.div>
);

/**
 * HeaderNavbar: Category navigation bar visible on both Desktop & Mobile.
 * Desktop: Centered luxury links with snappy hover activation + click toggles.
 * Mobile: Fluid horizontally scrollable category bar with unclipped mobile dropdowns.
 */
export default function HeaderNavbar() {
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'design' | 'gemstones' | 'jewellery' | null
  const [hoveredSecondary, setHoveredSecondary] = useState(null); // 'guidance' | 'story' | null

  const hoverTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const secondaryCloseTimerRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        hoveredSecondary &&
        !e.target.closest(".nav-secondary-dropdown") &&
        !e.target.closest(".nav-secondary-trigger")
      ) {
        setHoveredSecondary(null);
      }
    };

    // Dismiss secondary dropdown on window scroll outside the navbar
    const handleWindowScroll = () => {
      if (document.querySelector(".nav-secondary-trigger:hover")) return;
      setHoveredSecondary(null);
    };
    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    const handleKey = (e) => {
      if (e.key === "Escape") {
        setHoveredSecondary(null);
        setActiveMegaMenu(null);
      }
    };

    if (hoveredSecondary) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, [hoveredSecondary]);

  // Snappy Desktop Mega Menu Hover Intent (60ms for instant, smooth hover response)
  const handleItemMouseEnter = (menuName) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (secondaryCloseTimerRef.current) {
      clearTimeout(secondaryCloseTimerRef.current);
      secondaryCloseTimerRef.current = null;
    }
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    setHoveredSecondary(null);

    if (activeMegaMenu) {
      setActiveMegaMenu(menuName);
    } else {
      hoverTimerRef.current = setTimeout(() => {
        setActiveMegaMenu(menuName);
      }, 60);
    }
  };

  const handleItemMouseLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  };

  const handleMenuMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMenuMouseLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    closeTimerRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  };

  // Secondary Dropdowns (Guidance & Story) Hover Management
  const handleSecondaryMouseEnter = (name) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (secondaryCloseTimerRef.current) clearTimeout(secondaryCloseTimerRef.current);

    setActiveMegaMenu(null);
    setHoveredSecondary(name);
  };

  const handleSecondaryMouseLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    secondaryCloseTimerRef.current = setTimeout(() => {
      setHoveredSecondary(null);
    }, 180);
  };

  const handleToggleClick = (menuName) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveMegaMenu((prev) => (prev === menuName ? null : menuName));
    setHoveredSecondary(null);
  };

  const handleCloseAll = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (secondaryCloseTimerRef.current) clearTimeout(secondaryCloseTimerRef.current);
    setActiveMegaMenu(null);
    setHoveredSecondary(null);
  };

  return (
    <div className="relative w-full" onMouseLeave={handleItemMouseLeave}>
      {/* Category Bar: Fully responsive on Desktop AND Mobile */}
      <nav className="w-full bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <ul className="flex items-center lg:justify-center gap-4 sm:gap-6 xl:gap-8 overflow-x-auto lg:overflow-visible scrollbar-none py-2.5 lg:py-0 text-[11.5px] sm:text-[12px] xl:text-[12.5px] font-bold tracking-[0.12em] lg:tracking-[0.14em] uppercase text-[#111827] whitespace-nowrap">

            {/* 1. DESIGN YOUR OWN */}
            <li
              className="relative shrink-0 lg:py-3.5"
              onMouseEnter={() => handleItemMouseEnter("design")}
            >
              <button
                type="button"
                onClick={() => handleToggleClick("design")}
                className={`flex items-center gap-1.5 min-h-[40px] lg:min-h-0 px-2.5 lg:px-0 rounded-full lg:rounded-none bg-gray-50 lg:bg-transparent transition-colors cursor-pointer ${
                  activeMegaMenu === "design"
                    ? "text-[#1E3A34] bg-emerald-50 lg:bg-transparent font-extrabold"
                    : "text-gray-800 hover:text-[#D4AF37]"
                }`}
              >
                <span>DESIGN YOUR OWN</span>
              </button>
              <span
                className={`hidden lg:block absolute bottom-0 left-0 h-[2.5px] bg-[#1E3A34] transition-all duration-300 ${
                  activeMegaMenu === "design" ? "w-full" : "w-0"
                }`}
              />
            </li>

            {/* 2. GEMSTONES */}
            <li
              className="relative shrink-0 lg:py-3.5"
              onMouseEnter={() => handleItemMouseEnter("gemstones")}
            >
              <button
                type="button"
                onClick={() => handleToggleClick("gemstones")}
                className={`flex items-center gap-1 min-h-[40px] lg:min-h-0 px-2.5 lg:px-0 rounded-full lg:rounded-none bg-gray-50 lg:bg-transparent transition-colors cursor-pointer ${
                  activeMegaMenu === "gemstones"
                    ? "text-[#1E3A34] bg-emerald-50 lg:bg-transparent font-extrabold"
                    : "text-gray-800 hover:text-[#D4AF37]"
                }`}
              >
                <span>GEMSTONES</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeMegaMenu === "gemstones" ? "rotate-180 text-[#1E3A34]" : ""
                  }`}
                />
              </button>
              <span
                className={`hidden lg:block absolute bottom-0 left-0 h-[2.5px] bg-[#1E3A34] transition-all duration-300 ${
                  activeMegaMenu === "gemstones" ? "w-full" : "w-0"
                }`}
              />
            </li>

            {/* 3. JEWELLERY */}
            <li
              className="relative shrink-0 lg:py-3.5"
              onMouseEnter={() => handleItemMouseEnter("jewellery")}
            >
              <button
                type="button"
                onClick={() => handleToggleClick("jewellery")}
                className={`flex items-center gap-1 min-h-[40px] lg:min-h-0 px-2.5 lg:px-0 rounded-full lg:rounded-none bg-gray-50 lg:bg-transparent transition-colors cursor-pointer ${
                  activeMegaMenu === "jewellery"
                    ? "text-[#1E3A34] bg-emerald-50 lg:bg-transparent font-extrabold"
                    : "text-gray-800 hover:text-[#D4AF37]"
                }`}
              >
                <span>JEWELLERY</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeMegaMenu === "jewellery" ? "rotate-180 text-[#1E3A34]" : ""
                  }`}
                />
              </button>
              <span
                className={`hidden lg:block absolute bottom-0 left-0 h-[2.5px] bg-[#1E3A34] transition-all duration-300 ${
                  activeMegaMenu === "jewellery" ? "w-full" : "w-0"
                }`}
              />
            </li>

            {/* 4. RUDRAKSHA */}
            <li
              className="relative shrink-0 lg:py-3.5"
              onMouseEnter={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                setActiveMegaMenu(null);
                setHoveredSecondary(null);
              }}
            >
              <a
                href="https://rudraksha.gemrishi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center min-h-[40px] lg:min-h-0 px-2.5 lg:px-0 text-gray-800 hover:text-[#D4AF37] transition-colors"
                onClick={handleCloseAll}
              >
                RUDRAKSHA
              </a>
              <span className="hidden lg:block absolute bottom-0 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-300 hover:w-full" />
            </li>

            {/* 5. GUIDANCE */}
            <li
              className="nav-secondary-trigger relative shrink-0 lg:py-3.5 group cursor-pointer"
              onMouseEnter={() => handleSecondaryMouseEnter("guidance")}
              onMouseLeave={handleSecondaryMouseLeave}
              onClick={() => setHoveredSecondary((prev) => (prev === "guidance" ? null : "guidance"))}
            >
              <div className="flex items-center gap-1 min-h-[40px] lg:min-h-0 px-2.5 lg:px-0 text-gray-800 hover:text-[#D4AF37] transition-colors">
                <span>GUIDANCE</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    hoveredSecondary === "guidance" ? "rotate-180 text-[#D4AF37]" : ""
                  }`}
                />
              </div>
              <span
                className={`hidden lg:block absolute bottom-0 left-0 h-[2px] bg-[#D4AF37] transition-all duration-300 ${
                  hoveredSecondary === "guidance" ? "w-full" : "w-0"
                }`}
              />

              {/* Desktop-only dropdown (anchored inside relative <li>) */}
              <AnimatePresence>
                {hoveredSecondary === "guidance" && (
                  <DesktopNavDropdownWrapper
                    onMouseEnter={() => handleSecondaryMouseEnter("guidance")}
                    onMouseLeave={handleSecondaryMouseLeave}
                  >
                    <div className="p-2 min-w-[220px] flex flex-col gap-1 text-[13px] tracking-normal font-semibold capitalize text-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/suggest");
                          handleCloseAll();
                        }}
                        className="px-4 py-2.5 text-left rounded-md hover:bg-[#FAF9F6] hover:text-[#1E3A34] transition-colors cursor-pointer"
                      >
                        Gem Suggestion
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/carat-to-ratti-converter");
                          handleCloseAll();
                        }}
                        className="px-4 py-2.5 text-left rounded-md hover:bg-[#FAF9F6] hover:text-[#1E3A34] transition-colors cursor-pointer"
                      >
                        Carat to Ratti Converter
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/buy-gemstone-online");
                          handleCloseAll();
                        }}
                        className="px-4 py-2.5 text-left rounded-md hover:bg-[#FAF9F6] hover:text-[#1E3A34] transition-colors cursor-pointer"
                      >
                        Buy Gemstone Online
                      </button>
                    </div>
                  </DesktopNavDropdownWrapper>
                )}
              </AnimatePresence>
            </li>

            {/* 6. BLOGS */}
            <li
              className="relative shrink-0 lg:py-3.5"
              onMouseEnter={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                setActiveMegaMenu(null);
                setHoveredSecondary(null);
              }}
            >
              <a
                href="https://gemrishi.com/blogs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center min-h-[40px] lg:min-h-0 px-2.5 lg:px-0 text-gray-800 hover:text-[#D4AF37] transition-colors"
                onClick={handleCloseAll}
              >
                BLOGS
              </a>
              <span className="hidden lg:block absolute bottom-0 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-300 hover:w-full" />
            </li>

            {/* 7. OFFERS */}
            {(!isCampaignActive || isCampaignActive()) && (
              <li
                className="relative shrink-0 lg:py-3.5"
                onMouseEnter={() => {
                  if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                  setActiveMegaMenu(null);
                  setHoveredSecondary(null);
                }}
              >
                <Link
                  to="/offers"
                  onClick={handleCloseAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF9F6] text-[#B91C1C] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors"
                >
                  <span>{CAMPAIGN_CONFIG?.ui?.navbarBadgeText || "OFFERS"}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                </Link>
              </li>
            )}

            {/* 8. GEMRISHI STORY */}
            <li
              className="nav-secondary-trigger relative shrink-0 lg:py-3.5 group cursor-pointer"
              onMouseEnter={() => handleSecondaryMouseEnter("story")}
              onMouseLeave={handleSecondaryMouseLeave}
              onClick={() => setHoveredSecondary((prev) => (prev === "story" ? null : "story"))}
            >
              <div className="flex items-center gap-1 min-h-[40px] lg:min-h-0 px-2.5 lg:px-0 text-gray-800 hover:text-[#D4AF37] transition-colors">
                <span>GEMRISHI STORY</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    hoveredSecondary === "story" ? "rotate-180 text-[#D4AF37]" : ""
                  }`}
                />
              </div>
              <span
                className={`hidden lg:block absolute bottom-0 left-0 h-[2px] bg-[#D4AF37] transition-all duration-300 ${
                  hoveredSecondary === "story" ? "w-full" : "w-0"
                }`}
              />

              {/* Desktop-only dropdown (anchored inside relative <li>) */}
              <AnimatePresence>
                {hoveredSecondary === "story" && (
                  <DesktopNavDropdownWrapper
                    align="right"
                    onMouseEnter={() => handleSecondaryMouseEnter("story")}
                    onMouseLeave={handleSecondaryMouseLeave}
                  >
                    <div className="p-2 min-w-[200px] flex flex-col gap-1 text-[13px] tracking-normal font-semibold capitalize text-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/aboutUs");
                          handleCloseAll();
                        }}
                        className="px-4 py-2.5 text-left rounded-md hover:bg-[#FAF9F6] hover:text-[#1E3A34] transition-colors cursor-pointer"
                      >
                        About Us
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/contactUs");
                          handleCloseAll();
                        }}
                        className="px-4 py-2.5 text-left rounded-md hover:bg-[#FAF9F6] hover:text-[#1E3A34] transition-colors cursor-pointer"
                      >
                        Contact Us
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/Locations");
                          handleCloseAll();
                        }}
                        className="px-4 py-2.5 text-left rounded-md hover:bg-[#FAF9F6] hover:text-[#1E3A34] transition-colors cursor-pointer"
                      >
                        Store Locations
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/certificate");
                          handleCloseAll();
                        }}
                        className="px-4 py-2.5 text-left rounded-md hover:bg-[#FAF9F6] hover:text-[#1E3A34] transition-colors cursor-pointer"
                      >
                        Lab Certificates
                      </button>
                    </div>
                  </DesktopNavDropdownWrapper>
                )}
              </AnimatePresence>
            </li>

          </ul>
        </div>
      </nav>

      {/* Mobile-Only Secondary Dropdown (Mounted OUTSIDE the <ul> so overflow-x-auto NEVER clips it!) */}
      <AnimatePresence>
        {hoveredSecondary && (
          <div className="nav-secondary-dropdown lg:hidden fixed inset-0 top-[110px] z-50 pointer-events-auto">
            {/* Backdrop to close on tap */}
            <div
              className="absolute inset-0 bg-black/25 backdrop-blur-xs"
              onClick={handleCloseAll}
            />

            {/* Floating Luxury Menu Card */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative mx-4 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-sm sm:max-w-md"
            >
              {/* Header Title + Close */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#FAF9F6] border-b border-gray-100">
                <span className="font-serif font-bold text-sm text-[#1E3A34] tracking-wide uppercase">
                  {hoveredSecondary === "guidance" ? "Guidance & Consultation" : "The GemRishi Story"}
                </span>
                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Gold luxury trim line */}
              <div className="w-full h-[2.5px] bg-[#D4AF37]" />

              {/* Menu Options */}
              <div className="p-2 flex flex-col divide-y divide-gray-100 text-sm font-semibold text-gray-800">
                {hoveredSecondary === "guidance" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/suggest");
                        handleCloseAll();
                      }}
                      className="min-h-[48px] px-4 py-3 text-left hover:bg-[#FAF9F6] hover:text-[#1E3A34] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Gem Suggestion</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/carat-to-ratti-converter");
                        handleCloseAll();
                      }}
                      className="min-h-[48px] px-4 py-3 text-left hover:bg-[#FAF9F6] hover:text-[#1E3A34] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Carat to Ratti Converter</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/buy-gemstone-online");
                        handleCloseAll();
                      }}
                      className="min-h-[48px] px-4 py-3 text-left hover:bg-[#FAF9F6] hover:text-[#1E3A34] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Buy Gemstone Online</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </>
                )}

                {hoveredSecondary === "story" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/aboutUs");
                        handleCloseAll();
                      }}
                      className="min-h-[48px] px-4 py-3 text-left hover:bg-[#FAF9F6] hover:text-[#1E3A34] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>About Us</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/contactUs");
                        handleCloseAll();
                      }}
                      className="min-h-[48px] px-4 py-3 text-left hover:bg-[#FAF9F6] hover:text-[#1E3A34] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Contact Us</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/Locations");
                        handleCloseAll();
                      }}
                      className="min-h-[48px] px-4 py-3 text-left hover:bg-[#FAF9F6] hover:text-[#1E3A34] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Store Locations</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/certificate");
                        handleCloseAll();
                      }}
                      className="min-h-[48px] px-4 py-3 text-left hover:bg-[#FAF9F6] hover:text-[#1E3A34] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Lab Certificates</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Mega Menu Overlay with cursor bridge */}
      <HeaderMegaMenu
        activeMenu={activeMegaMenu}
        onClose={handleCloseAll}
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
      />
    </div>
  );
}