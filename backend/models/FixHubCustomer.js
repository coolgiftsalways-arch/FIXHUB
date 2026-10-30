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

    membershipTier: {
      type: String,
      default: "none",
    },

    goldActivatedAt: {
      type: Date,
      default: null,
    },

    // Email verification is not required.
    emailVerified: {
      type: Boolean,
      default: true,
    },

    emailVerifiedAt: {
      type: Date,
      default: Date.now,
    },

    // Retained for compatibility with existing records.
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

    // Password recovery fields.
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
