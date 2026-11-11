import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Fetch best seller jewelry
 * @param {string} type - Type of product (e.g., jewelry)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 */
export const getBestSellers = async (type = "jewelry", page = 1, limit = 5) => {
	try {
		const response = await axios.get(
			`${API_URL}/reviewRating/get_all_best_seller`,
			{
				params: {
					type,
					page,
					limit,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error(
			"Error fetching best sellers:",
			error.response?.data || error.message
		);
		throw error;
	}
};
