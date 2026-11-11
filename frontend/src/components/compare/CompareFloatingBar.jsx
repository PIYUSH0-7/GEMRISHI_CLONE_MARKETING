import { ArrowRight, ChevronDown, ChevronUp, Scale, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { clearCompare, removeFromCompare } from "../../redux/compareSlice";
import { getProductImage } from "../../utils/imageUtils";

export default function CompareFloatingBar() {
	const location = useLocation();
	const dispatch = useDispatch();
	const compareItems = useSelector((state) => state.compare?.items || []);
	const [isMinimized, setIsMinimized] = useState(false);

	// Hide on the compare page itself or when empty
	if (compareItems.length === 0 || location.pathname === "/compare") {
		return null;
	}

	return (
		<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-3xl transition-all duration-300">
			<div className="bg-white/70 backdrop-blur-xl text-[#1E3A34] rounded-2xl shadow-xl shadow-black/10 border border-[#1E3A34]/15 overflow-hidden ring-1 ring-white/40">
				{/* Top bar header */}
				<div className="px-4 py-2.5 bg-white/40 flex items-center justify-between border-b border-[#1E3A34]/10 text-xs">
					<div className="flex items-center gap-2">
						<Scale className="w-4 h-4 text-[#1E3A34]" />
						<span className="font-bold tracking-wider uppercase text-[11px] text-[#1E3A34]">
							Compare Gemstones & Jewellery
						</span>
						<span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1E3A34] font-extrabold text-[10px]">
							{compareItems.length} / 4
						</span>
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setIsMinimized(!isMinimized)}
							className="text-[#1E3A34]/70 hover:text-[#1E3A34] p-1 transition-colors"
							aria-label={isMinimized ? "Expand compare bar" : "Minimize compare bar"}
							title={isMinimized ? "Expand" : "Minimize"}
						>
							{isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
						</button>
						<button
							type="button"
							onClick={() => dispatch(clearCompare())}
							className="text-[#1E3A34]/70 hover:text-red-600 text-[11px] font-medium transition-colors flex items-center gap-1 ml-2 cursor-pointer"
							title="Clear all items"
						>
							<Trash2 className="w-3.5 h-3.5" />
							<span className="hidden sm:inline">Clear</span>
						</button>
					</div>
				</div>

				{/* Expanded item row */}
				{!isMinimized && (
					<div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
						{/* Thumbnails preview */}
						<div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto py-1">
							{compareItems.map((item) => {
								const imgSrc = getProductImage(item, "/placeholder.svg");

								return (
									<div
										key={item._id}
										className="relative group shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/90 p-1 border border-[#1E3A34]/10 overflow-hidden flex items-center justify-center"
									>
										<img
											src={imgSrc}
											alt={item.name}
											className="w-full h-full object-contain"
											onError={(e) => {
												e.currentTarget.src = "/placeholder.svg";
											}}
										/>
										<button
											type="button"
											onClick={() => dispatch(removeFromCompare(item._id))}
											aria-label={`Remove ${item.name} from comparison`}
											className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
										>
											<X className="w-3 h-3" />
										</button>
									</div>
								);
							})}

							{/* Empty placeholder slots */}
							{[...Array(Math.max(0, 4 - compareItems.length))].map((_, idx) => (
								<div
									key={`empty-${idx}`}
									className="hidden sm:flex shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-dashed border-[#1E3A34]/20 items-center justify-center text-[#1E3A34]/40 text-[10px] text-center"
								>
									+ Slot
								</div>
							))}
						</div>

						{/* Action CTA */}
						<div className="flex items-center gap-2 w-full sm:w-auto">
							<Link
								to="/compare"
								className="flex-1 sm:flex-initial min-h-[44px] px-6 py-2.5 bg-[#D4AF37] hover:bg-[#bfa032] text-[#1E3A34] text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
							>
								<span>Compare Now ({compareItems.length})</span>
								<ArrowRight className="w-4 h-4" />
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
