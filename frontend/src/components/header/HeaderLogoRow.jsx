import { Heart, Menu, Scale, Search, ShoppingBag } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

export default function HeaderLogoRow({
  onToggleMobileMenu,
  onOpenSearchModal,
  onToggleSearch,
  onOpenLogin,
}) {
  const navigate = useNavigate();

  // Redux state
  const wishlistCount = useSelector(
    (state) => state.wishlist?.items?.length || 0
  );
  const compareCount = useSelector(
    (state) => state.compare?.items?.length || 0
  );
  const cartItemsCount = useSelector(
    (state) => state.cart?.items?.length || 0
  );

  return (
    <div className="bg-[#FAF9F6] border-b border-gray-100/80 py-3 sm:py-4 transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between relative">
        {/* Left: Mobile Drawer Trigger Hamburger */}
        <div className="flex items-center lg:hidden z-10">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Open mobile menu"
            className="p-1.5 -ml-1.5 text-[#111827] hover:text-[#1E3A34] transition-colors focus:outline-hidden"
          >
            <Menu className="w-6 h-6 stroke-[1.8]" />
          </button>
        </div>

        {/* Center: Brand Logo (Always Centered) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-[1.01] flex items-center gap-3"
            onClick={() => navigate("/")}
          >
            {/* Crest / Logo SVG */}
            <img
              src="/GemRishi.svg"
              alt="GemRishi – Certified Astrological Gemstones & Fine Jewellery"
              width="210"
              height="48"
              fetchPriority="high"
              className="h-9 sm:h-11 lg:h-12 w-auto object-contain select-none"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = document.getElementById("brand-text-logo");
                if (fallback) fallback.style.display = "block";
              }}
            />
            <span
              id="brand-text-logo"
              className="hidden font-serif text-2xl lg:text-3xl font-bold tracking-wider text-[#1E3A34]"
            >
              GEMRISHI
            </span>
          </div>
        </div>

        {/* Right: 4 Header Action Icons (Search, Wishlist, Compare, Cart) */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-4 lg:gap-5 z-10 ml-auto">
          {/* 1. Instant Search */}
          <button
            type="button"
            onClick={onOpenSearchModal}
            aria-label="Search gemstones and jewellery"
            className="text-[#111827] hover:text-[#D4AF37] transition-colors p-1 group flex items-center justify-center cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5 stroke-[1.6] group-hover:scale-110 transition-transform" />
          </button>

          {/* 2. Wishlist */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative text-[#111827] hover:text-[#D4AF37] transition-colors p-1 group flex items-center justify-center"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 stroke-[1.6] group-hover:scale-110 transition-transform" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* 3. Compare */}
          <Link
            to="/compare"
            aria-label="Compare Gemstones"
            className="relative text-[#111827] hover:text-[#D4AF37] transition-colors p-1 group flex items-center justify-center"
            title="Compare"
          >
            <Scale className="w-5 h-5 stroke-[1.6] group-hover:scale-110 transition-transform" />
            {compareCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#1E3A34] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                {compareCount}
              </span>
            )}
          </Link>

          {/* 4. Cart */}
          <button
            type="button"
            onClick={() => navigate("/shopping/cart")}
            aria-label={`Cart with ${cartItemsCount} items`}
            className="relative text-[#111827] hover:text-[#D4AF37] transition-colors p-1 group flex items-center justify-center cursor-pointer"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.6] group-hover:scale-110 transition-transform" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#1E3A34] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Right Quick Icons (Search & Cart) */}
        <div className="flex lg:hidden items-center gap-3 z-10">
          <button
            type="button"
            onClick={onOpenSearchModal}
            aria-label="Search"
            className="text-[#111827] p-1.5"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/shopping/cart")}
            aria-label="Cart"
            className="relative text-[#111827] p-1.5"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#1E3A34] text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
