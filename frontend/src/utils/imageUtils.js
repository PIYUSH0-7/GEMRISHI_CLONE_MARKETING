/**
 * Utility functions for handling images
 */

const normalizeImageValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.url && typeof value.url === "string") return value.url;
    if (value.fileName && typeof value.fileName === "string") return value.fileName;
  }
  return "";
};

const getBackendOrigin = () => {
  try {
    const rawUrl = import.meta.env.VITE_URL || "";
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return new URL(rawUrl).origin;
    }
  } catch {}
  return "http://localhost:7788";
};

export const fixImageUrl = (url) => {
  let normalizedUrl = normalizeImageValue(url);
  if (!normalizedUrl) return "";

  const backendOrigin = getBackendOrigin();

  // If already absolute http/https
  if (normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://")) {
    return normalizedUrl;
  }

  // If subcategory upload
  if (normalizedUrl.includes("subCategoryImg-")) {
    const filename = normalizedUrl.split("/").pop();
    return `${backendOrigin}/uploads/${filename}`;
  }

  // If it's a standalone filename (e.g. product-asset-xxx.png)
  if (!normalizedUrl.includes("/") && normalizedUrl.match(/\.(png|jpe?g|webp|svg|gif)$/i)) {
    return `${backendOrigin}/public/uploads/product/${normalizedUrl}`;
  }

  // Ensure leading slash
  const cleanPath = normalizedUrl.startsWith("/") ? normalizedUrl : `/${normalizedUrl}`;

  // Prepend backend origin for uploads
  if (
    cleanPath.startsWith("/public/uploads") ||
    cleanPath.startsWith("/uploads") ||
    cleanPath.startsWith("/api/v1/uploads")
  ) {
    return `${backendOrigin}${cleanPath}`;
  }

  return `${backendOrigin}${cleanPath}`;
};

/**
 * Universal product image extractor
 * Safely extracts the best image URL from any Product or Jewelry object
 */
export const getProductImage = (item, fallback = "") => {
  if (!item) return fallback;

  // 1. Array of images: check first element
  if (Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];
    if (typeof first === "string" && first.trim()) {
      return fixImageUrl(first);
    }
    if (first && typeof first === "object") {
      if (first.url) return fixImageUrl(first.url);
      if (first.fileName) return fixImageUrl(first.fileName);
    }
  }

  // 2. Direct image property
  if (item.image) {
    if (typeof item.image === "string" && item.image.trim()) {
      return fixImageUrl(item.image);
    }
    if (typeof item.image === "object") {
      if (item.image.url) return fixImageUrl(item.image.url);
      if (item.image.fileName) return fixImageUrl(item.image.fileName);
    }
  }

  // 3. Alternative img property
  if (item.img) {
    if (typeof item.img === "string") return fixImageUrl(item.img);
    if (item.img?.url) return fixImageUrl(item.img.url);
  }

  return fallback;
};

const shouldFixUrl = (key) => {
  if (!key || typeof key !== "string") return false;
  const normalized = key.toLowerCase();
  return (
    normalized === "url" ||
    normalized === "image" ||
    normalized === "images" ||
    normalized.endsWith("image") ||
    normalized.endsWith("images") ||
    normalized === "thumbnail" ||
    normalized.endsWith("thumbnail")
  );
};

export const fixImageUrlsInData = (data, key = "") => {
  if (typeof data === "string") {
    return shouldFixUrl(key) ? fixImageUrl(data) : data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => fixImageUrlsInData(item, key));
  }
  if (data && typeof data === "object") {
    const fixed = {};
    for (const prop in data) {
      fixed[prop] = fixImageUrlsInData(data[prop], prop);
    }
    return fixed;
  }
  return data;
};
