import express from "express";
import {
  cashfreeWebhook,
  verifyCashfreeOrder,
  trackCashfreeAbandoned,
  createConsultationCashfreeOrder,
} from "../controllers/cashfreeWebhook.controller.js";

const router = express.Router();

// Cashfree Webhook Callback Endpoint
router.post("/webhook", cashfreeWebhook);

// Cashfree Order Status Verification Endpoint
router.get("/verify-order/:orderId", verifyCashfreeOrder);

// Realtime modal drop-off tracking
router.post("/track-abandoned", trackCashfreeAbandoned);

// Create consultation cashfree order session
router.post("/create-consultation-order", createConsultationCashfreeOrder);

export default router;
