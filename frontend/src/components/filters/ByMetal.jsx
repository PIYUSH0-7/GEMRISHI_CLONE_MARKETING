import React, { useState } from "react";

export default function ByMetalFilter({ onChange }) {
	const [selectedMetal, setSelectedMetal] = useState(null);

	const metals = [
		{ id: 1, name: "Silver", color: "bg-gray-200", borderColor: "#9CA3AF" },
		{
			id: 2,
			name: "Panchdhatu",
			color: "bg-[#C8A23C]",
			borderColor: "#A68632",
		},
		{ id: 3, name: "Gold", color: "bg-[#E5B800]", borderColor: "#CD9A00" },
		{ id: 4, name: "Platinum", color: "bg-gray-300", borderColor: "#6B7280" },
	];

	const handleSelect = (metal) => {
		setSelectedMetal(metal.id);
		if (onChange) onChange(metal.name); // ✅ inform parent
	};

	return (
		<div className="w-full flex flex-col items-center mt-4 px-4 sm:px-6">
			{/* Heading */}
			<h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
				Select Type of Metal
			</h2>

			{/* Responsive Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-3xl">
				{metals.map((metal) => (
					<div
						key={metal.id}
						onClick={() => handleSelect(metal)}
						className={`flex flex-col items-center cursor-pointer transition-all duration-300 ease-in-out
              ${selectedMetal === metal.id ? "scale-105" : "hover:scale-105"}`}>
						{/* Color Circle with Highlight on Selection */}
						<div
							className={`w-16 h-16 rounded-md ${metal.color} shadow-md transition-all duration-300`}
							style={{
								border:
									selectedMetal === metal.id
										? `3px solid ${metal.borderColor}`
										: "2px solid transparent",
							}}></div>

						{/* Metal Name */}
						<span
							className={`mt-3 text-sm sm:text-lg font-medium transition-colors duration-300 ${
								selectedMetal === metal.id ? "text-[#234036]" : "text-gray-700"
							}`}>
							{metal.name}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
