import { fbqTrack } from "../../utils/metaPixel.js";
"use client";

/* Contact Us Page with realtime, word-aware validation per field.
   - Validates on each keystroke (har word detect) and on blur
   - Shows error messages directly below the corresponding input
   - Keeps layout and content the same; adds responsive padding for smaller screens
*/

import React from "react";
import AboutBG from "../../assets/AboutUs/AboutBG.svg";
import { useNavigate } from "react-router-dom";
import Testimonials from "../../components/Testimonals";
import FAQAccordion from "../../components/faq.jsx";
import { contactUs } from "../../api/contactUs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GemstoneReviews from "../Home/GemstoneReviews.jsx";

// Provided validation helpers, extended for word-level checks.
const validateFirstName = (name) => {
	const value = name || "";
	const trimmed = value.trim();

	if (!trimmed) return "Name is required.";
	if (trimmed.length < 3) return "Name must be at least 3 characters.";

	// Word-aware: each token must be only letters
	const words = trimmed.split(/\s+/);
	const invalidWord = words.find((w) => !/^[a-zA-Z]+$/.test(w));
	if (invalidWord)
		return `Invalid word "${invalidWord}". Only letters allowed.`;

	// Also ensure only letters and spaces globally
	if (!/^[a-zA-Z\s]+$/.test(trimmed))
		return "Name should only contain letters.";
	return "";
};

const validateEmail = (email) => {
	const value = email || "";
	if (!value.trim()) return "Email is required";
	if (/\s/.test(value)) return "Email must not contain spaces";
	// Allow subdomains and TLD 2+ chars
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
	if (!emailRegex.test(value)) return "Please enter a valid email address";
	return "";
};

const validateGemstoneHelp = (val) => {
	if (!val || val.trim() === "") return "Please select a reason";
	return "";
};

const validateMessage = (msg) => {
	const value = msg || "";
	if (!value.trim()) return "Message is required";
	if (value.trim().length < 10) return "Message must be at least 10 characters";
	// Word-aware: flag any word longer than 60 chars (likely paste/noise)
	const longWord = value.split(/\s+/).find((w) => w.length > 60);
	if (longWord)
		return "Message contains an unusually long word. Please review.";
	return "";
};

function ContactUs() {
	const navigate = useNavigate();

	const [formState, setFormState] = React.useState({
		name: "",
		email: "",
		gemstoneHelp: "",
		message: "",
	});

	const [errors, setErrors] = React.useState({
		name: "",
		email: "",
		gemstoneHelp: "",
		message: "",
	});

	const [submitStatus, setSubmitStatus] = React.useState({
		message: "",
		type: "", // "success" or "error"
	});

	const hasTrackedFormStart = React.useRef(false);

	// Validate a single field and update state
	const runValidation = React.useCallback((field, value) => {
		let err = "";
		switch (field) {
			case "name":
				err = validateFirstName(value);
				break;
			case "email":
				err = validateEmail(value);
				break;
			case "gemstoneHelp":
				err = validateGemstoneHelp(value);
				break;
			case "message":
				err = validateMessage(value);
				break;
			default:
				err = "";
		}
		setErrors((prev) => ({ ...prev, [field]: err }));
		return err;
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (!hasTrackedFormStart.current && value.length > 0) {
			hasTrackedFormStart.current = true;
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({
				event: "form_start",
				form_id: "contact_us_form",
				form_name: "Contact Us Inquiry",
			});
		}

		setFormState((prev) => ({ ...prev, [name]: value }));

		// Realtime validation (har word detect): validate as user types
		runValidation(name, value);
	};

	const handleBlur = (e) => {
		const { name, value } = e.target;
		runValidation(name, value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitStatus({ message: "", type: "" }); // Reset on new submission

		// Validate all fields on submit
		const nameErr = runValidation("name", formState.name);
		const emailErr = runValidation("email", formState.email);
		const helpErr = runValidation("gemstoneHelp", formState.gemstoneHelp);
		const msgErr = runValidation("message", formState.message);

		const hasError = [nameErr, emailErr, helpErr, msgErr].some(Boolean);
		if (hasError) {
			// Focus first errored field
			const firstErrored = ["name", "email", "gemstoneHelp", "message"].find(
				(f) => errors[f] || runValidation(f, formState[f])
			);
			if (firstErrored) {
				const el = document.querySelector(`[name="${firstErrored}"]`);
				if (el) el.focus();
			}
			return;
		}

		try {
			const contactEventId = `contact_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
			const response = await contactUs({ ...formState, eventId: contactEventId });

			if (response && response.msg && response.success === true) {
				window.dataLayer = window.dataLayer || [];
				window.dataLayer.push({
					event: "form_submit",
					form_id: "contact_us_form",
					form_name: "Contact Us Inquiry",
					form_destination: "contactUs API",
				});
				toast.success(response.msg);
				fbqTrack(
					"Lead",
					{
						content_name: "Contact Us Inquiry",
						content_category: formState.gemstoneHelp || "Customer Support",
						value: 0,
						currency: "INR",
					},
					{ eventID: contactEventId }
				);
				setSubmitStatus({ message: response.msg, type: "success" });
				setFormState({
					name: "",
					email: "",
					gemstoneHelp: "",
					message: "",
				});
				hasTrackedFormStart.current = false;
			} else {
				// Fallback for unexpected response format
				window.dataLayer = window.dataLayer || [];
				window.dataLayer.push({
					event: "form_submit",
					form_id: "contact_us_form",
					form_name: "Contact Us Inquiry",
					form_destination: "contactUs API",
				});
				toast.success("Contact Request Sent");
				setSubmitStatus({
					message: "Your message has been sent successfully!",
					type: "success",
				});
				hasTrackedFormStart.current = false;
			}
		} catch (err) {
			console.error("Error sending Contact Request:", err);
			const errorMessage =
				err.response?.data?.message ||
				"Failed to send Contact Request. Please try again.";
			toast.error(errorMessage);
			setSubmitStatus({ message: errorMessage, type: "error" });
		}
	};

	return (
		<>
			{/* TOP PART */}
			<div
				className="w-full h-full bg-cover bg-center py-4 sm:px-10 lg:px-30"
				style={{ backgroundImage: `url(${AboutBG})` }}>
				<div className={"w-full h-[58px] flex flex-row items-center gap-2"}>
					<a
						href="/"
						className=" text-[#444445] cursor-pointer text-base sm:text-[22px]"
						onClick={(e) => {
							e.preventDefault();
							navigate("/");
						}}>
						Home
					</a>
					<span className=" text-[#444445] text-base sm:text-[22px]">
						{">"}
					</span>
					<button
						onClick={() => navigate(-1)}
						className="text-[#444445] cursor-pointer text-base sm:text-[22px] bg-transparent border-0 p-0">
						Contact us
					</button>
				</div>
				<div className="w-full flex flex-col justify-center items-center text-center px-4">
					<h1 className="text-[28px] sm:text-[42px] font-serif font-bold mb-3 sm:mb-5">
						Contact Us
					</h1>
					<p className="text-[16px] sm:text-[20px] text-center sm:px-10 lg:px-20 xl:px-40">
						Welcome to the GemRishi Contact Page! Whether you’re seeking advice
						on selecting certified gemstones, have questions about their
						astrological significance, or need assistance with your order, our
						team is here to help. We are committed to providing high-quality
						customer service and ensuring you have an exceptional experience
						with GemRishi.
					</p>
				</div>
			</div>

			{/* BOTTOM PART */}
			<div className="max-w-[1200px] mx-auto px-4 py-12 sm:py-16">
				{/* Contact Details and Form Section */}
				<div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
					{/* Left Column: Details and Map */}
					<div className="w-full lg:w-1/2">
						<h2 className="text-2xl sm:text-3xl font-bold mb-6">Contact us</h2>

						{/* Details */}
						<div className="flex flex-col sm:flex-row gap-8 sm:gap-16 mb-8">
							{/* Our showroom */}
							<div>
								<h3 className="text-lg sm:text-xl font-semibold mb-2">
									Our showroom
								</h3>
								<p className="text-gray-700 text-base leading-relaxed">
									5395, Nicholson Road,
									<br />
									Ambala Cantt, Haryana
									<br />
									133001, IN
									<br />
									+91 9817975978
								</p>
							</div>

							{/* Quick Help */}
							<div>
								<h3 className="text-lg sm:text-xl font-semibold mb-2">
									Quick Help
								</h3>
								<p className="text-gray-700 text-base leading-relaxed">
									You can ask anything you
									<br />
									want to know about our
									<br />
									products
									<br />
									<a
										href="mailto:wecare@gemrishi.com"
										className="text-blue-600 hover:underline">
										wecare@gemrishi.com
									</a>
								</p>
							</div>
						</div>

						{/* Map */}
						<div className="w-full h-[260px] sm:h-[320px] lg:h-[350px] border border-gray-300">
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3460.597621438965!2d76.84074817539401!3d30.38006457467727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ff5b0d6252069%3A0x28636e099684128!2sNicholson%20Road%2C%20Ambala%20Cantt%2C%20Haryana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
								width="100%"
								height="100%"
								style={{ border: 0 }}
								allowFullScreen=""
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								title="GemRishi Location Map"></iframe>
						</div>
					</div>

					{/* Right Column: Form */}
					<div className="w-full lg:w-1/2 p-6 sm:p-8 border border-gray-200 rounded-lg shadow-md">
						<h2 className="text-[20px] sm:text-[24px] mb-6">Get in Touch</h2>

						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Name */}
							<div>
								<input
									type="text"
									name="name"
									placeholder="Your Name"
									value={formState.name}
									onChange={handleChange}
									onBlur={handleBlur}
									aria-invalid={!!errors.name}
									aria-describedby="name-error"
									className={`w-full p-3 border rounded-[10px] text-[18px] font-serif outline-none focus:ring-2 ${
										errors.name
											? "border-red-500 focus:ring-red-300"
											: "border-gray-300 focus:ring-[#264A3F]"
									}`}
								/>
								{errors.name && (
									<p id="name-error" className="mt-1 text-sm text-red-600">
										{errors.name}
									</p>
								)}
							</div>

							{/* Email */}
							<div>
								<input
									type="email"
									name="email"
									placeholder="Your Email"
									value={formState.email}
									onChange={handleChange}
									onBlur={handleBlur}
									aria-invalid={!!errors.email}
									aria-describedby="email-error"
									className={`w-full p-3 border rounded-[10px] text-[18px] font-serif outline-none focus:ring-2 ${
										errors.email
											? "border-red-500 focus:ring-red-300"
											: "border-gray-300 focus:ring-[#264A3F]"
									}`}
								/>
								{errors.email && (
									<p id="email-error" className="mt-1 text-sm text-red-600">
										{errors.email}
									</p>
								)}
							</div>

							{/* Gemstone Help */}
							<div>
								<div className="relative">
									<select
										name="gemstoneHelp"
										value={formState.gemstoneHelp}
										onChange={handleChange}
										onBlur={handleBlur}
										aria-invalid={!!errors.gemstoneHelp}
										aria-describedby="gemstoneHelp-error"
										className={`w-full p-3 border rounded-[10px] appearance-none bg-white text-[18px] font-serif outline-none focus:ring-2 ${
											errors.gemstoneHelp
												? "border-red-500 focus:ring-red-300"
												: "border-gray-300 focus:ring-[#264A3F]"
										}`}>
										<option value="" disabled>
											Select
										</option>
										<option value="Gemstone Help">Gemstone Help</option>
										<option value="Order">Order</option>
										<option value="Refund">Refund</option>
									</select>
									{/* Custom Arrow */}
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
										<svg
											className="fill-current h-4 w-4"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20">
											<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
										</svg>
									</div>
								</div>
								{errors.gemstoneHelp && (
									<p
										id="gemstoneHelp-error"
										className="mt-1 text-sm text-red-600">
										{errors.gemstoneHelp}
									</p>
								)}
							</div>

							{/* Message */}
							<div>
								<textarea
									name="message"
									placeholder="Message"
									rows="6"
									value={formState.message}
									onChange={handleChange}
									onBlur={handleBlur}
									aria-invalid={!!errors.message}
									aria-describedby="message-error"
									className={`w-full p-3 border rounded-[10px] text-[18px] font-serif outline-none focus:ring-2 resize-y ${
										errors.message
											? "border-red-500 focus:ring-red-300"
											: "border-gray-300 focus:ring-[#34495e]"
									}`}
								/>
								{errors.message && (
									<p id="message-error" className="mt-1 text-sm text-red-600">
										{errors.message}
									</p>
								)}
							</div>

							{/* Submit */}
							<button
								type="submit"
								className="w-full bg-[#264A3F] text-white py-3 hover:bg-[#1e3c33] transition duration-300 font-semibold rounded-[10px]">
								Submit
							</button>
							{submitStatus.message && (
								<p
									className={`mt-4 text-center text-sm font-medium ${
										submitStatus.type === "success"
											? "text-green-600"
											: "text-red-600"
									}`}
									aria-live="assertive">
									{submitStatus.message}
								</p>
							)}
						</form>
					</div>
				</div>

				{/* Why Choose GemRishi? */}
				<div className="mt-16">
					<h2 className="text-[20px] sm:text-[24px] font-serif mb-6">
						Why Choose GemRishi?
					</h2>

					<p className="text-gray-700 text-base sm:text-lg mb-4">
						As a trusted source for certified gemstones, GemRishi offers:
					</p>

					<ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
						<li>
							<strong>Authenticity:</strong> We provide certified gemstones with
							trusted verification from reputable gemological laboratories.
						</li>
						<li>
							<strong>Expert Advice:</strong> Our team includes knowledgeable
							gemstone experts who guide you in making the best choice.
						</li>
						<li>
							<strong>Astrological Benefits:</strong> We help customers
							understand the astrological significance of gemstones, ensuring
							you select one that aligns with your birth chart and enhances
							positive planetary influences.
						</li>
					</ul>
				</div>
			</div>

			{/* FAQ + Testimonials */}
			<FAQAccordion />
			{/*<Testimonials />*/}
			<GemstoneReviews />
		</>
	);
}

export default ContactUs;
