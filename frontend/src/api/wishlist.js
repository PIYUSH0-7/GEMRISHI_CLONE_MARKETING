import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

const getAuthToken = () => {
	try {
		const raw = localStorage.getItem("userInfo");
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed?.token) return parsed.token;
			if (parsed?.user?.token) return parsed.user.token;
		}
		const directToken = localStorage.getItem("token");
		if (directToken) return directToken;
	} catch (err) {
		console.warn("Error reading token:", err);
	}
	return null;
};

export const addToWishlist = async (itemId, itemType = "Product") => {
	const token = getAuthToken();
	const headers = { "Content-Type": "application/json" };
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const response = await axios.post(
			`${API_URL}/wishlist/add_to_wishlist`,
			{ itemId, itemType },
			{
				headers,
				withCredentials: true,
			}
		);
		return response.data;
	} catch (err) {
		console.error("Wishlist add error:", err.response?.data || err.message);
		return {
			success: false,
			message: err.response?.data?.message || err.message,
		};
	}
};

export const removeFromWishlist = async (itemId) => {
	const token = getAuthToken();
	const headers = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const response = await axios.delete(
			`${API_URL}/wishlist/remove_from_wishlist`,
			{
				headers,
				params: { itemId },
				withCredentials: true,
			}
		);
		return response.data;
	} catch (err) {
		console.error("Wishlist remove error:", err.response?.data || err.message);
		return {
			success: false,
			message: err.response?.data?.message || err.message,
		};
	}
};

export const getWishlist = async () => {
	const token = getAuthToken();
	const headers = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const response = await axios.get(`${API_URL}/wishlist/get_all_wishlist`, {
			headers,
			withCredentials: true,
		});
		return response.data;
	} catch (err) {
		console.error("Wishlist fetch error:", err.response?.data || err.message);
		return {
			success: false,
			wishlist: [],
			metalRates: null,
			message: err.response?.data?.message || err.message,
		};
	}
};
