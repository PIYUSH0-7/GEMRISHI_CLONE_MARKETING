import React, { useState, useEffect } from "react";
import HeaderAnnouncementBar from "./HeaderAnnouncementBar";
import HeaderLogoRow from "./HeaderLogoRow";
import HeaderNavbar from "./HeaderNavbar";
import HeaderSearchModal from "./HeaderSearchModal";
import HeaderMobileDrawer from "./HeaderMobileDrawer";
import { useGetCategoryQuery, useGetJewelryCategoryQuery } from "../../features/api/apiSlice";

/**
 * Header: Master assembly coordinating Announcement strip, Logo row,
 * Navbar row, Search modal, and Mobile drawer according to GEMINI.md clean architecture.
 */
export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Background icon caching for fast navigation
  const { data: categoryData } = useGetCategoryQuery();
  const { data: jewelleryData } = useGetJewelryCategoryQuery();

  useEffect(() => {
    const urls = [];
    categoryData?.categories?.forEach((cat) =>
      cat?.subCategories?.forEach((item) => {
        if (item?.image?.url) urls.push(item.image.url);
      })
    );
    jewelleryData?.jewelryCategories?.forEach((cat) =>
      cat?.jewelrySubCategories?.forEach((item) => {
        if (item?.image?.url) urls.push(item.image.url);
      })
    );
    urls.slice(0, 15).forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [categoryData, jewelleryData]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs bg-white font-sans">
      {/* 1. Top Announcement / Trust Strip with Rotating Astrology Ticker & Helpline */}
      <HeaderAnnouncementBar />

      {/* 2. Top Tier: Centered Logo + 4 Action Icons (Search, Wishlist, Compare, Cart) */}
      <HeaderLogoRow
        onOpenSearchModal={() => setIsSearchOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* 3. Secondary Tier: Clean Horizontal Navbar Bar */}
      <HeaderNavbar />

      {/* 4. Interactive Search Modal */}
      <HeaderSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 5. Responsive Mobile Drawer (< 1024px) */}
      <HeaderMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}
