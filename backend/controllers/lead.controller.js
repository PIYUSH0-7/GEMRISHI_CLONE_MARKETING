import asyncHandler from "../utils/asyncHandler.js";
import { Lead } from "../models/lead.model.js";
import { sendMetaCapiEvent } from "../utils/metacapi.js";

/**
 * Create a new CRM Lead
 */
export const createLead = asyncHandler(async (req, res) => {
  const { name, email, phone, source, message, metadata } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Name is required." });
  }

  const lead = await Lead.create({
    name,
    email,
    phone,
    source: source || "inquiry",
    message,
    metadata: metadata || {},
  });

  // Fire server-side Meta CAPI Lead event
  sendMetaCapiEvent({
    eventName: "Lead",
    eventId: `lead_${lead._id}`,
    eventSourceUrl: req.body?.eventSourceUrl || req.body?.metaContext?.eventSourceUrl || req.headers.referer || "https://gemrishi.com/contactUs",
    userData: {
      email,
      phone,
      firstName: name,
      clientIp: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
    },
    customData: {
      content_name: "CRM Lead Creation",
      content_category: source || "inquiry",
    },
  });

  return res.status(201).json({
    success: true,
    message: "Lead created successfully.",
    data: lead,
  });
});

/**
 * Get all Leads with filtering, searching, and pagination
 */
export const getAllLeads = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { status, source, search } = req.query;
  const query = {};

  if (status) query.status = status;
  if (source) query.source = source;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const total = await Lead.countDocuments(query);
  const leads = await Lead.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: leads,
  });
});

/**
 * Get single Lead by ID
 */
export const getLeadById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lead = await Lead.findById(id);

  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found." });
  }

  return res.status(200).json({ success: true, data: lead });
});

/**
 * Update Lead Status & Add Note
 */
export const updateLeadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note, author, assignedTo } = req.body;

  const lead = await Lead.findById(id);
  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found." });
  }

  if (status) lead.status = status;
  if (assignedTo) lead.assignedTo = assignedTo;
  if (note) {
    lead.notes.push({
      content: note,
      author: author || "Admin",
      createdAt: new Date(),
    });
  }

  await lead.save();

  return res.status(200).json({
    success: true,
    message: "Lead updated successfully.",
    data: lead,
  });
});

/**
 * Delete a Lead
 */
export const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lead = await Lead.findByIdAndDelete(id);

  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found." });
  }

  return res.status(200).json({ success: true, message: "Lead deleted successfully." });
});
