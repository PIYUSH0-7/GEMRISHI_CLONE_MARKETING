import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useSimilarJewelry,
  useSimilarProducts,
} from "../hooks/usesimilarJewelry";
import { getProductUrl } from "../utils/productUrl";
// --------------add for currrency by Pawan-------------------
import { useSelector } from "react-redux";
import { ConvertFromINR, formatCurrency } from "../utils/currency";
// ---------------add for currrency by Pawan-------------------
export default function BlueSapphireJewellery({ gemstone, gemstoneId }) {
  const scrollRef = useRef(null);
  const { data, loading, error } = useSimilarProducts(gemstoneId);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // --------------add for currrency by Pawan------------------------
  const { currency, rates } = useSelector((s) => s.currency);
  const formatPrice = (price) => {
    return formatCurrency(ConvertFromINR(Number(price) || 0, rates, currency), currency);
  };
// --------------add for currrency by Pawan--------------------------
  // Loading State
  if (loading) {
    return (
      <div className="w-full bg-white py-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#264A3F] mb-4"></div>
        <p className="text-gray-400 uppercase tracking-widest text-xs font-semibold">Curating Collection...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="w-full bg-white py-20 text-center">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  // Empty State
  if (!data?.products || data.products.length === 0) return null;
  return (
    <div className="w-full bg-white relative font-sans mb-10">

      {/* Premium Header - Reduced top margin (removed mt-8, added mt-2 sm:mt-4) */}
      <div className="text-center ">
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#264A3F] mb-2 sm:mb-3">
          Discover More
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900">
          Similar Products
        </h2>
      </div>

      <div className="relative flex items-center max-w-[1500px] mx-auto">

        {/* Left Arrow - Solid Green (Hidden on mobile) */}
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute left-2 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#264A3F] text-white rounded-full shadow-md items-center justify-center hover:bg-[#1a3329] transition-all duration-300"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 sm:gap-6 lg:gap-8 scroll-smooth scrollbar-hide px-4 sm:px-20 lg:px-28 w-full py-4 snap-x snap-mandatory"
        >
          {data?.products?.map((p) => (
            <div
              key={p._id}
              className="group min-w-[180px] sm:min-w-[280px] snap-start sm:snap-center bg-white rounded-[20px] sm:rounded-[24px] border border-gray-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer transition-all duration-500 flex flex-col p-2.5 sm:p-3 pb-4 sm:pb-5 hover:-translate-y-1"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                navigate(getProductUrl(p));
              }}
            >

              {/* Image Container */}
              <div className="w-full aspect-square bg-[#F9F9FB] rounded-[16px] mb-3 sm:mb-4 relative flex items-center justify-center p-3 sm:p-6 overflow-hidden border border-gray-50">
                <img
                  src={p?.images?.[0]?.url || "/placeholder.svg"}
                  alt={p.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Text Details */}
              <div className="px-2 flex flex-col items-center text-center">
                <h3 className="font-serif text-[15px] sm:text-[17px] text-gray-900 leading-snug line-clamp-1 mb-1">
                  {p.name}
                </h3>

                <p className="text-[10px] sm:text-[12px] text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">
                  {p.carat ? `${p.carat} Carats` : "Premium Quality"}
                </p>
{/* ---------------------Add By pawan for currency-------------------------------------- */}
                <p className="text-[#264A3F] font-bold text-[15px] sm:text-[16px]">
                 {formatPrice(p.price)}
                </p>
{/* ---------------------Add By pawan for currency-------------------------------------- */}
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow - Solid Green (Hidden on mobile) */}
        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute right-2 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#264A3F] text-white rounded-full shadow-md items-center justify-center hover:bg-[#1a3329] transition-all duration-300"
        >
          <ChevronRight size={24} strokeWidth={2} />
        </button>

      </div>
    </div>
  );
}