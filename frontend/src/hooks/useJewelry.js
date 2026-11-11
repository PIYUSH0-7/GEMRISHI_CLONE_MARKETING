import { useState, useEffect } from "react";
import { getJewelryBySubCategory } from "../api/jewelryapi";

/**
 * Custom hook to fetch jewelry items by subcategory slug
 * @param {string} slug - Dynamic jewelry subcategory slug (e.g., "rings", "pendants")
 * @param {number} page - Page number for pagination
 */
export const useJewelry = (slug, page = 1) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!slug) return; 

		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const result = await getJewelryBySubCategory(slug, page);
				// console.log("Fetched Jewelry:", result);
				setData(result);
			} catch (err) {
				const message =
					err.response?.data?.message || err.message || "Something went wrong";
				console.error("Error fetching jewelry:", message);
				setError(message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [slug, page]); // re-run when slug or page changes

	return { data, loading, error };
};
