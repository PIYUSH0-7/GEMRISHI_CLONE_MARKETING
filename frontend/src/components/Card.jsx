import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Play, ShoppingBag, Trash2 } from "lucide-react";
import WishlistButton from "./wishlistButton";
import CompareButton from "./compare/CompareButton";
import VideoModal from "./models/VideoModal";
import Price from "./Price";
import { getProductDisplayPrice, getProductOriginalPrice } from "../config/campaignOffers.config.js";
import { getProductUrl } from "../utils/productUrl";
import { fbqTrackCustom } from "../utils/metaPixel";

const Card = ({
	image,
	title,
	origin,
	Type,
	price,
	jewelryPrice,
	slug,
	videos,
	id,
	itemType = "Product",
	sku,
	product,
	showAddToCart = false,
	onAddToCart = null,
	isAddingToCart = false,
	inStock = true,
	openInNewTab = false,
	onPlayVideo = null,
	showRemove = false,
	onRemove = null,
	className = "",
}) => {
	const [showModal, setShowModal] = useState(false);
	const [imgError, setImgError] = useState(false);

	const targetId = String(id || product?._id || product?.id || sku || "");
	const targetTitle = title || product?.name || product?.jewelryName || "Certified Gemstone";
	const targetOrigin = origin || Type || product?.origin || product?.productId?.origin || "";
	const targetPrice =
		product != null
			? getProductDisplayPrice(product)
			: price != null
			? price
			: jewelryPrice != null
			? jewelryPrice
			: null;
	const targetOriginalPrice = product ? getProductOriginalPrice(product) : null;

	// Extract videos from either prop or product object (supporting arrays, objects, and strings)
	const rawVideos =
		videos && (Array.isArray(videos) ? videos.length > 0 : Boolean(videos))
			? videos
			: product?.videos && (Array.isArray(product.videos) ? product.videos.length > 0 : Boolean(product.videos))
			? product.videos
			: product?.video
			? [product.video]
			: product?.videoUrl
			? [product.videoUrl]
			: [];

	const targetVideos = Array.isArray(rawVideos) ? rawVideos : [rawVideos].filter(Boolean);

	const firstVideoRaw = targetVideos[0];
	const firstVideoUrl = firstVideoRaw
		? typeof firstVideoRaw === "string"
			? firstVideoRaw
			: firstVideoRaw?.url || firstVideoRaw?.videoUrl || firstVideoRaw?.secure_url || null
		: null;

	const targetImage =
		image ||
		product?.images?.[0]?.url ||
		(typeof product?.images?.[0] === "string" ? product.images[0] : null) ||
		"/ring.png";

	const targetSlug = slug || product?.slug || "#";
	const targetSku = sku || product?.sku || "";
	const effectiveItemType = itemType || (product?.jewelryName ? "Jewelry" : "Product");

	const productPayload = product || {
		_id: targetId,
		id: targetId,
		title: targetTitle,
		name: targetTitle,
		jewelryName: targetTitle,
		price: targetPrice,
		jewelryPrice: targetPrice,
		image: targetImage,
		images: product?.images || (targetImage ? [{ url: targetImage }] : []),
		slug: targetSlug,
		sku: targetSku,
		origin: targetOrigin,
		itemType: effectiveItemType,
		videos: targetVideos,
		type: targetOrigin,
	};

	const targetUrl = (() => {
		if (product) return getProductUrl(product);
		if (targetSku)
			return getProductUrl({
				name: targetTitle,
				jewelryName: targetTitle,
				sku: targetSku,
				slug: targetSlug,
				_id: targetId,
			});
		if (targetSlug && targetSlug !== "#") {
			if (targetSlug.startsWith("/")) return targetSlug;
			return `/products/${targetSlug}`;
		}
		if (targetId) return `/products/${targetId}`;
		return "#";
	})();

	const handleImageError = () => {
		setImgError(true);
	};

	const handleSelectCard = () => {
		if (typeof window !== "undefined") {
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({ ecommerce: null });
			window.dataLayer.push({
				event: "select_item",
				ecommerce: {
					items: [
						{
							item_id: String(targetSku || targetId || targetSlug || ""),
							item_name: targetTitle,
							item_category: effectiveItemType,
							item_brand: "GemRishi",
							price: Number(targetPrice) || 0,
						},
					],
				},
			});

			fbqTrackCustom("SelectItem", {
				content_id: String(targetSku || targetId || targetSlug || ""),
				content_name: targetTitle,
				content_category: effectiveItemType,
				value: Number(targetPrice) || 0,
				currency: "INR",
			});
		}
	};

	return (
		<div className={`h-full flex flex-col ${className}`}>
			<div className="w-full h-full bg-white rounded-[16px] shadow-sm hover:shadow-xl transition-all duration-300 pt-6 sm:pt-8 pb-6 border border-gray-100 flex flex-col justify-between items-center relative group">
				{/* Top Action Buttons (Wishlist / Remove, Compare, Video) */}
				<div className="absolute top-3 right-3 flex items-center gap-1.5 sm:gap-2 z-20">
					{/* Wishlist or Direct Remove Button */}
					{showRemove ? (
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (onRemove) onRemove(targetId);
							}}
							aria-label="Remove from Wishlist"
							title="Remove from Wishlist"
							className="w-8 h-8 sm:w-9 sm:h-9 min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] rounded-full border border-gray-100 bg-white/95 backdrop-blur-xs hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer z-10 hover:shadow-md"
						>
							<Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
						</button>
					) : (
						<WishlistButton
							itemId={targetId}
							itemType={effectiveItemType}
							product={productPayload}
						/>
					)}

					{/* Compare Button */}
					<CompareButton
						id={targetId}
						product={productPayload}
					/>

					{/* Play Video Button */}
					{(Boolean(firstVideoUrl) || targetVideos.length > 0) && (
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (onPlayVideo && firstVideoUrl) {
									onPlayVideo(firstVideoUrl);
								} else {
									setShowModal(true);
								}
							}}
							aria-label="Play video"
							title="Watch Video"
							className="w-8 h-8 sm:w-9 sm:h-9 min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] rounded-full border border-gray-100 bg-white/90 backdrop-blur-xs hover:bg-white text-gray-600 hover:text-[#1E3A34] flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer z-10 hover:shadow-md"
						>
							<Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 ml-0.5" />
						</button>
					)}
				</div>

				{/* Card Body Link */}
				<Link
					to={targetUrl}
					onClick={handleSelectCard}
					target={openInNewTab ? "_blank" : undefined}
					rel={openInNewTab ? "noopener noreferrer" : undefined}
					className="w-full flex-grow flex flex-col justify-between items-center"
				>
					{/* Product Image */}
					<div className="w-full px-4 sm:px-6 mb-3 sm:mb-4 flex-grow flex items-center justify-center min-h-[140px] sm:min-h-[180px] lg:min-h-[220px]">
						{!imgError && targetImage ? (
							<img
								src={targetImage}
								alt={targetTitle}
								loading="lazy"
								className="w-full h-[140px] sm:h-[180px] lg:h-[220px] object-contain group-hover:scale-105 transition-transform duration-500"
								onError={handleImageError}
							/>
						) : (
							<div className="flex flex-col items-center justify-center text-gray-400">
								<div className="text-4xl mb-2">📷</div>
								<p className="text-xs sm:text-sm">No image available</p>
							</div>
						)}
					</div>

					{/* Text Details */}
					<div className="flex flex-col items-center w-full px-3 mt-auto">
						{/* Title */}
						<h2 className="text-sm sm:text-[15px] font-bold text-center text-[#0B1D3A] line-clamp-2 leading-snug break-words w-full">
							{targetTitle}
						</h2>

						{/* Origin Badge */}
						{targetOrigin && (
							<span className="bg-gray-50 text-gray-500 text-[10px] sm:text-xs px-2.5 py-1 rounded-md mt-2 border border-gray-100 text-center">
								Origin: {targetOrigin}
							</span>
						)}

						{/* Price */}
						<div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
							<p className="text-sm sm:text-base text-[#264A3F] font-bold text-center">
								{targetPrice != null ? <Price amount={targetPrice} /> : "Price on request"}
							</p>
							{targetOriginalPrice ? (
								<span className="text-xs sm:text-sm text-gray-400 line-through">
									<Price amount={targetOriginalPrice} />
								</span>
							) : null}
						</div>
					</div>
				</Link>

				{/* Optional Add to Cart (used in Wishlist, etc.) */}
				{showAddToCart && (
					<div className="w-full px-3 mt-4 pt-3 border-t border-gray-100">
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (onAddToCart) onAddToCart();
							}}
							disabled={isAddingToCart || !inStock}
							className="w-full min-h-[38px] py-2 px-3 bg-[#1E3A34] hover:bg-[#162c27] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
						>
							<ShoppingBag className="w-3.5 h-3.5" />
							<span>{isAddingToCart ? "Adding..." : !inStock ? "Out of Stock" : "Add to Cart"}</span>
						</button>
					</div>
				)}
			</div>

			{/* Video Modal (Portals to document.body) */}
			{firstVideoUrl && (
				<VideoModal
					isOpen={showModal}
					onClose={() => setShowModal(false)}
					videoUrl={firstVideoUrl}
				/>
			)}
		</div>
	);
};

export default Card;
