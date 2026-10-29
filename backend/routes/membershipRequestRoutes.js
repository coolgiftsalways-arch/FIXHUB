import { Router } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

import FixHubCustomer from "../models/FixHubCustomer.js";
import MembershipRequest from "../models/MembershipRequest.js";
import Payment from "../models/Payment.js";

import { requireAdmin } from "./authRoutes.js";
import { createFixHubPaymentLink } from "../utils/razorpayPayment.js";

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
    return next();
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
// SERIALIZERS
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

function serializePayment(payment) {
  return {
    paymentId: payment.paymentId,
    purpose: payment.purpose,
    referenceId: payment.referenceId,
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: payment.paymentMethod,
    upiReference: payment.upiReference,
    status: payment.status,
    paymentUrl: payment.paymentUrl || null,
    razorpayStatus: payment.razorpayStatus || null,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    verifiedAt: payment.verifiedAt,
  };
}

// ==========================================
// RATE LIMITERS
// ==========================================

const limitRequests = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many membership requests. Please wait before trying again.",
  },
});

const limitPayments = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment requests. Please try again later.",
  },
});

// ==========================================
// FIND OWN MEMBERSHIP REQUEST
// ==========================================

async function findOwnMembershipRequest(requestId, customerId) {
  const rawId = String(requestId || "").trim();

  const mongoId = rawId.startsWith("FH-MEM-")
    ? rawId.slice("FH-MEM-".length)
    : rawId;

  if (!/^[a-f\d]{24}$/i.test(mongoId)) {
    return null;
  }

  return MembershipRequest.findOne({
    _id: mongoId,
    customer: customerId,
  });
}

// ==========================================
// 1. GET PHONE CATALOG
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
// POST /api/membership-requests
// ==========================================

router.post("/", requireCustomer, limitRequests, async (req, res) => {
  try {
    const phoneBrand = String(req.body?.phoneBrand || "").trim();
    const phoneModel = String(req.body?.phoneModel || "").trim();
    const repairIssue = String(req.body?.repairIssue || "").trim();
    const preferredDate = String(req.body?.preferredDate || "").trim();
    const notes = String(req.body?.notes || "").trim();
    const modelNotListed = req.body?.modelNotListed === true;

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

    const catalogMatch = modelNotListed
      ? null
      : findPhone(phoneBrand, phoneModel);

    if (!modelNotListed && !catalogMatch) {
      return res.status(400).json({
        success: false,
        message: "Choose a listed model or select Model Not Listed.",
      });
    }

    if (modelNotListed && findPhone(phoneBrand, phoneModel)) {
      return res.status(400).json({
        success: false,
        message: "This phone already exists in the catalogue.",
      });
    }

    const recent = await MembershipRequest.findOne({
      customer: req.fixhubCustomer._id,
      phoneBrand,
      phoneModel,
      status: { $in: ["pending", "pending_quote"] },
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

    const price = catalogMatch?.fee ?? null;

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
      message: "Membership request submitted successfully.",
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
// 3. CREATE MEMBERSHIP PAYMENT + RAZORPAY QR
// POST /api/membership-requests/payment
// Body: { requestId: "FH-MEM-..." }
// ==========================================

router.post("/payment", requireCustomer, limitPayments, async (req, res) => {
  try {
    const membershipRequest = await findOwnMembershipRequest(
      req.body?.requestId,
      req.fixhubCustomer._id,
    );

    if (!membershipRequest) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    if (membershipRequest.status === "pending_quote") {
      return res.status(400).json({
        success: false,
        message: "Your phone model is awaiting a confirmed quote.",
      });
    }

    if (membershipRequest.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "This membership request was rejected.",
      });
    }

    const amount = Number(membershipRequest.planPrice);

    if (
      membershipRequest.planPrice == null ||
      !Number.isSafeInteger(amount) ||
      amount < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Your membership charge is not confirmed yet.",
      });
    }

    const referenceId = `FH-MEM-${String(membershipRequest._id).toUpperCase()}`;

    let payment = await Payment.findOne({
      customerId: req.fixhubCustomer._id,
      purpose: "membership",
      referenceId,
    }).sort({ createdAt: -1 });

    if (payment?.status === "paid") {
      return res.status(409).json({
        success: false,
        message: "This membership payment has already been confirmed.",
        payment: serializePayment(payment),
      });
    }

    if (payment && payment.amount !== amount) {
      if (payment.razorpayLinkId) {
        return res.status(409).json({
          success: false,
          message:
            "The membership price changed after the payment link was created. Please contact FIXHUB support.",
        });
      }

      payment.amount = amount;
      await payment.save();
    }

    if (!payment) {
      payment = await Payment.create({
        customerId: req.fixhubCustomer._id,
        purpose: "membership",
        referenceId,
        amount,
        currency: "INR",
        paymentMethod: "upi",
        status: "pending",
      });
    }

    const checkout = await createFixHubPaymentLink({
      payment,
      customer: req.fixhubCustomer,
      description: "FIXHUB membership fixing charge",
    });

    return res.status(200).json({
      success: true,
      payment: {
        ...serializePayment(payment),
        paymentUrl: checkout.paymentUrl,
        qrCodeDataUrl: checkout.qrCodeDataUrl,
        amount: checkout.amount,
        status: checkout.status,
      },
    });
  } catch (error) {
    console.error("Membership payment creation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create membership payment.",
    });
  }
});

// ==========================================
// 4. SUBMIT UPI REFERENCE
// POST /api/membership-requests/payment/:paymentId/submit
// ==========================================

router.post(
  "/payment/:paymentId/submit",
  requireCustomer,
  limitPayments,
  async (req, res) => {
    try {
      const upiReference = String(req.body?.upiReference || "").trim();

      if (
        upiReference.length < 6 ||
        upiReference.length > 100 ||
        !/^[a-zA-Z0-9-]+$/.test(upiReference)
      ) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid UPI transaction reference.",
        });
      }

      const payment = await Payment.findOne({
        paymentId: req.params.paymentId,
        customerId: req.fixhubCustomer._id,
        purpose: "membership",
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Membership payment not found.",
        });
      }

      if (["paid", "refunded"].includes(payment.status)) {
        return res.status(409).json({
          success: false,
          message: "This payment can no longer be changed.",
        });
      }

      if (payment.status === "rejected") {
        return res.status(409).json({
          success: false,
          message: "This payment was rejected. Please contact FIXHUB.",
        });
      }

      payment.upiReference = upiReference;
      payment.status = "submitted";

      await payment.save();

      return res.json({
        success: true,
        message: "UPI reference submitted for verification.",
        payment: serializePayment(payment),
      });
    } catch (error) {
      console.error("Membership UPI submission error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to submit UPI reference.",
      });
    }
  },
);

// ==========================================
// 5. GET MEMBERSHIP PAYMENT STATUS
// GET /api/membership-requests/payment/:paymentId
// ==========================================

router.get("/payment/:paymentId", requireCustomer, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      paymentId: req.params.paymentId,
      customerId: req.fixhubCustomer._id,
      purpose: "membership",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Membership payment not found.",
      });
    }

    return res.json({
      success: true,
      payment: serializePayment(payment),
    });
  } catch (error) {
    console.error("Membership payment lookup error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load membership payment.",
    });
  }
});

// ==========================================
// 6. CUSTOMER REQUEST HISTORY
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
// 7. ADMIN GET ALL REQUESTS
// GET /api/membership-requests/admin
// ==========================================

router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const selectedStatus = String(req.query.status || "");

    const filter = VALID_STATUSES.has(selectedStatus)
      ? { status: selectedStatus }
      : {};

    const requests = await MembershipRequest.find(filter)
      .populate("customer", "fullName email phone address")
      .sort({ createdAt: -1 })
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
// 8. ADMIN UPDATE REQUEST STATUS
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
      { $set: { status } },
      { new: true, runValidators: true },
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

export default router;
