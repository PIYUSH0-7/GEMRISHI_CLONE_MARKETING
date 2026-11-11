import React, { useState } from "react";

// Import jewelry type images
import RingImg from "../../assets/ring.svg";
import PendantImg from "../../assets/pendant.svg";
import BraceletImg from "../../assets/bracelet.svg";
import NecklaceImg from "../../assets/Jwellery/Necklace.svg";
import EarringsImg from "../../assets/Jwellery/Earrings.svg";
import BroochImg from "../../assets/Brooch.svg";

// Metal SVG components (inline for now)
const GoldIcon = () => (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="23" cy="23" r="20" fill="#FFD700" stroke="#1E1E1E" strokeWidth="2" />
        <text x="23" y="28" textAnchor="middle" fill="#1E1E1E" fontSize="12" fontWeight="bold">Au</text>
    </svg>
);

const SilverIcon = () => (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="23" cy="23" r="20" fill="#C0C0C0" stroke="#1E1E1E" strokeWidth="2" />
        <text x="23" y="28" textAnchor="middle" fill="#1E1E1E" fontSize="12" fontWeight="bold">Ag</text>
    </svg>
);

const PlatinumIcon = () => (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="23" cy="23" r="20" fill="#E5E4E2" stroke="#1E1E1E" strokeWidth="2" />
        <text x="23" y="28" textAnchor="middle" fill="#1E1E1E" fontSize="10" fontWeight="bold">Pt</text>
    </svg>
);

const PanchadhatuIcon = () => (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="23" cy="23" r="20" fill="#8B4513" stroke="#1E1E1E" strokeWidth="2" />
        <text x="23" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">5 Metals</text>
    </svg>
);

export default function JewelryFilter({
    jewelry,
    onChange,
    loading,
    error,
    filterType = "type", // "type" or "metal"
}) {
    const [selectedItem, setSelectedItem] = useState(null);

    const jewelryTypes = [
        { id: "ring", name: "Ring", image: RingImg },
        { id: "pendant", name: "Pendant", image: PendantImg },
        { id: "bracelet", name: "Bracelet", image: BraceletImg },
        { id: "necklace", name: "Necklace", image: NecklaceImg },
        { id: "earrings", name: "Earrings", image: EarringsImg },
        { id: "brooch", name: "Brooch", image: BroochImg },
    ];

    const metalTypes = [
        { id: "gold", name: "Gold", component: GoldIcon },
        { id: "silver", name: "Silver", component: SilverIcon },
        { id: "platinum", name: "Platinum", component: PlatinumIcon },
        { id: "panchadhatu", name: "Panchadhatu", component: PanchadhatuIcon },
    ];

    const items = filterType === "metal" ? metalTypes : jewelryTypes;

    const handleSelect = (item) => {
        setSelectedItem(item.id);
        if (onChange) onChange(item);
    };

    if (loading) return <p>Loading jewelry options...</p>;
    if (error) return <p className="text-gray-500">Failed to load jewelry options.</p>;

    return (
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 justify-items-center">
            {items.map((item) => (
                <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`flex flex-col items-center p-4 sm:p-6 hover:scale-105 transition-transform duration-300 cursor-pointer ${selectedItem === item.id
                            ? "border-2 border-[#264A3F] rounded-lg"
                            : "border border-transparent"
                        }`}
                >
                    {item.component ? (
                        <item.component />
                    ) : (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain mb-2"
                            onError={(e) => {
                                // Fallback for missing images
                                e.target.src = "/placeholder.svg";
                            }}
                        />
                    )}
                    <p className="font-medium text-gray-800 text-sm sm:text-base text-center">
                        {item.name}
                    </p>
                </div>
            ))}
        </div>
    );
}