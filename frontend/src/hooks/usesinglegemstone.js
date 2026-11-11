import { useEffect, useState } from "react";
import { getGemstoneBySlug } from "../api/getGemstoneBySlug";

//---------------Add By Pawan for location info-------------------
export const useGemstoneBySlug = (slug, sku) => {
	const [product, setProduct] = useState(null);
	const [countryData, setCountryData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!slug)
			{
		   setLoading(false)
			return;
		}

		const fetchGemstone = async () => {
			try {
				setLoading(true);
				setError(null);

				const data = await getGemstoneBySlug(slug, sku);
				////console.log("Fetched gemstone data:", data);

				// Destructure the returned object
				setProduct(data.product || null);
				setCountryData(data.countryData || null);

				// console.log("Product set:", data.product);
				// console.log("CountryData set:", data.countryData);
			} catch (err) {
				console.error("Error fetching gemstone:", err);
				setError(err.message || "Failed to fetch gemstone");
			} finally {
				setLoading(false);
			}
		};

		fetchGemstone();
	}, [slug, sku]);
	//---------------End Add By Pawan for location info----------------

	return { product, countryData, loading, error };
};