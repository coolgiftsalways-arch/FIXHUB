import { Router } from "express";
import rateLimit from "express-rate-limit";

import MembershipRequest from "../models/MembershipRequest.js";

import { requireCustomer } from "./fixhubAuthRoutes.js";
import { requireAdmin } from "./authRoutes.js";

import {
  getPhoneCatalog,
  findPhone,
  PHONE_BRANDS,
} from "../data/phoneCatalog.js";

// ==========================================
// FIXHUB MEMBERSHIP REQUEST ROUTES
// ==========================================

const router = Router();

const VALID_ISSUES = new Set([
  "Display / Touch",
  "Battery",
  "Charging Port",
  "Camera",
  "Speaker / Mic",
  "Water Damage",
  "Software / Performance",
  "General Service",
  "Other",
]);

const VALID_STATUSES = new Set([
  "pending",
  "pending_quote",
  "contacted",
  "approved",
  "rejected",
]);

// ==========================================
// FORMAT REQUEST
// ==========================================

function serializeRequest(item) {
  return {
    id: String(item._id),

    requestId: `FH-MEM-${String(item._id).toUpperCase()}`,

    customer: item.customer,

    planId: item.planId,
    planName: item.planName,
    planPrice: item.planPrice,

    phoneMRP: item.phoneMRP,

    phoneBrand: item.phoneBrand,
    phoneModel: item.phoneModel,

    repairIssue: item.repairIssue,
    preferredDate: item.preferredDate,
    notes: item.notes,

    status: item.status,

    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// ==========================================
// LIMIT REPEATED REQUESTS
// ==========================================

const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 6,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// ==========================================
// 1. GET MOBILE BRAND / MODEL CATALOGUE
//
// GET /api/membership-requests/catalog
// ==========================================

router.get("/catalog", (_req, res) => {
  return res.json({
    success: true,
    brands: getPhoneCatalog(),
  });
});

// ==========================================
// 2. CREATE MEMBERSHIP REQUEST
//
// POST /api/membership-requests
// ==========================================

router.post("/", requireCustomer, requestLimiter, async (req, res) => {
  try {
    const phoneBrand = String(req.body?.phoneBrand || "").trim();

    const phoneModel = String(req.body?.phoneModel || "").trim();

    const repairIssue = String(req.body?.repairIssue || "").trim();

    const preferredDate = String(req.body?.preferredDate || "").trim();

    const notes = String(req.body?.notes || "").trim();

    const modelNotListed = req.body?.modelNotListed === true;

    // VALIDATE CUSTOMER REQUEST

    if (
      !PHONE_BRANDS.includes(phoneBrand) ||
      phoneModel.length < 2 ||
      phoneModel.length > 90 ||
      !VALID_ISSUES.has(repairIssue) ||
      notes.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid phone brand, model and repair issue.",
      });
    }

    if (preferredDate) {
      const validFormat = /^\d{4}-\d{2}-\d{2}$/.test(preferredDate);

      const date = new Date(`${preferredDate}T00:00:00Z`);

      if (
        !validFormat ||
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== preferredDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid preferred date.",
        });
      }
    }

    // LOOK UP PHONE FROM TRUSTED CATALOGUE

    const catalogMatch = modelNotListed
      ? null
      : findPhone(phoneBrand, phoneModel);

    if (!modelNotListed && !catalogMatch) {
      return res.status(400).json({
        success: false,
        message: "Choose a model from the list or select Model Not Listed.",
      });
    }

    if (modelNotListed && findPhone(phoneBrand, phoneModel)) {
      return res.status(400).json({
        success: false,
        message: "This model is already listed. Please select it.",
      });
    }

    // PREVENT DUPLICATE SUBMISSION

    const existing = await MembershipRequest.findOne({
      customer: req.fixhubCustomer._id,
      phoneBrand,
      phoneModel,

      status: {
        $in: ["pending", "pending_quote"],
      },

      createdAt: {
        $gte: new Date(Date.now() - 5 * 60 * 1000),
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "You already submitted this request. " +
          `Request ID: FH-MEM-${String(existing._id).toUpperCase()}`,
      });
    }

    // PRICE IS CALCULATED ON BACKEND

    const price = catalogMatch?.fee ?? null;

    // SAVE IN MONGODB

    const request = await MembershipRequest.create({
      customer: req.fixhubCustomer._id,

      planId: price === null ? "manual" : String(price),

      planName: "One Fixing Charge",

      planPrice: price,

      phoneMRP: catalogMatch?.mrp ?? null,

      phoneBrand,
      phoneModel,

      repairIssue,
      preferredDate,
      notes,

      status: price === null ? "pending_quote" : "pending",
    });

    return res.status(201).json({
      success: true,

      message: "Your request has been submitted successfully.",

      request: serializeRequest(request),
    });
  } catch (error) {
    console.error("Membership request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save membership request.",
    });
  }
});

// ==========================================
// 3. CUSTOMER'S OWN REQUESTS
//
// GET /api/membership-requests/my
// ==========================================

router.get("/my", requireCustomer, async (req, res) => {
  try {
    const requests = await MembershipRequest.find({
      customer: req.fixhubCustomer._id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,

      requests: requests.map(serializeRequest),
    });
  } catch (error) {
    console.error("Customer requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load requests.",
    });
  }
});

// ==========================================
// 4. ADMIN — GET ALL REQUESTS
//
// GET
