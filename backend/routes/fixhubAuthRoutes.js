import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import crypto from "node:crypto";

import FixHubCustomer from "../models/FixHubCustomer.js";

import {
  assertMailConfigured,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/mailService.js";

// ==========================================
// FIXHUB CUSTOMER AUTHENTICATION ROUTES
// ==========================================

const router = Router();

// ==========================================
// CONFIGURATION
// ==========================================

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const EMAIL_TOKEN_MS = 15 * 60 * 1000;
const EMAIL_COOLDOWN_MS = 60 * 1000;

const COOKIE_NAME = IS_PRODUCTION
  ? "__Host-fixhub_session"
  : "fixhub_session";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax",
  path: "/",
};

// ==========================================
// VALIDATION
// ==========================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

function normalizeEmail(value) {
  if (typeof value !== "string") return null;

  const email = value.trim().toLowerCase();

  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return null;
  }

  return email;
}

function normalizePhone(value) {
  if (typeof value !== "string") return "";

  return value.replace(/\s+/g, "").trim();
}

function validPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    Buffer.byteLength(password, "utf8") <= 72
  );
}

function validName(name) {
  return (
    typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 100
  );
}

function validAddress(address) {
  return (
    typeof address === "string" &&
    address.trim().length >= 10 &&
    address.trim().length <= 300
  );
}

// ==========================================
// JWT SECRET
// ==========================================

function getJwtSecret() {
  const secret = process.env.FIXHUB_JWT_SECRET;

  if (
    typeof secret !== "string" ||
    Buffer.byteLength(secret, "utf8") < 32
  ) {
    const error = new Error(
      "FIXHUB_JWT_SECRET must contain at least 32 bytes."
    );

    error.code = "FIXHUB_AUTH_CONFIG_ERROR";
    throw error;
  }

  return secret;
}

// ==========================================
// PUBLIC CUSTOMER DATA
// ==========================================

function publicCustomer(customer) {
  const id = String(customer._id);

  const membershipTier =
    customer.membershipTier === "gold" ? "gold" : "free";

  return {
    id,
    customerId: `FH-${id.toUpperCase()}`,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    membershipTier,
    isGoldMember: membershipTier === "gold",
    goldActivatedAt: customer.goldActivatedAt || null,
    emailVerified:
      customer.emailVerified === undefined
        ? null
        : customer.emailVerified,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

// ==========================================
// CREATE CUSTOMER SESSION
// ==========================================

function createSession(res, customer) {
  const token = jwt.sign(
    {
      sub: String(customer._id),
      v: customer.tokenVersion ?? 0,
    },
    getJwtSecret(),
    {
      algorithm: "HS256",
      expiresIn: "30d",
      issuer: "fixhub",
      audience: "fixhub-customers",
    }
  );

  res.cookie(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    maxAge: SESSION_MS,
  });
}

// ==========================================
// CLEAR CUSTOMER SESSION
// ==========================================

function clearSession(res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
}

// ==========================================
// SECURE EMAIL TOKENS
// ==========================================

function generateSecureToken() {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return { token, tokenHash };
}

function hashReceivedToken(token) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    return null;
  }

  return crypto
    .createHash("sha256")
    .update(token.toLowerCase())
    .digest("hex");
}

// ==========================================
// RATE LIMITERS
// ==========================================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skip: () => !IS_PRODUCTION,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: IS_PRODUCTION ? 5 : 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
});

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: IS_PRODUCTION ? 5 : 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many email requests. Please try again later.",
  },
});

// ==========================================
// REQUIRE CUSTOMER LOGIN
// ==========================================

export async function requireCustomer(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please login to continue.",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
      issuer: "fixhub",
      audience: "fixhub-customers",
    });
  } catch (error) {
    clearSession(res);

    if (error.code === "FIXHUB_AUTH_CONFIG_ERROR") {
      console.error("FIXHUB configuration error:", error.message);

      return res.status(503).json({
        success: false,
        message: "Customer authentication is not configured correctly.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Your session has expired. Please login again.",
    });
  }

  if (typeof decoded?.sub !== "string" || typeof decoded?.v !== "number") {
    clearSession(res);

    return res.status(401).json({
      success: false,
      message: "Invalid customer session.",
    });
  }

  try {
    const customer = await FixHubCustomer.findById(decoded.sub);

    if (!customer) {
      clearSession(res);

      return res.status(401).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    if (customer.emailVerified === false) {
      clearSession(res);

      return res.status(403).json({
        success: false,
        message: "Please verify your email address.",
      });
    }

    if ((customer.tokenVersion ?? 0) !== decoded.v) {
      clearSession(res);

      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    req.fixhubCustomer = customer;

    return next();
  } catch (error) {
    console.error(
      "FIXHUB session verification failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify customer session.",
    });
  }
}

// ==========================================
// GENERIC EMAIL RESPONSE
// ==========================================

const genericEmailResponse = {
  success: true,
  message:
    "If this email is eligible, a link will be sent shortly. Check your inbox and spam folder.",
};

// ==========================================
// 1. REGISTER CUSTOMER
// POST /api/auth/register
// ==========================================

router.post("/register", registrationLimiter, async (req, res) => {
  try {
    const fullName = String(req.body?.fullName || "").trim();
    const email = normalizeEmail(req.body?.email);
    const phone = normalizePhone(req.body?.phone);
    const address = String(req.body?.address || "").trim();
    const password = req.body?.password;

    if (
      !validName(fullName) ||
      !email ||
      !PHONE_REGEX.test(phone) ||
      !validAddress(address) ||
      !validPassword(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid name, email, 10-digit phone number, full address and password of at least 8 characters.",
      });
    }

    getJwtSecret();
    assertMailConfigured();

    const existing = await FixHubCustomer.findOne({
      $or: [{ email }, { phone }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account already exists with this email or phone number.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verification = generateSecureToken();
    const now = new Date();

    const customer = await FixHubCustomer.create({
      fullName,
      email,
      phone,
      address,
      passwordHash,
      tokenVersion: 0,
      emailVerified: false,
      verificationTokenHash: verification.tokenHash,
      verificationExpiresAt: new Date(now.getTime() + EMAIL_TOKEN_MS),
      verificationSentAt: now,
    });

    try {
      await sendVerificationEmail(customer.email, verification.token);
    } catch (error) {
      console.error(
        "FIXHUB verification delivery:",
        error.code || error.message
      );

      return res.status(503).json({
        success: false,
        requiresVerification: true,
        message:
          "Account saved, but the verification email could not be sent. Please use Resend Verification.",
      });
    }

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      message:
        "Account created! Please check your email to verify your FIXHUB account.",
      email: customer.email,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number already registered.",
      });
    }

    if (error.code === "FIXHUB_AUTH_CONFIG_ERROR") {
      console.error("FIXHUB registration configuration:", error.message);

      return res.status(503).json({
        success: false,
        message: "Customer authentication is not configured correctly.",
      });
    }

    console.error("FIXHUB registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create your account.",
    });
  }
});

// ==========================================
// 2. LOGIN CUSTOMER
// POST /api/auth/login
// ==========================================

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const identifier = String(req.body?.identifier || "")
      .trim()
      .toLowerCase();

    const password = req.body?.password;

    if (!identifier || typeof password !== "string" || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter your email/mobile number and password.",
      });
    }

    const customer = await FixHubCustomer.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    }).select("+passwordHash");

    const passwordMatches = customer?.passwordHash
      ? await bcrypt.compare(password, customer.passwordHash)
      : false;

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email/mobile number or password.",
      });
    }

    if (customer.emailVerified === false) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: "Please verify your email before logging in.",
      });
    }

    createSession(res, customer);

    return res.json({
      success: true,
      message: "Login successful.",
      user: publicCustomer(customer),
    });
  } catch (error) {
    console.error("FIXHUB login error:", error.message);

    if (error.code === "FIXHUB_AUTH_CONFIG_ERROR") {
      return res.status(503).json({
        success: false,
        message: "Customer authentication is not configured correctly.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
});

// ==========================================
// 3. GET CUSTOMER PROFILE
// GET /api/auth/me
// ==========================================

router.get("/me", requireCustomer, (req, res) => {
  try {
    createSession(res, req.fixhubCustomer);

    return res.json({
      success: true,
      user: publicCustomer(req.fixhubCustomer),
    });
  } catch (error) {
    console.error("FIXHUB profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load customer profile.",
    });
  }
});

// ==========================================
// 4. UPDATE CUSTOMER PROFILE
// PATCH /api/auth/me
// ==========================================

router.patch("/me", requireCustomer, async (req, res) => {
  try {
    const fullName = String(req.body?.fullName || "").trim();
    const phone = normalizePhone(req.body?.phone);
    const address = String(req.body?.address || "").trim();

    if (
      !validName(fullName) ||
      !PHONE_REGEX.test(phone) ||
      !validAddress(address)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name, phone number and full address.",
      });
    }

    const customer = req.fixhubCustomer;

    customer.fullName = fullName;
    customer.phone = phone;
    customer.address = address;

    await customer.save();

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: publicCustomer(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already registered.",
      });
    }

    console.error("FIXHUB profile update:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update customer profile.",
    });
  }
});

// ==========================================
// 5. LOGOUT CUSTOMER
// POST /api/auth/logout
// ==========================================

router.post("/logout", requireCustomer, async (req, res) => {
  try {
    await FixHubCustomer.findByIdAndUpdate(req.fixhubCustomer._id, {
      $inc: { tokenVersion: 1 },
    });

    clearSession(res);

    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("FIXHUB logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to logout.",
    });
  }
});

// ==========================================
// 6. VERIFY EMAIL
// POST /api/auth/verify-email
// ==========================================

router.post("/verify-email", emailLimiter, async (req, res) => {
  try {
    const tokenHash = hashReceivedToken(req.body?.token);
    const newPassword = req.body?.newPassword;

    if (!tokenHash || !validPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid verification link or password. Use at least 8 characters.",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const customer = await FixHubCustomer.findOneAndUpdate(
      {
        verificationTokenHash: tokenHash,
        verificationExpiresAt: { $gt: new Date() },
        emailVerified: false,
      },
      {
        $set: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          passwordHash,
        },
        $inc: { tokenVersion: 1 },
        $unset: {
          verificationTokenHash: "",
          verificationExpiresAt: "",
          verificationSentAt: "",
        },
      },
      { new: true }
    );

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Verification link expired or already used.",
      });
    }

    return res.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("FIXHUB email verification:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify email.",
    });
  }
});

// ==========================================
// 7. RESEND VERIFICATION EMAIL
// POST /api/auth/resend-verification
// ==========================================

router.post("/resend-verification", emailLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const customer = await FixHubCustomer.findOne({
      email,
      emailVerified: false,
    });

    if (!customer) {
      return res.json(genericEmailResponse);
    }

    const now = new Date();

    if (
      customer.verificationSentAt &&
      now.getTime() - new Date(customer.verificationSentAt).getTime() <
        EMAIL_COOLDOWN_MS
    ) {
      return res.json(genericEmailResponse);
    }

    const verification = generateSecureToken();

    const updated = await FixHubCustomer.findOneAndUpdate(
      {
        _id: customer._id,
        emailVerified: false,
        $or: [
          { verificationSentAt: { $exists: false } },
          {
            verificationSentAt: {
              $lt: new Date(now.getTime() - EMAIL_COOLDOWN_MS),
            },
          },
        ],
      },
      {
        $set: {
          verificationTokenHash: verification.tokenHash,
          verificationExpiresAt: new Date(now.getTime() + EMAIL_TOKEN_MS),
          verificationSentAt: now,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.json(genericEmailResponse);
    }

    try {
      await sendVerificationEmail(customer.email, verification.token);
    } catch (error) {
      console.error(
        "FIXHUB resend verification:",
        error.code || error.message
      );
    }

    return res.json(genericEmailResponse);
  } catch (error) {
    console.error("FIXHUB resend error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process verification request.",
    });
  }
});

// ==========================================
// 8. FORGOT PASSWORD
// POST /api/auth/forgot-password
// ==========================================

router.post("/forgot-password", emailLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const customer = await FixHubCustomer.findOne({
      email,
      emailVerified: { $ne: false },
    });

    if (!customer) {
      return res.json(genericEmailResponse);
    }

    const now = new Date();

    if (
      customer.passwordResetSentAt &&
      now.getTime() - new Date(customer.passwordResetSentAt).getTime() <
        EMAIL_COOLDOWN_MS
    ) {
      return res.json(genericEmailResponse);
    }

    const reset = generateSecureToken();

    const updated = await FixHubCustomer.findOneAndUpdate(
      {
        _id: customer._id,
        emailVerified: { $ne: false },
        $or: [
          { passwordResetSentAt: { $exists: false } },
          {
            passwordResetSentAt: {
              $lt: new Date(now.getTime() - EMAIL_COOLDOWN_MS),
            },
          },
        ],
      },
      {
        $set: {
          passwordResetTokenHash: reset.tokenHash,
          passwordResetExpiresAt: new Date(now.getTime() + EMAIL_TOKEN_MS),
          passwordResetSentAt: now,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.json(genericEmailResponse);
    }

    try {
      await sendPasswordResetEmail(customer.email, reset.token);
    } catch (error) {
      console.error(
        "FIXHUB password reset email:",
        error.code || error.message
      );
    }

    return res.json(genericEmailResponse);
  } catch (error) {
    console.error("FIXHUB forgot password:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request.",
    });
  }
});

// ==========================================
// 9. RESET PASSWORD
// POST /api/auth/reset-password
// ==========================================

router.post("/reset-password", emailLimiter, async (req, res) => {
  try {
    const tokenHash = hashReceivedToken(req.body?.token);
    const newPassword = req.body?.newPassword;

    if (!tokenHash || !validPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset link or password. Use at least 8 characters.",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const customer = await FixHubCustomer.findOneAndUpdate(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
        emailVerified: { $ne: false },
      },
      {
        $set: { passwordHash },
        $inc: { tokenVersion: 1 },
        $unset: {
          passwordResetTokenHash: "",
          passwordResetExpiresAt: "",
          passwordResetSentAt: "",
        },
      },
      { new: true }
    );

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Reset link expired or already used.",
      });
    }

    clearSession(res);

    return res.json({
      success: true,
      message:
        "Password changed successfully. Please log in using your new password.",
    });
  } catch (error) {
    console.error("FIXHUB reset password:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
});

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default router;
