"use client";
import { useState, useEffect } from "react";
import OrderSummary from "./OrderSummary";
import ShoppingMap from "./ShoppingMap";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ReviewAndConfirmSkeleton = () => (
	<div className="w-full min-h-screen lg:min-h-[1070px] flex flex-col lg:flex-row animate-pulse">
		{/* Left Section Skeleton */}
		<div className="w-full lg:w-[77%] lg:border-r border-[#D2CFCF] lg:pt-10 p-4 sm:p-6 lg:p-10">
			{/* Steps Map Placeholder */}
			<div className="w-full max-w-[600px] h-8 bg-gray-300 rounded-md mb-8 mx-auto lg:mx-0"></div>

			{/* Content Placeholders */}
			<div className="w-full flex justify-center px-0 md:px-6">
				<div className="w-full max-w-[910px] space-y-8">
					{/* Order Summary Section */}
					<div className="w-full min-h-[160px] lg:h-[200px] flex flex-col lg:flex-row p-4 rounded-lg bg-white shadow-sm">
						<div className="w-full lg:w-[28%]">
							<div className="w-40 h-7 bg-gray-300 rounded mb-4"></div>{" "}
							{/* "Order Summary :" */}
						</div>
						<div className="w-full lg:w-[72%] space-y-3">
							<div className="flex">
								<div className="w-24 h-5 bg-gray-200 rounded"></div>
								<div className="w-32 h-5 bg-gray-100 rounded ml-2"></div>
							</div>
							<div className="flex">
								<div className="w-20 h-5 bg-gray-200 rounded"></div>
								<div className="w-24 h-5 bg-gray-100 rounded ml-2"></div>
							</div>
							<div className="flex">
								<div className="w-32 h-5 bg-gray-200 rounded"></div>
								<div className="w-28 h-5 bg-gray-100 rounded ml-2"></div>
							</div>
						</div>
					</div>

					{/* Shipping To Section */}
					<div className="w-full min-h-[160px] lg:h-[200px] flex flex-col lg:flex-row p-4 rounded-lg bg-white shadow-sm">
						<div className="w-full lg:w-[28%]">
							<div className="w-40 h-7 bg-gray-300 rounded mb-4"></div>{" "}
							{/* "Shipping To :" */}
						</div>
						<div className="w-full lg:w-[72%] space-y-3">
							{Array(5)
								.fill(0)
								.map((_, index) => (
									<div
										key={index}
										className="h-5 w-3/4 bg-gray-100 rounded"></div>
								))}
						</div>
					</div>
				</div>
			</div>

			{/* CTA Button Placeholder */}
			<div className="w-full h-[100px] md:h-[120px] flex items-center justify-center lg:justify-start lg:pl-10 mt-6">
				<div className="w-full max-w-[458px] h-[52px] md:h-[60px] bg-gray-400 rounded-[10px]"></div>
			</div>
		</div>

		<div className="w-full lg:w-[23%] p-4 lg:p-6 space-y-6 border-t lg:border-t-0 border-gray-200">
			{/* Header */}
			<div className="w-32 h-6 bg-gray-300 rounded"></div>

			{/* Product Lines */}
			{Array(3)
				.fill(0)
				.map((_, index) => (
					<div
						key={index}
						className="flex items-center space-x-4 py-2 border-b border-gray-100">
						<div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
						<div className="flex-grow space-y-1">
							<div className="h-4 w-3/4 bg-gray-200 rounded"></div>
							<div className="h-4 w-1/2 bg-gray-100 rounded"></div>
						</div>
						<div className="h-4 w-12 bg-gray-200 rounded"></div>
					</div>
				))}

			{/* Subtotal/Shipping */}
			<div className="pt-4 space-y-2">
				<div className="flex justify-between">
					<div className="h-4 w-20 bg-gray-200 rounded"></div>
					<div className="h-4 w-16 bg-gray-200 rounded"></div>
				</div>
				<div className="flex justify-between">
					<div className="h-4 w-24 bg-gray-200 rounded"></div>
					<div className="h-4 w-16 bg-gray-200 rounded"></div>
				</div>
			</div>

			{/* Total */}
			<div className="pt-4 flex justify-between font-bold border-t border-gray-300">
				<div className="h-6 w-24 bg-gray-300 rounded"></div>
				<div className="h-6 w-20 bg-gray-400 rounded"></div>
			</div>
		</div>
	</div>
);

// ====================================================================
// MAIN COMPONENT
// ====================================================================

function ReviewAndConfirm() {
	const [shippingDetails, setShippingDetails] = useState({
		address: {
			fullName: "",
			email: "",
			mobileNo: "",
			addressType: "",
			addressLine1: "",
			addressLine2: "",
			landmark: "",
			city: "",
			pinCode: "",
			district: "",
			state: "Andhra Pradesh",
			country: "India",
			note: "",
		},
	});
	const [cartData, setCartData] = useState([]);
	const [loading, setLoading] = useState(true);
	const URL = import.meta.env.VITE_URL;
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, []);

	const fetchOrderData = async () => {
		const userInfoString = localStorage.getItem("userInfo");
		const storedDetails = localStorage.getItem("shippingDetails");

		if (storedDetails) {
			try {
				setShippingDetails(JSON.parse(storedDetails));
			} catch (e) {
				console.warn("Could not parse shippingDetails from localStorage", e);
			}
		}

		let userToken = null;
		if (userInfoString) {
			try {
				const userInfo = JSON.parse(userInfoString);
				userToken = userInfo.token;
			} catch (e) {
				console.error("Failed to parse userInfo from localStorage", e);
			}
		}

		if (!userToken) {
			setLoading(false);
			return;
		}

		try {
			const response = await axios.get(
				`${URL}/cart/get_all_cart_list?page=1&limit=10`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${userToken}`,
					},
				}
			);

			if (response.data?.success && response.data?.cart) {
				setCartData(response.data.cart);
			}
		} catch (err) {
			console.error("Error fetching cart items:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrderData();
	}, []);

	// --- CHANGE APPLIED: Use 'totalPrice' from the cart item object ---
	const calculateTotal = () => {
		return cartData.reduce(
			// Use totalPrice which already includes customizations and quantity for the item
			(total, item) => total + (item.totalPrice || 0),
			0
		);
	};

	const formatPrice = (price) => {
		// Using "en-IN" locale for Indian Rupee format (crores, lakhs, etc.)
		return `₹ ${price?.toLocaleString("en-IN") || "0"}.00`;
	};

	const formattedDate = new Date().toLocaleDateString("en-IN", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Render the skeleton if loading is true
	if (loading) {
		return <ReviewAndConfirmSkeleton />;
	}

	return (
		<div className="w-full min-h-screen lg:min-h-[1070px] flex flex-col lg:flex-row">
			{/* Left Section */}
			<div className="w-full lg:w-[77%] lg:border-r border-[#D2CFCF] lg:pt-10">
				{/* Steps Map */}
				<ShoppingMap activeStep={2} />

				{/* Content */}
				<div className="w-full flex justify-center px-4 md:px-6">
					<div className="w-full max-w-[910px] h-auto lg:h-[500px] flex flex-col items-stretch lg:items-end justify-end gap-6">
						{/* Order Summary */}
						<div className="w-full min-h-[160px] lg:h-[200px] flex flex-col lg:flex-row">
							<div className="w-full lg:w-[28%]">
								<p className="text-[22px] md:text-[24px] lg:text-[26px]  text-[#264A3F]">
									Order Summary :
								</p>
							</div>
							<div className="w-full lg:w-[72%] mt-3 lg:mt-0">
								<div className="flex flex-col text-[18px] md:text-[20px] lg:text-[24px] ">
									<div className="flex">
										<p className="w-[130px] md:w-[160px] lg:w-[180px]">Date</p>
										<p className="text-[#666464]">: {formattedDate}</p>
									</div>
									<div className="flex">
										<p className="w-[130px] md:w-[160px] lg:w-[180px]">Items</p>
										<p className="text-[#666464]">
											: {cartData.length} Products
										</p>
									</div>
									<div className="flex">
										<p className="w-[130px] md:w-[160px] lg:w-[180px]">
											Total Amount
										</p>
										{/* --- CHANGE: Display total from calculateTotal which uses item.totalPrice --- */}
										<p className="text-[#666464] font-bold">
											: {formatPrice(calculateTotal())}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Shipping To */}
						<div className="w-full min-h-[160px] lg:h-[200px] flex flex-col lg:flex-row">
							<div className="w-full lg:w-[28%]">
								<p className="text-[22px] md:text-[24px] lg:text-[26px]  text-[#264A3F]">
									Shipping To :
								</p>
							</div>
							<div className="w-full lg:w-[72%] text-[#666464] text-[18px] md:text-[20px] lg:text-[24px] leading-[24px] md:leading-[26px] lg:leading-[28px] ">
								<p>{shippingDetails.address.fullName}</p>
								<p>{shippingDetails.address.email}</p>
								<p>
									{shippingDetails.address.addressLine1}
									{shippingDetails.address.addressLine2
										? `, ${shippingDetails.address.addressLine2}`
										: ""}
								</p>
								<p>
									{shippingDetails.address.city},{" "}
									{shippingDetails.address.district}
								</p>
								<p>
									{shippingDetails.address.state},{" "}
									{shippingDetails.address.country} -{" "}
									{shippingDetails.address.pinCode}
								</p>
								<p>Mobile: {shippingDetails.address.mobileNo}</p>

							</div>
						</div>
					</div>
				</div>

				{/* CTA */}
				<div className="w-full h-[100px] md:h-[120px] lg:pl-70 px-4 flex items-center">
					<button
						onClick={() => navigate("/payment/page", { state: { productId: location?.state?.productId } })}
						className="w-full max-w-[458px] h-[52px] md:h-[60px] text-[18px] md:text-[20px] text-[#FFFFFF] bg-[#264A3F] rounded-[10px] cursor-pointer">
						Confirm &amp; Proceed
					</button>
				</div>
			</div>

			{/* Right Section */}
			<OrderSummary />
		</div>
	);
}

export default ReviewAndConfirm;
