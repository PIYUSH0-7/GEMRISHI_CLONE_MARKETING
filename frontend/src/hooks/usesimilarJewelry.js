import { useState, useEffect } from "react";
import { getSimilarJewelries, getSimilarProducts} from "../api/similarjewellery";

export const useSimilarJewelry = (jewelryId) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!jewelryId) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				const result = await getSimilarJewelries(jewelryId);
				// console.log("Fetched data", result);
				setData(result);
			} catch (err) {
				console.error(err.message || "Something went wrong");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [jewelryId]);

	return { data, loading, error };
};


export const useSimilarProducts = (productId) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!productId) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				const result = await getSimilarProducts(productId);
				// console.log("Fetched data", result);
				setData(result);
			} catch (err) {
				console.error(err.message || "Something went wrong");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [productId]);

	return { data, loading, error };
};
