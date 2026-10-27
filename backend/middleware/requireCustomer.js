import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import FixHubCustomer from "../models/FixHubCustomer.js";

// ==========================================
// FIXHUB CUSTOMER AUTHENTICATION MIDDLEWARE
// ==========================================

// ==========================================
// COOKIE CONFIGURATION
// ==========================================

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_NAME = isProduction ? "__Host-fixhub_session" : "fixhub_session";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

// ==========================================
// GET CUSTOMER JWT SECRET
// ==========================================

function getJwtSecret() {
  const secret = process.env.FIXHUB_JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("FIXHUB_JWT_SECRET is missing or invalid.");
  }

  return secret;
}

// ==========================================
// CLEAR CUSTOMER SESSION
// ==========================================

function clearCustomerSession(res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
}

// ==========================================
// REQUIRE CUSTOMER LOGIN
// ==========================================

export async function requireCustomer(req, res, next) {
  try {
    // ======================================
    // GET SESSION COOKIE
    // ======================================

    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to your FIXHUB account.",
      });
    }

    // ======================================
    // CHECK JWT CONFIGURATION
    // ======================================

    let secret;

    try {
      secret = getJwtSecret();
    } catch (error) {
      console.error("FIXHUB JWT configuration error:", error.message);

      return res.status(503).json({
        success: false,
        message: "Authentication is temporarily unavailable.",
      });
    }

    // ======================================
    // VERIFY CUSTOMER TOKEN
    // ======================================

    let decoded;

    try {
      decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"],
      });
    } catch {
      clearCustomerSession(res);

      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    // ======================================
    // VALIDATE TOKEN DETAILS
    // ======================================

    if (
      !decoded ||
      typeof decoded.sub !== "string" ||
      !mongoose.isValidObjectId(decoded.sub) ||
      typeof decoded.v !== "number"
    ) {
      clearCustomerSession(res);

      return res.status(401).json({
        success: false,
        message: "Invalid customer session.",
      });
    }

    // ======================================
    // FIND CUSTOMER IN MONGODB
    // ======================================

    const customer = await FixHubCustomer.findById(decoded.sub);

    if (!customer) {
      clearCustomerSession(res);

      return res.status(401).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    // ======================================
    // CHECK EMAIL VERIFICATION
    // ======================================

    // Existing customers without this field
    // are allowed to continue logging in.

    if (customer.emailVerified === false) {
      clearCustomerSession(res);

      return res.status(403).json({
        success: false,
        message: "Please verify your email before continuing.",
      });
    }

    // ======================================
    // CHECK SESSION VERSION
    // ======================================

    const currentTokenVersion = customer.tokenVersion ?? 0;

    if (decoded.v !== currentTokenVersion) {
      clearCustomerSession(res);

      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    // ======================================
    // ATTACH CUSTOMER TO REQUEST
    // ======================================

    req.fixhubCustomer = customer;

    // Compatibility for routes that use
    // req.customer instead of req.fixhubCustomer.

    req.customer = customer;

    req.customerId = String(customer._id);

    // ======================================
    // CONTINUE TO PROTECTED API
    // ======================================

    return next();
  } catch (error) {
    console.error("FIXHUB CUSTOMER AUTH ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify customer authentication.",
    });
  }
}

// ==========================================
// SUPPORT DEFAULT IMPORTS ALSO
// ==========================================

export default requireCustomer;
