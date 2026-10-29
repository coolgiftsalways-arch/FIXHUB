import { Router } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import Payment from "../models/Payment.js";
import RepairBooking from "../models/RepairBooking.js";
import { requireCustomer } from "../middleware/requireCustomer.js";
import { findPhone } from "../data/phoneCatalog.js";
import { createFixHubPaymentLink } from "../utils/razorpayPayment.js";

const router = Router();

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment requests. Please try again later.",
  },
});

function parseBookingId(value) {
  const raw = String(value || "")
    .trim()
    .replace(/^FH-REP-/i, "");
  return mongoose.isValidObjectId(raw) ? raw : null;
}

function checkoutResponse(payment, link) {
  const data = payment.toJSON();

  // The schema deliberately omits QR data from normal JSON responses.
  return {
    success: true,
    payment: data,
    paymentUrl: link.paymentUrl,
    qrCodeDataUrl: link.qrCodeDataUrl,
    razorpayLinkId: link.razorpayLinkId,
  };
}

router.use(requireCustomer);

// ==========================================
// GET CUSTOMER'S REPAIR PAYMENTS
// GET /api/payments/my
// ==========================================
router.get("/my", async (req, res) => {
  try {
    const payments = await Payment.find({
      customerId: req.fixhubCustomer._id,
      purpose: "repair",
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ success: true, payments });
  } catch (error) {
    console.error("Get repair payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load payments.",
    });
  }
});

// ==========================================
// CREATE OR REUSE REPAIR PAYMENT + CHECKOUT
// POST /api/payments
// Body: { bookingId: "..." }
// ==========================================
router.post("/", paymentLimiter, async (req, res) => {
  try {
    const bookingId = parseBookingId(req.body?.bookingId);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "A valid repair booking ID is required.",
      });
    }

    const booking = await RepairBooking.findOne({
      _id: bookingId,
      customer: req.fixhubCustomer._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Repair booking not found.",
      });
    }

    if (booking.modelNotListed) {
      return res.status(400).json({
        success: false,
        message: "This phone model requires a manual quote.",
      });
    }

    const phone = findPhone(booking.phoneBrand, booking.phoneModel);

    if (!phone || !Number.isSafeInteger(phone.fee) || phone.fee < 1) {
      return res.status(400).json({
        success: false,
        message: "Phone pricing is unavailable. Please contact FIXHUB.",
      });
    }

    // Always calculate the charge from the server catalogue.
    booking.fixingCharge = phone.fee;
    booking.phoneMRP = phone.mrp;
    await booking.save();

    const referenceId = `FH-REP-${String(booking._id).toUpperCase()}`;

    let payment = await Payment.findOne({
      customerId: req.fixhubCustomer._id,
      purpose: "repair",
      referenceId,
      status: { $in: ["pending", "submitted", "under_review", "paid"] },
    });

    if (payment?.status === "paid") {
      return res.status(409).json({
        success: false,
        message: "This repair payment has already been paid.",
        payment: payment.toJSON(),
      });
    }

    if (payment && payment.amount !== phone.fee) {
      // Never silently change an existing payment with a live link.
      if (payment.razorpayLinkId) {
        return res.status(409).json({
          success: false,
          message:
            "The repair price has changed. Please contact FIXHUB before paying.",
        });
      }

      payment.amount = phone.fee;
      payment.status = "pending";
      payment.upiReference = "";
      payment.razorpayStatus = "";
      await payment.save();
    }

    if (!payment) {
      payment = await Payment.create({
        customerId: req.fixhubCustomer._id,
        purpose: "repair",
        referenceId,
        amount: phone.fee,
        currency: "INR",
        paymentMethod: "upi",
        status: "pending",
      });
    }

    if (payment.razorpayLinkId && payment.paymentUrl) {
      return res.json(
        checkoutResponse(payment, {
          paymentUrl: payment.paymentUrl,
          qrCodeDataUrl: payment.qrCodeDataUrl || "",
          razorpayLinkId: payment.razorpayLinkId,
        }),
      );
    }

    if (payment.status !== "pending") {
      return res.status(409).json({
        success: false,
        message:
          "This payment is awaiting review and cannot create a new checkout link.",
      });
    }

    const link = await createFixHubPaymentLink({
      payment,
      customer: req.fixhubCustomer,
      description: `FIXHUB repair service - ${booking.phoneBrand} ${booking.phoneModel}`,
    });

    return res.status(200).json(checkoutResponse(payment, link));
  } catch (error) {
    console.error("Create repair checkout error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create checkout. Please try again later.",
    });
  }
});

// ==========================================
// SUBMIT UPI REFERENCE FOR MANUAL REVIEW
// POST /api/payments/:paymentId/submit
// ==========================================
router.post("/:paymentId/submit", paymentLimiter, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const upiReference = String(req.body?.upiReference || "").trim();

    if (!mongoose.isValidObjectId(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID.",
      });
    }

    if (!/^[a-zA-Z0-9-]{6,100}$/.test(upiReference)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid UPI transaction reference.",
      });
    }

    const payment = await Payment.findOne({
      _id: paymentId,
      customerId: req.fixhubCustomer._id,
      purpose: "repair",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    if (["paid", "rejected", "refunded"].includes(payment.status)) {
      return res.status(409).json({
        success: false,
        message: `This payment is ${payment.status} and cannot be submitted.`,
      });
    }

    // A submitted reference is not proof of payment.
    payment.upiReference = upiReference;
    payment.status = "submitted";
    await payment.save();

    return res.json({
      success: true,
      message: "Reference submitted for FIXHUB review.",
      payment: payment.toJSON(),
    });
  } catch (error) {
    console.error("Submit payment reference error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit payment reference.",
    });
  }
});

// ==========================================
// GET CUSTOMER PAYMENT STATUS
// GET /api/payments/:paymentId
// ==========================================
router.get("/:paymentId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID.",
      });
    }

    const payment = await Payment.findOne({
      _id: req.params.paymentId,
      customerId: req.fixhubCustomer._id,
      purpose: "repair",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    return res.json({
      success: true,
      payment: payment.toJSON(),
      paymentUrl: payment.paymentUrl || "",
    });
  } catch (error) {
    console.error("Get payment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve payment status.",
    });
  }
});

export default router;
