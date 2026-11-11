import express from "express";
import { razorpayWebhook } from "../controllers/razorpayWebhook.controller.js";

const router = express.Router();

router.post("/webhook", razorpayWebhook);

export default router;
