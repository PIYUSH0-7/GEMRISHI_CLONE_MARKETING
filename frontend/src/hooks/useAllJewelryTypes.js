import { useEffect, useState } from "react";
import { getAllJewelryTypes } from "../api/jewelrydetail";

export const useJewelryTypes = () => {
	const [types, setTypes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchJewelryTypes = async () => {
			try {
				const response = await getAllJewelryTypes();
				////console.log("Fetched jewelry subcategories:", response);

				// ✅ Correctly extract array
				setTypes(
					response?.subcategories || response?.data?.subcategories || []
				);
			} catch (err) {
				console.error("Error fetching jewelry subcategories:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchJewelryTypes();
	}, []);

	return { data: types, loading, error };
};
