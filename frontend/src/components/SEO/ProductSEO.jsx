import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * ProductSEO Component
 * Generates dynamic SEO meta tags, OpenGraph tags, canonical links,
 * and Schema.org JSON-LD (Product + BreadcrumbList) for Gemstones & Jewelry.
 */
export default function ProductSEO({ product, itemType = "Gemstone", canonicalUrl }) {
  if (!product) return null;

  const baseUrl = "https://gemrishi.com";

  // Identify product fields whether Gemstone or Jewelry
  const isJewelry = itemType === "Jewelry" || Boolean(product.jewelryName);
  const name = isJewelry ? product.jewelryName : product.name;
  const sku = product.sku || "";
  const price = isJewelry ? (product.jewelryPrice || product.price) : product.price;
  const description = isJewelry ? (product.jewelryDesc || product.description) : product.description;

  // Gemstone-specific attributes
  const carat = product.carat ? `${product.carat} Carat` : "";
  const ratti = product.ratti ? `(${product.ratti} Ratti)` : "";
  const origin = product.origin ? `${product.origin}` : "";
  const shape = product.shape || "";
  const treatment = product.treatment || "Natural & Certified";
  const weightStr = [carat, ratti].filter(Boolean).join(" ");

  // Formulate high-intent, click-worthy SEO Title (max 60-70 chars optimal)
  let seoTitle = "";
  if (isJewelry) {
    const metal = product.metal ? `in ${product.metal}` : "";
    seoTitle = `${name} ${metal} - Certified Fine Jewellery | GemRishi`.trim();
  } else {
    const originPrefix = origin ? `${origin} ` : "";
    const weightPrefix = weightStr ? `${weightStr} ` : "";
    seoTitle = `${weightPrefix}Natural ${originPrefix}${name} - 100% Certified Gemstone | GemRishi`.trim();
  }

  // Formulate rich, compelling Meta Description (140-160 chars)
  let seoDescription = "";
  if (isJewelry) {
    seoDescription = `Buy certified ${name} online from GemRishi. Handcrafted luxury jewellery with hallmarked authenticity, secure payment and insured worldwide delivery.`;
  } else {
    const details = [
      origin ? `Origin: ${origin}` : null,
      carat ? `Weight: ${carat}` : null,
      treatment ? `Treatment: ${treatment}` : null,
      shape ? `Shape: ${shape}` : null,
    ].filter(Boolean).join(", ");

    seoDescription = `Buy 100% natural, lab-certified ${origin} ${name} at GemRishi. ${details}. Astro-energized with authentic laboratory certificate & fast shipping.`;
  }

  // Fallback to product description if short
  if (description && description.length > 50 && description.length < 160) {
    seoDescription = description;
  }

  // Image Extraction
  let imageUrl = `${baseUrl}/logo.jpg`;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    imageUrl = typeof firstImg === "string" ? firstImg : (firstImg.url || firstImg.fileName || imageUrl);
  } else if (product.image) {
    imageUrl = typeof product.image === "string" ? product.image : (product.image.url || imageUrl);
  }

  // Canonical URL construction
  const resolvedCanonical = canonicalUrl 
    ? (canonicalUrl.startsWith("http") ? canonicalUrl : `${baseUrl}${canonicalUrl}`)
    : (typeof window !== "undefined" ? `${baseUrl}${window.location.pathname}` : `${baseUrl}/products/${encodeURIComponent(sku)}`);

  // Schema.org: Product JSON-LD
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: seoTitle,
    description: seoDescription,
    sku: sku || undefined,
    mpn: sku || undefined,
    image: imageUrl ? [imageUrl] : undefined,
    brand: {
      "@type": "Brand",
      name: "GemRishi",
    },
    category: isJewelry ? "Jewelry" : "Certified Gemstones",
    offers: {
      "@type": "Offer",
      url: resolvedCanonical,
      priceCurrency: "INR",
      price: price ? String(price) : "0",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2027-12-31",
      seller: {
        "@type": "Organization",
        name: "GemRishi",
        url: baseUrl,
      },
    },
    additionalProperty: [
      origin ? { "@type": "PropertyValue", name: "Origin", value: origin } : null,
      carat ? { "@type": "PropertyValue", name: "Carat Weight", value: String(product.carat) } : null,
      product.ratti ? { "@type": "PropertyValue", name: "Ratti Weight", value: String(product.ratti) } : null,
      shape ? { "@type": "PropertyValue", name: "Shape / Cut", value: shape } : null,
      treatment ? { "@type": "PropertyValue", name: "Treatment", value: treatment } : null,
      product.color ? { "@type": "PropertyValue", name: "Color", value: product.color } : null,
    ].filter(Boolean),
  };

  // Schema.org: BreadcrumbList JSON-LD
  const parentCategoryUrl = isJewelry ? `${baseUrl}/jewellery` : `${baseUrl}/gemstone`;
  const parentCategoryName = isJewelry ? "Jewellery" : "Gemstones";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: parentCategoryName,
        item: parentCategoryUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: name || "Product Details",
        item: resolvedCanonical,
      },
    ],
  };

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={resolvedCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="GemRishi" />
      {price && <meta property="product:price:amount" content={String(price)} />}
      {price && <meta property="product:price:currency" content="INR" />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Google Schema.org JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
}
