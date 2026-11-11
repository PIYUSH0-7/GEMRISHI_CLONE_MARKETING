import { useState, useEffect } from "react";
import { getSimilarGemstones } from "../api/similargem";

export const useSimilarGemstones = (productId) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!productId) return;

		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				const result = await getSimilarGemstones(productId);
                // console.log('result',result)
				setData(result);
			} catch (err) {
				console.error(
					err.response?.data || err.message || "Something went wrong"
				);
				setError(
					err.response?.data?.message || err.message || "Something went wrong"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [productId]);

	return { data, loading, error };
};
