// gemSuggestionApi.js
import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Get gemstone suggestion based on birth details
 * @param {Object} data - Object containing birth details (e.g., dateOfBirth, timeOfBirth, placeOfBirth)
 * @returns {Promise<Object>} Recommended gemstone data
 */
export const getGemSuggestion = async (data) => {
	try {
		const response = await axios.post(
			`${API_URL}/recommended/gem-suggestion`,
			data
		);
		return response.data;
	} catch (error) {
		console.error(
			"Error fetching gemstone suggestion:",
			error.response?.data || error.message
		);
		throw error;
	}
};
