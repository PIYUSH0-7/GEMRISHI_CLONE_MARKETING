"use client";

import { useState } from "react";
import { useForgotPassword } from "./ForgotPasswordContext";

const ArrowBackIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round">
		<path d="m12 19-7-7 7-7" />
		<path d="M19 12H5" />
	</svg>
);

const CloseIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round">
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</svg>
);

// Email Validation Logic (अलग फ़ंक्शन में)
const validateEmail = (email) => {
	if (!email.trim()) return "Email is required";
	if (/\s/.test(email)) return "Email must not contain spaces";
	// Regex: सुनिश्चित करता है कि @ और . सही ढंग से मौजूद हैं
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
	if (!emailRegex.test(email))
		return "Please enter a valid email address format.";
	return "";
};

export default function Email({ onBack, onClose, onContinue }) {
	const [localEmail, setLocalEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const { setEmail } = useForgotPassword();
	const API = import.meta.env.VITE_URL;

	const handleContinue = async (e) => {
		e.preventDefault();

		// Final validation check before API call
		const validationError = validateEmail(localEmail);
		if (validationError) {
			setError(validationError);
			return;
		}

		setIsLoading(true);
		setError(null); // Clear error just before API call

		try {
			const response = await fetch(`${API}/user/send-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: localEmail }),
			});

			// API response को JSON में पार्स करें, भले ही response.ok false हो।
			const data = await response.json().catch(() => ({}));

			if (!response.ok) {
				// API से आया हुआ error message दिखाएँ
				const errorMessage =
					data.message ||
					"The email address was not found or an error occurred.";
				throw new Error(errorMessage);
			}

			////console.log("✅ OTP sent successfully to:", localEmail)

			// Store email in context
			setEmail(localEmail);

			// Navigate to OTP screen
			if (onContinue) {
				onContinue(localEmail);
			}
		} catch (err) {
			console.error("❌ Send OTP Error:", err.message);
			setError(err.message || "A network error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Custom change handler जो टाइपिंग के साथ validate करता है
	const handleEmailChange = (e) => {
		const { value } = e.target;
		setLocalEmail(value);

		const validationError = validateEmail(value);

		// Real-time validation: अगर validationError है तो सेट करें, वरना error को null कर दें।
		if (validationError) {
			setError(validationError);
		} else {
			setError(null);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
			<div
				className="bg-white rounded-[20px] shadow-2xl relative w-[547px] max-w-full"
				style={{ height: "471px" }}>
				<div className="w-full h-[86px] rounded-t-[20px] bg-[#CBCCCB4D] flex items-center relative px-12">
					<button
						onClick={onBack}
						className="text-gray-600 hover:text-gray-800 p-1 mr-4"
						disabled={isLoading}>
						<ArrowBackIcon />
					</button>
					<h2 className="text-3xl font-serif font-bold text-[#264A3F]">
						Forgot Password
					</h2>
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
						disabled={isLoading}>
						<CloseIcon />
					</button>
				</div>

				<div className="p-12 flex flex-col items-center w-full">
					<p className="text-sm text-gray-500 mb-8 w-full">
						Enter your email to reset your password.
					</p>

					<form onSubmit={handleContinue} className="space-y-8 w-full">
						<div>
							<label
								htmlFor="email-address"
								className="block text-sm font-medium text-gray-700 mb-2">
								Email address:
							</label>
							<input
								type="email"
								id="email-address"
								name="email"
								value={localEmail}
								onChange={handleEmailChange}
								placeholder="user@example.com"
								required
								disabled={isLoading}
								className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[0.5
                px] focus:ring-[#264A3F] transition duration-150 ease-in-out ${
									error
										? "border-red-500 ring-red-500 focus:ring-red-500"
										: "border-gray-300 focus:border-transparent"
								}`}
							/>
						</div>

						{error && (
							<p className="text-sm text-red-600 font-medium -mt-4 w-full">
								{error}
							</p>
						)}

						<button
							type="submit"
							disabled={isLoading || error || !localEmail} // अगर localEmail खाली है या validation error है, तो button disabled रहेगा।
							className={`w-full text-white font-medium py-3 rounded-xl transition duration-150 ease-in-out shadow-md ${
								isLoading || error || !localEmail
									? "bg-gray-400 cursor-not-allowed"
									: "bg-[#264A3F] hover:bg-[#1e3a30]"
							}`}>
							{isLoading ? "Sending Code..." : "Continue"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
