import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCategoryQuery } from "../../features/api/apiSlice";
import { fixImageUrl } from "../../utils/imageUtils";

import BlueSapphireImg from "../../assets/Stone/BlueSapphire.svg";
import CatsEyeImg from "../../assets/Stone/catsEye.svg";
import CoralImg from "../../assets/Stone/Coral.svg";
import EmeraldImg from "../../assets/Stone/Emerald.svg";
import HessoniteImg from "../../assets/Stone/Hessonite.svg";
import PearlImg from "../../assets/Stone/Pearl.svg";
import RubyImg from "../../assets/Stone/Ruby.svg";
import YellowSapphireImg from "../../assets/Stone/YellowSapphire.svg";

const FALLBACK_CATEGORIES = [
  {
    id: "precious",
    name: "Precious Gemstones",
    slug: "precious-gemstones",
    subCategories: [
      { name: "Blue Sapphire", slug: "blue-sapphire", img: BlueSapphireImg },
      { name: "Yellow Sapphire", slug: "yellow-sapphire", img: YellowSapphireImg },
      { name: "Emerald", slug: "emerald", img: EmeraldImg },
      { name: "Ruby", slug: "ruby", img: RubyImg },
      { name: "Pearl", slug: "pearl", img: PearlImg },
      { name: "Red Coral", slug: "coral", img: CoralImg },
      { name: "Cat's Eye", slug: "cats-eye", img: CatsEyeImg },
      { name: "Hessonite", slug: "hessonite", img: HessoniteImg },
      { name: "White Sapphire", slug: "white-sapphire", img: BlueSapphireImg },
    ],
  },
  {
    id: "semi-precious",
    name: "Semi-Precious Gemstones",
    slug: "semi-precious-gemstones",
    subCategories: [
      { name: "Amethyst", slug: "amethyst", img: RubyImg },
      { name: "Turquoise (Firoza)", slug: "firoza", img: BlueSapphireImg },
      { name: "Opal", slug: "opal", img: BlueSapphireImg },
    ],
  },
];

export default function GemstonesMenuContent({ isFullWidth = false, onClose }) {
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const navigate = useNavigate();
  const { data: categoryData, isLoading } = useGetCategoryQuery();

  const normalize = (v) => (v ? String(v).toLowerCase() : "");

  const rawCategories = categoryData?.categories || [];
  const categorizedGems = rawCategories
    .filter((cat) => cat?.subCategories && cat.subCategories.length > 0)
    .map((cat) => ({
      id: cat._id || cat.slug || cat.name,
      name: cat.name,
      slug: cat.slug || cat.name?.toLowerCase().replace(/ /g, "-"),
      subCategories: cat.subCategories.map((sub) => ({
        name: sub.name,
        slug: sub.slug,
        img: sub.image?.url ? fixImageUrl(sub.image.url) : null,
      })),
    }));

  const categoryList =
    categorizedGems.length > 0 ? categorizedGems : FALLBACK_CATEGORIES;

  const totalGemsCount = categoryList.reduce(
    (acc, cat) => acc + (cat.subCategories?.length || 0),
    0
  );

  const allGems = categoryList.flatMap((cat) => cat.subCategories);
  const sapphireGems = allGems.filter((gem) =>
    /blue.?sapphire/i.test(`${gem.name} ${gem.slug}`)
  );

  const handleGemClick = (slug) => {
    onClose?.();
    navigate(`/gemstone/${slug}`);
  };

  const handleViewAllGems = (categorySlug) => {
    onClose?.();
    if (categorySlug && categorySlug !== "all") {
      navigate(`/gemstone?category=${categorySlug}`);
    } else {
      navigate("/gemstone");
    }
  };

  const handleViewAllSapphires = () => {
    onClose?.();
    navigate("/gemstone?search=blue-sapphire");
  };

  // ---------------------------------------------
  // HOVER & CLICK TAB HANDLERS
  // ---------------------------------------------
  const activateTab = useCallback((tabId) => {
    setActiveCategoryTab(tabId);
  }, []);

  // ---------------------------------------------
  // COMPACT (non full-width) VIEW (Design Your Own half)
  // ---------------------------------------------
  if (!isFullWidth) {
    return (
      <div className="flex flex-col gap-4 py-2 flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <h4 className="font-serif italic text-gray-800 text-[16px] sm:text-[17px] tracking-wide">
            Shop Gemstones by Type
          </h4>
          <span className="text-xs font-semibold text-gray-400">
            {allGems.length} Natural Gemstones
          </span>
        </div>
        {sapphireGems.length > 0 && (
          <button
            type="button"
            onClick={handleViewAllSapphires}
            className="self-start text-xs font-semibold text-[#1E3A34] hover:text-[#D4AF37] hover:underline transition-colors cursor-pointer"
          >
            Shop All Sapphires →
          </button>
        )}

        <div className="flex items-start gap-3.5 sm:gap-4.5 flex-wrap">
          {isLoading && categorizedGems.length === 0 ? (
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-[100px] h-[100px] sm:w-[115px] sm:h-[115px] bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            allGems.map((gem) => (
              <div
                key={gem.slug}
                onClick={() => handleGemClick(gem.slug)}
                className="flex flex-col items-center cursor-pointer group w-[96px] sm:w-[110px] lg:w-[118px]"
                title={gem.name}
              >
                <div className="w-[96px] h-[96px] sm:w-[110px] sm:h-[110px] lg:w-[118px] lg:h-[118px] bg-[#FAF9F6] border border-gray-200/80 rounded-lg p-3 flex items-center justify-center transition-all duration-200 group-hover:border-[#1E3A34] group-hover:shadow-md group-hover:bg-white overflow-hidden shadow-2xs">
                  <img
                    src={gem.img || BlueSapphireImg}
                    alt={gem.name}
                    className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xs"
                    onError={(e) => {
                      e.currentTarget.src = BlueSapphireImg;
                    }}
                  />
                </div>
                <span className="text-[12px] font-medium text-gray-800 text-center mt-2 group-hover:text-[#1E3A34] transition-colors line-clamp-1 w-full truncate leading-snug">
                  {gem.name}
                </span>
              </div>
            ))
          )}

          <div
            onClick={() => handleViewAllGems()}
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

  // ---------------------------------------------
  // FULL-WIDTH VIEW — subcategorized with HOVER & CLICK tabs
  // ---------------------------------------------
  const displayedCategories =
    activeCategoryTab === "all"
      ? categoryList
      : categoryList.filter(
          (c) =>
            c.id === activeCategoryTab ||
            c.slug === activeCategoryTab ||
            normalize(c.name) === normalize(activeCategoryTab)
        );

  return (
    <div className="flex flex-col gap-4 py-2 flex-1 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 shrink-0">
        <div>
          <h4 className="font-serif italic text-gray-800 text-[16px] sm:text-[17px] tracking-wide">
            Shop Gemstones by Type
          </h4>
          <span className="text-xs font-semibold text-gray-400">
            {totalGemsCount} Natural Gemstones Available
          </span>
        </div>

        {categoryList.length > 1 && (
          <div className="flex items-center gap-1 p-1 bg-[#F4F4F2] rounded-lg border border-gray-200/80 overflow-x-auto max-w-full scrollbar-none">
            <button
              type="button"
              onMouseEnter={() => activateTab("all")}
              onClick={() => activateTab("all")}
              className={`px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-[13px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryTab === "all"
                  ? "bg-white text-[#1E3A34] shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All ({totalGemsCount})
            </button>

            {categoryList.map((cat) => {
              const tabId = cat.id || cat.slug || cat.name;
              const isActive =
                activeCategoryTab === cat.id ||
                activeCategoryTab === cat.slug ||
                normalize(activeCategoryTab) === normalize(cat.name);

              return (
                <button
                  key={tabId}
                  type="button"
                  onMouseEnter={() => activateTab(tabId)}
                  onClick={() => activateTab(tabId)}
                  className={`px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-[13px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white text-[#1E3A34] shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {cat.name} ({cat.subCategories.length})
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {isLoading && categorizedGems.length === 0 ? (
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-[100px] h-[100px] sm:w-[115px] sm:h-[115px] bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          displayedCategories.map((catGroup) => (
            <div key={catGroup.name} className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1E3A34]" />
                  <h5 className="font-serif uppercase tracking-wider text-[#1E3A34] text-[13px] sm:text-[14px] font-bold">
                    {catGroup.name}
                  </h5>
                  <span className="text-[11px] font-semibold text-gray-400">
                    ({catGroup.subCategories.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewAllGems(catGroup.slug)}
                  className="text-xs font-semibold text-[#1E3A34] hover:text-[#D4AF37] hover:underline transition-colors cursor-pointer"
                >
                  View All {catGroup.name} →
                </button>
              </div>

              <div className="flex items-start gap-3.5 sm:gap-4.5 flex-wrap">
                {catGroup.subCategories.map((gem) => (
                  <div
                    key={gem.slug}
                    onClick={() => handleGemClick(gem.slug)}
                    className="flex flex-col items-center cursor-pointer group w-[96px] sm:w-[110px] lg:w-[118px]"
                    title={gem.name}
                  >
                    <div className="w-[96px] h-[96px] sm:w-[110px] sm:h-[110px] lg:w-[118px] lg:h-[118px] bg-[#FAF9F6] border border-gray-200/80 rounded-lg p-3 flex items-center justify-center transition-all duration-200 group-hover:border-[#1E3A34] group-hover:shadow-md group-hover:bg-white overflow-hidden shadow-2xs">
                      <img
                        src={gem.img || BlueSapphireImg}
                        alt={gem.name}
                        className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xs"
                        onError={(e) => {
                          e.currentTarget.src = BlueSapphireImg;
                        }}
                      />
                    </div>
                    <span className="text-[12px] font-medium text-gray-800 text-center mt-2 group-hover:text-[#1E3A34] transition-colors line-clamp-1 w-full truncate leading-snug">
                      {gem.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}