import mongoose from "mongoose";

// ==========================================
// FIXHUB CUSTOMER DATABASE MODEL
// ==========================================

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      maxlength: 254,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^[6-9]\d{9}$/,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 300,
    },

    // ======================================
    // PASSWORD
    // ======================================

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    // ======================================
    // LOGIN SESSION
    // ======================================

    tokenVersion: {
      type: Number,
      default: 0,
    },

    // ======================================
    // GOLD MEMBERSHIP
    // ======================================

    membershipTier: {
      type: String,
      enum: ["free", "gold"],
      default: "free",
    },

    goldActivatedAt: {
      type: Date,
      default: null,
    },

    // ======================================
    // EMAIL VERIFICATION
    // ======================================

    emailVerified: {
      type: Boolean,
      default: undefined,
    },

    emailVerifiedAt: {
      type: Date,
    },

    verificationTokenHash: {
      type: String,
      select: false,
    },

    verificationExpiresAt: {
      type: Date,
    },

    verificationSentAt: {
      type: Date,
    },

    // ======================================
    // FORGOT PASSWORD
    // ======================================

    passwordResetTokenHash: {
      type: String,
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
    },

    passwordResetSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "fixhub_customers",
  },
);

// ==========================================
// HIDE SENSITIVE INFORMATION
// ==========================================

customerSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.tokenVersion;

    delete ret.verificationTokenHash;
    delete ret.verificationExpiresAt;
    delete ret.verificationSentAt;

    delete ret.passwordResetTokenHash;
    delete ret.passwordResetExpiresAt;
    delete ret.passwordResetSentAt;

    delete ret.__v;

    return ret;
  },
});

// ==========================================
// EXPORT MODEL
// ==========================================

const FixHubCustomer =
  mongoose.models.FixHubCustomer ||
  mongoose.model("FixHubCustomer", customerSchema);

export default FixHubCustomer;
