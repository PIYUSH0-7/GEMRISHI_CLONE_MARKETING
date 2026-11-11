import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import {
	addToWishlist as addWishAPI,
	removeFromWishlist as removeWishAPI,
} from "../api/wishlist";
import {
	addToWishlist as addWishAction,
	removeFromwishlist as removeWishAction,
} from "../redux/wishlistSlice";
import { clearCart } from "../redux/cartSlice";
import { toast } from "react-toastify";

const toastOptions = {
	position: "top-center",
	autoClose: 2500,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	theme: "light",
	style: {
		background: "#1E3A34",
		color: "#FAF9F6",
		borderRadius: "8px",
		fontWeight: "500",
		boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
	},
	zIndex: 9999,
};

const WishlistButton = ({
	itemId,
	itemType = "Product",
	product = null,
	clearCartOnRemove = false,
	className = "",
}) => {
	const dispatch = useDispatch();
	const wishlistItems = useSelector((state) => state.wishlist?.items || []);
	const [loading, setLoading] = useState(false);

	const targetId = String(itemId || product?._id || product?.id || "");

	const isWishlisted = wishlistItems.some((wish) => {
		const wishId = String(wish?.item?._id || wish?._id || wish?.itemId || "");
		return wishId && wishId === targetId;
	});

	const handleWishlist = async (e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		if (!targetId || loading) return;

		setLoading(true);

		try {
			if (isWishlisted) {
				// Optimistic removal
				dispatch(removeWishAction(targetId));

				if (clearCartOnRemove) {
					dispatch(clearCart());
				}

				toast.dismiss();
				toast.info("Removed from wishlist", toastOptions);

				await removeWishAPI(targetId);
			} else {
				// Optimistic addition with full product snapshot for guest browser cache
				const cleanProduct = product || {};
				const itemPayload = {
					_id: targetId,
					itemId: targetId,
					itemType: itemType || (cleanProduct.jewelryName ? "Jewelry" : "Product"),
					item: {
						_id: targetId,
						name: cleanProduct.name || cleanProduct.title || cleanProduct.jewelryName || "Certified Gemstone",
						title: cleanProduct.title || cleanProduct.name || cleanProduct.jewelryName || "Certified Gemstone",
						jewelryName: cleanProduct.jewelryName,
						price: cleanProduct.price || cleanProduct.jewelryPrice || 0,
						jewelryPrice: cleanProduct.jewelryPrice,
						images: cleanProduct.images || (cleanProduct.image ? [{ url: cleanProduct.image }] : []),
						image: cleanProduct.image || cleanProduct.images?.[0]?.url || "/placeholder.svg",
						slug: cleanProduct.slug || "#",
						sku: cleanProduct.sku || "",
						origin: cleanProduct.origin || "",
						videos: cleanProduct.videos || [],
						isAvailable: cleanProduct.isAvailable !== false,
						...cleanProduct,
					},
				};
				dispatch(addWishAction(itemPayload));

				toast.dismiss();
				toast.success("Added to wishlist", toastOptions);

				await addWishAPI(targetId, itemType || "Product");
			}
		} catch (err) {
			console.error("Wishlist action error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleWishlist}
			disabled={loading}
			aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
			title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
			className={`w-8 h-8 sm:w-9 sm:h-9 min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] rounded-full flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer z-10 ${
				isWishlisted
					? "bg-[#FD3C3F]/10 text-[#FD3C3F] border border-[#FD3C3F]/30 hover:bg-[#FD3C3F]/20"
					: "bg-white/90 backdrop-blur-xs text-gray-500 hover:text-[#FD3C3F] hover:bg-white border border-gray-100 hover:shadow-md"
			} ${className}`}
		>
			<Heart
				className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
					isWishlisted ? "fill-[#FD3C3F] text-[#FD3C3F] scale-110" : "hover:scale-110"
				}`}
			/>
		</button>
	);
};

export default WishlistButton;
