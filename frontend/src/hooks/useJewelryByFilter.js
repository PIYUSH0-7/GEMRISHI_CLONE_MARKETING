import { useState, useEffect } from "react";
import { getJewelryByFilter } from "../api/jewelryfilter";

/**
 * Custom hook to fetch jewelry by filter options.
 * @param {Object} filters - Filter options for API.
 * @param {string} [filters.jewelryType] - Type of jewelry (e.g., "Ring").
 * @param {string} [filters.jewelryType] - Type of jewelry (e.g., "Ring").
 * @param {string} [filters.productSubCategory] - Product subcategory ID (Mongo ID).
 * @param {string} [filters.subCategory] - Jewelry subcategory ID (Mongo ID).
 * @param {string} [filters.metal] - Metal type (e.g., "Gold").
 * @param {string} [filters.gender] - Gender (e.g., "Men", "Women").
 * @param {string} [filters.minCarat]
 * @param {string} [filters.maxCarat]
 * @param {string} [filters.minRatti]
 * @param {string} [filters.maxRatti]
 * @param {string} [filters.certificateType]
 * @param {string} [filters.minPrice]
 * @param {string} [filters.maxPrice]
 * @param {string} [filters.gemstoneShape]
 * @param {string} [filters.origin]
 * @param {string} [filters.color]
 * @param {string} [filters.cut]
 * @param {string} [filters.shape]
 * @param {string} [filters.treatment]
 * @param {string} [filters.featured]
 * @param {string} [filters.sort]
 * @param {number} [filters.page=1] - Page number.
 * @param {number} [filters.limit=10] - Items per page.
 */
export const useJewelryByFilter = (filters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
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
    skip = false,
  } = filters;

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getJewelryByFilter({
          page,
          limit,
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
        });
        if (isMounted) setData(res);
      } catch (err) {
        if (isMounted)
          setError(
            err.response?.data?.msg ||
            err.response?.data?.message ||
            "Failed to fetch jewelry data.",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!skip) {
      fetchData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [
    page,
    limit,
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
    skip,
  ]);

  return { data, loading, error };
};
