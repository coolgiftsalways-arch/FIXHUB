import mongoose from "mongoose";
import crypto from "node:crypto";

// ==========================================
// PAYMENT STATUS CONFIGURATION
// ==========================================

// Statuses a Razorpay sync must never overwrite.
export const LOCKED_STATUSES = ["paid", "refunded"];

// Statuses after which the checkout page stops checking.
export const FINAL_STATUSES = [
  "paid",
  "rejected",
  "refunded",
  "expired",
  "cancelled",
];

// Razorpay Payment Link status -> FIXHUB payment status.
const LINK_STATUS_MAP = {
  created: "pending",
  partially_paid: "under_review",
  paid: "paid",
  expired: "expired",
  cancelled: "cancelled",
};

// ==========================================
// PAYMENT SCHEMA
// ==========================================

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FixHubCustomer",
      required: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: ["repair", "membership", "other"],
      required: true,
      index: true,
    },

    referenceId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    // Amount in rupees.
    // Razorpay works in paise (amount * 100).
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },

    paymentMethod: {
      type: String,
      enum: ["upi", "cash", "other"],
      default: "upi",
    },

    // Coupon information.
    couponCode: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    upiReference: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    receiptUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // ======================================
    // RAZORPAY PAYMENT LINK INFORMATION
    // ======================================

    razorpayLinkId: {
      type: String,
      default: "",
      index: true,
    },

    paymentUrl: {
      type: String,
      default: "",
    },

    qrCodeDataUrl: {
      type: String,
      default: "",
      select: false,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      index: true,
    },

    // Raw Razorpay link status:
    // created | partially_paid | paid | expired | cancelled
    razorpayStatus: {
      type: String,
      default: "",
    },

    linkCreatedAt: {
      type: Date,
      default: null,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },

    // ======================================
    // FIXHUB PAYMENT STATUS
    // ======================================

    status: {
      type: String,
      enum: [
        "pending",
        "submitted",
        "under_review",
        "paid",
        "rejected",
        "refunded",
        "expired",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    adminNote: {
      type: String,
      maxlength: 1000,
      default: "",
    },

    // ======================================
    // IDEMPOTENCY
    // ======================================

    idempotencyKey: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
    },
  },
  {
    timestamps: true,
    collection: "fixhub_payments",
  },
);

// ==========================================
// GENERATE PAYMENT ID
// ==========================================

paymentSchema.pre("validate", function () {
  if (!this.paymentId) {
    this.paymentId =
      "FH-PAY-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  }
});

// ==========================================
// APPLY RAZORPAY PAYMENT LINK STATE
// ==========================================

/**
 * Apply a Razorpay Payment Link state to FIXHUB.
 *
 * Rules:
 *
 * 1. Paid/refunded payments cannot be downgraded.
 * 2. Full payment amount must be verified.
 * 3. Partial payments remain under_review.
 * 4. Missing payment amounts cannot mark a payment paid.
 * 5. Atomic updates protect against concurrent requests.
 */

paymentSchema.statics.applyRazorpayLinkState = async function (
  razorpayLinkId,
  { linkStatus, razorpayPaymentId, amountPaidPaise } = {},
) {
  if (!razorpayLinkId) {
    return {
      payment: null,
      becamePaid: false,
    };
  }

  // Find the corresponding FIXHUB payment.
  const current = await this.findOne({
    razorpayLinkId,
  });

  if (!current) {
    return {
      payment: null,
      becamePaid: false,
    };
  }

  // Never modify already paid or refunded payments.
  if (LOCKED_STATUSES.includes(current.status)) {
    return {
      payment: current,
      becamePaid: false,
    };
  }

  // Map Razorpay status.
  let nextStatus = LINK_STATUS_MAP[linkStatus] || current.status;

  // ========================================
  // VERIFY PAYMENT AMOUNT
  // ========================================

  if (nextStatus === "paid") {
    const expectedAmountPaise = Math.round(Number(current.amount) * 100);

    const receivedAmountPaise = Number(amountPaidPaise);

    const validAmount =
      amountPaidPaise !== null &&
      amountPaidPaise !== undefined &&
      Number.isFinite(receivedAmountPaise) &&
      receivedAmountPaise >= expectedAmountPaise;

    // Missing, invalid or partial amounts must
    // never be treated as successful payments.
    if (!validAmount) {
      nextStatus = "under_review";
    }
  }

  // ========================================
  // PRESERVE SUBMITTED UPI REFERENCES
  // ========================================

  if (
    nextStatus === "pending" &&
    ["submitted", "under_review"].includes(current.status)
  ) {
    nextStatus = current.status;
  }

  // ========================================
  // PREPARE UPDATE
  // ========================================

  const set = {
    lastSyncedAt: new Date(),
  };

  if (linkStatus) {
    set.razorpayStatus = linkStatus;
  }

  if (razorpayPaymentId) {
    set.razorpayPaymentId = razorpayPaymentId;
  }

  if (nextStatus !== current.status) {
    set.status = nextStatus;

    if (nextStatus === "paid") {
      set.verifiedAt = new Date();
    }
  }

  // ========================================
  // ATOMIC DATABASE UPDATE
  // ========================================

  const updated = await this.findOneAndUpdate(
    {
      _id: current._id,

      // Ensure status has not changed since
      // we originally fetched this document.
      status: {
        $eq: current.status,
        $nin: LOCKED_STATUSES,
      },
    },
    {
      $set: set,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // ========================================
  // HANDLE CONCURRENT UPDATE
  // ========================================

  if (!updated) {
    const latestPayment = await this.findById(current._id);

    return {
      payment: latestPayment,
      becamePaid: false,
    };
  }

  return {
    payment: updated,

    becamePaid: updated.status === "paid" && current.status !== "paid",
  };
};

// ==========================================
// SYNCHRONIZE WITH RAZORPAY
// ==========================================

/**
 * Fetch the latest Payment Link from Razorpay.
 *
 * This is used when the webhook is delayed
 * or unavailable.
 */

paymentSchema.statics.syncWithRazorpay = async function (razorpay, payment) {
  if (!payment?.razorpayLinkId) {
    return {
      payment,
      becamePaid: false,
    };
  }

  // Never synchronize locked payments.
  if (LOCKED_STATUSES.includes(payment.status)) {
    return {
      payment,
      becamePaid: false,
    };
  }

  // Fetch actual Payment Link from Razorpay.
  const link = await razorpay.paymentLink.fetch(payment.razorpayLinkId);

  const payments = Array.isArray(link.payments) ? link.payments : [];

  // Only use a captured payment as the confirmed ID.
  const captured = payments.find((item) => item.status === "captured");

  // Apply the verified Razorpay state.
  return this.applyRazorpayLinkState(payment.razorpayLinkId, {
    linkStatus: link.status,

    razorpayPaymentId: captured?.payment_id,

    // Razorpay returns amount_paid in paise.
    amountPaidPaise: link.amount_paid,
  });
};

// ==========================================
// REMOVE INTERNAL FIELDS FROM API RESPONSES
// ==========================================

paymentSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.__v;
    delete ret.idempotencyKey;
    delete ret.qrCodeDataUrl;

    return ret;
  },
});

// ==========================================
// EXPORT MODEL
// ==========================================

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
