import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Green from "../../assets/green.svg";
import Pink from "../../assets/pink.svg";
import Purple from "../../assets/purple.svg";
import Sky from "../../assets/skyBlue.svg";
import darkPink from "../../assets/darkPink.svg";
import Soul from "../../assets/soul.svg";
import Grey from "../../assets/grey.svg";
import Blue from "../../assets/blue.svg";
import Red from "../../assets/red.svg";

// Color data
const colors = [
	{
		id: 1,
		name: " Green",
		apiValue: "green",
		image: Green,
	},
	{ id: 2, name: "Blue", apiValue: "blue", image: Blue },
	{
		id: 3,
		name: "Light Pink",
		apiValue: "pink",
		image: Pink,
	},
	{ id: 4, name: "Red", apiValue: "red", image: Red },
	{
		id: 5,
		name: "Purple",
		apiValue: "purple",
		image: Purple,
	},

	{
		id: 7,
		name: "Sky Blue",
		apiValue: "blue",
		image: Sky,
	},
	{
		id: 8,
		name: "Dark Pink",
		apiValue: "pink",
		image: darkPink,
	},
	{ id: 9, name: "Yellow", apiValue: "yellow", image: Soul },
	{ id: 10, name: "Grey", apiValue: "grey", image: Grey },
];

const ColorFilter = ({ onSelectColor, onChange }) => {
	const [selected, setSelected] = useState(null);
	const navigate = useNavigate();

	const handleClick = (color) => {
		setSelected(color.name);

		if (onSelectColor) onSelectColor(color.apiValue);

		navigate(`/filter-gemstone?color=${encodeURIComponent(color.apiValue)}`);
	};

	return (
		<div className="mt-12">
			<div className="font-medium text-xl sm:text-2xl mb-6 text-center sm:text-left">
				By Color
			</div>

			{/* Responsive grid for colors */}
			<div className="flex justify-center items-center">
				<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10  sm:gap-8 justify-items-center">
					{colors.map((color) => (
						<div
							key={color.id}
							onClick={() => handleClick(color)}
							className={`flex flex-col items-center cursor-pointer transition transform hover:scale-105 ${
								selected === color.name ? "border-b-4 border-[#264A3F]" : ""
							}`}>
							<img
								src={color.image}
								alt={color.name}
								className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
							/>
							<p className="text-xs sm:text-sm mt-2 text-center">
								{color.name}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ColorFilter;
