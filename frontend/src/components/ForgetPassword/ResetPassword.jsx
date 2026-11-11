// ResetPassword.js
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

const EyeIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round">
		<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

const EyeOffIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round">
		<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
		<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
		<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
		<line x1="2" x2="22" y1="2" y2="22" />
	</svg>
);

export default function ResetPassword({ onBack, onClose, onResetSuccess }) {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	// 🔑 नया स्टेट: लाइव पासवर्ड मैच एरर के लिए
	const [passwordMatchError, setPasswordMatchError] = useState(null);

	const { email, verifiedOtp } = useForgotPassword();
	const API = import.meta.env.VITE_URL;

	// 🔑 New Password का onChange handler
	const handleNewPasswordChange = (e) => {
		const value = e.target.value;
		setNewPassword(value);
		// अगर Confirm Password भरा हुआ है, तो लाइव मैच चेक करें
		if (confirmPassword) {
			setPasswordMatchError(
				value !== confirmPassword ? "Passwords must be the same." : null
			);
		} else {
			setPasswordMatchError(null);
		}
	};

	// 🔑 Confirm Password का onChange handler
	const handleConfirmPasswordChange = (e) => {
		const value = e.target.value;
		setConfirmPassword(value);
		// लाइव मैच चेक करें
		setPasswordMatchError(
			value !== newPassword ? "Passwords do not match." : null
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setPasswordMatchError(null); // सबमिट पर लाइव एरर को रीसेट करें

		// --- 1. Client-Side Validation ---

		if (!newPassword || !confirmPassword) {
			setError("Please fill in all fields.");
			return;
		}

		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters long.");
			return;
		}

		if (newPassword !== confirmPassword) {
			// सबमिट पर फ़ाइनल मैच चेक करें
			setError(
				"Passwords do not match. Please ensure both fields are identical."
			);
			return;
		}

		if (!email || !verifiedOtp) {
			setError("Session expired. Please start the process again.");
			return;
		}

		// --- 2. API Submission ---

		setIsLoading(true);

		try {
			////console.log("🔒 Resetting password with:", { email, otp: verifiedOtp, newPassword: "***" })

			const response = await fetch(`${API}/user/reset-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: email,
					otp: verifiedOtp,
					newPassword: newPassword,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message || "Failed to reset password. Please try again."
				);
			}

			////console.log("✅ Password reset successfully:", data)

			// Navigate to success screen
			if (onResetSuccess) {
				onResetSuccess();
			}
		} catch (err) {
			console.error("❌ Reset Password Error:", err.message);
			setError(err.message || "A network error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
			<div
				className="bg-white rounded-[20px] shadow-2xl relative w-[547px] max-w-full"
				style={{ minHeight: "520px" }}>
				<div className="w-full h-[86px] rounded-t-[20px] bg-[#CBCCCB4D] flex items-center relative px-12">
					<button
						onClick={onBack}
						className="text-gray-600 hover:text-gray-800 p-1 mr-4"
						disabled={isLoading}>
						<ArrowBackIcon />
					</button>
					<h2 className="text-3xl font-serif font-bold text-[#264A3F]">
						Reset Password
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
						Please enter your new password.
					</p>

					<form onSubmit={handleSubmit} className="space-y-6 w-full">
						<div className="relative">
							<label
								htmlFor="new-password"
								className="block text-sm font-medium text-gray-700 mb-2">
								New Password:
							</label>
							<div className="relative">
								<input
									type={showNewPassword ? "text" : "password"}
									id="new-password"
									value={newPassword}
									onChange={handleNewPasswordChange} // 🔑 Updated handler
									placeholder="Enter new password"
									required
									disabled={isLoading}
									className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#264A3F] focus:border-transparent transition duration-150 ease-in-out"
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword(!showNewPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
									disabled={isLoading}>
									{showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
								</button>
							</div>
						</div>

						<div className="relative">
							<label
								htmlFor="confirm-password"
								className="block text-sm font-medium text-gray-700 mb-2">
								Confirm Password:
							</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									id="confirm-password"
									value={confirmPassword}
									onChange={handleConfirmPasswordChange} // 🔑 Updated handler
									placeholder="Confirm new password"
									required
									disabled={isLoading}
									className={`w-full px-4 py-3 pr-12 border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#264A3F] focus:border-transparent transition duration-150 ease-in-out ${
										passwordMatchError ? "border-red-500" : "border-gray-300" // 🔑 Error होने पर बॉर्डर लाल करें
									}`}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
									disabled={isLoading}>
									{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
								</button>
							</div>
						</div>

						<div className="text-xs text-gray-500 space-y-1">
							<p className={newPassword.length >= 8 ? "text-green-600" : ""}>
								• At least 8 characters
							</p>
						</div>

						{/* 🔑 लाइव पासवर्ड मैच एरर डिस्प्ले करें */}
						{passwordMatchError && (
							<p className="text-sm text-red-600 font-medium w-full mt-1">
								{passwordMatchError}
							</p>
						)}

						{error && (
							<p className="text-sm text-red-600 font-medium w-full">{error}</p>
						)}

						<button
							type="submit"
							// 🔑 'passwordMatchError' होने पर बटन को डिसेबल करें
							disabled={
								isLoading ||
								!newPassword ||
								!confirmPassword ||
								passwordMatchError
							}
							className={`w-full text-white font-medium py-3 rounded-xl transition duration-150 ease-in-out shadow-md ${
								isLoading ||
								!newPassword ||
								!confirmPassword ||
								passwordMatchError
									? "bg-gray-400 cursor-not-allowed"
									: "bg-[#264A3F] hover:bg-[#1e3a30]"
							}`}>
							{isLoading ? "Resetting Password..." : "Reset Password"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
