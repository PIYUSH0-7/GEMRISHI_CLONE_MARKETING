import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SimilarCard from "./Similarcard";
import Ring from "../assets/Jwellery/Ring.svg";
import { useSimilarJewelry } from "../hooks/usesimilarJewelry";

export default function SimilarProducts({ jewelryId }) {
	const scrollRef = useRef(null);
	const { data, loading, error } = useSimilarJewelry(jewelryId);

	const scroll = (direction) => {
		if (scrollRef.current) {
			const { scrollLeft, clientWidth } = scrollRef.current;
			const scrollAmount =
				direction === "left"
					? scrollLeft - clientWidth
					: scrollLeft + clientWidth;
			scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
		}
	};

	if (loading)
		return <p className="text-center mt-10">Loading similar products...</p>;
	if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

	if (!data?.products || data.products.length === 0)
		return (
			<div className="w-full bg-gray-50 py-12 text-center px-4">
				<h2 className="text-[22px] sm:text-[24px] mb-4 font-semibold">
					Similar Products
				</h2>
				<p className="text-gray-600">
					Sorry, we couldn't find any similar jewelry.
				</p>
			</div>
		);

	return (
		<div className="w-full bg-gray-50 py-10 px-4 sm:px-8 relative">
			<h2 className="text-center text-[22px] sm:text-[24px] font-semibold mb-10">
				Similar Products
			</h2>

			<div className="relative flex items-center">
				{/* Left Button */}
				<button
					onClick={() => scroll("left")}
					className="hidden sm:flex absolute left-2 sm:left-8 md:left-16 top-1/2 -translate-y-1/2 z-10 p-2 bg-green-900 text-white rounded-full shadow hover:bg-green-800 transition">
					<ChevronLeft size={22} />
				</button>

				{/* Scrollable container */}
				<div
					ref={scrollRef}
					className="flex overflow-x-auto gap-6 scroll-smooth scrollbar-hide px-2 sm:px-10 md:px-20 lg:px-28 w-full">
					{data.products.map((product) => (
						<div
							className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px]"
							key={product._id}>
							<SimilarCard
								product={product}
								sku={product.sku}
								slug={product.slug}
								image={product.images?.[0]?.url || Ring}
								title={product.jewelryName || "Unnamed Jewelry"}
								Type={product.jewelryType || "Unknown"}
								price={product.jewelryPrice || "Price on request"}
								itemType="jewellery"
							/>
						</div>
					))}
				</div>

				{/* Right Button */}
				<button
					onClick={() => scroll("right")}
					className="hidden sm:flex absolute right-2 sm:right-8 md:right-16 top-1/2 -translate-y-1/2 z-10 p-2 bg-green-900 text-white rounded-full shadow hover:bg-green-800 transition">
					<ChevronRight size={22} />
				</button>
			</div>
		</div>
	);
}
