import { useNavigate } from "react-router-dom";
import BlueSapphire from "../../assets/Stone/BlueSapphire.svg";
import { useGetCategoryQuery } from "../../features/api/apiSlice";

const CategoryModal = ({ closeNavbar }) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCategoryQuery();
  const categories = data?.categories;

  // --- Loading State (Responsive) ---
  if (isLoading)
    return (
      <div className="p-4 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-12 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 w-full lg:w-32 animate-pulse">
            <div className="h-3 bg-gray-200 w-20 rounded"></div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-2 bg-gray-100 w-full rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );

  // --- Error State ---
  if (error || !categories)
    return <div className="p-6 text-xs text-gray-400">Unavailable</div>;

  // Filter Logic
  const visibleCategories = categories.filter(
    (cat) => cat?.subCategories?.length > 0,
  );
  if (visibleCategories.length === 0)
    return <div className="p-6 text-xs text-gray-400">No Collections</div>;

  const handleItemClick = (slug) => {
    navigate(`/gemstone/${slug}`);
    if (closeNavbar) closeNavbar();
  };

  // --- RESPONSIVE LAYOUT LOGIC ---
  const isSingleCategory = visibleCategories.length === 1;

  return (
    <div
      className={`
        bg-white text-left transition-all duration-300 w-full
        ${
          // isSingleCategory
          //   ? "p-4 lg:p-6 lg:min-w-[260px]"
          //   : "flex flex-col lg:flex-row p-4 lg:p-8 gap-6 lg:gap-10 divide-y lg:divide-y-0 lg:divide-x divide-gray-100"
          isSingleCategory
          ? "p-4 lg:p-6 lg:min-w-[260px]"
          : "grid grid-cols-1 lg:grid-cols-4 p-4 lg:p-8 gap-6 lg:gap-10"
        }
      `}
    >
      {visibleCategories.map((category, index) => (
        <div
          key={index}
          // className={`
          //   flex flex-col space-y-3 
          //   ${index > 0 ? "pt-4 lg:pt-0 lg:pl-10" : ""} 
          //   w-full lg:w-auto
          // `}
          className={`
            flex flex-col space-y-3 min-w-0
            ${index > 0 ? "pt-4 lg:pt-0 lg:border-l lg:border-[#264A3F]/10 lg:pl-6" : ""}
          `}
        >
          {/* Header: Serif, Uppercase */}
          {/* <h3 className="font-serif text-[#264A3F] text-[11px] font-bold tracking-[0.25em] uppercase border-b border-[#264A3F]/20 pb-2 mb-1">
            {category.name}
          </h3> */}
          <h3 className="font-serif text-[#264A3F] text-[11px] font-bold tracking-[0.25em] uppercase border-b border-[#264A3F]/20 pb-2 mb-1 leading-snug">
            {category.name}
          </h3>

          <ul className="space-y-3">
            {category.subCategories.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleItemClick(item.slug)}
                className="group flex items-center gap-3 cursor-pointer"
              >
                {/* Image: Coin style */}
                <div className="relative w-8 h-8 rounded-full flex-shrink-0">
                  <img
                    src={item.image?.url || BlueSapphire}
                    alt={item.name}
                    /* ✅ FIX: Changed to grayscale-0 on mobile, lg:grayscale on desktop */
                    className="w-full h-full object-cover rounded-full filter grayscale-0 lg:grayscale group-hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      e.currentTarget.src = BlueSapphire;
                    }}
                  />
                </div>

                {/* Text Link */}
                <span className="text-[13px] font-medium text-gray-500 group-hover:text-black lg:group-hover:translate-x-1 transition-all duration-300">
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

export default CategoryModal;
