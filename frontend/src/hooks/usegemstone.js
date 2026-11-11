import { useState, useEffect } from "react";
import { getGemstoneCategories } from "../api/gemsubcategory";

export const useGemstoneCategories = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const result = await getGemstoneCategories();
				console.log('results',result)
				setData(result);
			} catch (err) {
				console.error(err.message || "Something went wrong");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return { data, loading, error };
};
