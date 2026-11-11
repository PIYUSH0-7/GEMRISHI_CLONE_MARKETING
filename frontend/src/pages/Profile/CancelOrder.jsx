
"use client";
import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaClock, FaCreditCard } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure toastify CSS is imported

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to format amount
const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(amount);
};

// --- Skeletal Loading Component (Unchanged) ---
const CancelOrderSkeleton = () => (
    <div className="flex justify-center py-20 bg-gray-100">
        <div className="w-[1146px] border border-gray-300 rounded-[20px] p-16 bg-white shadow-lg animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center pb-8 border-b border-gray-200">
                <div className="h-8 w-8 bg-gray-300 rounded-full mr-6"></div>
                <div className="space-y-2 w-full">
                    <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>

            {/* Order Details Skeleton */}
            <div className="mt-10 space-y-4">
                <div className="h-6 bg-gray-300 rounded w-1/5"></div>
                <div className="bg-gray-100 p-8 rounded-xl border border-gray-200 space-y-4">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="flex justify-between items-center text-lg">
                            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Refund Information Skeleton */}
            <div className="mt-10 space-y-4">
                <div className="h-6 bg-gray-300 rounded w-1/5"></div>
                <div className="bg-gray-100 p-8 rounded-xl border border-gray-200 space-y-4">
                    {[...Array(2)].map((_, index) => (
                        <div key={index} className="flex items-center text-lg">
                            <div className="h-6 w-6 bg-gray-300 rounded-full mr-4"></div>
                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reason for cancellation Skeleton */}
            <div className="mt-10 space-y-4">
                <div className="h-6 bg-gray-300 rounded w-2/5"></div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex items-center">
                            <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                            <div className="ml-3 h-5 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional Comments Skeleton */}
            <div className="mt-10 space-y-4">
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="w-full h-32 bg-gray-200 rounded-xl"></div>
            </div>

            {/* Buttons Skeleton */}
            <div className="mt-12 flex justify-end space-x-6">
                <div className="px-8 py-4 h-12 w-32 bg-gray-300 rounded-xl"></div>
                <div className="px-8 py-4 h-12 w-32 bg-red-400 rounded-xl"></div>
            </div>
        </div>
    </div>
);
// --- End Skeletal Loading Component ---

// --- Confirmation Component for Toastify ---
const CancellationConfirmToast = ({ closeToast, onConfirm, orderId }) => (
    <div className="p-2">
        <p className="font-bold text-lg text-gray-800">
            Confirm Cancellation
        </p>
        <p className="mt-2 text-gray-700">
            Are you sure you want to cancel order <span className="font-mono text-sm text-red-600 break-all">{orderId}</span>?
            This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end space-x-3">
            <button
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150 text-sm"
                onClick={closeToast}
            >
                No, Keep Order
            </button>
            <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 text-sm font-semibold"
                onClick={() => {
                    onConfirm();
                    closeToast();
                }}
            >
                Yes, Cancel Order
            </button>
        </div>
    </div>
);
// --- End Confirmation Component ---

function CancelOrder() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [selectedReason, setSelectedReason] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancellationComments, setCancellationComments] = useState("");

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, []);

    // ... (Order Fetching useEffect remains the same)
    useEffect(() => {
        const fetchOrderDetails = async () => {
            const URL = import.meta.env.VITE_URL;
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
                setError("Please log in to view order details.");
                return;
            }

            try {
                const response = await axios.get(
                    `${URL}/order/get-single-order/${orderId}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${userToken}`,
                        },
                    }
                );
                if (response.data) {
                    setOrder(response.data.order);
                } else {
                    setError(response.data?.message || "Failed to fetch order details.");
                    toast.error(
                        response.data?.message || "Failed to fetch order details."
                    );
                }
            } catch (err) {
                console.error(
                    "Error fetching order details:",
                    err.response?.data || err.message
                );
                setError("An error occurred while fetching order details.");
                toast.error("An error occurred while fetching order details.");
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        } else {
            setLoading(false);
            setError("No order ID provided.");
        }
    }, [orderId]);


    const handleReasonChange = (reason) => {
        setSelectedReason(reason);
    };

    // New function to handle the actual API call (moved out of main button handler)
    const executeCancellation = async () => {
        const URL = import.meta.env.VITE_URL;
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
            toast.error("You are not logged in.");
            return;
        }

        try {
            const response = await axios.put(
							`${URL}/order/cancel_order`,
							{
								orderStatus: "Cancelled",
								paymentStatus: "Cancelled",
								orderId: orderId,
								// itemId: order?.items?.[0]?._id,
								reason: selectedReason,
								comments: cancellationComments,
							},
							{
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${userToken}`,
								},
							}
						);
            if (response.data) {
                toast.success("Order has been successfully cancelled!");
                setTimeout(() => {
                    navigate("/orders/and/purchases");
                }, 3000);
            } else {
                toast.error(response.data?.message || "Failed to cancel the order.");
            }
        } catch (err) {
            console.error(
                "Error cancelling order:",
                err.response?.data || err.message
            );
            toast.error(
                err.response?.data?.message ||
                    "An error occurred while cancelling the order."
            );
        }
    };

    // Updated main button handler to show confirmation toast
    const handleCancelOrder = () => {
        if (!selectedReason) {
            toast.warn("Please select a reason for cancellation.", { position: "top-center" });
            return;
        }

        toast(<CancellationConfirmToast onConfirm={executeCancellation} orderId={orderId} />, {
            position: "top-center",
            autoClose: false, // Keep toast open until user interacts
            closeOnClick: false,
            draggable: false,
            type: "warning", // Use warning type for styling
            className: "bg-white border-l-4 border-red-500 shadow-xl", // Custom styling
        });
    };

    const reasons = [
        "Changed my mind",
        "Found a better price elsewhere",
        "Ordered by mistake",
        "Delivery time is too long",
        "Payment issues",
        "Other reason",
    ];

    if (loading) {
        return <CancelOrderSkeleton />;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const product = order?.items?.[0]?.productId;

    return (
        <div className="flex justify-center py-20 bg-gray-100">
            <div className="w-[1146px] border border-[#264A3F] rounded-[20px] p-16 bg-white shadow-lg">
                {/* Header */}
                <div className="flex items-center pb-8 border-b border-gray-200">
                    <FaExclamationTriangle className="text-red-500 text-3xl mr-6" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Cancel Order</h1>
                        <p className="text-base text-gray-500 mt-2">
                            Are you sure you want to cancel this order? This action cannot be
                            undone.
                        </p>
                    </div>
                </div>

                {/* Order Details */}
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                        Order Details
                    </h2>
                    <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center text-lg mb-4">
                            <span className="font-medium text-gray-600">Order ID :</span>
                            <span className="font-bold text-gray-800">
                                {order?._id || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-lg mb-4">
                            <span className="font-medium text-gray-600">Product :</span>
                            <span className="text-gray-800">{product?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg mb-4">
                            <span className="font-medium text-gray-600">Amount :</span>
                            <span className="text-gray-800">
                                {formatAmount(order?.totalAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-medium text-gray-600">Order Date :</span>
                            <span className="text-gray-800">
                                {formatDate(order?.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Refund Information */}
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                        Refund Information
                    </h2>
                    <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                        <div className="flex items-center text-lg mb-4">
                            <FaClock className="text-blue-500 text-xl mr-4" />
                            <span className="text-gray-700">
                                Full refund will be processed within{" "}
                                <span className="font-medium">1-3 business days</span>
                            </span>
                        </div>
                        <div className="flex items-center text-lg">
                            <FaCreditCard className="text-blue-500 text-xl mr-4" />
                            <span className="text-gray-700">
                                Amount will be credited to your original payment method
                            </span>
                        </div>
                    </div>
                </div>

                {/* Reason for cancellation */}
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                        Please select a reason for cancellation
                    </h2>
                    <div className="space-y-4">
                        {reasons.map((reason) => (
                            <label
                                key={reason}
                                className="flex items-center cursor-pointer text-lg">
                                <input
                                    type="radio"
                                    name="cancellationReason"
                                    className="form-radio h-5 w-5 text-blue-600 accent-blue-600"
                                    checked={selectedReason === reason}
                                    onChange={() => handleReasonChange(reason)}
                                />
                                <span className="ml-3 text-gray-700">{reason}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Additional Comments */}
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                        Additional Comments (Optional)
                    </h2>
                    <textarea
                        className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        placeholder="Please provide additional details"
                        value={cancellationComments}
                        onChange={(e) =>
                            setCancellationComments(e.target.value)
                        }></textarea>
                </div>

                {/* Buttons */}
                <div className="mt-12 flex justify-end space-x-6">
                    <button
                        className="px-8 py-4 border border-gray-300 rounded-xl text-gray-700 font-semibold text-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-200"
                        onClick={() => navigate("/orders/and/purchases")}>
                        Keep order
                    </button>
                    <button
                        className="px-8 py-4 bg-red-500 text-white font-semibold text-xl rounded-xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                        onClick={handleCancelOrder}>
                        Cancel order
                    </button>
                </div>
            </div>
            {/* ToastContainer position is set to top-center */}
        </div>
    );
}

export default CancelOrder;