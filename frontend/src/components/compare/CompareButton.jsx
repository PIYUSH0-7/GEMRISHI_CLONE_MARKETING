import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Scale } from "lucide-react";
import { toggleCompare } from "../../redux/compareSlice";
import { trackCustomEvent } from "../../utils/autoTracking";

export default function CompareButton({
	product = null,
	id = null,
	className = "",
	showText = false,
}) {
	const dispatch = useDispatch();
	const compareItems = useSelector((state) => state.compare?.items || []);

	const targetId = String(product?._id || product?.id || id || "");

	const isCompared = compareItems.some((item) => {
		const itemId = String(item._id || item.id || "");
		return itemId && itemId === targetId;
	});

	const handleClick = (e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		const payload = product || { _id: targetId, id: targetId };
		dispatch(toggleCompare(payload));

		if (!isCompared) {
			const itemName = product?.name || product?.jewelryName || targetId;
			trackCustomEvent("Compare_Item_Added", {
				item_name: itemName,
				category: "Comparison Matrix",
			});
			if (typeof window.clarity === "function") {
				window.clarity("set", "comparison_used", "true");
			}
		}
	};

	if (showText) {
		return (
			<button
				type="button"
				onClick={handleClick}
				aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
				className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 border cursor-pointer ${
					isCompared
						? "bg-[#1E3A34] text-white border-[#1E3A34] shadow-xs"
						: "bg-white hover:bg-gray-50 text-gray-700 hover:text-[#1E3A34] border-gray-200"
				} ${className}`}
			>
				<Scale className="w-4 h-4 stroke-[1.8]" />
				<span>{isCompared ? "In Comparison" : "Compare"}</span>
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
			title={isCompared ? "In Comparison (Click to remove)" : "Compare Gemstone"}
			className={`w-8 h-8 sm:w-9 sm:h-9 min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] rounded-full flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer z-10 ${
				isCompared
					? "bg-[#1E3A34] text-white border border-[#1E3A34] hover:bg-[#162c27]"
					: "bg-white/90 backdrop-blur-xs text-gray-600 hover:text-[#1E3A34] hover:bg-white border border-gray-100 hover:shadow-md"
			} ${className}`}
		>
			<Scale
				className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
					isCompared ? "scale-110" : "hover:scale-110"
				}`}
			/>
		</button>
	);
}
