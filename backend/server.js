// ==========================================
// FIXHUB BACKEND SERVER
// STABLE STARTUP + GRACEFUL SHUTDOWN
// ==========================================

import dns from "node:dns";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import fixhubAuthRoutes from "./routes/fixhubAuthRoutes.js";
import adminAuthRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import membershipRequestRoutes from "./routes/membershipRequestRoutes.js";
import repairBookingRoutes from "./routes/repairBookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import razorpayWebhookRoutes from "./routes/razorpayWebhookRoutes.js";

// ==========================================
// ENVIRONMENT CONFIGURATION
// ==========================================

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 3000);
const production = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDist = path.resolve(__dirname, "../frontend/dist");

const PROCESS_ID = process.pid;
const SHUTDOWN_TIMEOUT = 15000;

console.log("==================================");
console.log("FIXHUB BACKEND INITIALIZING");
console.log("Process ID:", PROCESS_ID);
console.log("Environment:", production ? "production" : "development");
console.log("Node version:", process.version);
console.log("==================================");

// ==========================================
// PROCESS STATE
// ==========================================

let server = null;
let stopping = false;
let startupComplete = false;
let shutdownTimer = null;

// ==========================================
// GRACEFUL SHUTDOWN
// REGISTER BEFORE DATABASE CONNECTION
// ==========================================

async function shutdown(signal) {
  if (stopping) {
    console.log(`[SHUTDOWN] Already stopping. Ignoring ${signal}.`);
    return;
  }

  stopping = true;

  console.log("----------------------------------");
  console.log(`[SHUTDOWN] ${signal} received.`);
  console.log("[SHUTDOWN] Process ID:", PROCESS_ID);
  console.log("[SHUTDOWN] Startup complete:", startupComplete);
  console.log("[SHUTDOWN] Beginning graceful shutdown...");
  console.log("----------------------------------");

  // Force termination if graceful shutdown hangs.
  shutdownTimer = setTimeout(() => {
    console.error(
      `[SHUTDOWN] Timeout after ${SHUTDOWN_TIMEOUT}ms. Forcing exit.`,
    );

    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  shutdownTimer.unref();

  try {
    // Stop accepting new HTTP requests.
    if (server) {
      console.log("[SHUTDOWN] Closing HTTP server...");

      await new Promise((resolve) => {
        server.close((error) => {
          if (error) {
            console.error("[SHUTDOWN] HTTP close error:", error.message);
          }

          resolve();
        });

        // Close idle connections when supported.
        if (typeof server.closeIdleConnections === "function") {
          server.closeIdleConnections();
        }
      });

      console.log("[SHUTDOWN] HTTP server closed.");
    }

    // Disconnect MongoDB.
    if (mongoose.connection.readyState !== 0) {
      console.log("[SHUTDOWN] Disconnecting MongoDB...");

      await mongoose.disconnect();

      console.log("[SHUTDOWN] MongoDB disconnected.");
    }

    console.log("[SHUTDOWN] Graceful shutdown completed.");
    console.log("[SHUTDOWN] Process exiting.");

    if (shutdownTimer) {
      clearTimeout(shutdownTimer);
    }

    process.exit(0);
  } catch (error) {
    console.error("[SHUTDOWN] Shutdown error:", error.stack || error.message);

    if (shutdownTimer) {
      clearTimeout(shutdownTimer);
    }

    process.exit(1);
  }
}

// Register signals immediately.
// This also works while MongoDB is connecting.
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

// ==========================================
// UNEXPECTED PROCESS ERRORS
// ==========================================

process.on("uncaughtException", (error) => {
  console.error("[PROCESS] Uncaught exception:", error.stack || error.message);

  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason) => {
  console.error("[PROCESS] Unhandled promise rejection:", reason);

  shutdown("UNHANDLED_REJECTION");
});

// ==========================================
// MONGODB DNS CONFIGURATION
// ==========================================

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  console.log("[DNS] MongoDB DNS configuration applied.");
} catch (error) {
  console.warn("[DNS] Configuration skipped:", error.message);
}

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = new Set();

function addAllowedOrigin(value) {
  if (!value) return;

  try {
    const url = new URL(value.trim());

    allowedOrigins.add(url.origin);

    // Allow both www and non-www versions.
    const altHost = url.hostname.startsWith("www.")
      ? url.hostname.slice(4)
      : `www.${url.hostname}`;

    if (url.hostname.includes(".")) {
      allowedOrigins.add(
        `${url.protocol}//${altHost}${url.port ? `:${url.port}` : ""}`,
      );
    }
  } catch {
    console.warn(`[CORS] Ignoring invalid origin: ${value}`);
  }
}

// Official FIXHUB domains.
addAllowedOrigin("https://fixhubsolutions.in");
addAllowedOrigin("https://www.fixhubsolutions.in");

// Hostinger preview domain.
addAllowedOrigin("https://orangered-fox-540676.hostingersite.com");

// Additional domains from environment.
String(process.env.CLIENT_URL || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .forEach(addAllowedOrigin);

// Local development.
if (!production) {
  addAllowedOrigin("http://localhost:5173");
  addAllowedOrigin("http://127.0.0.1:5173");
  addAllowedOrigin("http://localhost:5174");
  addAllowedOrigin("http://127.0.0.1:5174");
}

console.log(
  "[CORS] Allowed origins:",
  [...allowedOrigins].join(", ") || "(none configured)",
);

// ==========================================
// CORS MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      console.warn("[CORS] Blocked origin:", origin);

      return callback(new Error("CORS origin not allowed."));
    },

    credentials: true,

    methods: ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// ==========================================
// RAZORPAY WEBHOOK
// MUST BE BEFORE express.json()
// ==========================================

app.use("/api/razorpay/webhook", razorpayWebhookRoutes);

// ==========================================
// EXPRESS MIDDLEWARE
// ==========================================

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(cookieParser());

// ==========================================
// REQUEST LOGGING
// ==========================================

app.use("/api", (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    console.log(
      `[API RESPONSE] ${req.method} ${req.originalUrl} -> ${res.statusCode}`,
    );
  });

  next();
});

// ==========================================
// API REQUEST ORIGIN PROTECTION
// ==========================================

app.use("/api", (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const origin = req.get("origin");

  if (!origin) {
    return next();
  }

  let normalizedOrigin;

  try {
    normalizedOrigin = new URL(origin).origin;
  } catch {
    return res.status(403).json({
      success: false,
      message: "Invalid request origin.",
    });
  }

  if (!allowedOrigins.has(normalizedOrigin)) {
    return res.status(403).json({
      success: false,
      message: "Invalid request origin.",
    });
  }

  next();
});

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (_req, res) => {
  const indexPath = path.join(frontendDist, "index.html");

  if (production && fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  return res.json({
    success: true,
    name: "FIXHUB",
    message: "FIXHUB Backend is running",
    processId: PROCESS_ID,
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", async (_req, res) => {
  if (stopping) {
    return res.status(503).json({
      success: false,
      server: "shutting_down",
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      server: "running",
      mongodb: "disconnected",
    });
  }

  try {
    await mongoose.connection.db.admin().ping();

    return res.status(200).json({
      success: true,
      server: "running",
      mongodb: "connected",
      database: mongoose.connection.name,
      processId: PROCESS_ID,
      uptime: Math.floor(process.uptime()),
    });
  } catch (error) {
    console.error("[HEALTH] Check failed:", error.message);

    return res.status(503).json({
      success: false,
      server: "running",
      mongodb: "unavailable",
    });
  }
});

// ==========================================
// CUSTOMER AUTHENTICATION
// Base URL: /api/auth
// ==========================================

app.use("/api/auth", fixhubAuthRoutes);

// ==========================================
// ADMIN AUTHENTICATION
// Base URL: /api/admin-auth
// ==========================================

app.use("/api/admin-auth", adminAuthRoutes);

// ==========================================
// ADMIN DASHBOARD
// Base URL: /api/admin
// ==========================================

app.use("/api/admin", adminRoutes);

// ==========================================
// MEMBERSHIP REQUESTS
// Base URL: /api/membership-requests
// ==========================================

app.use("/api/membership-requests", membershipRequestRoutes);

// ==========================================
// REPAIR BOOKINGS
// Base URL: /api/repair-bookings
// ==========================================

app.use("/api/repair-bookings", repairBookingRoutes);

// ==========================================
// REPAIR PAYMENTS
// Base URL: /api/payments
// ==========================================

app.use("/api/payments", paymentRoutes);

// ==========================================
// API 404 HANDLER
// ==========================================

app.use("/api", (req, res) => {
  console.warn(`[API 404] ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    message: "API route not found.",
    method: req.method,
    path: req.originalUrl,
  });
});

// ==========================================
// SERVE FRONTEND IN PRODUCTION
// ==========================================

if (production) {
  const indexPath = path.join(frontendDist, "index.html");

  if (fs.existsSync(indexPath)) {
    app.use(express.static(frontendDist));

    app.get("/{*splat}", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }

      res.sendFile(indexPath, (error) => {
        if (error) {
          next(error);
        }
      });
    });
  } else {
    console.warn(
      `[FRONTEND] Build not found at ${frontendDist}. ` +
        "API server will run without serving frontend files.",
    );
  }
}

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let status = error.status || error.statusCode || 500;

  if (
    error instanceof SyntaxError &&
    Object.prototype.hasOwnProperty.call(error, "body")
  ) {
    status = 400;
  }

  if (error.message === "CORS origin not allowed.") {
    console.warn("[CORS] Request rejected.");
    status = 403;
  } else {
    console.error("[SERVER ERROR]", error.stack || error.message);
  }

  res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error." : error.message,
  });
});

// ==========================================
// MONGODB CONNECTION EVENTS
// ==========================================

mongoose.connection.on("connected", () => {
  console.log("[MONGODB] Connection established.");
});

mongoose.connection.on("disconnected", () => {
  console.warn("[MONGODB] Connection disconnected.");
});

mongoose.connection.on("error", (error) => {
  console.error("[MONGODB] Error:", error.message);
});

// ==========================================
// SERVER STARTUP
// ==========================================

async function startServer() {
  if (stopping) {
    console.warn("[STARTUP] Startup cancelled because shutdown has started.");
    return;
  }

  if (!process.env.MONGO_URI) {
    console.error("[STARTUP] MONGO_URI is missing. Check backend/.env.");

    process.exitCode = 1;
    return;
  }

  try {
    console.log("----------------------------------");
    console.log("[STARTUP] Connecting to MongoDB Atlas...");
    console.log("[STARTUP] Process ID:", PROCESS_ID);
    console.log("[STARTUP] Port:", PORT);
    console.log("----------------------------------");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    if (stopping) {
      console.warn("[STARTUP] Shutdown requested during MongoDB connection.");

      await mongoose.disconnect();
      return;
    }

    await mongoose.connection.db.admin().ping();

    console.log("[STARTUP] MongoDB Atlas connected.");
    console.log("[STARTUP] Database:", mongoose.connection.name);

    if (stopping) {
      await mongoose.disconnect();
      return;
    }

    server = app.listen(PORT, "0.0.0.0", () => {
      startupComplete = true;

      console.log("----------------------------------");
      console.log("FIXHUB BACKEND STARTED");
      console.log("Process ID:", PROCESS_ID);
      console.log(`Port: ${PORT}`);
      console.log(`Environment: ${production ? "production" : "development"}`);

      console.log("Customer authentication: registered");
      console.log("Admin authentication: registered");
      console.log("Admin dashboard API: registered");
      console.log("Membership requests API: registered");
      console.log("Repair bookings API: registered");
      console.log("Repair payments API: registered");
      console.log("Razorpay webhook: registered");

      console.log(
        process.env.TEST_COUPON_CODE?.trim()
          ? "Test coupon: ENABLED"
          : "Test coupon: disabled (TEST_COUPON_CODE not set)",
      );

      console.log("MongoDB: connected");
      console.log("----------------------------------");
    });

    server.on("error", (error) => {
      console.error("[HTTP SERVER ERROR]", error.stack || error.message);

      shutdown("HTTP_SERVER_ERROR");
    });

    server.on("close", () => {
      console.log("[HTTP SERVER] Server close event received.");
    });
  } catch (error) {
    console.error("[STARTUP FAILED]", error.stack || error.message);

    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } catch (disconnectError) {
      console.error(
        "[STARTUP] MongoDB cleanup failed:",
        disconnectError.message,
      );
    }

    if (!stopping) {
      process.exitCode = 1;
    }
  }
}

// ==========================================
// START
// ==========================================

startServer().catch((error) => {
  console.error("[FATAL STARTUP ERROR]", error.stack || error.message);

  process.exitCode = 1;
});
