import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "../features/api/authSlice";
import { apiSlice } from "../features/api/apiSlice";
import cartReducer from "../redux/cartSlice";
import wishlistReducer from "../redux/wishlistSlice";
import compareReducer from "../redux/compareSlice";
// -----------Add By Pawan For currency-----------------
import currencyReducer from "../redux/currencySlice";

export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		auth: authSliceReducer,
		cart: cartReducer,
		wishlist: wishlistReducer,
		compare: compareReducer,
		currency: currencyReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
	devTools: true,
});
