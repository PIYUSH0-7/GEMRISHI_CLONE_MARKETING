/**
 * Centralized Slug & URL Generation Utility for GemRishi
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
 * Returns canonical product path in format: /products/name/sku
 */
export const getCanonicalProductPath = (name, sku = "") => {
  const cName = createCleanSlug(name);
  const cSku = cleanSku(sku);
  return cSku ? `/products/${cName}/${cSku}` : `/products/${cName}`;
};

/**
 * Returns canonical single-string slug: name-sku
 */
export const getCanonicalSlug = (name, sku = "") => {
  const cName = createCleanSlug(name);
  const cSku = cleanSku(sku);
  return cSku ? `${cName}-${cSku}` : cName;
};