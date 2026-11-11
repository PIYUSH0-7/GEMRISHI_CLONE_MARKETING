import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of items per page
 * @param {number} params.page - Current page
 * @param {string} [params.color] - Optional gemstone color filter
 * @returns {Promise<Object>} - API response with gemstones
 */
export const getAllGemstones = async ({ limit = 20, page = 1, color } = {}) => {
  try {
    const response = await axios.get(`${API_URL}/product/get-all-gemstones`, {
      params: { limit, page, color: color?.trim()?.toLowerCase() },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching gemstones:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
