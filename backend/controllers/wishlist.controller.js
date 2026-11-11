import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Jewelry } from "../models/jewelry.model.js";
import { MetalRates } from "../models/metalRates.model.js";
import mongoose from "mongoose";

// Helper: Get Wishlist Owner (Logged-in User or isolated Guest by cookie)
const getWishlistOwner = async (req, res) => {
	let user;

	if (req.user && req.user._id) {
		user = await User.findById(req.user._id).select("wishlist");
	} else {
		let guestId = req.cookies?.guestId;

		if (!guestId) {
			guestId = new mongoose.Types.ObjectId();

			res.cookie("guestId", guestId, {
				httpOnly: true,
				secure: true,
				sameSite: "None",
				maxAge: 30 * 24 * 60 * 60 * 1000,
			});
		}

		user = await User.findById(guestId).select("wishlist");

		if (!user) {
			user = await User.create({
				_id: guestId,
				fullName: "Guest User",
				email: `guest_${guestId}@temp.com`,
				password: `guest_${guestId}`,
				isGuest: true,
				wishlist: [],
			});
		}
	}
	return user;
};

// Add item to wishlist
const addToWishlist = async (req, res) => {
	try {
		const owner = await getWishlistOwner(req, res);
		if (!owner) {
			return res.status(400).json({ success: false, message: "Unable to determine wishlist owner." });
		}
		const userId = owner._id;
		let { itemType, itemId } = req.body;

		if (!itemId) {
			return res.status(400).json({ success: false, message: "Item ID is required." });
		}

		// Auto-detect itemType if missing or not matching
		if (!["Product", "Jewelry"].includes(itemType)) {
			const isProd = await Product.exists({ _id: itemId });
			if (isProd) {
				itemType = "Product";
			} else {
				const isJewel = await Jewelry.exists({ _id: itemId });
				if (isJewel) {
					itemType = "Jewelry";
				} else {
					itemType = "Product";
				}
			}
		}

		// Check if already in wishlist
		const exists = await User.exists({
			_id: userId,
			"wishlist.item": itemId,
		});

		if (exists) {
			return res.status(200).json({
				success: true,
				message: "Item is already in wishlist.",
				alreadyExists: true,
			});
		}

		const updateStatus = await User.updateOne(
			{ _id: userId },
			{ $push: { wishlist: { itemType, item: itemId } } }
		);

		return res.status(200).json({
			success: true,
			message: "Added to wishlist.",
			updateStatus,
		});
	} catch (err) {
		console.error("addToWishlist error:", err);
		return res.status(500).json({
			success: false,
			message: "Server error.",
			error: err.message,
		});
	}
};

// Get all wishlist items
const getAllWishlist = async (req, res) => {
	try {
		const owner = await getWishlistOwner(req, res);
		if (!owner) {
			return res.status(200).json({
				success: true,
				message: "Wishlist fetched successfully.",
				wishlist: [],
				metalRates: null,
			});
		}
		const userId = owner._id;

		let user = await User.findById(userId)
			.select("wishlist")
			.populate({
				path: "wishlist.item",
				select:
					"name slug price sellPrice images jewelryPrice jewelryName jewelryType isAvailable jewelryMetalWeight metal sku category origin gemstoneWeight certificate videos",
			});

		// Filter out null items (e.g. deleted products)
		const sanitizedWishlist = (user?.wishlist || []).filter(
			(entry) => entry && entry.item
		);

		// Fetch the most recent metal rates
		const latestMetalRates = await MetalRates.findOne()
			.sort({ createdAt: -1 })
			.lean();

		return res.status(200).json({
			success: true,
			message: "Wishlist fetched successfully.",
			wishlist: sanitizedWishlist,
			metalRates: latestMetalRates,
		});
	} catch (err) {
		console.error("getAllWishlist error:", err);
		return res.status(500).json({
			success: false,
			message: "Server error.",
			error: err.message,
		});
	}
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
	try {
		const owner = await getWishlistOwner(req, res);
		if (!owner) {
			return res.status(200).json({ success: true, message: "Removed from wishlist." });
		}
		const userId = owner._id;
		const itemId = req.query.itemId || req.body?.itemId;

		if (!itemId) {
			return res.status(400).json({ success: false, message: "Item ID is required." });
		}

		// Remove matching either item reference or subdocument _id
		const result = await User.updateOne(
			{ _id: userId },
			{
				$pull: {
					wishlist: {
						$or: [{ item: itemId }, { _id: itemId }],
					},
				},
			}
		);

		return res.status(200).json({
			success: true,
			message: "Removed from wishlist.",
			updateStatus: result,
		});
	} catch (err) {
		console.error("removeFromWishlist error:", err);
		return res.status(500).json({
			success: false,
			message: "Server error.",
			error: err.message,
		});
	}
};

export { addToWishlist, getAllWishlist, removeFromWishlist };
