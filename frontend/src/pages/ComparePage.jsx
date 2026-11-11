import axios from "axios";
import {
	ArrowRight,
	Loader2,
	Play,
	Scale,
	ShieldCheck,
	ShoppingBag,
	SlidersHorizontal,
	Trash2,
	X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { addItemToCart } from "../api/addtocart";
import Price from "../components/Price";
import WishlistButton from "../components/wishlistButton";
import VideoModal from "../components/models/VideoModal";
import { addItemToCart as addToCartAction } from "../redux/cartSlice";
import {
	clearCompare,
	removeFromCompare,
} from "../redux/compareSlice";
import { getProductImage } from "../utils/imageUtils";
import { getProductUrl } from "../utils/productUrl";

const API_URL = import.meta.env.VITE_URL || "http://localhost:7788/api/v1";

export default function ComparePage() {
	const dispatch = useDispatch();
	const compareItems = useSelector((state) => state.compare?.items || []);
	const [highlightDifferences, setHighlightDifferences] = useState(false);
	const [addingId, setAddingId] = useState(null);
	const [selectedVideo, setSelectedVideo] = useState(null);
	const [showVideoModal, setShowVideoModal] = useState(false);

	// Real backend data fetched from database
	const [backendDocs, setBackendDocs] = useState({});
	const [loadingBackend, setLoadingBackend] = useState(false);

	// Fetch real data from backend for each compared product
	useEffect(() => {
		if (compareItems.length === 0) return;

		let isMounted = true;
		const fetchRealData = async () => {
			setLoadingBackend(true);
			const docs = {};

			await Promise.all(
				compareItems.map(async (item) => {
					const id = item._id || item.id;
					if (!id) return;

					try {
						const res = await axios.get(`${API_URL}/product/single-product/${id}`);
						const data = res.data?.product || res.data?.jewelry || res.data?.data;
						if (data) {
							docs[id] = {
								...data,
								itemType: res.data?.itemType || (data.jewelryName ? "Jewelry" : "Gemstone"),
							};
						}
					} catch (err) {
						console.warn(`Could not fetch live backend data for ${id}:`, err.message);
					}
				})
			);

			if (isMounted) {
				setBackendDocs(docs);
				setLoadingBackend(false);
			}
		};

		fetchRealData();

		return () => {
			isMounted = false;
		};
	}, [compareItems]);

	const handleAddToCart = async (item) => {
		const targetId = item._id || item.id;
		if (!targetId) return;
		setAddingId(targetId);

		try {
			const payload = {
				itemId: targetId,
				quantity: 1,
				customization: JSON.stringify({}),
			};

			const response = await addItemToCart(payload);
			if (response?.success !== false) {
				dispatch(addToCartAction({ itemId: targetId, quantity: 1, item }));
				toast.success(`"${item.name || item.title}" added to cart!`);
			} else {
				toast.error(response?.message || "Failed to add to cart");
			}
		} catch (err) {
			console.error("Compare add to cart error:", err);
			toast.error("Failed to add to cart");
		} finally {
			setAddingId(null);
		}
	};

	// Helper to extract Carat or Gram weight from real backend document
	const extractWeight = (doc) => {
		if (!doc) return "Custom Specification";
		if (doc.gemstoneWeight?.weight) {
			return `${doc.gemstoneWeight.weight} Carats`;
		}
		const name = doc.name || doc.jewelryName || "";
		const caratMatch = name.match(/(\d+(?:\.\d+)?)\s*(?:carat|ct|ratti)/i);
		if (caratMatch) {
			return `${caratMatch[1]} Carats`;
		}
		if (doc.jewelryMetalWeight) {
			return `${doc.jewelryMetalWeight}g (${doc.metal ? doc.metal.toUpperCase() : "Handcrafted"})`;
		}
		return "Natural Specification";
	};

	// Helper to extract Lab Certifications from real backend document
	const extractCertificates = (doc) => {
		if (!doc) return "Certified Lab Authenticated";
		if (Array.isArray(doc.certificate) && doc.certificate.length > 0) {
			return doc.certificate.map((c) => c.certificateType || c.name || "Certified").join(" • ");
		}
		if (doc.certificate?.certificateType) {
			return doc.certificate.certificateType;
		}
		return "Free Lab Certificate (IGI / IIGJ / GII Available)";
	};

	// Comparison Attribute definitions reading live backend data
	const attributes = [
		{
			id: "category",
			label: "Category / Type",
			getValue: (doc) =>
				doc.category?.name ||
				(doc.jewelryName ? "Fine Jewellery" : "Natural Astrological Gemstone"),
		},
		{
			id: "origin",
			label: "Origin / Geographic Mine",
			getValue: (doc) => doc.origin || "Certified Mine Source",
		},
		{
			id: "weight",
			label: "Weight / Carat Specification",
			getValue: (doc) => extractWeight(doc),
		},
		{
			id: "shape",
			label: "Cut & Shape",
			getValue: (doc) => doc.shape || doc.cut || "Natural Faceted / Precision Cut",
		},
		{
			id: "treatment",
			label: "Authenticity & Treatment",
			getValue: () => "100% Natural, Unheated & Untreated",
		},
		{
			id: "certificate",
			label: "Lab Certification",
			getValue: (doc) => extractCertificates(doc),
		},
		{
			id: "metal",
			label: "Metal & Handcrafted Mount",
			getValue: (doc) =>
				doc.metal
					? `${doc.metal.toUpperCase()} (${doc.jewelryMetalWeight ? `${doc.jewelryMetalWeight}g` : "Handcrafted"})`
					: "Loose Natural Gemstone",
		},
		{
			id: "sku",
			label: "Authenticity SKU",
			getValue: (doc) => doc.sku || "Certified Authentic",
		},
		{
			id: "stock",
			label: "Availability",
			getValue: (doc) =>
				doc.isAvailable !== false ? "In Stock (Dispatches in 24-48 Hours)" : "Made to Order",
		},
		{
			id: "shipping",
			label: "Insured Worldwide Shipping",
			getValue: () => "Free Insured Transit (All Over India & Global)",
		},
		{
			id: "returns",
			label: "Return Policy",
			getValue: () => "10-Day No-Hassle Return Guarantee",
		},
	];

	// Helper to determine if an attribute differs across compared items
	const isDifferent = (getter) => {
		if (compareItems.length <= 1) return false;
		const values = compareItems.map((item) => {
			const real = backendDocs[item._id] || item;
			return String(getter(real) || "").toLowerCase().trim();
		});
		return values.some((val) => val !== values[0]);
	};

	return (
		<div className="min-h-screen bg-[#FAF9F6] py-8 sm:py-12">
			<div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
				{/* Top Header Row */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-gray-200 gap-4">
					<div>
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
							<Scale className="w-4 h-4 text-[#D4AF37]" />
							<span>Side-by-Side Analysis</span>
							{loadingBackend && (
								<span className="flex items-center gap-1 text-[11px] font-medium text-gray-500 normal-case ml-2">
									<Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E3A34]" />
									Syncing live backend data...
								</span>
							)}
						</div>
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#111827]">
							Compare Gemstones & Jewellery
							{compareItems.length > 0 && (
								<span className="text-sm font-sans font-normal text-gray-500 ml-3">
									({compareItems.length} of 4 selected)
								</span>
							)}
						</h1>
					</div>

					{/* Header Actions */}
					{compareItems.length > 0 && (
						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={() => setHighlightDifferences(!highlightDifferences)}
								className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${
									highlightDifferences
										? "bg-[#1E3A34] text-white border-[#1E3A34] shadow-xs"
										: "bg-white text-gray-700 hover:text-[#1E3A34] border-gray-300 hover:border-gray-400"
								}`}
							>
								<SlidersHorizontal className="w-4 h-4" />
								<span>Highlight Differences</span>
							</button>

							<button
								type="button"
								onClick={() => dispatch(clearCompare())}
								className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 bg-white transition-all cursor-pointer"
								title="Clear comparison"
							>
								<Trash2 className="w-4 h-4" />
								<span>Clear All</span>
							</button>
						</div>
					)}
				</div>

				{/* Empty State */}
				{compareItems.length === 0 ? (
					<div className="max-w-xl mx-auto py-16 px-6 text-center bg-white rounded-3xl border border-gray-100 shadow-sm my-8">
						<div className="w-20 h-20 mx-auto rounded-full bg-[#1E3A34]/5 flex items-center justify-center text-[#1E3A34] mb-6">
							<Scale className="w-10 h-10 stroke-[1.5]" />
						</div>
						<h2 className="text-2xl font-serif font-bold text-[#111827] mb-2">
							No Items in Comparison
						</h2>
						<p className="text-gray-600 text-sm mb-8 leading-relaxed">
							Select up to 4 certified natural gemstones or handcrafted jewellery pieces
							to analyze their carat weight, origin, cut, clarity, lab certification,
							and live calculated rates side by side.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Link
								to="/gemstone"
								className="min-h-[44px] px-6 py-3 bg-[#1E3A34] hover:bg-[#162c27] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
							>
								<span>Browse Natural Gemstones</span>
								<ArrowRight className="w-4 h-4" />
							</Link>
							<Link
								to="/jewellery"
								className="min-h-[44px] px-6 py-3 border border-gray-300 hover:border-[#1E3A34] text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center"
							>
								Browse Jewellery
							</Link>
						</div>
					</div>
				) : (
					/* Comparison Matrix Table */
					<div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
						<div className="overflow-x-auto scrollbar-thin">
							<table className="w-full border-collapse min-w-[700px]">
								<thead>
									{/* Product Header Cards */}
									<tr className="border-b border-gray-200">
										<th className="w-48 sm:w-56 p-4 sm:p-6 text-left align-top bg-gray-50/70 border-r border-gray-100">
											<div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
												Database Verified
											</div>
											<div className="font-serif font-bold text-lg text-[#111827]">
												Live Matrix ({compareItems.length})
											</div>
											<p className="text-xs text-gray-500 font-normal mt-1 leading-relaxed">
												Real-time specs fetched from GemRishi MongoDB database.
											</p>
											{compareItems.length < 4 && (
												<Link
													to="/gemstone"
													className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A34] hover:text-[#D4AF37] mt-4 transition-colors"
												>
													<span>+ Add another item</span>
												</Link>
											)}
										</th>

										{compareItems.map((item) => {
											const realDoc = backendDocs[item._id] || item;
											const imgSrc = getProductImage(realDoc, "/placeholder.svg");
											const productUrl = getProductUrl(realDoc);
											const title = realDoc.name || realDoc.jewelryName || "Certified Gemstone";
											const price = realDoc.sellPrice || realDoc.price || realDoc.jewelryPrice || 0;

											return (
												<th
													key={item._id}
													className="p-4 sm:p-6 align-top text-left border-r border-gray-100 last:border-r-0 relative min-w-[240px] max-w-[300px]"
												>
													{/* Action Buttons (top right: Wishlist, Video, Remove) */}
													<div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
														<WishlistButton
															itemId={item._id}
															itemType={realDoc.jewelryName ? "Jewelry" : "Product"}
															product={realDoc}
														/>
														{realDoc.videos && realDoc.videos.length > 0 && (
															<button
																type="button"
																onClick={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	const vid = realDoc.videos[0];
																	const rawUrl = typeof vid === "string" ? vid : vid?.url || vid?.videoUrl || vid?.secure_url;
																	setSelectedVideo(rawUrl);
																	setShowVideoModal(true);
																}}
																aria-label="Play video"
																title="Watch Video"
																className="w-8 h-8 sm:w-9 sm:h-9 min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] rounded-full border border-gray-100 bg-white/90 backdrop-blur-xs hover:bg-white text-gray-600 hover:text-[#1E3A34] flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md"
															>
																<Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 ml-0.5" />
															</button>
														)}
														<button
															type="button"
															onClick={() => dispatch(removeFromCompare(item._id))}
															aria-label={`Remove ${title} from comparison`}
															title="Remove from comparison"
															className="w-8 h-8 sm:w-9 sm:h-9 min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] rounded-full bg-white/90 backdrop-blur-xs hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-100 flex items-center justify-center transition-colors shadow-sm cursor-pointer hover:shadow-md"
														>
															<X className="w-4 h-4" />
														</button>
													</div>

													{/* Product Image */}
													<Link
														to={productUrl}
														className="block relative aspect-square rounded-[16px] overflow-hidden bg-white border border-gray-100 mb-4 group p-2 flex items-center justify-center"
													>
														<img
															src={imgSrc}
															alt={title}
															loading="lazy"
															className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
															onError={(e) => {
																e.currentTarget.src = "/placeholder.svg";
															}}
														/>
													</Link>

													{/* SKU */}
													{realDoc.sku && (
														<span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1 text-center">
															SKU: {realDoc.sku}
														</span>
													)}

													{/* Title */}
													<Link to={productUrl} className="block group">
														<h3 className="text-sm sm:text-[15px] font-bold text-center text-[#0B1D3A] line-clamp-2 leading-snug break-words mb-2">
															{title}
														</h3>
													</Link>

													{/* Origin Badge */}
													{realDoc.origin && (
														<div className="flex justify-center mb-2">
															<span className="bg-gray-50 text-gray-500 text-[10px] sm:text-xs px-2.5 py-1 rounded-md border border-gray-100 text-center">
																Origin: {realDoc.origin}
															</span>
														</div>
													)}

													{/* Live Converted Price */}
													<div className="text-sm sm:text-base font-bold text-[#264A3F] text-center mb-4">
														<Price amount={price} />
													</div>

													{/* Quick Actions */}
													<div className="flex flex-col gap-2">
														<button
															type="button"
															onClick={() => handleAddToCart(realDoc)}
															disabled={addingId === item._id || realDoc.isAvailable === false}
															className="w-full min-h-[40px] px-4 py-2 bg-[#1E3A34] hover:bg-[#162c27] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
														>
															<ShoppingBag className="w-4 h-4" />
															<span>
																{addingId === item._id ? "Adding..." : "Add to Cart"}
															</span>
														</button>
													</div>
												</th>
											);
										})}

										{/* Empty Column Placeholders if fewer than 4 */}
										{[...Array(Math.max(0, 4 - compareItems.length))].map((_, idx) => (
											<th
												key={`empty-col-${idx}`}
												className="p-6 align-middle text-center border-r border-gray-100 last:border-r-0 min-w-[200px] max-w-[280px] bg-gray-50/30"
											>
												<div className="flex flex-col items-center justify-center py-12 text-gray-300">
													<div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
														<Scale className="w-5 h-5 text-gray-300" />
													</div>
													<span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
														Add to Compare
													</span>
													<Link
														to="/gemstone"
														className="text-xs font-bold text-[#1E3A34] hover:underline"
													>
														Select Item
													</Link>
												</div>
											</th>
										))}
									</tr>
								</thead>

								{/* Specification Attribute Rows */}
								<tbody>
									{attributes.map((attr, index) => {
										const differs = isDifferent(attr.getValue);
										const rowBg = highlightDifferences && differs
											? "bg-[#D4AF37]/10 font-semibold"
											: index % 2 === 0
											? "bg-white"
											: "bg-gray-50/50";

										return (
											<tr
												key={attr.id}
												className={`border-b border-gray-100 transition-colors ${rowBg}`}
											>
												{/* Attribute Label Column */}
												<td className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-gray-500 border-r border-gray-100 bg-gray-50/70">
													<div className="flex items-center gap-1.5">
														<span>{attr.label}</span>
														{differs && (
															<span
																className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
																title="Values differ"
															/>
														)}
													</div>
												</td>

												{/* Value for each compared item */}
												{compareItems.map((item) => {
													const realDoc = backendDocs[item._id] || item;
													const val = attr.getValue(realDoc);

													return (
														<td
															key={`${item._id}-${attr.id}`}
															className="p-4 sm:p-5 text-sm text-[#111827] border-r border-gray-100 last:border-r-0"
														>
															<div className="flex items-center gap-2">
																{attr.id === "stock" && (
																	<span
																		className={`w-2 h-2 rounded-full ${
																			realDoc.isAvailable !== false ? "bg-green-500" : "bg-orange-500"
																		}`}
																	/>
																)}
																{attr.id === "treatment" && (
																	<ShieldCheck className="w-4 h-4 text-[#1E3A34] shrink-0" />
																)}
																<span>{val}</span>
															</div>
														</td>
													);
												})}

												{/* Empty space filler cells */}
												{[...Array(Math.max(0, 4 - compareItems.length))].map((_, idx) => (
													<td
														key={`empty-cell-${attr.id}-${idx}`}
														className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0 bg-gray-50/20 text-center text-xs text-gray-300"
													>
														—
													</td>
												))}
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
				{/* Video Modal for Comparison */}
				{selectedVideo && (
					<VideoModal
						isOpen={showVideoModal}
						onClose={() => {
							setShowVideoModal(false);
							setSelectedVideo(null);
						}}
						videoUrl={selectedVideo}
					/>
				)}
			</div>
		</div>
	);
}