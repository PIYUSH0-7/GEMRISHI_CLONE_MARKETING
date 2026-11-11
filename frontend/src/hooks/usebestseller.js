// hooks/useBestSellers.js
import { useState, useEffect } from "react";
import { getBestSellers } from "../api/bestseller";

export const useBestSellers = (type = "jewelry", page = 1, limit = 5) => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const result = await getBestSellers(type, page, limit);
				setData(result);
			} catch (err) {
				console.error(err.message || "Something went wrong");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [type, page, limit]);

	return { data, loading, error };
};
