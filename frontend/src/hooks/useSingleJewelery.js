import { useState, useEffect } from "react";
import { getSingleJewelry } from "../api/singlejewelery";
import { getLatestMetalRates } from "../api/metalRates";

export const useSingleJewelry = (slug) => {
	const [data, setData] = useState(null);
	const [metalRates, setMetalRates] = useState(null);
	const [loading, setLoading] = useState(Boolean(slug));
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!slug) {
			setLoading(false);
			return;
		}

		let isMounted = true;
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const productRes = await getSingleJewelry(slug);
				let rates = null;
				try {
					const ratesRes = await getLatestMetalRates();
					rates = ratesRes?.result || ratesRes?.data || ratesRes?.metalRates || ratesRes;
				} catch (rateErr) {
					console.warn("Could not fetch metal rates in useSingleJewelry hook:", rateErr);
				}

				if (isMounted) {
					setData(productRes.jewelry || productRes.product || productRes);
					setMetalRates(rates);
				}
			} catch (err) {
				if (isMounted) {
					setError(
						err.response?.data?.msg ||
							err.message ||
							"Failed to load product or metal rates"
					);
				}
				console.error("useSingleJewelry hook error:", err);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchData();

		return () => {
			isMounted = false;
		};
	}, [slug]);

	return { data, metalRates, loading, error };
};
