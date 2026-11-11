import HeaderDetailPage from "../components/HeaderDetailPage";
import { FaCheckCircle, FaTruck, FaUndo, FaCreditCard } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimilarProducts from "../components/similarProducts";
import UserTestimonals from "../components/UserTestimonals";
import { useSingleJewelry } from "../hooks/useSingleJewelery";
import TrustBadges from "../components/trust";
import { Helmet } from "react-helmet-async";
import { getProductUrl } from "../utils/productUrl";
import ProductSEO from "../components/SEO/ProductSEO";

const ProductDetails = ({ product: propProduct, name: propName, sku: propSku, slug: propSlug, slugOrId: propSlugOrId }) => {
  const { name: paramName, sku: paramSku, slug: paramSlug, slugOrId: paramSlugOrId } = useParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const activeName = propName || paramName;
  const activeSku = propSku || paramSku;
  const activeIdentifier = activeSku || propSlug || paramSlug || propSlugOrId || paramSlugOrId || (activeName && activeSku ? `${activeName}/${activeSku}` : "");

  const {
    data: fetchedProduct,
    metalRates,
    loading: hookLoading,
    error: hookError,
  } = useSingleJewelry(activeIdentifier || propProduct?.slug || propProduct?.sku);

  const product = propProduct || fetchedProduct;
  const loading = !product && hookLoading;
  const error = !product ? hookError : null;

  // Canonical URL sync to /products/:name/:sku
  useEffect(() => {
    if (product) {
      const canonicalUrl = getProductUrl(product);
      if (canonicalUrl && window.location.pathname !== canonicalUrl) {
        navigate(canonicalUrl, { replace: true });
      }
    }
  }, [product, navigate]);


  // GA4 view_item tracking
  useEffect(() => {

  if (!product) return;

  window.dataLayer = window.dataLayer || [];

  // clear previous ecommerce object
  window.dataLayer.push({
    ecommerce: null
  });

  window.dataLayer.push({
    event: "view_item",
    ecommerce: {
      currency: "INR",
      value: product.jewelryPrice || product.price || 0,

      items: [
        {
          item_id: product.sku || product._id,
          item_name: product.jewelryName,
          item_brand: "GemRishi",
          item_category: product.jewelryType || "Jewelry",
          item_variant: product.metal || "",
          price: product.jewelryPrice || product.price || 0,
          quantity: 1
        }
      ]
    }
  });

  console.log("GA4 jewelry view_item fired");

  }, [product]);
  
  if (loading) return <p className="text-center mt-10">Loading product...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!product) return <p className="text-center mt-10">Product not found</p>;

  const text = product?.jewelryDesc;

  return (
    <div className="">
      <ProductSEO product={product} itemType="Jewelry" />
      {/* Header Section */}
      <HeaderDetailPage product={product} metalRates={metalRates} />

      {/* Product Description */}
      <div className="mx-auto px-6 sm:px-10 lg:px-28">
        <h2 className="text-[22px] sm:text-[24px] text-center mb-8 font-semibold">
          Product Description
        </h2>

        {/* Highlights */}
        <div className="w-full flex flex-col py-4 lg:py-8">
          <div
            className="
            grid grid-cols-2 lg:flex lg:flex-wrap
            gap-4 lg:gap-0 mt-4 lg:mt-0
            w-full justify-center lg:justify-start
        "
          >
            {[
              "Promoted Good Health",
              "Stability in domestic life",
              "Good for education",
              "Financial Growth",
            ].map((item, index) => (
              <div
                key={index}
                className={`
                    lg:w-[25%] w-full flex flex-row items-center
                    justify-start lg:justify-start gap-2 sm:gap-3
                    ${index === 0 ? "" : "lg:pl-20"}
                `}
              >
                <FaCheckCircle className="text-green-600 text-sm sm:text-base lg:text-lg flex-shrink-0" />
                <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 text-left">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Description Text */}
        <p className="text-gray-700 text-[15px] sm:text-[17px] leading-relaxed mb-6 text-justify">
          {expanded ? text : `${text?.slice(0, 300) || ""}... `}
          <span
            className="text-blue-600 cursor-pointer font-medium"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "See less" : "See more"}
          </span>
        </p>

        {/* Product Info Grid */}
        {/* 💻 Desktop / Tablet View */}
        <div className="hidden lg:block w-full overflow-x-auto py-8">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-sm lg:text-[18px] font-semibold text-gray-900">
                  Jewelry Name
                </td>
                <td className="py-3 px-4 text-sm lg:text-[18px] text-gray-600">
                  {product.jewelryName}
                </td>
                <td className="py-3 px-4 text-sm lg:text-[18px] font-semibold text-gray-900">
                  Diamond Substitute
                </td>
                <td className="py-3 px-4 text-sm lg:text-[18px] text-gray-600">
                  {product?.isDiamondSubstitute ? "Yes" : "No"}
                </td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-sm lg:text-[18px] font-semibold text-gray-900">
                  Jewelry Type
                </td>
                <td className="py-3 px-4 text-sm lg:text-[18px] text-gray-600">
                  {product.jewelryType}
                </td>
                <td className="py-3 px-4 text-sm lg:text-[18px] font-semibold text-gray-900">
                  Availability
                </td>
                <td className="py-3 px-4 text-sm lg:text-[18px] text-gray-600">
                  {product?.isAvailable ? "Available" : "Out of Stock"}
                </td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-sm lg:text-[18px] font-semibold text-gray-900">
                  Metal
                </td>
                <td className="py-3 px-4 text-sm lg:text-[18px] text-gray-600">
                  {product.metal}
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 text-sm lg:text-[18px] font-semibold text-gray-900">
                  Weight (grams)
                </td>
                <td className="py-3 px-4 text-sm lg:text-[18px] text-gray-600">
                  {product.jewelryMetalWeight}
                </td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 📱 Mobile View */}
        <div className="block lg:hidden">
          <div className="border border-gray-300 rounded-lg p-4 space-y-3">
            {[
              ["Jewelry Name", product.jewelryName],
              ["Jewelry Type", product.jewelryType],
              ["Metal", product.metal],
              ["Weight (grams)", product.jewelryMetalWeight],
              [
                "Diamond Substitute",
                product?.isDiamondSubstitute ? "Yes" : "No",
              ],
              [
                "Availability",
                product?.isAvailable ? "Available" : "Out of Stock",
              ],
            ].map(([label, value], i, arr) => (
              <div
                key={i}
                className={`flex justify-between items-center py-2 text-sm sm:text-base ${i !== arr.length - 1 ? "border-b border-gray-300" : ""
                  }`}
              >
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-gray-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Policies Section */}
      <div className="w-full py-10 sm:py-12 px-6 sm:px-10 lg:px-20">
        <h2 className="text-[22px] sm:text-[24px] font-semibold text-center mb-10">
          Things you want to know before purchase
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Shipping Policy */}
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg hover:scale-[1.02] transition-transform">
            <FaTruck className="text-blue-600 mb-4" size={40} />
            <h3 className="text-lg font-bold text-blue-700 mb-3">
              Shipping Policy
            </h3>
            <ul className="text-gray-600 text-sm text-left list-disc pl-5 space-y-1">
              <li>Free shipping on orders over INR 5,000 in India.</li>
              <li>COD available for orders over INR 5,000 in India.</li>
              <li>International Express Shipping: 4–7 days.</li>
            </ul>
            <p className="mt-4 text-blue-700 font-semibold cursor-pointer">
              Know more
            </p>
          </div>

          {/* Return Policy */}
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg hover:scale-[1.02] transition-transform">
            <FaUndo className="text-red-600 mb-4" size={40} />
            <h3 className="text-lg font-bold text-red-700 mb-3">
              Return Policy
            </h3>
            <ul className="text-gray-600 text-sm text-left list-disc pl-5 space-y-1">
              <li>100% moneyback within 10 days (loose gemstones).</li>
              <li>Return shipment at customer’s cost.</li>
              <li>Shipping, GST/VAT & duties are non-refundable.</li>
            </ul>
            <p className="mt-4 text-red-700 font-semibold cursor-pointer">
              Know more
            </p>
          </div>

          {/* Payment Method */}
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg hover:scale-[1.02] transition-transform">
            <FaCreditCard className="text-green-600 mb-4" size={40} />
            <h3 className="text-lg font-bold text-green-700 mb-3">
              Payment Method
            </h3>
            <ul className="text-gray-600 text-sm text-left list-disc pl-5 space-y-1">
              <li>Credit Cards: Visa, MasterCard, Amex.</li>
              <li>Debit Cards (India): Visa & Maestro.</li>
              <li>PayPal, Net Banking, Cash Cards.</li>
            </ul>
            <p className="mt-4 text-green-700 font-semibold cursor-pointer">
              Know more
            </p>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      <SimilarProducts jewelryId={product._id} />

      {/* Testimonials */}
      {/* <div className="mt-10 px-4 sm:px-8">
                <UserTestimonals />
            </div> */}
    </div>
  );
};

export default ProductDetails;
