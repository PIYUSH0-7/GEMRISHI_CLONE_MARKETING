import { useState } from "react";

// Import images (best practice for React projects)
import RingImg from "../../assets/ring.svg";
import PendantImg from "../../assets/pendant.svg";
import BraceletImg from "../../assets/bracelet.svg";
import BroochImg from "../../assets/Brooch.svg";

export default function JewelleryFilter({ onChange }) {
	const [selected, setSelected] = useState(null);

	const jewelleryTypes = [
		{ id: 1, name: "Ring", image: RingImg },
		{ id: 2, name: "Pendant", image: PendantImg },
		{ id: 3, name: "Bracelet", image: BraceletImg },
		{ id: 4, name: "Brooch", image: BroochImg },
	];

	const handleSelect = (item) => {
		setSelected(item.id);
		if (onChange) onChange(item.name);
	};

	return (
		<div className="w-full flex flex-col items-center mt-4 px-4 sm:px-8">
			{/* Heading */}
			<h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
				Select Type of Jewellery
			</h2>

			{/* Responsive Layout: flex-col for small screens, grid from md */}
			<div className="flex flex-col gap-4 sm:gap-6 md:grid md:grid-cols-4 md:gap-6 w-full max-w-3xl">
				{jewelleryTypes.map((item) => (
					<div
						key={item.id}
						onClick={() => handleSelect(item)}
						className={`flex flex-col items-center justify-center p-4 bg-white shadow-md rounded-lg cursor-pointer transition-all duration-300 ease-in-out
              hover:scale-105
              ${
								selected === item.id
									? "border-2 border-[#264A3F] shadow-lg"
									: "hover:shadow-lg"
							}`}>
						<img
							src={item.image}
							alt={item.name}
							className="w-10 h-10 sm:w-12 sm:h-12 mb-3 object-contain"
						/>
						<span className="text-sm sm:text-base font-medium text-gray-800">
							{item.name}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
