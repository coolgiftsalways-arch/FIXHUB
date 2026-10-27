import { Router } from "express";
import jwt from "jsonwebtoken";
import FixHubCustomer from "../models/FixHubCustomer.js";

const router = Router();

// ==========================================
// FIXHUB ADMIN AUTHENTICATION
// ==========================================

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SESSION_MS = 8 * 60 * 60 * 1000;

const COOKIE_NAME = IS_PRODUCTION
  ? "__Host-fixhub_admin"
  : "fixhub_admin";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax",
  path: "/",
};

// ==========================================
// ADMIN CONFIGURATION
// ==========================================

function getAdminConfig() {
  const email = process.env.FIXHUB_ADMIN_EMAIL
    ?.trim()
    .toLowerCase();

  const password = process.env.FIXHUB_ADMIN_PASSWORD;
  const jwtSecret = process.env.FIXHUB_ADMIN_JWT_SECRET;

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error(
      "FIXHUB_ADMIN_EMAIL is missing or invalid.",
    );
  }

  if (
    typeof password !== "string" ||
    password.length === 0
  ) {
    throw new Error(
      "FIXHUB_ADMIN_PASSWORD is missing.",
    );
  }

  if (
    typeof jwtSecret !== "string" ||
    Buffer.byteLength(jwtSecret, "utf8") < 32
  ) {
    throw new Error(
      "FIXHUB_ADMIN_JWT_SECRET must contain at least 32 bytes.",
    );
  }

  return {
    email,
    password,
    jwtSecret,
  };
}

// ==========================================
// CLEAR ADMIN SESSION
// ==========================================

function clearAdminSession(res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
}

// ==========================================
// CREATE ADMIN SESSION
// ==========================================

function createAdminSession(res, config) {
  const token = jwt.sign(
    {
      sub: config.email,
      role: "admin",
    },
    config.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: "8h",
      issuer: "fixhub-admin",
      audience: "fixhub-admin",
    },
  );

  res.cookie(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    maxAge: SESSION_MS,
  });
}

// ==========================================
// REQUIRE ADMIN AUTHENTICATION
// ==========================================

export async function requireAdmin(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Admin login required.",
    });
  }

  let config;

  try {
    config = getAdminConfig();
  } catch (error) {
    console.error(
      "FIXHUB admin configuration error:",
      error.message,
    );

    clearAdminSession(res);

    return res.status(503).json({
      success: false,
      message:
        "Admin authentication is not configured correctly.",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "fixhub-admin",
      audience: "fixhub-admin",
    });
  } catch {
    clearAdminSession(res);

    return res.status(401).json({
      success: false,
      message: "Admin session expired. Please log in again.",
    });
  }

  if (
    typeof decoded?.sub !== "string" ||
    decoded.sub !== config.email ||
    decoded.role !== "admin"
  ) {
    clearAdminSession(res);

    return res.status(401).json({
      success: false,
      message: "Invalid admin session.",
    });
  }

  req.fixhubAdmin = {
    email: config.email,
    role: "admin",
  };

  return next();
}

// ==========================================
// ADMIN LOGIN
// POST /api/admin-auth/login
// ==========================================

router.post("/login", (req, res) => {
  try {
    const config = getAdminConfig();

    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password = req.body?.password;

    if (
      !email ||
      typeof password !== "string" ||
      password.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter your admin email and password.",
      });
    }

    const emailMatches = email === config.email;
    const passwordMatches = password === config.password;

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    createAdminSession(res, config);

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      admin: {
        email: config.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error(
      "FIXHUB admin login error:",
      error.stack || error.message,
    );

    return res.status(503).json({
      success: false,
      message:
        "Admin authentication is temporarily unavailable.",
    });
  }
});

// ==========================================
// GET ADMIN SESSION
// GET /api/admin-auth/me
// ==========================================

router.get("/me", requireAdmin, (req, res) => {
  return res.status(200).json({
    success: true,
    admin: {
      email: req.fixhubAdmin.email,
      role: req.fixhubAdmin.role,
    },
  });
});

// ==========================================
// ADMIN LOGOUT
// POST /api/admin-auth/logout
// ==========================================

router.post("/logout", (req, res) => {
  clearAdminSession(res);

  return res.json({
    success: true,
    message: "Admin logged out successfully.",
  });
});

// ==========================================
// COMPATIBILITY EXPORT
// ==========================================

export { FixHubCustomer };

export default router;

