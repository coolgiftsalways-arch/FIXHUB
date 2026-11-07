import crypto from "node:crypto";
import express, { Router } from "express";

import Payment from "../models/Payment.js";
import { onPaymentConfirmed } from "../utils/razorpayPayment.js";

// ==========================================
// RAZORPAY WEBHOOK
// POST /api/razorpay/webhook
//
// IMPORTANT:
// This route must be mounted in server.js
// BEFORE app.use(express.json()).
// ==========================================

const router = Router();

// ==========================================
// HANDLED RAZORPAY EVENTS
// ==========================================

const HANDLED_EVENTS = new Set([
  "payment_link.paid",
  "payment_link.partially_paid",
  "payment_link.expired",
  "payment_link.cancelled",
]);

// ==========================================
// VERIFY RAZORPAY SIGNATURE
// ==========================================

function isValidSignature(rawBody, signature, secret) {
  if (!signature || !secret || !Buffer.isBuffer(rawBody)) {
    return false;
  }

  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const actual = String(signature).trim();

    const expectedBuffer = Buffer.from(expected, "hex");
    const actualBuffer = Buffer.from(actual, "hex");

    if (
      expectedBuffer.length !== actualBuffer.length ||
      expectedBuffer.length === 0
    ) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (error) {
    console.error("Razorpay signature verification error:", error.message);

    return false;
  }
}

// ==========================================
// WEBHOOK ROUTE
// ==========================================

router.post(
  "/",

  express.raw({
    type: "application/json",
    limit: "1mb",
  }),

  async (req, res) => {
    // ======================================
    // WEBHOOK SECRET
    // ======================================

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is missing.");

      return res.status(503).json({
        success: false,
        message: "Webhook configuration unavailable.",
      });
    }

    // ======================================
    // RAW REQUEST BODY
    // ======================================

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);

    if (!rawBody.length) {
      return res.status(400).json({
        success: false,
        message: "Empty webhook body.",
      });
    }

    // ======================================
    // VERIFY SIGNATURE
    // ======================================

    const signature = req.get("x-razorpay-signature");

    const validSignature = isValidSignature(rawBody, signature, secret);

    if (!validSignature) {
      console.warn("Rejected Razorpay webhook: invalid signature.");

      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature.",
      });
    }

    // ======================================
    // PARSE EVENT
    // ======================================

    let event;

    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch (error) {
      console.error("Invalid Razorpay webhook JSON:", error.message);

      return res.status(400).json({
        success: false,
        message: "Invalid webhook JSON.",
      });
    }

    // ======================================
    // PROCESS WEBHOOK
    // ======================================

    try {
      const eventName = event?.event;

      console.log(`[Razorpay Webhook] Received event: ${eventName}`);

      // Ignore events we don't handle.
      if (!HANDLED_EVENTS.has(eventName)) {
        return res.status(200).json({
          success: true,
          message: "Event ignored.",
        });
      }

      // ====================================
      // GET PAYMENT LINK DETAILS
      // ====================================

      const link = event?.payload?.payment_link?.entity;

      const razorpayPayment = event?.payload?.payment?.entity;

      if (!link?.id) {
        console.warn("[Razorpay Webhook] Payment link ID missing.");

        return res.status(200).json({
          success: true,
          message: "No payment link found.",
        });
      }

      console.log(`[Razorpay Webhook] Link ID: ${link.id}`);

      console.log(`[Razorpay Webhook] Link status: ${link.status}`);

      // ====================================
      // GET VERIFIED PAYMENT ID
      // ====================================

      const capturedPaymentId =
        razorpayPayment?.status === "captured" ? razorpayPayment.id : undefined;

      // ====================================
      // UPDATE PAYMENT IN DATABASE
      // ====================================

      const result = await Payment.applyRazorpayLinkState(link.id, {
        linkStatus: link.status,

        razorpayPaymentId: capturedPaymentId,

        // Razorpay reports this amount in paise.
        amountPaidPaise: link.amount_paid,
      });

      const payment = result?.payment;

      const becamePaid = result?.becamePaid;

      // ====================================
      // UNKNOWN PAYMENT LINK
      // ====================================

      if (!payment) {
        console.warn(`[Razorpay Webhook] Unknown payment link: ${link.id}`);

        return res.status(200).json({
          success: true,
          message: "Payment link not found.",
        });
      }

      console.log(`[Razorpay Webhook] Payment ID: ${payment.paymentId}`);

      console.log(`[Razorpay Webhook] Payment status: ${payment.status}`);

      console.log(`[Razorpay Webhook] Payment purpose: ${payment.purpose}`);

      // ====================================
      // GOLD MEMBERSHIP ACTIVATION
      // ====================================

      // Activate Gold only after the Payment model
      // has verified the full payment amount and
      // saved the payment status as "paid".

      if (payment.status === "paid" && payment.purpose === "membership") {
        console.log(
          `[Razorpay Webhook] Activating Gold for ${payment.paymentId}`,
        );

        // If activation fails, the error reaches
        // the catch block and Razorpay receives 500.
        // This allows Razorpay to retry the webhook.

        await onPaymentConfirmed(payment);

        console.log(
          `[Razorpay Webhook] Gold activation completed for ${payment.paymentId}`,
        );
      }

      // ====================================
      // PAYMENT CONFIRMATION LOG
      // ====================================

      if (becamePaid) {
        console.log(
          `[Razorpay Webhook] Payment newly confirmed: ${payment.paymentId}`,
        );
      }

      // ====================================
      // ACKNOWLEDGE RAZORPAY
      // ====================================

      return res.status(200).json({
        success: true,
        message: "Webhook processed successfully.",
      });
    } catch (error) {
      console.error(
        "[Razorpay Webhook] Processing failed:",
        error.stack || error.message,
      );

      // Return 500 so Razorpay can retry.
      return res.status(500).json({
        success: false,
        message: "Webhook processing failed.",
      });
    }
  },
);

// ==========================================
// EXPORT ROUTER
// ==========================================

export default router;
