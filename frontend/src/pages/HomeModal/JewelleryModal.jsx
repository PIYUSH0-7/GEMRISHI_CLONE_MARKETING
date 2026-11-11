import { useNavigate } from "react-router-dom";
import Bracelets from "../../assets/Jwellery/Bracelets.svg";
import { useGetJewelryCategoryQuery } from "../../features/api/apiSlice";
import { appendRandomString } from "../../utils/randomString";
const JewelleryModal = ({ closeNavbar }) => {
  const navigate = useNavigate();
  //----------------------------------Fetch data----------------------------------------------
  const {
    data: jewelleryData,
    isLoading,
    error,
  } = useGetJewelryCategoryQuery();
  const categories = jewelleryData?.jewelryCategories;
  // ---------------------- Premium Loading Skeleton (Responsive) ----------------------------
  const LoadingSkeleton = () => (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 lg:p-6 w-full lg:min-w-[300px]">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3 w-full lg:w-32">
          <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-2"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
  //-- Navigation Handler --
  const handleItemClick = (slug) => {
    navigate(appendRandomString(`/jewellery/${slug}`));
    if (closeNavbar) closeNavbar();
  };
  //-- Loading State --
  if (isLoading) return <LoadingSkeleton />;
  // -- Error State --
  if (error || !categories) {
    return <div className="p-6 text-xs text-gray-400">Unavailable</div>;
  }
  // Categories and subcategories to hide from the navigation menu
  const HIDDEN_CATEGORIES = ["bracelets", "exclusive designs"];
  const HIDDEN_SUBCATEGORIES = ["feroza bracelet", "exclusive designs"];

  // Filter Logic
  const visibleCategories = (categories || [])
    .filter((category) => {
      const catName = (category?.name || "").trim().toLowerCase();
      return !HIDDEN_CATEGORIES.includes(catName);
    })
    .map((category) => ({
      ...category,
      jewelrySubCategories: (category?.jewelrySubCategories || []).filter(
        (item) => {
          const subName = (item?.name || "").trim().toLowerCase();
          return !HIDDEN_SUBCATEGORIES.includes(subName);
        }
      ),
    }))
    .filter((category) => category?.jewelrySubCategories?.length > 0);
  if (visibleCategories.length === 0) {
    return (
      <div className="p-6 text-xs text-gray-400 italic">
        No collections found.
      </div>
    );
  }
  // --------------------- Fix By Pawan Dynamic Layout Logic ----------------------------------
  const isSingleCategory = visibleCategories.length === 1;
  return (
    <div
      className={`
         bg-white text-left transition-all duration-300 w-full
        ${isSingleCategory
           ? "p-1 lg:p-2 lg:min-w-[120px]"
  : "flex flex-col lg:flex-row p-1.5 lg:p-3 gap-4 divide-y lg:divide-y-0"
        }
      `}
    >
      {visibleCategories.map((category, categoryIndex) => (
        <div
          key={categoryIndex}
          className={`
              flex flex-col space-y-2 w-full lg:w-auto
  ${
    categoryIndex > 0
      ? "pt-3 lg:pt-0 lg:pl-3 lg:ml-3 lg:border-l lg:border-gray-200"
      : ""
  }
          `}
        >
{/* --------------------- Fix By Pawan Dynamic Layout Logic ---------------------------------- */}
          {/* Header: Consistent Premium Style */}
          <h3 className="font-serif text-[#264A3F] text-[11px] font-bold tracking-[0.25em] uppercase border-b border-[#264A3F]/20 pb-2 mb-1">
            {category.name} 
          </h3>
          {/* Subcategories List */}
          <ul className="space-y-2.5">
            {category?.jewelrySubCategories?.map((item, itemIndex) => (
              <li
                key={itemIndex}
                onClick={() => handleItemClick(item.slug)}
                className="group flex items-center gap-3 cursor-pointer py-1"
              >
                {/* Image: Consistent Premium Border */}
                <div className="relative w-9 h-9 rounded-full flex-shrink-0">
                  <img
                    src={item.image?.url || Bracelets}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = Bracelets;
                    }}
                  />
                </div>
                {/* Text: Consistent Typography */}
                <span className="text-[13px] font-medium text-gray-600 group-hover:text-black group-hover:translate-x-1 transition-all duration-300">
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
export default JewelleryModal;
