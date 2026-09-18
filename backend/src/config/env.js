// src/config/env.js
import dotenv from "dotenv";
dotenv.config();

const required = ["JWT_SECRET"];
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  tokens: {
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshExpiresInDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30,
    refreshCookieName: process.env.REFRESH_COOKIE_NAME || "campusos_refresh",
  },
  cookie: {
    name: process.env.COOKIE_NAME || "campusos_token",
    secret: process.env.COOKIE_SECRET || process.env.JWT_SECRET,
    domain: process.env.COOKIE_DOMAIN || "",
    // In dev, use SameSite=None + Secure=true so cross-origin requests work.
    // Browsers treat localhost as a secure context even over HTTP.
    secure: true,
    sameSite: "none",
    maxAgeMs: Number(process.env.COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "2d",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    visionModel: process.env.GEMINI_VISION_MODEL || "gemini-3.6-flash",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    currency: process.env.RAZORPAY_CURRENCY || "INR",
  },
  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY || "",
    privateKey: process.env.VAPID_PRIVATE_KEY || "",
    subject: process.env.VAPID_SUBJECT || "mailto:admin@campusos.ai",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};
