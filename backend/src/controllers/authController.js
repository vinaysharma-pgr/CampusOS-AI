// src/controllers/authController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as authService from "../services/authService.js";
import {
  setAuthCookie, clearAuthCookie,
  setRefreshCookie, clearRefreshCookie,
} from "../utils/cookieHelper.js";
import { env } from "../config/env.js";

// ── Helper: set both cookies ──
function setBothCookies(res, accessToken, refreshToken, refreshExpiresAt) {
  setAuthCookie(res, accessToken);
  setRefreshCookie(res, refreshToken, refreshExpiresAt);
}

// ── Helper: extract UA + IP ──
function ua(req) {
  return {
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
  };
}

// ── Password-based ──
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, organization, department, semester, section } = req.body;
  const { user, accessToken, refreshToken, refreshExpiresAt } = await authService.registerUser({
    name, email, password, role, organization, department, semester, section,
    ...ua(req),
  });
  setBothCookies(res, accessToken, refreshToken, refreshExpiresAt);
  return success(res, { user }, "Account created", 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({
    email, password, ...ua(req),
  });

  // Two possible outcomes:
  // 1. Dev bypass → tokens issued directly (result.user set)
  // 2. Normal → OTP sent, verification required (result.requiresOTP true)
  if (result.requiresOTP) {
    return success(res, { requiresOTP: true, email: result.email }, "OTP sent to your email", 200);
  }

  // Dev bypass path — issue cookies immediately
  req.user = result.user;
  setBothCookies(res, result.accessToken, result.refreshToken, result.refreshExpiresAt);
  return success(res, { user: result.user }, "Logged in");
});

export const verifyPasswordLoginOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { user, accessToken, refreshToken, refreshExpiresAt } = await authService.verifyPasswordLoginOTP({
    email, otp, ...ua(req),
  });
  req.user = user; // for audit middleware
  setBothCookies(res, accessToken, refreshToken, refreshExpiresAt);
  return success(res, { user }, "Logged in");
});

// ── Signup with OTP ──
export const signupStart = asyncHandler(async (req, res) => {
  const { name, email, password, role, organization, department, semester, section } = req.body;
  const result = await authService.startSignup({ name, email, password, role, organization, department, semester, section });
  return success(res, result, "Verification code sent", 200);
});

export const signupVerify = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { user, accessToken, refreshToken, refreshExpiresAt } = await authService.verifySignupOTP({
    email, otp, ...ua(req),
  });
  req.user = user;
  setBothCookies(res, accessToken, refreshToken, refreshExpiresAt);
  return success(res, { user }, "Account verified", 201);
});

// ── Login with OTP ──
export const loginOTPStart = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.startLoginOTP({ email, ip: req.ip });
  return success(res, result, "Login code sent");
});

export const loginOTPVerify = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { user, accessToken, refreshToken, refreshExpiresAt } = await authService.verifyLoginOTP({
    email, otp, ...ua(req),
  });
  req.user = user;
  setBothCookies(res, accessToken, refreshToken, refreshExpiresAt);
  return success(res, { user }, "Logged in");
});

// ── Refresh ──
export const refresh = asyncHandler(async (req, res) => {
  const oldRefresh = req.cookies?.[env.tokens.refreshCookieName];
  const { user, accessToken, refreshToken, refreshExpiresAt } = await authService.refreshSession(
    oldRefresh,
    ua(req)
  );
  setBothCookies(res, accessToken, refreshToken, refreshExpiresAt);
  return success(res, { user }, "Session refreshed");
});

// ── Forgot password ──
export const forgotStart = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.startForgotPassword({ email });
  return success(res, result, "Reset code sent");
});

export const forgotVerify = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifyResetOTP({ email, otp });
  return success(res, result, "Code verified");
});

export const resetPasswordFinal = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  const result = await authService.resetPassword({ resetToken, newPassword });
  return success(res, result, "Password updated");
});

// ── Current user ──
export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  return success(res, { user }, "Current user");
});

// ── Logout ──
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[env.tokens.refreshCookieName];
  await authService.logoutSession(refreshToken);
  clearAuthCookie(res);
  clearRefreshCookie(res);
  return success(res, {}, "Logged out");
});

export const resendPasswordLoginOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendPasswordLoginOTP({ email });
  return success(res, result, "New code sent");
});
