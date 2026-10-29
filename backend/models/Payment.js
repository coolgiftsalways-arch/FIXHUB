import mongoose from "mongoose";
import crypto from "node:crypto";

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
    razorpayStatus: {
      type: String,
      default: "",
    },
    linkCreatedAt: {
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
