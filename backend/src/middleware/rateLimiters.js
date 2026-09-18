// src/middleware/rateLimiters.js
import rateLimit from "express-rate-limit";

const handler = (req, res) => {
  const retryAfter = res.getHeader("Retry-After") || "900";
  res.status(429).json({
    success: false,
    message: `Too many requests. Please try again in ${Math.ceil(Number(retryAfter) / 60)} minute(s).`,
    errors: [],
  });
};

// Login: 10 attempts per 15 min per IP (account lockout takes over after 5 per-account)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: null,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Register: 3 per hour per IP
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP start (signup/login/forgot): 3 per 15 min per IP
export const otpStartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP verify: 10 per 15 min per IP
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Reset password: 5 per hour per IP
export const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
});
