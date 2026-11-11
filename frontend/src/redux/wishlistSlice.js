import { createSlice } from "@reduxjs/toolkit";

const loadCachedWishlist = () => {
	try {
		const raw = localStorage.getItem("wishlistItems");
		return raw ? JSON.parse(raw) : [];
	} catch (err) {
		console.warn("Failed to read cached wishlist:", err);
		return [];
	}
};

const saveWishlistToCache = (items) => {
	try {
		localStorage.setItem("wishlistItems", JSON.stringify(items));
	} catch (err) {
		console.warn("Failed to cache wishlist:", err);
	}
};

const initialState = {
	items: loadCachedWishlist(),
};

const wishlistSlice = createSlice({
	name: "wishlist",
	initialState,
	reducers: {
		setWishlist: (state, action) => {
			const incoming = action.payload;
			if (!Array.isArray(incoming)) return;
			state.items = incoming;
			saveWishlistToCache(state.items);
		},

		addToWishlist: (state, action) => {
			const newItem = action.payload;
			const newId = String(newItem?.item?._id || newItem?._id || newItem?.itemId || "");

			const exists = state.items.some((wish) => {
				const wishId = String(wish?.item?._id || wish?._id || wish?.itemId || "");
				return wishId === newId;
			});

			if (!exists && newId) {
				state.items.push(newItem);
				saveWishlistToCache(state.items);
			}
		},

		removeFromwishlist: (state, action) => {
			const target = action.payload;
			const targetId = String(
				typeof target === "string"
					? target
					: target?.item?._id || target?._id || target?.itemId || ""
			);

			state.items = state.items.filter((wish) => {
				const wishId = String(wish?.item?._id || wish?._id || wish?.itemId || "");
				return wishId !== targetId;
			});
			saveWishlistToCache(state.items);
		},

		clearWishlist: (state) => {
			state.items = [];
			try {
				localStorage.removeItem("wishlistItems");
			} catch {}
		},
	},
});

export const { setWishlist, addToWishlist, removeFromwishlist, clearWishlist } =
	wishlistSlice.actions;

export default wishlistSlice.reducer;
