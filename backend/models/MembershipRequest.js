import mongoose from "mongoose";

// ==========================================
// FIXHUB MEMBERSHIP / SERVICE REQUEST MODEL
// ==========================================

const membershipRequestSchema = new mongoose.Schema(
  {
    // ======================================
    // LINK TO REGISTERED CUSTOMER
    // ======================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FixHubCustomer",
      required: true,
      index: true,
    },

    // ======================================
    // AUTOMATIC PRICE
    // ======================================

    planId: {
      type: String,
      default: "",
      trim: true,
    },

    planName: {
      type: String,
      default: "One Fixing Charge",
    },

    planPrice: {
      type: Number,
      default: null,
    },

    phoneMRP: {
      type: Number,
      default: null,
    },

    // ======================================
    // PHONE DETAILS
    // ======================================

    phoneBrand: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    phoneModel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 90,
    },

    // ======================================
    // REPAIR DETAILS
    // ======================================

    repairIssue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    preferredDate: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // ======================================
    // ADMIN REQUEST STATUS
    // ======================================

    status: {
      type: String,

      enum: ["pending", "pending_quote", "contacted", "approved", "rejected"],

      default: "pending",

      index: true,
    },
  },
  {
    timestamps: true,
    collection: "fixhub_membership_requests",
  },
);

// ==========================================
// INDEXES
// ==========================================

membershipRequestSchema.index({
  customer: 1,
  createdAt: -1,
});

// ==========================================
// EXPORT MODEL
// ==========================================

const MembershipRequest =
  mongoose.models.FixHubMembershipRequest ||
  mongoose.model("FixHubMembershipRequest", membershipRequestSchema);

export default MembershipRequest;
