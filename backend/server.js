// ==========================================
// FIXHUB BACKEND SERVER
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

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const production = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, "../frontend/dist");

// ==========================================
// MONGODB DNS CONFIGURATION
// ==========================================

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("MongoDB DNS configuration applied.");
} catch (error) {
  console.warn("DNS configuration skipped:", error.message);
}

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = new Set();

function addAllowedOrigin(value) {
  if (!value) return;

  try {
    allowedOrigins.add(new URL(value).origin);
  } catch {
    console.warn("Ignoring invalid CLIENT_URL configuration.");
  }
}

addAllowedOrigin(process.env.CLIENT_URL);

if (!production) {
  addAllowedOrigin("http://localhost:5173");
  addAllowedOrigin("http://127.0.0.1:5173");
  addAllowedOrigin("http://localhost:5174");
  addAllowedOrigin("http://127.0.0.1:5174");
}

console.log(
  "Allowed frontend origins:",
  [...allowedOrigins].join(", ") || "(none configured)"
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      console.warn("Blocked CORS origin:", origin);
      return callback(new Error("CORS origin not allowed."));
    },

    credentials: true,

    methods: [
      "GET",
      "HEAD",
      "POST",
      "PATCH",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  })
);

// ==========================================
// EXPRESS MIDDLEWARE
// ==========================================

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

// ==========================================
// REQUEST LOGGING
// ==========================================

app.use("/api", (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    console.log(
      `[API RESPONSE] ${req.method} ${req.originalUrl} -> ${res.statusCode}`
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
    
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});


// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", async (_req, res) => {
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
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

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
  if (fs.existsSync(path.join(frontendDist, "index.html"))) {
    app.use(express.static(frontendDist));

    app.get("/{*splat}", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }

      res.sendFile(
        path.join(frontendDist, "index.html"),
        (error) => {
          if (error) {
            next(error);
          }
        }
      );
    });
  } else {
    console.warn(
      `Frontend build not found at ${frontendDist}. ` +
        "API server will run without serving frontend files."
    );
  }
}

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, _req, res, next) => {
  console.error(
    "FIXHUB SERVER ERROR:",
    error.stack || error.message
  );

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
    status = 403;
  }

  res.status(status).json({
    success: false,
    message:
      status >= 500
        ? "Internal server error."
        : error.message,
  });
});

// ==========================================
// MONGODB CONNECTION EVENTS
// ==========================================

mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established.");
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error.message);
});

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error(
      "Startup failed: MONGO_URI is missing. Check backend/.env."
    );

    process.exitCode = 1;
    return;
  }

  let server;

  try {
    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    await mongoose.connection.db.admin().ping();

    console.log("MongoDB Atlas connected.");
    console.log("Database:", mongoose.connection.name);

    server = app.listen(PORT, () => {
      console.log("----------------------------------");
      console.log("FIXHUB BACKEND STARTED");
      console.log(`Server: http://localhost:${PORT}`);
      console.log("Customer authentication: registered");
      console.log("Admin authentication: registered");
      console.log("Admin dashboard API: registered");
      console.log("Membership requests API: registered");
      console.log("Repair bookings API: registered");
      console.log("Repair payments API: registered");
      console.log("MongoDB: connected");
      console.log("----------------------------------");
    });

    server.on("error", (error) => {
      console.error("HTTP server error:", error.message);
      process.exitCode = 1;
    });

    // ======================================
    // GRACEFUL SHUTDOWN
    // ======================================

    let stopping = false;

    async function shutdown(signal) {
      if (stopping) return;

      stopping = true;

      console.log(`${signal} received. Shutting down FIXHUB...`);

      if (server) {
        await new Promise((resolve) => {
          server.close(resolve);
        });
      }

      try {
        await mongoose.disconnect();
      } catch (error) {
        console.error(
          "MongoDB shutdown error:",
          error.message
        );
      }

      process.exit(0);
    }

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error(
      "FIXHUB startup failed:",
      error.stack || error.message
    );

    if (server) {
      server.close();
    }

    try {
      await mongoose.disconnect();
    } catch {
      // Ignore secondary cleanup errors.
    }

    process.exitCode = 1;
  }
}

startServer();