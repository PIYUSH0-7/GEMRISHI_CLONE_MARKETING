import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PendantImg from "../../assets/Jwellery/Pendants.svg";
import RingImg from "../../assets/Jwellery/Ring.svg";
import { useGetJewelryCategoryQuery } from "../../features/api/apiSlice";
import { fixImageUrl } from "../../utils/imageUtils";

const RINGS_FALLBACK = [
  { name: "Emerald Rings", slug: "emerald-rings" },
  { name: "Yellow Sapphire Rings", slug: "yellow-sapphire-rings" },
  { name: "Blue Sapphire Rings", slug: "blue-sapphire-rings" },
  { name: "Ruby Rings", slug: "ruby-rings" },
  { name: "Pearl Rings", slug: "pearl-rings" },
  { name: "White Sapphire Rings", slug: "white-sapphire-rings" },
  { name: "Red Coral Rings", slug: "red-coral-rings" },
  { name: "Cats Eye Ring", slug: "cats-eye-ring" },
  { name: "Firoza Rings", slug: "firoza-rings" },
  { name: "Hessonite Rings", slug: "hessonite-rings" },
  { name: "Amethyst Ring", slug: "amethyst-ring" },
  { name: "Opal Rings", slug: "opal-rings" },
];

const PENDANTS_FALLBACK = [
  { name: "Yellow Sapphire Pendant", slug: "yellow-sapphire-pendant" },
  { name: "Ruby Pendant", slug: "ruby-pendant" },
  { name: "Emerald Pendant", slug: "emerald-pendant" },
  { name: "Blue Sapphire Pendant", slug: "blue-sapphire-pendant" },
  { name: "White Sapphire Pendant", slug: "white-sapphire-pendant" },
  { name: "Firoza Pendant", slug: "firoza-pendant" },
  { name: "Amethyst Pendant", slug: "amethyst-pendant" },
  { name: "Red Coral Pendant", slug: "red-coral-pendant" },
  { name: "Opal Pendant", slug: "opal-pendant" },
  { name: "Cat's Eye Pendant", slug: "cats-eye-pendant" },
  { name: "Pearl Pendant", slug: "pearl-pendant" },
  { name: "Hessonite Pendant", slug: "hessonite-pendant" },
];

/**
 * JewelleryMenuContent: Displays larger, prominent cards for Rings and Pendants.
 * Supports instant hover and click tab switching without inner nested scrollbars.
 */
export default function JewelleryMenuContent({ isFullWidth = false, onClose }) {
  const [activeTab, setActiveTab] = useState("rings"); // 'rings' | 'pendants'
  const navigate = useNavigate();
  const { data: jewelleryData } = useGetJewelryCategoryQuery();

  // Extract from backend categories
  const categories = jewelleryData?.jewelryCategories || [];

  const ringsCategory = categories.find((c) =>
    (c?.name || "").toLowerCase().includes("ring")
  );
  const pendantsCategory = categories.find((c) =>
    (c?.name || "").toLowerCase().includes("pendant")
  );

  const backendRings = ringsCategory?.jewelrySubCategories?.map((item) => ({
    name: item.name,
    slug: item.slug,
    img: item.image?.url ? fixImageUrl(item.image.url) : null,
  })) || [];

  const backendPendants = pendantsCategory?.jewelrySubCategories?.map((item) => ({
    name: item.name,
    slug: item.slug,
    img: item.image?.url ? fixImageUrl(item.image.url) : null,
  })) || [];

  const ringsList = backendRings.length > 0
    ? backendRings
    : RINGS_FALLBACK.map((r) => ({ ...r, img: null }));

  const pendantsList = backendPendants.length > 0
    ? backendPendants
    : PENDANTS_FALLBACK.map((p) => ({ ...p, img: null }));

  const currentList = activeTab === "rings" ? ringsList : pendantsList;
  const currentFallbackIcon = activeTab === "rings" ? RingImg : PendantImg;

  const handleItemClick = (slug) => {
    onClose?.();
    navigate(`/jewellery/${slug}`);
  };

  const handleViewAll = () => {
    onClose?.();
    navigate(activeTab === "rings" ? "/rings" : "/pendants");
  };

  return (
    <div className="flex flex-col gap-4 py-2 flex-1 min-h-0">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h4 className="font-serif italic text-gray-800 text-[16px] sm:text-[17px] tracking-wide">
          {isFullWidth ? "Shop Jewellery by Type" : "Shop Settings by Type"}
        </h4>

        {/* Segmented Switcher for Rings & Pendants (Hover & Click support) */}
        <div className="flex items-center p-1 bg-[#F4F4F2] rounded-lg border border-gray-200/80">
          <button
            type="button"
            onMouseEnter={() => setActiveTab("rings")}
            onClick={() => setActiveTab("rings")}
            className={`px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
              activeTab === "rings"
                ? "bg-white text-[#1E3A34] shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Rings ({ringsList.length})
          </button>
          <button
            type="button"
            onMouseEnter={() => setActiveTab("pendants")}
            onClick={() => setActiveTab("pendants")}
            className={`px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
              activeTab === "pendants"
                ? "bg-white text-[#1E3A34] shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Pendants ({pendantsList.length})
          </button>
        </div>
      </div>

      {/* Subcategories Grid (Single unified flow, no nested scrollbar) */}
      <div className="flex items-start gap-3.5 sm:gap-4.5 flex-wrap">
        {currentList.map((item) => (
          <div
            key={item.slug}
            onClick={() => handleItemClick(item.slug)}
            className="flex flex-col items-center cursor-pointer group w-[96px] sm:w-[110px] lg:w-[118px]"
            title={item.name}
          >
            <div className="w-[96px] h-[96px] sm:w-[110px] sm:h-[110px] lg:w-[118px] lg:h-[118px] bg-[#FAF9F6] border border-gray-200/80 rounded-lg p-3 flex items-center justify-center transition-all duration-200 group-hover:border-[#1E3A34] group-hover:shadow-md group-hover:bg-white overflow-hidden shadow-2xs">
              <img
                src={item.img || currentFallbackIcon}
                alt={item.name}
                className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xs"
                onError={(e) => {
                  e.currentTarget.src = currentFallbackIcon;
                }}
              />
            </div>
            <span className="text-[12px] font-medium text-gray-800 text-center mt-2 group-hover:text-[#1E3A34] transition-colors line-clamp-2 w-full leading-tight">
              {item.name}
            </span>
          </div>
        ))}

        {/* View All Card */}
        <div
          onClick={handleViewAll}
          className="flex flex-col items-center cursor-pointer group w-[96px] sm:w-[110px] lg:w-[118px]"
        >
          <div className="w-[96px] h-[96px] sm:w-[110px] sm:h-[110px] lg:w-[118px] lg:h-[118px] bg-white border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-200 group-hover:border-[#1E3A34] group-hover:bg-[#FAF9F6] shadow-2xs">
            <span className="text-xs sm:text-[13px] font-bold text-gray-800 group-hover:text-[#1E3A34] text-center leading-tight">
              View<br />All
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}