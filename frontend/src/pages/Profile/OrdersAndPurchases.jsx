"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FeedbackModal from "./FeedbackModal";
import { getProductUrl } from "../../utils/productUrl";

// --- React Icons Import ---
import { FaShoppingBag } from "react-icons/fa";
// Agar aapko dusra icon pasand hai, toh yeh use kar sakte hain:
// import { IoBagHandleOutline } from "react-icons/io5";

// --- Existing Local Imports ---
import BlueSapphire from "../../assets/Stone/BlueSapphire.svg";
import YellowSapphire from "../../assets/Stone/YellowSapphire.svg";
import ShareReview from "../../assets/Profile/ShareReview.svg";
// ShoppingBagIcon ka import ab zaroori nahi hai

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//{{server}}/reviewRating/add_review_rating for review rating

const OrderCardSkeleton = () => (
	<div className="w-full h-auto border border-gray-200 rounded-[20px] flex flex-col lg:flex-row mb-6 animate-pulse p-4">
		<div className="w-full lg:w-[23%] h-auto flex justify-center lg:justify-end py-4 lg:py-0">
			<div className="w-[200px] sm:w-[224px] h-[180px] sm:h-[198px] bg-gray-300 rounded-lg lg:mt-11 flex items-center justify-center"></div>
		</div>
		<div className="w-full lg:w-[77%] h-auto px-4 lg:px-0">
			<div className="w-full h-auto flex flex-col sm:flex-row justify-between items-start sm:items-center lg:mt-11 gap-4 sm:gap-0">
				<div className="h-6 bg-gray-300 rounded w-1/3 lg:pl-14"></div>
				<div className="h-11 w-full sm:w-[186px] bg-gray-200 rounded-[10px] lg:mr-14"></div>
			</div>
			<div className="w-full h-auto mt-4 lg:mt-0">
				<div className="w-full lg:w-[680px] h-auto lg:h-[180px] lg:ml-14 space-y-3 pt-3">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="flex flex-col sm:flex-row">
							<div className="w-24 h-4 bg-gray-200 rounded my-1"></div>
							<div className="w-3/4 sm:w-1/2 h-4 bg-gray-200 rounded my-1 sm:ml-4"></div>
						</div>
					))}
				</div>
			</div>
			<div className="w-full h-auto flex justify-center mt-6 lg:mt-8 pb-4 lg:pb-0">
				<div className="w-full sm:w-[682px] h-[55px] bg-gray-300 rounded-[10px] lg:mb-4"></div>
			</div>
		</div>
	</div>
);

const OrdersAndPurchasesSkeleton = () => (
	<div className="w-full h-auto lg:min-h-[970px] px-4 sm:px-8 lg:px-30">
		<div className="w-full h-[80px] lg:h-[100px] flex items-end">
			<div className="h-8 bg-gray-300 rounded w-60 mb-3"></div>
		</div>
		<OrderCardSkeleton />
		<div className="w-full h-[60px] lg:h-[80px] flex items-center mt-8">
			<div className="h-8 bg-gray-300 rounded w-52 mb-3"></div>
		</div>
		<OrderCardSkeleton />
		<div className="w-full h-[60px] lg:h-[80px] flex items-center mt-8">
			<div className="h-8 bg-gray-300 rounded w-60 mb-3"></div>
		</div>
		<OrderCardSkeleton />
	</div>
);

const formatDate = (dateString) => {
	const options = { year: "numeric", month: "long", day: "numeric" };
	return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatAmount = (amount) => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		minimumFractionDigits: 2,
	}).format(amount);
};

const NoOrdersYet = ({ navigate }) => (
	<div className="w-full min-h-[50vh] flex flex-col justify-center items-center text-center p-4">
		{/* React Icon FaShoppingBag used here */}
		<FaShoppingBag
			className="w-20 h-20 text-[#264A3F] mb-4 opacity-70"
			aria-label="Empty shopping cart"
		/>
		<h2 className="text-2xl font-bold text-[#0B1D3A] mb-2">
			No Orders Placed Yet!
		</h2>
		<p className="text-gray-600 mb-6 max-w-md">
			It looks like you haven't placed any orders. Start exploring our premium
			gemstone collection.
		</p>
		<button
			onClick={() => navigate("/")}
			className="bg-[#264A3F] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#204238] transition-colors shadow-md">
			Start Shopping Now
		</button>
	</div>
);

// ====================================================================
// Main OrdersAndPurchases Component
// ====================================================================

function OrdersAndPurchases() {
	const [showModal, setShowModal] = useState(false);
	const [selectedProductId, setSelectedProductId] = useState(null);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isLoggedOut, setIsLoggedOut] = useState(false);
	const [error, setError] = useState(null);

	const [activeTab, setActiveTab] = useState("current");

	const navigate = useNavigate();
	const URL = import.meta.env.VITE_URL;

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, []);

	useEffect(() => {
		const fetchOrders = async () => {
			const userInfoString = localStorage.getItem("userInfo");
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
				setError("Please log in to view your orders.");
				setIsLoggedOut(true);
				return;
			}

			try {
				const response = await axios.get(`${URL}/order/user-orders`, {
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${userToken}`,
					},
				});
				// console.log("response", response);

				if (response.data && Array.isArray(response.data.orders)) {
					const sortedOrders = response.data.orders.sort(
						(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
					);
					setOrders(sortedOrders);
				} else {
					setOrders([]);
				}

				setError(null);
			} catch (err) {
				// Hiding all API errors to show the empty state instead
				console.error(
					"Error fetching orders (Treated as empty list for user):",
					err.response?.data || err.message
				);

				setError(null);
				setOrders([]);
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, [URL]);

	const formatKarat = (value) => {
		const map = {
			gold24k: "24 Karat Gold",
			gold22k: "22 Karat Gold",
			gold18k: "18 Karat Gold",
		};

		return map[value] || "N/A";
	};


	const handleSendReviewClick = (productId) => {
		setSelectedProductId(productId);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedProductId(null);
	};

	if (loading) {
		return <OrdersAndPurchasesSkeleton />;
	}

	// ********** CHECK 1: Handle Login Error **********
	if (error && isLoggedOut) {
		return (
			<div className="w-full min-h-screen flex flex-col justify-center items-center text-center p-4">
				<p className="text-red-500 font-bold mb-4 text-xl">{error}</p>

				<button
					onClick={() => navigate("/login")}
					className="bg-[#264A3F] text-white px-4 py-2 rounded-lg text-md hover:bg-[#204238] transition-colors">
					Go to Login
				</button>
			</div>
		);
	}

	// ********** CHECK 2: Handle No Orders at all **********
	if (orders.length === 0) {
		return (
			<div className="w-full h-auto px-4 sm:px-8 lg:px-30">
				<h1 className="text-3xl sm:text-4xl lg:text-[40px] text-[#0B1D3A] font-bold pt-6 pb-2">
					Your Orders & Purchases
				</h1>
				<NoOrdersYet navigate={navigate} />
			</div>
		);
	}
	// *************************************************************

	// --- Order Filtering Logic (Only runs if orders.length > 0) ---
	const currentOrders = orders.filter((order) =>
		["Pending", "InProgress"].includes(order.orderStatus)
	);
	const completedOrders = orders.filter(
		(order) => order.orderStatus === "Completed"
	);
	const canceledOrders = orders.filter(
		(order) => order.orderStatus === "Cancelled"
	);

	const getOrdersForActiveTab = () => {
		switch (activeTab) {
			case "current":
				return currentOrders;
			case "completed":
				return completedOrders;
			case "cancelled":
				return canceledOrders;
			default:
				return [];
		}
	};

	const getEmptyMessage = () => {
		switch (activeTab) {
			case "current":
				return "You have no active orders. Check back after placing a new order.";
			case "completed":
				return "No past completed orders found. Once your order is delivered, it will appear here.";
			case "cancelled":
				return "No past cancelled orders found. Any cancelled orders will be listed here.";
			default:
				return "No orders found for this category.";
		}
	};

	const ordersToDisplay = getOrdersForActiveTab();
	const renderOrderCard = (order) => {
		return order.items.map((item, index) => {
			const product = item?.productId;
			const jewelry = item?.jewelryId;
			const customJewelry = item?.customization?.jewelryId;
			// console.log("Rendering order item:", { product, jewelry, customJewelry });

			// --- 3-WAY TYPE DETECTION ---
			const isPureGemstone = !!product && !jewelry && !customJewelry;
			const isPureJewelry = !product && !!jewelry && !customJewelry;
			const isGemstoneWithSetting = !!product && !!customJewelry;


			const statusClass =
				order.orderStatus === "Completed"
					? "bg-gray-100 border-gray-400 text-gray-600"
					: order.orderStatus === "Cancelled"
						? "bg-red-100 border-red-400 text-red-600"
						: "bg-[#01A6734D] border-[#20A079] text-[#1E8465]";

			// UI BLOCK WRAPPER for all 3 types
			const CardWrapper = ({ children }) => (
				<div
					key={`${order._id}-${index}`}
					className="w-full rounded-[20px] flex flex-col lg:flex-row mb-6 overflow-hidden shadow-sm">
					{children}
				</div>
			);

			// ============================
			// CASE 1 — PURE GEMSTONE
			// ============================
			if (isPureGemstone) {
				return (
					<CardWrapper>
						{/* IMAGE */}
						<div className="w-full lg:w-[23%] flex justify-center lg:justify-end p-4">
							<div
								className="w-[200px] h-[180px] rounded-lg border overflow-hidden cursor-pointer"
								onClick={() => {
									navigate(getProductUrl(product));
								}}>
								<img
									src={product.images?.[0]?.url}
									alt={product.name}
									className="w-full h-full object-cover"
									onError={(e) =>
									(e.currentTarget.src =
										"https://via.placeholder.com/200x180?text=No+Image")
									}
								/>
							</div>
						</div>

						{/* DETAILS */}
						<div className="w-full px-6 py-4 flex flex-col gap-3">
							{/* Title + Status */}
							<div className="flex justify-between">
								<h2
									className="text-2xl font-semibold text-[#264A3F] cursor-pointer"
									onClick={() => {
										navigate(getProductUrl(product));
									}}>
									{product.name}
								</h2>
								<span className={`px-2 py-2 border rounded-lg ${statusClass}`}>
									{order.orderStatus}
								</span>
							</div>

							{/* Info */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-10">
								<p>
									<b>Order ID:</b> {order.orderId}
								</p>
								<p>
									<b>Type:</b> Gemstone
								</p>
								<p>
									<b>Carat:</b> {product.carat}
								</p>

								<p>
									<b>Certificate:</b>{" "}
									{item.customization?.certificate?.certificateType || "N/A"}
								</p>

								<p>
									<b>Total Amount:</b> {formatAmount(order.totalAmount)}
								</p>
								<p>
									<b>Order Date:</b> {order.createdAt ? formatDate(order.createdAt) : "N/A"}
								</p>
							</div>

							{/* Review Button */}
							{order.orderStatus === "Completed" && (
								<button
									className="bg-[#E7B50E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ba8f04]"
									onClick={() => handleSendReviewClick(product?._id)}>
									Write Review
								</button>
							)}
							{["Pending", "InProgress"].includes(order.orderStatus) && (
								<button
									onClick={() => navigate(`/cancel/order/${order._id}`)}
									className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 w-fit mt-4">
									Cancel Order
								</button>
							)}
						</div>
					</CardWrapper>
				);
			}

			// ============================
			// CASE 2 — PURE JEWELRY
			// ============================
			if (isPureJewelry) {
				return (
					<CardWrapper>
						{/* IMAGE */}
						<div className="w-full lg:w-[23%] flex justify-center lg:justify-end p-4">
							<div
								className="w-[200px] h-[180px] rounded-lg border overflow-hidden cursor-pointer"
								onClick={() => {
									navigate(getProductUrl(jewelry));
								}}>
								<img
									src={jewelry.images?.[0]?.url}
									alt={jewelry.jewelryName}
									className="w-full h-full object-cover"
								/>
							</div>
						</div>

						{/* DETAILS */}
						<div className="w-full px-6 py-4 flex flex-col gap-3">
							<div className="flex justify-between">
								<h2
									className="text-2xl font-semibold text-[#264A3F] cursor-pointer"
									onClick={() => {
										navigate(getProductUrl(jewelry));
									}}>
									{jewelry.jewelryName}
								</h2>
								<span className={`px-2 py-2 border rounded-lg ${statusClass}`}>
									{order.orderStatus}
								</span>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-10">
								<p>
									<b>Order ID:</b> {order.orderId}
								</p>
								<p>
									<b>Type:</b> Jewelry
								</p>
								<p>
									<b>Gold Karat:</b> {item.customization?.goldKarat?.karatType}
								</p>
								<p>
									<b>Gemstone Weight:</b>{" "}
									{item.customization?.gemstoneWeight?.weight || "N/A"} ct
								</p>
								{item.customization?.quality?.qualityType && (
									<p>
										<b>Gemstone Quality:</b>{" "}
										{item.customization.quality.qualityType}
									</p>
								)}
								<p>
									<b>Certificate:</b>{" "}
									{item.customization?.certificate?.certificateType || "N/A"}
								</p>
								<p>
									<b>Total Amount:</b> {formatAmount(order.totalAmount)}
								</p>
								<p>
									<b>Order Date:</b> {order.createdAt ? formatDate(order.createdAt) : "N/A"}
								</p>
							</div>
							{order.orderStatus === "Completed" && (
								<button
									className="bg-[#E7B50E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ba8f04]"
									onClick={() => handleSendReviewClick(jewelry?._id)}>
									Write Review
								</button>
							)}
							{["Pending", "InProgress"].includes(order.orderStatus) && (
								<button
									onClick={() => navigate(`/cancel/order/${order._id}`)}
									className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 w-fit mt-4">
									Cancel Order
								</button>
							)}
						</div>
					</CardWrapper>
				);
			}

			// ============================
			// CASE 3 — GEMSTONE + JEWELRY SETTING
			// ============================
			if (isGemstoneWithSetting) {
				return (
					<CardWrapper>
						{/* MAIN JEWELRY IMAGE */}
						<div className="w-full lg:w-[23%] flex justify-center lg:justify-end p-4">
							<div
								className="w-[200px] h-[180px] rounded-lg border overflow-hidden"
								onClick={() => {
									navigate(getProductUrl(jewelry));
								}}>
								<img
									src={customJewelry.images?.[0]?.url}
									alt={customJewelry.jewelryName}
									className="w-full h-full object-cover"
								/>
							</div>
						</div>

						{/* DETAILS */}
						<div className="w-full px-6 py-4 flex flex-col gap-3">
							<div className="flex justify-between">
								<h2 className="text-2xl font-semibold text-[#264A3F]">
									{customJewelry.jewelryName}
								</h2>
								<span className={`px-2 py-2 border rounded-lg ${statusClass}`}>
									{order.orderStatus}
								</span>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-10">
								<p>
									<b>Order ID:</b> {order.orderId}
								</p>
								<p>
									<b>Type:</b> Custom Jewelry (with Gemstone)
								</p>

								<p>
									<b>Gold Karat:</b> {formatKarat(item.customization?.goldKarat?.karatType)}
								</p>

								{/*
                <p>
                  <b>Gemstone Weight:</b>{" "}
                  {item.customization?.gemstoneWeight?.weight || "N/A"} ct
                </p> */}

								<p>
									<b>Certificate:</b>{" "}
									{item.customization?.certificate?.certificateType || "N/A"}
								</p>

								<p>
									<b>Total Amount:</b> {formatAmount(order.totalAmount)}
								</p>
								<p>
									<b>Order Date:</b> {order.createdAt ? formatDate(order.createdAt) : "N/A"}
								</p>
							</div>

							{/* GEMSTONE SECTION (SECONDARY CARD) */}
							<div className="mt-4 rounded-lg p-3 bg-gray-50">
								<h3 className="font-semibold mb-2">
									Attached Gemstone Details
								</h3>
								<div className="flex gap-4">
									<img
										src={product.images?.[0]?.url}
										alt={product.name}
										className="w-20 h-20 rounded-md object-cover"
									/>
									<div>
										<p>
											<b>Name:</b> {product.name}
										</p>
										<p>
											<b>Carat:</b> {product.carat}
										</p>
									</div>
								</div>
							</div>
							{order.orderStatus === "Completed" && (
								<button
									className="bg-[#E7B50E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ba8f04]"
									onClick={() => handleSendReviewClick(product?._id)}>
									Write Review
								</button>
							)}
							{["Pending", "InProgress"].includes(order.orderStatus) && (
								<button
									onClick={() => navigate(`/cancel/order/${order._id}`)}
									className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 w-fit mt-4">
									Cancel Order
								</button>
							)}
						</div>
					</CardWrapper>
				);
			}
		});
	};

	const TabButton = ({ tab, label, count }) => {
		const isActive = activeTab === tab;
		return (
			<button
				onClick={() => setActiveTab(tab)}
				className={`flex-1 text-center py-3 sm:py-4 transition-all duration-300 border-b-2 font-semibold text-lg sm:text-xl
                    ${isActive
						? "border-[#264A3F] text-[#264A3F] shadow-sm"
						: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
					}
                `}>
				{label} <span className="font-normal">({count})</span>
			</button>
		);
	};

	return (
		<>
			<div className="w-full h-auto lg:min-h-[970px] px-4 sm:px-8 lg:px-30">
				{/* Main Heading */}
				<h1 className="text-3xl sm:text-4xl lg:text-[40px] text-[#0B1D3A] font-bold pt-6 pb-2">
					Your Orders & Purchases
				</h1>

				{/* --- Tab Navigation (Filter Bar) --- */}
				<div className="w-full flex justify-around border-b border-gray-200 mb-8 bg-white sticky top-0 z-10 shadow-sm">
					<TabButton
						tab="current"
						label="Current Orders"
						count={currentOrders.length}
					/>
					<TabButton
						tab="completed"
						label="Order History"
						count={completedOrders.length}
					/>
					<TabButton
						tab="cancelled"
						label="Cancelled Orders"
						count={canceledOrders.length}
					/>
				</div>
				{/* --- End Tab Navigation --- */}

				{/* --- Content Area --- */}
				<div className="pt-4">
					{ordersToDisplay.length > 0 ? (
						ordersToDisplay.flatMap((order) => renderOrderCard(order))
					) : (
						<div className="w-full border border-dashed border-gray-400 p-8 rounded-xl text-center text-gray-500 mt-10">
							<svg
								className="w-16 h-16 mx-auto mb-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9.663 17h4.673M12 3v18"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 19h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2z"
								/>
							</svg>
							<p className="text-xl font-semibold mb-1">
								Nothing in{" "}
								{activeTab === "current"
									? "Progress"
									: activeTab === "completed"
										? "History"
										: "Cancelled"}
								!
							</p>
							<p className="text-md">{getEmptyMessage()}</p>
						</div>
					)}
				</div>

				{/* --- End Content Area --- */}
			</div>

			{/* Feedback Modal */}
			<FeedbackModal
				isOpen={showModal}
				onClose={handleCloseModal}
				productId={selectedProductId}
			/>
		</>
	);
}

export default OrdersAndPurchases;