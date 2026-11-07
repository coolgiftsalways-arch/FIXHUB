import Razorpay from "razorpay";
import QRCode from "qrcode";

import Payment, { FINAL_STATUSES } from "../models/Payment.js";

// Don't ask Razorpay more often than this per payment.
const SYNC_THROTTLE_MS = 5000;

export function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function createFixHubPaymentLink({
  payment,
  customer,
  description = "FIXHUB membership payment",
  phoneBrand = "",
  phoneModel = "",
}) {
  if (
    !payment?._id ||
    !Number.isSafeInteger(payment.amount) ||
    payment.amount < 1
  ) {
    throw new Error("Invalid payment amount.");
  }

  if (!customer) {
    throw new Error("Customer not found.");
  }

  const paymentRecordId = String(payment._id);

  // Reuse an existing payment link instead of creating duplicates.
  if (payment.razorpayLinkId && payment.paymentUrl) {
    let qrCodeDataUrl = payment.qrCodeDataUrl;

    if (!qrCodeDataUrl) {
      qrCodeDataUrl = await QRCode.toDataURL(payment.paymentUrl, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 320,
      });

      payment.qrCodeDataUrl = qrCodeDataUrl;
      await payment.save();
    }

    return {
      paymentId: payment.paymentId,
      paymentUrl: payment.paymentUrl,
      qrCodeDataUrl,
      amount: payment.amount,
      status: payment.status,
    };
  }

  const razorpay = getRazorpay();

  const link = await razorpay.paymentLink.create({
    amount: payment.amount * 100,
    currency: "INR",
    accept_partial: false,

    reference_id: String(payment.paymentId).slice(0, 40),

    description: String(description).slice(0, 255),

    customer: {
      name: String(customer.fullName || "FIXHUB Customer").slice(0, 100),
      ...(customer.email ? { email: customer.email } : {}),
      ...(customer.phone ? { contact: String(customer.phone) } : {}),
    },

    // FIXHUB PAYMENT IDENTIFICATION
    notes: {
      brand: "FIXHUB",
      orderId: paymentRecordId,
      paymentId: String(payment.paymentId || ""),
      purpose: String(payment.purpose || "repair"),
      phoneBrand: String(phoneBrand || ""),
      phoneModel: String(phoneModel || ""),
    },

    notify: {
      sms: false,
      email: false,
    },

    reminder_enable: false,
  });

  if (!link?.id || !link?.short_url) {
    throw new Error("Razorpay did not return a valid payment link.");
  }

  const qrCodeDataUrl = await QRCode.toDataURL(link.short_url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  });

  payment.razorpayLinkId = link.id;
  payment.paymentUrl = link.short_url;
  payment.qrCodeDataUrl = qrCodeDataUrl;
  payment.razorpayStatus = link.status || "created";
  payment.linkCreatedAt = new Date();

  await payment.save();

  return {
    paymentId: payment.paymentId,
    paymentUrl: link.short_url,
    qrCodeDataUrl,
    amount: payment.amount,
    status: payment.status,
  };
}

/**
 * Runs exactly once per payment, the first time it is detected as paid.
 */
export async function onPaymentConfirmed(payment) {
  console.log(
    `[payments] ${payment.paymentId} (${payment.purpose} ${payment.referenceId}) confirmed as paid`,
  );

  // Add follow-up work here if required.
}

/**
 * Bring a payment up to date with Razorpay if it is not final yet.
 * Never throws: on any Razorpay error the stored payment is returned as-is.
 */
export async function refreshPaymentFromRazorpay(payment) {
  if (!payment?.razorpayLinkId || FINAL_STATUSES.includes(payment.status)) {
    return payment;
  }

  const lastSync = payment.lastSyncedAt
    ? new Date(payment.lastSyncedAt).getTime()
    : 0;

  if (Date.now() - lastSync < SYNC_THROTTLE_MS) {
    return payment;
  }

  try {
    const result = await Payment.syncWithRazorpay(getRazorpay(), payment);

    if (result.becamePaid && result.payment) {
      await onPaymentConfirmed(result.payment);
    }

    return result.payment || payment;
  } catch (error) {
    console.error(
      "Razorpay status sync failed:",
      error?.error?.description || error.message,
    );

    return payment;
  }
}
