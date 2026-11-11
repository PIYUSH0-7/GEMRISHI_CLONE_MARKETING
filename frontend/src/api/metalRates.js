import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Fetch the latest metal rates
 * @returns {Promise<Object>} Latest metal rates data
 */
export const getLatestMetalRates = async () => {
	try {
		const response = await axios.get(
			`${API_URL}/metalRates/get_latest_metal_rate`
		);
		return response.data.latestRate;
	} catch (error) {
		console.error(
			"Error fetching latest metal rates:",
			error.response?.data || error.message
		);
		throw error;
	}
};
