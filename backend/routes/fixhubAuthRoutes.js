import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

import FixHubCustomer from "../models/FixHubCustomer.js";

const router = Router();

// =====================================================
// SESSION CONFIGURATION
// =====================================================

const isProduction = process.env.NODE_ENV === "production";

const COOKIE = isProduction ? "__Host-fixhub_session" : "fixhub_session";

const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

// =====================================================
// JWT SECRET
// =====================================================

function secret() {
  const value = process.env.FIXHUB_JWT_SECRET;

  if (!value || value.length < 32) {
    throw new Error(
      "Set FIXHUB_JWT_SECRET with at least 32 random characters.",
    );
  }

  return value;
}

// =====================================================
// CREATE LOGIN SESSION
// =====================================================

function setSession(res, customer) {
  const token = jwt.sign(
    {
      sub: customer.id,
      v: customer.tokenVersion,
    },
    secret(),
    {
      expiresIn: "30d",
      algorithm: "HS256",
    },
  );

  res.cookie(COOKIE, token, {
    ...COOKIE_OPTIONS,
    maxAge: SESSION_MS,
  });
}

// =====================================================
// CLEAR LOGIN SESSION
// =====================================================

function clearSession(res) {
  res.clearCookie(COOKIE, COOKIE_OPTIONS);
}

// =====================================================
// READ COOKIE
// =====================================================

function readToken(req) {
  const raw = req.headers.cookie || "";

  const pair = raw
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`));

  if (!pair) return null;

  try {
    return decodeURIComponent(pair.slice(COOKIE.length + 1));
  } catch {
    return null;
  }
}

// =====================================================
// PUBLIC CUSTOMER DATA
// =====================================================

function publicCustomer(customer) {
  return {
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
  };
}

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

async function requireCustomer(req, res, next) {
  const token = readToken(req);

  if (!token) {
    return res.status(401).json({
      message: "Please log in.",
    });
  }

  try {
    const payload = jwt.verify(token, secret(), {
      algorithms: ["HS256"],
    });

    const customer = await FixHubCustomer.findById(payload.sub);

    if (!customer || customer.tokenVersion !== payload.v) {
      clearSession(res);

      return res.status(401).json({
        message: "Session expired. Please log in.",
      });
    }

    req.fixhubCustomer = customer;

    next();
  } catch {
    clearSession(res);

    return res.status(401).json({
      message: "Session expired. Please log in.",
    });
  }
}

// =====================================================
// RATE LIMITING
// =====================================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    message: "Too many attempts. Please try again in 15 minutes.",
  },
});

// =====================================================
// VALIDATION
// =====================================================

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phonePattern = /^[6-9]\d{9}$/;

// =====================================================
// REGISTER CUSTOMER
// POST /api/auth/register
// =====================================================

router.post("/register", authLimiter, async (req, res) => {
  try {
    const fullName = String(req.body?.fullName || "").trim();

    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const phone = String(req.body?.phone || "").replace(/\s+/g, "");

    const address = String(req.body?.address || "").trim();

    const password = String(req.body?.password || "");

    if (
      fullName.length < 2 ||
      fullName.length > 100 ||
      !emailPattern.test(email) ||
      email.length > 254 ||
      !phonePattern.test(phone) ||
      address.length < 10 ||
      address.length > 300 ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message:
          "Enter a valid name, email, mobile number, full address and password (8–72 characters).",
      });
    }

    // CHECK EXISTING CUSTOMER

    const alreadyExists = await FixHubCustomer.findOne({
      $or: [{ email }, { phone }],
    });

    if (alreadyExists) {
      return res.status(409).json({
        message: "An account already exists with this email or mobile number.",
      });
    }

    // HASH PASSWORD

    const passwordHash = await bcrypt.hash(password, 12);

    // CREATE CUSTOMER

    const customer = await FixHubCustomer.create({
      fullName,
      email,
      phone,
      address,
      passwordHash,
    });

    // AUTOMATIC LOGIN AFTER REGISTRATION

    setSession(res, customer);

    return res.status(201).json({
      user: publicCustomer(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account already exists with this email or mobile number.",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Could not create account.",
    });
  }
});

// =====================================================
// LOGIN CUSTOMER
// POST /api/auth/login
// =====================================================

router.post("/login", authLimiter, async (req, res) => {
  try {
    const identifier = String(req.body?.identifier || "")
      .trim()
      .toLowerCase();

    const password = String(req.body?.password || "");

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Enter your email or mobile number and password.",
      });
    }

    // FIND CUSTOMER

    const customer = await FixHubCustomer.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    }).select("+passwordHash");

    // CHECK PASSWORD

    const valid = customer
      ? await bcrypt.compare(password, customer.passwordHash)
      : false;

    if (!valid) {
      return res.status(401).json({
        message: "Incorrect email/mobile number or password.",
      });
    }

    // SET COOKIE

    setSession(res, customer);

    return res.json({
      user: publicCustomer(customer),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
});

// =====================================================
// GET LOGGED-IN CUSTOMER
// GET /api/auth/me
// =====================================================

router.get("/me", requireCustomer, (req, res) => {
  // RENEW SESSION WHEN CUSTOMER RETURNS

  setSession(res, req.fixhubCustomer);

  return res.json({
    user: publicCustomer(req.fixhubCustomer),
  });
});

// =====================================================
// UPDATE CUSTOMER PROFILE
// PATCH /api/auth/me
// =====================================================

router.patch("/me", requireCustomer, async (req, res) => {
  try {
    const fullName = String(req.body?.fullName || "").trim();

    const phone = String(req.body?.phone || "").replace(/\s+/g, "");

    const address = String(req.body?.address || "").trim();

    if (
      fullName.length < 2 ||
      fullName.length > 100 ||
      !phonePattern.test(phone) ||
      address.length < 10 ||
      address.length > 300
    ) {
      return res.status(400).json({
        message: "Enter a valid name, mobile number and address.",
      });
    }

    const customer = req.fixhubCustomer;

    customer.fullName = fullName;
    customer.phone = phone;
    customer.address = address;

    await customer.save();

    return res.json({
      user: publicCustomer(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Mobile number already belongs to another account.",
      });
    }

    console.error("Profile update error:", error);

    return res.status(500).json({
      message: "Could not update profile.",
    });
  }
});

// =====================================================
// LOGOUT CUSTOMER
// POST /api/auth/logout
// =====================================================

router.post("/logout", requireCustomer, async (req, res) => {
  try {
    // INVALIDATE ALL PREVIOUS SESSIONS

    await FixHubCustomer.findByIdAndUpdate(req.fixhubCustomer.id, {
      $inc: {
        tokenVersion: 1,
      },
    });

    clearSession(res);

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Could not log out.",
    });
  }
});

export default router;
