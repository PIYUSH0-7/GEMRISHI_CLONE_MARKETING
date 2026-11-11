"use client";

import { useState } from "react";
import security from "../../assets/DetailPage/security.svg";
import PaymentMethod from "../../assets/DetailPage/PaymentMethod.svg";
import ReturnPolicy from "../../assets/DetailPage/ReturnPolicy.svg";
import ShippingPolicy from "../../assets/DetailPage/ShippingPolicy.svg";
import { useParams } from "react-router-dom";
import { useGemstoneBySlug } from "../../hooks/usesinglegemstone";
import UserReview from "./UserReview";
// -------------Developed By Piyush---------------------
import Certificate from "../../pages/Home/Certificates";

function ProductDescription({
  product: propProduct,
  name: propName,
  sku: propSku,
  slug: propSlug,
}) {
  const {
    name: paramName,
    sku: paramSku,
    slug: paramSlug,
    slugOrId,
  } = useParams();

  const activeName = propName || paramName;
  const activeSku = propSku || paramSku;
  const activeSlug = propSlug || paramSlug || slugOrId;

  const activeIdentifier =
    activeSlug ||
    (activeName && activeSku
      ? `${activeName}/${activeSku}`
      : activeSku || "");

  const { product: fetchedProduct } = useGemstoneBySlug(
    propProduct ? null : activeIdentifier
  );

  const product = propProduct || fetchedProduct;

  const [expanded, setExpanded] = useState(false);

  // ---------------------------------------------------
  // Description
  // ---------------------------------------------------

  const fullText =
    product?.description ||
    (product?.name
      ? `In the enchanting realm of precious gemstones, this authentic ${product.name} stands as a certified masterpiece of natural beauty, astrological purity, and timeless elegance.`
      : "In the enchanting realm of precious gemstones lies a verdant masterpiece of astrological purity and timeless elegance.");

  const maxLength = 450;
  const isLong = fullText.length > maxLength;

  const shortText = isLong
    ? fullText.slice(0, maxLength) + "..."
    : fullText;

  // ---------------------------------------------------
  // Benefits
  // ---------------------------------------------------

  const subCatBenefits =
    product?.subCategory?.benefits || product?.benefits;

  const rawBenefits =
    Array.isArray(subCatBenefits) && subCatBenefits.length > 0
      ? subCatBenefits.map((b) =>
          typeof b === "string"
            ? b
            : b?.title ||
              b?.name ||
              b?.benefit ||
              b?.description ||
              ""
        )
      : [
          "Promoted Good Health",
          "Stability in domestic life",
          "Good for education",
          "Financial Growth",
        ];

  const uniqueBenefits = [...new Set(rawBenefits)].filter(Boolean);

  const benefitItems = uniqueBenefits.slice(0, 4).map((b) => ({
    Product: b,
    Image: security,
  }));

  // ---------------------------------------------------
  // Gemstone Values
  // ---------------------------------------------------

  const gemstoneWeight = product?.weight
    ? `${product.weight} g`
    : product?.carat
    ? `${(product.carat * 0.2).toFixed(2)} g`
    : "N/A";

  const gemstoneCarat = product?.carat
    ? `${product.carat} Carats`
    : product?.ratti
    ? `${(product.ratti * 0.91).toFixed(2)} Carats`
    : "N/A";

  return (
    <>
      {/* =====================================================
          MAIN PRODUCT DESCRIPTION SECTION
      ===================================================== */}

      <div className="w-full h-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">

        {/* =====================================================
            TITLE
        ===================================================== */}

        <div className="w-full flex items-center justify-center py-6 lg:py-8">
          <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-black text-center">
            Product Description
          </h1>
        </div>

        {/* =====================================================
            DESCRIPTION TEXT
        ===================================================== */}

        <div className="w-full py-6 lg:py-0">

          <div className="max-w-full border border-gray-200 rounded-xl bg-green-200 shadow-sm px-5 lg:px-6 py-6 lg:py-8">
            <p className="text-base lg:text-lg text-black  lg:font-medium text-center text-bold">

              {expanded ? fullText : shortText}

              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="
                    text-[#1EA0DC]
                    font-semibold
                    ml-2
                    hover:underline
                    cursor-pointer
                    whitespace-nowrap
                  "
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}

            </p>
          </div>

        </div>

        {/* =====================================================
            GEMSTONE ATTRIBUTES
        ===================================================== */}

        <div className="w-full py-4 lg:py-6">

          {/* ---------------------------------------------------
              DESKTOP TABLE
          --------------------------------------------------- */}

          <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200">

            <table className="w-full border-collapse">

              <tbody>

                {/* Row 1 */}

                <tr className="border-b border-gray-200 bg-green-100">

                  <td className="py-4 px-6 text-[15px] font-semibold text-gray-900 w-1/4">
                    Gemstone
                  </td>

                  <td className="py-4 px-6 text-[15px] text-gray-700 w-1/4">
                    {product?.name || "Natural Gemstone"}
                  </td>

                  <td className="py-4 px-6 text-[15px] font-semibold text-gray-900 w-1/4">
                    Origin
                  </td>

                  <td className="py-4 px-6 text-[15px] text-gray-700 w-1/4">
                    {product?.origin || "Certified Origin"}
                  </td>

                </tr>

                {/* Row 2 */}

                <tr className="border-b border-gray-200 bg-green-200">

                  <td className="py-4 px-6 text-[15px] font-semibold text-gray-900">
                    Weight (grams)
                  </td>

                  <td className="py-4 px-6 text-[15px] text-gray-700">
                    {gemstoneWeight}
                  </td>

                  <td className="py-4 px-6 text-[15px] font-semibold text-gray-900">
                    Carat
                  </td>

                  <td className="py-4 px-6 text-[15px] text-gray-700">
                    {gemstoneCarat}
                  </td>

                </tr>

                {/* Row 3 */}

                <tr className="border-b border-gray-200 bg-green-100">

                  <td className="py-4 px-6 text-[15px] font-semibold text-gray-900">
                    Treatment
                  </td>

                  <td className="py-4 px-6 text-[15px] text-gray-700">
                    {product?.treatment || "Natural / Unheated"}
                  </td>

                  <td className="py-4 px-6 text-[15px] font-semibold text-gray-900">
                    Cut
                  </td>

                  <td className="py-4 px-6 text-[15px] text-gray-700">
                    {product?.cut || "Faceted"}
                  </td>

                </tr>

                {/* Row 4 */}

                <tr className="bg-green-200">

                  <td className="py-4 px-6 text-[15px] font-semibold text-gray-900">
                    Shape
                  </td>

                  <td className="py-4 px-6 text-[15px] text-gray-700">
                    {product?.shape || "Oval"}
                  </td>

                  <td className="py-4 px-6 text-[15px] font-semibold text-gray-900">
                    Colour
                  </td>

                  <td className="py-4 px-6 text-[15px] text-gray-700">
                    {product?.color ||
                      product?.colour ||
                      "Natural Vivid"}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>
  {/* =====================================================
            BENEFITS SECTION
  ===================================================== */}

       <div className="w-full py-5 lg:py-5 lg:mt-15">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-4">
    {benefitItems.map((item, index) => (
      <div
        key={item.Product + index}
        className="
          group relative
          w-full
          min-h-[96px]
          flex items-center
          gap-4
          px-5 lg:px-6
          py-5
          rounded-2xl
          border border-[#96faac]
          shadow-2xl
          bg-gradient-to-br from-white via-green-200 to-white
          overflow-hidden
          transition-all duration-500 ease-out
          hover:-translate-y-1
          hover:border-green-900
          hover:shadow-[0_12px_35px_rgba(93,72,35,0.10)]
        "
      >
        {/* Subtle luxury shine */}
        <div
          className="
            absolute inset-0
            opacity-0
            group-hover:opacity-100
            transition-opacity duration-500
            bg-gradient-to-r
            from-transparent
            via-[#C9A96E]/[0.04]
            to-transparent
            pointer-events-none
          "
        />

        {/* Icon Container */}
        <div
          className="
            relative z-10
            flex-shrink-0
            w-12 h-12
            lg:w-14 lg:h-14
            flex items-center justify-center
            rounded-full
            border border-green-200
            bg-white
            shadow-[inset_0_0_0_4px_rgba(201,169,110,0.06)]
            transition-all duration-500
            group-hover:border-green-900
            group-hover:bg-green-100
            group-hover:scale-105
          "
        >
          <img
            src={item.Image || "/placeholder.svg"}
            alt={item.Product}
            className="
              w-6 h-6
              lg:w-7 lg:h-7
              object-contain
              transition-transform duration-500
              group-hover:scale-110
            "
          />
        </div>

        {/* Benefit Content */}
        <div className="relative z-10 flex-1">
          <p
            className="
              text-[13px]
              lg:text-[15px]
              font-medium
              tracking-[0.01em]
              text-[#29251F]
              leading-6
              text-left
              transition-colors duration-300
              group-hover:text-green-950
            "
          >
            {item.Product}
          </p>

          {/* Gold underline */}
          <div
            className="
              mt-1.5
              w-7 h-[1px]
              bg-green-900
              opacity-60
              transition-all duration-500
              group-hover:w-12
              group-hover:opacity-100
            "
          />
        </div>

        {/* Right Arrow */}
        <div
          className="
            relative z-10
            flex-shrink-0
            text-green-900
            opacity-40
            translate-x-0
            transition-all duration-500
            group-hover:opacity-100
            group-hover:translate-x-1
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </div>
      </div>
    ))}
  </div>
</div>

          {/* ---------------------------------------------------
              MOBILE ATTRIBUTE CARD
          --------------------------------------------------- */}

          <div className="block lg:hidden">

            <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">

              {[
                [
                  "Gemstone",
                  product?.name || "Natural Gemstone",
                ],
                [
                  "Origin",
                  product?.origin || "Certified Origin",
                ],
                ["Weight (grams)", gemstoneWeight],
                ["Carat", gemstoneCarat],
                [
                  "Treatment",
                  product?.treatment || "Natural / Unheated",
                ],
                [
                  "Cut",
                  product?.cut || "Faceted",
                ],
                [
                  "Shape",
                  product?.shape || "Oval",
                ],
                [
                  "Colour",
                  product?.color ||
                    product?.colour ||
                    "Natural Vivid",
                ],
              ].map(([label, value], index, arr) => (
                <div
                  key={label}
                  className={`
                    flex
                    justify-between
                    items-start
                    gap-4
                    px-4
                    py-3.5
                    text-sm
                    ${
                      index !== arr.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }
                  `}
                >
                  <p className="font-semibold text-gray-900 flex-shrink-0">
                    {label}
                  </p>

                  <p className="text-gray-600 text-right break-words">
                    {value}
                  </p>
                </div>
              ))}

            </div>

          </div>

        </div>

        {/* =====================================================
            CERTIFICATE
        ===================================================== */}

        <div className="w-full py-4 lg:py-6">
          <Certificate />
        </div>

        {/* =====================================================
            THINGS TO KNOW BEFORE PURCHASE
        ===================================================== */}

        <div className="w-full h-auto py-6 lg:py-8">

          {/* Heading */}

          <div className="w-full flex justify-center mb-7 lg:mb-10">

            <h1 className="text-xl sm:text-2xl lg:text-[24px] font-semibold text-center text-gray-900">
              Things you want to know before purchase
            </h1>

          </div>

          {/* Cards */}

          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

            {/* =================================================
                SHIPPING POLICY
            ================================================= */}

            <div
              className="
                w-full
                min-h-[300px]
                shadow-md
                border
                border-gray-100
                rounded-xl
                flex
                flex-col
                items-center
                justify-center
                px-5
                py-7
                bg-white
              "
            >

              <div className="flex flex-col items-center justify-center mb-5">

                <img
                  src={ShippingPolicy || "/placeholder.svg"}
                  alt="Shipping Policy"
                  className="w-14 h-14 lg:w-[65px] lg:h-[65px] object-contain"
                />

                <h1 className="text-[15px] font-bold text-[#596CB2] pt-3">
                  Shipping Policy
                </h1>

              </div>

              <div className="w-full max-w-[300px]">

                <p className="text-[13px] text-gray-700 text-center mb-3">
                  Worldwide Shipping is available
                </p>

                <ul className="list-disc pl-5 space-y-2">

                  <li className="text-[13px] text-gray-700">
                    Free shipping on orders over INR 5,000 in India.
                  </li>

                  <li className="text-[13px] text-gray-700">
                    COD is available for orders over INR 5,000 in India.
                  </li>

                  <li className="text-[13px] text-gray-700">
                    International Express Shipping takes 4-7 days
                    for delivery.
                  </li>

                </ul>

              </div>

            </div>

            {/* =================================================
                RETURN POLICY
            ================================================= */}

            <div
              className="
                w-full
                min-h-[300px]
                shadow-md
                border
                border-gray-100
                rounded-xl
                flex
                flex-col
                items-center
                justify-center
                px-5
                py-7
                bg-white
              "
            >

              <div className="flex flex-col items-center justify-center mb-5">

                <img
                  src={ReturnPolicy || "/placeholder.svg"}
                  alt="Return Policy"
                  className="w-14 h-14 lg:w-[65px] lg:h-[65px] object-contain"
                />

                <h1 className="text-[15px] font-bold text-[#BA5959] pt-3">
                  Return Policy
                </h1>

              </div>

              <div className="w-full max-w-[300px]">

                <ul className="list-disc pl-5 space-y-2">

                  <li className="text-[13px] text-gray-700">
                    Get 100% moneyback on returning loose gemstones
                    within 10 days for a full refund of the gemstone
                    price.
                  </li>

                  <li className="text-[13px] text-gray-700">
                    Return shipment is at customer's cost.
                  </li>

                  <li className="text-[13px] text-gray-700">
                    Shipping/Charges, GST/VAT and duties are not
                    refundable.
                  </li>

                </ul>

              </div>

            </div>

            {/* =================================================
                PAYMENT METHOD
            ================================================= */}

            <div
              className="
                w-full
                min-h-[300px]
                shadow-md
                border
                border-gray-100
                rounded-xl
                flex
                flex-col
                items-center
                justify-center
                px-5
                py-7
                bg-white
              "
            >

              <div className="flex flex-col items-center justify-center mb-5">

                <img
                  src={PaymentMethod || "/placeholder.svg"}
                  alt="Payment Method"
                  className="w-14 h-14 lg:w-[65px] lg:h-[65px] object-contain"
                />

                <h1 className="text-[15px] font-bold text-[#509E86] pt-3">
                  Payment Method
                </h1>

              </div>

              <div className="w-full max-w-[300px]">

                <ul className="list-disc pl-5 space-y-2">

                  <li className="text-[13px] text-gray-700">
                    Credit Cards: All Visa, MasterCard and American
                    Express Credit Cards are accepted.
                  </li>

                  <li className="text-[13px] text-gray-700">
                    Debit Cards (India): All Visa and Maestro debit
                    Cards are accepted.
                  </li>

                  <li className="text-[13px] text-gray-700">
                    Paypal, Net Banking, Cash Cards.
                  </li>

                </ul>

              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default ProductDescription;