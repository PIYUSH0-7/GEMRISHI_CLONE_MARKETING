import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Fetch jewelry items by subcategory slug (e.g., rings, pendants)
 * @param {string} slug - Jewelry subcategory slug (e.g., "rings", "pendants")
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Items per page (default: 10)
 */
export const getJewelryBySubCategory = async (slug, page = 1, limit = 10) => {
	try {
		const response = await axios.get(
			`${API_URL}/jewelrySubCategory/single-jewelry-subcategory/${slug}`,
			{
				params: { page, limit },
			}
		);

		return response.data;
	} catch (error) {
		console.error(
			"Error fetching jewelry by subcategory:",
			error.response?.data || error.message
		);
		throw error;
	}
};
