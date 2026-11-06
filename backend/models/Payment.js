import mongoose from "mongoose";
import crypto from "node:crypto";

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

// Razorpay Payment Link status -> FIXHUB payment status
const LINK_STATUS_MAP = {
  created: "pending",
  partially_paid: "under_review",
  paid: "paid",
  expired: "expired",
  cancelled: "cancelled",
};

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
    // Amount in rupees (Razorpay works in paise = amount * 100).
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

    // Set when a test coupon changed the amount (e.g. ₹1 testing coupon).
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
    // Raw Razorpay link status: created | partially_paid | paid | expired | cancelled
    razorpayStatus: {
      type: String,
      default: "",
    },
    linkCreatedAt: {
      type: Date,
      default: null,
    },
    // Last time we asked Razorpay / received a webhook for this payment.
    lastSyncedAt: {
      type: Date,
      default: null,
    },
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

paymentSchema.pre("validate", function () {
  if (!this.paymentId) {
    this.paymentId =
      "FH-PAY-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  }
});

/**
 * Apply a Razorpay Payment Link state to the matching FIXHUB payment.
 *
 * Atomic: a paid/refunded payment is never downgraded, and only ONE caller
 * (webhook or status poll) receives becamePaid === true, so anything you do
 * "on payment confirmed" runs exactly once.
 */
paymentSchema.statics.applyRazorpayLinkState = async function (
  razorpayLinkId,
  { linkStatus, razorpayPaymentId, amountPaidPaise } = {},
) {
  if (!razorpayLinkId) return { payment: null, becamePaid: false };

  const current = await this.findOne({ razorpayLinkId });
  if (!current) return { payment: null, becamePaid: false };

  let nextStatus = LINK_STATUS_MAP[linkStatus] || current.status;

  // Only trust "paid" when the full amount was received.
  if (
    nextStatus === "paid" &&
    amountPaidPaise != null &&
    Number(amountPaidPaise) < Math.round(current.amount * 100)
  ) {
    nextStatus = "under_review";
  }

  // A link that is still "created" must not undo a UPI reference the
  // customer already submitted for manual review.
  if (
    nextStatus === "pending" &&
    ["submitted", "under_review"].includes(current.status)
  ) {
    nextStatus = current.status;
  }

  const set = {
    razorpayStatus: linkStatus || current.razorpayStatus,
    lastSyncedAt: new Date(),
  };

  if (razorpayPaymentId) set.razorpayPaymentId = razorpayPaymentId;

  if (nextStatus !== current.status) {
    set.status = nextStatus;
    if (nextStatus === "paid") set.verifiedAt = new Date();
  }

  const updated = await this.findOneAndUpdate(
    { _id: current._id, status: { $nin: LOCKED_STATUSES } },
    { $set: set },
    { new: true, runValidators: true },
  );

  if (!updated) {
    return { payment: await this.findById(current._id), becamePaid: false };
  }

  return { payment: updated, becamePaid: set.status === "paid" };
};

/**
 * Ask Razorpay directly for the link status (fallback when the webhook is
 * late or not configured). `razorpay` is a `new Razorpay({...})` instance.
 */
paymentSchema.statics.syncWithRazorpay = async function (razorpay, payment) {
  if (!payment?.razorpayLinkId) return { payment, becamePaid: false };

  const link = await razorpay.paymentLink.fetch(payment.razorpayLinkId);
  const payments = Array.isArray(link.payments) ? link.payments : [];
  const captured =
    payments.find((item) => item.status === "captured") || payments[0];

  return this.applyRazorpayLinkState(payment.razorpayLinkId, {
    linkStatus: link.status,
    razorpayPaymentId: captured?.payment_id,
    amountPaidPaise: link.amount_paid,
  });
};

paymentSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.__v;
    delete ret.idempotencyKey;
    delete ret.qrCodeDataUrl;
    return ret;
  },
});

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
