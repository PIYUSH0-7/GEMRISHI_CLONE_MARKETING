// ------------Add By Pawan------------
import { Router } from "express";
import { getProductFeedXml } from "../controllers/productFeed.controller.js";

const router = Router();
router.get("/products.xml", getProductFeedXml);

export default router;
// ------------Add By Pawan------------