import React, { useEffect, useState } from "react";
import Card from "./Card";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductCards = ({ category, products }) => {
	const itemsPerPage = 24;
	const [currentPage, setCurrentPage] = useState(1);
	const baseUrl = import.meta.env.VITE_URL;
	const [metalRates, setMetalRates] = useState(null);

	const getMetalRates = async () => {
		try {
			const res = await axios.get(`${baseUrl}/metalRates/get_latest_metal_rate`);
			setMetalRates(res.data);
		} catch (error) {
			console.error("Error fetching metal rates:", error);
		}
	}

	useEffect(() => {
		getMetalRates();
	}, []);

	const latest = metalRates?.latestRate;

const getMetalRate = (product) => {
  const metal = product?.metal; // e.g., "gold24k", "silver", "platinum"

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


	// ✅ Ensure we have a valid product array
	const safeProducts = Array.isArray(products) ? products : [];

	const totalPages = Math.ceil(safeProducts.length / itemsPerPage) || 1;
	const indexOfLast = currentPage * itemsPerPage;
	const indexOfFirst = indexOfLast - itemsPerPage;
	const currentProducts = safeProducts.slice(indexOfFirst, indexOfLast);

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages) setCurrentPage(page);
	};

	return (
		<div className="w-full mt-14">
			{/* Product Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full mt-4 sm:mt-6">
				{currentProducts.length > 0 ? (
					currentProducts.map((product, index) => (
						<Card
							key={product?._id || index}
							product={product}
							id={product?._id}
							sku={product?.sku}
							slug={product?.slug || "#"}
							image={product?.images?.[0]?.url || (typeof product?.images?.[0] === 'string' ? product.images[0] : "/ring.png")}
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
							videos={product?.videos}
							itemType="Jewelry"
						/>
					))
				) : (
					<p className="col-span-full text-center text-gray-500">
						⚠️ No {category} products found.
					</p>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex flex-wrap justify-center items-center gap-2 mt-8 mb-10">
					<button
						onClick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
						className="p-2 border rounded-full disabled:opacity-50">
						<ChevronLeft className="w-4 h-4 cursor-pointer" />
					</button>

					{[...Array(totalPages)].map((_, i) => (
						<button
							key={i + 1}
							onClick={() => goToPage(i + 1)}
							className={`px-3 py-1 rounded ${
								currentPage === i + 1
									? "text-blue-600 font-semibold"
									: "text-gray-500 hover:text-blue-600"
							}`}>
							{i + 1}
						</button>
					))}

					<button
						onClick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="p-2 border rounded-full disabled:opacity-50">
						<ChevronRight className="w-4 h-4 cursor-pointer" />
					</button>
				</div>
			)}

			{/* Fallback for invalid data */}
			{!Array.isArray(products) && (
				<p className="text-center text-red-500 mb-6">
					⚠️ Products data is invalid. Please try again later.
				</p>
			)}
		</div>
	);
};

export default ProductCards;
