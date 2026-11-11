import React, { useState } from "react";

export default function GemstoneFilter({
	gemstones,
	onChange,
	loading,
	error,
}) {
	const [selectedGemstone, setSelectedGemstone] = useState(null);

	const handleSelect = (stone) => {
		setSelectedGemstone(stone.id);
		if (onChange) onChange(stone); // ✅ pass whole object or just stone.id
	};

	if (loading) return <p>Loading gemstones...</p>;
	if (error) return <p className="text-gray-500">Failed to load gemstones.</p>;

	return (
		<div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 justify-items-center">
			{gemstones?.map((stone, index) => {
				const stoneId = stone.id || index;
				return (
					<div
						key={stoneId}
						onClick={() => handleSelect({ ...stone, id: stoneId })}
						className={`flex flex-col items-center p-4 sm:p-6 hover:scale-105 transition-transform duration-300 cursor-pointer ${
							selectedGemstone === stoneId
								? "border-2 border-[#264A3F] rounded-lg"
								: "border border-transparent"
						}`}>
						<img
							src={stone.image}
							alt={stone.name}
							className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain mb-2"
						/>
						<p className="font-medium text-gray-800 text-sm sm:text-base">
							{stone.name}
							{stone.alternateName && (
								<span className="text-gray-500"> ({stone.alternateName})</span>
							)}
						</p>
					</div>
				);
			})}
		</div>
	);
}
