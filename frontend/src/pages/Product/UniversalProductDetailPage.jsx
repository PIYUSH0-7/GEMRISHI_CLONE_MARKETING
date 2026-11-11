import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DetailPage from "../DetailPage/DetailPage";
import ProductDetails from "../ProductDetails";
import { getProductUrl } from "../../utils/productUrl";
import NotFound from "../StaticPages/NotFound";

const UniversalProductDetailPage = () => {
  const { name, sku, slug, slugOrId, id } = useParams();
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_URL;

  const [itemData, setItemData] = useState(null);
  const [itemType, setItemType] = useState("Gemstone"); // 'Gemstone' or 'Jewelry'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeIdentifier = (
    name && sku ? `${name}/${sku}` : (sku || slug || slugOrId || id || "")
  ).trim();

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!activeIdentifier) {
        setLoading(false);
        setError("No product identifier provided.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiEndpoint = name && sku
          ? `${URL}/product/single-product/${encodeURIComponent(name)}/${encodeURIComponent(sku)}`
          : `${URL}/product/single-product/${encodeURIComponent(activeIdentifier)}`;

        const res = await axios.get(apiEndpoint);
        const fetchedProduct = res.data.product || res.data.jewelry || res.data.data;

        if (!isMounted) return;

        if (fetchedProduct) {
          const type = res.data.itemType || (fetchedProduct.jewelryName ? "Jewelry" : "Gemstone");
          setItemData(fetchedProduct);
          setItemType(type);

          // 301 Canonical URL Redirection Check
          const canonicalUrl = res.data.canonicalUrl || getProductUrl(fetchedProduct);
          if (canonicalUrl && window.location.pathname !== canonicalUrl) {
            navigate(canonicalUrl, { replace: true });
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching product:", err);
        setError(err.response?.data?.msg || "Product not found");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [name, sku, slug, slugOrId, id, activeIdentifier, URL, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#077B8A] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !itemData) {
    return (
      <NotFound
        isProductNotFound={true}
        customTitle="Product or Gemstone Not Found"
        customMessage={
          error ||
          "We couldn't find the product or gemstone you are looking for. It may have been sold out, moved, or updated."
        }
      />
    );
  }
  // ===== change by pawan for slug fix : start =====
  if (itemType === "Jewelry") {
    return <ProductDetails product={itemData} name={name} sku={sku} slug={slug} slugOrId={slugOrId} />;
  }
  // ===== change by pawan for slug fix : end =====

  return <DetailPage name={name} sku={sku} slug={slug} />;
};

export default UniversalProductDetailPage;