import { fbqTrack, fbqTrackCustom } from "../../utils/metaPixel";
"use client";

import axios from "axios";
import { MessageCircle, Phone, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import StoneImg from "../../assets/Logo.svg";
import Card from "../../components/Card";
import VideoModal from "../../components/models/VideoModal";
import WishlistButton from "../../components/wishlistButton";
import { getProductUrl } from "../../utils/productUrl";
// ----------------Add By Pawan For the currency--------------------------------
import { FaRegThumbsUp } from "react-icons/fa";
import { IoDiamondOutline } from "react-icons/io5";
import { LiaCrownSolid } from "react-icons/lia";
import { SlBadge } from "react-icons/sl";
import { useSelector } from "react-redux";
import { ConvertFromINR, formatCurrency } from "../../utils/currency";
// ---------------- Add By Pawan For the currency--------------------------------

// Helper: convert a slug like "blue-sapphire" or "emerald" into "Blue Sapphire" / "Emerald"
const formatSlugToName = (s) =>
  (s || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

function StoneCollection() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_URL;
  // -----------------------Add By Pawan image filter-----------------------------------
  const qualityOptions = [
    {
      name: "Good",
      minPrice: "5000",
      maxPrice: "20000",
      image: <FaRegThumbsUp />,
    },
    {
      name: "Premium",
      minPrice: "20000",
      maxPrice: "100000",
      image: <IoDiamondOutline />,
    },
    {
      name: "Luxury",
      minPrice: "100000",
      maxPrice: "500000",
      image: <LiaCrownSolid />,
    },
    {
      name: "Exclusive",
      minPrice: "500000",
      maxPrice: "1500000",
      image: <SlBadge />,
    },
  ];

  const formatShortPrice = (price) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
    }
    if (price >= 100000) {
      return `${(price / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return price.toString();
  };
  // -----------------------Add By Pawan image filter-----------------------------------
  // --------------------------Add By Pawan---------------------------------------------
  const INITIAL_FILTERS = {
    gemname: "",
    minWeight: "",
    maxWeight: "",
    minCarat: "",
    maxCarat: "",
    minPrice: "",
    maxPrice: "",
    minRatti: "",
    maxRatti: "",
    origin: "",
    treatment: "",
    cut: "",
    shape: "",
    color: "",
    featured: "",
    sort: "weight_low_to_high",
    certificateType: "",
    quality: "",
  };

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const firstLoadRef = useRef(true);
  const [error, setError] = useState(null);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(INITIAL_FILTERS);

  const [originCountries, setOriginCountries] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const itemsPerPage = 16;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  //----------------- Add By Pawan for total product----------------------------
  const [totalProducts, setTotalProducts] = useState(0);
  //----------------- Add By Pawan  for total product----------------------------
  const [selectedColor, setSelectedColor] = useState("Select Color");
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters]);
  const fetchOriginCountries = async () => {
    try {
      const res = await axios.get(
        `${URL}/product/get-product-origin-countries-list/${slug}`
      );
      setOriginCountries(res.data.originsList || []);
    } catch (err) {
      console.error("Error loading origin countries", err);
    }
  };
  const fetchProducts = async () => {
    if (!slug) return;
    try {
      setError(null);
      if (firstLoadRef.current) setLoading(true);
      else setPageLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...selectedFilters,
      });
      const response = await axios.get(
        `${URL}/product/filter?subcategory=${slug}&${queryParams.toString()}`
      );

      const data = response.data || {};
      setProducts(Array.isArray(data.products) ? data.products : []);
      // FIX: Fall back to a readable name derived from the slug instead of "Stone Collection"
      setCategoryName(
        data.name ||
          data.subcategory?.name ||
          formatSlugToName(slug) ||
          "Gemstone"
      );
      setTotalPages(data.totalPages || 1);
      //------------------Add by Pawan  for total products------------------------------
      setTotalProducts(data.totalProducts || 0);
      //------------------Add by Pawan  for total products------------------------------
    } catch (err) {
      setError("Failed to load products");
      setProducts([]);
      setTotalPages(1);
      // ------------Add by Pawan  for total products------------------------------
      setTotalProducts(0);
      // ------------Add by Pawan  for total products------------------------------
      // Even on error, still show a readable category name from the slug
      setCategoryName((prev) => prev || formatSlugToName(slug) || "Gemstone");
    } finally {
      if (firstLoadRef.current) {
        setLoading(false);
        firstLoadRef.current = false;
      } else {
        setPageLoading(false);
      }
    }
  };

  const updateFilter = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ---------------------------- Add By Pawan for 1,2,3,4....last page ----------------------------
  const getVisiblePages = () => {
    if (totalPages <= 1) return [];

    const firstCount = 3;
    const siblingCount = 1;

    const shown = new Set();
    for (let i = 1; i <= Math.min(firstCount, totalPages); i++) shown.add(i);
    for (
      let i = Math.max(1, currentPage - siblingCount);
      i <= Math.min(totalPages, currentPage + siblingCount);
      i++
    )
      shown.add(i);
    shown.add(totalPages);

    const sorted = Array.from(shown).sort((a, b) => a - b);

    const pages = [];
    let prev = 0;
    sorted.forEach((page) => {
      if (prev && page - prev > 1) {
        pages.push(`ellipsis-${prev}`);
      }
      pages.push(page);
      prev = page;
    });

    return pages;
  };
  // ---------------------------- End Add By Pawan for 1,2,3,....last page ----------------------------

  useEffect(() => {
    fetchProducts();
  }, [slug, currentPage, selectedFilters]);

  useEffect(() => {
    fetchOriginCountries();
  }, [slug]);

  const applyFilter = (key, value) => {
    setCurrentPage(1);
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleProductClick = (product, e) => {
    if (e.target.closest("button")) return;
    const url =
      typeof product === "string"
        ? `/products/${product}`
        : getProductUrl(product);
    window.open(url, "_blank", "noopener,noreferrer");
  };
  // ----------- Add By Pawan For the currency--------------------------------
  const { currency, rates } = useSelector((s) => s.currency);
  const formatPrice = (price) =>
    formatCurrency(
      ConvertFromINR(Number(price) || 0, rates, currency),
      currency
    );
  // ----------- Add By Pawan For the currency--------------------------------

  // FIX: resolved display name — always has a sensible value, never "Stone Collection"
  const displayCategoryName =
    categoryName || formatSlugToName(slug) || "Gemstone";

  if (loading)
    return (
      <div className="flex flex-col px-4 sm:px-10 py-10 w-full">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264A3F] mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading products...</p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col px-3 sm:px-6 md:px-10 py-6 w-full">
      {/* HEADER SECTION */}
      <div className="w-full text-center mt-2 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold text-[#000]">
          {displayCategoryName} Online Collection
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 mb-4">
          Explore our stunning online collection!
        </p>
        {/* -------------------------Add By Pawan total Products----------------------------- */}
        <p className="text-lg  text-black  border border-dotted border-gray-300 p-4 rounded-md font-semibold">
          Total Products : {totalProducts}
        </p>
        {/* -------------------------Add By Pawan total Products--------------------------- */}
      </div>

      {/* MOBILE FILTER ACCORDION */}
      <div className="lg:hidden mb-4">
        <details className="border rounded-lg">
          <summary className="cursor-pointer px-4 py-3 font-semibold bg-gray-50 rounded-lg">
            Filters & Sorting
          </summary>

          <div className="p-4 flex flex-col gap-3">
            {/** Sort */}
            <select
              className="border px-3 py-2 rounded"
              value={selectedFilters.sort}
              onChange={(e) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  sort: e.target.value,
                }))
              }
            >
              <option value="">Sort</option>
              <option value="price_low_to_high">Price: Low to High</option>
              <option value="price_high_to_low">Price: High to Low</option>
              <option value="weight_low_to_high">Weight: Low to High</option>
              <option value="weight_high_to_low">Weight: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {/** Carat */}
            <select
              className="border px-3 py-2 rounded"
              value={
                selectedFilters.minCarat && selectedFilters.maxCarat
                  ? `${selectedFilters.minCarat}-${selectedFilters.maxCarat}`
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value.split("-");
                setSelectedFilters((prev) => ({
                  ...prev,
                  minCarat: val[0],
                  maxCarat: val[1],
                }));
                setCurrentPage(1);
              }}
            >
              <option value="">Carat</option>
              <option value="0-3">0–3 Carat</option>
              <option value="3-5">3–5 Carat</option>
              <option value="5-8">5–8 Carat</option>
              <option value="8-20">8–20 Carat</option>
            </select>

            {/** Ratti */}
            <select
              className="border px-3 py-2 rounded"
              value={
                selectedFilters.minRatti && selectedFilters.maxRatti
                  ? `${selectedFilters.minRatti}-${selectedFilters.maxRatti}`
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value.split("-");
                setSelectedFilters((prev) => ({
                  ...prev,
                  minRatti: val[0],
                  maxRatti: val[1],
                }));
              }}
            >
              <option value="">Ratti</option>
              <option value="0-3">0–3 Ratti</option>
              <option value="3-5">3–5 Ratti</option>
              <option value="5-8">5–8 Ratti</option>
              <option value="8-20">8–20 Ratti</option>
            </select>

            {/** Certificate */}
            <select
              className="border px-3 py-2 rounded"
              value={selectedFilters.certificateType}
              onChange={(e) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  certificateType: e.target.value,
                }))
              }
            >
              <option value="">Certificate</option>
              <option value="Free">Free</option>
              <option value="IGI">IGI</option>
              <option value="GIA">GIA</option>
              <option value="GII">GII</option>
              <option value="IIGJ">IIGJ</option>
              <option value="GRS">GRS</option>
              <option value="SSEF">SSEF</option>
            </select>
            {/** Price */}
            <select
              className="border px-3 py-2 rounded"
              value={
                selectedFilters.minPrice && selectedFilters.maxPrice
                  ? `${selectedFilters.minPrice}-${selectedFilters.maxPrice}`
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value.split("-");
                setSelectedFilters((prev) => ({
                  ...prev,
                  minPrice: val[0],
                  maxPrice: val[1],
                }));
              }}
            >
              <option value="">Price</option>
              <option value="0-5000">Below 5k</option>
              <option value="5000-20000">5k–20k</option>
              <option value="20000-50000">20k–50k</option>
              <option value="50000-200000">50k–2L</option>
            </select>

            {/** Origin */}
            <select
              className="border px-3 py-2 rounded"
              value={selectedFilters.origin}
              onChange={(e) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  origin: e.target.value,
                }))
              }
            >
              <option value="">Origin</option>
              {originCountries.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>

            {/** Color - with variant support */}
            <select
              className="border px-3 py-2 rounded"
              value={selectedFilters.color}
              onChange={(e) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  color: e.target.value,
                }))
              }
            >
              <option value="">Color</option>
              <option value="Red">Red (All Shades)</option>
              <option value="Blue">Blue (All Shades)</option>
              <option value="Green">Green (All Shades)</option>
              <option value="Yellow">Yellow (All Shades)</option>
              <option value="Pink">Pink (All Shades)</option>
              <option value="Purple">Purple (All Shades)</option>
              <option value="Violet">Violet (All Shades)</option>
              <option value="Orange">Orange (All Shades)</option>
              <option value="White">White (All Shades)</option>
              <option value="Grey">Grey (All Shades)</option>
              <option value="Black">Black (All Shades)</option>
              <option value="Brown">Brown (All Shades)</option>
              <option value="Golden">Golden (All Shades)</option>
            </select>

            {/** Cut */}
            <select
              className="border px-3 py-2 rounded"
              value={selectedFilters.cut}
              onChange={(e) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  cut: e.target.value,
                }))
              }
            >
              <option value="">Cut</option>
              <option value="Cabochon">Cabochon</option>
              <option value="Carving">Carving</option>
              <option value="Faceted">Faceted</option>
              <option value="Tablet">Tablet</option>
              <option value="Brilliant">Brilliant</option>
            </select>

            {/** Shape */}
            <select
              className="border px-3 py-2 rounded"
              value={selectedFilters.shape}
              onChange={(e) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  shape: e.target.value,
                }))
              }
            >
              <option value="">Shape</option>
              <option value="Oval">Oval</option>
              <option value="Round">Round</option>
              <option value="Cushion">Cushion</option>
              <option value="Emerald Cut">Emerald Cut</option>
              <option value="Radiant">Radiant</option>
              <option value="Asscher - Octagon">Asscher - Octagon</option>
              <option value="Pear">Pear</option>
              <option value="Fancy">Fancy</option>
              <option value="Marquise">Marquise</option>
              <option value="Princess">Princess</option>
              <option value="Rough">Rough</option>
              <option value="Trillion">Trillion</option>
              <option value="Various">Various</option>
            </select>
            {/* ----------------------------fix filter  By Pawan--------------------------------- */}
            {/** Treatment */}
            <select
              className="border px-3 py-2 rounded"
              value={selectedFilters.treatment}
              onChange={(e) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  treatment: e.target.value,
                }))
              }
            >
              <option value="">Treatment</option>
              <option value="Oil">Oil</option>
              <option value="Minor oil">Minor Oil</option>
              <option value="beryllium diffusioned">
                beryllium diffusioned
              </option>
              <option value="No Oil">No Oil</option>
              <option value="Heated">Heated</option>
              <option value="Unheated and Untreated">
                Unheated and Untreated
              </option>
            </select>
            {/* ----------------------------_Add By Pawan--------------------------------- */}
            {/* Quality */}
            <select
              className="border px-2 py-2 rounded"
              value={
                selectedFilters.minPrice && selectedFilters.maxPrice
                  ? `${selectedFilters.minPrice}-${selectedFilters.maxPrice}`
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value.split("-");
                setSelectedFilters((prev) => ({
                  ...prev,
                  minPrice: val[0],
                  maxPrice: val[1],
                }));
              }}
            >
              <option value="">Quality</option>
              <option value="50-20000">Good (₹0-₹20K)</option>
              <option value="20001-100000">Premium (₹20K-₹1.0L)</option>
              <option value="100001-500000">Luxury (₹1.0L-₹5.0L)</option>
              <option value="500001-1500000">Exclusive(Above ₹5.0L)</option>
            </select>
            <button
              className="cursor-pointer bg-red-600 p-2 rounded text-white"
              onClick={() => {
                setSelectedFilters(INITIAL_FILTERS);
                setCurrentPage(1);
              }}
            >
              Clear All
            </button>
          </div>
        </details>
      </div>
      {/* -------------------------------------------------------------------------------- */}

      {/* DESKTOP FILTERS */}
      <div className="hidden lg:flex flex-wrap items-center gap-3 overflow-x-auto whitespace-nowrap pb-3 scrollbar-hide">
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={
            selectedFilters.minCarat && selectedFilters.maxCarat
              ? `${selectedFilters.minCarat}-${selectedFilters.maxCarat}`
              : ""
          }
          onChange={(e) => {
            const val = e.target.value.split("-");
            setSelectedFilters((prev) => ({
              ...prev,
              minCarat: val[0],
              maxCarat: val[1],
            }));
          }}
        >
          <option value="">Carat</option>
          <option value="0-3">0–3 Carat</option>
          <option value="3-5">3–5 Carat</option>
          <option value="5-8">5–8 Carat</option>
          <option value="8-20">8–20 Carat</option>
        </select>

        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={
            selectedFilters.minRatti && selectedFilters.maxRatti
              ? `${selectedFilters.minRatti}-${selectedFilters.maxRatti}`
              : ""
          }
          onChange={(e) => {
            const val = e.target.value.split("-");
            setSelectedFilters((prev) => ({
              ...prev,
              minRatti: val[0],
              maxRatti: val[1],
            }));
          }}
        >
          <option value="">Ratti</option>
          <option value="0-3">0–3 Ratti</option>
          <option value="3-5">3–5 Ratti</option>
          <option value="5-8">5–8 Ratti</option>
          <option value="8-20">8–20 Ratti</option>
        </select>

        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={selectedFilters.certificateType}
          onChange={(e) =>
            setSelectedFilters((prev) => ({
              ...prev,
              certificateType: e.target.value,
            }))
          }
        >
          <option value="">Certificate</option>
          <option value="Free">Free</option>
          <option value="IGI">IGI</option>
          <option value="GIA">GIA</option>
          <option value="GII">GII</option>
          <option value="IIGJ">IIGJ</option>
          <option value="GRS">GRS</option>
          <option value="SSEF">SSEF</option>
        </select>
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={
            selectedFilters.minPrice && selectedFilters.maxPrice
              ? `${selectedFilters.minPrice}-${selectedFilters.maxPrice}`
              : ""
          }
          onChange={(e) => {
            const val = e.target.value.split("-");
            setSelectedFilters((prev) => ({
              ...prev,
              minPrice: val[0],
              maxPrice: val[1],
            }));
          }}
        >
          <option value="">Price</option>
          <option value="0-5000">Below 5k</option>
          <option value="5000-20000">5k–20k</option>
          <option value="20000-50000">20k–50k</option>
          <option value="50000-200000">50k–2L</option>
        </select>
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-40 hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={selectedFilters.origin}
          onChange={(e) =>
            setSelectedFilters((prev) => ({ ...prev, origin: e.target.value }))
          }
        >
          <option value="">Origin</option>
          {originCountries.map((ct) => (
            <option key={ct} value={ct}>
              {ct}
            </option>
          ))}
        </select>

        {/** Color - with variant support */}
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={selectedFilters.color}
          onChange={(e) =>
            setSelectedFilters((prev) => ({ ...prev, color: e.target.value }))
          }
        >
          <option value="">Color</option>
          <option value="Red">Red (All Shades)</option>
          <option value="Blue">Blue (All Shades)</option>
          <option value="Green">Green (All Shades)</option>
          <option value="Yellow">Yellow (All Shades)</option>
          <option value="Pink">Pink (All Shades)</option>
          <option value="Purple">Purple (All Shades)</option>
          <option value="Violet">Violet (All Shades)</option>
          <option value="Orange">Orange (All Shades)</option>
          <option value="White">White (All Shades)</option>
          <option value="Grey">Grey (All Shades)</option>
          <option value="Black">Black (All Shades)</option>
          <option value="Brown">Brown (All Shades)</option>
          <option value="Golden">Golden (All Shades)</option>
        </select>

        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={selectedFilters.cut}
          onChange={(e) =>
            setSelectedFilters((prev) => ({ ...prev, cut: e.target.value }))
          }
        >
          <option value="">Cut</option>
          <option value="Cabochon">Cabochon</option>
          <option value="Carving">Carving</option>
          <option value="Faceted">Faceted</option>
          <option value="Tablet">Tablet</option>
          <option value="Brilliant">Brilliant</option>
        </select>

        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-32 hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={selectedFilters.shape}
          onChange={(e) =>
            setSelectedFilters((prev) => ({ ...prev, shape: e.target.value }))
          }
        >
          <option value="">Shape</option>
          <option value="Oval">Oval</option>
          <option value="Round">Round</option>
          <option value="Cushion">Cushion</option>
          <option value="Emerald Cut">Emerald Cut</option>
          <option value="Radiant">Radiant</option>
          <option value="Asscher - Octagon">Asscher - Octagon</option>
          <option value="Pear">Pear</option>
          <option value="Fancy">Fancy</option>
          <option value="Marquise">Marquise</option>
          <option value="Princess">Princess</option>
          <option value="Rough">Rough</option>
          <option value="Trillion">Trillion</option>
          <option value="Various">Various</option>
        </select>
        {/* -----------------fix filter issue by pawan--------------------------- */}
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={selectedFilters.treatment}
          onChange={(e) =>
            setSelectedFilters((prev) => ({
              ...prev,
              treatment: e.target.value,
            }))
          }
        >
          <option value="">Treatment</option>
          <option value="Oil">Oil</option>
          <option value="Minor oil">Minor Oil</option>
          <option value="beryllium diffusioned">Beryllium diffusioned</option>
          <option value="No Oil">No Oil</option>
          <option value="Heated">Heated</option>
          <option value="Unheated and Untreated">Unheated and Untreated</option>
        </select>
        {/* -----------------fix filter issue by pawan--------------------------- */}
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={selectedFilters.featured}
          onChange={(e) =>
            setSelectedFilters((prev) => ({ ...prev, featured: e.target.value }))
          }
        >
          <option value="">Featured</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-32 hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition"
          value={selectedFilters.sort}
          onChange={(e) =>
            setSelectedFilters((prev) => ({ ...prev, sort: e.target.value }))
          }
        >
          <option value="">Sort</option>
          <option value="price_low_to_high">Price: Low to High</option>
          <option value="price_high_to_low">Price: High to Low</option>
          <option value="weight_low_to_high">Weight: Low to High</option>
          <option value="weight_high_to_low">Weight: High to Low</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        {/* {--------------Quality-----------------} */}
        {/* ----------------------Add By Pawan------------------------------------------------ */}
        <select
          className="border px-2 py-2 rounded"
          value={
            selectedFilters.minPrice && selectedFilters.maxPrice
              ? `${selectedFilters.minPrice}-${selectedFilters.maxPrice}`
              : ""
          }
          onChange={(e) => {
            const val = e.target.value.split("-");
            setSelectedFilters((prev) => ({
              ...prev,
              minPrice: val[0],
              maxPrice: val[1],
            }));
          }}
        >
          <option value="">Quality</option>
          <option value="50-20000">Good (₹0-₹20K)</option>
          <option value="20001-100000">Premium (₹20K-₹1.0L)</option>
          <option value="100001-500000">Luxury (₹1.0L-₹5.0L)</option>
          <option value="500001-1500000">Exclusive(Above ₹5.0L)</option>
        </select>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm font-medium"
          onClick={() => {
            setSelectedFilters(INITIAL_FILTERS);
            setCurrentPage(1);
          }}
        >
          Clear All
        </button>
      </div>
      {/* ------------------------------Add By Pawan image filter----------------------------------- */}
      <div className="grid grid-cols-4 gap-3 sm:gap-5 md:gap-7 lg:gap-9 mt-8 mb-10 px-2 sm:px-4 lg:px-0">
        {qualityOptions.map((item, idx) => {
          const isSelected =
            selectedFilters.minPrice === item.minPrice &&
            selectedFilters.maxPrice === item.maxPrice;
          const isLastTier = idx === qualityOptions.length - 1;

          return (
            <button
              key={item.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                setSelectedFilters((prev) => ({
                  ...prev,
                  minPrice: isSelected ? "" : item.minPrice,
                  maxPrice: isSelected ? "" : item.maxPrice,
                }));
                setCurrentPage(1);
              }}
              className={`
                group relative w-full aspect-square
                max-w-[76px] sm:max-w-[96px] md:max-w-[108px] lg:max-w-[130px]
                mx-auto shadow-2xl shadow-black/50 rounded-lg
                flex flex-col items-center justify-center gap-0.5
                transition-all duration-300 ease-out
                ${
                  isSelected
                    ? "bg-gradient-to-b from-[#e9f4ff] to-[#dceeff] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.45)] ring-2 ring-blue-500 scale-[1.05]"
                    : "bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-gray-200 hover:ring-[#264A3F]/60 hover:shadow-[0_6px_16px_-4px_rgba(38,74,63,0.25)] hover:-translate-y-1"
                }
              `}
            >
              {!isSelected && (
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-[#264A3F]/5 to-transparent" />
              )}

              {/* Icon */}
              <div
                className={`relative text-lg sm:text-2xl md:text-4xl transition-colors duration-300 ${
                  isSelected
                    ? "text-blue-700"
                    : "text-[#264A3F]/80 group-hover:text-[#264A3F]"
                }`}
              >
                {item.image}
              </div>
              {/* Min – Max price range */}
              <p
                className={`relative text-[8px] sm:text-[9.5px] md:text-[13px] md:mt-2 font-bold tracking-tight text-center leading-tight ${
                  isSelected ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {isLastTier
                  ? `${formatShortPrice(item.minPrice)}+`
                  : `${formatShortPrice(item.minPrice)} - ${formatShortPrice(
                      item.maxPrice
                    )}`}
              </p>
              {/* Title */}
              <p
                className={`relative text-[9px] sm:text-[11.5px] md:text-xs lg:text-sm  lg:mt-2 font-bold text-center leading-tight px-1 ${
                  isSelected ? "text-blue-700" : "text-gray-800"
                }`}
              >
                {item.name}
              </p>
              {/* Selected checkmark badge */}
              {isSelected && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* -------------------------------Add By Pawan image filter ------------------------------------ */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {products.map((product) => (
          <Card
            key={product._id}
            product={product}
            id={product._id}
            title={product.name}
            image={product?.images?.[0]?.url || StoneImg}
            origin={product.origin}
            price={product.price}
            videos={product.videos}
            itemType="Product"
            openInNewTab={true}
          />
        ))}

        {/* Gemologist Consultation Card (Displayed at last when fewer than 16 gemstones) */}
        {products.length < itemsPerPage && (
          <div className="rounded-[16px] h-full shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-white via-[#F9FCFB] to-[#EEF5F2] flex flex-col justify-between items-center pt-5 sm:pt-7 pb-5 sm:pb-6 px-3 sm:px-5 relative border border-[#264A3F]/20 group">
            {/* Top Badge & Emblem */}
            <div className="flex flex-col items-center w-full">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#264A3F]/10 text-[#264A3F] text-[9px] sm:text-[11px] font-semibold tracking-wide uppercase mb-3">
                Expert Assistance
              </span>

              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white shadow-md border border-[#264A3F]/15 flex items-center justify-center p-3 group-hover:scale-105 transition-transform duration-500">
                <img
                  src={StoneImg}
                  alt="Consult Our Gemologist"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Professional Copy */}
            <div className="flex flex-col items-center text-center my-3 sm:my-4 px-1">
              <h2 className="text-xs sm:text-[15px] lg:text-base font-bold text-[#0B1D3A] leading-snug">
                Haven’t Found Your Suitable Gemstone?
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-3">
                Connect with our certified gemologists for personalized
                astrological recommendations or custom sourcing.
              </p>
            </div>

            {/* Action Buttons: Call & WhatsApp */}
            <div className="flex flex-col gap-2 w-full mt-auto">
              <a
                href="tel:+919817975978"
                onClick={(e) => {
                  e.stopPropagation();
                  window.dataLayer = window.dataLayer || [];
                  window.dataLayer.push({
                    event: "contact_call_click",
                    contact_method: "phone",
                    button_location: "collection_gemologist_card",
                    phone_number: "+919817975978",
                    page_path: window.location.pathname,
                  });
                }}
                className="w-full min-h-[38px] sm:min-h-[42px] px-2.5 py-2 rounded-lg bg-[#264A3F] hover:bg-[#1b362e] text-white text-[11px] sm:text-xs lg:text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Call Our Gemologist</span>
              </a>

              {/* FIX: use displayCategoryName so it shows "Emerald", "Ruby", etc. instead of "Stone Collection" */}
              <a
                href={`https://wa.me/919817975978?text=${encodeURIComponent(
                  `Hi! I couldn't find my suitable gemstone in the ${displayCategoryName} collection. I would like to consult with a gemologist.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  fbqTrack("Contact", {
                    method: "whatsapp",
                    content_name: "Catalog Gemologist Consultation",
                  });
                  fbqTrackCustom("WhatsAppEnquiry", {
                    source: "collection_card",
                    phone: "+919817975978",
                    page_path: window.location.pathname,
                  });
                  window.dataLayer = window.dataLayer || [];
                  window.dataLayer.push({
                    event: "contact_whatsapp_click",
                    contact_method: "whatsapp",
                    button_location: "collection_gemologist_card",
                    phone_number: "+919817975978",
                    page_path: window.location.pathname,
                  });
                }}
                className="w-full min-h-[38px] sm:min-h-[42px] px-2.5 py-2 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11px] sm:text-xs lg:text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">WhatsApp Our Gemologist</span>
              </a>
            </div>
          </div>
        )}

        <VideoModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedVideo(null);
          }}
          videoUrl={selectedVideo}
        />
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 gap-1 lg:gap-2 w-full overflow-x-auto px-2 no-scrollbar">
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(p - 1, 1));
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
            disabled={currentPage === 1}
            className={`flex-shrink-0 whitespace-nowrap px-2.5 py-2 lg:px-3 border rounded-lg text-xs lg:text-sm font-medium transition-colors
              ${
                currentPage === 1
                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
          >
            Previous
          </button>

          {/* ---------------------------- Add By Pawan for 1,2,3,....last page ---------------------------- */}
          <div className="flex gap-1 mx-1 flex-shrink-0">
            {getVisiblePages().map((page, idx) =>
              typeof page !== "number" ? (
                <span
                  key={`${page}-${idx}`}
                  className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-sm font-semibold text-gray-400 select-none flex-shrink-0"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className={`w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0 flex items-center justify-center rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                    currentPage === page
                      ? "bg-[#264A3F] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>
          {/* ---------------------------- End Add By Pawan for 1,2,3,....last page ---------------------------- */}

          <button
            onClick={() => {
              setCurrentPage((p) => Math.min(p + 1, totalPages));
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
            disabled={currentPage === totalPages}
            className={`flex-shrink-0 whitespace-nowrap px-2.5 py-2 lg:px-3 border rounded-lg text-xs lg:text-sm font-medium transition-colors
              ${
                currentPage === totalPages
                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default StoneCollection;
