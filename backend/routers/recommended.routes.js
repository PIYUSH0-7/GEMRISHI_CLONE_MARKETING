import express from "express";
import * as gemstoneController from "../controllers/recommender.controller.js";
import { exportProductsCsv, viewProductsDashboard } from "../controllers/product.controller.js";
const router = express.Router();

router.post("/gem-suggestion", gemstoneController.recommend);
router.post("/lead-suggestion", gemstoneController.saveLeadSuggestion);
router.get("/leads-export", gemstoneController.exportLeadsCsv);
router.get("/leads-view", gemstoneController.viewLeadsDashboard);
router.get("/lead-pdf/:reportId", gemstoneController.getLeadPdf);
router.post("/update-lead-status", gemstoneController.updateLeadCallStatus);

// Aliases for Products Live CSV & Web View under recommended router
router.get("/products-export", exportProductsCsv);
router.get("/products-view", viewProductsDashboard);

export default router;

