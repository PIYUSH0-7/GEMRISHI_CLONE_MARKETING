import Router from "express";
import {
	addToWishlist,
	getAllWishlist,
	removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { checkUserLoggedIn } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/add_to_wishlist", checkUserLoggedIn, upload.none(), addToWishlist);
router.get("/get_all_wishlist", checkUserLoggedIn, getAllWishlist);
router.delete("/remove_from_wishlist", checkUserLoggedIn, upload.none(), removeFromWishlist);

export default router;
