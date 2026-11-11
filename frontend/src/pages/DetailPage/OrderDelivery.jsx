"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UploadIcon from "../../assets/DetailPage/Upload.svg";
import Truck from "../../assets/DetailPage/Truck.svg";
import RingIcon from "../../assets/DetailPage/RingP.svg";
import PendantIcon from "../../assets/DetailPage/PendantP.svg";
import BraceletIcon from "../../assets/DetailPage/BraceletP.svg";
import CartModal from "./CartModal";
import { useJewelryByFilter } from "../../hooks/useJewelryByFilter";
import { useSingleJewelry } from "../../hooks/useSingleJewelery";
import { getLatestMetalRates } from "../../api/metalRates";
// ===== Add by Pawan For Meta Pixel =====
import { fbqTrack } from "../../utils/metaPixel";
// ===== End Add by Pawan For Meta Pixel =====

const getUserToken = () => {
	const userInfoString = localStorage.getItem("userInfo");
	if (!userInfoString) return null;
	try {
		return JSON.parse(userInfoString)?.token || null;
	} catch {
		return null;
	}
};

const URL = import.meta.env.VITE_URL;

function OrderDelivery({ slug }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// States
	const [selectedCategory, setSelectedCategory] = useState("Ring");
	const [customImage, setCustomImage] = useState(null);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [selectedMetal, setSelectedMetal] = useState("");
	const [selectedQuality, setSelectedQuality] = useState("");
	const [selectedSizeSystem, setSelectedSizeSystem] = useState("");
	const [selectedSize, setSelectedSize] = useState("");
	const [calculatedPrice, setCalculatedPrice] = useState(0);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [isCartModalOpen, setIsCartModalOpen] = useState(false);
	const [cartItems, setCartItems] = useState([]);
	const [metalRates, setMetalRates] = useState(null);
	const [selectedGemstoneValue, setSelectedGemstoneValue] = useState("");
	const [certificate, setCertificate] = useState("");
	const [selectedPurity, setSelectedPurity] = useState("");
	const [selectedDiamondSubstitute, setSelectedDiamondSubstitute] =
		useState("");
	const [loading1, setLoading1] = useState("");
	const [productData, setProductData] = useState(null);
	const [error1, setError1] = useState("");

	const fetchMetalRates = async () => {
		try {
			const rates = await getLatestMetalRates();
			setMetalRates(rates);
		} catch (error) {
			console.error("Error fetching metal rates:", error);
		}
	};

	// console.log("slug", slug);

	useEffect(() => {
		fetchMetalRates();
	}, []);

	useEffect(() => {
		const fetchProductData = async () => {
			try {
				setLoading1(true);
				setError1(null);

				const response = await axios.get(
					`${URL}/product/single-gemstone/${slug}`
				);
				// console.log("res of prod", response);

				let fetchedData =
					response.data.data || response.data.product || response.data;
				if (Array.isArray(fetchedData) && fetchedData.length > 0) {
					fetchedData = fetchedData[0];
				}

				if (fetchedData && (fetchedData.name || fetchedData._id)) {
					setProductData(fetchedData);

					// We use _id/type for state management but the name/type for display/payload
					const freeCert = fetchedData.certificate?.find(
						(cert) =>
							(cert.type || cert.name || "").toLowerCase().includes("free") ||
							cert.price === 0
					);

					const initialCert =
						freeCert || (fetchedData.certificate && fetchedData.certificate[0]);
				} else {
					setError1("No product data found in API response.");
				}
			} catch (err) {
				console.error("Fetch error:", err);
				const status = err.response?.status;
				if (status === 404) {
					setError1(`Product not found for slug: ${slug}`);
				} else if (status === 500) {
					setError1("Server error - please try again later.");
				} else {
					setError1(
						`Failed to load product data: ${err.message || "Network error"}`
					);
				}
			} finally {
				setLoading1(false);
			}
		};

		fetchProductData();
	}, [slug, URL]);

	// console.log("prod data in orde", productData);

	// Handle custom image upload
	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) setCustomImage(URL.createObjectURL(file));
	};

	// console.log("metalra", metalRates);

	// 🧮 Price Calculation
	const calculateTotalPrice = () => {
		if (!selectedProduct || !metalRates) return;

		let basePrice = selectedProduct.jewelryPrice || 0;
		let total = basePrice;

		// ✅ Extract metal type (e.g., "gold", "silver")
		const selectedMetalKey = selectedMetal?.toLowerCase();
		// console.log("selectedmetal", selectedMetal);
		const productMetalKey = selectedProduct.metal?.toLowerCase();
		// console.log("prod metal", productMetalKey);

		let selectedRate = 1;
		let productRate = 1;

		// ✅ Handle gold variants
		if (selectedMetalKey?.includes("gold")) {
			if (selectedMetalKey.includes("18")) {
				selectedRate = metalRates.gold.gold18k.withGSTRate;
			} else if (selectedMetalKey.includes("22")) {
				selectedRate = metalRates.gold.gold22k.withGSTRate;
			} else {
				selectedRate = metalRates.gold.gold24k.withGSTRate;
			}
		} else if (selectedMetalKey === "silver") {
			selectedRate = metalRates.silver.withGSTRate;
		} else if (selectedMetalKey === "platinum") {
			selectedRate = metalRates.platinum.withGSTRate;
		} else if (selectedMetalKey === "panchadhatu") {
			selectedRate = metalRates.panchadhatu.withGSTRate;
		}

		// ✅ Product base metal (for conversion ratio)
		if (productMetalKey?.includes("gold")) {
			if (productMetalKey.includes("18")) {
				productRate = metalRates.gold.gold18k.withGSTRate;
			} else if (productMetalKey.includes("22")) {
				productRate = metalRates.gold.gold22k.withGSTRate;
			} else {
				productRate = metalRates.gold.gold24k.withGSTRate;
			}
		} else if (productMetalKey === "silver") {
			productRate = metalRates.silver.withGSTRate;
		} else if (productMetalKey === "platinum") {
			productRate = metalRates.platinum.withGSTRate;
		} else if (productMetalKey === "panchadhatu") {
			productRate = metalRates.panchadhatu.withGSTRate;
		}

		// ✅ Calculate conversion factor
		const factor = selectedRate / productRate;
		total *= factor;

		setCalculatedPrice(Math.round(total));
	};

	// console.log("calc", calculatedPrice);

	useEffect(() => {
		calculateTotalPrice();
	}, [selectedProduct, selectedMetal, metalRates]);

	const [totalPrice, setTotalPrice] = useState(null);
	// console.log("prod", selectedProduct);

	// 🛒 Add to Cart
	// -------------------- Add By Pawan For Buy Now (START) --------------------
	const handleAddToCart = async (buyNow = false) => {
	// -------------------- Add By Pawan For Buy Now (END) --------------------
		// const userToken = getUserToken();
		// if (!userToken) {
		// 	toast.warn("Please log in to add items to the cart.", {
		// 		position: "top-center",
		// 	});
		// 	return;
		// }

		if (!selectedProduct?._id) {
			toast.error("Select a product first.", { position: "top-center" });
			return;
		}

		setIsAddingToCart(true);

		try {
			const customization = {
				metal: selectedMetal || selectedProduct.metal,
				sizeSystem: selectedSizeSystem || null,
				size: selectedSize || null,
				quality: selectedQuality || null,
				totalPrice,
				gemstoneWeight: selectedGemstoneValue
					? {
						weight: parseFloat(selectedGemstoneValue.split(" ")[0]),
						price: parseFloat(selectedGemstoneValue.split("₹")[1]),
					}
					: null,
				diamondSubstitute: selectedDiamondSubstitute
					? {
						type: selectedDiamondSubstitute.split(" - ₹ ")[0],
						price: parseFloat(selectedDiamondSubstitute.split("₹")[1]),
					}
					: null,
				certificate: certificate
					? {
						certificateType: certificate.split(" - ₹ ")[0],
						price: parseFloat(certificate.split("₹")[1]),
					}
					: null,
				goldKarat: {
					karatType: selectedMetal,
					price:
						metalRates?.gold?.[selectedMetal1]?.withGSTRate *
						selectedProduct.jewelryMetalWeight,
				},
			};

			const payload = {
				itemId: selectedProduct._id,
				quantity: 1,
				customization, // <-- send directly, no stringify
			};

			// console.log("🧾 Payload sent:", payload);

			const userToken = getUserToken();

			const config = {
				withCredentials: true,
			};

			if (userToken) {
				config.headers = {
					Authorization: `Bearer ${userToken}`,
				};
			}

			const atcEventId = `add_to_cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
			const enrichedPayload = { ...payload, eventId: atcEventId };
			const res = await axios.post(
				`${URL}/cart/add_item_in_cart`,
				enrichedPayload,
				config
			);

			if (res.data.success) {
				toast.success("Item added to cart successfully!", {
					position: "top-center",
				});

				// ===== Add by Pawan For Meta Pixel =====
				fbqTrack(
					"AddToCart",
					{
						content_ids: [String(selectedProduct.sku || selectedProduct._id)],
						content_type: "product",
						content_name: selectedProduct.name || selectedProduct.jewelryName || "",
						value: totalPrice || 0,
						currency: "INR",
					},
					{ eventID: atcEventId }
				);
				// ===== End Add by Pawan For Meta Pixel =====

				// -------------------- Add By Pawan For Buy Now (START) --------------------
				if (buyNow === true) {
					navigate("/shopping/cart", { state: { autoCashfree: true } });
				} else {
					setTimeout(() => navigate("/shopping/cart"), 800);
				}
				// -------------------- Add By Pawan For Buy Now (END) --------------------
			} else {
				toast.error(res.data.message || "Failed to add item", {
					position: "top-center",
				});
			}
		} catch (err) {
			console.error("Error adding item to cart:", err);
			toast.error("Something went wrong. Please try again later.", {
				position: "top-center",
			});
		} finally {
			setIsAddingToCart(false);
		}
	};

	// Sidebar Filter List
	const sidebarFilters = [
		{ label: "Ring", icon: RingIcon },
		{ label: "Pendant", icon: PendantIcon },
		{ label: "Bracelet", icon: BraceletIcon },
		{ label: "Necklace", icon: BraceletIcon },
		{ label: "Earrings", icon: BraceletIcon },
	];

	const [selectedMetal1, setSelectedMetal1] = useState("");
	// console.log("total", totalPrice);

	const size = {
		Size_system: [
			"Indian Ring Size System",
			"US Ring Size System",
			"UK/Australia Ring Size System",
			"Europe Ring Size System",
		],
		Size_number: Array.from({ length: 19 }, (_, i) => i + 1),
		Quality: [
			{ label: "Gold 18K", value: "gold18k", base: "gold" },
			{ label: "Gold 22K", value: "gold22k", base: "gold" },
			{ label: "Silver", value: "silver", base: "silver" },
			{ label: "Platinum", value: "platinum", base: "platinum" },
			{ label: "Panchadhatu", value: "panchadhatu", base: "panchadhatu" },
		],
	};

	const selectedMetalObj = size.Quality.find((m) => m.value === selectedMetal);
	const baseMetal = selectedMetalObj?.base || selectedMetal; // e.g. "gold"

	const filters = useMemo(() => {
		if (!productData || !productData.subCategory?._id) {
			return {
				limit: 12,
				jewelryType: selectedCategory,
				metal: baseMetal,
				productSubCategory: "", // temporary placeholder until data loads
			};
		}

		return {
			limit: 12,
			jewelryType: selectedCategory,
			metal: baseMetal,
			productSubCategory: productData.subCategory._id,
		};
	}, [selectedCategory, baseMetal, productData]);

	const { data, loading, error } = useJewelryByFilter(filters);

	if (loading1) return <p>Loading....</p>;

	return (
		<div className="w-full min-h-screen flex flex-col px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 py-10">
			{/* Title */}
			<div className="mb-10 text-center lg:text-left">
				<h2 className="text-xl sm:text-2xl lg:text-[26px] font-semibold text-[#264A3F]">
					Select for Ring / Pendant / Bracelets / Necklace / Earrings
				</h2>
				<p className="text-gray-500 text-sm mt-1">
					Choose a category or upload your custom design.
				</p>
			</div>

			{/* Main Layout */}
			<div className="flex flex-col lg:flex-row gap-10">
				{/* LEFT SIDEBAR FILTERS */}
				<div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 w-full lg:w-[160px]">
					{sidebarFilters.map((item) => (
						<div
							key={item.label}
							onClick={() => setSelectedCategory(item.label)}
							className={`min-w-[100px] lg:w-full h-[100px] border rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${selectedCategory === item.label
									? "border-[#20A079] bg-green-50 shadow-lg scale-105"
									: "border-gray-200 hover:shadow-md hover:-translate-y-[2px]"
								}`}>
							<img
								src={item.icon}
								alt={item.label}
								className="w-6 h-6 object-contain mb-2"
							/>
							<p className="text-[13px] font-medium text-gray-800">
								{item.label}
							</p>
						</div>
					))}

					{/* Upload Design Filter */}
					{/* <div className="min-w-[120px] lg:w-full h-[160px] border border-gray-200 shadow-md hover:shadow-xl transition rounded-2xl flex flex-col items-center justify-center bg-white hover:-translate-y-[2px]">
						<label
							htmlFor="upload"
							className="cursor-pointer flex flex-col items-center">
							<img
								src={customImage || UploadIcon}
								alt="Upload"
								className="w-12 h-12 object-contain mb-2"
							/>
							<input
								type="file"
								id="upload"
								accept="image/*"
								onChange={handleImageUpload}
								className="hidden"
							/>
							<p className="text-[12px] text-[#1F1FB7] text-center">
								Upload your design
							</p>
							<p className="text-[11px] text-gray-600 mt-1">
								Customized ₹28,100
							</p>
						</label>
					</div> */}
				</div>

				{/* RIGHT MAIN CONTENT */}
				<div className="flex-1 space-y-10">
					{/* Metal Selector */}
					<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50 p-4 rounded-xl">
						<div className="flex flex-col sm:flex-row items-center gap-4">
							<label className="text-lg font-medium text-gray-700">
								Metal Type:
							</label>
							<select
								value={selectedMetal}
								onChange={(e) => {
									setSelectedMetal(e.target.value),
										setSelectedMetal1(e.target.value),
										setSelectedProduct(null);
								}}
								className="w-full sm:w-[250px] lg:w-[320px] h-[45px] border rounded-lg border-gray-300 px-4 text-gray-700 focus:ring-2 focus:ring-[#264A3F] outline-none">
								<option value="">Select Metal</option>
								{size.Quality.map((metal) => (
									<option key={metal.value} value={metal.value}>
										{metal.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Product Grid */}
					{loading ? (
						<p className="text-center text-gray-500 py-10 animate-pulse">
							Loading jewelry...
						</p>
					) : data?.jeweleries?.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
							{data.jeweleries.map((item, index) => (
								<div
									key={item._id}
									onClick={() => {
										setSelectedProduct({ ...item, index });
										setTotalPrice(
											item.jewelryPrice ||
											(metalRates?.gold?.[selectedMetal1]?.withGSTRate *
												item.jewelryMetalWeight || 0)
										);
									}}
									className={`p-4 shadow-md bg-white rounded-xl flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${selectedProduct?.index === index
											? "border-2 border-[#20A079] bg-green-50"
											: "hover:shadow-lg hover:-translate-y-[2px]"
										}`}>
									<img
										src={item.images?.[0]?.url || "/placeholder.svg"}
										alt={item.jewelryName}
										className="w-[90px] h-[90px] object-contain mb-3"
									/>
									<p className="text-sm font-semibold">
										{item.jewelryName || "Unnamed"}
									</p>
									<p className="text-xs text-gray-600">{item.jewelryType}</p>
									<p className="text-sm text-gray-800 font-medium mt-1">
										₹
										{(
											item.jewelryPrice ||
											(metalRates?.gold?.[selectedMetal1]?.withGSTRate *
												item.jewelryMetalWeight || 0)
										)
											.toFixed(2)
											.toLocaleString("en-IN")}
									</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-center text-gray-500">
							No jewelry found for selected type.
						</p>
					)}

					{/* Add to Cart Section */}
					{selectedProduct && (
						<div className="space-y-8 mt-10 border-t border-gray-200 pt-6">
							{/* Selection Filters */}
							<div className="flex flex-wrap justify-center lg:justify-between gap-6">
								{/* Gemstone Weight */}
								{selectedProduct?.gemstoneWeight?.length > 0 && (
									<div className="flex flex-col sm:flex-row items-center gap-2">
										<p className="text-sm text-gray-700 font-medium">
											Gemstone Weight:
										</p>
										<select
											value={selectedGemstoneValue}
											onChange={(e) => setSelectedGemstoneValue(e.target.value)}
											className="w-[200px] h-[40px] rounded-lg border border-gray-300 px-3 text-gray-700 focus:ring-2 focus:ring-[#264A3F] outline-none">
											<option value="">Select</option>
											{selectedProduct.gemstoneWeight.map((g, index) => (
												<option
													key={index}
													value={`${g.weight} ct ₹${g.price}`}>
													{g.weight} ct — ₹{g.price}
												</option>
											))}
										</select>
									</div>
								)}

								{/* Diamond Substitute */}
								{selectedProduct?.isDiamondSubstitute &&
									selectedProduct?.diamondSubstitute?.length > 0 && (
										<div className="flex flex-col sm:flex-row items-center gap-2">
											<p className="text-sm text-gray-700 font-medium">
												Diamond Substitute:
											</p>
											<select
												value={selectedDiamondSubstitute}
												onChange={(e) =>
													setSelectedDiamondSubstitute(e.target.value)
												}
												className="w-[220px] h-[40px] rounded-lg border border-gray-300 px-3 text-gray-700 focus:ring-2 focus:ring-[#264A3F] outline-none">
												<option value="">Select</option>
												{selectedProduct.diamondSubstitute.map((d, index) => (
													<option
														key={index}
														value={`${d.name} - ₹ ${d.price}`}>
														{d.name} — ₹{d.price}
													</option>
												))}
											</select>
										</div>
									)}

								{/* Certificate */}
								{selectedProduct?.certificate?.length > 0 && (
									<div className="flex flex-col sm:flex-row items-center gap-2">
										<p className="text-sm text-gray-700 font-medium">
											Certificate:
										</p>
										<select
											value={certificate}
											onChange={(e) => setCertificate(e.target.value)}
											className="w-[220px] h-[40px] rounded-lg border border-gray-300 px-3 text-gray-700 focus:ring-2 focus:ring-[#264A3F] outline-none">
											<option value="">Select</option>
											{selectedProduct.certificate.map((c, index) => (
												<option
													key={index}
													value={`${c.certificateType} - ₹ ${c.price}`}>
													{c.certificateType} — ₹{c.price}
												</option>
											))}
										</select>
									</div>
								)}

								{/* Gold Purity */}
							</div>

							{/* Add to Cart Button + Delivery */}
							<div className="flex flex-col items-center gap-3">
								<button
									disabled={isAddingToCart}
									onClick={() => handleAddToCart()} // Add By Pawan For Buy Now: wrapped so click event is not passed as buyNow
									className="w-full sm:w-[400px] lg:w-[580px] h-[60px] bg-[#264A3F] text-white text-lg font-semibold rounded-lg hover:bg-[#1b342c] transition">
									{isAddingToCart ? "Adding..." : "Add to Cart"}
								</button>

								{/* -------------------- Add By Pawan For Buy Now (START) -------------------- */}
								<button
									disabled={isAddingToCart}
									onClick={() => handleAddToCart(true)}
									className="w-full sm:w-[400px] lg:w-[580px] h-[60px] bg-white text-[#264A3F] border-2 border-[#264A3F] text-lg font-semibold rounded-lg hover:bg-[#264A3F] hover:text-white transition disabled:opacity-50">
									Buy Now
								</button>
								{/* -------------------- Add By Pawan For Buy Now (END) -------------------- */}

								<div className="flex items-center justify-center gap-2 text-gray-700 text-sm sm:text-base">
									<img src={Truck} alt="Truck" className="w-5 h-5" />
									<p>
										Estimated Delivery: {new Date().toLocaleDateString()} –
										{new Date(
											Date.now() + 5 * 24 * 60 * 60 * 1000
										).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<CartModal
				isOpen={isCartModalOpen}
				onClose={() => setIsCartModalOpen(false)}
				cartItems={cartItems}
			/>
		</div>
	);
}

export default OrderDelivery;