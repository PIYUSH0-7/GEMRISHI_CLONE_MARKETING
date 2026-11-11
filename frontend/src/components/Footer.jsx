import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import Facebook from "../assets/SocialMedia/facebook.svg";
import Insta from "../assets/SocialMedia/Insta.svg";
import Youtube from "../assets/SocialMedia/youtube.svg";
import Whatsapp from "../assets/SocialMedia/whatsapp.svg";
import { addEmailSubscription } from "../api/emailapi";
import { CAMPAIGN_CONFIG, isCampaignActive } from "../config/campaignOffers.config.js";

const preciousGemstones = [
	// Core types
	{ label: "Emerald (Panna)", slug: "emerald" },
	{ label: "Ruby (Manik)", slug: "ruby" },
	{ label: "Yellow Sapphire (Pukhraj)", slug: "yellow-sapphire" },
	{ label: "Blue Sapphire (Neelam)", slug: "blue-sapphire" },
	{ label: "White Sapphire", slug: "white-sapphire" },
	{ label: "Hessonite (Gomed)", slug: "hessonite" },
	{ label: "Red Coral (Moonga)", slug: "red-coral" },
	{ label: "Pearl (Moti)", slug: "pearl" },
	{ label: "Cat's Eye (Lahsuniya)", slug: "cats-eye" },
	// Emerald by carat
	{ label: "2 Carat Emerald", path: "/gemstone/filter/emerald?subcategory=Emerald&minCarat=2&maxCarat=3" },
	{ label: "3 Carat Emerald", path: "/gemstone/filter/emerald?subcategory=Emerald&minCarat=3&maxCarat=4" },
	{ label: "4 Carat Emerald", path: "/gemstone/filter/emerald?subcategory=Emerald&minCarat=4&maxCarat=5" },
	{ label: "5 Carat Emerald", path: "/gemstone/filter/emerald?subcategory=Emerald&minCarat=5&maxCarat=6" },
	{ label: "6 Carat Emerald", path: "/gemstone/filter/emerald?subcategory=Emerald&minCarat=6&maxCarat=7" },
	{ label: "8 Carat Emerald", path: "/gemstone/filter/emerald?subcategory=Emerald&minCarat=8&maxCarat=100" },
	// Emerald by ratti
	{ label: "5 Ratti Emerald", slug: "emerald" },
	{ label: "6 Ratti Emerald", slug: "emerald" },
	{ label: "7 Ratti Emerald", slug: "emerald" },
	{ label: "8 Ratti Emerald", slug: "emerald" },
	// Emerald by origin
	{ label: "Colombian Emerald", slug: "emerald" },
	{ label: "Zambian Emerald", slug: "emerald" },
	{ label: "Brazilian Emerald", slug: "emerald" },
	// Emerald by price
	{ label: "Emerald under Rs.10,000", path: "/gemstone/filter/emerald?subcategory=Emerald&maxPrice=10000" },
	{ label: "Emerald under Rs.20,000", path: "/gemstone/filter/emerald?subcategory=Emerald&maxPrice=20000" },
	{ label: "Emerald under Rs.30,000", path: "/gemstone/filter/emerald?subcategory=Emerald&maxPrice=30000" },
	{ label: "Emerald under Rs.50,000", path: "/gemstone/filter/emerald?subcategory=Emerald&maxPrice=50000" },
	// Ruby by carat
	{ label: "2 Carat Ruby", path: "/gemstone/filter/ruby?subcategory=Ruby&minCarat=2&maxCarat=3" },
	{ label: "3 Carat Ruby", path: "/gemstone/filter/ruby?subcategory=Ruby&minCarat=3&maxCarat=4" },
	{ label: "4 Carat Ruby", path: "/gemstone/filter/ruby?subcategory=Ruby&minCarat=4&maxCarat=5" },
	{ label: "5 Carat Ruby", path: "/gemstone/filter/ruby?subcategory=Ruby&minCarat=5&maxCarat=6" },
	{ label: "6 Carat Ruby", path: "/gemstone/filter/ruby?subcategory=Ruby&minCarat=6&maxCarat=7" },
	{ label: "8 Carat Ruby", path: "/gemstone/filter/ruby?subcategory=Ruby&minCarat=8&maxCarat=9" },
	// Ruby by ratti
	{ label: "5 Ratti Ruby", slug: "ruby" },
	{ label: "6 Ratti Ruby", slug: "ruby" },
	{ label: "African Ruby", slug: "ruby" },
	// Ruby by price
	{ label: "Ruby under Rs.10,000", path: "/gemstone/filter/ruby?subcategory=Ruby&maxPrice=10000" },
	{ label: "Ruby under Rs.20,000", path: "/gemstone/filter/ruby?subcategory=Ruby&maxPrice=20000" },
	{ label: "Ruby under Rs.30,000", path: "/gemstone/filter/ruby?subcategory=Ruby&maxPrice=30000" },
	{ label: "Ruby under Rs.40,000", path: "/gemstone/filter/ruby?subcategory=Ruby&maxPrice=40000" },
	// Yellow Sapphire
	{ label: "2 Carat Yellow Sapphire", path: "/gemstone/filter/yellow-sapphire?subcategory=Yellow%20Sapphire&minCarat=2&maxCarat=3" },
	{ label: "4 Carat Yellow Sapphire", path: "/gemstone/filter/yellow-sapphire?subcategory=Yellow%20Sapphire&minCarat=4&maxCarat=5" },
	{ label: "5 Ratti Pukhraj", slug: "yellow-sapphire" },
	{ label: "6 Ratti Pukhraj", slug: "yellow-sapphire" },
	{ label: "Ceylon Yellow Sapphire", slug: "yellow-sapphire" },
	{ label: "Royal Yellow Sapphire", slug: "yellow-sapphire" },
	// Blue Sapphire
	{ label: "5 Carat Blue Sapphire", path: "/gemstone/filter/blue-sapphire?subcategory=Blue%20Sapphire&minCarat=5&maxCarat=6" },
	{ label: "5 Ratti Neelam", slug: "blue-sapphire" },
	{ label: "6 Ratti Neelam", slug: "blue-sapphire" },
	{ label: "Ceylon Blue Sapphire", slug: "blue-sapphire" },
	{ label: "Royal Blue Sapphire", slug: "blue-sapphire" },
	// Red Coral
	{ label: "5 Ratti Red Coral", slug: "red-coral" },
	{ label: "6 Ratti Red Coral", slug: "red-coral" },
	{ label: "Italian Red Coral", slug: "red-coral" },
	// Pearl
	{ label: "5 Ratti Pearl", slug: "pearl" },
	{ label: "6 Ratti Pearl", slug: "pearl" },
	{ label: "South Africa Pearl", slug: "pearl" },
	{ label: "South Sea Pearl", slug: "pearl" },
	// By color
	{ label: "Green Gemstones", slug: "emerald" },
	{ label: "Red Gemstones", slug: "ruby" },
	{ label: "Blue Gemstones", slug: "blue-sapphire" },
	{ label: "Pink Gemstones", slug: "pink-sapphire" },
	{ label: "Yellow Gemstones", slug: "yellow-sapphire" },
];

const semiPreciousGemstones = [
	// Opal
	{ label: "Opal (Uppal)", slug: "opal" },
	{ label: "Australian Opal", slug: "opal" },
	{ label: "Ethiopian Opal", slug: "opal" },
	{ label: "Black Opal", path: "/gemstone/black-opal-" },
	{ label: "5 Carat Opal", path: "/gemstone/filter/opal?subcategory=Opal&minCarat=5&maxCarat=6" },
	{ label: "8 Carat Opal", path: "/gemstone/filter/opal?subcategory=Opal&minCarat=8&maxCarat=9" },
	{ label: "11 Carat Opal", path: "/gemstone/filter/opal?subcategory=Opal&minCarat=11&maxCarat=12" },
	{ label: "Opal under Rs.5,000", path: "/gemstone/filter/opal?subcategory=Opal&maxPrice=5000" },
	{ label: "Opal under Rs.10,000", path: "/gemstone/filter/opal?subcategory=Opal&maxPrice=10000" },
	// Garnet
	{ label: "Red Garnet (Rakt Mani)", slug: "red-garnet" },
	{ label: "Hessonite Garnet", slug: "hessonite" },
	{ label: "Rhodolite Garnet", slug: "garnet" },
	// Moonstone
	{ label: "Moonstone (Chandrakant Mani)", slug: "moonstone" },
	{ label: "Rainbow Moonstone", slug: "moonstone" },
	{ label: "Blue Moonstone", slug: "moonstone" },
	// Cat's Eye
	{ label: "Cat's Eye (Lehsuniya)", slug: "cats-eye" },
	// Onyx
	{ label: "Green Onyx (Sulemani)", slug: "green-onyx" },
	{ label: "Black Onyx", slug: "black-onyx" },
	// Citrine
	{ label: "Citrine (Sunela)", slug: "citrine" },
	{ label: "5 Ratti Citrine", slug: "citrine" },
	{ label: "6 Ratti Citrine", slug: "citrine" },
	// Other semi-precious
	{ label: "Amethyst (Katela)", slug: "amethyst" },
	{ label: "Turquoise (Firoza)", slug: "turquoise" },
	{ label: "Paraiba Tourmaline", slug: "tourmaline" },
	{ label: "Rose Quartz", slug: "rose-quartz" },

	{ label: "Lapis Lazuli", slug: "lapis-lazuli" },
	{ label: "Ruby Mozambique", slug: "ruby" },
	{ label: "Tourmaline", slug: "tourmaline" },
	{ label: "Aquamarine", slug: "aquamarine" },
	{ label: "Zircon (Jarkan)", slug: "zircon" },
	// By color
	{ label: "White Gemstones", slug: "white-sapphire" },
	{ label: "Purple Gemstones", slug: "amethyst" },
	{ label: "Orange Gemstones (Citrine)", slug: "citrine" },
];

function Footer() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [subCategories, setSubCategories] = useState([]);
// ------------------------------Add By Pawan for hide popular search-------------------------------------

	// Fetch official slugs from the backend so we perfectly match quirky ones like "ruby-"
	useEffect(() => {
		const fetchSubcategories = async () => {
			try {
				const URL = import.meta.env.VITE_URL;
				if (!URL) return;
				const res = await axios.get(`${URL}/subcategory/get-subcategories`);
				if (res.data?.subcategories) {
					setSubCategories(res.data.subcategories);
				}
			} catch (error) {
				console.error("Footer: Failed to fetch subcategories", error);
			}
		};
		fetchSubcategories();
	}, []);

	/**
	 * Resolve the final URL slug for a gemstone item.
	 * Priority: backend subcategory match → hardcoded slug fallback.
	 */
	const resolveSlug = (item) => {
		if (!subCategories.length) return item.slug;

		// Try matching by hardcoded slug first
		const bySlug = subCategories.find(
			(sub) => sub.slug === item.slug
		);
		if (bySlug) return bySlug.slug;

		// Try matching by label (strip parentheticals)
		const cleanLabel = item.label.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
		const byName = subCategories.find(
			(sub) => sub.name?.toLowerCase().trim() === cleanLabel
		);
		if (byName) return byName.slug || byName.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

		// Fall back to hardcoded slug
		return item.slug;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({
			event: "newsletter_click",
			newsletter_action: "submit",
			newsletter_location: "Footer",
		});

		if (!email.trim()) {
			toast.error("Please enter a valid email address.");
			return;
		}

		try {
			setLoading(true);
			const response = await addEmailSubscription(email);
			window.dataLayer.push({
				event: "newsletter_signup",
				newsletter_status: "success",
				newsletter_location: "Footer",
			});
			toast.success(response?.message || "Subscribed successfully!");
			setEmail("");
		} catch (error) {
			window.dataLayer.push({
				event: "newsletter_signup",
				newsletter_status: "failed",
				newsletter_location: "Footer",
			});
			toast.error(
				error.response?.data?.message ||
				"Subscription failed. Please try again later."
			);
		} finally {
			setLoading(false);
		}
	};

	const renderGemstoneLinks = (list) =>
		list.map((item, index) => {
			const slug = resolveSlug(item);
			const finalPath = item.path || `/gemstone/${slug}`;
			return (
				<React.Fragment key={index}>
					<Link
						to={finalPath}
						className="hover:text-white hover:underline transition-colors whitespace-nowrap"
					>
						{item.label}
					</Link>
					{index < list.length - 1 && (
						<span className="text-white/40">|</span>
					)}
				</React.Fragment>
			);
		});

	return (
		<footer className="w-full bg-[#264A3F] text-white">
			{/* Content Section */}
			<div className="max-w-[1300px] mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
				{/* Our Company */}
				<div>
					<h3 className="text-[22px] font-bold mb-3">Our Company</h3>
					<ul className="space-y-2">
						<li>
							<Link to="/aboutUs">About Us</Link>
						</li>
						<li>
							<Link to="/career">Careers</Link>
						</li>
						<li>
							<Link to="/testimonals">Testimonials</Link>
						</li>
						{isCampaignActive() && CAMPAIGN_CONFIG.ui.showFooterLink && (
							<li>
								<Link to="/offers" className="text-[#E7D3B5] font-medium hover:underline">Festive Offers</Link>
							</li>
						)}
					</ul>
				</div>

{/* ------------------Changed  by Pawan Gemrishi Policy-------------------------------------------- */}
				<div>
					<h3 className="text-[22px] font-bold mb-3">Gemrishi Policy</h3>
					<ul className="space-y-2">
						<li>
							<Link to="/privacy">Privacy Policy</Link>
						</li>
						<li>
							<Link to="/shipping">Shipping &amp; Returns</Link>
						</li>
						<li>
							<Link to="/custom-duties">Custom Duties</Link>
						</li>
						<li>
							<Link to="/return-policy">Return Policy</Link>
						</li>
					</ul>
				</div>

				{/* Customer Support */}
				<div>
					<h3 className="text-[22px] font-bold mb-3">Customer Support</h3>
					<ul className="space-y-2">
						<li>
							<Link to="/gemstone-buy-guide">Gemstone Guide</Link>
						</li>
						<li>
							<Link to="/ring-size">Ring Size Guide</Link>
						</li>
						<li>
							<Link to="/carat-to-ratti-converter">Carat to Ratti Converter</Link>
						</li>
					</ul>
				</div>

				{/* Ambala Showroom */}
				<div>
					<h3 className="text-[22px] font-bold mb-3">Ambala Showroom</h3>
					<ul className="space-y-2 text-[15px]">
						<li>Nicholson Road, Ambala Haryana 133001</li>
						<li>
							<a
								href="tel:+919817975978"
								onClick={() => {
									window.dataLayer = window.dataLayer || [];
									window.dataLayer.push({
										event: "phone_click",
										phone_number: "+919817975978",
										click_location: "Footer Ambala Showroom",
									});
								}}
							>
								+91 98179 75978
							</a>
						</li>
						<li>
							<a href="mailto:wecare@gemrishi.com">wecare@gemrishi.com</a>
						</li>
					</ul>
				</div>

				{/* Shimla Showroom */}
				<div>
					<h3 className="text-[22px] font-bold mb-3">Shimla Showroom</h3>
					<ul className="space-y-2 text-[15px]">
						<li>Mall Road, Shimla</li>
						<li>
							<a
								href="tel:+919817975972"
								onClick={() => {
									window.dataLayer = window.dataLayer || [];
									window.dataLayer.push({
										event: "phone_click",
										phone_number: "+919817975972",
										click_location: "Footer Shimla Showroom",
									});
								}}
							>
								+91 98179 75972
							</a>
						</li>
						<li>
							<a href="mailto:wecare@gemrishi.com">wecare@gemrishi.com</a>
						</li>
	
					</ul>
				</div>

				{/* Solan Showroom */}
				<div>
					<h3 className="text-[22px] font-bold mb-3">Solan Showroom</h3>
					<ul className="space-y-2 text-[15px]">
						<li>Ward 7, G Square Mall, Solan, Himachal Pradesh 173212</li>
						<li>
							<a
								href="tel:+917496997220"
								onClick={() => {
									window.dataLayer = window.dataLayer || [];
									window.dataLayer.push({
										event: "phone_click",
										phone_number: "+917496997220",
										click_location: "Footer Solan Showroom",
									});
								}}
							>
								+91 74969 97220
							</a>
						</li>
						<li>
							<a href="mailto:wecare@gemrishi.com">wecare@gemrishi.com</a>
						</li>
				</ul>
				</div>
			</div>
{/* -----------Add By Pawan -------------------------------------------------------------------- */}
			{/* Subscribe and Social Section */}
			<div className="max-w-[1300px] mx-auto px-5 py-8 flex flex-col lg:flex-row justify-between items-center gap-8 border-t border-white/25">
				<div className="w-full lg:w-auto text-center lg:text-left">
					<p className="text-[18px] font-medium mb-4">
						Subscribe to get exclusive offers and new arrivals
					</p>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[500px] mx-auto lg:mx-0"
					>
						<input
							type="email"
							placeholder="Enter Email Address"
							aria-label="Email address for newsletter subscription"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full sm:w-[350px] h-[48px] rounded-lg px-4 text-[#264A3F] bg-white focus:outline-none"
						/>
						<button
							type="submit"
							disabled={loading}
							aria-label="Subscribe to newsletter"
							className="bg-white text-[#264A3F] font-bold px-6 h-[48px] rounded-lg hover:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
						>
							{loading ? "Subscribing..." : "Subscribe"}
						</button>
					</form>
				</div>

				{/* Social Media */}
				<div className="flex gap-6 justify-center lg:justify-end w-full lg:w-auto mt-6 lg:mt-0">
					<a
						href="https://api.whatsapp.com/send/?phone=919817975978&text&type=phone_number&app_absent=0"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Connect with GemRishi on WhatsApp"
					>
						<img src={Whatsapp} alt="Whatsapp" width="28" height="28" className="w-[28px] h-[28px]" />
					</a>
					<a
						href="https://www.facebook.com/gemrishi"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Follow GemRishi on Facebook"
					>
						<img src={Facebook} alt="Facebook" width="28" height="28" className="w-[28px] h-[28px]" />
					</a>
					<a
						href="https://instagram.com/gemrishi/"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Follow GemRishi on Instagram"
					>
						<img src={Insta} alt="Instagram" width="28" height="28" className="w-[28px] h-[28px]" />
					</a>
					<a
						href="https://www.youtube.com/@GemRishi"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Subscribe to GemRishi on YouTube"
					>
						<img src={Youtube} alt="YouTube" width="28" height="28" className="w-[28px] h-[28px]" />
					</a>
				</div>
			</div>

			{/* Popular Searches Section */}
			<div className="max-w-[1300px] mx-auto px-5 py-8 border-t border-white/25">
				<h3 className="text-[22px] font-bold mb-4">Popular Searches</h3>

				<div className="mb-6">
					<h4 className="text-[18px] font-semibold text-white/90 mb-2">
						Precious Gemstones
					</h4>
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] sm:text-[14px] text-white/80 leading-relaxed">
						{renderGemstoneLinks(preciousGemstones)}
					</div>
				</div>

				<div>
					<h4 className="text-[18px] font-semibold text-white/90 mb-2">
						Semi-Precious Gemstones
					</h4>
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] sm:text-[14px] text-white/80 leading-relaxed">
						{renderGemstoneLinks(semiPreciousGemstones)}
					</div>
				</div>
			</div>

			{/* Copyright Section */}
			<div className="border-t border-white/25 py-5 text-center">
				<p className="text-[13px] lg:text-[15px] mb-3">
					Copyright &copy;2025 <span className="font-semibold">(GemRishi)</span>{" "}
					| Venture by Fateh Chand Bansi Lal Jewellers Private Limited
				</p>
				<div className="flex flex-col lg:flex-row gap-4 items-center justify-center text-[16px]">
					<Link to="/terms" className="hover:underline">
						Terms and Services
					</Link>
					<Link to="/privacy" className="hover:underline">
						Privacy Policy
					</Link>
				</div>
			</div>
			
		</footer>
	);
}

export default Footer;