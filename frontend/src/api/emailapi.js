import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Add a new email subscription
 * @param {string} email - The email address to subscribe
 */
export const addEmailSubscription = async (email) => {
	try {
		const response = await axios.post(`${API_URL}/emailsub/add_email_sub`, {
			email,
		});
		return response.data;
	} catch (error) {
		console.error(
			"Error adding email subscription:",
			error.response?.data || error.message
		);
		throw error;
	}
};
