import React, { useState, useEffect } from "react";
import {
  FaCreditCard,
  FaGlobe,
  FaMobileAlt,
  FaMoneyBillWave,
} from "react-icons/fa"; // Added FaMoneyBillWave for COD
import {
  useGetCartQuery,
  useRetailerOrderMutation,
  useVerifyRetailerOrderMutation,
} from "../features/api/apiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Function to load Razorpay script dynamically
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const PaymentOptions = () => {
  const [selected, setSelected] = useState("online");
  const navigate = useNavigate();
  const razorPayKeyId = import.meta.env.VITE_RAZOR_PAY_KEY_ID;

  const { data: cart } = useGetCartQuery();
  // Retrieve address string from localStorage
  const addressString = localStorage.getItem("shippingDetails");

  // Parse the address to a JS object for easier access (optional but good practice)
  let address = {};
  try {
    address = JSON.parse(addressString);
  } catch (e) {
    console.error("Error parsing shipping details from localStorage:", e);
  }

  // Log the string for debugging as you were doing

  // useRetailerOrderMutation is assumed to create the order and return Razorpay keys
  const [crateOrder, { isLoading }] = useRetailerOrderMutation();
  const [verifyPayment] = useVerifyRetailerOrderMutation();

  // The handler for starting the payment process
  const handleProceedToPay = async () => {
    if (selected === "cod") {
      try {
        await crateOrder({
          address: address, // Send the raw string or parsed object, depending on your API
          paymentMethod: "cod",
        }).unwrap();

        toast.success("Order placed successfully with Cash on Delivery!");

        navigate("/retailer/orders");
      } catch (error) {
        toast.error(
          error?.data?.message ||
            error?.data?.msg ||
            "Failed to place COD order."
        );
      }
    } else if (selected === "online") {
      // --- ONLINE PAYMENT (RAZORPAY) LOGIC ---
      await initiateRazorpayPayment();
    }
  };

  const initiateRazorpayPayment = async () => {
    // 1. Load Razorpay Script
    const res = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you offline?");
      return;
    }

    try {
      // 2. Call API to create Razorpay Order (This should return razorpay_order_id, amount, currency)
      // The unwrap() call returns the fulfillment value from the promise, which is your API response data.
      const orderDetails = await crateOrder({
        address: address,
        paymentMethod: "razorpay",
      }).unwrap();

      // 3. Configure Razorpay Options
      const options = {
        key: razorPayKeyId, // YOUR RAZORPAY KEY ID (must come from your API for security)
        amount: orderDetails.data.amount, // Amount in paise/cents
        currency: orderDetails.data.currency,
        name: "Gemrishi",
        description: "Retailer Order Payment",
        order_id: orderDetails.data.id,
        handler: async function (response) {
          // For now, let's assume success
          if (!response.razorpay_signature) {
            toast.error("Payment not completed.");
            return;
          }

          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).unwrap();

            toast.success("Payment successfull!");
            navigate("/retailer/orders");
          } catch (err) {
            toast.error("Payment not verified. Stock unchanged.");
            console.error("Verification failed", err);
          }
        },
        prefill: {
          // Pre-fill user details from your formData/address object
          name: address.fullName,
          email: address.email,
          contact: address.mobileNo,
        },
        notes: {
          // Optional notes for your internal records
          shipping_address_type: address.addressType,
          retailer_order_id: orderDetails.order.retailerId,
        },
        theme: {
          color: "#264A3F", // Your brand color
        },
      };

      // 4. Open Razorpay Popup
      const rzp1 = new window.Razorpay(options);

      rzp1.on("payment.failed", function (response) {
        toast.error("Payment failed. Please try again.");
        console.error("Payment Failed:", response.error);
        // Optionally log the failure reason to your backend
      });

      rzp1.open();
    } catch (error) {
      console.error("Error during order creation or Razorpay process:", error);
      toast.error(
        error?.data?.message ||
          error?.data?.msg ||
          "Failed to initiate online payment."
      );
    }
  };

  // console.log("cart in payment", cart) // Kept for debugging reference

  return (
    <div className="w-ful mx-auto p-6 ">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Payment Options
      </h2>

      {/* Online Payment Option */}
      <div
        className={`border rounded-xl p-4 mb-3 cursor-pointer transition-all ${
          selected === "online"
            ? "border-green-600 bg-green-50"
            : "border-gray-300 bg-white"
        }`}
        onClick={() => setSelected("online")}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected === "online" ? "border-green-600" : "border-gray-400"
            }`}
          >
            {selected === "online" && (
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            )}
          </div>
          <p className="font-medium text-gray-800">Online Payment</p>
        </div>

        {selected === "online" && (
          <div className="ml-8 space-y-2 text-gray-700">
            <div className="flex items-center gap-2">
              <FaMobileAlt className="text-blue-600" />
              <span>UPI</span>
            </div>
            <div className="flex items-center gap-2">
              <FaGlobe className="text-blue-600" />
              <span>Netbanking</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCreditCard className="text-blue-600" />
              <span>Credit & Debit Card</span>
            </div>
          </div>
        )}
      </div>

      {/* Cash on Delivery Option */}
      <div
        className={`border rounded-xl p-4 cursor-pointer transition-all ${
          selected === "cod"
            ? "border-green-600 bg-green-50"
            : "border-gray-300 bg-white"
        }`}
        onClick={() => setSelected("cod")}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected === "cod" ? "border-green-600" : "border-gray-400"
            }`}
          >
            {selected === "cod" && (
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            )}
          </div>
          <p className="font-medium text-gray-800">Cash on Delivery</p>
        </div>
        {selected === "cod" && (
          <p className="ml-8 mt-2 text-sm text-gray-500 flex items-center gap-1">
            <FaMoneyBillWave className="text-green-700" /> Pay with cash upon
            delivery.
          </p>
        )}
      </div>

      {/* Proceed Button */}
      <button
        className="w-full mt-6 py-3 bg-[#264A3F] hover:bg-[#1e3a31] text-white font-semibold rounded-lg transition-all disabled:opacity-50"
        onClick={handleProceedToPay}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : `Proceed to pay`}
      </button>
    </div>
  );
};

export default PaymentOptions;
