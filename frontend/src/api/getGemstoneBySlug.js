import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

/**
 * Fetch single gemstone details by slug, OR by name+sku pair.
 * Mirrors the identifier logic used in HeaderDetailPage so both
 * URL patterns (/products/:slug and /products/:name/:sku) resolve
 * to the correct backend route and return countryData.
 *
 * @param {string} slug - Gemstone slug (e.g., "emerald") OR "name/sku" combo
 * @param {string} [sku] - Optional SKU, when name+sku are known separately
 * @returns {Promise<Object>} Gemstone details ({ product, countryData })
 */
export const getGemstoneBySlug = async (slug, sku) => {
	try {
		// Add By Pawan for location info
		let endpoint;

		if (slug && sku) {
			// Explicit name + sku (e.g. from /products/:name/:sku route)
			endpoint = `${API_URL}/product/single-gemstone/${encodeURIComponent(
				slug
			)}/${encodeURIComponent(sku)}`;
		} else if (slug && slug.includes("/")) {
			// Combined "name/sku" identifier passed as a single string
			const [n, s] = slug.split("/");
			endpoint = `${API_URL}/product/single-gemstone/${encodeURIComponent(
				n
			)}/${encodeURIComponent(s)}`;
		} else {
			// Plain slug
			endpoint = `${API_URL}/product/single-gemstone/${encodeURIComponent(
				slug
			)}`;
		}
		// End Add By Pawan for location info

		const response = await axios.get(endpoint);

		// The gemstone data is inside response.data.product
		return {
			product: response.data.product,
			countryData: response.data.countryData,
		};
	} catch (error) {
		console.error(
			"Error fetching gemstone details:",
			error.response?.data || error.message
		);
		throw error;
	}
};