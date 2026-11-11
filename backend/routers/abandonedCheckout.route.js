import express from "express";
import {
  listAbandonedCheckouts,
  getAbandonedCheckoutById,
  markAbandonedCheckoutResolved,
  exportAbandonedCheckouts,
} from "../controllers/abandonedCheckout.controller.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get("/export/csv", protectAdmin, exportAbandonedCheckouts);

router.get("/", protectAdmin, listAbandonedCheckouts);
router.get("/:id", protectAdmin, getAbandonedCheckoutById);
router.patch("/:id/resolve", protectAdmin, markAbandonedCheckoutResolved);

export default router;
