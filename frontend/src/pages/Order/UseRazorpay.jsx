"use client";
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// -----------------Add By Pawan --------------------------------------------------------
import {
  trackPurchaseEvent,
  buildItemsFromOrder,
} from "../../utils/purchaseTracking";
// -----------------Add By Pawan -------------------------------------------------------
function UseRazorpay() {
	const location = useLocation();
	const navigate = useNavigate();
	const { order, razorpay } = location.state || {};
	const URL = import.meta.env.VITE_URL;
	const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

	// ✅ Prevent multiple checkout calls
	const isPaymentInitiated = useRef(false);

	useEffect(() => {
		if (order && !isPaymentInitiated.current) {
			isPaymentInitiated.current = true; // flag set
			loadRazorpay(order);
		}
	}, [order]);

	const loadRazorpay = (order) => {
		//console.log("ORDER", order);
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		script.onload = () => {
			// -----------------Add By Pawan --------------------------------------------------------
			const options = {
				key: RAZORPAY_KEY,
				amount: razorpay?.amount || order.totalAmount,
				currency: razorpay?.currency || "INR",
				name: "Gemrishi",
				description: "Complete your payment",
				order_id: razorpay?.orderId,
		  // -----------------Add By Pawan --------------------------------------------------------		
				handler: async function (response) {
					try {
						const userInfo = JSON.parse(localStorage.getItem("userInfo"));
						const verifyRes = await axios.post(
							`${URL}/order/verify-order`,
							{
								razorpayOrderId: response.razorpay_order_id,
								razorpayPaymentId: response.razorpay_payment_id,
								razorpaySignature: response.razorpay_signature,
							},
							{
								headers: {
									Authorization: `Bearer ${userInfo.token}`,
								},
							}
						);
//-----------------comment By Pawan ---------------------------------------------------------------
						// if (verifyRes.data) {
						// 	toast.success("Payment Successful!", { position: "top-center" });

						// 	// ✅ Redirect after 2s
						// 	setTimeout(() => {
						// 		navigate("/orders/and/purchases", { replace: true });
						// 	}, 2000);
						// } 
//-----------------comment By Pawan --------------------------------------------------------------
// //-----------------Add By Pawan ---------------------------------------------------------------
if (verifyRes.data) {
  toast.success("Payment Successful!", {
    position: "top-center",
  });
  trackPurchaseEvent({
    orderId: order.orderId,
    subtotal: order.totalAmount,
    items: buildItemsFromOrder(order),
  });
  // ----------------- End By Pawan --------------------------------------------------------

  // ✅ Redirect after 2s
  setTimeout(() => {
    navigate("/orders/and/purchases", { replace: true });
  }, 2000);
}
// //-----------------Add By Pawan-----------------------------------------------------------------
						else {
							toast.error("Payment verification failed!", {
								position: "top-center",
							});
							isPaymentInitiated.current = false; // allow retry
						}
					} catch (err) {
						console.error("Verification error:", err);
						toast.error("Payment verification failed!", {
							position: "top-center",
						});
						isPaymentInitiated.current = false; // allow retry
					}
				},
				prefill: {
					name: "User",
					email: "faizhussain05@gmail.com",
					contact: "6264332787",
				},
				theme: { color: "#264A3F" },
				modal: {
					ondismiss: () => {
						toast.info("Payment Cancelled!", { position: "top-center" });
						navigate("/payment/page", { replace: true });
					},
				},
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
		};
		document.body.appendChild(script);
	};

	return (
		<div className="w-full min-h-screen flex justify-center items-center">
			<p>Redirecting to Razorpay...</p>
		</div>
	);
}

export default UseRazorpay;