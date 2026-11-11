import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProductDetails from "./ProductDetails";
import StoneCollection from "./StoneCollection";
import VideoBottom from "./VideoBottom";
import { Helmet } from "react-helmet-async";


function ProductPage() {
	const { slug } = useParams();
	const [pageData, setPageData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const URL = import.meta.env.VITE_URL;
	// docu
	useEffect(() => {
		const fetchData = async () => {
			if (!slug) {
				setLoading(false);
				setError("No slug provided.");
				console.error("No slug found in URL parameters.");
				return;
			}
			try {
				setLoading(true);
				const response = await axios.get(
					`${URL}/subcategory/single-subcategory/${slug}`
				);

				//console.log("API Response:", response.data);

				if (response.data && response.data.subcategory) {
					setPageData(response.data);
					setError(null);
				} else {
					setError("Subcategory details not found in API response.");
				}
			} catch (err) {
				console.error("Error fetching data:", err);
				if (
					err.message.includes("Network Error") ||
					err.message.includes("ECONNREFUSED")
				) {
					setError(
						"Failed to connect to the server. Please check if your backend is running."
					);
				} else {
					setError("Failed to load details. Please check the API URL or slug.");
				}
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [slug]);

	if (loading) {
		return (
			<div className="text-center py-20 text-gray-600">
				Loading product details...
			</div>
		);
	}

	if (error || !pageData || !pageData.subcategory) {
		return (
			<div className="text-center py-20 text-red-600">
				Error: {error || "Data not available."}
			</div>
		);
	}

	return (
		<>
			<Helmet>
				<title>{pageData?.subcategory?.name ? `${pageData.subcategory.name} Gemstones | GemRishi India` : 'Gemstones | GemRishi India'}</title>
				<meta name="description" content={`Buy certified ${pageData?.subcategory?.name || 'gemstones'} online from GemRishi India. Natural astrology gemstones with authentic certificates.`} />
			</Helmet>
			<ProductDetails subcategory={pageData.subcategory} />
			<StoneCollection products={pageData.products} />
			<VideoBottom />
		</>
	);
}

export default ProductPage;
