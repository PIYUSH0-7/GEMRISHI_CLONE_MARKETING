import React, { useState } from "react";

const Filter = () => {
	const [selectedFilter, setSelectedFilter] = useState("gemstone");

	return (
		<div className="flex flex-col sm:flex-row gap-4 sm:gap-6 ml-0 sm:ml-24 items-start sm:items-center w-full px-4 sm:px-0">
			{/* By Gemstone */}
			<div
				onClick={() => setSelectedFilter("gemstone")}
				className="flex items-center cursor-pointer space-x-2">
				<div
					className={`w-6 h-6 flex items-center justify-center border rounded transition-colors duration-200 
            ${
							selectedFilter === "gemstone"
								? "bg-[#234036] border-[#234036] text-white"
								: "bg-gray-100 border-gray-300"
						}`}>
					{selectedFilter === "gemstone" && (
						<span className="text-white text-sm">✔</span>
					)}
				</div>
				<span
					className={`text-base sm:text-lg font-medium transition-colors duration-200 
            ${selectedFilter === "gemstone" ? "text-black" : "text-gray-700"}`}>
					By Gemstone
				</span>
			</div>

			{/* By Color */}
			<div
				onClick={() => setSelectedFilter("color")}
				className="flex items-center cursor-pointer space-x-2">
				<div
					className={`w-6 h-6 flex items-center justify-center border rounded transition-colors duration-200 
            ${
							selectedFilter === "color"
								? "bg-[#234036] border-[#234036] text-white"
								: "bg-gray-100 border-gray-300"
						}`}>
					{selectedFilter === "color" && (
						<span className="text-white text-sm">✔</span>
					)}
				</div>
				<span
					className={`text-base sm:text-lg font-medium transition-colors duration-200 
            ${selectedFilter === "color" ? "text-black" : "text-gray-700"}`}>
					By Color
				</span>
			</div>
		</div>
	);
};

export default Filter;
