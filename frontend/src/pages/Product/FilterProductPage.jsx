"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// सुनिश्चित करें कि BlueSapphire.svg पाथ सही है, यह सिर्फ एक उदाहरण है
import BlueSapphire from "../../assets/Logo.svg";
import { getProductUrl } from "../../utils/productUrl";
// --------add by pawan for currency---------------------------
import { MessageCircle, Phone } from "lucide-react";
import Price from "../../components/Price";
import Card from "../../components/Card";
// --------add by pawan for currency---------------------------
const URL = import.meta.env.VITE_URL || "http://localhost:7700/api/v1";

// =========================================================
// ProductCard Component (Unified Card)
// =========================================================
const ProductCard = ({ product }) => {
    return <Card product={product} itemType="Product" />;
};

// ---

// =========================================================
// Loading Skeleton Component
// =========================================================
const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-3">
            <div className="h-4 bg-gray-200 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="flex gap-1">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    </div>
);

// =========================================================
// Professional Error Block Component
// =========================================================
const ProfessionalErrorBlock = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-red-200 rounded-xl bg-red-50 max-w-lg mx-auto shadow-md">
        <svg className="w-12 h-12 text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
            Server Connection Issue
        </h3>
        <p className="text-gray-700 mb-6 max-w-sm">
            {/* Display the generic or specific professional message */}
            {message.includes("404") || message.includes("400") ? "The requested product category or filter combination could not be found." : "We are having trouble loading the product list. Please check your internet connection and try again."}
        </p>
        <button
            onClick={onRetry} // Call the fetch function directly
            className="px-6 py-2 bg-[#D9534F] text-white rounded-lg font-medium hover:bg-[#c9302c] transition-colors shadow-lg">
            Reload Products
        </button>
    </div>
);


// =========================================================
// Main FilterProductPage Component
// =========================================================
function FilterProductPage() {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});

    // 1. URL search params parsing
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const parsedFilters = {};

        // Only include non-empty values
        for (const [key, value] of searchParams.entries()) {
            if (value) {
                parsedFilters[key] = value;
            }
        }

        setFilters(parsedFilters);
    }, [location.search]);

    // 2. Data Fetching Function (made reusable for re-try)
    const fetchProducts = async () => {
        if (!URL) {
            setError("Configuration error: Base URL is missing");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const searchParams = new URLSearchParams(filters);
            // Ensure no empty parameters are sent if not already filtered above
            const validSearchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(filters)) {
                if (value) {
                    validSearchParams.append(key, value);
                }
            }

            // API endpoint to fetch filtered products
            const apiUrl = `${URL}/product/filter?${validSearchParams.toString()}`;

            const response = await axios.get(apiUrl);

            let productsData = [];

            if (response.data) {
                // Robust data structure checking
                productsData = response.data.products || response.data.data || response.data.result || response.data;
                if (!Array.isArray(productsData)) {
                    productsData = []; // Default to empty array if data format is unexpected
                }
            }

            setProducts(productsData);
        } catch (error) {
            console.error("❌ Error fetching products:", error);
            const userFriendlyMessage = error.response?.data?.message
                ? `Request failed: ${error.response.data.message}`
                : "A network error occurred. Please try reloading the products.";
            setError(userFriendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    // 3. Effect to run fetch when filters change
    useEffect(() => {
        // Only run fetch if we have filters or if the URL is base (no filters)
        if (Object.keys(filters).length > 0 || location.search === "") {
            fetchProducts();
        }
    }, [filters]);

    // Helper functions for title and summary
    const getPageTitle = () => {
        if (slug === "sapphire") {
            return "All Sapphires";
        }
        if (filters.subcategory) {
            return `${filters.subcategory} Collection`;
        } else if (filters.purpose) {
            return `Gemstones for ${filters.purpose}`;
        } else {
            return "All Gemstones";
        }
    };

    const getFilterSummary = () => {
        const summary = [];

        if (slug === "sapphire") {
            summary.push("All Sapphire Varieties");
        } else if (filters.subcategory) {
            summary.push(`Category: ${filters.subcategory}`);
        }
        if (filters.minCarat && filters.maxCarat) {
            summary.push(`Carat: ${filters.minCarat}-${filters.maxCarat}`);
        }

        // Simplified price display logic for brevity
        if (filters.minPrice || filters.maxPrice) {
            const minP = filters.minPrice ? Number.parseInt(filters.minPrice).toLocaleString("en-IN") : '0';
            const maxP = filters.maxPrice ? Number.parseInt(filters.maxPrice).toLocaleString("en-IN") : 'Max';
            summary.push(`Price: ₹${minP} - ₹${maxP}`);
        }

        if (filters.purpose) {
            summary.push(`Purpose: ${filters.purpose}`);
        }

        return summary;
    };

    // --- RENDER START ---
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-start justify-between">

                        <div>
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center text-gray-600 hover:text-gray-800 mb-2 text-sm font-medium">
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Back
                            </button>

                            <h1 className="text-2xl font-bold text-gray-900">
                                {getPageTitle()}
                            </h1>

                            {getFilterSummary().length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {getFilterSummary().map((filter, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#264A3F] text-white">
                                            {filter}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-700 mt-10">
                                {loading ? "Loading..." : `${products.length} Products`}
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            {/* --- Main Content --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* 1. Loading State */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, index) => (
                            <ProductSkeleton key={index} />
                        ))}
                    </div>
                )}

                {/* 2. PROFESSIONAL Error State */}
                {!loading && error && (
                    <ProfessionalErrorBlock message={error} onRetry={fetchProducts} />
                )}

                {/* 3. No Products Found (Success, but empty result) */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-sm mx-auto shadow-lg">
                            <svg
                                className="w-14 h-14 text-gray-400 mx-auto mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                No Matching Products Found
                            </h3>

                            <p className="text-gray-600 text-sm mb-4">
                                Please adjust your filters or try a broader search criteria.
                            </p>

                            <button
                                onClick={() => navigate("/")}
                                className="bg-[#264A3F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#245344] transition">
                                View All Gemstones
                            </button>
                        </div>
                    </div>
                )}

                {/* 4. Products Grid */}
                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.map((product, index) => (
                            <ProductCard
                                key={product._id || product.id || index}
                                product={product}
                            />
                        ))}

                        {products.length < 16 && (
                            <div className="bg-gradient-to-b from-white via-[#F9FCFB] to-[#EEF5F2] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-[#264A3F]/20 flex flex-col justify-between items-center p-3 sm:p-4">
                                <div className="flex flex-col items-center w-full pt-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#264A3F]/10 text-[#264A3F] text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase mb-2.5">

                                        Expert Assistance
                                    </span>
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-sm border border-[#264A3F]/15 flex items-center justify-center p-3">
                                        <img
                                            src={BlueSapphire}
                                            alt="Consult Our Gemologist"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center text-center my-3">
                                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                                        Haven’t Found Your Suitable Gemstone?
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1 leading-relaxed line-clamp-3">
                                        Connect with our certified gemologists for personalized astrological recommendations or custom sourcing.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 w-full mt-auto">
                                    <a
                                        href="tel:+919817975978"
                                        className="w-full min-h-[36px] sm:min-h-[40px] px-2.5 py-1.5 rounded-lg bg-[#264A3F] hover:bg-[#1b362e] text-white text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                                    >
                                        <Phone className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">Call Our Gemologist</span>
                                    </a>
                                    <a
                                        href={`https://wa.me/919817975978?text=${encodeURIComponent(
                                            `Hi! I couldn't find my suitable gemstone in ${getPageTitle()}. I would like to consult with a gemologist.`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full min-h-[36px] sm:min-h-[40px] px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">WhatsApp Our Gemologist</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

export default FilterProductPage;
