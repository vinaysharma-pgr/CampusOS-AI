// src/services/authService.js
import { db } from "../database/index.js";
import { otpStore } from "../database/otpStore.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";
import { env } from "../config/env.js";
import * as loginAttempts from "./loginAttemptService.js";
import * as refreshTokens from "./refreshTokenService.js";
import {
  sendSignupOTP,
  sendLoginOTP,
  sendForgotPasswordOTP,
  sendWelcome,
} from "./emailService.js";

const pendingSignups = new Map();

function fireAndForget(promise, label) {
  promise.catch((err) => {
    console.error(`❌ Background email failed (${label}):`, err.message);
  });
}

// ══════════════════════════════════════════════
//  STANDARD PASSWORD FLOWS
// ══════════════════════════════════════════════
export async function registerUser({ name, email, password, role, organization, department, semester, section, userAgent, ipAddress }) {
  const existing = await db.findByEmail(email);
  if (existing) throw ApiError.conflict("This email is already registered");

  const user = await db.createUser({ name, email, password, role, organization, department, semester, section });
  const accessToken = signToken({ sub: user._id, role: user.role });
  const { rawToken: refreshToken, expiresAt } = await refreshTokens.issue(user._id, { userAgent, ipAddress });

  return { user, accessToken, refreshToken, refreshExpiresAt: expiresAt };
}

export async function loginUser({ email, password, userAgent, ipAddress }) {
  const lock = loginAttempts.checkLock(email);
  if (lock.locked) {
    throw ApiError.forbidden(`Account temporarily locked. Try again in ${lock.retryInMinutes} minute(s).`);
  }

  const user = await db.getUserWithPassword(email);
  if (!user) {
    loginAttempts.recordFailure(email);
    throw ApiError.unauthorized("Invalid credentials");
  }
  if (!user.isActive) throw ApiError.forbidden("Account disabled");

  const ok = await db.comparePassword(user._id, password);
  if (!ok) {
    const result = loginAttempts.recordFailure(email);
    if (result.locked) {
      throw ApiError.forbidden("Too many failed attempts. Account locked for 15 minutes.");
    }
    throw ApiError.unauthorized(`Invalid credentials. ${result.remaining} attempt(s) remaining.`);
  }

  loginAttempts.recordSuccess(email);

  // Password verified. Now decide: OTP required or not?
  if (env.auth?.disableLoginOtp) {
    // Dev bypass: skip OTP, issue tokens directly
    const { password: _, ...safe } = user;
    const accessToken = signToken({ sub: safe._id, role: safe.role });
    const { rawToken: refreshToken, expiresAt } = await refreshTokens.issue(safe._id, { userAgent, ipAddress });
    return { user: safe, accessToken, refreshToken, refreshExpiresAt: expiresAt };
  }

  // Normal flow: send OTP and require verification
  if (otpStore.hasActive("login_password", email)) {
    throw ApiError.badRequest("An OTP was already sent. Please wait a few minutes or restart the server to reset.");
  }
  const otp = otpStore.generate("login_password", email);
  fireAndForget(sendLoginOTP({ to: user.email, name: user.name, otp, ip: ipAddress }), `password-login OTP → ${email}`);
  return { requiresOTP: true, email: user.email };
}

/**
 * Second step of password login: verify the OTP that was just emailed.
 * Issues access + refresh cookies (via controller).
 */
export async function verifyPasswordLoginOTP({ email, otp, userAgent, ipAddress }) {
  const result = otpStore.verify("login_password", email, otp);
  if (!result.ok) {
    if (result.reason === "expired") throw ApiError.badRequest("This code has expired. Request a new one.");
    if (result.reason === "too_many_attempts") throw ApiError.badRequest("Too many incorrect attempts.");
    if (result.reason === "no_otp") throw ApiError.badRequest("No login in progress. Please start over.");
    throw ApiError.badRequest(`Incorrect code. ${result.attemptsLeft} attempts remaining.`);
  }

  const user = await db.findByEmail(email);
  if (!user) throw ApiError.notFound("User no longer exists");
  if (!user.isActive) throw ApiError.forbidden("Account disabled");

  const { password: _, ...safe } = user;
  const accessToken = signToken({ sub: safe._id, role: safe.role });
  const { rawToken: refreshToken, expiresAt } = await refreshTokens.issue(safe._id, { userAgent, ipAddress });

  return { user: safe, accessToken, refreshToken, refreshExpiresAt: expiresAt };
}

export async function getCurrentUser(userId) {
  const user = await db.findUserById(userId);
  if (!user) throw ApiError.notFound("User not found");
  const { password: _, ...safe } = user;
  return safe;
}

// ══════════════════════════════════════════════
//  SIGNUP WITH OTP
// ══════════════════════════════════════════════
export async function startSignup({ name, email, password, role, organization, department, semester, section }) {
  const existing = await db.findByEmail(email);
  if (existing) throw ApiError.conflict("This email is already registered");

  if (otpStore.hasActive("signup", email)) {
    throw ApiError.badRequest("An OTP was already sent. Please wait 60 seconds before requesting a new one.");
  }

  const otp = otpStore.generate("signup", email);
  pendingSignups.set(email.toLowerCase(), {
    name, email, password, role, organization, department, semester, section,
    createdAt: Date.now(),
  });

  fireAndForget(sendSignupOTP({ to: email, name, otp }), `signup OTP → ${email}`);
  return { email, message: "Verification code sent" };
}

export async function verifySignupOTP({ email, otp, userAgent, ipAddress }) {
  const result = otpStore.verify("signup", email, otp);
  if (!result.ok) {
    if (result.reason === "expired") throw ApiError.badRequest("This code has expired. Request a new one.");
    if (result.reason === "too_many_attempts") throw ApiError.badRequest("Too many incorrect attempts. Request a new code.");
    if (result.reason === "no_otp") throw ApiError.badRequest("No verification in progress. Please sign up again.");
    throw ApiError.badRequest(`Incorrect code. ${result.attemptsLeft} attempts remaining.`);
  }

  const pending = pendingSignups.get(email.toLowerCase());
  if (!pending) throw ApiError.badRequest("Signup session expired. Please sign up again.");

  const user = await db.createUser({
    name: pending.name,
    email: pending.email,
    password: pending.password,
    role: pending.role,
    organization: pending.organization,
    department: pending.department,
    semester: pending.semester,
    section: pending.section,
  });
  pendingSignups.delete(email.toLowerCase());

  const accessToken = signToken({ sub: user._id, role: user.role });
  const { rawToken: refreshToken, expiresAt } = await refreshTokens.issue(user._id, { userAgent, ipAddress });

  fireAndForget(sendWelcome({ to: user.email, name: user.name }), `welcome → ${email}`);

  return { user, accessToken, refreshToken, refreshExpiresAt: expiresAt };
}

// ══════════════════════════════════════════════
//  LOGIN WITH OTP
// ══════════════════════════════════════════════
export async function startLoginOTP({ email, ip }) {
  const user = await db.findByEmail(email);
  if (!user) throw ApiError.notFound("No account found with this email");
  if (!user.isActive) throw ApiError.forbidden("Account disabled");

  if (otpStore.hasActive("login", email)) {
    throw ApiError.badRequest("An OTP was already sent. Please wait a few minutes or restart the server to reset.");
  }

  const otp = otpStore.generate("login", email);
  fireAndForget(sendLoginOTP({ to: user.email, name: user.name, otp, ip }), `login OTP → ${email}`);
  return { email: user.email, message: "Login code sent" };
}

export async function verifyLoginOTP({ email, otp, userAgent, ipAddress }) {
  const result = otpStore.verify("login", email, otp);
  if (!result.ok) {
    if (result.reason === "expired") throw ApiError.badRequest("This code has expired. Request a new one.");
    if (result.reason === "too_many_attempts") throw ApiError.badRequest("Too many incorrect attempts.");
    if (result.reason === "no_otp") throw ApiError.badRequest("No login in progress. Please start again.");
    throw ApiError.badRequest(`Incorrect code. ${result.attemptsLeft} attempts remaining.`);
  }

  const user = await db.findByEmail(email);
  if (!user) throw ApiError.notFound("User no longer exists");

  const { password: _, ...safe } = user;
  const accessToken = signToken({ sub: safe._id, role: safe.role });
  const { rawToken: refreshToken, expiresAt } = await refreshTokens.issue(safe._id, { userAgent, ipAddress });

  return { user: safe, accessToken, refreshToken, refreshExpiresAt: expiresAt };
}

// ══════════════════════════════════════════════
//  FORGOT PASSWORD
// ══════════════════════════════════════════════
export async function startForgotPassword({ email }) {
  const user = await db.findByEmail(email);
  if (!user) throw ApiError.notFound("No account found with this email");

  if (otpStore.hasActive("reset", email)) {
    throw ApiError.badRequest("A code was already sent. Please wait 60 seconds.");
  }

  const otp = otpStore.generate("reset", email);
  fireAndForget(sendForgotPasswordOTP({ to: user.email, name: user.name, otp }), `reset OTP → ${email}`);
  return { email: user.email, message: "Reset code sent" };
}

export async function verifyResetOTP({ email, otp }) {
  const result = otpStore.verify("reset", email, otp);
  if (!result.ok) {
    if (result.reason === "expired") throw ApiError.badRequest("This code has expired. Request a new one.");
    if (result.reason === "too_many_attempts") throw ApiError.badRequest("Too many incorrect attempts.");
    if (result.reason === "no_otp") throw ApiError.badRequest("No reset in progress.");
    throw ApiError.badRequest(`Incorrect code. ${result.attemptsLeft} attempts remaining.`);
  }

  const resetToken = signToken({ sub: email.toLowerCase(), purpose: "reset" });
  return { resetToken };
}

export async function resetPassword({ resetToken, newPassword }) {
  let decoded;
  try {
    const { verifyToken } = await import("../utils/jwt.js");
    decoded = verifyToken(resetToken);
  } catch {
    throw ApiError.unauthorized("Reset link expired. Please start over.");
  }

  if (decoded.purpose !== "reset") throw ApiError.unauthorized("Invalid reset token");

  const user = await db.findByEmail(decoded.sub);
  if (!user) throw ApiError.notFound("User no longer exists");

  await db.updateUserPassword(user._id, newPassword);

  // Revoke all sessions on password reset — every device must log back in
  await refreshTokens.revokeAllForUser(user._id, "password_reset");

  return { message: "Password updated successfully" };
}

// ══════════════════════════════════════════════
//  REFRESH TOKEN FLOW
// ══════════════════════════════════════════════
export async function refreshSession(oldRefreshToken, { userAgent, ipAddress }) {
  const rotated = await refreshTokens.rotate(oldRefreshToken, { userAgent, ipAddress });

  const user = await db.findUserById(rotated.userId);
  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (!user.isActive) throw ApiError.forbidden("Account disabled");

  const accessToken = signToken({ sub: user._id, role: user.role });

  return {
    accessToken,
    refreshToken: rotated.rawToken,
    refreshExpiresAt: rotated.expiresAt,
    user,
  };
}

export async function logoutSession(refreshToken) {
  if (!refreshToken) return { revoked: false };
  const ok = await refreshTokens.revoke(refreshToken, "logout");
  return { revoked: ok };
}
