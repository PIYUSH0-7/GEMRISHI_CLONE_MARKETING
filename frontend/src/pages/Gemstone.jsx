import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tabs from "../components/Tabs";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import SlideImage from "./Home/SlideImage";
import TrustBadges from "../components/trust";
import { fixImageUrl } from "../utils/imageUtils";

// Banner served from /public
const gemstonesBanner = "/AllGemstone.webp";
import royalRubyImg from "../assets/gemstones/royal-ruby.png";
import royalYellowSapphireImg from "../assets/gemstones/royal-yellowsapphire.jpg";
import royalEmeraldImg from "../assets/gemstones/royal-emerald.jpg";
import royalBlueSapphireImg from "../assets/gemstones/royal-bluesapphire.jpg";
import royalRedCoralImg from "../assets/gemstones/royal-redcoral.jpg";
import coralImg from "../assets/Stone/Coral.svg";

const URL = import.meta.env.VITE_URL;

const GEMSTONE_COLOR_MAP = {
	emerald: "green",
	"colombian-emerald": "green",
	"green-onyx": "green",
	"peridot-zabarjad": "green",
	peridot: "green",
	alexandrite: "green",
	tourmaline: ["green", "earthy"],

	"blue-sapphire": "blue",
	"kashmir-blue-sapphire": "blue",
	aquamarine: "blue",
	turquoise: "blue",
	"iolite-neeli": "blue",
	"paraiba-tourmaline": "blue",
	"bi-color-sapphire": "blue",
	"lapis-lazuli": "blue",
	lapis: "blue",

	"yellow-sapphire": "yellow",
	citrine: "yellow",
	hessonite: ["yellow", "earthy"],
	"cats-eye": ["yellow", "earthy"],
	pyrite: ["yellow", "earthy"],
	"tiger-s-eye": ["yellow", "earthy"],
	"yellow-topaz": "yellow",
	topaz: "yellow",

	ruby: "red",
	"red-coral": "red",
	"red-garnet": "red",

	"pink-sapphire": "pink",
	morganite: "pink",
	"rose-quartz": ["pink", "earthy"],
	kunzite: "pink",

	amethyst: "purple",
	"purple-sapphire": "purple",

	pearl: "white",
	"white-sapphire": "white",
	"white-coral": "white",
	moonstone: ["white", "earthy"],
	diamond: "white",
	zircon: "white",
	opal: ["white", "earthy"],

	"black-onyx": "black",
	"black-opal": ["black", "earthy"],
	"gun-metal": ["black", "earthy"],
	"hakik-agate": ["black", "earthy", "red"],
};

const COLOR_FILTERS = [
	{ id: "all", label: "All Gemstones" },
	{ id: "green", label: "Green", dot: "#16A34A" },
	{ id: "blue", label: "Blue", dot: "#2563EB" },
	{ id: "yellow", label: "Yellow", dot: "#EAB308" },
	{ id: "red", label: "Red", dot: "#DC2626" },
	{ id: "pink", label: "Pink", dot: "#EC4899" },
	{ id: "purple", label: "Purple", dot: "#9333EA" },
	{ id: "white", label: "White / Clear", dot: "#9CA3AF" },
	{ id: "black", label: "Black", dot: "#18181B" },
	{ id: "earthy", label: "Earthy / Crystal", dot: "#854D0E" },
];

const defaultImages = [
	"/ring.png",
	"/pendant.png",
	"/bracelet.png",
	"/brooch.png",
	"/emerald.png",
	"/ruby.png",
	"/sapphire.png",
	"/opal.png",
	"/topaz.png",
];

const PRECIOUS_GEMSTONES = [
	{
		id: 1,
		name: "Ruby",
		hindiName: "Manik",
		slug: "ruby",
		planet: "Sun (Surya)",
		chakra: "Manipura (Solar)",
		description:
			"Revered as the King of Gemstones, natural untreated Ruby represents Surya (The Sun). Bestowed with fiery crimson brilliance, it enhances leadership, authority, vitality, fame, and self-confidence for ambitious professionals and royal legacy.",
		image: royalRubyImg,
		fallbackImage: royalRubyImg,
		bgTint: "from-rose-50/80 via-red-50/40 to-stone-50/30",
		accentColor: "#991B1B",
	},
	{
		id: 2,
		name: "Yellow Sapphire",
		hindiName: "Pukhraj",
		slug: "yellow-sapphire",
		planet: "Jupiter (Brihaspati)",
		chakra: "Solar & Crown",
		description:
			"Blessed by Brihaspati (Jupiter), unheated Yellow Sapphire channels divine wisdom, prosperity, and spiritual ascension. Known for attracting auspicious wealth, career breakthroughs, and high status, it brings good fortune and clarity.",
		image: royalYellowSapphireImg,
		fallbackImage: royalYellowSapphireImg,
		bgTint: "from-amber-50/80 via-yellow-50/40 to-stone-50/30",
		accentColor: "#D97706",
	},
	{
		id: 3,
		name: "Emerald",
		hindiName: "Panna",
		slug: "emerald",
		planet: "Mercury (Budh)",
		chakra: "Anahata (Heart)",
		description:
			"Ruled by Budh (Mercury), natural certified Emerald radiates soothing green vibrancy. It sharpens intellectual depth, communicative eloquence, business acumen, and creative focus, making it a cornerstone for entrepreneurs and scholars.",
		image: royalEmeraldImg,
		fallbackImage: royalEmeraldImg,
		bgTint: "from-emerald-50/80 via-teal-50/40 to-stone-50/30",
		accentColor: "#264A3F",
	},
	{
		id: 4,
		name: "Blue Sapphire",
		hindiName: "Neelam",
		slug: "blue-sapphire",
		planet: "Saturn (Shani)",
		chakra: "Ajna (Third Eye)",
		description:
			"The most potent astrological gemstone governed by Shani (Saturn). Natural Blue Sapphire is celebrated for its swift and decisive results, clearing karmic hurdles, bestowing laser focus, and shielding against negative influences.",
		image: royalBlueSapphireImg,
		fallbackImage: royalBlueSapphireImg,
		bgTint: "from-blue-50/80 via-indigo-50/40 to-stone-50/30",
		accentColor: "#1E40AF",
	},
	{
		id: 5,
		name: "Red Coral",
		hindiName: "Moonga",
		slug: "red-coral",
		planet: "Mars (Mangal)",
		chakra: "Muladhara (Root)",
		description:
			"Formed in pristine deep ocean reefs and ruled by Mangal (Mars), natural Red Coral fuels ambition, physical stamina, and fearless determination. It revitalizes energy, wards off lethargy, and empowers goal-oriented leadership.",
		image: royalRedCoralImg,
		fallbackImage: royalRedCoralImg,
		bgTint: "from-red-50/80 via-orange-50/40 to-stone-50/30",
		accentColor: "#DC2626",
	},
];

const Gemstone = () => {
	const navigate = useNavigate();

	// ⭐ From your axios useEffect
	const [subcategories, setSubcategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedColor, setSelectedColor] = useState("all");

	// Filtered subcategories based on selected color filter
	const filteredSubcategories = useMemo(() => {
		if (selectedColor === "all") return subcategories;
		return subcategories.filter((stone) => {
			const slug = (stone.slug || "").toLowerCase().trim();
			const name = (stone.name || "").toLowerCase().trim();
			const cleanSlug = slug.replace(/[^a-z0-9]/g, "-");
			const cleanName = name.replace(/[^a-z0-9]/g, "-");

			const mappedColor =
				GEMSTONE_COLOR_MAP[slug] ||
				GEMSTONE_COLOR_MAP[cleanSlug] ||
				GEMSTONE_COLOR_MAP[cleanName];

			if (Array.isArray(mappedColor)) {
				return mappedColor.includes(selectedColor);
			}
			if (mappedColor) {
				return mappedColor === selectedColor;
			}
			if (name.includes(selectedColor)) return true;
			return false;
		});
	}, [subcategories, selectedColor]);

	// -----------------------------
	// ⭐ Fetch Subcategories
	// -----------------------------
	useEffect(() => {
		const fetchData = async () => {
			try {
				let res;
				try {
					res = await axios.get("https://api.gemrishi.com/api/v1/subcategory/get-subcategories");
				} catch {
					res = await axios.get(`${URL || "http://localhost:7788/api/v1"}/subcategory/get-subcategories`);
				}

				const fetched = Array.isArray(res?.data?.subcategories)
					? res.data.subcategories
					: [];

				const mapped = fetched.map((item, idx) => ({
					...item,
					image: item.image?.url || item.image?.fileName || item.image || defaultImages[idx % defaultImages.length],
				}));

				setSubcategories(mapped);
				setError(false);
			} catch (e) {
				console.error(e);
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const getPreciousStoneImage = (gem) => {
		if (gem.image) {
			return gem.image;
		}

		const match = subcategories.find((s) => {
			const sSlug = (s.slug || "").toLowerCase();
			const sName = (s.name || "").toLowerCase().replace(/\s+/g, "");
			const targetSlug = gem.slug.toLowerCase();
			const targetName = gem.name.toLowerCase().replace(/\s+/g, "");
			return (
				sSlug === targetSlug ||
				sName === targetName ||
				sSlug.includes(targetSlug) ||
				sName.includes(targetName)
			);
		});

		if (match) {
			const candidate = match.image?.url || match.image;
			if (candidate) {
				return fixImageUrl(candidate);
			}
		}
		return gem.fallbackImage;
	};

	return (
		<div className="w-full">
			<Helmet>
				<title>Gemstones | GemRishi India</title>
				<meta
					name="description"
					content="Explore certified natural gemstones from GemRishi India. Birthstones, healing crystals, and astrology gems with authentic certificates."
				/>
			</Helmet>

			{/* Top Banner just below navbar */}
			<div className="w-full overflow-hidden border-b border-gray-100 bg-[#0e2a1e]">
				<img
					src={gemstonesBanner}
					alt="Natural Gemstones - Certified Collection"
					className="w-full h-[160px] sm:h-[220px] md:h-auto object-cover md:object-contain object-center block"
					width="1600"
					height="541"
					fetchPriority="high"
					loading="eager"
				/>
			</div>

			{/* All Gemstones Grid - Exact template matching reference image */}
			<div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-14">
				{/* Collection Title & Subtitle - Full-width & Left-aligned */}
				<div className="text-left mb-6 sm:mb-10 w-full">
					{/* <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
						Natural Gemstones
					</h1> */}

					<p className="text-sm sm:text-base md:text-lg text-gray-600 w-full leading-relaxed mb-5 sm:mb-6">
						Explore our exquisite collection of 100% natural and certified gemstones, ethically sourced from around the globe. From vibrant rubies and deep blue sapphires to luminous emeralds, each stone is hand-selected for its extraordinary brilliance, color, and authenticity. Find the perfect gemstone to elevate your personal jewelry collection or align with your astrological journey.
					</p>

					{/* Color Filter Pills - Placed directly below description */}
					<div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1 w-full">
						{COLOR_FILTERS.map((filter) => {
							const isSelected = selectedColor === filter.id;
							return (
								<button
									key={filter.id}
									type="button"
									onClick={() => setSelectedColor(filter.id)}
									className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
										isSelected
											? "bg-[#1A362D] text-white shadow-sm border border-[#1A362D]"
											: "bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-2xs"
									}`}
								>
									{filter.dot && (
										<span
											className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
											style={{ backgroundColor: filter.dot }}
										/>
									)}
									<span>{filter.label}</span>
								</button>
							);
						})}
					</div>

					{/* Slim borderline below filter buttons */}
					<div className="w-full border-b border-gray-200 mt-5 sm:mt-6"></div>
				</div>

				{loading && (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0">
						{[...Array(10)].map((_, i) => (
							<div
								key={i}
								className="flex flex-col aspect-square w-full bg-white p-3 rounded-none animate-pulse"
							>
								<div className="flex-1 w-full bg-gray-100 mb-2"></div>
								<div className="h-3.5 bg-gray-100 w-3/4 mx-auto shrink-0"></div>
							</div>
						))}
					</div>
				)}

				{!loading && filteredSubcategories.length > 0 && (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0">
						{filteredSubcategories.map((stone) => {
							const imageUrl = fixImageUrl(stone.image);

							return (
								<div
									key={stone._id || stone.slug}
									onClick={() => navigate(`/gemstone/${stone.slug}`)}
									className="group relative flex flex-col aspect-square w-full bg-white overflow-hidden rounded-none hover:z-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
								>
									{/* Gemstone Image - Balanced within square card */}
									<div className="flex-1 w-full min-h-0 overflow-hidden bg-white flex items-center justify-center p-2.5 sm:p-3.5">
										<img
											src={imageUrl}
											alt={stone.name}
											className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
											loading="lazy"
											onError={(e) => {
												e.target.onerror = null;
												const filename = (stone.image?.fileName || stone.image?.url || stone.image || "").split("/").pop();
												if (filename && !e.target.src.includes("api.gemrishi.com")) {
													e.target.src = `https://api.gemrishi.com/public/uploads/${filename}`;
												} else {
													e.target.src = "/ring.png";
												}
											}}
										/>
									</div>

									{/* Gemstone Title - Inside Card at bottom */}
									<div className="pb-2.5 pt-1 px-2 text-center bg-white shrink-0">
										<h3 className="text-xs sm:text-[13px] md:text-sm font-semibold text-gray-900 group-hover:text-[#264A3F] transition-colors leading-tight line-clamp-1">
											{stone.name}
										</h3>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{!loading && filteredSubcategories.length === 0 && (
					<div className="w-full text-center py-16 px-4 bg-gray-50 rounded-2xl border border-gray-100">
						<p className="text-gray-500 text-base sm:text-lg">
							No gemstones found for the selected filter.
						</p>
						<button
							onClick={() => setSelectedColor("all")}
							className="mt-4 px-5 py-2 text-xs uppercase font-bold tracking-wider text-[#1A362D] border border-[#1A362D] rounded-full hover:bg-[#1A362D] hover:text-white transition-colors cursor-pointer"
						>
							View All Gemstones
						</button>
					</div>
				)}
			</div>

			{/* Precious Gemstones Alternating Section (as sketched) */}
			<section className="px-4 sm:px-8 mb-16 sm:mb-24">
				<div className="mb-10 sm:mb-14 pb-4 border-b border-gray-200">
					
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gray-900 font-bold">
						THE ROYAL GEMSTONES
					</h2>
					{/* <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl">
						Explore individual natural certified precious gemstones revered for their Vedic planetary energy, uncompromised purity, and timeless beauty.
					</p> */}
				</div>

				<div className="space-y-12 sm:space-y-16 lg:space-y-20">
					{PRECIOUS_GEMSTONES.map((gem, idx) => {
						const gemImage = getPreciousStoneImage(gem);
						const isEven = idx % 2 === 0;

						return (
							<div
								key={gem.slug}
								className={`flex flex-col ${
									isEven ? "md:flex-row" : "md:flex-row-reverse"
								} items-center gap-8 md:gap-12 lg:gap-16`}
							>
								{/* Image Card Container (Fresh Sharp Rectangle) */}
								<div
									onClick={() => navigate(`/gemstone/${gem.slug}`)}
									className="w-full md:w-1/2 cursor-pointer group"
								>
									<div className="relative aspect-[1024/535] rounded-none overflow-hidden bg-white shadow-xs hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1.5">
										<img
											src={gem.image || gemImage}
											alt={gem.name}
											className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
											loading="lazy"
											onError={(e) => {
												e.target.onerror = null;
												e.target.src = gem.fallbackImage;
											}}
										/>
									</div>
								</div>

								{/* Content Container (Title, Underline & Description as sketched) */}
								<div className="w-full md:w-1/2 flex flex-col justify-center text-left">
									<span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#264A3F] block mb-2">
										Vedic Planetary Gem
									</span>

									{/* Gemstone Title */}
									<h3
										onClick={() => navigate(`/gemstone/${gem.slug}`)}
										className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 cursor-pointer hover:text-[#264A3F] transition-colors"
									>
										{gem.name}
									</h3>

									{/* Underline matching the Excalidraw drawing */}
									<div
										className="w-16 h-[3px] rounded-full mt-3 mb-5"
										style={{ backgroundColor: gem.accentColor }}
									></div>

									{/* Description Text */}
									<p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
										{gem.description}
									</p>

									{/* Micro Attributes */}
									<div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-5">
										<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
											<span
												className="w-1.5 h-1.5 rounded-full"
												style={{ backgroundColor: gem.accentColor }}
											></span>
											Planet: {gem.planet}
										</span>
										<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
											<span
												className="w-1.5 h-1.5 rounded-full"
												style={{ backgroundColor: gem.accentColor }}
											></span>
											Chakra: {gem.chakra}
										</span>
									</div>

									{/* CTA Button */}
									<div className="pt-5 sm:pt-6">
										<button
											onClick={() => navigate(`/gemstone/${gem.slug}`)}
											className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#1A362D] text-white text-xs font-semibold uppercase tracking-[0.18em] rounded-sm hover:bg-stone-900 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer group"
										>
											<span>Shop {gem.name}</span>
											<svg
												className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>
			<SlideImage />

			<section className="bg-green-100">
				<TrustBadges />
			</section>
		</div>
	);
};

export default Gemstone;
