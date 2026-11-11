"use client";

import { useState, useRef, useEffect } from "react";
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

export default function Otp({ onBack, onClose, onVerificationSuccess }) {
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const inputRefs = useRef([]);

	const { email, setVerifiedOtp } = useForgotPassword();
	const API = import.meta.env.VITE_URL;

	useEffect(() => {
		////console.log("📧 Email from Context:", email)
		if (inputRefs.current[0]) {
			inputRefs.current[0].focus();
		}
	}, [email]);

	const handleChange = (index, value) => {
		if (!/^\d*$/.test(value)) return;

		const newOtp = [...otp];
		newOtp[index] = value.slice(-1);
		setOtp(newOtp);

		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").slice(0, 6);
		if (!/^\d+$/.test(pastedData)) return;

		const newOtp = [...otp];
		pastedData.split("").forEach((char, index) => {
			if (index < 6) newOtp[index] = char;
		});
		setOtp(newOtp);

		const nextEmptyIndex = newOtp.findIndex((val) => !val);
		const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
		inputRefs.current[focusIndex]?.focus();
	};

	const handleVerify = async (e) => {
		e.preventDefault();

		const otpString = otp.join("");
		if (otpString.length !== 6) {
			setError("Please enter all 6 digits.");
			return;
		}

		if (!email) {
			setError("Email not found. Please go back and try again.");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			////console.log("🔐 Verifying OTP with:", { email, otp: otpString })

			const response = await fetch(`${API}/user/verify_otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: email,
					otp: otpString,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Invalid OTP. Please try again.");
			}

			////console.log("✅ OTP verified successfully:", data)

			// Store verified OTP in context for reset password
			setVerifiedOtp(otpString);

			// Proceed to reset password screen
			if (onVerificationSuccess) {
				onVerificationSuccess();
			}
		} catch (err) {
			console.error("❌ OTP Verification Error:", err.message);
			setError(err.message || "A network error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResend = async () => {
		if (!email) {
			setError("Email not found. Please go back and try again.");
			return;
		}

		setOtp(["", "", "", "", "", ""]);
		setError(null);
		inputRefs.current[0]?.focus();

		try {
			const response = await fetch(`${API}/user/send-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to resend OTP.");
			}

			////console.log("✅ OTP resent successfully to:", email)
		} catch (err) {
			console.error("❌ Resend OTP Error:", err.message);
			setError(err.message || "Failed to resend OTP. Please try again.");
		}
	};

	const isComplete = otp.every((digit) => digit !== "");

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
			<div
				className="bg-white rounded-[20px] shadow-2xl relative w-[547px] max-w-full"
				style={{ minHeight: "471px" }}>
				<div className="w-full h-[86px] rounded-t-[20px] bg-[#CBCCCB4D] flex items-center relative px-12">
					<button
						onClick={onBack}
						className="text-gray-600 hover:text-gray-800 p-1 mr-4"
						disabled={isLoading}>
						<ArrowBackIcon />
					</button>
					<h2 className="text-3xl font-serif font-bold text-[#264A3F]">
						Verify OTP
					</h2>
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
						disabled={isLoading}>
						<CloseIcon />
					</button>
				</div>

				<div className="p-12 flex flex-col items-center w-full">
					<p className="text-sm text-gray-500 mb-2 w-full text-center">
						We've sent a verification code to
					</p>
					<p className="text-sm font-semibold text-gray-700 mb-8 w-full text-center">
						{email || "your email"}
					</p>

					<form onSubmit={handleVerify} className="space-y-8 w-full">
						<div className="flex justify-center gap-2 sm:gap-3">
							{otp.map((digit, index) => (
								<input
									key={index}
									ref={(el) => (inputRefs.current[index] = el)}
									type="text"
									inputMode="numeric"
									maxLength={1}
									value={digit}
									onChange={(e) => handleChange(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									onPaste={handlePaste}
									disabled={isLoading}
									className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#264A3F] focus:border-transparent transition duration-150 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
							))}
						</div>

						{error && (
							<p className="text-sm text-red-600 font-medium text-center w-full">
								{error}
							</p>
						)}

						<button
							type="submit"
							disabled={isLoading || !isComplete}
							className={`w-full text-white font-medium py-3 rounded-xl transition duration-150 ease-in-out shadow-md ${
								isComplete && !isLoading
									? "bg-[#264A3F] hover:bg-[#1e3a30]"
									: "bg-gray-400 cursor-not-allowed"
							}`}>
							{isLoading ? "Verifying..." : "Verify OTP"}
						</button>

						<div className="text-center">
							<p className="text-sm text-gray-600">
								Didn't receive the code?{" "}
								<button
									type="button"
									onClick={handleResend}
									disabled={isLoading}
									className="text-[#264A3F] font-semibold hover:underline disabled:opacity-50">
									Resend
								</button>
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
