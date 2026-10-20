import dns from "node:dns";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// ==========================================
// IMPORT ROUTES
// ==========================================

// Customer Authentication
import fixhubAuthRoutes from "./routes/fixhubAuthRoutes.js";

// ==========================================
// ENVIRONMENT CONFIGURATION
// ==========================================

dotenv.config();
// ==========================================
// FIX MONGODB ATLAS DNS CONNECTION
// ==========================================

dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("✅ MongoDB DNS configured");

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const MONGO_URI = process.env.MONGO_URI;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ==========================================
// EXPRESS SECURITY
// ==========================================

app.disable("x-powered-by");

app.use(helmet());

// ==========================================
// CORS CONFIGURATION
// ==========================================

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ==========================================
// EXPRESS MIDDLEWARE
// ==========================================

app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    application: "FIXHUB",
    message: "FIXHUB Backend API is running",
  });
});

// ==========================================
// MONGODB CONNECTION STATUS
// ==========================================

function getDatabaseStatus() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] || "unknown";
}

// ==========================================
// HEALTH CHECK API
// ==========================================

app.get("/api/health", async (req, res) => {
  const databaseStatus = getDatabaseStatus();

  if (databaseStatus !== "connected") {
    return res.status(503).json({
      success: false,
      backend: "running",
      database: databaseStatus,
      message: "MongoDB is not connected",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Verify MongoDB can respond to a database command
    await mongoose.connection.db.command({ ping: 1 });

    return res.status(200).json({
      success: true,
      application: "FIXHUB",
      backend: "running",
      database: "connected",
      databaseName: mongoose.connection.name,
      message: "FIXHUB Backend and MongoDB are working",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ MongoDB health check failed:", error.message);

    return res.status(503).json({
      success: false,
      backend: "running",
      database: "unavailable",
      message: "MongoDB health check failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// ==========================================
// CUSTOMER AUTHENTICATION ROUTES
// ==========================================

app.use("/api/auth", fixhubAuthRoutes);

// ==========================================
// MONGODB EVENTS
// ==========================================

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Atlas Connected Successfully");
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB Atlas Disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB Connection Error:", error.message);
});

// ==========================================
// CONNECT MONGODB
// ==========================================

async function connectDatabase() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing. Check backend/.env");
  }

  console.log("⏳ Connecting to MongoDB Atlas...");

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  // Verify the connection actually responds
  await mongoose.connection.db.command({ ping: 1 });

  console.log("✅ MongoDB Connection Verified");
  console.log("📦 Database Name:", mongoose.connection.name);
}

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
  try {
    console.log("");
    console.log("======================================");
    console.log("       FIXHUB BACKEND STARTING");
    console.log("======================================");
    console.log("");

    await connectDatabase();

    app.listen(PORT, () => {
      console.log("");
      console.log("======================================");
      console.log("🚀 FIXHUB BACKEND RUNNING");
      console.log("======================================");
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
      console.log(`🗄️ MongoDB: ${getDatabaseStatus()}`);
      console.log("✅ Customer Authentication: Enabled");
      console.log("======================================");
      console.log("");
    });
  } catch (error) {
    console.error("");
    console.error("======================================");
    console.error("❌ FIXHUB BACKEND STARTUP FAILED");
    console.error("======================================");
    console.error("Error:", error.message);
    console.error("======================================");

    process.exit(1);
  }
}

// ==========================================
// RUN APPLICATION
// ==========================================

startServer();
