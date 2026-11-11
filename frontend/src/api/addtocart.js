import { getCheckoutMetaContext } from "../utils/Trackingconfig.js";
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

export const addItemToCart = async (payload, token) => {
	const metaCtx = getCheckoutMetaContext();
	const eventId = payload?.eventId || metaCtx?.eventId || `cart_${payload?.itemId || "item"}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
	const enrichedPayload = {
		...payload,
		eventId,
		eventSourceUrl: payload?.eventSourceUrl || metaCtx?.eventSourceUrl || (typeof window !== "undefined" ? window.location.href.split("?")[0] : undefined),
		metaContext: {
			...(metaCtx || {}),
			eventId,
			...(payload?.metaContext || {}),
		},
	};
	const userToken = token || getAuthToken();

	try {
		const headers = {
			"Content-Type": "application/json",
		};
		if (userToken) {
			headers.Authorization = `Bearer ${userToken}`;
		}

		const response = await axios.post(
			`${API_URL}/cart/add_item_in_cart`,
			enrichedPayload,
			{
				headers,
				withCredentials: true,
			}
		);
		return response.data;
	} catch (err) {
		console.error(
			"Error adding item to cart:",
			err.response?.data || err.message
		);
		throw err;
	}
};
