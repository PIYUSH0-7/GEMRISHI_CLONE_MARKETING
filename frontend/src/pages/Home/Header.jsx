"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GemstoneHero from "../../assets/PawanBackground.webp"
import MobileGemstoneHero from "../../assets/MobileGemstoneHero.webp"
import { FaOm } from "react-icons/fa";
import axios from "axios";
import {
  Search,
  ChevronDown,
  Diamond,
  Sparkles,
  ArrowDown,
  ShieldCheck,
  Award,
  Globe,
} from "lucide-react";

const URL = import.meta.env.VITE_URL || "http://localhost:7700/api/v1";

// Assets

// ====================================================================
// Modern Skeleton Loader
// ====================================================================
const HeaderSkeleton = () => (
  <div className="w-full min-h-[90vh] flex flex-col lg:flex-row px-6 lg:px-20 py-12 gap-12 bg-stone-50">
    <div className="w-full lg:w-1/2 space-y-6 animate-pulse mt-10">
      <div className="h-16 bg-gray-200 rounded-lg w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded w-full"></div>
      <div className="h-6 bg-gray-200 rounded w-2/3"></div>
      <div className="h-12 bg-gray-300 rounded-full w-48 mt-8"></div>
    </div>
    <div className="w-full lg:w-1/2 h-[500px] bg-gray-200 rounded-3xl animate-pulse"></div>
  </div>
);

// ====================================================================
// Premium CustomSelect Component
// ====================================================================
const CustomSelect = ({
  options,
  value,
  onChange,
  loading = false,
  placeholder = "Select an option",
  hasError = false, // Added error prop for validation UI
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (selectedValue) => {
    setIsOpen(false);
    if (onChange) onChange(selectedValue);
  };

  return (
    <div className="relative w-full group" ref={selectRef}>
      <div
        className={`w-full h-[56px] bg-white border text-stone-700
                font-medium px-5 rounded-xl transition-all duration-300
                hover:shadow-md cursor-pointer flex items-center justify-between
                ${hasError
            ? "border-red-400 ring-1 ring-red-400/50" // Error styling
            : isOpen
              ? "border-[#264A3F] ring-1 ring-[#264A3F]"
              : "border-stone-200 hover:border-[#264A3F]"
          }
                ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={() => !loading && setIsOpen(!isOpen)}
      >
        <span
          className={`text-base ${!value ? (hasError ? "text-red-400" : "text-stone-400") : "text-[#264A3F]"}`}
        >
          {loading ? "Loading..." : value || placeholder}
        </span>
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#264A3F]"></div>
        ) : (
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${hasError ? "text-red-400" : "text-stone-400"
              } ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {isOpen && !loading && options.length > 0 && (
        <ul className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-stone-100 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
          {options.map((option, index) => (
            <li
              key={index}
              className={`py-3 px-5 cursor-pointer text-sm font-medium transition-colors duration-200
                  ${option === value
                  ? "bg-[#264A3F]/5 text-[#264A3F]"
                  : "text-stone-600 hover:bg-stone-50 hover:text-[#264A3F]"
                }`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ====================================================================
// Main Header Component
// ====================================================================
function Header() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("gemstone");
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedGemstone, setSelectedGemstone] = useState(null);

  // -------- Add By Pawan (Carat / Ratti) --------------
  const [weightUnit, setWeightUnit] = useState("carat");
  const [selectedWeight, setSelectedWeight] = useState(null);

  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Validation State
  const [showError, setShowError] = useState(false);

  const caratWeightOptions = [
    "Below 3 Carat",
    "3-5 Carat",
    "5-7 Carat",
    "7-8 Carat",
    "8 Carat+",
  ];

  const rattiWeightOptions = [
    "Below 3 Ratti",
    "3-5 Ratti",
    "5-7 Ratti",
    "7-8 Ratti",
    "8 Ratti+",
  ];
// -------- Add By Pawan (Carat / Ratti) --------------
  const priceOptions = [
    "Under Rs.10,000",
    "Rs.10,000 - Rs.25,000",
    "Rs.25,000 - Rs.50,000",
    "Above Rs.50,000",
  ];
  const purposeOptions = [
    "Health",
    "Career",
    "Education",
    "Relationship",
  ];
  const fallbackOptions = [
    "Blue Sapphire",
    "Cats Eye",
    "Emerald",
    "Hessonite",
    "Pearl",
    "Ruby",
    "Yellow Sapphire",
    "Red Coral",
  ];

  // -------- Add By Pawan (Carat / Ratti) --------------
  const weightOptions =
    weightUnit === "carat" ? caratWeightOptions : rattiWeightOptions;
// -------- Add By Pawan (Carat / Ratti) --------------
  useEffect(() => {
    const fetchData = async () => {
      if (!URL) {
        setAllSubcategories(fallbackOptions);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${URL}/subcategory/get-subcategories`);
        const subcategories = response.data?.subcategories || [];
        const names = subcategories
          .map((sub) => sub.name)
          .filter((name) => name && name.trim());
        const unique = [...new Set(names)];
        setAllSubcategories(unique.length > 0 ? unique : fallbackOptions);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setAllSubcategories(fallbackOptions);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

 // -------- Add By Pawan (Carat / Ratti) --------------
  useEffect(() => {
    setShowError(false);
    if (selectedFilter === "gemstone") {
      setSelectedGemstone(null);
      setSelectedWeight(null);
      setSelectedPrice(null);
    } else {
      setSelectedPurpose(null);
    }
  }, [selectedFilter]);

  // Clear error automatically when user selects a value
  useEffect(() => {
    if (selectedGemstone || selectedPurpose) {
      setShowError(false);
    }
  }, [selectedGemstone, selectedPurpose]);

 // -------- Add By Pawan (Carat / Ratti) --------------
  const handleWeightUnitChange = (unit) => {
    setWeightUnit(unit);
    setSelectedWeight(null);
  };

  const getCaratRange = (opt) =>
    ({
      "Below 3 Carat": { minCarat: 0, maxCarat: 3 },
      "3-5 Carat": { minCarat: 3, maxCarat: 5 },
      "5-7 Carat": { minCarat: 5, maxCarat: 7 },
      "7-8 Carat": { minCarat: 7, maxCarat: 8 },
      "8 Carat+": { minCarat: 8, maxCarat: 100 },
    })[opt] || null;

  const getRattiRange = (opt) =>
    ({
      "Below 3 Ratti": { minRatti: 0, maxRatti: 3 },
      "3-5 Ratti": { minRatti: 3, maxRatti: 5 },
      "5-7 Ratti": { minRatti: 5, maxRatti: 7 },
      "7-8 Ratti": { minRatti: 7, maxRatti: 8 },
      "8 Ratti+": { minRatti: 8, maxRatti: 100 },
    })[opt] || null;
// -------- Add By Pawan (Carat / Ratti) --------------
  const getPriceRange = (opt) =>
    ({
      "Under Rs.10,000": { minPrice: 0, maxPrice: 10000 },
      "Rs.10,000 - Rs.25,000": { minPrice: 10000, maxPrice: 25000 },
      "Rs.25,000 - Rs.50,000": { minPrice: 25000, maxPrice: 50000 },
      "Above Rs.50,000": { minPrice: 50000, maxPrice: 1000000 },
    })[opt] || null;

  const handleSearch = async () => {
    if (isSearching) return;

    if (selectedFilter === "gemstone" && !selectedGemstone) {
      setShowError(true);
      return;
    }
    if (selectedFilter === "purpose" && !selectedPurpose) {
      setShowError(true);
      return;
    }

    try {
      setIsSearching(true);

      if (selectedFilter === "gemstone") {
        const searchParams = new URLSearchParams();
        let slug = selectedGemstone.toLowerCase().replace(/[^a-z0-9]/g, "-");

        searchParams.append("subcategory", selectedGemstone);

       // -------- Add By Pawan (Carat / Ratti) --------------
        if (weightUnit === "carat") {
          const cRange = getCaratRange(selectedWeight);
          if (cRange) {
            searchParams.append("minCarat", cRange.minCarat);
            searchParams.append("maxCarat", cRange.maxCarat);
          }
        } else {
          const rRange = getRattiRange(selectedWeight);
          if (rRange) {
            searchParams.append("minRatti", rRange.minRatti);
            searchParams.append("maxRatti", rRange.maxRatti);
          }
        }
// -------- Add By Pawan (Carat / Ratti) --------------
        const pRange = getPriceRange(selectedPrice);
        if (pRange) {
          searchParams.append("minPrice", pRange.minPrice);
          searchParams.append("maxPrice", pRange.maxPrice);
        }

        const queryString = searchParams.toString();
        navigate(
          queryString
            ? `/gemstone/filter/${slug}?${queryString}`
            : `/gemstone/${slug}`
        );
      } else if (selectedPurpose) {
        // Navigate to purpose-specific route
        const slug = selectedPurpose.toLowerCase().replace(/[^a-z0-9]/g, "-");
        navigate(`/gemstone/purpose/${slug}?purpose=${selectedPurpose}`);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) return <HeaderSkeleton />;

  return (
    <section className="relative w-full min-h-[80vh] bg-[#FDFCF8] flex flex-col justify-center font-sans py-4 z-20">
      {/* ================= BACKGROUND LAYERS ================= */}
      <div
        className="hidden lg:block absolute inset-0 bg-cover bg-center lg:bg-right w-full h-[86vh] "
        style={{ backgroundImage: `url(${GemstoneHero})` }}
      ></div>
      {/* Mobile Background */}
{/* <div
  className="absolute inset-0 block md:hidden bg-cover bg-center w-full h-[27vh]"
  style={{ backgroundImage: `url(${MobileGemstoneHero})` }}
></div> */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#264A3F]/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-amber-50/60 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/80 to-transparent"></div>
      </div>

      <div className="w-full max-w-6xl px-6 lg:px-12 pt-12 pb-24 lg:py-0 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-start gap-12 lg:gap-16 relative">
          {/* ================= LEFT SECTION: Filter Card ================= */}
          <div className="w-full lg:w-[45%] max-w-[340px] relative -translate-y-10 lg:-translate-0 z-10 lg:ml-35">
            <span className="inline-flex items-center gap-2 px-6 py-1 ml-18 lg:ml-11 rounded-full bg-[#264A3F]/5 text-[#264A3F] text-[10px] lg:text-sm font-bold tracking-widest uppercase mb-2 border border-[#264A3F]/10">
              <FaOm  size={12}  className="animate-pulse text-green-700"/> Authentic Vedic Gems
            </span>
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 p-1 px-3 md:px-6 md:p-2 rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_35px_70px_-15px_rgba(38,74,63,0.15)]">
              <div className="text-center mb-4 p-1">
                <h2 className="text-[20px] font-serif text-stone-800">
                  Find Your Gem
                </h2>
                <p className="text-sky-500 text-[15px] mt-0.2">
                  Begin your journey here
                </p>
              </div>
              <div className="flex bg-stone-100 p-0.5 rounded-xl mb-3 relative">
                <div
                  className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[0.6rem] shadow-md transition-all duration-300 ease-out ${selectedFilter === "purpose" ? "translate-x-[calc(100%+12px)]" : "translate-x-0"}`}
                ></div>
                <button
                  className={`flex-1 relative z-10 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold transition-colors duration-300 ${selectedFilter === "gemstone" ? "text-[#264A3F]" : "text-stone-500"}`}
                  onClick={() => setSelectedFilter("gemstone")}
                >
                  By Gemstone
                </button>
                <button
                  className={`flex-1 relative z-10 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold transition-colors duration-300 ${selectedFilter === "purpose" ? "text-[#264A3F]" : "text-stone-500"}`}
                  onClick={() => setSelectedFilter("purpose")}
                >
                  By Purpose
                </button>
              </div>

              <div className="space-y-0.5 relative">
                {selectedFilter === "gemstone" ? (
                  <>
                    <CustomSelect
                      options={allSubcategories}
                      value={selectedGemstone}
                      onChange={setSelectedGemstone}
                      loading={loading}
                      placeholder="Select Gemstone *"
                      hasError={showError && !selectedGemstone}
                    />

                    {/* -------- Add By Pawan (Carat / Ratti) --------------*/}
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1 px-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                          Weight
                        </span>
                        <div className="flex bg-stone-100 rounded-full p-0.5">
                          <button
                            type="button"
                            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors duration-200 ${
                              weightUnit === "carat"
                                ? "bg-[#264A3F] text-white"
                                : "text-stone-500"
                            }`}
                            onClick={() => handleWeightUnitChange("carat")}
                          >
                            Carat
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors duration-200 ${
                              weightUnit === "ratti"
                                ? "bg-[#264A3F] text-white"
                                : "text-stone-500"
                            }`}
                            onClick={() => handleWeightUnitChange("ratti")}
                          >
                            Ratti
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CustomSelect
                          options={weightOptions}
                          value={selectedWeight}
                          onChange={setSelectedWeight}
                          placeholder={
                            weightUnit === "carat"
                              ? "Carat Weight"
                              : "Ratti Weight"
                          }
                        />
                        <CustomSelect
                          options={priceOptions}
                          value={selectedPrice}
                          onChange={setSelectedPrice}
                          placeholder="Price Range"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-6">
                    <CustomSelect
                      options={purposeOptions}
                      value={selectedPurpose}
                      onChange={setSelectedPurpose}
                      placeholder="Select Purpose (e.g. Health) *"
                      hasError={showError && !selectedPurpose}
                    />
                  </div>
                )}
              </div>
              {/* Validation Error Feedback */}
              <div className="h-2 mt-2 flex items-center justify-center">
                {showError && (
                  <span className="text-red-500 text-xs font-semibold animate-in fade-in slide-in-from-bottom-1">
                    {selectedFilter === "gemstone"
                      ? "Please select a gemstone to continue."
                      : "Please select a purpose to continue."}
                  </span>
                )}
              </div>
  {/* --------------- Add By Pawan (Carat / Ratti) ------------------- */}
              <button
                className={`w-full mt-0.5 h-11 sm:h-12 md:h-14 text-base md:text-lg bg-gradient-to-l from-blue-900  via-cyan-400 to-green-800 text-white rounded-xl shadow-xl hover:scale-104 hover:shadow-2xl transition-all duration-300 text-lg flex items-center justify-center gap-2 group ${isSearching ? "opacity-75 cursor-not-allowed" : "active:scale-[0.98]"}`}
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="flex items-center gap-2 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Searching...
                  </span>
                ) : (
                  <>
                    Search Now
                    <Search
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </div>
            {/* TRUST INDICATORS */}
            <div className="pt-2 flex flex-row  gap-2  pl-10 md:pl-3.5">
              <div className="flex items-center gap-2 text-stone-500">
                <ShieldCheck size={25} className="text-[#264A3F]" />
                <span className="text-xs lg:text-sm font-semibold uppercase tracking-wide">
                  100% Certified
                </span>
              </div>
              <div className="flex items-center gap-2 text-stone-500">
                <Award size={25} className="text-[#264A3F]" />
                <span className=" text-xs lg:text-sm font-semibold uppercase tracking-wide">
                  Est. 1904
                </span>
              </div>
              <div className="flex items-center gap-2 text-stone-500">
                <Globe size={25} className="text-[#264A3F]" />
                <span className="text-xs lg:text-sm font-semibold uppercase tracking-wide">
                  Shipping Globally
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce opacity-50">
        <span className="text-[10px] uppercase tracking-widest text-[#264A3F]">
          Scroll
        </span>
        <ArrowDown size={16} className="text-[#264A3F]" />
      </div>
    </section>
  );
}

export default Header;