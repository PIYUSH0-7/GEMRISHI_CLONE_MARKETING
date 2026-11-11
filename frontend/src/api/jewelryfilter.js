import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Fetch jewelries filtered by type, subcategory, metal, and advanced fields.
 * @param {Object} params - Filter parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Limit per page
 * @param {string} [params.jewelryType] - Jewelry type (e.g., "Ring")
 * @param {string} [params.productSubCategory] - Product subcategory ID (Mongo ID)
 * @param {string} [params.subCategory] - Jewelry subcategory ID (Mongo ID)
 * @param {string} [params.metal] - Metal type (e.g., "Gold")
 * @param {string} [params.gender] - Gender (e.g., "Men", "Women")
 * @param {string} [params.minCarat]
 * @param {string} [params.maxCarat]
 * @param {string} [params.minRatti]
 * @param {string} [params.maxRatti]
 * @param {string} [params.certificateType]
 * @param {string} [params.minPrice]
 * @param {string} [params.maxPrice]
 * @param {string} [params.gemstoneShape]
 * @param {string} [params.origin]
 * @param {string} [params.color]
 * @param {string} [params.cut]
 * @param {string} [params.shape]
 * @param {string} [params.treatment]
 * @param {string} [params.featured]
 * @param {string} [params.sort]
 * @returns {Promise<Object>} - Response data from API
 */
export const getJewelryByFilter = async ({
  page = 1,
  limit = 10,
  jewelryType,
  productSubCategory,
  subCategory,
  metal,
  gender,
  minCarat,
  maxCarat,
  minRatti,
  maxRatti,
  certificateType,
  minPrice,
  maxPrice,
  gemstoneShape,
  origin,
  color,
  cut,
  shape,
  treatment,
  featured,
  sort,
}) => {
  try {
    const params = { page, limit };
    if (jewelryType) params.jewelryType = jewelryType;
    if (productSubCategory) params.productSubCategory = productSubCategory;
    if (subCategory) params.subCategory = subCategory;
    if (metal) params.metal = metal;
    if (gender) params.gender = gender;
    if (minCarat) params.minCarat = minCarat;
    if (maxCarat) params.maxCarat = maxCarat;
    if (minRatti) params.minRatti = minRatti;
    if (maxRatti) params.maxRatti = maxRatti;
    if (certificateType) params.certificateType = certificateType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (gemstoneShape) params.gemstoneShape = gemstoneShape;
    if (origin) params.origin = origin;
    if (color) params.color = color;
    if (cut) params.cut = cut;
    if (shape) params.shape = shape;
    if (treatment) params.treatment = treatment;
    if (featured) params.featured = featured;
    if (sort) params.sort = sort;

    const response = await axios.get(`${API_URL}/jewelry/jewelry-by-filter`, {
      params,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching jewelry by filter:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
