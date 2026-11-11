import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { getWishlist } from "../api/wishlist";
import { setWishlist as setWishlistRedux } from "../redux/wishlistSlice";

export const useGetWish = () => {
	const dispatch = useDispatch();
	const [wishlist, setWishlist] = useState([]);
	const [metalRates, setMetalRates] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchWishlist = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await getWishlist();
			if (res?.success && Array.isArray(res?.wishlist)) {
				const list = res.wishlist;
				setWishlist(list);
				setMetalRates(res?.metalRates || null);
				dispatch(setWishlistRedux(list));
			} else {
				// Fallback to local cached wishlist if server is unavailable or returned error
				const cached = localStorage.getItem("wishlistItems");
				if (cached) {
					try {
						const parsed = JSON.parse(cached);
						setWishlist(parsed);
					} catch {}
				}
			}
		} catch (err) {
			console.error("useGetWish error:", err);
			setError(err.message || "Failed to fetch wishlist");
		} finally {
			setLoading(false);
		}
	}, [dispatch]);

	useEffect(() => {
		fetchWishlist();
	}, [fetchWishlist]);

	return { wishlist, metalRates, loading, error, setWishlist, setMetalRates, refetch: fetchWishlist };
};
