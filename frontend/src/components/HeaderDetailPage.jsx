import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactImageMagnify from "react-image-magnify";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getLatestMetalRates } from "../api/metalRates";
import Clock from "../assets/DetailPage/Clock.svg";
import Truck from "../assets/DetailPage/Truck.svg";
import { getProductUrl } from "../utils/productUrl";
import CompareButton from "./compare/CompareButton";
import SharePopup from "./SharePopup";
import WishlistButton from "./wishlistButton";
// ---------------Add By Pawan-------------------------------------
import { useSelector } from "react-redux";
import { ConvertFromINR, formatCurrency } from "../utils/currency";
// ===== Add by Pawan For Meta Pixel =====
import { AlertCircle, CheckCircle2, Info, Tag } from "lucide-react";
import {
	CAMPAIGN_CONFIG,
	isCampaignActive,
	isJewelleryMetalApplicable,
	isJewelleryOfferEligible
} from "../config/campaignOffers.config";
import { fbqTrack } from "../utils/metaPixel";

const GEMSTONE_QUALITIES = [
  {
    id: "B",
    qualityType: "B QUALITY",
    price: 0,
    displayText: "1. B QUALITY",
  },
  {
    id: "A",
    qualityType: "A QUALITY",
    price: 20000,
    displayText: "2. A QUALITY",
  },
  {
    id: "AA",
    qualityType: "AA QUALITY",
    price: 100000,
    displayText: "3. AA QUALITY",
  },
  {
    id: "AAA",
    qualityType: "AAA QUALITY",
    price: 500000,
    displayText: "4. AAA QUALITY",
  },
];

function HeaderDetailPage({ product = {}, metalRates = {} }) {
	const getUserToken = () => {
		const userInfoString = localStorage.getItem("userInfo");
		if (userInfoString) {
			try {
				const userInfo = JSON.parse(userInfoString);
				return userInfo.token;
			} catch {
				return null;
			}
		}
		return null;
	};

	const URL = import.meta.env.VITE_URL;
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [certificate, setCertificate] = useState("");
	const [selectedGemstoneValue, setSelectedGemstoneValue] = useState("");
	const [selectedGemstoneQuality, setSelectedGemstoneQuality] = useState("");
	const [showQualityInfo, setShowQualityInfo] = useState(false);
	const qualityInfoRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (qualityInfoRef.current && !qualityInfoRef.current.contains(event.target)) {
				setShowQualityInfo(false);
			}
		};
		if (showQualityInfo) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("touchstart", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [showQualityInfo]);
	const [selectedSubstitute, setSelectedSubstitute] = useState("");
	const [selectedMetal, setSelectedMetal] = useState(product?.metal || "");
	const [selectedPurity, setSelectedPurity] = useState(
		product?.metal?.toLowerCase() === "gold" ? "22k" : ""
	);
	const [quantity, setQuantity] = useState(1);
	const [selectedSizeType, setSelectedSizeType] = useState("");
	const [selectedSizeNumber, setSelectedSizeNumber] = useState("");
	const [calculatedPrice, setCalculatedPrice] = useState(
		product?.jewelryPrice || 0
	);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [internalMetalRates, setInternalMetalRates] = useState(null);
	const activeRates = (metalRates && Object.keys(metalRates).length > 0) ? metalRates : (internalMetalRates || {});

	const [recommendedGemstones, setRecommendedGemstones] = useState([]);
	const [selectedGemstoneProduct, setSelectedGemstoneProduct] = useState(null);
	const [loadingGemstones, setLoadingGemstones] = useState(false);
	const [activeGemCategory, setActiveGemCategory] = useState(null);
	const hasTrackedViewRef = useRef(null);

	// 🎁 Silver Offer State
	const [appliedCoupon, setAppliedCoupon] = useState(null);
	const [couponCode, setCouponCode] = useState("");
	const [couponError, setCouponError] = useState("");

	const currentMetal = selectedMetal || product?.metal || "";
	const isMetalEligible = isJewelleryMetalApplicable(currentMetal);
	const jewelleryOfferConfig = CAMPAIGN_CONFIG.jewelleryOffer || CAMPAIGN_CONFIG.silverOffer;
	const isSilver = currentMetal.toLowerCase().includes("silver");
	const isSilverOfferActive = isCampaignActive() && jewelleryOfferConfig?.enabled && isMetalEligible;

	const handleApplyCoupon = (codeToApply) => {
		const targetCode = String(codeToApply || couponCode || "").trim();
		setCouponError("");
		if (!targetCode) {
			setCouponError("Please enter a coupon code.");
			return;
		}
		const eligibility = isJewelleryOfferEligible(calculatedPrice, targetCode, currentMetal);
		if (eligibility.eligible) {
			setAppliedCoupon({
				code: jewelleryOfferConfig.code,
				discountAmount: eligibility.discountAmount,
				discountPercent: eligibility.discountPercent,
			});
			setCouponCode(jewelleryOfferConfig.code);
			toast.success(` Coupon ${jewelleryOfferConfig.code} applied! ₹${eligibility.discountAmount.toLocaleString("en-IN")} discount applied to this jewellery!`, { position: "top-center" });
		} else {
			setCouponError(eligibility.reason || `Coupon not applicable for this product.`);
			toast.error(eligibility.reason || `Coupon not applicable for this product.`, { position: "top-center" });
		}
	};

	const handleRemoveCoupon = () => {
		setAppliedCoupon(null);
		setCouponCode("");
		setCouponError("");
		toast.info("Coupon removed.", { position: "top-center" });
	};

	const selectedGemObj = useMemo(() => {
		try {
			return selectedGemstoneValue ? JSON.parse(selectedGemstoneValue) : null;
		} catch (e) {
			return null;
		}
	}, [selectedGemstoneValue]);

	const selectedQualityObj = useMemo(() => {
		try {
			return selectedGemstoneQuality ? JSON.parse(selectedGemstoneQuality) : null;
		} catch (e) {
			return null;
		}
	}, [selectedGemstoneQuality]);

	const isZeroGemstoneSelected = Boolean(
		selectedGemObj &&
		(Number(selectedGemObj.weight) === 0 ||
			String(selectedGemObj.weight).toLowerCase().includes("without") ||
			String(selectedGemObj.weight).toLowerCase().includes("mount"))
	);

	const GEMSTONE_OPTIONS_LIST = [
		{ name: "Yellow Sapphire (Pukhraj)", slug: "yellow-sapphire" },
		{ name: "Blue Sapphire (Neelam)", slug: "blue-sapphire" },
		{ name: "Emerald (Panna)", slug: "emerald" },
		{ name: "Ruby (Manik)", slug: "ruby" },
		{ name: "Red Coral (Moonga)", slug: "red-coral" },
		{ name: "Pearl (Moti)", slug: "pearl" },
		{ name: "Hessonite (Gomed)", slug: "hessonite" },
		{ name: "Opal", slug: "opal" },
		{ name: "White Sapphire", slug: "white-sapphire" },
	];

	const detectGemstoneSubcategory = (prod) => {
		if (!prod) return null;
		if (prod.productSubCategory && typeof prod.productSubCategory === "object") {
			if (prod.productSubCategory.slug) {
				return {
					slug: prod.productSubCategory.slug,
					name: prod.productSubCategory.name || prod.productSubCategory.slug,
					id: prod.productSubCategory._id,
				};
			}
			if (prod.productSubCategory.name) {
				return {
					slug: prod.productSubCategory.name.toLowerCase().replace(/\s+/g, "-"),
					name: prod.productSubCategory.name,
					id: prod.productSubCategory._id,
				};
			}
		}

		const subCatId = typeof prod.productSubCategory === "string" ? prod.productSubCategory : null;
		const name = `${prod.jewelryName || ""} ${prod.name || ""} ${prod.title || ""}`.toLowerCase();
		const sku = String(prod.sku || "").toUpperCase();

		const MAPPINGS = [
			{ pattern: /yellow[\s-]?sapphire|pukhraj/i, skuPrefix: "GRYS", slug: "yellow-sapphire", name: "Yellow Sapphire" },
			{ pattern: /blue[\s-]?sapphire|neelam/i, skuPrefix: "GRBS", slug: "blue-sapphire", name: "Blue Sapphire" },
			{ pattern: /white[\s-]?sapphire/i, skuPrefix: "GRWS", slug: "white-sapphire", name: "White Sapphire" },
			{ pattern: /pink[\s-]?sapphire/i, skuPrefix: "GRPS", slug: "pink-sapphire", name: "Pink Sapphire" },
			{ pattern: /purple[\s-]?sapphire/i, skuPrefix: "GRPPS", slug: "purple-sapphire", name: "Purple Sapphire" },
			{ pattern: /sapphire/i, skuPrefix: "GRS", slug: "blue-sapphire", name: "Blue Sapphire" },
			{ pattern: /emerald|panna/i, skuPrefix: "GRE", slug: "emerald", name: "Emerald" },
			{ pattern: /ruby|manik/i, skuPrefix: "GRRB", slug: "ruby", name: "Ruby" },
			{ pattern: /red[\s-]?coral|coral|moonga/i, skuPrefix: "GRRC", slug: "red-coral", name: "Red Coral" },
			{ pattern: /pearl|moti/i, skuPrefix: "GRPL", slug: "pearl", name: "Pearl" },
			{ pattern: /hessonite|gomed/i, skuPrefix: "GRHS", slug: "hessonite", name: "Hessonite" },
			{ pattern: /cat'?s?[\s-]?eye|lehsuniya/i, skuPrefix: "GRCE", slug: "cats-eye", name: "Cats Eye" },
			{ pattern: /opal/i, skuPrefix: "GROP", slug: "opal", name: "Opal" },
		];

		for (const m of MAPPINGS) {
			if (m.pattern.test(name) || (m.skuPrefix && sku.startsWith(m.skuPrefix))) {
				return { slug: m.slug, name: m.name, id: subCatId };
			}
		}
		return subCatId ? { slug: null, name: "Gemstone", id: subCatId } : null;
	};

	// Initialize or switch activeGemCategory when product or zero-gemstone selection changes
	useEffect(() => {
		if (isZeroGemstoneSelected) {
			const detected = detectGemstoneSubcategory(product);
			const defaultSlug = detected?.slug || "yellow-sapphire";
			setActiveGemCategory(defaultSlug);
			setSelectedGemstoneProduct(null);
		} else {
			setSelectedGemstoneProduct(null);
		}
	}, [isZeroGemstoneSelected, product?._id, product?.sku]);

	// Fetch recommendations whenever activeGemCategory or product changes
	useEffect(() => {
		if (!isZeroGemstoneSelected || !activeGemCategory) return;
		let isMounted = true;

		const fetchStones = async () => {
			setLoadingGemstones(true);
			try {
				// 1. Fetch by active subcategory slug
				const res = await axios.get(`${URL}/product/filter?subcategory=${encodeURIComponent(activeGemCategory)}&limit=4`);
				if (isMounted && res.data?.products?.length) {
					setRecommendedGemstones(res.data.products.slice(0, 4));
					return;
				}

				// 2. If no products, try by subcategory id if available
				const detected = detectGemstoneSubcategory(product);
				if (detected?.id && detected.id !== activeGemCategory) {
					const resId = await axios.get(`${URL}/product/filter?subcategory=${encodeURIComponent(detected.id)}&limit=4`);
					if (isMounted && resId.data?.products?.length) {
						setRecommendedGemstones(resId.data.products.slice(0, 4));
						return;
					}
				}

				// 3. Fallback to featured products
				const feat = await axios.get(`${URL}/product/featured-products`);
				if (isMounted && feat.data?.products?.length) {
					setRecommendedGemstones(feat.data.products.slice(0, 4));
				}
			} catch (err) {
				console.error("Error fetching recommended gemstones:", err);
			} finally {
				if (isMounted) setLoadingGemstones(false);
			}
		};

		fetchStones();
		return () => {
			isMounted = false;
		};
	}, [isZeroGemstoneSelected, activeGemCategory, product, URL]);

// -------------Add by Pawan for Currency------------------------------------------------------
	const { currency, rates } = useSelector((s) => s.currency);

// -----------------------------Fix Mobile By Pawan--------------------------------------------------
	const [isMobile, setIsMobile] = useState(false);
// -----------------------------Fix Mobile By Pawan--------------------------------------------------

	const images = (product?.images || [])
		.map((img) => (typeof img === "string" ? img : img?.url))
		.filter(Boolean);
	const videos = (product?.videos || [])
		.map((vid) => (typeof vid === "string" ? vid : vid?.url))
		.filter(Boolean);

	const mediaList = [
		...images.map((url) => ({ type: "image", url })),
		...videos.map((url) => ({ type: "video", url })),
	];

	const [selected, setSelected] = useState(0);
	const currentMedia = mediaList[selected] || mediaList[0] || null;
	const [showPopup, setShowPopup] = useState(false);

	const cleanPath = getProductUrl(product);
	const shareUrl = `${window.location.origin}${cleanPath}`;

	const isRing =
		(product?.jewelryType || "").toLowerCase() === "ring" ||
		(product?.jewelryName || "").toLowerCase().includes("signet") ||
		(product?.jewelryName || "").toLowerCase().includes("ring");

	const availableSizeSystems =
		Array.isArray(product?.sizeSystem) && product.sizeSystem.length > 0
			? product.sizeSystem
			: isRing
			? [
					{
						_id: "in_ring",
						sizeType: "Indian Ring Size System",
						sizeNumbers: Array.from({ length: 26 }, (_, i) => String(i + 5)),
					},
					{
						_id: "us_ring",
						sizeType: "US Ring Size System",
						sizeNumbers: [
							"4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5",
							"8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12",
						],
					},
					{
						_id: "uk_ring",
						sizeType: "UK/Australia Ring Size System",
						sizeNumbers: [
							"H", "I", "J", "K", "L", "M", "N", "O",
							"P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
						],
					},
					{
						_id: "eu_ring",
						sizeType: "Europe Ring Size System",
						sizeNumbers: Array.from({ length: 26 }, (_, i) => String(i + 45)),
					},
			  ]
			: [];

	useEffect(() => {
		if (product?.metal) {
			setSelectedMetal(product.metal);
			if (product.metal.toLowerCase() === "gold" && !selectedPurity) {
				setSelectedPurity("22k");
			}
		}
		if (product?.jewelryPrice) {
			setCalculatedPrice(product.jewelryPrice);
		}
	}, [product]);

	useEffect(() => {
		if (!metalRates || Object.keys(metalRates).length === 0) {
			getLatestMetalRates()
				.then((r) => setInternalMetalRates(r))
				.catch((err) => console.error("Error fetching rates in jewelry page:", err));
		}
	}, [metalRates]);

// -----------------------------Fix Mobile By Pawan--------------------------------------------------
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);
// -------------------------------Fix Mobile By Pawan--------------------------------------------------
// ==================== Add by Pawan For Meta Pixel ===================
	useEffect(() => {
		if (!product?._id) return;
		const finalVal = Number(calculatedPrice || product.jewelryPrice || 0);
		if (finalVal <= 0) return;
		if (hasTrackedViewRef.current === product._id) return;
		hasTrackedViewRef.current = product._id;
		const productSku = String(product.sku || product._id || "");
		const viewEventId = `view_${productSku}_${Math.floor(Date.now() / 60000)}`;
		fbqTrack(
			"ViewContent",
			{
				content_ids: [productSku],
				content_type: "product",
				content_name: product.jewelryName || "Jewelry",
				content_category: product.jewelryType || "Jewelry",
				value: finalVal,
				currency: "INR",
				contents: [{ id: productSku, quantity: 1, item_price: finalVal }],
			},
			{ eventID: viewEventId }
		);
	}, [product?._id, calculatedPrice]);
//======== End Add by Pawan For Meta Pixel ===============
	useEffect(() => {
		if (product) {
			calculateTotalPrice();
		}
	}, [
		product,
		activeRates,
		selectedGemstoneValue,
		selectedGemstoneQuality,
		certificate,
		selectedSubstitute,
		selectedMetal,
		selectedPurity,
		selectedGemstoneProduct,
		isZeroGemstoneSelected,
	]);

	const calculateTotalPrice = () => {
		let basePrice = product?.jewelryPrice || 0;
		let total = basePrice;
		let customization = {}; // collect selected options here

		// 1️⃣ Gemstone price
		if (selectedGemstoneValue) {
			const gemObj = selectedGemstoneValue
				? JSON.parse(selectedGemstoneValue)
				: null;

			if (gemObj) {
				total += gemObj.price;
				customization.gemstoneWeight = {
					weight: gemObj.weight,
					price: gemObj.price,
				};
			}
		}

		// 1.5 Gemstone Quality price (adds to gemstone weight price and gets added to jewellery final price)
		if (selectedGemstoneQuality && !isZeroGemstoneSelected) {
			try {
				const qualObj = typeof selectedGemstoneQuality === "string"
					? JSON.parse(selectedGemstoneQuality)
					: selectedGemstoneQuality;

				if (qualObj && typeof qualObj.price === "number") {
					total += qualObj.price;
					customization.quality = {
						qualityType: qualObj.qualityType,
						price: qualObj.price,
					};
					customization.gemstoneQuality = customization.quality;
				}
			} catch (err) {
				console.error("Error parsing selectedGemstoneQuality:", err);
			}
		}

		// 2️⃣ Certificate price
		if (certificate) {
			const certObj = product.certificate?.find(
				(c) => `${c.certificateType} - ₹ ${c.price}` === certificate
			);
			if (certObj) {
				total += certObj.price;
				customization.certificate = {
					certificateType: certObj.certificateType,
					price: certObj.price,
				};

			}
		}

		// 3️⃣ Diamond substitute price
		if (selectedSubstitute) {
			const subObj = product.diamondSubstitute?.find(
				(s) => s._id === selectedSubstitute
			);
			if (subObj) {
				total += subObj.price;
				customization.diamondSubstitute = {
					_id: subObj._id,
					name: subObj.name,
					price: subObj.price,
				};

			}
		}

		// 4️⃣ Metal change adjustment (if user selects a different metal)
		if (selectedMetal && selectedMetal !== product.metal) {
			const ratesObj = activeRates || {};
			const selectedRate =
				ratesObj[selectedMetal.toLowerCase()]?.withGSTRate || 0;
			const baseRate =
				ratesObj[product.metal?.toLowerCase()]?.withGSTRate || 0;

			if (baseRate && selectedRate) {
				const factor = selectedRate / baseRate;

				total *= factor;
			}
		}

		// 5️⃣ Universal Metal Price Calculation (Gold, Silver, Platinum, Panchadhatu)
		if (product.metal) {
			const metalType = product.metal.toLowerCase(); // gold | silver | platinum | panchadhatu

			// Collect weights (supports array, object, or number)
			const weights = Array.isArray(product.jewelryMetalWeight)
				? product.jewelryMetalWeight
				: [
					product.jewelryMetalWeight?.weight ||
					product.jewelryMetalWeight ||
					0,
				];

			let metalRate = 0;

			// ✔ Gold has purity-based pricing
			if (metalType === "gold" && selectedPurity) {
				switch (selectedPurity) {
					case "22k":
						metalRate = activeRates?.gold?.gold22k?.withGSTRate || 0;
						break;
					case "18k":
						metalRate = activeRates?.gold?.gold18k?.withGSTRate || 0;
						break;
				}
			}

			// ✔ Silver, Platinum, Panchadhatu (flat per gram pricing)
			if (metalType === "silver") {
				metalRate = activeRates?.silver?.withGSTRate || 0;
			}
			if (metalType === "platinum") {
				metalRate = activeRates?.platinum?.withGSTRate || 0;
			}
			if (metalType === "panchadhatu") {
				metalRate = activeRates?.panchadhatu?.withGSTRate || 0;
			}

			let metalTotalPrice = 0;
			weights.forEach((w) => {
				const weightVal = Number(w.weight || w);
				if (weightVal > 0 && metalRate > 0) {
					metalTotalPrice += weightVal * metalRate;
				}
			});

			if (!basePrice && metalTotalPrice > 0) {
				// Only add full metal price if jewelryPrice was not already set in DB
				total += metalTotalPrice;
			} else if (basePrice && metalType === "gold" && selectedPurity && selectedPurity !== "22k") {
				// Adjust for karat difference from standard 22k
				const karatKey = selectedPurity === "18k" ? "gold18k" : "gold22k";
				const rSelected = Number(activeRates?.gold?.[karatKey]?.withoutGSTRate || 0);
				const r22 = Number(activeRates?.gold?.gold22k?.withoutGSTRate || 0);
				const weight = Number(product.jewelryMetalWeight?.weight || product.jewelryMetalWeight || 0);
				const charge = product.makingChargePercent != null ? Number(product.makingChargePercent) : 10;
				if (rSelected && r22 && weight > 0) {
					const diff = Math.round((rSelected - r22) * (1 + charge / 100) * weight * 1.03);
					total += diff;
				}
			}

			customization.metal = {
				metalType,
				purity: metalType === "gold" ? selectedPurity : null,
				metalRate,
				weights,
				price: metalTotalPrice,
			};
		}

		// 6️⃣ If Zero gemstone (Mount Only) is selected and user picked a gemstone from recommendations
		if (isZeroGemstoneSelected && selectedGemstoneProduct) {
			const gemPrice = Number(selectedGemstoneProduct.price || 0);
			total += gemPrice;
			customization.productId = selectedGemstoneProduct._id;
		}

		setCalculatedPrice(total);

		return customization; // 👈 optional: return customization for payload use
	};

	const getRequiredFields = () => {
		const required = [];

		if (product.gemstoneWeight?.length > 0) {
			required.push({ key: 'gemstone', label: 'Gemstone Weight', value: selectedGemstoneValue });
			if (selectedGemstoneValue && !isZeroGemstoneSelected) {
				required.push({ key: 'gemstoneQuality', label: 'Gemstone Quality', value: selectedGemstoneQuality });
			}
		}

		if (product.metal?.toLowerCase() === "gold") {
			required.push({ key: 'purity', label: 'Gold Purity', value: selectedPurity });
		}

		if (availableSizeSystems.length > 0) {
			required.push({ key: 'sizeType', label: 'Size Type', value: selectedSizeType });
			if (selectedSizeType && selectedSizeType !== "Send me a ring sizer") {
				required.push({ key: 'sizeNumber', label: 'Size', value: selectedSizeNumber });
			}
		}

		if (Array.isArray(product?.diamondSubstitute) && product.diamondSubstitute.length > 0) {
			required.push({ key: 'substitute', label: 'Diamond Substitute', value: selectedSubstitute });
		}

		if (Array.isArray(product?.certificate) && product.certificate.length > 0) {
			required.push({ key: 'certificate', label: 'Certification', value: certificate });
		}

		return required;
	};

	const validateRequiredFields = () => {
		const requiredFields = getRequiredFields();
		const missing = requiredFields.filter(field => !field.value || field.value === "");

		if (missing.length > 0) {
			const labels = missing.map(f => f.label).join(', ');
			toast.error(`Please select: ${labels}`, { position: "top-center" });
			return false;
		}
		return true;
	};

	const areAllRequiredFieldsFilled = () => {
		const requiredFields = getRequiredFields();
		return requiredFields.every(field => field.value && field.value !== "");
	};

	// -------------------- Add By Pawan For Buy Now (START) --------------------
	  const handleAddToCart = async (buyNow = false) => {
	// -------------------- Add By Pawan For Buy Now (END) --------------------
		if (isAddingToCart) return;

		if (!validateRequiredFields()) {
			return;
		}

		if (!product?._id) {
			toast.error("Product not found.", { position: "top-center" });
			return;
		}

		setIsAddingToCart(true);

		try {
			// helper to extract numeric value from strings like "₹ 12,345.67" or "5 Carat - ₹ 1,234"
			const extractNumber = (str) => {
				if (!str) return 0;
				const m = String(str).match(/[\d,]+(\.\d+)?/);
				return m ? Number(m[0].replace(/,/g, "")) : 0;
			};

			// Gemstone customization
			const gemstoneObj = selectedGemstoneValue
				? JSON.parse(selectedGemstoneValue)
				: null;

			let qualityObj = null;
			if (selectedGemstoneQuality && !isZeroGemstoneSelected) {
				try {
					qualityObj = JSON.parse(selectedGemstoneQuality);
				} catch (e) {
					qualityObj = null;
				}
			}

			// Certificate customization
			const certificateObj = certificate
				? {
					certificateType: (certificate.split(" - ₹ ")[0] || "").trim(),
					price: extractNumber(certificate),
				}
				: null;

			// Gold purity / karat calculation (ensure same logic as calculateTotalPrice)
			let purityPrice = 0;
			let goldKaratObj = null;
			if (product.metal?.toLowerCase() === "gold") {
				const purity = selectedPurity || "22k";
				const karatKey = purity === "18k" ? "gold18k" : "gold22k";

				const weight = Number(
					product.jewelryMetalWeight?.weight || product.jewelryMetalWeight || 0
				);

				const purityRate =
					activeRates?.gold?.[karatKey]?.withGSTRate ||
					activeRates?.latestRate?.gold?.[karatKey]?.withGSTRate ||
					0;

				if (weight > 0 && purityRate > 0) {
					purityPrice = weight * purityRate;
				}

				goldKaratObj = {
					karatType: karatKey,
					price: purityPrice,
				};
			}

			// Diamond substitute
			const substituteObj = selectedSubstitute
				? (() => {
					const sub = product.diamondSubstitute?.find(
						(s) => s._id === selectedSubstitute
					);
					return sub
						? {
							_id: sub._id,
							name: sub.name,
							price: sub.price,
						}
						: null;
				})()
				: null;

			const isRingSizer =
				selectedSizeNumber === "Send me a ring sizer" ||
				selectedSizeType === "Send me a ring sizer";

			const sizeSystemPayload = isRingSizer
				? {
					sizeType: selectedSizeType === "Send me a ring sizer" ? "Ring Sizer" : (selectedSizeType || "Ring Sizer"),
					sizeNumber: "Send me a ring sizer",
				}
				: selectedSizeNumber
				? {
					sizeType: selectedSizeType || "Standard",
					sizeNumber: selectedSizeNumber,
				}
				: null;

			const isDiscounted = appliedCoupon && isSilver;
			const finalItemPrice = isDiscounted
				? Math.max(0, calculatedPrice - appliedCoupon.discountAmount)
				: calculatedPrice;

			const customization = {
				gemstoneWeight: gemstoneObj,
				quality: qualityObj ? { qualityType: qualityObj.qualityType, price: qualityObj.price } : null,
				gemstoneQuality: qualityObj ? { qualityType: qualityObj.qualityType, price: qualityObj.price } : null,
				certificate: certificateObj,
				goldKarat: goldKaratObj,
				diamondSubstitute: substituteObj,
				metal: selectedMetal || product.metal,
				sizeSystem: sizeSystemPayload,
				size: sizeSystemPayload
					? {
						sizeType: sizeSystemPayload.sizeType,
						size: sizeSystemPayload.sizeNumber,
					}
					: null,
				totalPrice: finalItemPrice,
			};

			if (isDiscounted) {
				customization.appliedCoupon = appliedCoupon.code;
				customization.originalPrice = calculatedPrice;
				customization.discountedPrice = finalItemPrice;
				customization.discountAmount = appliedCoupon.discountAmount;
			}

			const payload = {
				itemId: product._id,
				quantity: 1,
				customization: JSON.stringify(customization),
			};

			const userToken = getUserToken();

			const config = {
				withCredentials: true,
			};

			if (userToken) {
				config.headers = {
					Authorization: `Bearer ${userToken}`,
				};
			}

			// 1️⃣ Add Jewelry to cart as Item 1
			const response = await axios.post(
				`${URL}/cart/add_item_in_cart`,
				payload,
				config
			);

			// 2️⃣ If user selected a gemstone, add it as Item 2 in cart!
			let hasAddedSeparateStone = false;
			if (isZeroGemstoneSelected && selectedGemstoneProduct?._id) {
				try {
					const gemPayload = {
						itemId: selectedGemstoneProduct._id,
						quantity: 1,
						customization: JSON.stringify({}),
					};
					await axios.post(`${URL}/cart/add_item_in_cart`, gemPayload, config);
					hasAddedSeparateStone = true;
				} catch (gemErr) {
					console.error("Error adding separate gemstone:", gemErr);
				}
			}

			if (response.data.success) {

			// GA4 Add To Cart Tracking
			window.dataLayer = window.dataLayer || [];

			window.dataLayer.push({
				ecommerce: null
			});

			window.dataLayer.push({
				event: "add_to_cart",
				ecommerce: {
				currency: "INR",
				value: finalItemPrice,

				items: [
					{
					item_id: product.sku || product._id,
					item_name: product.jewelryName,
					item_brand: "GemRishi",
					item_category: product.jewelryType || "Jewelry",
					item_variant: selectedPurity || product.metal || "",
					price: finalItemPrice,
					quantity: 1
					}
				]
				}
			});

			// ========= Add by Pawan For Meta Pixel ============
			const atcEventId = `add_to_cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
			const productSku = String(product.sku || product._id || "");
			fbqTrack(
				"AddToCart",
				{
					content_ids: [productSku],
					content_type: "product",
					content_name: product.jewelryName || "Jewelry",
					content_category: product.jewelryType || "Jewelry",
					value: finalItemPrice,
					currency: "INR",
					contents: [{ id: productSku, quantity: 1, item_price: finalItemPrice }],
				},
				{ eventID: atcEventId }
			);
			// ========== End Add by Pawan For Meta Pixel =========

			if (hasAddedSeparateStone) {
				toast.success("Jewelry & selected gemstone added to cart as 2 separate items!", {
					position: "top-center",
					autoClose: 2500,
				});
			} else {
				toast.success("Item added to cart successfully!", {
					position: "top-center",
					autoClose: 2500,
				});
			}

			// -------------------- Add By Pawan For Buy Now (START) --------------------
			if (buyNow === true) {
				navigate("/shopping/cart", { state: { autoCashfree: true } });
			} else {
				setTimeout(() => navigate("/shopping/cart"), 500);
			}
			// -------------------- Add By Pawan For Buy Now (END) --------------------
			}
			else {
				toast.error(response.data.message || "Failed to add to cart", {
					position: "top-center",
				});
			}
		} catch (error) {
			toast.error("Error adding to cart. Try again later.", {
				position: "top-center",
			});
			console.error(error);
		} finally {
			setIsAddingToCart(false);
		}
	};

	return (
		<div className="text-[14px] lg:text-[15px]">
			{/* Breadcrumb */}
			<div className="w-full flex flex-wrap items-center px-3 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-3 gap-1 sm:gap-2">
				<a
					href="/"
					className="text-[#444445] cursor-pointer text-[16px] sm:text-[18px] md:text-[20px] lg:text-[16px] hover:text-[#264A3F] transition-colors"
					onClick={(e) => {
						e.preventDefault();
						navigate("/");
					}}>
					Home
				</a>

				<span className="text-[#444445] text-[16px] sm:text-[18px]">{">"}</span>

				<span
					onClick={() => navigate(-1)}
					className="text-[#444445] cursor-pointer text-[16px] sm:text-[18px] md:text-[20px] lg:text-[16px] hover:text-[#264A3F] transition-colors">
					{product?.jewelryType}
				</span>

				<span className="text-[#444445] text-[16px] sm:text-[18px]">{">"}</span>

				<span className="text-[#444445] cursor-pointer font-medium text-[16px] sm:text-[18px] md:text-[20px] lg:text-[16px] truncate max-w-[200px] sm:max-w-none">
					{product?.jewelryName || "Product"}
				</span>
			</div>

			{/* Main Section */}
			<div className="w-full min-h-[830px] flex flex-col lg:flex-row px-4 sm:px-6 md:px-8 lg:px-20 gap-6 lg:gap-0">
				{/* Left - Images */}
				<div className="w-full lg:w-[45%] flex flex-col items-center">
					<div className="relative w-full max-w-[400px] mb-4 overflow-visible">
						{currentMedia ? (
							currentMedia.type === "image" ? (
								isMobile ? (
									<img
										src={currentMedia.url}
										alt={product?.jewelryName || "Jewelry"}
										className="w-full h-[400px] object-contain rounded-lg"
									/>
								) : (
									<ReactImageMagnify
										{...{
											smallImage: {
												alt: product?.jewelryName || "Jewelry",
												isFluidWidth: true,
												src: currentMedia.url,
											},
											largeImage: {
												src: currentMedia.url,
												width: 1000,
												height: 1000,
											},
											enlargedImagePosition: "beside",
											enlargedImageContainerDimensions: {
												width: 900,
												height: 700,
											},
											enlargedImageContainerClassName:
												"z-50 bg-white shadow-xl border rounded-lg overflow-hidden",
										}}
									/>
								)
							) : (
								<video
									src={currentMedia.url}
									controls
									className="w-full h-[400px] object-contain rounded-lg bg-black"
								/>
							)
						) : (
							<div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-100 rounded-lg text-gray-400">
								<span className="text-4xl mb-2">💍</span>
								<p className="text-sm font-medium">No Image Available</p>
							</div>
						)}
					</div>
					{mediaList.length > 1 && (
						<div className="grid grid-cols-5 gap-2 w-full max-w-[400px]">
							{mediaList.map((item, idx) => (
								<button
									key={idx}
									onClick={() => setSelected(idx)}
									className={`border rounded-md p-1 ${
										selected === idx ? "border-[#264A3F]" : "border-gray-200"
									}`}
								>
									{item.type === "image" ? (
										<img
											src={item.url}
											alt={`Jewelry thumbnail ${idx + 1}`}
											className="w-full h-full object-contain rounded"
										/>
									) : (
										<video
											src={item.url}
											className="w-full h-10 object-cover rounded opacity-70"
										/>
									)}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Right - Details */}
				<div className="w-full lg:w-[55%] pt-4 lg:pt-8">
					<div className="w-full">
						{/* Title and Actions */}
						<div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
							<h1 className="text-xl font-bold text-gray-800">
								{product.jewelryName || "Jewelry"}
							</h1>
							<div className="flex gap-4 items-center sm:self-center">
								<WishlistButton itemId={product?._id} itemType="Jewelry" product={product} />
								<CompareButton id={product?._id} product={product} />
{/* --------------------------------Add by Pawan-------------------------------------------- */}
								<SharePopup
                                 productUrl={shareUrl}
                                 productName={product?.jewelryName || product?.name || "Our Product"}
                                  />
{/* --------------------------------Add by Pawan-------------------------------------------- */}
							</div>
						</div>

						{/* Price */}
						<div className="flex flex-col gap-3 mb-6">
							<p className="text-gray-700">
								<span>SKU</span> : {product.sku}
							</p>
							<div className="flex gap-4 items-center">
{/* --------------------Add by pawan for currency------------------------------------ */}
								{isSilverOfferActive && appliedCoupon ? (
									<div className="flex flex-col gap-1">
										<span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full w-fit">
											₹{appliedCoupon.discountAmount.toLocaleString("en-IN")} OFF Applied
										</span>
										<div className="flex items-baseline gap-3">
											<span className="text-xl sm:text-2xl text-gray-400 line-through">
												{formatCurrency(ConvertFromINR(calculatedPrice, rates, currency), currency)}
											</span>
											<h2 className="font-bold text-2xl sm:text-3xl lg:text-[28px] text-emerald-700">
												{formatCurrency(ConvertFromINR(Math.max(0, calculatedPrice - appliedCoupon.discountAmount), rates, currency), currency)}
											</h2>
										</div>
									</div>
								) : (
									<h2 className="font-bold text-2xl sm:text-3xl lg:text-[28px] text-gray-800">
										{formatCurrency(ConvertFromINR(calculatedPrice, rates, currency), currency)}
									</h2>
								)}
{/* --------------------Add by pawan for currency------------------------------------ */}
							</div>
							{selectedQualityObj && !isZeroGemstoneSelected && (
								<p className="text-xs text-gray-600 mt-1 flex items-center gap-1.5">
									<span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
									<span>Selected Quality: <strong>{selectedQualityObj.displayText || selectedQualityObj.qualityType}</strong></span>
									{selectedQualityObj.price > 0 ? (
										<span className="text-emerald-700 font-semibold">(+{formatCurrency(ConvertFromINR(selectedQualityObj.price, rates, currency), currency)})</span>
									) : (
										<span className="text-gray-500 font-medium">(Same price as gemstone weight)</span>
									)}
								</p>
							)}
						</div>

						{/* Specifications */}
						<div className="flex flex-col gap-2 mb-6">
							{product.metal && (
								<p className="text-base text-gray-700">
									<span className="text-black font-semibold">Metal:</span>{" "}
									<span className="capitalize">{product.metal}</span>
								</p>
							)}
							{(product.jewelryMetalWeight != null && product.jewelryMetalWeight !== "") && (
								<p className="text-base text-gray-700">
									<span className="text-black font-semibold">Metal Weight:</span>{" "}
									{product.jewelryMetalWeight} g
								</p>
							)}
							{product.jewelryType && (
								<p className="text-base text-gray-700">
									<span className="text-black font-semibold">Jewelry Type:</span>{" "}
									{product.jewelryType}
								</p>
							)}
							{product.origin && (
								<p className="text-base text-gray-700">
									<span className="text-black font-semibold">Origin:</span>{" "}
									{product.origin}
								</p>
							)}
						</div>

						{/*  FESTIVE SILVER OFFER CARD (ONLY SHOWN FOR SILVER PRODUCTS) */}
						{isSilverOfferActive && (
							<div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/60 shadow-sm">
								<div className="flex items-start justify-between gap-2 mb-2">
									<div className="flex items-center gap-2">
										<span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">

										</span>
										<div>
											<p className="text-xs uppercase tracking-wider font-extrabold text-emerald-800">
												{CAMPAIGN_CONFIG.silverOffer.title}
											</p>
											<p className="text-xs text-gray-600">
												{CAMPAIGN_CONFIG.silverOffer.description}
											</p>
										</div>
									</div>
									<Link
										to={CAMPAIGN_CONFIG.silverOffer.termsUrl || "/offers"}
										className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline whitespace-nowrap"
									>
										T&C →
									</Link>
								</div>

								{appliedCoupon ? (
									<div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-300">
										<div className="flex items-center gap-2">
											<CheckCircle2 className="w-4 h-4 text-emerald-700" />
											<span className="text-xs font-bold text-emerald-900">
												Coupon {appliedCoupon.code} Applied (₹{appliedCoupon.discountAmount.toLocaleString("en-IN")} OFF)
											</span>
										</div>
										<button
											type="button"
											onClick={handleRemoveCoupon}
											className="text-xs font-semibold text-red-600 hover:text-red-800 underline"
										>
											Remove
										</button>
									</div>
								) : (
									<div className="flex flex-col sm:flex-row gap-2 mt-2">
										<div className="relative flex-1">
											<Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
											<input
												type="text"
												value={couponCode}
												onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
												placeholder={`Enter coupon (e.g. ${CAMPAIGN_CONFIG.silverOffer.code})`}
												className="w-full pl-9 pr-3 py-2 text-xs uppercase font-bold tracking-wider rounded-lg border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none bg-white"
											/>
										</div>
										<button
											type="button"
											onClick={() => handleApplyCoupon(couponCode || CAMPAIGN_CONFIG.silverOffer.code)}
											className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
										>
											Apply Coupon
										</button>
									</div>
								)}
								{couponError && (
									<p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
										<AlertCircle className="w-3.5 h-3.5" /> {couponError}
									</p>
								)}
							</div>
						)}

						{/* Selection Fields */}
						<div className="flex flex-col gap-4 mb-6">
							{/* Gemstone */}
							{product.gemstoneWeight?.length > 0 && (
								<div className="flex flex-col gap-2">
									<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
										<label className="w-40 sm:w-48 text-base text-gray-700 flex items-center gap-1 shrink-0">
											Gemstone Weight:
											<span className="text-red-500">*</span>
										</label>
										<select
											value={selectedGemstoneValue}
											onChange={(e) => {
											const val = e.target.value;
											setSelectedGemstoneValue(val);
											try {
												const parsed = val ? JSON.parse(val) : null;
												if (parsed && (Number(parsed.weight) === 0 || String(parsed.weight).toLowerCase().includes("without") || String(parsed.weight).toLowerCase().includes("mount"))) {
													setSelectedGemstoneQuality("");
												}
											} catch (err) {}
										}}
											className="w-full sm:w-[calc(100%-13rem)] border border-gray-300 p-2 rounded bg-white text-sm sm:text-base">
											<option value="">Select Weight</option>
											{product.gemstoneWeight.map((w) => {
												const isZero = Number(w.weight) === 0;
												return (
													<option
														key={w._id}
														value={JSON.stringify({
															weight: w.weight,
															price: w.price,
														})}>
														{isZero
															? "Without Gemstone (Mount Only) — Select Gemstone Separately"
															: `${w.weight} Carat - ${formatCurrency(ConvertFromINR(w.price, rates, currency), currency)}`}
													</option>
												);
											})}
										</select>
									</div>

									{/* Gemstone Quality - Below gemstone weight in same form; disappears if without mount */}
									{!isZeroGemstoneSelected && (
										<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
											{/* Label & Info Icon tightly grouped on one line */}
											<div className="w-full sm:w-48 flex items-center gap-2 relative shrink-0" ref={qualityInfoRef}>
												<label className="text-base text-gray-700 whitespace-nowrap flex items-center gap-1">
													Gemstone Quality:
													<span className="text-red-500">*</span>
												</label>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setShowQualityInfo((prev) => !prev);
													}}
													className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 text-gray-500 hover:text-[#264A3F] hover:border-[#264A3F] hover:bg-emerald-50 text-[11px] font-serif font-bold transition-all focus:outline-none cursor-pointer"
													title="Gemstone Quality Notice"
													aria-label="Gemstone Quality Notice">
													i
												</button>

												{/* Popover notice on click */}
												{showQualityInfo && (
													<div className="absolute left-0 top-7 z-50 w-72 sm:w-80 p-3 bg-white border border-[#264A3F]/35 rounded-xl shadow-xl text-xs text-gray-700 animate-fadeIn">
														<div className="flex items-start justify-between gap-2">
															<div className="flex items-start gap-2">
																<Info className="w-4 h-4 text-[#264A3F] flex-shrink-0 mt-0.5" />
																<p className="font-medium text-gray-800 leading-relaxed text-xs">
																	Gemstone image in jewellery is graphical. Gemstone quality (transparency, cut, and clarity) depends on the grade selected. Higher grades offer better transparency.
																</p>
															</div>
															<button
																type="button"
																onClick={() => setShowQualityInfo(false)}
																className="text-gray-400 hover:text-gray-600 text-base leading-none p-0.5 -mt-1"
																aria-label="Close">
																&times;
															</button>
														</div>
													</div>
												)}
											</div>

											{/* Dropdown with Comparison Descriptions */}
											<select
												value={selectedGemstoneQuality}
												onChange={(e) => setSelectedGemstoneQuality(e.target.value)}
												className="w-full sm:w-[calc(100%-13rem)] border border-gray-300 p-2 rounded bg-white text-sm sm:text-base">
												<option value="">Select Quality</option>
												{GEMSTONE_QUALITIES.map((q) => {
													const additionFormatted = q.price > 0
														? ` — +${formatCurrency(ConvertFromINR(q.price, rates, currency), currency)}`
														: " — Base Price";

													// Add transparency descriptions for comparison
													const qualityDescriptions = {
														"B QUALITY": "Lowest transparency",
														"A QUALITY": "Good transparency",
														"AA QUALITY": "Very good transparency",
														"AAA QUALITY": "Highest transparency (Best)"
													};
													const desc = qualityDescriptions[q.qualityType] || "";

													return (
														<option
															key={q.id}
															value={JSON.stringify({
																qualityType: q.qualityType,
																price: q.price,
																displayText: q.displayText,
															})}>
															{q.displayText} - {desc}{additionFormatted}
														</option>
													);
												})}
											</select>
										</div>
									)}

									{/* Zero Gemstone Weight Guidance & Recommendations */}
									{isZeroGemstoneSelected && (
										<div className="w-full mt-2 p-4 sm:p-5 bg-[#FAF9F5] border border-[#264A3F]/25 rounded-xl text-left shadow-sm">
											<div className="flex items-start gap-3">
												<div className="w-8 h-8 rounded-full bg-[#264A3F]/10 flex items-center justify-center flex-shrink-0 text-[#264A3F] mt-0.5">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
												</div>
												<div className="flex-1">
													<div className="flex items-center justify-between flex-wrap gap-2">
														<h4 className="text-sm sm:text-base font-bold text-[#264A3F]">
															Mounting / Setting Only (No Gemstone Included)
														</h4>
														<span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-emerald-100/70 text-[#264A3F] rounded-full">
															Mounting Only
														</span>
													</div>
													<p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
														You have selected this jewelry piece as a mount/setting only. The price shown reflects only the handcrafted metal setting without a center stone. To create your complete custom jewelry, please select and purchase a certified natural gemstone separately from our collection to be expertly set into this design.
													</p>

													{/* Action Buttons */}
													<div className="mt-3.5 flex flex-wrap items-center gap-2.5">
														<Link
															to="/buy-gemstone-online"
															className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#264A3F] hover:bg-[#1a3329] text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all duration-200">
															<span>Browse Certified Gemstones</span>
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
															</svg>
														</Link>
														<Link
															to="/suggest"
															className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#264A3F]/30 hover:border-[#264A3F] text-[#264A3F] text-xs sm:text-sm font-medium rounded-lg transition-all duration-200">
															<span>Free Astrological Suggestion</span>
														</Link>
													</div>

													{/* Quick Popular Gemstones Section */}
													<div className="mt-4 pt-3.5 border-t border-gray-200/80">
														<div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
															<p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
																{selectedGemstoneProduct
																	? "Selected Gemstone for this Setting:"
																	: `Select a ${(GEMSTONE_OPTIONS_LIST.find((g) => g.slug === activeGemCategory)?.name || "Gemstone").replace(/\s*\([^)]*\)/, "")} Separately for this Setting:`}
															</p>
															{selectedGemstoneProduct && (
																<button
																	type="button"
																	onClick={() => setSelectedGemstoneProduct(null)}
																	className="text-xs text-[#264A3F] font-semibold hover:underline inline-flex items-center gap-1"
																>
																	<span>Change Gemstone</span>
																	<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
																	</svg>
																</button>
															)}
														</div>

														{loadingGemstones ? (
															<p className="text-xs text-gray-400">Loading recommended gemstones...</p>
														) : (selectedGemstoneProduct ? [selectedGemstoneProduct] : recommendedGemstones).length > 0 ? (
															<div className={selectedGemstoneProduct ? "flex justify-center mb-3" : "grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3"}>
																{(selectedGemstoneProduct ? [selectedGemstoneProduct] : recommendedGemstones).map((gem) => {
																	const gemImg = gem?.images?.[0]?.url || (typeof gem?.images?.[0] === "string" ? gem.images[0] : "/Stone1.svg");
																	const gemUrl = getProductUrl(gem);
																	const isThisSelected = selectedGemstoneProduct?._id === gem._id;

																	return (
																		<div
																			key={gem._id}
																			onClick={() => setSelectedGemstoneProduct(gem)}
																			className={`${isThisSelected ? "w-full max-w-xs ring-2 ring-[#20A079] bg-emerald-50/50" : "bg-white"} group p-2.5 rounded-xl border border-gray-200 hover:border-[#264A3F] transition-all flex flex-col items-center text-center shadow-xs cursor-pointer`}
																		>
																			{isThisSelected && (
																				<span className="self-end px-2 py-0.5 mb-1 bg-[#264A3F] text-white text-[9px] font-semibold uppercase tracking-wider rounded-full">
																					Selected Gemstone
																				</span>
																			)}
																			<img
																				src={gemImg}
																				alt={gem.name}
																				className={`${isThisSelected ? "w-20 h-20" : "w-12 h-12"} object-contain group-hover:scale-105 transition-transform mb-1.5`}
																			/>
																			<span className="text-[12px] font-medium text-gray-800 line-clamp-1 group-hover:text-[#264A3F]">
																				{gem.name}
																			</span>
																			<span className="text-[12px] font-bold text-[#264A3F] mt-0.5">
																				{formatCurrency(ConvertFromINR(gem.price, rates, currency), currency)}
																			</span>

																			<div className="flex items-center gap-2 mt-2">
																				<a
																					href={gemUrl}
																					target="_blank"
																					rel="noopener noreferrer"
																					onClick={(e) => e.stopPropagation()}
																					className="text-[11px] px-2.5 py-1 bg-[#264A3F] text-white rounded hover:bg-[#1a3329] transition-colors"
																				>
																					View Details
																				</a>
																				{isThisSelected && (
																					<button
																						type="button"
																						onClick={(e) => {
																							e.stopPropagation();
																							setSelectedGemstoneProduct(null);
																						}}
																						className="text-[11px] px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
																					>
																						Deselect
																					</button>
																				)}
																			</div>
																		</div>
																	);
																})}
															</div>
														) : null}

														{!selectedGemstoneProduct && (
															<div className="flex flex-wrap gap-1.5 items-center">
																{GEMSTONE_OPTIONS_LIST.map((gem) => {
																	const isActive = activeGemCategory === gem.slug;
																	return (
																		<button
																			key={gem.slug}
																			type="button"
																			onClick={() => {
																				setActiveGemCategory(gem.slug);
																				setSelectedGemstoneProduct(null);
																			}}
																			className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer font-medium ${
																				isActive
																					? "bg-[#264A3F] text-white border-[#264A3F] shadow-xs"
																					: "bg-white hover:bg-emerald-50 text-gray-700 hover:text-[#264A3F] border-gray-200 hover:border-[#264A3F]/40"
																			}`}
																		>
																			<span>{gem.name}</span>
																			{isActive && <span className="ml-1 text-[10px] text-emerald-200">✓</span>}
																		</button>
																	);
																})}
															</div>
														)}
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							)}

							{/* Gold Purity */}
							{product &&
								product.metal?.toLowerCase() === "gold" && (
									<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
										<label className="w-40 sm:w-48 text-base text-gray-700 flex items-center gap-1 shrink-0">
											Gold Purity:
											<span className="text-red-500">*</span>
										</label>
										<select
											value={selectedPurity}
											onChange={(e) => setSelectedPurity(e.target.value)}
											className="w-full sm:w-[calc(100%-13rem)] border border-gray-300 p-2 rounded bg-white text-sm sm:text-base">
											<option value="22k">22K Yellow Gold (Standard)</option>
											<option value="18k">18K Yellow Gold</option>
										</select>
									</div>
								)}

							{/* Size System */}
							{availableSizeSystems.length > 0 && (
								<div className="flex flex-col gap-4">
									{/* Size Type */}
									<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
										<label className="w-40 sm:w-48 text-base text-gray-700 flex items-center gap-1 shrink-0">
											{isRing ? "Ring Size Type:" : "Size Type:"}
											<span className="text-red-500">*</span>
										</label>
										<select
											value={selectedSizeType}
											onChange={(e) => {
												const val = e.target.value;
												setSelectedSizeType(val);
												if (val === "Send me a ring sizer") {
													setSelectedSizeNumber("Send me a ring sizer");
												} else {
													setSelectedSizeNumber(""); // reset size numbers when type changes
												}
											}}
											className="w-full sm:w-[calc(100%-13rem)] border border-gray-300 p-2 rounded bg-white text-sm sm:text-base">
											<option value="">Select Size Type</option>
											{availableSizeSystems.map((sys) => (
												<option key={sys._id || sys.sizeType} value={sys.sizeType}>
													{sys.sizeType}
												</option>
											))}
											<option value="Send me a ring sizer">
												Don't know size? Send me a ring sizer
											</option>
										</select>
									</div>

									{/* Size Number */}
									{selectedSizeType && selectedSizeType !== "Send me a ring sizer" && (
										<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
											<label className="w-40 sm:w-48 text-base text-gray-700 flex items-center gap-1 shrink-0">
												{isRing ? "Ring Size:" : "Size:"}
												<span className="text-red-500">*</span>
											</label>
											<select
												value={selectedSizeNumber}
												onChange={(e) =>
													setSelectedSizeNumber(e.target.value)
												}
												className="w-full sm:w-[calc(100%-13rem)] border border-gray-300 p-2 rounded bg-white text-sm sm:text-base">
												<option value="">Select Size</option>
												<option value="Send me a ring sizer">
													Send me a ring sizer
												</option>
												{availableSizeSystems
													.find((sys) => sys.sizeType === selectedSizeType)
													?.sizeNumbers?.filter((num) => num !== "NA")
													?.map((num) => (
														<option key={num} value={num}>
															{num}
														</option>
													))}
											</select>
										</div>
									)}

									{/* Ring Sizer Info Banner */}
									{(selectedSizeNumber === "Send me a ring sizer" ||
										selectedSizeType === "Send me a ring sizer") && (
										<div className="flex items-start gap-2.5 p-3 bg-green-50 border border-[#20A079]/30 rounded-lg text-xs sm:text-sm text-[#264A3F]">
											<span className="text-base select-none">💍</span>
											<div>
												<p className="font-semibold">Ring Sizer Selected</p>
												<p className="text-gray-600 mt-0.5">
													Our sales person will contact you for ring sizer.
												</p>
											</div>
										</div>
									)}

									{/* Quick Action & Size Guide Link */}
									<div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 px-1">
										<button
											type="button"
											onClick={() => {
												setSelectedSizeType("Ring Sizer");
												setSelectedSizeNumber("Send me a ring sizer");
											}}
											className="text-[#264A3F] font-semibold hover:underline flex items-center gap-1 cursor-pointer">
											<span>📏</span> Don't know your size? Send me a ring sizer
										</button>
										<a
											href="/ring-size"
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-500 hover:text-[#264A3F] hover:underline">
											Ring Size Guide →
										</a>
									</div>
								</div>
							)}

							{/* Diamond Substitute */}
							{Array.isArray(product?.diamondSubstitute) &&
								product.diamondSubstitute.length > 0 && (
									<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
										<label className="w-40 sm:w-48 text-base text-gray-700 flex items-center gap-1 shrink-0">
											Diamond Substitute:
											<span className="text-red-500">*</span>
										</label>
										<select
											value={selectedSubstitute}
											onChange={(e) => setSelectedSubstitute(e.target.value)}
											className="w-full sm:w-[calc(100%-13rem)] border border-gray-300 p-2 rounded bg-white text-sm sm:text-base">
											<option value="">Select Substitute</option>
											{product.diamondSubstitute.map((sub) => (
												<option key={sub._id} value={sub._id}>
													{sub.name} — ₹ {sub.price}
												</option>
											))}
										</select>
									</div>
								)}

							{/* Certificate */}
							{Array.isArray(product?.certificate) && product.certificate.length > 0 && (
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
									<label className="w-40 sm:w-48 text-base text-gray-700 flex items-center gap-1 shrink-0">
										Certification:
										<span className="text-red-500">*</span>
									</label>
									<select
										value={certificate}
										onChange={(e) => setCertificate(e.target.value)}
										className="w-full sm:w-[calc(100%-13rem)] border border-gray-300 p-2 rounded bg-white text-sm sm:text-base">
										<option value="">Select Certificate</option>
										{product.certificate.map((c) => (
											<option key={c._id || c.certificateType}>
												{c.certificateType} - ₹ {c.price}
											</option>
										))}
									</select>
								</div>
							)}
						</div>

						{/* Delivery Info */}
						<div className="w-full flex flex-col gap-4 mb-6">
							<div className="flex flex-col gap-2">
								<div className="flex items-center gap-2">
									<img src={Clock} alt="clock" className="w-5 h-5" />
									<span className="text-sm sm:text-base lg:text-base text-gray-700">
										Estimated Delivery: {product?.deliveryDays || "7-10"} days
									</span>
								</div>
								<div className="flex items-center gap-2">
									<img src={Truck} alt="truck" className="w-5 h-5" />
									<span className="text-sm sm:text-base lg:text-base text-gray-700 hover:text-green-600 cursor-pointer transition-colors">
										Read about Delivery and Returns
									</span>
								</div>
							</div>

							{/* Add to Cart */}
							<div className="flex flex-col gap-2">
								<button
									onClick={() => handleAddToCart()} // Add By Pawan For Buy Now: wrapped so click event is not passed as buyNow
									disabled={isAddingToCart || !areAllRequiredFieldsFilled()}
									className="w-full h-[50px] lg:w-[580px] sm:h-[60px] rounded-[12px] bg-[#264A3F] text-white text-base sm:text-base lg:text-[18px] font-bold hover:bg-[#1a3a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
									{isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
								</button>
								{/* -------------------- Add By Pawan For Buy Now (START) -------------------- */}
								<button
									onClick={() => handleAddToCart(true)}
									disabled={isAddingToCart || !areAllRequiredFieldsFilled()}
									className="w-full h-[50px] lg:w-[580px] sm:h-[60px] rounded-[12px] border-2 border-[#264A3F] bg-white text-[#264A3F] text-base sm:text-base lg:text-[18px] font-bold hover:bg-[#264A3F] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
									Buy Now
								</button>
								{/* -------------------- Add By Pawan For Buy Now (END) -------------------- */}
								{!areAllRequiredFieldsFilled() && getRequiredFields().some(f => !f.value || f.value === "") && (
									<p className="text-xs text-red-500 text-center mt-1">
										Please select all required options above
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default HeaderDetailPage;
