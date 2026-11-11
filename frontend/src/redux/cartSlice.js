import { createSlice } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
	const stored = localStorage.getItem("cartItems");
	return stored ? JSON.parse(stored) : [];
};

const saveCartToStorage = (items) => {
	localStorage.setItem("cartItems", JSON.stringify(items));
};

const initialState = {
	items: loadCartFromStorage(),
	insufficientStock: false,
};

export const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		setCartItems: (state, action) => {
			state.items = action.payload;
			saveCartToStorage(state.items);
		},

		addItemToCart: (state, action) => {
			const { itemId, quantity = 1 } = action.payload;
			const existingItem = state.items.find((item) => item.itemId === itemId);

			if (existingItem) {
				existingItem.quantity += quantity;
			} else {
				state.items.push({ ...action.payload });
			}

			// ✅ Save to localStorage after every update
			saveCartToStorage(state.items);
		},

		removeItemFromCart: (state, action) => {
			const itemIdToRemove = action.payload;
			state.items = state.items.filter(
				(item) => item.itemId !== itemIdToRemove
			);
			saveCartToStorage(state.items);
		},

		clearCart: (state) => {
			state.items = [];
			localStorage.removeItem("cartItems");
		},

		setInsufficientStock: (state, action) => {
			state.insufficientStock = action.payload;
		},
	},
});

export const {
	setCartItems,
	addItemToCart,
	removeItemFromCart,
	clearCart,
	setInsufficientStock,
} = cartSlice.actions;

export default cartSlice.reducer;
