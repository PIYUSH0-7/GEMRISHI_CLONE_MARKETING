"use client";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setWishlist } from "../redux/wishlistSlice";

// MUI Icons
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

// Framer Motion
import { AnimatePresence, motion } from "framer-motion";

// Components & Hooks
import { useGetWish } from "../hooks/usegetwish";
import CategoryModal from "../pages/HomeModal/CategoryModal";
import JewelleryModal from "../pages/HomeModal/JewelleryModal";
import { getProductUrl } from "../utils/productUrl";
// ===== Update by Pawan For currency ===============================================
import { CAMPAIGN_CONFIG, isCampaignActive } from "../config/campaignOffers.config.js";
import { useGetCategoryQuery, useGetJewelryCategoryQuery } from "../features/api/apiSlice";
import { ConvertFromINR, formatCurrency } from "../utils/currency";
import CurrencySelector from "./CurrencySelector";
// ====== Update by Pawan For currency ===============================================

// ==============================================================================
// 1. Skeleton Loader
// ==============================================================================
const NavbarSkeleton = () => (
  <div className="w-full flex flex-col bg-white animate-pulse">
    <div className="h-[40px] w-full bg-gray-50 border-b border-gray-200"></div>
    <div className="h-[70px] w-full bg-white border-b border-gray-200 flex justify-between items-center px-4 md:px-8">
      <div className="w-[100px] h-[40px] bg-gray-200 rounded-md"></div>
      <div className="hidden lg:flex gap-8">
        <div className="w-20 h-4 bg-gray-200 rounded-full"></div>
        <div className="w-20 h-4 bg-gray-200 rounded-full"></div>
        <div className="w-20 h-4 bg-gray-200 rounded-full"></div>
        <div className="w-20 h-4 bg-gray-200 rounded-full"></div>
      </div>
      <div className="flex gap-3">
        <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
        <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

// ==============================================================================
// 2. Typewriter Component
// ==============================================================================
const TypewriterText = () => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const words = ["100% Natural Gemstones", "Precisely Astrologically Matched",
    "Expertly Hand-Selected" , "Authentically Natural","Tailored to Your Birth Chart",  "Carefully Curated by Experts"];

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    if (!isDeleting) {
      if (currentIndex < currentWord.length) {
        const timer = setTimeout(() => {
          setDisplayText(currentWord.substring(0, currentIndex + 1));
          setCurrentIndex((prev) => prev + 1);
        },20);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setIsDeleting(true),1000);
        return () => clearTimeout(timer);
      }
    } else {
      if (currentIndex > 0) {
        const timer = setTimeout(() => {
          setDisplayText(currentWord.substring(0, currentIndex - 1));
          setCurrentIndex((prev) => prev - 1);
        }, 50);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    }
  }, [currentIndex, currentWordIndex, isDeleting, words]);

  return (
    <div className="text-sm font-medium text-[#264A3F] flex items-center min-w-[220px]">
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {displayText}
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="ml-1 text-[#264A3F]"
      >
        |
      </motion.span>
    </div>
  );
};

// ==============================================================================
// 3. Premium Dropdown Wrapper (Desktop)
// ==============================================================================
const PremiumDropdown = ({ children, wide = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      // Update by Pawan For reduce Loading time (was duration: 0.3)
      transition={{ duration: 0.5, ease: [0.6, 0, 1, 1] }}
      className="absolute top-[100%] left-1/2 -translate-x-[30%] pt-4 z-[100]"
    >
      <div className="relative">
        {/* arrow */}
        <div className="absolute -top-[6px] left-[30%] w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100 z-20 shadow-[-2px_-2px_4px_rgba(0,0,0,0.02)]"></div>

        <div
          className={`relative bg-white rounded-xl shadow-[0_24px_48px_-12px_rgba(38,74,63,0.14)] border border-gray-100/80 overflow-hidden backdrop-blur-sm ${
            wide ? "w-[1000px] max-w-[90vw]" : "min-w-[260px] w-max"
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#264A3F]/10"></div>
          <div className="max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==============================================================================
// 4. Main Navbar Component
// ==============================================================================
export default function Navbar({ handleLoginClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_URL;

  // -- State --
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);

  // Search States
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const headerRef = useRef(null);

  // Mobile States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  // -- Redux Data --
  const { wishlist, loading: isWishlistLoading } = useGetWish();
  const user = useSelector((state) => state.auth.userInfo);
  const insufficientStock = useSelector((state) => state.cart.insufficientStock);
  const cartItemsCount = useSelector((state) => state.cart.items.length);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const isLoggedIn = Boolean(user);

  const [isDataLoading, setIsDataLoading] = useState(true);

  // ===== Update by Pawan For reduce Loading time (start) =====
  //already cached
  const { data: categoryData } = useGetCategoryQuery();
  const { data: jewelleryData } = useGetJewelryCategoryQuery();

  // Once the menu data arrives, silently pre-download every icon image
  // in the background so it's already in the browser cache before the
  useEffect(() => {
    const urls = [];

    categoryData?.categories?.forEach((cat) =>
      cat?.subCategories?.forEach((item) => {
        if (item?.image?.url) urls.push(item.image.url);
      })
    );
    jewelleryData?.jewelryCategories?.forEach((cat) =>
      cat?.jewelrySubCategories?.forEach((item) => {
        if (item?.image?.url) urls.push(item.image.url);
      })
    );

    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [categoryData, jewelleryData]);
  // ===== Update by Pawan For reduce Loading time ==============================================
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isNavOpen]);

  useEffect(() => {
    if (!isWishlistLoading) setIsDataLoading(false);
  }, [isWishlistLoading]);

  useEffect(() => {
    if (wishlist?.length && !isWishlistLoading) {
      dispatch(setWishlist(wishlist));
    }
  }, [wishlist, dispatch, isWishlistLoading]);

  // Close search panels on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsResultsVisible(false);
        setIsSearchBarVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -- Handlers --
  const handleLogout = async () => {
    try {
      await axios.post(`${URL}/user/logout`, {}, { withCredentials: true });
      localStorage.removeItem("userInfo");
      dispatch({ type: "auth/clearUser" });
      navigate("/");
      setIsNavOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  const toggleSearchBar = () => {
    setIsSearchBarVisible((prev) => !prev);
    if (isSearchBarVisible) {
      setSearchQuery("");
      setSearchResults([]);
      setIsResultsVisible(false);
    }
  };

  const handleFullSearch = useCallback(
    (query) => {
      const trimmedQuery = query.trim();
      if (trimmedQuery !== "") {
        if (typeof window !== "undefined") {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "search",
            search_term: trimmedQuery,
          });
        }
        navigate(`/search-results?keyword=${encodeURIComponent(trimmedQuery)}`);
        setSearchQuery("");
        setSearchResults([]);
        setIsResultsVisible(false);
        setIsSearchBarVisible(false);
      }
    },
    [navigate],
  );

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFullSearch(searchQuery);
    }
  };

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (!isSearchBarVisible || trimmedQuery === "") {
      setSearchResults([]);
      setIsResultsVisible(false);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      setHasSearched(true);
      axios
        .get(`${URL}/product/search?keyword=${trimmedQuery}`)
        .then((res) => {
          const products = res.data?.products?.length
            ? res.data.products
            : res.data?.jeweleries?.length
              ? res.data.jeweleries
              : [];
          setSearchResults(products);
          setIsResultsVisible(true);
          setIsSearching(false);
        })
        .catch((err) => {
          setSearchResults([]);
          setIsResultsVisible(true);
          setIsSearching(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, URL, isSearchBarVisible]);
  // -------------------------add by Pawan---------------------------------
   const { currency, rates } = useSelector((s) => s.currency);
  const formatPrice = (price) =>  formatCurrency(ConvertFromINR(Number(price) || 0, rates, currency), currency);
  // -------------------------add by Pawan--------------------------------
  // 👑 Premium Desktop Search Results Mapping
  const renderPremiumDesktopResults = () => {
    const trimmedQuery = searchQuery.trim();
    const showNoResults = !isSearching && hasSearched && searchResults.length === 0 && trimmedQuery !== "";

    const isJewelry = (item) => !!item.jewelryName;
    const getName = (item) => (isJewelry(item) ? item.jewelryName : item.name);
    const getPrice = (item) => isJewelry(item) ? item.jewelryPrice : item.price;

    const handleClick = (item) => {
      const url = getProductUrl(item);
      setIsResultsVisible(false);
      setIsSearchBarVisible(false);
      navigate(url);
    };

    return (
      <div className="flex flex-col w-full">
        {isSearching && (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#264A3F] rounded-full animate-spin"></div>
            <p className="text-[11px] tracking-wider uppercase text-gray-400">Searching</p>
          </div>
        )}
        {!isSearching && searchResults.length > 0 && (
          <div className="px-6 pb-6 pt-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-3">Top Results</h4>
            <div className="space-y-0.5">
              {searchResults.slice(0, 5).map((item) => (
                <Link
                  key={item._id}
                  to={getProductUrl(item)}
                  onClick={() => {
                    setIsResultsVisible(false);
                    setIsSearchBarVisible(false);
                  }}
                  className="flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-300 group hover:bg-[#F9FAFB] hover:shadow-[0_2px_10px_rgba(38,74,63,0.06)]"
                >
                  <div className="w-14 h-14 shrink-0 bg-white border border-gray-100 rounded-lg flex justify-center items-center overflow-hidden">
                    <img
                      src={item.images?.[0]?.url || item.image || "/placeholder.svg"}
                      alt=""
                      className="w-10 h-10 object-contain mix-blend-darken group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-serif text-gray-900 truncate mb-1 group-hover:text-[#264A3F] transition-colors">{getName(item)}</p>
                    <p className="text-xs text-[#264A3F] font-bold tracking-wider uppercase">{formatPrice(getPrice(item))}</p>
                  </div>
                  <KeyboardArrowRightIcon className="text-gray-300 group-hover:text-[#264A3F] transform group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* View All Button */}
            {searchResults.length > 5 && (
              <button
                onClick={() => handleFullSearch(searchQuery)}
                className="w-full mt-4 py-3 bg-[#264A3F] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg hover:bg-gray-900 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                View All {searchResults.length} Results
              </button>
            )}
          </div>
        )}
        {showNoResults && (
          <div className="p-10 text-center">
            <p className="text-gray-400 font-serif text-lg italic">We couldn't find anything matching your search.</p>
            <p className="text-xs text-gray-500 mt-2">Try adjusting your keywords or browsing our collections.</p>
          </div>
        )}
      </div>
    );
  };

  // 📱 Standard Mobile Search Results Mapping
  const renderMobileSearchResults = () => {
    const trimmedQuery = searchQuery.trim();
    const showNoResults = !isSearching && hasSearched && searchResults.length === 0 && trimmedQuery !== "";

    const isJewelry = (item) => !!item.jewelryName;
    const getName = (item) => (isJewelry(item) ? item.jewelryName : item.name);
    const getPrice = (item) => isJewelry(item) ? item.jewelryPrice : item.price;
    const handleClick = (item) => {
      const url = getProductUrl(item);
      navigate(url);
      setIsResultsVisible(false);
      setSearchQuery("");
      setIsSearchBarVisible(false);
    };

    return (
      <>
        {isSearching && (
          <div className="p-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-[#264A3F] rounded-full animate-spin"></div>
            Searching...
          </div>
        )}
        {!isSearching && searchResults.length > 0 && (
          <>
            <div className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50">
              Results ({searchResults.length})
            </div>
            {searchResults.map((item) => (
              <Link
                key={item._id}
                to={getProductUrl(item)}
                onClick={() => {
                  setIsResultsVisible(false);
                  setIsSearchBarVisible(false);
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
              >
                <img
                  src={item.images?.[0]?.url || item.image || "/placeholder.svg"}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {getName(item)}
                  </p>

                  <p className="text-xs text-[#264A3F] font-semibold">
                    {formatPrice(getPrice(item))}
                  </p>
                </div>
                <KeyboardArrowRightIcon className="text-gray-300" style={{ fontSize: 18 }} />
              </Link>
            ))}
          </>
        )}
        {showNoResults && (
          <div className="p-6 text-center text-sm text-gray-500">No results found.</div>
        )}
      </>
    );
  };

  if (isDataLoading) return <NavbarSkeleton />;

  return (
    // -------------- for fix the Navbar ----------------------------------------------
    <div className="sticky top-0 z-[50]">
    <header className="w-full relative font-sans" ref={headerRef}>
      {/* 1. TOP BAR (Hidden on Mobile) */}
      <div className="hidden lg:block w-full bg-green-200 border-b border-gray-200 px-8 py-1 text-xs text-gray-600">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <Link to="/shipping"  target="_blank"
                     rel="noopener noreferrer">
            <span className="flex items-center text-black gap-1.5 font-bold">
              <span className="text-cyan-700 font-bold text-[12px] animate-pulse ">●</span> Free Shipping All Over India
            </span>
            </Link>
            <span className="text-gray-500 font-medium text-[13px]">|</span>
            <Link to="/return-policy"  target="_blank"
                   rel="noopener noreferrer">
            <span className="flex items-center gap-1.5 font-bold text-black">
              <span className="text-cyan-700 font-bold text-[12px] animate-pulse ">●</span> 10 Days No Hassle Returns
            </span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <TypewriterText />
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <span>Need Help?</span>
              <span className="text-[#264A3F]">+91 98179 75978</span>
            </div>
{/* -------------------------Add for currency by pawan--------------------------------*/}
 <div className="flex items-center sm:gap-4 relative z-50 border-none">
             <span className="text-gray-500 font-medium text-[13px]">|</span>
                <CurrencySelector/>
                </div>
{/* --------------------Add for currency by pawan--------------------------------------*/}
          </div>
        </div>
      </div>
      {/* 2. MAIN NAVBAR */}
      <div className="w-full bg-green-100 border-b border-gray-100 sticky top-0 z-[50] shadow-sm relative">
        <div className="container mx-auto px-4 sm:px-8 h-[40px] lg:h-[55px] flex items-center justify-between">
          {/* A. LOGO */}
          <div className="flex-shrink-0 cursor-pointer relative z-50 transition-transform duration-200 hover:scale-[1.02]" onClick={() => navigate("/")}>
            <img
              src="/GemRishi.svg"
              alt="GemRishi"
              width="160"
              height="45"
              className="h-[35px] lg:h-[45px] w-auto object-contain hover:opacity-95 transition-opacity"
            />
          </div>

          {/* B. DESKTOP NAV */}
          <nav className="hidden lg:flex flex-1 items-center justify-center px-8">
            <ul className="flex items-center gap-6 xl:gap-8">
              <li className="relative text-sm font-bold tracking-wide text-gray-700 transform transition-all duration-800 ease-in-out hover:scale-110 hover:text-sky-500 cursor-pointer group py-2" onClick={() => navigate("/")}>
                 HOME
                <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-[#264A3F] transition-all duration-300 group-hover:w-full"></span>
              </li>

              {/* Gemstones */}
              <li
                className="relative h-[75px] flex items-center group cursor-pointer"
                onMouseEnter={() => setHoveredMenu("gemstones")}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <div className="relative flex items-center gap-1 text-sm font-bold tracking-wide text-gray-700transform transition-all duration-800 ease-in-out hover:scale-110 hover:text-sky-500  py-2">
                 GEMSTONES{" "}
                  <KeyboardArrowDownIcon className={`w-4 h-4 transition-transform duration-300 ${hoveredMenu === "gemstones" ? "rotate-180" : ""}`} />
                  <span className={`absolute left-0 -bottom-0.5 h-[2px] bg-[#264A3F] transition-all duration-300 ${hoveredMenu === "gemstones" ? "w-full" : "w-0"}`}></span>
                </div>
                <AnimatePresence>
                  {hoveredMenu === "gemstones" && (
                    <PremiumDropdown wide align="left">
                      <CategoryModal
                        onHover={() => setHoveredMenu("gemstones")}
                        onMouseLeave={() => setHoveredMenu(null)}
                        setIsGemstonesHovered={() => { }}
                        closeNavbar={() => setHoveredMenu(null)}
                      />
                    </PremiumDropdown>
                  )}
                </AnimatePresence>
              </li>

              {/* Jewellery */}
              <li
                className="relative h-[75px] flex items-center group cursor-pointer"
                onMouseEnter={() => setHoveredMenu("jewellery")}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <div className="relative flex items-center gap-1 text-sm font-bold tracking-wide text-gray-700 transform transition-all duration-800 ease-in-out hover:scale-110 hover:text-sky-500 py-2">
             JEWELLERY{" "}
                  <KeyboardArrowDownIcon className={`w-4 h-4 transition-transform duration-300 ${hoveredMenu === "jewellery" ? "rotate-180" : ""}`} />
                  <span className={`absolute left-0 -bottom-0.5 h-[2px] bg-[#264A3F] transition-all duration-300 ${hoveredMenu === "jewellery" ? "w-full" : "w-0"}`}></span>
                </div>
                <AnimatePresence>
                  {hoveredMenu === "jewellery" && (
                    <PremiumDropdown>
                      <JewelleryModal
                        onHover={() => setHoveredMenu("jewellery")}
                        onMouseLeave={() => setHoveredMenu(null)}
                        closeNavbar={() => setHoveredMenu(null)}
                      />
                    </PremiumDropdown>
                  )}
                </AnimatePresence>
              </li>
              <li className="relative text-sm font-bold tracking-wide text-gray-700 transform transition-all duration-800 ease-in-out hover:scale-110 hover:text-sky-500 cursor-pointer group py-2">
              <a
              href="https://rudraksha.gemrishi.com/"
              target="_blank">
              RUDRAKSHA
              </a>
              </li>

              {/* Guidance dropdown (Gem Suggestion, Carat to Ratti, Buy Gemstone Online) */}
              <li
                className="relative h-[75px] flex items-center group cursor-pointer"
                onMouseEnter={() => setHoveredMenu("guidance")}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <div className="relative flex items-center gap-1 text-sm font-bold tracking-wide text-gray-700 transform transition-all duration-800 ease-in-out hover:scale-110 hover:text-sky-500 py-2">
                  GUIDANCE{" "}
                  <KeyboardArrowDownIcon className={`w-4 h-4 transition-transform duration-300 ${hoveredMenu === "guidance" ? "rotate-180" : ""}`} />
                  <span className={`absolute left-0 -bottom-0.5 h-[2px] bg-[#264A3F] transition-all duration-300 ${hoveredMenu === "guidance" ? "w-full" : "w-0"}`}></span>
                </div>
                <AnimatePresence>
                  {hoveredMenu === "guidance" && (
                    <PremiumDropdown>
                      <motion.div
                        className="p-2 min-w-[220px]"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: {
                            transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                          },
                        }}
                      >
                        {[
                          { label: "Gem Suggestion", path: "/suggest" },
                          { label: "Carat to Ratti", path: "/carat-to-ratti-converter" },
                          { label: "Buy Gemstone Online", path: "/buy_gemstone_online" },
                        ].map((item) => (
                          <motion.div
                            key={item.label}
                            variants={{
                              hidden: { opacity: 0, x: -8 },
                              visible: { opacity: 1, x: 0 },
                            }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 hover:text-[#264A3F] hover:pl-5 rounded-lg cursor-pointer transition-all duration-300"
                            onClick={() => { navigate(item.path); setHoveredMenu(null); }}
                          >
                            {item.label}
                          </motion.div>
                        ))}
                      </motion.div>
                    </PremiumDropdown>
                  )}
                </AnimatePresence>
              </li>
               <li className="relative text-sm font-bold tracking-wide text-gray-700 transform transition-all duration-800 ease-in-out hover:scale-110 hover:text-sky-500 cursor-pointer group py-2" onClick={() => window.open("https://gemrishi.com/blogs")}>
                BLOGS
                <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-[#264A3F] transition-all duration-300 group-hover:w-full"></span>
              </li>
              {isCampaignActive() && CAMPAIGN_CONFIG.ui.showNavbarLink && (
                <li className="relative text-sm font-bold tracking-wide text-green-800 hover:text-green-900 cursor-pointer py-1.5 px-3 rounded-full bg-[#F3EFE8] border border-red-300/80 hover:bg-green-200/80 transition-all flex items-center gap-1.5 shadow-2xs" onClick={() => navigate("/offers")}>
                  <span>{CAMPAIGN_CONFIG.ui.navbarBadgeText || "OFFERS"}</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                </li>
              )}
              {/* Add By Pawan For merge the options (start) - GemRishi Story dropdown replacing About/Contact/Locations */}
              <li
                className="relative h-[75px] flex items-center group cursor-pointer"
                onMouseEnter={() => setHoveredMenu("story")}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <div className="relative flex items-center gap-1 text-sm font-bold tracking-wide text-gray-700 transform transition-all duration-800 ease-in-out hover:scale-110 hover:text-sky-500 py-2">
                  GEMRISHI STORY{" "}
                  <KeyboardArrowDownIcon className={`w-4 h-4 transition-transform duration-300 ${hoveredMenu === "story" ? "rotate-180" : ""}`} />
                  <span className={`absolute left-0 -bottom-0.5 h-[2px] bg-[#264A3F] transition-all duration-300 ${hoveredMenu === "story" ? "w-full" : "w-0"}`}></span>
                </div>
                <AnimatePresence>
           {hoveredMenu === "story" && (
           <PremiumDropdown>
           {/* Add By Pawan For merge the options (start) - animated dropdown items */}
          <motion.div
           className="p-2 min-w-[220px]"
            initial="hidden"
            animate="visible"
            variants={{
            hidden: {},
            visible: {
            transition: { staggerChildren: 0.08, delayChildren: 0.05 },
          },
        }}
      >
        {[
          { label: "About", path: "/aboutUs" },
          { label: "Contact", path: "/contactUs" },
          { label: "Locations", path: "/locations" },
          // { label: "Buy Gemstone Online", path: "/buy_gemstone_online" },
        ].map((item) => (
          <motion.div
            key={item.label}
            variants={{
              hidden: { opacity: 0, x: -8 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 hover:text-[#264A3F] hover:pl-5 rounded-lg cursor-pointer transition-all duration-300"
            onClick={() => { navigate(item.path); setHoveredMenu(null); }}
          >
               {item.label}
               </motion.div>
                 ))}
               </motion.div>
              {/* Add By Pawan For merge the options (end) */}
           </PremiumDropdown>
              )}
         </AnimatePresence>
              </li>
              {/* Add By Pawan For merge the options (end) */}
            </ul>
          </nav>

          {/* C. RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-4 relative z-50">

            {/* 👑 LUXURY DESKTOP SEARCH BAR */}
            <div className="hidden lg:block relative">
              {/* Search Icon Trigger */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 ${isSearchBarVisible
                  ? "bg-[#264A3F] text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                  }`}
                onClick={() => toggleSearchBar()}
              >
                <SearchIcon style={{ fontSize: 22, fontWeight: 300 }} />
              </div>

              {/* Luxury Search Dropdown Panel */}
              <AnimatePresence>
                {isSearchBarVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-[130%] right-0 w-[480px] bg-white border border-gray-100 rounded-xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.18)] z-[100] overflow-hidden"
                  >
                    {/* The Input Section */}
                    <div className="p-4">
                      <div className="flex items-center border-b border-gray-300 focus-within:border-[#264A3F] pb-2 transition-colors duration-300">
                        <SearchIcon className="text-gray-400 mr-4" style={{ fontSize: 24 }} />
                        <input
                          type="text"
                          placeholder="What are you looking for?"
                          className="w-full bg-transparent outline-none text-l font-serif text-gray-900 placeholder-gray-400"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleSearchKeyPress}
                          autoFocus
                        />
                        {searchQuery && (
                          <button
                            onClick={() => { setSearchQuery(""); setIsResultsVisible(false); }}
                            className="text-[10px] font-bold tracking-[0.1em] text-gray-400 hover:text-gray-900 uppercase transition-colors ml-4"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Results Container */}
                    {isResultsVisible && renderPremiumDesktopResults()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ✅ MOBILE SEARCH ICON (Triggers Dropdown Below Navbar) */}
            <button
              type="button"
              aria-label="Search gemstones and jewelry"
              className={`lg:hidden w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-95 ${isSearchBarVisible ? "bg-[#264A3F] text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-200"
                }`}
              onClick={() => toggleSearchBar()}
            >
              <SearchIcon style={{ fontSize: 20 }} />
            </button>

            {/* Cart */}
            {!insufficientStock && (
              <button
                type="button"
                aria-label={`Shopping cart with ${cartItemsCount} items`}
                className="relative group cursor-pointer focus:outline-none"
                onClick={() => navigate("/shopping/cart")}
              >
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-transparent hover:bg-gray-50 flex items-center justify-center transition-all duration-300 text-gray-700 active:scale-95 hover:shadow-sm">
                  <ShoppingCartOutlinedIcon style={{ fontSize: 22 }} />
                </div>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* 🛡️ Fully Protected Wishlist (Guaranteed to open Login if not authenticated) */}
            {/* <div
              className="relative group cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isLoggedIn) {
                  navigate("/wishlist");
                } else {
                  handleLoginClick();
                }
              }}
            >
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-transparent hover:bg-gray-50 flex items-center justify-center transition-colors text-gray-700">
                <FavoriteBorderOutlinedIcon style={{ fontSize: 22 }} />
              </div>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div> */}

            {/* Desktop Auth / Profile */}
            {/* <div className="hidden lg:block">
              {isLoggedIn ? (
                <ProfileDropdown user={user} handleLogout={handleLogout} />
              ) : (
                <button className="px-6 py-2.5 bg-[#264A3F] text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#1a362e] hover:shadow-md transition-all transform active:scale-95 whitespace-nowrap" onClick={handleLoginClick}>
                  Log In
                </button>
              )}
            </div> */}

            {/* Mobile Hamburger Trigger */}
            <div className="lg:hidden ml-1">
              <button
                type="button"
                onClick={toggleNav}
                aria-label="Toggle navigation menu"
                className="text-[#264A3F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#264A3F]/40 rounded-full p-1.5 relative z-50 transition-transform duration-200 active:scale-90"
              >
                {isNavOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* ✅ MOBILE FLOATING SEARCH BAR */}
        <AnimatePresence>
          {isSearchBarVisible && (
            <>
              {/* Darkened backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 top-[60px] bg-black/40 backdrop-blur-[2px] z-[40]"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchBarVisible(false);
                  setIsResultsVisible(false);
                }}
              />

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden absolute top-[60px] left-0 w-full bg-white border-b border-gray-100 shadow-xl z-[45] overflow-visible"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center bg-gray-50 rounded-xl border border-[#264A3F] px-3 py-2.5 focus-within:shadow-md transition-shadow">
                      <SearchIcon className="text-gray-400 mr-2" style={{ fontSize: 20 }} />
                      <input
                        type="text"
                        placeholder="Search for gemstones, jewelry..."
                        className="w-full bg-transparent outline-none text-sm text-gray-800"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        autoFocus
                      />
                      {searchQuery && (
                        <CloseIcon
                          className="text-gray-400 ml-2 cursor-pointer hover:text-gray-600 transition-colors"
                          style={{ fontSize: 18 }}
                          onClick={() => {
                            setSearchQuery("");
                            setIsResultsVisible(false);
                          }}
                        />
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchBarVisible(false);
                        setIsResultsVisible(false);
                      }}
                      className="text-sm font-semibold text-gray-600 px-1 hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {isResultsVisible && (
                    <div className="mt-4 w-full bg-white border border-gray-100 rounded-xl shadow-inner max-h-[50vh] overflow-y-auto">
                      {renderMobileSearchResults()}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ----3. MOBILE SLIDE-IN MENU (DRAWER)----*/}
        <AnimatePresence>
          {isNavOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNavOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[90] lg:hidden" />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 left-0 h-full w-[80%] max-w-[320px] bg-white z-[100] shadow-2xl overflow-y-auto lg:hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <img src="/GemRishi.svg" alt="GemRishi Logo" width="130" height="35" className="h-[35px] w-auto" />
{/* ---------------------Add By Pawan For Currency for mobile-------------------------------- */}
                                <div className="px-5">
                                  <CurrencySelector/>
                                </div>
{/* ---------------------Add By Pawan For Currency for mobile------------------------------- */}
                  <button
                    type="button"
                    onClick={() => setIsNavOpen(false)}
                    aria-label="Close navigation menu"
                    className="text-gray-500 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-gray-50 active:scale-90"
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div className="p-4 flex flex-col h-[calc(100%-80px)] justify-between">
                  <nav className="flex flex-col gap-1.5">
                    <div className="p-3 text-gray-800 font-semibold hover:bg-gray-50 active:bg-gray-100 rounded-lg cursor-pointer flex items-center gap-3 transition-colors" onClick={() => { navigate("/"); setIsNavOpen(false); }}>Home</div>
                    <div className="border-b border-gray-50">
                      <div className="flex items-center justify-between p-3 text-gray-800 font-semibold hover:bg-gray-50 active:bg-gray-100 rounded-lg cursor-pointer transition-colors" onClick={() => setMobileMenuOpen(mobileMenuOpen === "gemstones" ? null : "gemstones")}>
                        <span>Gemstones</span>
                        <KeyboardArrowDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${mobileMenuOpen === "gemstones" ? "rotate-180" : ""}`} />
                      </div>
                      <AnimatePresence>
                        {mobileMenuOpen === "gemstones" && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50 rounded-lg mb-2">
                            <div className="p-2"><CategoryModal onHover={() => { }} onMouseLeave={() => { }} setIsGemstonesHovered={() => { }} closeNavbar={() => setIsNavOpen(false)} /></div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="border-b border-gray-50">
                      <div className="flex items-center justify-between p-3 text-gray-800 font-semibold hover:bg-gray-50 active:bg-gray-100 rounded-lg cursor-pointer transition-colors" onClick={() => setMobileMenuOpen(mobileMenuOpen === "jewellery" ? null : "jewellery")}>
                        <span>Jewellery</span>
                        <KeyboardArrowDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${mobileMenuOpen === "jewellery" ? "rotate-180" : ""}`} />
                      </div>
                      <AnimatePresence>
                        {mobileMenuOpen === "jewellery" && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50 rounded-lg mb-2">
                            <div className="p-2"><JewelleryModal onHover={() => { }} onMouseLeave={() => { }} closeNavbar={() => setIsNavOpen(false)} /></div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                     <div className="p-3 text-gray-800 font-semibold hover:bg-gray-50 active:bg-gray-100 rounded-lg cursor-pointer transition-colors" onClick={() => { window.open("https://rudraksha.gemrishi.com/"); setIsNavOpen(false); }}>Rudraksha</div>
                    <div className="p-3 text-gray-800 font-semibold hover:bg-gray-50 active:bg-gray-100 rounded-lg cursor-pointer transition-colors" onClick={() => { window.open("https://gemrishi.com/blogs"); setIsNavOpen(false); }}>Blogs</div>

                    {/* Guidance accordion (Gem Suggestion, Carat to Ratti, Buy Gemstone Online) */}
                    <div className="border-b border-gray-50">
                      <div
                        className="flex items-center justify-between p-3 text-gray-800 font-semibold hover:bg-gray-50 active:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        onClick={() => setMobileMenuOpen(mobileMenuOpen === "guidance" ? null : "guidance")}
                      >
                        <span>Guidance</span>
                        <KeyboardArrowDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${mobileMenuOpen === "guidance" ? "rotate-180" : ""}`} />
                      </div>
                      <AnimatePresence>
                        {mobileMenuOpen === "guidance" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-gray-50 rounded-lg mb-2"
                          >
                            <motion.div
                              className="p-2 flex flex-col"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                hidden: {},
                                visible: {
                                  transition: { staggerChildren: 0.07, delayChildren: 0.05 },
                                },
                              }}
                            >
                              {[
                                { label: "Gem Suggestion", path: "/suggest" },
                                { label: "Carat to Ratti", path: "/carat-to-ratti-converter" },
                                { label: "Buy Gemstone Online", path: "/buy_gemstone_online" },
                              ].map((item) => (
                                <motion.div
                                  key={item.label}
                                  variants={{
                                    hidden: { opacity: 0, x: -8 },
                                    visible: { opacity: 1, x: 0 },
                                  }}
                                  transition={{ duration: 0.25, ease: "easeOut" }}
                                  className="px-4 py-3 text-sm font-bold text-gray-800 hover:bg-white active:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                  onClick={() => { navigate(item.path); setIsNavOpen(false); }}
                                >
                                  {item.label}
                                </motion.div>
                              ))}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Add By Pawan For merge the options (start) - GemRishi Story accordion replacing About/Contact/Locations rows */}
                    <div className="border-b border-gray-50">
                      <div
                        className="flex items-center justify-between p-3 text-gray-800 font-semibold hover:bg-gray-50 active:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        onClick={() => setMobileMenuOpen(mobileMenuOpen === "story" ? null : "story")}
                      >
                        <span>GemRishi Story</span>
                        <KeyboardArrowDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${mobileMenuOpen === "story" ? "rotate-180" : ""}`} />
                      </div>
                      <AnimatePresence>
  {mobileMenuOpen === "story" && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden bg-gray-50 rounded-lg mb-2"
    >
      {/* Add By Pawan For merge the options (start) - animated mobile items, bold text */}
      <motion.div
        className="p-2 flex flex-col"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.07, delayChildren: 0.05 },
          },
        }}
      >
        {[
          { label: "About", path: "/aboutUs" },
          { label: "Contact", path: "/contactUs" },
          { label: "Locations", path: "/locations" },
          { label: "Buy Gemstone Online", path: "/buy_gemstone_online" },
        ].map((item) => (
          <motion.div
            key={item.label}
            variants={{
              hidden: { opacity: 0, x: -8 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="px-4 py-3 text-sm font-bold text-gray-800 hover:bg-white active:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            onClick={() => { navigate(item.path); setIsNavOpen(false); }}
          >
            {item.label}
          </motion.div>
        ))}
      </motion.div>
      {/* Add By Pawan For merge the options (end) */}
    </motion.div>
  )}
</AnimatePresence>
                    </div>
                    {/* Add By Pawan For merge the options (end) */}
                  </nav>
                  {/* <div className="mt-6 pt-6 border-t border-gray-100">
                    {isLoggedIn ? (
                      <div className="flex items-center gap-3 p-3 bg-[#264A3F]/5 rounded-xl cursor-pointer" onClick={() => navigate("/personal/profile")}>
                        <div className="w-10 h-10 bg-[#264A3F] rounded-full flex items-center justify-center text-white"><PersonOutlineIcon /></div>
                        <div><p className="text-sm font-bold text-[#264A3F]">{user?.name || "My Account"}</p><p className="text-xs text-gray-500">View Profile</p></div>
                      </div>
                    ) : (
                      <button className="w-full py-3 bg-[#264A3F] text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform" onClick={() => { handleLoginClick(); setIsNavOpen(false); }}>
                        Log In / Sign Up
                      </button>
                    )}
                  </div> */}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
    </div>
  );
}
