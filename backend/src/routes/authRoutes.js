// src/routes/authRoutes.js
import { Router } from "express";
import {
  register, login, me, logout, refresh,
  signupStart, signupVerify,
  loginOTPStart, loginOTPVerify,
  forgotStart, forgotVerify, resetPasswordFinal, verifyPasswordLoginOTP,
} from "../controllers/authController.js";
import {
  registerRules, loginRules, emailOnlyRules, otpRules, resetPasswordRules,
} from "../validators/authValidator.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import {
  loginLimiter, registerLimiter, otpStartLimiter, otpVerifyLimiter, resetLimiter,
} from "../middleware/rateLimiters.js";
import rateLimit from "express-rate-limit";
import { listSessions, revokeSession, revokeOtherSessions } from "../controllers/sessionController.js";
import { resendPasswordLoginOTP } from "../controllers/authController.js";

const router = Router();

// Refresh is public (uses cookie) but heavily rate-limited to prevent abuse
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  handler: (req, res) => res.status(429).json({ success: false, message: "Too many refreshes. Please wait." }),
});

// Password-based (rate-limited)
router.post("/register", registerLimiter, registerRules, validate, register);
router.post("/login", loginLimiter, loginRules, validate, login);

// Second step of password login (OTP verification)
router.post("/login/verify-password-otp", otpVerifyLimiter, emailOnlyRules.concat(otpRules), validate, verifyPasswordLoginOTP);
router.post("/login/resend-password-otp", otpStartLimiter, emailOnlyRules, validate, resendPasswordLoginOTP);

// Signup with OTP (rate-limited)
router.post("/signup/start", otpStartLimiter, registerRules, validate, signupStart);
router.post("/signup/verify", otpVerifyLimiter, emailOnlyRules.concat(otpRules), validate, signupVerify);

// Login with OTP (rate-limited)
router.post("/login/otp/start", otpStartLimiter, emailOnlyRules, validate, loginOTPStart);
router.post("/login/otp/verify", otpVerifyLimiter, emailOnlyRules.concat(otpRules), validate, loginOTPVerify);

// Forgot password (rate-limited)
router.post("/forgot/start", otpStartLimiter, emailOnlyRules, validate, forgotStart);
router.post("/forgot/verify", otpVerifyLimiter, emailOnlyRules.concat(otpRules), validate, forgotVerify);
router.post("/reset", resetLimiter, resetPasswordRules, validate, resetPasswordFinal);

// Refresh — public (uses refresh cookie)
router.post("/refresh", refreshLimiter, refresh);

// Session
router.get("/me", requireAuth, me);
router.post("/logout", logout);

// Sessions (Tier 2 — user can see + revoke their own sessions)
router.get("/sessions", requireAuth, listSessions);
router.delete("/sessions/others", requireAuth, revokeOtherSessions);
router.delete("/sessions/:id", requireAuth, revokeSession);

export default router;
