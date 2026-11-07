import Razorpay from "razorpay";
import QRCode from "qrcode";

import Payment, { FINAL_STATUSES } from "../models/Payment.js";
import FixHubCustomer from "../models/FixHubCustomer.js";

const SYNC_THROTTLE_MS = 5000;

// ==========================================
// RAZORPAY INSTANCE
// ==========================================

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

// ==========================================
// WEBSITE URL
// ==========================================

function getSiteUrl() {
  const raw =
    process.env.PUBLIC_SITE_URL ||
    String(process.env.CLIENT_URL || "").split(",")[0];

  try {
    return new URL(raw.trim()).origin;
  } catch {
    return "";
  }
}

// ==========================================
// CREATE RAZORPAY PAYMENT LINK
// ==========================================

export async function createFixHubPaymentLink({
  payment,
  customer,
  description = "FIXHUB membership payment",
  returnPath = "",
}) {
  const amount = Number(payment?.amount);
  const amountPaise = Math.round(amount * 100);

  if (
    !payment?._id ||
    !Number.isFinite(amount) ||
    amount < 1 ||
    !Number.isSafeInteger(amountPaise)
  ) {
    throw new Error("Invalid payment amount.");
  }

  if (!customer) {
    throw new Error("Customer not found.");
  }

  // Reuse existing payment link.
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

  // Create new Razorpay payment link.
  const razorpay = getRazorpay();
  const siteUrl = getSiteUrl();

  const callback =
    returnPath && siteUrl
      ? {
          callback_url: `${siteUrl}${returnPath}`,
          callback_method: "get",
        }
      : {};

  const link = await razorpay.paymentLink.create({
    amount: amountPaise,
    currency: "INR",
    accept_partial: false,

    reference_id: String(payment.paymentId).slice(0, 40),

    description: String(description).slice(0, 255),

    customer: {
      name: String(customer.fullName || "FIXHUB Customer").slice(0, 100),

      ...(customer.email ? { email: customer.email } : {}),

      ...(customer.phone ? { contact: String(customer.phone) } : {}),
    },

    notify: {
      sms: false,
      email: false,
    },

    reminder_enable: false,

    ...callback,
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

// ==========================================
// VERIFIED GOLD MEMBERSHIP ACTIVATION
// ==========================================

export async function onPaymentConfirmed(payment) {
  if (!payment) {
    throw new Error("Payment record is missing.");
  }

  console.log(
    `[payments] ${payment.paymentId} (${payment.purpose} ${payment.referenceId}) confirmed as paid`,
  );

  // Only verified membership payments can activate Gold.
  if (payment.purpose !== "membership" || payment.status !== "paid") {
    return null;
  }

  if (!payment.customerId) {
    throw new Error(`Customer ID missing for ${payment.paymentId}`);
  }

  try {
    /*
     * Activate Gold only if the customer is not already Gold.
     *
     * The first-repair benefit is made available at the same
     * time as the first successful Gold activation.
     *
     * Existing Gold members are not given another benefit
     * when a payment is retried or membership is renewed.
     */
    const customer = await FixHubCustomer.findOneAndUpdate(
      {
        _id: payment.customerId,
        membershipTier: { $ne: "gold" },
      },
      {
        $set: {
          membershipTier: "gold",
          goldActivatedAt: new Date(),

          // First eligible repair benefit.
          firstRepairBenefitAvailable: true,
          firstRepairBenefitUsed: false,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (customer) {
      console.log(
        `[membership] Gold activated and first repair benefit enabled for ${customer.email}`,
      );

      return customer;
    }

    // Customer may already be Gold.
    const existingCustomer = await FixHubCustomer.findById(payment.customerId);

    if (!existingCustomer) {
      throw new Error(`Customer not found for ${payment.paymentId}`);
    }

    if (existingCustomer.membershipTier !== "gold") {
      throw new Error(`Gold activation failed for ${payment.paymentId}`);
    }

    console.log(
      `[membership] Gold membership already active for ${existingCustomer.email}`,
    );

    return existingCustomer;
  } catch (error) {
    console.error(
      `[membership] Gold activation failed for ${payment.paymentId}:`,
      error.message,
    );

    throw error;
  }
}

// ==========================================
// REFRESH PAYMENT STATUS FROM RAZORPAY
// ==========================================

export async function refreshPaymentFromRazorpay(payment) {
  if (!payment) {
    return payment;
  }

  // Retry Gold activation for an already-paid payment.
  if (payment.status === "paid") {
    if (payment.purpose === "membership") {
      try {
        await onPaymentConfirmed(payment);
      } catch (error) {
        console.error(
          "[membership] Gold activation retry failed:",
          error.message,
        );
      }
    }

    return payment;
  }

  // Do not sync final payment statuses.
  if (FINAL_STATUSES.includes(payment.status)) {
    return payment;
  }

  if (!payment.razorpayLinkId) {
    return payment;
  }

  // Sync throttling.
  const lastSync = payment.lastSyncedAt
    ? new Date(payment.lastSyncedAt).getTime()
    : 0;

  if (Date.now() - lastSync < SYNC_THROTTLE_MS) {
    return payment;
  }

  try {
    const razorpay = getRazorpay();

    const result = await Payment.syncWithRazorpay(razorpay, payment);

    const updatedPayment = result?.payment || payment;

    // Activate Gold only after verified payment.
    if (
      updatedPayment.status === "paid" &&
      updatedPayment.purpose === "membership"
    ) {
      try {
        await onPaymentConfirmed(updatedPayment);
      } catch (activationError) {
        console.error(
          "[membership] Gold activation failed after payment:",
          activationError.message,
        );
      }
    }

    return updatedPayment;
  } catch (error) {
    console.error(
      "Razorpay status sync failed:",
      error?.error?.description || error.message,
    );

    return payment;
  }
}
