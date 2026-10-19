import mongoose from "mongoose";

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
    },

    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 300,
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
  },

  {
    timestamps: true,
    collection: "fixhub_customers",
  },
);

const FixHubCustomer =
  mongoose.models.FixHubCustomer ||
  mongoose.model("FixHubCustomer", customerSchema);

export default FixHubCustomer;
