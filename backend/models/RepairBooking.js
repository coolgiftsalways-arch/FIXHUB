import mongoose from "mongoose";

// ==========================================
// FIXHUB REPAIR BOOKING MODEL
// ==========================================

const repairBookingSchema = new mongoose.Schema(
  {
    // CUSTOMER ACCOUNT REFERENCE
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FixHubCustomer",
      required: true,
      index: true,
    },

    // PHONE INFORMATION
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

    modelNotListed: {
      type: Boolean,
      default: false,
    },

    // PHONE'S ORIGINAL MRP
    phoneMRP: {
      type: Number,
      default: null,
      min: 1,
    },

    // AUTOMATIC REPAIR SERVICE CHARGE
    fixingCharge: {
      type: Number,
      default: null,
      min: 0,
    },

    // REPAIR ISSUE
    repairIssue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    // SERVICE ADDRESS
    serviceAddress: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 300,
    },

    // APPOINTMENT DETAILS
    preferredDate: {
      type: String,
      default: "",
      trim: true,
    },

    preferredTime: {
      type: String,
      default: "",
      trim: true,
    },

    // ADDITIONAL CUSTOMER INFORMATION
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    // BOOKING STATUS
    status: {
      type: String,
      enum: [
        "pending",
        "pending_quote",
        "contacted",
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "fixhub_repair_bookings",
  }
);

// ==========================================
// DATABASE INDEXES
// ==========================================

// Efficiently retrieve a customer's bookings by date.
repairBookingSchema.index({
  customer: 1,
  createdAt: -1,
});

// ==========================================
// EXPORT MODEL
// ==========================================

const RepairBooking =
  mongoose.models.FixHubRepairBooking ||
  mongoose.model("FixHubRepairBooking", repairBookingSchema);

export default RepairBooking;

