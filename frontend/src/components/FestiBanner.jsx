import { useState } from "react";
import {
  FaCertificate,
  FaCheckCircle,
  FaChevronDown,
  FaGem,
  FaOm,
  FaPercent,
  FaShieldAlt,
  FaShippingFast,
} from "react-icons/fa";

import DesktopBanner from "../assets/festbanner.webp";
import MobileBanner from "../assets/festbannermobile.webp";

const FestivalHero = () => {
  const [isOpen, setIsOpen] = useState(false);

  const offers = [
    {
      title: "Flat 15% OFF",
      description: "Across every gemstone purchase.",
      icon: FaPercent,
    },
    {
      title: "Free Govt. Lab Certificate",
      description:
        "Complimentary IIGJ–GJEPC certification on all gemstones valued at ₹20,000 or more.",
      icon: FaCertificate,
    },
    {
      title: "Free Vedic Pooja & Delivery",
      description:
        "Complimentary Vedic Pran Pratishtha Pooja, express insured domestic shipping, and a lifetime authenticity guarantee card.",
      icon: FaShippingFast,
    },
  ];

  return (
    <section className="w-full bg-[#122b22]">
      {/* Responsive Festival Banner */}
{/* Responsive Festival Banner */}
<picture className="block w-full bg-[#122b22]">
  <source
    media="(max-width: 767px)"
    srcSet={MobileBanner}
    width="768"
    height="500"
  />

  <img
    className="
      block w-full
      h-auto
      md:h-[400px]
      lg:h-[500px]
      object-contain
      md:object-cover
      md:object-center
    "
    src={DesktopBanner}
    alt="GemRishi Festive Celebration - Certified Natural Gemstones Offers"
    width="1920"
    height="600"
    fetchPriority="high"
    loading="eager"
  />
      </picture>

      {/* Collapsible Gemstone Offers Banner */}
      <div className="w-full border-t border-[#d4af37]/20 bg-[#1b3d31] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Dropdown Header Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="festive-offers-panel"
            className="flex w-full items-center justify-between gap-4 rounded-xl border border-green-800 bg-[#122b22]/80 p-4 text-left text-white transition-all duration-300 hover:border-cyan-600 hover:bg-[#122b22] focus:outline-none focus:ring-2 focus:ring-white sm:px-6"
          >
            <div className="pr-2">
              <h2 className="text-base font-bold text-white sm:text-xl">
                Exclusive Gemstone Benefits
              </h2>
              <p className="mt-0.5 text-xs text-stone-300 sm:text-sm">
                Special offers, complimentary services, and authenticity benefits
              </p>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1b3d31] text-white border border-[#d4af37]/30">
              <FaChevronDown
                className={`text-sm transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </div>
          </button>

          {/* Expandable Content Container */}
          <div
            id="festive-offers-panel"
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
              isOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0 pointer-events-none"
            }`}
            aria-hidden={!isOpen}
          >
            <div className="overflow-hidden">
              <div className="pt-6">
                {/* Offers Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
                  {offers.map((offer) => {
                    const Icon = offer.icon;

                    return (
                      <div
                        key={offer.title}
                        className="group flex flex-col justify-between rounded-xl border border-[#d4af37]/20 bg-[#eaf2ec] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/50 hover:bg-white hover:shadow-md"
                      >
                        <div>
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1b3d31] text-white transition-transform duration-300 group-hover:scale-110">
                            <Icon size={20} aria-hidden="true" />
                          </div>

                          <h3 className="mb-2 text-base font-bold leading-snug text-[#122b22] sm:text-lg">
                            {offer.title}
                          </h3>

                          <p className="text-xs leading-relaxed text-[#2a4036] sm:text-sm">
                            {offer.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gold Orders Terms */}
                <div className="mt-5 rounded-xl border border-[#d4af37]/30 bg-[#eaf2ec] p-4 sm:mt-6 sm:p-6">
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1b3d31] text-white sm:h-12 sm:w-12">
                      <FaShieldAlt size={20} aria-hidden="true" />
                    </div>

                    <div>
                      <h3 className="mb-1 text-base font-bold text-[#122b22] sm:text-lg">
                        Gold Orders & Customisation Terms
                      </h3>
                      <p className="text-xs leading-relaxed text-[#2a4036] sm:text-sm">
                        Gold rates are locked on the order date, with an 80%
                        advance payment requirement. Customized ring orders are
                        non-returnable and are covered by the standard warranty
                        for manufacturing defects.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-2 text-xs font-medium text-stone-200 sm:text-sm">
                  <span className="flex items-center gap-2">
                    <FaOm className="text-white" aria-hidden="true" />
                    Vedic Pooja
                  </span>

                  <span className="flex items-center gap-2">
                    <FaShieldAlt className="text-white" aria-hidden="true" />
                    Lifetime Authenticity
                  </span>

                  <span className="flex items-center gap-2">
                    <FaCheckCircle className="text-white" aria-hidden="true" />
                    Trusted Certification
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FestivalHero;
