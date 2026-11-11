import React, { useState } from "react";
import { useGemSuggestion } from "../../hooks/useSuggest";
import { useNavigate } from "react-router-dom";
const GemRecommendationModal = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		gender: "",
		purpose: "",
		placeOfBirth: "",
		country: "",
		chartStyle: "",
		dob: {
			day: "",
			month: "",
			year: "",
		},
		tob: {
			hour: "",
			minute: "",
			ampm: "AM",
		},
	});

	const [showModal, setShowModal] = useState(false);

	const { data, loading, error, fetchGemSuggestion } = useGemSuggestion();

	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Update form data
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear specific field error when valid
		setErrors((prevErrors) => {
			const newErrors = { ...prevErrors };

			if (name === "name" && value.trim()) delete newErrors.name;
			if (name === "email" && /\S+@\S+\.\S+/.test(value))
				delete newErrors.email;
			if (name === "gender" && value) delete newErrors.gender;
			if (name === "purpose" && value) delete newErrors.purpose;
			if (name === "country" && value) delete newErrors.country;
			if (name === "placeOfBirth" && value.trim())
				delete newErrors.placeOfBirth;
			if (name === "chartStyle" && value) delete newErrors.chartStyle;
			if (name === "phone" && /^[0-9]{10}$/.test(value)) delete newErrors.phone;

			return newErrors;
		});
	};


	const validate = () => {
		const newErrors = {};

		// Name
		if (!formData.name.trim()) newErrors.name = "Name is required";

		// Email
		if (!formData.email.trim()) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(formData.email))
			newErrors.email = "Invalid email format";

		// Gender
		if (!formData.gender) newErrors.gender = "Select gender";

		// Purpose
		if (!formData.purpose) newErrors.purpose = "Select purpose";

		// Country
		if (!formData.country) newErrors.country = "Select country";

		// Phone (optional)
		if (!formData.phone) newErrors.phone = "Enter valid 10-digit phone number";

		// Date of Birth
		if (!formData.dob.day || !formData.dob.month || !formData.dob.year)
			newErrors.dob = "Complete date of birth is required";

		// Time of Birth
		if (!formData.tob.hour || !formData.tob.minute || !formData.tob.ampm)
			newErrors.tob = "Complete time of birth is required";

		// Budget

		// Place of Birth
		if (!formData.placeOfBirth.trim())
			newErrors.placeOfBirth = "Place of birth is required";

		// Chart Style
		if (!formData.chartStyle) newErrors.chartStyle = "Select chart style";

		return newErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}
		try {
			const payload = {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				gender: formData.gender,
				purpose: formData.purpose,
				placeOfBirth: formData.placeOfBirth,
				country: formData.country,
				chartStyle: formData.chartStyle,
				dob: {
					day: formData.dob.day,
					month: formData.dob.month,
					year: formData.dob.year,
				},
				tob: {
					hour: formData.tob.hour,
					minute: formData.tob.minute,
					ampm: formData.tob.ampm,
				},
			};

			await fetchGemSuggestion(payload);
			setShowModal(true);
		} catch (err) {
			console.error("Error:", err);
			alert("Unable to fetch gemstone recommendation. Please try again.");
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	return (
		<div className="flex  justify-center items-center min-h-screen p-4">
			<div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-6 md:p-8 border border-gray-200">
				{/* Title */}
				<h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 text-center">
					Gem Recommendation Tool
				</h2>
				<p className="text-gray-600 text-center mb-6 text-sm md:text-base">
					A Smartly-Crafted Solution for Fast and Precise Gemstone
					Recommendations Based on Astrology.
				</p>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Name */}
						<div>
							<input
								type="text"
								name="name"
								placeholder="Name*"
								value={formData.name}
								onChange={handleChange}
								className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
									errors.name
										? "border-red-500 focus:ring-red-200"
										: "border-gray-300 focus:ring-gray-300"
								}`}
							/>
							{errors.name && (
								<p className="text-red-500 text-sm mt-1">{errors.name}</p>
							)}
						</div>

						{/* Email */}
						<div>
							<input
								type="email"
								name="email"
								placeholder="Email*"
								value={formData.email}
								onChange={handleChange}
								className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
									errors.email
										? "border-red-500 focus:ring-red-200"
										: "border-gray-300 focus:ring-gray-300"
								}`}
							/>
							{errors.email && (
								<p className="text-red-500 text-sm mt-1">{errors.email}</p>
							)}
						</div>

						{/* Phone */}
						<div className="flex flex-col">
							{/* Phone input with country code */}
							<div
								className={`flex border rounded-md overflow-hidden ${
									errors.phone
										? "border-red-500 focus-within:ring-2 focus-within:ring-red-200"
										: "border-gray-300 focus-within:ring-2 focus-within:ring-gray-300"
								}`}>
								<select
									name="countryCode"
									value={formData.countryCode}
									onChange={(e) =>
										setFormData({ ...formData, countryCode: e.target.value })
									}
									className="p-2 outline-none border-r border-gray-300">
									<option value="+91">+91</option>
									<option value="+1">+1</option>
									<option value="+44">+44</option>
								</select>
								<input
									type="tel"
									name="phone"
									placeholder="Phone"
									value={formData.phone}
									onChange={handleChange}
									className="p-2 w-full outline-none"
								/>
							</div>
							{/* Error message */}
							{errors.phone && (
								<p className="text-red-500 text-sm mt-1">{errors.phone}</p>
							)}
						</div>

						{/* Gender */}
						<div>
							<select
								name="gender"
								value={formData.gender}
								onChange={handleChange}
								className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
									errors.gender
										? "border-red-500 focus:ring-red-200"
										: "border-gray-300 focus:ring-gray-300"
								}`}>
								<option value="">Select Gender</option>
								<option value="Male">Male</option>
								<option value="Female">Female</option>
								<option value="Other">Other</option>
							</select>
							{errors.gender && (
								<p className="text-red-500 text-sm mt-1">{errors.gender}</p>
							)}
						</div>

						{/* Purpose */}
						<div>
							<select
								name="purpose"
								value={formData.purpose}
								onChange={handleChange}
								className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
									errors.purpose
										? "border-red-500 focus:ring-red-200"
										: "border-gray-300 focus:ring-gray-300"
								}`}>
								<option value="">Select Purpose*</option>
								<option value="Health">Health</option>
								<option value="Wealth">Wealth</option>
								<option value="Career">Career</option>
							</select>
							{errors.purpose && (
								<p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
							)}
						</div>

					

						{/* Place of Birth */}
						<div>
							<input
								type="text"
								name="placeOfBirth"
								placeholder="Place of Birth"
								value={formData.placeOfBirth}
								onChange={handleChange}
								className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
									errors.placeOfBirth
										? "border-red-500 focus:ring-red-200"
										: "border-gray-300 focus:ring-gray-300"
								}`}
							/>
							{/* Error Message */}
							{errors.placeOfBirth && (
								<p className="text-red-500 text-sm mt-1">
									{errors.placeOfBirth}
								</p>
							)}
						</div>

						{/* Country */}
						<div>
							<select
								name="country"
								value={formData.country}
								onChange={handleChange}
								className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
									errors.country
										? "border-red-500 focus:ring-red-200"
										: "border-gray-300 focus:ring-gray-300"
								}`}>
								<option value="">Select Country*</option>
								<option value="India">India</option>
								<option value="USA">USA</option>
								<option value="UK">UK</option>
							</select>
							{errors.country && (
								<p className="text-red-500 text-sm mt-1">{errors.country}</p>
							)}
						</div>

						{/* Chart Style */}
						<div className="flex flex-col">
							<select
								name="chartStyle"
								value={formData.chartStyle}
								onChange={handleChange}
								className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
									errors.chartStyle
										? "border-red-500 focus:ring-red-200"
										: "border-gray-300 focus:ring-gray-300"
								}`}>
								<option value="">Select Chart Style</option>
								<option value="North">North Indian</option>
								<option value="South">South Indian</option>
							</select>
							{errors.chartStyle && (
								<p className="text-red-500 text-sm mt-1">{errors.chartStyle}</p>
							)}
						</div>
					</div>

					{/* DOB & TOB */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* DOB */}
						<div className="flex flex-col">
							<label className="block mb-1 text-gray-700 font-medium">
								Date of Birth
							</label>
							<div className="flex gap-2">
								<select
									value={formData.dob.day}
									onChange={(e) =>
										setFormData({
											...formData,
											dob: { ...formData.dob, day: e.target.value },
										})
									}
									className={`border rounded-md p-2 w-full ${
										errors.dob ? "border-red-500" : "border-gray-300"
									}`}>
									<option value="">Day</option>
									{[...Array(31)].map((_, i) => (
										<option key={i + 1}>{i + 1}</option>
									))}
								</select>
								<select
									value={formData.dob.month}
									onChange={(e) =>
										setFormData({
											...formData,
											dob: { ...formData.dob, month: e.target.value },
										})
									}
									className={`border rounded-md p-2 w-full ${
										errors.dob ? "border-red-500" : "border-gray-300"
									}`}>
									<option value="">Month</option>
									{[...Array(12)].map((_, i) => (
										<option key={i + 1}>{i + 1}</option>
									))}
								</select>
								<select
									value={formData.dob.year}
									onChange={(e) =>
										setFormData({
											...formData,
											dob: { ...formData.dob, year: e.target.value },
										})
									}
									className={`border rounded-md p-2 w-full ${
										errors.dob ? "border-red-500" : "border-gray-300"
									}`}>
										{/* -----------add by pawan------------------ */}
									<option value="">Year</option>
									{[...Array(100)].map((_, i) => (
										<option key={1940 + i}>{1940 + i}</option>
									))}
								</select>
								{/* -----------add by pawan------------------ */}
							</div>
							{errors.dob && (
								<p className="text-red-500 text-sm mt-1">{errors.dob}</p>
							)}
						</div>

						{/* TOB */}
						<div className="flex flex-col">
							<label className="block mb-1 text-gray-700 font-medium">
								Time of Birth
							</label>
							<div className="flex gap-2">
								<select
									value={formData.tob.hour}
									onChange={(e) =>
										setFormData({
											...formData,
											tob: { ...formData.tob, hour: e.target.value },
										})
									}
									className={`border rounded-md p-2 w-full ${
										errors.tob ? "border-red-500" : "border-gray-300"
									}`}>
									<option value="">Hr</option>
									{[...Array(12)].map((_, i) => (
										<option key={i + 1}>{i + 1}</option>
									))}
								</select>
								<select
									value={formData.tob.minute}
									onChange={(e) =>
										setFormData({
											...formData,
											tob: { ...formData.tob, minute: e.target.value },
										})
									}
									className={`border rounded-md p-2 w-full ${
										errors.tob ? "border-red-500" : "border-gray-300"
									}`}>
									<option value="">Min</option>
									{[...Array(60)].map((_, i) => (
										<option key={i}>{i}</option>
									))}
								</select>
								<select
									value={formData.tob.ampm}
									onChange={(e) =>
										setFormData({
											...formData,
											tob: { ...formData.tob, ampm: e.target.value },
										})
									}
									className={`border rounded-md p-2 w-full ${
										errors.tob ? "border-red-500" : "border-gray-300"
									}`}>
									<option>AM</option>
									<option>PM</option>
								</select>
							</div>
							{errors.tob && (
								<p className="text-red-500 text-sm mt-1">{errors.tob}</p>
							)}
						</div>
					</div>

					{/* Submit Button */}
					<div className="flex justify-center mt-4">
						<button
							type="submit"
							className="bg-red-500 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-md font-medium w-full sm:w-auto hover:bg-red-600 transition">
							Get Recommendation Now
						</button>
					</div>
				</form>

				{/* Modal */}
				{showModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
							{/* Close Button */}
							<button
								onClick={handleCloseModal}
								className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold">
								&times;
							</button>

							{/* Loading */}
							{loading && (
								<p className="text-blue-500 text-center text-lg">
									Fetching recommendation...
								</p>
							)}

							{/* Error */}
							{error && (
								<p className="text-red-500 text-center text-lg">{error}</p>
							)}

							{/* Data */}
							{data?.data && (
								<div className="space-y-4">
									<h3 className="text-2xl font-semibold text-green-800 mb-4 text-center">
										Your Details
									</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800 text-sm md:text-base">
										<p>
											<strong>Name:</strong> {data.data.name}
										</p>
										<p>
											<strong>Email:</strong> {data.data.email}
										</p>
										<p>
											<strong>Phone:</strong> {data.data.phone}
										</p>
										<p>
											<strong>Gender:</strong> {data.data.gender}
										</p>
										<p>
											<strong>Purpose:</strong> {data.data.purpose}
										</p>
										
										<p>
											<strong>Place of Birth:</strong> {data.data.placeOfBirth}
										</p>
										<p>
											<strong>Country:</strong> {data.data.country}
										</p>
										<p>
											<strong>Chart Style:</strong> {data.data.chartStyle}
										</p>
										<p>
											<strong>Date of Birth:</strong> {data.data.dob?.day}/
											{data.data.dob?.month}/{data.data.dob?.year}
										</p>
										<p>
											<strong>Time of Birth:</strong> {data.data.tob?.hour}:
											{data.data.tob?.minute} {data.data.tob?.ampm}
										</p>
									</div>

									<div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-md space-y-2">
										<h4 className="text-lg font-semibold text-green-700">
											Astrological Recommendations
										</h4>
										<p>
											<strong>Janma Rashi:</strong> {data.data.janmaRashi}
										</p>
										<p>
											<strong>Gemstone from Moon Sign:</strong>{" "}
											{data.data.gemstoneFromMoonSign}
										</p>
										<p>
											<strong>Gemstone from Name Letter:</strong>{" "}
											{data.data.gemstoneFromNameLetter}
										</p>
										<p>
											<strong>Birthstone by Month:</strong>{" "}
											{data.data.birthstoneByMonth}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default GemRecommendationModal;
