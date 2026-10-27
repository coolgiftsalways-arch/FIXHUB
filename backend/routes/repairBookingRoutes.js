import { Router } from "express";
import rateLimit from "express-rate-limit";

import RepairBooking from "../models/RepairBooking.js";
import { requireCustomer } from "../middleware/requireCustomer.js";
import { requireAdmin } from "./authRoutes.js";

import {
  PHONE_BRANDS,
  findPhone,
  getPhoneCatalog,
} from "../data/phoneCatalog.js";

const router = Router();

// ==========================================
// VALIDATION
// ==========================================

const issues = new Set([
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

const times = new Set([
  "",
  "11:00-13:00",
  "13:00-15:00",
  "15:00-17:00",
  "17:00-19:00",
]);

// Keep these values consistent with RepairBooking.js.
const statuses = new Set([
  "pending",
  "pending_quote",
  "contacted",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

const validId = (id) => /^[a-f\d]{24}$/i.test(String(id));

const indiaToday = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (name) => parts.find((part) => part.type === name)?.value || "";

  return `${get("year")}-${get("month")}-${get("day")}`;
};

// ==========================================
// RESPONSE SERIALIZER
// ==========================================

const serialize = (booking) => ({
  id: String(booking._id),

  bookingId: `FH-REP-${String(booking._id).toUpperCase()}`,

  customerId: String(booking.customer?._id || booking.customer || ""),

  customer: booking.customer || null,

  phoneBrand: booking.phoneBrand,
  phoneModel: booking.phoneModel,
  modelNotListed: booking.modelNotListed ?? false,

  phoneMRP: booking.phoneMRP ?? null,
  fixingCharge: booking.fixingCharge ?? null,

  repairIssue: booking.repairIssue,
  serviceAddress: booking.serviceAddress,

  preferredDate: booking.preferredDate || "",
  preferredTime: booking.preferredTime || "",

  notes: booking.notes || "",
  status: booking.status,

  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
});

// ==========================================
// PHONE CATALOG
// ==========================================

router.get("/catalog", (_req, res) => {
  return res.json({
    success: true,
    brands: getPhoneCatalog(),
  });
});

// ==========================================
// CREATE CUSTOMER REPAIR BOOKING
// ==========================================

router.post(
  "/",
  requireCustomer,

  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 6,
    standardHeaders: "draft-7",
    legacyHeaders: false,

    message: {
      success: false,
      message: "Too many bookings. Please try later.",
    },
  }),

  async (req, res) => {
    try {
      const phoneBrand = String(req.body?.phoneBrand || "").trim();

      const phoneModel = String(req.body?.phoneModel || "").trim();

      const repairIssue = String(req.body?.repairIssue || "").trim();

      const serviceAddress = String(req.body?.serviceAddress || "").trim();

      const preferredDate = String(req.body?.preferredDate || "").trim();

      const preferredTime = String(req.body?.preferredTime || "").trim();

      const notes = String(req.body?.notes || "").trim();

      const unlisted = req.body?.modelNotListed === true;

      // Basic field validation.
      if (
        !PHONE_BRANDS.includes(phoneBrand) ||
        phoneModel.length < 2 ||
        phoneModel.length > 90 ||
        !issues.has(repairIssue) ||
        serviceAddress.length < 10 ||
        serviceAddress.length > 300 ||
        !times.has(preferredTime) ||
        notes.length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message: "Please complete valid repair booking details.",
        });
      }

      // Validate the selected service date.
      if (preferredDate) {
        const validDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(preferredDate);

        const date = new Date(`${preferredDate}T00:00:00Z`);

        if (
          !validDateFormat ||
          Number.isNaN(date.getTime()) ||
          date.toISOString().slice(0, 10) !== preferredDate ||
          preferredDate < indiaToday()
        ) {
          return res.status(400).json({
            success: false,
            message: "Select a valid service date.",
          });
        }
      }

      // Validate the phone against the catalog.
      const phone = findPhone(phoneBrand, phoneModel);

      if (!unlisted && !phone) {
        return res.status(400).json({
          success: false,
          message: "Select a listed phone model.",
        });
      }

      if (unlisted && phone) {
        return res.status(400).json({
          success: false,
          message: "Select your listed phone model.",
        });
      }

      // Prevent rapid duplicate submissions.
      const duplicate = await RepairBooking.findOne({
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

      if (duplicate) {
        return res.status(409).json({
          success: false,

          message:
            `This booking was already submitted: ` +
            `FH-REP-${String(duplicate._id).toUpperCase()}`,
        });
      }

      const booking = await RepairBooking.create({
        customer: req.fixhubCustomer._id,

        phoneBrand,
        phoneModel,

        modelNotListed: unlisted,

        phoneMRP: phone?.mrp ?? null,
        fixingCharge: phone?.fee ?? null,

        repairIssue,
        serviceAddress,

        preferredDate,
        preferredTime,

        notes,

        status: phone ? "pending" : "pending_quote",
      });

      return res.status(201).json({
        success: true,

        message:
          "Repair request saved. FIXHUB will confirm your " +
          "appointment and final quotation.",

        booking: serialize(booking),
      });
    } catch (error) {
      console.error("Repair booking create:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to save repair booking.",
      });
    }
  },
);

// ==========================================
// CUSTOMER'S OWN REPAIR BOOKINGS
// ==========================================

router.get("/my", requireCustomer, async (req, res) => {
  try {
    const bookings = await RepairBooking.find({
      customer: req.fixhubCustomer._id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      bookings: bookings.map(serialize),
    });
  } catch (error) {
    console.error("Load customer repair bookings:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load repair bookings.",
    });
  }
});

// ==========================================
// ADMIN: LIST REPAIR BOOKINGS
// ==========================================

router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit) || 50;

    const limit = Math.max(1, Math.min(100, requestedLimit));

    const bookings = await RepairBooking.find()
      .populate("customer", "fullName phone email address")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      bookings: bookings.map(serialize),
    });
  } catch (error) {
    console.error("Admin load repair bookings:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load bookings.",
    });
  }
});

// ==========================================
// ADMIN: UPDATE REPAIR BOOKING STATUS
// ==========================================

router.patch("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const bookingId = String(req.params.id || "");

    const newStatus = String(req.body?.status || "");

    if (!validId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!statuses.has(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    const booking = await RepairBooking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          status: newStatus,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("customer", "fullName phone email address");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.json({
      success: true,
      message: "Booking status updated successfully.",
      booking: serialize(booking),
    });
  } catch (error) {
    console.error("Admin update repair booking:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update booking.",
    });
  }
});

export default router;
