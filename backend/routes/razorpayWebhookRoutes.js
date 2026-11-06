import crypto from "node:crypto";
import express, { Router } from "express";

import Payment from "../models/Payment.js";
import { onPaymentConfirmed } from "../utils/razorpayPayment.js";

// ==========================================
// RAZORPAY WEBHOOK
// POST /api/razorpay/webhook
//
// Must be mounted in server.js BEFORE app.use(express.json()),
// because the signature is computed over the raw request body.
// ==========================================

const router = Router();

const HANDLED_EVENTS = new Set([
  "payment_link.paid",
  "payment_link.partially_paid",
  "payment_link.expired",
  "payment_link.cancelled",
]);

function isValidSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

router.post(
  "/",
  express.raw({ type: "application/json", limit: "1mb" }),
  async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is missing.");
      return res.status(503).json({ success: false });
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);

    if (!isValidSignature(rawBody, req.get("x-razorpay-signature"), secret)) {
      console.warn("Rejected Razorpay webhook: invalid signature.");
      return res.status(400).json({ success: false });
    }

    let event;

    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({ success: false });
    }

    try {
      const link = event?.payload?.payment_link?.entity;
      const rzpPayment = event?.payload?.payment?.entity;

      if (HANDLED_EVENTS.has(event?.event) && link?.id) {
        const { payment, becamePaid } = await Payment.applyRazorpayLinkState(
          link.id,
          {
            linkStatus: link.status,
            razorpayPaymentId: rzpPayment?.id,
            amountPaidPaise: link.amount_paid,
          },
        );

        if (!payment) {
          console.warn(`Razorpay webhook for unknown link ${link.id}.`);
        } else if (becamePaid) {
          await onPaymentConfirmed(payment);
        }
      }

      // Acknowledge every correctly signed event so Razorpay stops retrying.
      return res.json({ success: true });
    } catch (error) {
      console.error("Razorpay webhook error:", error.message);
      // 5xx makes Razorpay retry later.
      return res.status(500).json({ success: false });
    }
  },
);

export default router;
