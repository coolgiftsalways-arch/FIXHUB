import { Router } from "express";
import rateLimit from "express-rate-limit";

import Payment from "../models/Payment.js";
import { requireCustomer } from "../middleware/requireCustomer.js";
import { getPhoneCatalog, findPhone } from "../data/phoneCatalog.js";
import { createFixHubPaymentLink } from "../utils/razorpayPayment.js";

const router = Router();

const createPaymentLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many payment attempts. Please try again later.",
  },
});

router.use(requireCustomer);

function getCustomerId(req) {
  return req.customerId || req.fixhubCustomer?._id || req.customer?._id;
}

function getCustomer(req) {
  return req.fixhubCustomer || req.customer;
}

// GET /api/payments/catalog
router.get("/catalog", (_req, res) => {
  res.json({ catalog: getPhoneCatalog() });
});

// GET /api/payments/my
router.get("/my", async (req, res) => {
  try {
    const payments = await Payment.find({
      customerId: getCustomerId(req),
      purpose: "repair",
    })
      .select("-qrCodeDataUrl -idempotencyKey")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ payments });
  } catch (error) {
    console.error("Fetch payments failed:", error.message);
    res.status(500).json({ message: "Unable to load payments." });
  }
});

// POST /api/payments
// Request body: { "brand": "Apple", "model": "iPhone 15" }
router.post("/", createPaymentLimit, async (req, res) => {
  try {
    const brand = String(req.body?.brand || "").trim();
    const model = String(req.body?.model || "").trim();

    if (!brand || !model) {
      return res.status(400).json({
        message: "Please select a mobile brand and model.",
      });
    }

    const phone = findPhone(brand, model);

    if (!phone || !Number.isSafeInteger(phone.mrp) || phone.mrp < 1) {
      return res.status(400).json({
        message: "The selected phone is not available in the catalogue.",
      });
    }

    if (!Number.isSafeInteger(phone.fee) || phone.fee < 1) {
      return res.status(400).json({
        message: "Unable to calculate the fixing charge.",
      });
    }

    const customerId = getCustomerId(req);
    const customer = getCustomer(req);

    if (!customerId || !customer) {
      return res.status(401).json({
        message: "Please sign in to continue.",
      });
    }

    // Use the canonical model name from the server catalogue.
    const referenceId = `PHONE-${phone.brand}-${phone.model}`;

    let payment = await Payment.findOne({
      customerId,
      purpose: "repair",
      referenceId,
      amount: phone.fee,
      status: { $in: ["pending", "submitted", "under_review"] },
    }).select("+qrCodeDataUrl");

    if (!payment) {
      payment = await Payment.create({
        customerId,
        purpose: "repair",
        referenceId,
        amount: phone.fee,
        currency: "INR",
        paymentMethod: "upi",
        status: "pending",
      });
    }

    const checkout = await createFixHubPaymentLink({
      payment,
      customer,
      description: `FIXHUB fixing charge - ${phone.brand} ${phone.model}`,
    });

    return res.status(200).json({
      message: "Checkout ready.",
      brand: phone.brand,
      model: phone.model,
      phoneMRP: phone.mrp,
      amount: phone.fee,
      paymentId: checkout.paymentId,
      status: checkout.status,
      paymentUrl: checkout.paymentUrl,
      qrCodeDataUrl: checkout.qrCodeDataUrl,
    });
  } catch (error) {
    console.error("Create checkout failed:", error.message);
    return res.status(500).json({
      message: "Unable to prepare checkout. Please try again.",
    });
  }
});

// GET /api/payments/:paymentId
router.get("/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findOne({
      paymentId: req.params.paymentId,
      customerId: getCustomerId(req),
    })
      .select("+qrCodeDataUrl")
      .lean();

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    return res.json({
      payment: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentUrl: payment.paymentUrl,
        qrCodeDataUrl: payment.qrCodeDataUrl || "",
        razorpayStatus: payment.razorpayStatus,
      },
    });
  } catch (error) {
    console.error("Get payment failed:", error.message);
    return res.status(500).json({ message: "Unable to load payment." });
  }
});

export default router;
