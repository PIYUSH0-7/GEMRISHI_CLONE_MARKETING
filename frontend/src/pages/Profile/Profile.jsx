"use client";

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../features/api/authSlice";
import {
	useLogoutMutation,
	useProfileQuery,
	useUpdateUserMutation,
} from "../../features/api/apiSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import edit from "../../assets/Profile/edit.svg";

// ====================================================================
// Premium Skeleton Loader
// ====================================================================
const ProfileSkeleton = () => (
	<div className="w-full bg-[#F9F9FB] py-10 lg:py-12 animate-pulse">
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row">
			{/* Sidebar Skeleton */}
			<div className="w-full lg:w-[280px] flex-shrink-0 mb-8 lg:mb-0 lg:pr-8">
				<div className="h-8 w-32 bg-gray-200 rounded mb-8"></div>
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="w-full h-12 bg-gray-200 rounded-xl"></div>
					))}
				</div>
			</div>
			{/* Main Content Skeleton */}
			<div className="flex-1">
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
					<div className="h-40 bg-gray-200"></div>
					<div className="px-8 pb-8 relative">
						<div className="w-28 h-28 bg-gray-300 rounded-full border-4 border-white absolute -top-14"></div>
						<div className="flex justify-end pt-4">
							<div className="w-24 h-10 bg-gray-200 rounded-full"></div>
						</div>
						<div className="mt-8 space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="h-14 bg-gray-100 rounded-xl w-full"></div>
								))}
							</div>
							<div className="h-24 bg-gray-100 rounded-xl w-full"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
);

// ====================================================================
// Main Profile Component
// ====================================================================
function Profile() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { data: profileData, isLoading, isError, refetch } = useProfileQuery();
	const [logoutApi] = useLogoutMutation();
	const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

	// Controls the Active Tab in the Side Menu
	const [select, setSelect] = useState("mydetails");

	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		mobileNo: "",
		address: "",
		landmark: "",
		city: "",
		pinCode: "",
	});
	const [profilePicFile, setProfilePicFile] = useState(null);
	const [validationErrors, setValidationErrors] = useState({
		mobileNo: "",
		pinCode: "",
	});

	useEffect(() => {
		if (profileData?.user) {
			setFormData({
				fullName: profileData.user.fullName || "",
				email: profileData.user.email || "",
				mobileNo: profileData.user.mobileNo || "",
				address: profileData.user.address || "",
				landmark: profileData.user.landmark || "",
				city: profileData.user.city || "",
				pinCode: profileData.user.pinCode || "",
			});
		}
	}, [profileData]);

	const handleInputChange = (e) => {
		const { id, value } = e.target;

		if (id === "mobileNo") {
			if (value === "" || /^\d{0,10}$/.test(value)) {
				setFormData((prevData) => ({ ...prevData, [id]: value }));
				if (value === "") {
					setValidationErrors((prev) => ({ ...prev, mobileNo: "" }));
				} else if (value.length < 10) {
					setValidationErrors((prev) => ({
						...prev,
						mobileNo: "Mobile number must be exactly 10 digits",
					}));
				} else if (value.length === 10) {
					setValidationErrors((prev) => ({ ...prev, mobileNo: "" }));
				}
			}
			return;
		}

		if (id === "city") {
			if (/^[A-Za-z\s]*$/.test(value)) {
				setFormData((prevData) => ({ ...prevData, [id]: value }));
				if (value === "") {
					setValidationErrors((prev) => ({ ...prev, city: "" }));
				} else if (value.length < 3) {
					setValidationErrors((prev) => ({
						...prev,
						city: "City name must be at least 3 letters",
					}));
				} else {
					setValidationErrors((prev) => ({ ...prev, city: "" }));
				}
			}
			return;
		}

		if (id === "pinCode") {
			if (value === "" || /^\d{0,6}$/.test(value)) {
				setFormData((prevData) => ({ ...prevData, [id]: value }));
				if (value === "") {
					setValidationErrors((prev) => ({ ...prev, pinCode: "" }));
				} else if (value.length < 6) {
					setValidationErrors((prev) => ({
						...prev,
						pinCode: "PIN code must be exactly 6 digits",
					}));
				} else if (value.length === 6) {
					setValidationErrors((prev) => ({ ...prev, pinCode: "" }));
				}
			}
			return;
		}

		setFormData((prevData) => ({ ...prevData, [id]: value }));
	};

	const handleLogout = useCallback(async () => {
		try {
			await logoutApi().unwrap();
			dispatch(logoutAction());
			navigate("/", { replace: true });
		} catch (error) {
			console.error("Logout failed:", error);
			dispatch(logoutAction());
			navigate("/", { replace: true });
		}
	}, [dispatch, logoutApi, navigate]);

	const validateForm = () => {
		const { mobileNo, pinCode } = formData;
		let isValid = true;

		if (mobileNo && mobileNo.length !== 10) {
			setValidationErrors((prev) => ({
				...prev,
				mobileNo: "Mobile number must be exactly 10 digits",
			}));
			isValid = false;
		}

		if (pinCode && pinCode.length !== 6) {
			setValidationErrors((prev) => ({
				...prev,
				pinCode: "PIN code must be exactly 6 digits",
			}));
			isValid = false;
		}

		return isValid;
	};

	const handleUpdateProfile = async () => {
		if (!isEditing) {
			setIsEditing(true);
			return;
		}

		if (!validateForm()) return;

		try {
			const { _id: userId } = profileData.user;
			const dataToUpdate = new FormData();
			let isChanged = false;

			for (const key in formData) {
				if (key === "email") continue;
				if (formData[key] !== profileData.user[key]) {
					dataToUpdate.append(key, formData[key]);
					isChanged = true;
				}
			}

			if (profilePicFile) {
				dataToUpdate.append("profilePic", profilePicFile);
				isChanged = true;
			}

			if (!isChanged) {
				setIsEditing(false);
				toast.info("No changes were made to save.", { position: "top-center" });
				return;
			}

			await updateUser({ userId, formData: dataToUpdate }).unwrap();
			refetch();

			setIsEditing(false);
			setProfilePicFile(null);

			toast.success("Profile updated successfully!", {
				position: "top-center",
				autoClose: 3000,
				theme: "light",
			});
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error(
				error?.data?.message || "Failed to update profile. Please try again.",
				{ position: "top-center" }
			);
		}
	};

	if (isLoading) return <ProfileSkeleton />;

	if (isError) {
		return (
			<div className="w-full py-20 flex items-center justify-center bg-[#F9F9FB]">
				<div className="p-12 flex flex-col items-center text-center max-w-md bg-white shadow-lg rounded-2xl border border-red-100">
					<svg className="w-16 h-16 text-red-800 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.398 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<h3 className="text-2xl font-serif text-gray-900 mb-3">Profile Unavailable</h3>
					<p className="text-gray-600 leading-relaxed">
						We couldn't load your profile information. Please ensure you are logged in and try refreshing the page.
					</p>
				</div>
			</div>
		);
	}

	// Generate a sleek default avatar using the user's name initials
	const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
		formData.fullName || "User"
	)}&background=E8F0ED&color=264A3F&size=150&font-size=0.4`;

	return (
		<div className="w-full bg-[#F9F9FB] py-10 lg:py-12 font-sans text-gray-800">
			{/* ✅ ADDED Centered Wrapper (max-w-7xl mx-auto) to fix the right margin issue */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row">

				{/* --- Premium Left Sidebar --- */}
				<div className="w-full lg:w-[280px] flex-shrink-0 mb-8 lg:mb-0 lg:pr-8">
					<h1 className="text-3xl font-serif text-gray-900 mb-8 tracking-wide">My Account</h1>
					<nav className="flex flex-col gap-2">
						<button
							className={`text-left px-5 py-4 rounded-xl text-[15px] font-medium transition-all duration-300 ${
								select === "mydetails"
									? "bg-white text-[#264A3F] shadow-sm border border-gray-100"
									: "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm"
							}`}
							onClick={() => setSelect("mydetails")}
						>
							My Details
						</button>
						<button
							className={`text-left px-5 py-4 rounded-xl text-[15px] font-medium transition-all duration-300 ${
								select === "OrdersAndPurchases"
									? "bg-white text-[#264A3F] shadow-sm border border-gray-100"
									: "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm"
							}`}
							onClick={() => setSelect("OrdersAndPurchases")}
						>
							Orders & Purchases
						</button>
						<button
							className="text-left px-5 py-4 rounded-xl text-[15px] font-medium text-red-600/80 hover:bg-red-50 hover:text-red-700 transition-all duration-300 mt-4"
							onClick={handleLogout}
						>
							Logout
						</button>
					</nav>
				</div>

				{/* --- Premium Right Content Area --- */}
				{/* ✅ REMOVED max-w-4xl so it perfectly stretches to match the container */}
				<div className="flex-1">

					{/* 📌 Conditional Rendering: Show Profile Details */}
					{select === "mydetails" && (
						<div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
							{/* Banner */}
							<div className="w-full h-[140px] sm:h-[180px] bg-[#1a3329] relative overflow-hidden">
								<div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
							</div>

							{/* Profile Header section */}
							<div className="px-6 sm:px-10 pb-10 relative">
								{/* Avatar */}
								<div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-8">
									<div className="relative z-10 flex items-end gap-6">
										<div className="relative">
											<img
												src={
													profilePicFile
														? URL.createObjectURL(profilePicFile)
														: profileData?.user?.profilePic?.url || defaultAvatarUrl
												}
												alt="Profile"
												className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
											/>
											{isEditing && (
												<label
													htmlFor="profilePicUpload"
													className="absolute bottom-1 right-1 w-8 h-8 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
													<img src={edit || "/placeholder.svg"} alt="Edit" className="w-4 h-4" />
												</label>
											)}
											<input
												id="profilePicUpload"
												type="file"
												accept="image/*"
												className="hidden"
												onChange={(e) => setProfilePicFile(e.target.files[0])}
												disabled={!isEditing}
											/>
										</div>
										<div className="pb-2 hidden sm:block">
											<h2 className="text-2xl font-serif text-gray-900">{formData.fullName || "User Profile"}</h2>
											<p className="text-sm text-gray-500">{formData.email}</p>
										</div>
									</div>

									{/* Edit/Save Button */}
									<button
										className={`px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 shadow-sm
                                            ${isEditing
											? "bg-[#264A3F] text-white hover:bg-[#1a3329]"
											: "bg-white text-[#264A3F] border border-[#264A3F] hover:bg-[#F9F9FB]"
										} ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
										onClick={handleUpdateProfile}
										disabled={isUpdating}>
										{isUpdating ? "Saving..." : isEditing ? "Save Profile" : "Edit Profile"}
									</button>
								</div>

								{/* Mobile Name Display */}
								<div className="sm:hidden mb-8 text-center">
									<h2 className="text-2xl font-serif text-gray-900">{formData.fullName || "User Profile"}</h2>
									<p className="text-sm text-gray-500">{formData.email}</p>
								</div>

								{/* Form Fields */}
								<div className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<InputField label="Full Name" id="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} />
										<InputField label="Email Address" id="email" value={formData.email} onChange={handleInputChange} disabled={true} />
										<InputField label="Mobile Number" id="mobileNo" value={formData.mobileNo} onChange={handleInputChange} disabled={!isEditing} error={isEditing ? validationErrors.mobileNo : ""} />
									</div>

									<hr className="border-gray-100 my-8" />

									<div className="space-y-6">
										<InputField label="Primary Address" id="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing} isTextarea={true} />
										<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
											<InputField label="Landmark" id="landmark" value={formData.landmark} onChange={handleInputChange} disabled={!isEditing} />
											<InputField label="City" id="city" value={formData.city} onChange={handleInputChange} disabled={!isEditing} error={isEditing ? validationErrors.city : ""} />
											<InputField label="PIN Code" id="pinCode" value={formData.pinCode} onChange={handleInputChange} disabled={!isEditing} error={isEditing ? validationErrors.pinCode : ""} />
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* 📌 Conditional Rendering: Show Orders */}
					{select === "OrdersAndPurchases" && (
						<div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
							<h2 className="text-3xl font-serif text-gray-900 mb-8 border-b border-gray-100 pb-6">Orders & Purchases</h2>

							{/* ⬇️ Render your Orders List Component here later ⬇️ */}

							<div className="flex flex-col items-center justify-center h-[350px] border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 mt-6">
								<svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
								</svg>
								<p className="text-gray-500 text-lg font-medium">No orders found.</p>
								<p className="text-gray-400 text-sm mt-2">When you place an order, it will appear here.</p>
							</div>

						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ====================================================================
// Reusable Input Component for sleek UI
// ====================================================================
const InputField = ({ label, id, value, onChange, disabled, error, isTextarea }) => {
	return (
		<div className="flex flex-col w-full">
			<label htmlFor={id} className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2 pl-1">
				{label}
			</label>
			{isTextarea ? (
				<textarea
					id={id}
					value={value}
					onChange={onChange}
					disabled={disabled}
					rows="3"
					className={`w-full rounded-xl px-4 py-3 text-[15px] text-gray-800 transition-all resize-none
                        ${disabled
						? "bg-gray-50/80 border border-transparent cursor-not-allowed text-gray-600"
						: "bg-white border border-gray-200 focus:outline-none focus:border-[#264A3F] focus:ring-1 focus:ring-[#264A3F]"
					} ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""}
                    `}
				/>
			) : (
				<input
					type="text"
					id={id}
					value={value}
					onChange={onChange}
					disabled={disabled}
					className={`w-full rounded-xl px-4 py-3 h-[52px] text-[15px] text-gray-800 transition-all
                        ${disabled
						? "bg-gray-50/80 border border-transparent cursor-not-allowed text-gray-600"
						: "bg-white border border-gray-200 focus:outline-none focus:border-[#264A3F] focus:ring-1 focus:ring-[#264A3F]"
					} ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""}
                    `}
				/>
			)}
			{error && <p className="text-red-500 text-xs mt-1.5 pl-1">{error}</p>}
		</div>
	);
};

export default Profile;