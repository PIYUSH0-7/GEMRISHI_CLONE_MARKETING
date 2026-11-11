import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Fetch all jewelries of a specific gemstone type
 * @param {Object} params - Filter parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {string} params.jewelryType - Type of jewelry (e.g., "Ring")
 * @param {string} params.gemstoneType - Gemstone type ID
 * @param {string} [params.metal] - Optional metal filter (e.g., "gold")
 */
export const getJewelriesByGemstoneType = async ({
	page = 1,
	jewelryType,
	gemstoneType,
	metal,
}) => {
	try {
		const response = await axios.get(
			`${API_URL}/jewelry/get_all_jewelry_of_gemstone_type`,
			{
				params: {
					page,
					jewelryType,
					gemstoneType,
					metal,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error(
			"Error fetching jewelries by gemstone type:",
			error.response?.data || error.message
		);
		throw error;
	}
};
