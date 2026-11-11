"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import StoneImg from "../../assets/Stone/BlueSapphire.svg";
import WishlistButton from "../../components/wishlistButton";
import CompareButton from "../compare/CompareButton";
import VideoModal from "../../components/models/VideoModal";
import { Play, Sparkles, ShieldCheck, Award, Globe } from "lucide-react";
import { getProductUrl } from "../../utils/productUrl";
// -----=---------Add By Pawan for currency---------------------------------------
import {useSelector} from "react-redux";
import { ConvertFromINR, formatCurrency } from "../../utils/currency";
// -----=---------Add By Pawan for currency---------------------------------------
function PurposeCollection() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const URL = import.meta.env.VITE_URL;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const itemsPerPage = 12;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const purpose = searchParams.get("purpose");

    const fetchProducts = async () => {
        if (!purpose) return;
        try {
            setError(null);
            setLoading(true);
            const response = await axios.get(
                `${URL}/product/filter-by-purpose?purpose=${purpose}&page=${currentPage}&limit=${itemsPerPage}`
            );
            console.log("API Response:", response.data); // Debug log
            
            // Handle different response structures
            let fetchedProducts = [];
            if (response.data?.products && Array.isArray(response.data.products)) {
                fetchedProducts = response.data.products;
            } else if (Array.isArray(response.data)) {
                fetchedProducts = response.data;
            }
            
            setProducts(fetchedProducts);
            setTotalPages(response.data?.totalPages || response.data?.totalPage || 1);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err?.response?.data?.msg || "Failed to load products");
            setProducts([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [purpose, currentPage]);

    // ---------------------------- Add By Pawan for 1,2,3,....last page ----------------------------
    const getVisiblePages = () => {
        if (totalPages <= 1) return [];
 
        const firstCount = 3;   // always show pages 1,2,3,4
        const siblingCount = 1; // show one neighbor on each side of the current page
 
        const shown = new Set();
        for (let i = 1; i <= Math.min(firstCount, totalPages); i++) shown.add(i);
        for (let i = Math.max(1, currentPage - siblingCount); i <= Math.min(totalPages, currentPage + siblingCount); i++) shown.add(i);
        shown.add(totalPages); // always show the last page
 
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

    const handleProductClick = (product, e) => {
        if (e.target.closest("button")) return;
        const url = typeof product === "string" ? `/products/${product}` : getProductUrl(product);
        window.open(url, "_blank", "noopener,noreferrer");
    };
// -----=---------Add By Pawan for currency---------------------------------------
   const { currency, rates } = useSelector((s) => s.currency);
const formatPrice = (price) =>
  formatCurrency(ConvertFromINR(Number(price) || 0, rates, currency), currency);
// -----=---------Add By Pawan for currency---------------------------------------

    if (loading)
        return (
            <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264A3F] mx-auto mb-3"></div>
                    <p className="text-sm text-stone-500 font-light">Loading gemstones...</p>
                </div>
            </div>
        );

    return (
        <section className="relative w-full min-h-screen bg-[#FDFCF8] font-sans py-10 px-4 sm:px-8 md:px-14 overflow-hidden">

            {/* Background blobs — same as Header */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-5%] w-[35%] h-[35%] bg-[#264A3F]/5 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[45%] h-[45%] bg-amber-50/60 rounded-full blur-[100px]"></div>
            </div>

            {/* HEADER */}
            <div className="w-full text-center mb-10 relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#264A3F]/5 text-[#264A3F] text-xs font-bold tracking-widest uppercase mb-4 border border-[#264A3F]/10">
                    <Sparkles size={13} /> Authentic Vedic Gems
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-stone-900 leading-tight tracking-tight">
                    Gemstones for{" "}
                    <span className="text-[#264A3F] italic relative inline-block">
                        {purpose}
                        <svg
                            className="absolute -bottom-1 left-0 w-full h-3 text-[#E8C46F]"
                            viewBox="0 0 100 10"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M0 5 Q 50 10 100 5"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                opacity="0.6"
                            />
                        </svg>
                    </span>
                </h1>
                <p className="text-stone-500 text-base font-light mt-3 max-w-lg mx-auto leading-relaxed">
                    Discover the perfect stones curated for your {purpose?.toLowerCase()} journey
                </p>
            </div>

            {/* PRODUCT GRID */}
            {error ? (
                <div className="w-full flex items-center justify-center py-20 relative z-10">
                    <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-md text-center">
                        <div className="mb-4 text-4xl">⚠️</div>
                        <h3 className="text-lg font-semibold text-stone-900 mb-2">Unable to Load Gemstones</h3>
                        <p className="text-stone-500 mb-6">{error}</p>
                        <button
                            onClick={() => fetchProducts()}
                            className="px-6 py-2.5 bg-[#264A3F] text-white rounded-lg hover:bg-[#1a3329] transition-colors font-medium text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            ) : products.length === 0 ? (
                <div className="w-full flex items-center justify-center py-20 relative z-10">
                    <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md text-center">
                        <div className="mb-4 text-5xl">💎</div>
                        <h3 className="text-lg font-semibold text-stone-900 mb-2">No Gemstones Available</h3>
                        <p className="text-stone-500 mb-6">We don't have any gemstones for <span className="font-semibold text-[#264A3F]">{purpose}</span> at the moment. Please check back soon or explore other categories.</p>
                        <a
                            href="/gemstone"
                            className="inline-block px-6 py-2.5 bg-[#264A3F] text-white rounded-lg hover:bg-[#1a3329] transition-colors font-medium text-sm"
                        >
                            Explore All Gemstones
                        </a>
                    </div>
                </div>
            ) : (
            <div
                className={`w-full grid gap-5 sm:gap-6 relative z-10 ${products.length === 1
                    ? "grid-cols-1 max-w-xs mx-auto"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    }`}
            >
                {products.map((product) => (
                    <div
                        key={product._id}
                        className="bg-white rounded-[20px] border border-stone-100 flex flex-col items-center pt-7 pb-6 px-3 relative cursor-pointer
                                   transition-all duration-300 hover:shadow-[0_20px_50px_rgba(38,74,63,0.10)] hover:-translate-y-1 group"
                        onClick={(e) => handleProductClick(product, e)}
                    >
                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex gap-2 z-20">
                            <WishlistButton itemId={product._id} itemType="Product" product={product} />
                            <CompareButton id={product._id} product={product} />
                            {product.videos?.length > 0 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const firstVideo = product.videos[0];
                                        setSelectedVideo(
                                            typeof firstVideo === "string" ? firstVideo : firstVideo?.url
                                        );
                                        setShowModal(true);
                                    }}
                                    className="p-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition shadow-sm"
                                >
                                    <Play className="w-4 h-4 text-stone-600" />
                                </button>
                            )}
                        </div>

                        {/* Image */}
                        <div className="w-full px-4 mb-4 bg-gradient-to-br from-[#f8f5f0] to-[#f0ece4] rounded-xl py-3">
                            <img
                                src={product?.images?.[0]?.url || StoneImg}
                                alt={product.name}
                                className="w-full h-[140px] sm:h-[170px] lg:h-[200px] object-contain
                                           group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex flex-col items-center w-full px-1">
                            <h2 className="text-sm sm:text-[15px] font-bold text-center text-[#0B1D3A] line-clamp-2 leading-snug">
                                {product.name}
                            </h2>
                            <span className="bg-stone-50 text-stone-400 text-[10px] sm:text-xs px-2.5 py-1 rounded-md mt-2 border border-stone-100">
                                Origin: {product.origin || "Unknown"}
                            </span>
                            <p className="text-sm sm:text-base text-[#264A3F] mt-3 font-bold">
                                {formatPrice(product.price)}
                            </p>
                        </div>
                    </div>
                ))}
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

            {/* TRUST BAR — same as Header */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 border-t border-stone-200/60 mt-12 pt-6 flex-wrap relative z-10">
                <div className="flex items-center gap-2 text-stone-500">
                    <ShieldCheck size={17} className="text-[#264A3F]" />
                    <span className="text-xs font-semibold uppercase tracking-wide">100% Certified</span>
                </div>
                <div className="flex items-center gap-2 text-stone-500">
                    <Award size={17} className="text-[#264A3F]" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Est. 1904</span>
                </div>
                <div className="flex items-center gap-2 text-stone-500">
                    <Globe size={17} className="text-[#264A3F]" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Shipping Globally</span>
                </div>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex  flex-wrap justify-center items-center mt-10 gap-1 px-4 relative z-10">
                    <button
                        onClick={() => {
                            setCurrentPage((p) => Math.max(p - 1, 1));
                            window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                        className={`px-4 sm:px-6 py-2 border rounded-xl text-xs lg:text-sm font-medium transition-all
                            ${currentPage === 1
                                ? "bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed"
                                : "bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300 border-stone-200"
                            }`}
                    >
                        Previous
                    </button>

                    {/* ---------------------------- Add By Pawan for 1,2,3,....last page ---------------------------- */}
                     <div className="flex flex-wrap justify-center  gap-2 sm:gap-0.5">
                        {getVisiblePages().map((page, idx) =>
                            typeof page !== "number" ? (
                                <span
                                    key={`${page}-${idx}`}
                                    className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center sm:text-xs text-sm font-semibold text-stone-400 select-none"
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
                                    className={`w-7 h-7 sm:w-5 sm:h-5 flex items-center justify-center rounded-xl sm:text-xs text-sm font-semibold transition-all
                                        ${currentPage === page
                                            ? "bg-[#264A3F] text-white shadow-[0_4px_12px_rgba(38,74,63,0.25)]"
                                            : "text-stone-500 hover:bg-stone-100"
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
                        className={`px-3 sm:px-5 py-2 border rounded-xl sm:text-xs text-sm font-medium transition-all  whitespace-nowrap
                            ${currentPage === totalPages
                                ? "bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed"
                                : "bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300 border-stone-200"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}
        </section>
    );
}

export default PurposeCollection;    