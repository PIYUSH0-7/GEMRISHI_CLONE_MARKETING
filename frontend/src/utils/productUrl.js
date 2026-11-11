/**
 * Frontend Product URL & Slug Helpers
 */

export const createCleanSlug = (name) => {
  if (!name) return "";
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accent marks
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\./g, "-")            // convert decimals to hyphens (e.g. 6.05 -> 6-05)
    .replace(/[^a-z0-9\s-]/g, "-")  // remove special chars
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const cleanSku = (sku) => {
  if (!sku) return "";
  return String(sku)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

/**
 * Returns canonical product path: /products/:name/:sku
 */
export const getProductUrl = (item) => {
  if (!item) return "/products";
  const name = item.name || item.jewelryName || item.productName || "product";
  const sku = item.sku || item._id;
  const cName = createCleanSlug(name);
  const cSku = cleanSku(sku);
  return cSku ? `/products/${cName}/${cSku}` : `/products/${cName}`;
};

/**
 * Returns combined slug: name-sku
 */
export const getProductSlug = (item) => {
  if (!item) return "";
  const name = item.name || item.jewelryName || item.productName || "product";
  const sku = item.sku || item._id;
  const cName = createCleanSlug(name);
  const cSku = cleanSku(sku);
  return cSku ? `${cName}-${cSku}` : cName;
};

/**
 * Sanitizes and returns the current site base URL (e.g. https://gemrishi.com).
 * Safely handles comma-separated environment variables, IP addresses, and trailing slashes.
 */
export const getCleanBaseUrl = () => {
  let base = "";
  if (typeof window !== "undefined" && window.location?.origin) {
    base = window.location.origin;
  } else if (typeof import.meta !== "undefined" && import.meta.env?.VITE_FRONTEND_URL) {
    base = import.meta.env.VITE_FRONTEND_URL;
  } else {
    base = "https://gemrishi.com";
  }

  // Handle case where env or origin has comma-separated strings (e.g. "https://gemrishi.com,https//187.127.185.93")
  let clean = String(base).split(",")[0].trim();

  // Strip trailing slashes to prevent double slashes like //products
  clean = clean.replace(/\/+$/, "");

  // Fallback to https://gemrishi.com if not starting with http:// or https://
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://gemrishi.com";
  }

  return clean;
};

/**
 * Returns full canonical absolute URL for a product:
 * e.g. https://gemrishi.com/products/the-verdant-imperial-rail/gre18-01
 */
export const getAbsoluteProductUrl = (item) => {
  const base = getCleanBaseUrl();
  const path = getProductUrl(item);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};
