import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FilteredCard from "./FilteredCard";

const GemstoneCard = ({ color, products }) => {
	const itemsPerPage = 8;
	const [currentPage, setCurrentPage] = useState(1);

	const safeProducts = Array.isArray(products) ? products : [];
	const normalizedColor = color?.trim().toLowerCase();

	const filteredProducts = useMemo(() => {
		if (!normalizedColor) return safeProducts;

		return safeProducts.filter((product) => {
			const productColor = product?.color || "";
			const normalizedProductColor = productColor.trim().toLowerCase();

			return normalizedProductColor.includes(normalizedColor);
		});
	}, [normalizedColor, safeProducts]);

	const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
	const indexOfLast = currentPage * itemsPerPage;
	const indexOfFirst = indexOfLast - itemsPerPage;
	const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	return (
		<div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{currentProducts.length > 0 ? (
					currentProducts.map((product) => (
						<FilteredCard
							key={product._id}
							id={product._id}
							slug={product?.slug}
							image={product?.images?.[0]?.url || "/ring.png"}
							title={product.name}
							origin={product.origin}
							product={product}
							videos={product.videos}
						/>
					))
				) : (
					<p className="col-span-full text-center text-gray-500">
						⚠️ No {color || "filtered"} gemstones found.
					</p>
				)}
			</div>

			{totalPages > 1 && (
				<div className="flex justify-center items-center gap-3 my-6">
					<button
						onClick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
						className="p-2 border rounded-full disabled:opacity-50"
					>
						<ChevronLeft className="w-4 h-4" />
					</button>

					{[...Array(totalPages)].map((_, i) => (
						<button
							key={i + 1}
							onClick={() => goToPage(i + 1)}
							className={`px-3 py-1 rounded ${currentPage === i + 1
								? "text-blue-600 font-semibold"
								: "text-gray-500 hover:text-blue-600"
								}`}
						>
							{i + 1}
						</button>
					))}

					<button
						onClick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="p-2 border rounded-full disabled:opacity-50"
					>
						<ChevronRight className="w-4 h-4" />
					</button>
				</div>
			)}
		</div>
	);
};

export default GemstoneCard;