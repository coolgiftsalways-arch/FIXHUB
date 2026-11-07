import mongoose from "mongoose";

const fixHubCustomerSchema = new mongoose.Schema(
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
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    // ======================================
    // MEMBERSHIP
    // ======================================

    membershipTier: {
      type: String,
      default: "none",
      enum: ["none", "free", "gold"],
    },

    goldActivatedAt: {
      type: Date,
      default: null,
    },

    // ======================================
    // FIRST REPAIR FREE BENEFIT
    // ======================================

    firstRepairBenefitAvailable: {
      type: Boolean,
      default: false,
    },

    firstRepairBenefitUsed: {
      type: Boolean,
      default: false,
    },

    firstRepairBenefitGrantedAt: {
      type: Date,
      default: null,
    },

    firstRepairBenefitRedeemedAt: {
      type: Date,
      default: null,
    },

    firstRepairBenefitBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FixHubRepairBooking",
      default: null,
    },

    // ======================================
    // EMAIL VERIFICATION
    // ======================================

    emailVerified: {
      type: Boolean,
      default: true,
    },

    emailVerifiedAt: {
      type: Date,
      default: Date.now,
    },

    verificationTokenHash: {
      type: String,
      select: false,
    },

    verificationExpiresAt: {
      type: Date,
      select: false,
    },

    verificationSentAt: {
      type: Date,
      select: false,
    },

    // ======================================
    // PASSWORD RECOVERY
    // ======================================

    passwordResetTokenHash: {
      type: String,
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },

    passwordResetSentAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,

    collection: "fixhub_customers",

    toJSON: {
      transform: function (doc, ret) {
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
    },
  },
);

const FixHubCustomer =
  mongoose.models.FixHubCustomer ||
  mongoose.model("FixHubCustomer", fixHubCustomerSchema);

export default FixHubCustomer;
