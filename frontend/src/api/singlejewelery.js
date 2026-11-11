import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Fetch a single jewelry product by its slug
 * @param {string} slug - The slug of the jewelry
 */
export const getSingleJewelry = async (slug) => {
	try {
		const response = await axios.get(
			`${API_URL}/jewelry/single-jewelry/${slug}`
		);
		return response.data;
	} catch (error) {
		console.error(
			"Error fetching single jewelry:",
			error.response?.data || error.message
		);
		throw error;
	}
};
