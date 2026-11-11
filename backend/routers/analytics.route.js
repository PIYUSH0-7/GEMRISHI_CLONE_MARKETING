import { Router } from "express";
import {
  customerStats,
  getOrderStats,
  inventory,
  ordersCountByMonthAndYear,
  revenueByMonthsAndYear,
  trackMetaEventBridge,
} from "../controllers/analytics.controller.js";
import {
  recordSessionHeartbeat,
  identifyVisitorSession,
  blockIpAddress,
  unblockIpAddress,
  viewSessionsDashboard,
} from "../controllers/visitorSession.controller.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// ---------------- Live Sessions & Clarity Replay Dashboard ----------------
router.get("/sessions-view", viewSessionsDashboard);
router.post("/session-heartbeat", recordSessionHeartbeat);
router.post("/meta-event", trackMetaEventBridge);
router.post("/identify-session", identifyVisitorSession);
router.post("/block-ip", blockIpAddress);
router.post("/unblock-ip", unblockIpAddress);
router.get("/unblock-ip", unblockIpAddress);

// ---------------- Admin Statistics Endpoints ----------------
router.get("/revenue", protectAdmin, revenueByMonthsAndYear);
router.get("/ordersCount", protectAdmin, ordersCountByMonthAndYear);
router.get("/customer-stats", protectAdmin, customerStats);
router.get("/inventory", protectAdmin, inventory);
router.get("/order-stats", protectAdmin, getOrderStats);

export default router;
