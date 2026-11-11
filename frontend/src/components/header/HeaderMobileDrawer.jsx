import { ChevronDown, ChevronRight, Heart, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RingImg from "../../assets/Jwellery/Ring.svg";
import BlueSapphireImg from "../../assets/Stone/BlueSapphire.svg";
import { CAMPAIGN_CONFIG, isCampaignActive } from "../../config/campaignOffers.config.js";
import { useGetCategoryQuery, useGetJewelryCategoryQuery } from "../../features/api/apiSlice";
import { fixImageUrl } from "../../utils/imageUtils";
import CurrencySelector from "../CurrencySelector";

export default function HeaderMobileDrawer({
  isOpen,
  onClose,
  handleLoginClick,
}) {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null);
  const user = useSelector((state) => state.auth.userInfo);
  const cartItemsCount = useSelector((state) => state.cart?.items?.length || 0);
  const wishlistCount = useSelector((state) => state.wishlist?.items?.length || 0);
  const isLoggedIn = Boolean(user);

  // Fetch backend categories for mobile drawer
  const { data: categoryData } = useGetCategoryQuery();
  const { data: jewelleryData } = useGetJewelryCategoryQuery();

  const rawGemCategories = categoryData?.categories || [];
  const gemCategories = rawGemCategories
    .filter((cat) => cat?.subCategories && cat.subCategories.length > 0)
    .map((cat) => ({
      name: cat.name,
      slug: cat.slug || cat.name?.toLowerCase().replace(/ /g, "-"),
      subCategories: cat.subCategories.map((sub) => ({
        name: sub.name,
        slug: sub.slug,
        img: sub.image?.url ? fixImageUrl(sub.image.url) : BlueSapphireImg,
      })),
    }));

  const backendGems = [];
  categoryData?.categories?.forEach((cat) => {
    cat?.subCategories?.forEach((sub) => {
      backendGems.push({
        name: sub.name,
        slug: sub.slug,
        img: sub.image?.url ? fixImageUrl(sub.image.url) : BlueSapphireImg,
      });
    });
  });

  const sapphireGems = backendGems.filter((gem) =>
    /sapphire/i.test(`${gem.name} ${gem.slug}`)
  );

  const totalGemsCount = gemCategories.reduce(
    (acc, cat) => acc + cat.subCategories.length,
    backendGems.length
  );

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
    img: item.image?.url ? fixImageUrl(item.image.url) : RingImg,
  })) || [];

  const backendPendants = pendantsCategory?.jewelrySubCategories?.map((item) => ({
    name: item.name,
    slug: item.slug,
    img: item.image?.url ? fixImageUrl(item.image.url) : RingImg,
  })) || [];

  if (!isOpen) return null;

  const handleNavClick = (path) => {
    onClose();
    navigate(path);
  };

  const toggleSection = (sec) => {
    setOpenSection((prev) => (prev === sec ? null : sec));
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-250">

        {/* Top Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <img
            src="/GemRishi.svg"
            alt="GemRishi"
            className="h-8 w-auto object-contain cursor-pointer"
            onClick={() => handleNavClick("/")}
          />
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency selector bar */}
        <div className="px-5 py-2.5 bg-[#FAF9F6] border-b border-gray-100 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Currency
          </span>
          <CurrencySelector />
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-6 space-y-1 text-sm font-semibold tracking-wider uppercase text-[#111827]">

          {/* 1. Design Your Own Accordion */}


          {/* 2. Gemstones Accordion */}
          <div>
            <button
              onClick={() => toggleSection("gemstones")}
              className="w-full flex items-center justify-between min-h-[44px] px-3 rounded-lg hover:bg-[#FAF9F6] text-left"
            >
              <span>Gemstones ({totalGemsCount || "All"})</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  openSection === "gemstones" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSection === "gemstones" && (
              <div className="pl-4 pr-1 py-2 max-h-[250px] overflow-y-auto space-y-2 text-xs normal-case font-medium text-gray-700 scrollbar-thin">
                <button
                  onClick={() => handleNavClick("/gemstone")}
                  className="w-full text-left py-1.5 px-2 font-bold text-[#1E3A34] hover:bg-gray-50 rounded"
                >
                  View All Gemstones →
                </button>


                {gemCategories.length > 0 ? (
                  gemCategories.map((category) => (
                    <div key={category.name} className="space-y-1">
                      <span className="px-2 text-[10px] uppercase font-bold tracking-wider text-[#1E3A34]/70 block pt-1 border-b border-gray-100 pb-0.5">
                        {category.name}
                      </span>
                      {category.subCategories.map((gem) => (
                        <button
                          key={gem.slug}
                          onClick={() => handleNavClick(`/gemstone/${gem.slug}`)}
                          className="w-full flex items-center gap-2.5 py-1.5 px-2 hover:bg-gray-50 rounded text-left"
                        >
                          <img
                            src={gem.img}
                            alt={gem.name}
                            className="w-6 h-6 object-contain rounded shrink-0"
                          />
                          <span className="truncate">{gem.name}</span>
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  backendGems.map((gem) => (
                    <button
                      key={gem.slug}
                      onClick={() => handleNavClick(`/gemstone/${gem.slug}`)}
                      className="w-full flex items-center gap-2.5 py-1.5 px-2 hover:bg-gray-50 rounded text-left"
                    >
                      <img
                        src={gem.img}
                        alt={gem.name}
                        className="w-6 h-6 object-contain rounded shrink-0"
                      />
                      <span className="truncate">{gem.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 3. Jewellery Accordion */}
          <div>
            <button
              onClick={() => toggleSection("jewellery")}
              className="w-full flex items-center justify-between min-h-[44px] px-3 rounded-lg hover:bg-[#FAF9F6] text-left"
            >
              <span>Jewellery</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  openSection === "jewellery" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSection === "jewellery" && (
              <div className="pl-4 pr-1 py-2 max-h-[240px] overflow-y-auto space-y-2 text-xs normal-case font-medium text-gray-700 scrollbar-thin">
                <button
                  onClick={() => handleNavClick("/jewellery")}
                  className="w-full text-left py-1.5 px-2 font-bold text-[#1E3A34] hover:bg-gray-50 rounded"
                >
                  View All Jewellery →
                </button>

                {backendRings.length > 0 && (
                  <div>
                    <span className="px-2 text-[10px] uppercase font-bold tracking-wider text-gray-400 block pt-1">
                      Rings
                    </span>
                    {backendRings.slice(0, 8).map((ring) => (
                      <button
                        key={ring.slug}
                        onClick={() => handleNavClick(`/jewellery/${ring.slug}`)}
                        className="w-full flex items-center gap-2.5 py-1.5 px-2 hover:bg-gray-50 rounded text-left"
                      >
                        <img
                          src={ring.img}
                          alt={ring.name}
                          className="w-6 h-6 object-contain rounded shrink-0"
                        />
                        <span className="truncate">{ring.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {backendPendants.length > 0 && (
                  <div>
                    <span className="px-2 text-[10px] uppercase font-bold tracking-wider text-gray-400 block pt-2">
                      Pendants
                    </span>
                    {backendPendants.slice(0, 8).map((pendant) => (
                      <button
                        key={pendant.slug}
                        onClick={() => handleNavClick(`/jewellery/${pendant.slug}`)}
                        className="w-full flex items-center gap-2.5 py-1.5 px-2 hover:bg-gray-50 rounded text-left"
                      >
                        <img
                          src={pendant.img}
                          alt={pendant.name}
                          className="w-6 h-6 object-contain rounded shrink-0"
                        />
                        <span className="truncate">{pendant.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Rudraksha */}
          <a
            href="https://rudraksha.gemrishi.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center justify-between min-h-[44px] px-3 rounded-lg hover:bg-[#FAF9F6] text-left"
          >
            <span>Rudraksha</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>

          {/* 5. Guidance Accordion */}
          <div>
            <button
              onClick={() => toggleSection("guidance")}
              className="w-full flex items-center justify-between min-h-[44px] px-3 rounded-lg hover:bg-[#FAF9F6] text-left"
            >
              <span>Guidance</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  openSection === "guidance" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSection === "guidance" && (
              <div className="pl-6 py-1 space-y-1 text-xs normal-case font-medium text-gray-600">
                <button
                  onClick={() => handleNavClick("/suggest")}
                  className="w-full text-left py-2 px-2 hover:text-[#1E3A34]"
                >
                  Gem Suggestion
                </button>
                <button
                  onClick={() => handleNavClick("/carat-to-ratti-converter")}
                  className="w-full text-left py-2 px-2 hover:text-[#1E3A34]"
                >
                  Carat to Ratti Converter
                </button>
                <button
                  onClick={() => handleNavClick("/buy-gemstone-online")}
                  className="w-full text-left py-2 px-2 hover:text-[#1E3A34]"
                >
                  Buy Gemstone Online
                </button>
              </div>
            )}
          </div>

          {/* 6. Blogs */}
          <a
            href="https://gemrishi.com/blogs"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center justify-between min-h-[44px] px-3 rounded-lg hover:bg-[#FAF9F6] text-left"
          >
            <span>Blogs</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>

          {/* 7. Offers */}
          {(!isCampaignActive || isCampaignActive()) && (
            <button
              onClick={() => handleNavClick("/offers")}
              className="w-full flex items-center justify-between min-h-[44px] px-3 rounded-lg hover:bg-[#FAF9F6] text-left text-red-600"
            >
              <span className="flex items-center gap-1.5">
                <span>{CAMPAIGN_CONFIG?.ui?.navbarBadgeText || "OFFERS"}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* 8. GemRishi Story Accordion */}
          <div>
            <button
              onClick={() => toggleSection("story")}
              className="w-full flex items-center justify-between min-h-[44px] px-3 rounded-lg hover:bg-[#FAF9F6] text-left"
            >
              <span>GemRishi Story</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  openSection === "story" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSection === "story" && (
              <div className="pl-6 py-1 space-y-1 text-xs normal-case font-medium text-gray-600">
                <button
                  onClick={() => handleNavClick("/aboutUs")}
                  className="w-full text-left py-2 px-2 hover:text-[#1E3A34]"
                >
                  About Us
                </button>
                <button
                  onClick={() => handleNavClick("/contactUs")}
                  className="w-full text-left py-2 px-2 hover:text-[#1E3A34]"
                >
                  Contact Us
                </button>
                <button
                  onClick={() => handleNavClick("/locations")}
                  className="w-full text-left py-2 px-2 hover:text-[#1E3A34]"
                >
                  Store Locations
                </button>
                <button
                  onClick={() => handleNavClick("/certificate")}
                  className="w-full text-left py-2 px-2 hover:text-[#1E3A34]"
                >
                  Certificates
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions (Account & Cart & Wishlist) */}
        <div className="p-4 border-t border-gray-100 bg-[#FAF9F6] space-y-2 shrink-0">

          {/* Hardcoded Account Button */}



          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleNavClick("/wishlist")}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:text-[#1E3A34]"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist ({wishlistCount})</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("/shopping/cart")}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:text-[#1E3A34]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart ({cartItemsCount})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
