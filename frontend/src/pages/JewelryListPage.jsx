import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import JewelryFilter from "../components/filters/JewelryFilter";
import Card from "../components/Card";
import { Helmet } from "react-helmet-async";
import { useJewelryByFilter } from "../hooks/useJewelryByFilter";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const JewelryListPage = () => {
    const query = useQuery();
    const navigate = useNavigate();

    // Get filter parameters from URL
    const jewelryType = query.get("jewelryType") || "";
    const metal = query.get("metal") || "";
    const page = Number(query.get("page")) || 1;

    const [selectedFilters, setSelectedFilters] = useState({
        jewelryType: jewelryType,
        metal: metal,
    });

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedFilters.jewelryType) params.set("jewelryType", selectedFilters.jewelryType);
        if (selectedFilters.metal) params.set("metal", selectedFilters.metal);
        params.set("page", page.toString());

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
    }, [selectedFilters, page]);

    const { data, loading, error } = useJewelryByFilter({
        limit: 20,
        page: page,
        jewelryType: selectedFilters.jewelryType,
        metal: selectedFilters.metal,
    });

    const products = data?.jeweleries || data?.items || [];

    const handleTypeFilter = (typeItem) => {
        setSelectedFilters(prev => ({
            ...prev,
            jewelryType: typeItem.id,
        }));
    };

    const handleMetalFilter = (metalItem) => {
        setSelectedFilters(prev => ({
            ...prev,
            metal: metalItem.id,
        }));
    };

    const displayType = selectedFilters.jewelryType
        ? selectedFilters.jewelryType.charAt(0).toUpperCase() + selectedFilters.jewelryType.slice(1)
        : "All";

    const displayMetal = selectedFilters.metal
        ? selectedFilters.metal.charAt(0).toUpperCase() + selectedFilters.metal.slice(1)
        : "";

    const pageTitle = displayMetal
        ? `${displayMetal} ${displayType}s`
        : displayType !== "All"
            ? `${displayType}s`
            : "All Jewelry";

    return (
        <div className="p-6">
            <Helmet>
                <title>{pageTitle} | GemRishi India</title>
                <meta name="description" content={`Shop certified ${pageTitle.toLowerCase()} from GemRishi India. Authentic jewelry with astrology benefits.`} />
            </Helmet>

            {/* Breadcrumbs */}
            <div className="text-gray-900 mt-2 text-sm flex items-center space-x-2 p-4 px-6 sm:px-10 md:px-20 lg:px-32 mb-6">
                <span
                    className="cursor-pointer hover:text-[#264A3F] transition-colors text-[16px] sm:text-[18px]"
                    onClick={() => navigate("/")}
                >
                    Home
                </span>
                <span>&gt;</span>
                <span
                    className="cursor-pointer hover:text-[#264A3F] transition-colors text-[16px] sm:text-[18px]"
                    onClick={() => navigate("/jewelry")}
                >
                    Jewelry
                </span>
                {pageTitle !== "All Jewelry" && (
                    <>
                        <span>&gt;</span>
                        <span className="text-[#264A3F] font-medium text-[16px] sm:text-[18px]">
                            {pageTitle}
                        </span>
                    </>
                )}
            </div>

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-center justify-between mb-10 gap-8 px-6 sm:px-10 md:px-20 lg:px-32">
                <div className="flex-1 text-left">
                    <h1 className="text-[35px] font-bold text-gray-900 mb-1">
                        {pageTitle}
                    </h1>
                    <p className="text-gray-700 text-lg w-[70%] text-justify">
                        {pageTitle === "All Jewelry"
                            ? "Explore our complete jewelry collection featuring rings, pendants, bracelets, and more. Each piece is crafted with authentic gemstones and traditional metals for lasting beauty and astrological benefits."
                            : `Discover our exquisite collection of ${pageTitle.toLowerCase()}. Each piece combines traditional craftsmanship with modern design, featuring certified gemstones and premium metals.`}
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <img
                        src="/ring.png" // You can replace with a more appropriate default image
                        alt={pageTitle}
                        className="w-60 h-auto mix-blend-multiply"
                    />
                </div>
            </div>

            {/* Filters Section */}
            <div className="px-6 sm:px-10 md:px-20 lg:px-32 mb-10">
                {/* Jewelry Type Filter */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Filter by Jewelry Type</h2>
                    <JewelryFilter
                        filterType="type"
                        onChange={handleTypeFilter}
                        loading={false}
                        error={null}
                    />
                </div>

                {/* Metal Type Filter */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Filter by Metal</h2>
                    <JewelryFilter
                        filterType="metal"
                        onChange={handleMetalFilter}
                        loading={false}
                        error={null}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264A3F] mx-auto mb-3"></div>
                        <p className="text-sm text-stone-500 font-light">Loading jewelry...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex items-center justify-center py-20">
                    <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-md text-center">
                        <div className="mb-4 text-4xl">⚠️</div>
                        <h3 className="text-lg font-semibold text-stone-900 mb-2">Unable to Load Jewelry</h3>
                        <p className="text-stone-500 mb-6">Failed to load jewelry. Please try again.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 bg-[#264A3F] text-white rounded-lg hover:bg-[#1a3329] transition-colors font-medium text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
                <div className="flex flex-wrap gap-6 justify-center mt-10 px-6 sm:px-10 md:px-20 lg:px-32">
{/* // -------------------Add for currency by pawan----------------------------------- */}
                    {products.map((product, index) => (
                        <Card
                            key={product?._id || index}
                            product={product}
                            id={product?._id}
                            sku={product?.sku}
                            slug={product?.slug || "#"}
                            image={product?.images?.[0]?.url || (typeof product?.images?.[0] === 'string' ? product.images[0] : "/ring.png")}
                            title={product?.jewelryName || "Untitled Jewelry"}
                            jewelryPrice={product?.jewelryPrice ?? null}
                            videos={product?.videos}
                            itemType="Jewelry"
                        />
                    ))}
{/* // ------------------------Add for currency by pawan------------------------------- */}
                </div>
            )}

            {/* No Products State */}
            {!loading && !error && products.length === 0 && (
                <div className="flex items-center justify-center py-20">
                    <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md text-center">
                        <div className="mb-4 text-5xl">💍</div>
                        <h3 className="text-lg font-semibold text-stone-900 mb-2">No Jewelry Available</h3>
                        <p className="text-stone-500 mb-6">
                            We don't have any {pageTitle.toLowerCase()} available at the moment. Please try different filters or explore our other collections.
                        </p>
                        <a
                            href="/jewelry"
                            className="inline-block px-6 py-2.5 bg-[#264A3F] text-white rounded-lg hover:bg-[#1a3329] transition-colors font-medium text-sm"
                        >
                            Explore All Jewelry
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JewelryListPage;