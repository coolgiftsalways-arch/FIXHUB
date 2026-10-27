import { Router } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

import FixHubCustomer from "../models/FixHubCustomer.js";

import MembershipRequest from "../models/MembershipRequest.js";

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

const isProduction = process.env.NODE_ENV === "production";

// ==========================================
// VALID REPAIR ISSUES
// ==========================================

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

// ==========================================
// VALID ADMIN STATUSES
// ==========================================

const VALID_STATUSES = new Set([
  "pending",
  "pending_quote",
  "contacted",
  "approved",
  "rejected",
]);

// ==========================================
// CUSTOMER SESSION MIDDLEWARE
// ==========================================

async function requireCustomer(req, res, next) {
  const cookieName = isProduction ? "__Host-fixhub_session" : "fixhub_session";

  const token = req.cookies?.[cookieName];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please login to continue.",
    });
  }

  const secret = process.env.FIXHUB_JWT_SECRET;

  if (!secret || secret.length < 32) {
    return res.status(503).json({
      success: false,
      message: "Customer authentication unavailable.",
    });
  }

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (typeof decoded.sub !== "string" || typeof decoded.v !== "number") {
      return res.status(401).json({
        success: false,
        message: "Invalid customer session.",
      });
    }

    const customer = await FixHubCustomer.findById(decoded.sub);

    if (
      !customer ||
      customer.emailVerified === false ||
      (customer.tokenVersion ?? 0) !== decoded.v
    ) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    req.fixhubCustomer = customer;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "CastError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session.",
      });
    }

    console.error("Membership session error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify customer.",
    });
  }
}

// ==========================================
// FORMAT REQUEST
// ==========================================

function serialize(item) {
  return {
    id: String(item._id),

    requestId: `FH-MEM-${String(item._id).toUpperCase()}`,

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

    customer: item.customer,
  };
}

// ==========================================
// REQUEST RATE LIMITER
// ==========================================

const limitRequests = rateLimit({
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
// 1. GET ALL PHONE BRANDS AND MODELS
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
// 2. SUBMIT CUSTOMER REQUEST
//
// POST /api/membership-requests
// ==========================================

router.post("/", requireCustomer, limitRequests, async (req, res) => {
  try {
    const phoneBrand = String(req.body?.phoneBrand || "").trim();

    const phoneModel = String(req.body?.phoneModel || "").trim();

    const repairIssue = String(req.body?.repairIssue || "").trim();

    const preferredDate = String(req.body?.preferredDate || "").trim();

    const notes = String(req.body?.notes || "").trim();

    // ====================================
    // VALIDATE DETAILS
    // ====================================

    if (
      !PHONE_BRANDS.includes(phoneBrand) ||
      phoneModel.length < 2 ||
      phoneModel.length > 90 ||
      !VALID_ISSUES.has(repairIssue) ||
      notes.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone brand, model and repair issue.",
      });
    }

    // ====================================
    // VALIDATE PREFERRED DATE
    // ====================================

    if (preferredDate) {
      const dateValid =
        /^\d{4}-\d{2}-\d{2}$/.test(preferredDate) &&
        !Number.isNaN(Date.parse(`${preferredDate}T00:00:00Z`));

      if (!dateValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid preferred date.",
        });
      }
    }

    // ====================================
    // CHECK SELECTED PHONE
    // ====================================

    const modelNotListed = req.body?.modelNotListed === true;

    const catalogMatch = modelNotListed
      ? null
      : findPhone(phoneBrand, phoneModel);

    // ====================================
    // INVALID MODEL
    // ====================================

    if (!modelNotListed && !catalogMatch) {
      return res.status(400).json({
        success: false,
        message: "Choose a listed model or select Model Not Listed.",
      });
    }

    // ====================================
    // PREVENT LISTED MODEL BEING SUBMITTED
    // AS UNKNOWN
    // ====================================

    if (modelNotListed && findPhone(phoneBrand, phoneModel)) {
      return res.status(400).json({
        success: false,
        message: "This phone already exists in the catalogue.",
      });
    }

    // ====================================
    // CHECK RECENT DUPLICATE REQUEST
    // ====================================

    const recent = await MembershipRequest.findOne({
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

    if (recent) {
      return res.status(409).json({
        success: false,

        message:
          "You already submitted this request. " +
          `Request ID: FH-MEM-${String(recent._id).toUpperCase()}`,
      });
    }

    // ====================================
    // CALCULATE PRICE ON BACKEND
    // ====================================

    // Never accept planPrice or phoneMRP
    // directly from the customer's browser.

    const price = catalogMatch?.fee ?? null;

    // ====================================
    // SAVE TO MONGODB
    // ====================================

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

    // ====================================
    // SUCCESS RESPONSE
    // ====================================

    return res.status(201).json({
      success: true,

      message:
        "Request submitted successfully. Our team will confirm the charges.",

      request: serialize(request),
    });
  } catch (error) {
    console.error("Membership request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save request.",
    });
  }
});

// ==========================================
// 3. CUSTOMER REQUEST HISTORY
//
// GET /api/membership-requests/my
// ==========================================

router.get("/my", requireCustomer, async (req, res) => {
  try {
    const requests = await MembershipRequest.find({
      customer: req.fixhubCustomer._id,
    })
      .sort({
        createdAt: -1,
      })
      .limit(50)
      .lean();

    return res.json({
      success: true,

      requests: requests.map(serialize),
    });
  } catch (error) {
    console.error("Customer request history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load your requests.",
    });
  }
});

// ==========================================
// 4. ADMIN GET ALL REQUESTS
//
// GET /api/membership-requests/admin
// ==========================================

router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const selectedStatus = String(req.query.status || "");

    const filter = VALID_STATUSES.has(selectedStatus)
      ? {
          status: selectedStatus,
        }
      : {};

    const requests = await MembershipRequest.find(filter)
      .populate("customer", "fullName email phone address")
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .lean();

    return res.json({
      success: true,

      requests: requests.map(serialize),
    });
  } catch (error) {
    console.error("Admin requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load requests.",
    });
  }
});

// ==========================================
// 5. ADMIN UPDATE REQUEST STATUS
//
// PATCH /api/membership-requests/admin/:id
// ==========================================

router.patch("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const status = String(req.body?.status || "");

    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status.",
      });
    }

    const request = await MembershipRequest.findByIdAndUpdate(
      req.params.id,

      {
        $set: {
          status,
        },
      },

      {
        new: true,
        runValidators: true,
      },
    ).populate("customer", "fullName email phone address");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    return res.json({
      success: true,

      request: serialize(request),
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    console.error("Update request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update request.",
    });
  }
});

// ==========================================
// EXPORT MEMBERSHIP ROUTES
// ==========================================

export default router;
