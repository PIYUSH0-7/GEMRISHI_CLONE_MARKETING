import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Trash2, ShoppingBag, ArrowRight, Eye, Scale } from "lucide-react";
import { useGetWish } from "../hooks/usegetwish";
import { removeFromWishlist as removeWishAPI } from "../api/wishlist";
import { removeFromwishlist } from "../redux/wishlistSlice";
import { addItemToCart as addToCartAction } from "../redux/cartSlice";
import { addItemToCart } from "../api/addtocart";
import { toggleCompare } from "../redux/compareSlice";
import { getProductUrl } from "../utils/productUrl";
import { getProductImage } from "../utils/imageUtils";
import Price from "../components/Price";
import { getProductDisplayPrice } from "../config/campaignOffers.config.js";
import Card from "../components/Card";
import VideoModal from "../components/models/VideoModal";
import { toast } from "react-toastify";

const WishlistItemSkeleton = () => (
	<div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs animate-pulse flex flex-col justify-between">
		<div>
			<div className="w-full h-52 bg-gray-200 rounded-xl mb-4"></div>
			<div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2"></div>
			<div className="h-4 bg-gray-100 rounded-md w-1/2 mb-3"></div>
			<div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
		</div>
		<div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
			<div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
			<div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
		</div>
	</div>
);

const WishlistPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { wishlist, metalRates, loading, error, setWishlist } = useGetWish();
	const compareItems = useSelector((state) => state.compare?.items || []);
	const reduxWishlist = useSelector((state) => state.wishlist?.items || []);
	const [actionLoadingId, setActionLoadingId] = useState(null);
	const [selectedVideo, setSelectedVideo] = useState(null);
	const [showVideoModal, setShowVideoModal] = useState(false);

	const handleRemove = async (targetId) => {
		try {
			dispatch(removeFromwishlist(targetId));
			setWishlist((prev) =>
				prev.filter((wish) => {
					const wishId = wish?.item?._id || wish?._id || wish?.itemId;
					return String(wishId) !== String(targetId);
				})
			);
			toast.info("Removed from wishlist");
			await removeWishAPI(targetId);
		} catch (err) {
			console.error("Error removing wishlist item:", err);
		}
	};

	const handleAddToCart = async (wishItem) => {
		const item = wishItem?.item || wishItem;
		if (!item) return;

		const itemId = item._id || item.id || wishItem.itemId || wishItem._id;
		setActionLoadingId(itemId);

		try {
			const itemType = wishItem.itemType || (item.jewelryName ? "Jewelry" : "Product");
			const calculatedPrice = calculatePrice(item, itemType);

			const payload = {
				itemId,
				itemType,
				quantity: 1,
				price: calculatedPrice,
				totalPrice: calculatedPrice,
				customization: JSON.stringify({}),
			};

			const response = await addItemToCart(payload);
			if (response?.success !== false) {
				dispatch(
					addToCartAction({
						itemId,
						itemType,
						quantity: 1,
						price: calculatedPrice,
						totalPrice: calculatedPrice,
						customization: {},
						item,
					})
				);
				toast.success("Added to cart successfully!");
			} else {
				toast.error(response?.message || "Failed to add to cart");
			}
		} catch (err) {
			console.error("Add to cart error:", err);
			toast.error(err.response?.data?.message || err.message || "Failed to add to cart");
		} finally {
			setActionLoadingId(null);
		}
	};

	const handleToggleCompare = (item) => {
		if (!item) return;
		dispatch(toggleCompare(item));
	};

	const calculatePrice = (item, itemType) => {
		if (!item) return 0;
		if (itemType === "Product") {
			return getProductDisplayPrice(item);
		}

		const jewelryPrice = Number(item.jewelryPrice) || 0;
		if (jewelryPrice > 0) return jewelryPrice;

		const jewelryMetalWeight = Number(item.jewelryMetalWeight) || 0;
		const metal = item.metal?.toLowerCase();

		if (!metal || !metalRates?.[metal]) {
			return item.price || 0;
		}

		if (metal === "gold") {
			const rate =
				metalRates[metal]?.gold22k?.withGSTRate ||
				metalRates[metal]?.gold24k?.withGSTRate ||
				0;
			return rate * jewelryMetalWeight;
		}

		const rate = metalRates[metal]?.withGSTRate || 0;
		return rate * jewelryMetalWeight;
	};

	// Valid wishlist items prioritizing authoritative server list, with guest cache fallback
	const validItems = useMemo(() => {
		const source = (wishlist && wishlist.length > 0)
			? wishlist
			: (loading ? (reduxWishlist || []) : (wishlist !== null ? wishlist : reduxWishlist));

		const map = new Map();
		(source || []).forEach((w) => {
			if (!w) return;
			const targetObj = w.item && typeof w.item === "object" ? w.item : w;
			const id = String(targetObj?._id || targetObj?.id || w?._id || w?.itemId || "");
			if (id) {
				map.set(id, {
					...w,
					_id: id,
					itemType: w.itemType || (targetObj.jewelryName ? "Jewelry" : "Product"),
					item: targetObj,
				});
			}
		});

		return Array.from(map.values()).filter((w) => Boolean(w && w.item));
	}, [wishlist, reduxWishlist, loading]);

	return (
		<div className="min-h-screen bg-[#FAF9F6] py-8 sm:py-12">
			<div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
				{/* Top Luxury Breadcrumb / Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-gray-200/80 gap-4">
					<div>
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
							<Heart className="w-4 h-4 fill-[#D4AF37]" />
							<span>Curated Collection</span>
						</div>
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#111827]">
							My Wishlist
							{(validItems.length > 0 || !loading) && (
								<span className="text-sm font-sans font-normal text-gray-500 ml-3">
									({validItems.length} {validItems.length === 1 ? "item" : "items"})
								</span>
							)}
						</h1>
					</div>

					<Link
						to="/gemstone"
						className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E3A34] hover:text-[#D4AF37] transition-colors py-2"
					>
						<span>Explore Gemstones</span>
						<ArrowRight className="w-4 h-4" />
					</Link>
				</div>

				{/* Error Notice */}
				{error && (
					<div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm max-w-lg mx-auto text-center">
						{error}
					</div>
				)}

				{/* Loading Skeletons */}
				{loading && validItems.length === 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{[...Array(4)].map((_, i) => (
							<WishlistItemSkeleton key={i} />
						))}
					</div>
				)}

				{/* Empty State */}
				{!loading && validItems.length === 0 && (
					<div className="max-w-xl mx-auto py-16 px-6 text-center bg-white rounded-3xl border border-gray-100 shadow-sm my-8">
						<div className="w-20 h-20 mx-auto rounded-full bg-[#1E3A34]/5 flex items-center justify-center text-[#1E3A34] mb-6">
							<Heart className="w-10 h-10 stroke-[1.5]" />
						</div>
						<h2 className="text-2xl font-serif font-bold text-[#111827] mb-2">
							Your Wishlist is Empty
						</h2>
						<p className="text-gray-600 text-sm mb-8 leading-relaxed">
							Explore our authentic collection of lab-certified natural gemstones,
							astrological gems, and handcrafted luxury jewellery to save your
							favorite treasures here.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Link
								to="/gemstone"
								className="min-h-[44px] px-6 py-3 bg-[#1E3A34] hover:bg-[#162c27] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
							>
								<span>Browse Natural Gemstones</span>
								<ArrowRight className="w-4 h-4" />
							</Link>
							<Link
								to="/jewellery"
								className="min-h-[44px] px-6 py-3 border border-gray-300 hover:border-[#1E3A34] text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center"
							>
								Browse Jewellery
							</Link>
						</div>
					</div>
				)}

				{/* Wishlist Items Grid */}
				{!loading && validItems.length > 0 && (
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
						{validItems.map((wish) => {
							const item = wish.item || wish;
							const itemId = item._id || item.id || wish.itemId || wish._id;
							const price = calculatePrice(item, wish.itemType);
							const imgSrc = getProductImage(item, item.image || "/placeholder.svg");
							const title = item.name || item.jewelryName || item.title || "Certified Gemstone";

							const reduxMatch = reduxWishlist.find(r => String(r?.item?._id || r?._id || r?.itemId) === String(itemId));
							const effectiveVideos = (item?.videos && item.videos.length > 0)
								? item.videos
								: (reduxMatch?.item?.videos || reduxMatch?.videos || []);

							return (
								<Card
									key={wish._id || itemId}
									product={{ ...item, videos: effectiveVideos }}
									id={itemId}
									sku={item.sku}
									slug={item.slug}
									image={imgSrc}
									title={title}
									origin={item.origin}
									price={price}
									videos={effectiveVideos}
									itemType={wish.itemType || (item.jewelryName ? "Jewelry" : "Product")}
									showAddToCart={true}
									onAddToCart={() => handleAddToCart(wish)}
									isAddingToCart={actionLoadingId === itemId}
									inStock={item.isAvailable !== false}
									showRemove={true}
									onRemove={() => handleRemove(itemId)}
									onPlayVideo={(url) => {
										setSelectedVideo(url);
										setShowVideoModal(true);
									}}
								/>
							);
						})}
					</div>
				)}
				{/* Video Modal for Wishlist */}
				{selectedVideo && (
					<VideoModal
						isOpen={showVideoModal}
						onClose={() => {
							setShowVideoModal(false);
							setSelectedVideo(null);
						}}
						videoUrl={selectedVideo}
					/>
				)}
			</div>
		</div>
	);
};

export default WishlistPage;
