// src/server.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server as SocketServer } from "socket.io";
import { verifyToken } from "./utils/jwt.js";
import { setIo } from "./services/notificationService.js";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import apiRoutes from "./routes/index.js";
import { auditMiddleware } from "./middleware/auditMiddleware.js";

const app = express();

// Security headers (Helmet + CSP + Permissions-Policy)
app.use(...securityHeaders);

// Accept ALL localhost variants + the LAN IP
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://192.168.137.223:5173",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Also allow any localhost/127.0.0.1 port during development
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    console.warn("❌ CORS blocked origin:", origin);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv === "development") app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    service: "CampusOS AI API",
    status: "running",
    environment: env.nodeEnv,
    storage: global.__USING_MONGO__ ? "mongodb" : "in-memory",
    timestamp: new Date().toISOString(),
  });
});

import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// [SECURITY] /uploads/* is no longer publicly served. Files are served via /api/uploads/:filename with auth.

// Audit log — must come BEFORE routes to wrap res.json
app.use("/api", auditMiddleware);

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  let usingMongo = false;

  if (process.env.USE_MONGO === "true") {
    if (!env.mongoUri) {
      console.warn("⚠️  USE_MONGO=true but MONGODB_URI is missing");
    } else {
      try {
        console.log("🔌 Connecting to MongoDB…");
        await mongoose.connect(env.mongoUri, {
          serverSelectionTimeoutMS: 20000,
          connectTimeoutMS: 20000,
          socketTimeoutMS: 30000,
          family: 4,
          autoSelectFamily: false,
        });
        console.log("✅ MongoDB connected");
        usingMongo = true;
      } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        console.warn("⚠️  Falling back to in-memory store");
      }
    }
  }

  if (!usingMongo) {
    process.env.USE_MONGO = "false";
  }
  global.__USING_MONGO__ = usingMongo;

  const { seedDatabase } = await import("./database/seed.js");
  await seedDatabase();

  const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
    path: "/socket.io",
  });

io.use((socket, next) => {
    try {
      // Tier 1+2: JWT lives in httpOnly cookie. Read it from the handshake cookie header.
      const cookieHeader = socket.handshake.headers.cookie || "";
      const cookieName = env.cookie.name;
      const match = cookieHeader.match(new RegExp(cookieName + "=([^;]+)"));
      const cookieToken = match ? decodeURIComponent(match[1]) : null;

      // Fallback: socket.handshake.auth.token (kept for backward compatibility)
      const token = socket.handshake.auth?.token || cookieToken;
      if (!token) return next(new Error("No token"));
      const decoded = verifyToken(token);
      socket.userId = decoded.sub;
      next();
    } catch (err) {
      next(new Error("Auth failed"));
    }
  });

io.on("connection", (socket) => {
    const room = "user:" + socket.userId;
    socket.join(room);
    console.log("🔔 Socket connected:", socket.userId, "→", room);
    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.userId);
    });
  });

setIo(io);

httpServer.listen(env.port, () => {
    console.log(`\n🚀 CampusOS API running on http://localhost:${env.port}`);
    console.log(`📦 Environment: ${env.nodeEnv}`);
    console.log(`💾 Storage: ${usingMongo ? "MongoDB" : "in-memory (temporary)"}`);
    console.log(`🔔 Socket.io ready\n`);
  });
}

start();
