import express from "express";
import getCurrencyRates from "../controllers/currency.controller.js"
const router = express.Router();
router.get("/rates",getCurrencyRates);
// get api /v1/currency/GiWaterSplash /
export default router; 