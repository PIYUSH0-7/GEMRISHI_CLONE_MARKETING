import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Fetch gemstone subcategories
 */
export const getGemstoneCategories = async () => {
	try {
		const response = await axios.get(`${API_URL}/subcategory/get_gemstone_cat`);
		return response.data;
	} catch (error) {
		console.error(
			"Error fetching gemstone categories:",
			error.response?.data || error.message
		);
		throw error;
	}
};
