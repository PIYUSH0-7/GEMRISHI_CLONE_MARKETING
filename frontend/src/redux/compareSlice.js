import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const MAX_COMPARE_ITEMS = 4;

const loadCachedCompare = () => {
	try {
		const raw = localStorage.getItem("compareItems");
		return raw ? JSON.parse(raw) : [];
	} catch (err) {
		console.warn("Error reading cached compare items:", err);
		return [];
	}
};

const saveCompareToCache = (items) => {
	try {
		localStorage.setItem("compareItems", JSON.stringify(items));
	} catch (err) {
		console.warn("Error caching compare items:", err);
	}
};

const normalizeProduct = (product) => {
	if (!product) return null;
	const id = String(product._id || product.id || "");
	const name = product.name || product.jewelryName || product.title || "Product";
	const price = Number(product.sellPrice || product.price || product.jewelryPrice || 0);

	return {
		_id: id,
		id: id,
		name: name,
		jewelryName: product.jewelryName,
		title: name,
		slug: product.slug,
		sku: product.sku,
		price: price,
		originalPrice: Number(product.price || 0),
		sellPrice: Number(product.sellPrice || 0),
		jewelryPrice: Number(product.jewelryPrice || 0),
		images: Array.isArray(product.images)
			? product.images
			: product.image
			? [{ url: product.image }]
			: [],
		image: product.image,
		itemType: product.itemType || (product.jewelryName ? "Jewelry" : "Product"),
		category: product.category,
		origin: product.origin || "",
		gemstoneWeight: product.gemstoneWeight || null,
		certificate: product.certificate || null,
		metal: product.metal || "",
		jewelryMetalWeight: product.jewelryMetalWeight || 0,
		isAvailable: product.isAvailable !== false,
		shape: product.shape || product.cut || "",
		treatment: product.treatment || "",
		color: product.color || product.gemstoneColor || "",
	};
};

const initialState = {
	items: loadCachedCompare(),
};

const compareSlice = createSlice({
	name: "compare",
	initialState,
	reducers: {
		addToCompare: (state, action) => {
			const normalized = normalizeProduct(action.payload);
			if (!normalized || !normalized._id) return;

			const exists = state.items.some(
				(item) => String(item._id) === String(normalized._id)
			);

			if (exists) {
				toast.info("Item is already in comparison");
				return;
			}

			if (state.items.length >= MAX_COMPARE_ITEMS) {
				toast.warning(
					`Comparison limit reached! You can compare up to ${MAX_COMPARE_ITEMS} items.`
				);
				return;
			}

			state.items.push(normalized);
			saveCompareToCache(state.items);
			toast.success(
				`Added to compare (${state.items.length}/${MAX_COMPARE_ITEMS})`
			);
		},

		removeFromCompare: (state, action) => {
			const targetId = String(action.payload);
			state.items = state.items.filter(
				(item) => String(item._id) !== targetId && String(item.id) !== targetId
			);
			saveCompareToCache(state.items);
			toast.info("Removed from comparison");
		},

		toggleCompare: (state, action) => {
			const target = action.payload;
			const targetId = String(target?._id || target?.id || target);

			const existsIndex = state.items.findIndex(
				(item) => String(item._id) === targetId || String(item.id) === targetId
			);

			if (existsIndex > -1) {
				state.items.splice(existsIndex, 1);
				saveCompareToCache(state.items);
				toast.info("Removed from comparison");
			} else {
				if (state.items.length >= MAX_COMPARE_ITEMS) {
					toast.warning(
						`Comparison limit reached! You can compare up to ${MAX_COMPARE_ITEMS} items.`
					);
					return;
				}
				const normalized = normalizeProduct(target);
				if (normalized) {
					state.items.push(normalized);
					saveCompareToCache(state.items);
					toast.success(
						`Added to compare (${state.items.length}/${MAX_COMPARE_ITEMS})`
					);
				}
			}
		},

		clearCompare: (state) => {
			state.items = [];
			try {
				localStorage.removeItem("compareItems");
			} catch {}
			toast.info("Cleared all compared items");
		},
	},
});

export const {
	addToCompare,
	removeFromCompare,
	toggleCompare,
	clearCompare,
} = compareSlice.actions;

export default compareSlice.reducer;
