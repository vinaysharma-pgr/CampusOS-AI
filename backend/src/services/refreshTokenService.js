// src/services/refreshTokenService.js
import crypto from "node:crypto";
import RefreshToken from "../models/RefreshToken.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Parse a User-Agent string into a friendly device label.
 */
function parseDevice(userAgent = "") {
  const ua = userAgent.toLowerCase();
  let browser = "Unknown browser";
  let os = "Unknown OS";

  if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";

  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac os") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("linux")) os = "Linux";

  return browser + " on " + os;
}

/**
 * Create a new refresh token for a user.
 * Returns the RAW token (never stored — only its hash is).
 */
export async function issue(userId, { userAgent = "", ipAddress = "" } = {}) {
  const rawToken = crypto.randomBytes(48).toString("base64url");
  const tokenHash = RefreshToken.hashToken(rawToken);

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days default
  );

  await RefreshToken.create({
    tokenHash,
    userId,
    userAgent,
    ipAddress,
    deviceLabel: parseDevice(userAgent),
    expiresAt,
  });

  return { rawToken, expiresAt };
}

/**
 * Verify a refresh token and return its record.
 * Throws if:
 *   - token missing/invalid
 *   - expired
 *   - revoked
 */
export async function verify(rawToken) {
  if (!rawToken) throw ApiError.unauthorized("No refresh token provided");

  const tokenHash = RefreshToken.hashToken(rawToken);
  const record = await RefreshToken.findOne({ tokenHash }).lean();

  if (!record) throw ApiError.unauthorized("Invalid refresh token");
  if (record.isRevoked) throw ApiError.unauthorized("Refresh token revoked");
  if (new Date(record.expiresAt) < new Date()) throw ApiError.unauthorized("Refresh token expired");

  return record;
}

/**
 * Rotate a refresh token: revoke old, issue new.
 * Returns the new raw token + expiry.
 */
export async function rotate(oldRawToken, userInfo = {}) {
  const record = await verify(oldRawToken);

  // Revoke the old token
  await RefreshToken.findByIdAndUpdate(record._id, {
    isRevoked: true,
    revokedAt: new Date(),
    revokedReason: "rotated",
  });

  // Issue a new token
  const issued = await issue(record.userId, userInfo);

  return { ...issued, userId: record.userId, previousId: record._id };
}

/**
 * Revoke a single refresh token (logout).
 */
export async function revoke(rawToken, reason = "logout") {
  if (!rawToken) return false;
  const tokenHash = RefreshToken.hashToken(rawToken);
  const result = await RefreshToken.findOneAndUpdate(
    { tokenHash },
    { isRevoked: true, revokedAt: new Date(), revokedReason: reason }
  );
  return !!result;
}

/**
 * Revoke all refresh tokens for a user (logout everywhere).
 */
export async function revokeAllForUser(userId, reason = "admin") {
  const result = await RefreshToken.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true, revokedAt: new Date(), revokedReason: reason }
  );
  return { revoked: result.modifiedCount };
}

/**
 * List active sessions for a user (for the sessions UI).
 */
export async function listActiveSessions(userId) {
  return RefreshToken.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Cleanup expired tokens (also handled by TTL index, but manual for safety).
 */
export async function cleanupExpired() {
  const result = await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
  return { deleted: result.deletedCount };
}
