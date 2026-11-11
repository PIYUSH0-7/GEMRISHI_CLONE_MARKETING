import React from "react";
import { useLocation } from "react-router-dom";
import { useGemstones } from "../hooks/usegemstonebycolor";
import GemstoneCard from "../components/gemstoneCard";
import { Helmet } from "react-helmet-async";

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

const GemstoneListPage = () => {
	const query = useQuery();
	const rawColor = query.get("color");
	const color = rawColor?.trim().toLowerCase();

	const { data, loading, error } = useGemstones({
		limit: 20,
		page: 1,
		color,
	});

	const firstGemstone = data?.products?.[0];
	const displayColor = rawColor
		? rawColor.charAt(0).toUpperCase() + rawColor.slice(1).toLowerCase()
		: "All";

	return (
		<div className="p-6">
			<Helmet>
				<title>{color ? `${displayColor} Gemstones | GemRishi India` : 'Gemstones | GemRishi India'}</title>
				<meta name="description" content={`Shop certified ${displayColor.toLowerCase()} gemstones from GemRishi India. Authentic, natural stones with astrology benefits.`} />
			</Helmet>
			{firstGemstone && (
				<div className="flex flex-col lg:flex-row items-center justify-between mb-10 gap-8">
					<div className="flex-1 text-left">
						<h1 className="text-[35px] font-bold text-gray-900 mb-1">
							{color
								? `${displayColor} Gemstones`
								: "All Gemstones"}
						</h1>
						<p className="text-gray-700 text-lg w-[70%] text-justify">
							{color
								? `${displayColor} gemstones are more than just beautiful adornments; they are timeless symbols of elegance, strength, and individuality. Each stone carries its own unique charm and energy, treasured for its vibrant colors, captivating brilliance, and meaningful symbolism. Perfect for marking special occasions or enhancing everyday style, gemstones celebrate personal expression, cherished moments, and enduring beauty. Explore our collection to find the gem that resonates with you, making every piece a reflection of your taste and story.`
								: "Explore our full gemstone collection and discover stones with extraordinary beauty, vibrant color, and powerful meaning. Each gemstone is curated to reflect quality, elegance, and individuality."}
						</p>
					</div>

					<div className="flex-shrink-0">
						<img
							src={firstGemstone?.images?.[0]?.url || "/ring.png"}
							alt={firstGemstone?.name || "Gemstone"}
							className="w-60 h-auto mix-blend-multiply"
						/>
					</div>
				</div>
			)}

			{loading && (
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264A3F] mx-auto mb-3"></div>
						<p className="text-sm text-stone-500 font-light">Loading gemstones...</p>
					</div>
				</div>
			)}
			{error && (
				<div className="flex items-center justify-center py-20">
					<div className="bg-white border border-red-100 rounded-2xl p-8 max-w-md text-center">
						<div className="mb-4 text-4xl">⚠️</div>
						<h3 className="text-lg font-semibold text-stone-900 mb-2">Unable to Load Gemstones</h3>
						<p className="text-stone-500 mb-6">Failed to load gemstones. Please try again.</p>
						<button
							onClick={() => window.location.reload()}
							className="px-6 py-2.5 bg-[#264A3F] text-white rounded-lg hover:bg-[#1a3329] transition-colors font-medium text-sm"
						>
							Try Again
						</button>
					</div>
				</div>
			)}

			{!loading && !error && data?.products?.length > 0 && (
				<div className="flex flex-wrap gap-6 justify-center mt-28">
					<GemstoneCard color={color || ""} products={data.products} />
				</div>
			)}

			{!loading && !error && data?.products?.length === 0 && (
				<div className="flex items-center justify-center py-20">
					<div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md text-center">
						<div className="mb-4 text-5xl">💎</div>
						<h3 className="text-lg font-semibold text-stone-900 mb-2">No Gemstones Available</h3>
						<p className="text-stone-500 mb-6">We don't have any <span className="font-semibold text-[#264A3F]">{displayColor}</span> gemstones available at the moment. Please try another color or explore our other collections.</p>
						<a
							href="/gemstone"
							className="inline-block px-6 py-2.5 bg-[#264A3F] text-white rounded-lg hover:bg-[#1a3329] transition-colors font-medium text-sm"
						>
							Explore All Gemstones
						</a>
					</div>
				</div>
			)}
		</div>
	);
};

export default GemstoneListPage;
