import React from "react";

const metalOptions = [
    { value: "", label: "Metal" },
    { value: "18k Gold", label: "18k Gold" },
    { value: "22k Gold", label: "22k Gold" },
    { value: "silver", label: "Silver" },
    { value: "platinum", label: "Platinum" },
    { value: "Brass", label: "Brass" },
];

const genderOptions = [
    { value: "", label: "Gender" },
    { value: "Men", label: "Men" },
    { value: "Women", label: "Women" },
];

const caratWeightOptions = [
    { value: "", label: "Carat Weight" },
    { value: "1-2", label: "1-2 Carats" },
    { value: "2-4", label: "2-4 Carats" },
    { value: "4-6", label: "4-6 Carats" },
    { value: "6-8", label: "6-8 Carats" },
    { value: "8-99", label: "8 Above" },
];

const gemstoneShapeOptions = [
    { value: "", label: "Gemstone Shape" },
    { value: "Cushion", label: "Cushion" },
    { value: "Cushion Rectangular", label: "Cushion Rectangular" },
    { value: "Emerald Cut", label: "Emerald Cut" },
    { value: "Heart", label: "Heart" },
    { value: "Marquise", label: "Marquise" },
    { value: "Round", label: "Round" },
    { value: "Square", label: "Square" },
];

const priceOptions = [
    { value: "", label: "Price" },
    { value: "0-10000", label: "Below ₹10,000" },
    { value: "10001-25000", label: "₹10,001 – ₹25,000" },
    { value: "25001-50000", label: "₹25,001 – ₹50,000" },
    { value: "50001-100000", label: "₹50,001 – ₹1,00,000" },
    { value: "100001-200000", label: "₹1,00,001 – ₹2,00,000" },
    { value: "200001-9999999", label: "Above ₹2,00,001" },
];

const sortOptions = [
    { value: "", label: "Sort" },
    { value: "price_low_to_high", label: "Price: Low to High" },
    { value: "price_high_to_low", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
];

const selectClass =
    "border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:border-[#264A3F] focus:ring-2 focus:ring-[#264A3F] transition";

export default function JewelryCollectionFilter({
    filters,
    onFilterChange,
    onClear,
}) {
    const updateValue = (key, value) => {
        if (onFilterChange) onFilterChange(key, value);
    };

    return (
        <div className="mt-6 sm:mt-10 px-4 sm:px-6 md:px-12 w-full">
            <div className="w-full text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold text-[#000]">
                    Explore our stunning online collection!
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 mb-4 max-w-3xl mx-auto">
                    Filter jewelry by Metal, Gender, Carat Weight, Gemstone Shape, Price Range, and Sort options.
                </p>
            </div>

            <div className="lg:hidden mb-4">
                <details className="border rounded-lg">
                    <summary className="cursor-pointer px-4 py-3 font-semibold bg-gray-50 rounded-lg">
                        Filters & Sorting
                    </summary>
                    <div className="p-4 flex flex-col gap-3">
                        <select
                            className={`${selectClass} w-full`}
                            value={filters.metal || ""}
                            onChange={(e) => updateValue("metal", e.target.value)}
                        >
                            {metalOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={`${selectClass} w-full`}
                            value={filters.gender || ""}
                            onChange={(e) => updateValue("gender", e.target.value)}
                        >
                            {genderOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={`${selectClass} w-full`}
                            value={filters.carat || ""}
                            onChange={(e) => updateValue("carat", e.target.value)}
                        >
                            {caratWeightOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={`${selectClass} w-full`}
                            value={filters.shape || ""}
                            onChange={(e) => updateValue("shape", e.target.value)}
                        >
                            {gemstoneShapeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={`${selectClass} w-full`}
                            value={filters.price || ""}
                            onChange={(e) => updateValue("price", e.target.value)}
                        >
                            {priceOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={`${selectClass} w-full`}
                            value={filters.sort || ""}
                            onChange={(e) => updateValue("sort", e.target.value)}
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <button
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition w-full"
                            onClick={onClear}
                        >
                            Clear All
                        </button>
                    </div>
                </details>
            </div>

            <div className="hidden lg:flex flex-wrap items-center gap-3 overflow-x-auto whitespace-nowrap pb-3 scrollbar-hide">
                <select className={selectClass} value={filters.metal || ""} onChange={(e) => updateValue("metal", e.target.value)}>
                    {metalOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select className={selectClass} value={filters.gender || ""} onChange={(e) => updateValue("gender", e.target.value)}>
                    {genderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select className={selectClass} value={filters.carat || ""} onChange={(e) => updateValue("carat", e.target.value)}>
                    {caratWeightOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select className={selectClass} value={filters.shape || ""} onChange={(e) => updateValue("shape", e.target.value)}>
                    {gemstoneShapeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select className={selectClass} value={filters.price || ""} onChange={(e) => updateValue("price", e.target.value)}>
                    {priceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select className={selectClass} value={filters.sort || ""} onChange={(e) => updateValue("sort", e.target.value)}>
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm font-medium" onClick={onClear}>
                    Clear All
                </button>
            </div>
        </div>
    );
}
