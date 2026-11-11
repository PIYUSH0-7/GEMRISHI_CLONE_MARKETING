import React from "react";
import JewelleryCard from "./jewelleryCard";
import { useBestSellers } from "../hooks/usebestseller";

const JewelleryGrid = () => {
	const { data, loading, error } = useBestSellers("jewelry", 1, 5);

	////console.log("Best Sellers API Response:", data);

	if (loading) {
		return (
			<div className="flex justify-center items-center p-10">
				<p>Loading best sellers...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center p-10">
				<p className="text-gray-500">Failed to load best sellers</p>
			</div>
		);
	}

	// ✅ Handle both possible structures
	const products = Array.isArray(data) ? data : data?.data || [];

	return (
		<div className="flex justify-center items-center w-full">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center p-8 lg:p-16">
				{products.map((product, index) => (
					<JewelleryCard
						key={product._id || index}
						product={product}
						slug={product.slug}
						image={product.image?.url || (Array.isArray(product.images) ? product.images[0]?.url : null)}
						title={product.name || product.jewelryName}
						sku={product.sku}
						origin={product.origin}
						price={product.price || product.jewelryPrice}
					/>
				))}
			</div>
		</div>
	);
};

export default JewelleryGrid;
