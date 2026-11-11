import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useJewelriesByGemstoneType } from "../hooks/useFilter";
import Card from "../components/Card";
import axios from "axios";
import { fixImageUrl } from "../utils/imageUtils";

const Jewellerybyfilter = () => {
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

	const filters = useMemo(
		() => ({
			page: Number(queryParams.get("page")) || 1,
			jewelryType: queryParams.get("jewelryType") || "",
			gemstoneType: queryParams.get("gemstoneType") || "",
			metal: queryParams.get("metal") || "",
		}),
		[location.search]
	);

	const { data, loading, error } = useJewelriesByGemstoneType(filters);

	const products = data?.jeweleries || data?.items || [];

	// Metal rates for pricing
	const [metalRates, setMetalRates] = useState(null);

	// ✅ FIXED HELPER FUNCTION - prepend backend URL
	const getImageUrl = (url) => {
		if (!url) return "/ring.png";
		if (url.startsWith('http')) return url;
		return fixImageUrl(url);
	};

	const getMetalRates = async () => {
		try {
			const res = await axios.get(`${import.meta.env.VITE_URL}/metalRates/get_latest_metal_rate`);
			setMetalRates(res.data);
		} catch (error) {
			console.error("Error fetching metal rates:", error);
		}
	};

	useEffect(() => {
		getMetalRates();
	}, []);

	const latest = metalRates?.latestRate;

	const getMetalRate = (product) => {
		const metal = product?.metal;

		if (!latest) return 0;

		switch (metal) {
			case "gold24k":
				return latest.gold.gold24k.withGSTRate * product.jewelryMetalWeight;
			case "gold22k":
				return latest.gold.gold22k.withGSTRate * product.jewelryMetalWeight;
			case "gold18k":
				return latest.gold.gold18k.withGSTRate * product.jewelryMetalWeight;
			case "silver":
				return latest.silver.withGSTRate * product.jewelryMetalWeight;
			case "platinum":
				return latest.platinum.withGSTRate * product.jewelryMetalWeight;
			case "panchadhatu":
				return latest.panchadhatu.withGSTRate * product.jewelryMetalWeight;
			default:
				return 0;
		}
	};

	// Debug: Log products data to see image URLs
	useEffect(() => {
		if (products.length > 0) {
			console.log("Products loaded:", products.length);
			console.log("First product:", products[0]);
			console.log("First product image URL:", products[0]?.images?.[0]?.url);
			console.log("Fixed image URL:", getImageUrl(products[0]?.images?.[0]?.url));
		}
	}, [products]);

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">
				Filtered {filters.jewelryType}s
			</h2>

			{loading && (
				<p className="text-gray-500 text-center">Loading products...</p>
			)}
			{!loading && products.length === 0 && (
				<p className="text-gray-500 text-center">
					No {filters.jewelryType} found of selected selection something went
					wrong. Please try again later.
				</p>
			)}

			<div className="flex flex-wrap gap-6 sm:gap-8 lg:gap-12 mt-8">
				{products.map((product, index) => {
					// ✅ USE THE HELPER FUNCTION HERE
					const imageUrl = getImageUrl(product?.images?.[0]?.url);

					return (
						<Card
							key={product?._id || index}
							product={product}
							id={product?._id}
							sku={product?.sku}
							slug={product?.slug || "#"}
							image={imageUrl}
							title={product?.jewelryName || "Untitled Product"}
							{...(product?.productId?.origin && {
								origin: product.productId.origin,
							})}
							jewelryPrice={
								product?.jewelryPrice
									? Number(product.jewelryPrice).toFixed(2)
									: getMetalRate(product)
										? Number(getMetalRate(product)).toFixed(2)
										: "N/A"
							}
							videos={product?.videos?.map(v => ({
								...v,
								url: getImageUrl(v.url)
							}))}
							itemType="Jewelry"
						/>
					);
				})}
			</div>
		</div>
	);
};

export default Jewellerybyfilter;