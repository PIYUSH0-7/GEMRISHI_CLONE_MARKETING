import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

export const contactUs = async (formData) => {
	const enrichedData = {
		...(typeof formData === "object" ? formData : {}),
		eventSourceUrl: typeof window !== "undefined" ? window.location.href.split("?")[0] : "https://gemrishi.com/contactUs",
	};
	try {
		const response = await axios.post(
			`${API_URL}/contactUs/contact_us`,
			enrichedData,
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
		return response.data;
	} catch (err) {
		if (err.response) {
			console.error("❌ Wishlist error:", err.response.data);
		} else if (err.request) {
			console.error("❌ Wishlist request made but no response:", err.request);
		} else {
			console.error("❌ Wishlist error:", err.message);
		}
		return {
			success: false,
			message: err.response?.data?.message || err.message,
		};
	}
};
