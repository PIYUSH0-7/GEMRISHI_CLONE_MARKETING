import { useState, useEffect } from "react";
import { getAllGemstones } from "../api/getAllGemstones";

/**
 * Custom hook to fetch gemstones with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of items per page
 * @param {number} params.page - Current page
 * @param {string} [params.color] - Optional gemstone color filter
 */
export const useGemstones = ({ limit = 20, page = 1, color } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAllGemstones({ limit, page, color });
        console.log("Fetched gemstones:", result);
        setData(result);
      } catch (err) {
        console.error(
          "Error fetching gemstones:",
          err.message || "Something went wrong",
        );
        setError(err.message || "Failed to fetch gemstones");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit, page, color]);

  return { data, loading, error };
};
