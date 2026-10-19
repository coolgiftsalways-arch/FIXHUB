import express from "express";

import mongoose from "mongoose";

import dotenv from "dotenv";

import cors from "cors";

import helmet from "helmet";

import cookieParser from "cookie-parser";

// CUSTOMER AUTHENTICATION
import fixhubAuthRoutes from "./routes/fixhubAuthRoutes.js";

// ==========================================
// ENVIRONMENT
// ==========================================

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;

// ==========================================
// SECURITY
// ==========================================

app.use(helmet());

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",

    credentials: true,
  }),
);

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json({ limit: "1mb" }));

app.use(cookieParser());

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FixHub Backend Running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ==========================================
// CUSTOMER AUTHENTICATION ROUTES
// ==========================================

app.use("/api/auth", fixhubAuthRoutes);

// ==========================================
// SERVER START
// ==========================================

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`✅ FixHub Backend Running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Backend startup failed:", error.message);

    process.exit(1);
  }
}

startServer();
