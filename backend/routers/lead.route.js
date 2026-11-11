import express from "express";
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  deleteLead,
} from "../controllers/lead.controller.js";

const router = express.Router();

router.post("/", createLead);
router.get("/", getAllLeads);
router.get("/:id", getLeadById);
router.patch("/:id", updateLeadStatus);
router.delete("/:id", deleteLead);

export default router;
