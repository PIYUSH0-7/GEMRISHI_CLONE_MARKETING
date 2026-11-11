import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Fetch similar jewelries for a given jewelry ID
 * @param {string} jewelryId - ID of the jewelry to find similar items for
 */
export const getSimilarJewelries = async (jewelryId) => {
	try {
		const response = await axios.get(
			`${API_URL}/product/similar-jewelleries/${jewelryId}`
		);
		return response.data;
	} catch (error) {
		console.error(
			"Error fetching similar jewelries:",
			error.response?.data || error.message
		);
		throw error;
	}
};

export const getSimilarProducts = async (productId) => {
	try {
		const response = await axios.get(
			`${API_URL}/product/similar-products/${productId}`
		);
		return response.data;
	} catch (error) {
		console.error(
			"Error fetching similar jewelries:",
			error.response?.data || error.message
		);
		throw error;
	}
};
