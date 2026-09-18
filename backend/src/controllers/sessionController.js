// src/controllers/sessionController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as refreshTokens from "../services/refreshTokenService.js";
import { env } from "../config/env.js";

/**
 * GET /api/auth/sessions
 * List active sessions for the current user.
 * Marks the current session (matches the refresh cookie) with isCurrent: true.
 */
export const listSessions = asyncHandler(async (req, res) => {
  const currentRaw = req.cookies?.[env.tokens.refreshCookieName];
  const currentHash = currentRaw
    ? (await import("../models/RefreshToken.js")).default.hashToken(currentRaw)
    : null;

  const sessions = await refreshTokens.listActiveSessions(req.user._id);

  const shaped = sessions.map((s) => ({
    id: s._id,
    deviceLabel: s.deviceLabel || "Unknown device",
    userAgent: s.userAgent || "",
    ipAddress: s.ipAddress || "",
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    isCurrent: currentHash ? s.tokenHash === currentHash : false,
  }));

  return success(res, { sessions: shaped, count: shaped.length });
});

/**
 * DELETE /api/auth/sessions/:id
 * Revoke one session (must belong to the current user).
 */
export const revokeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await refreshTokens.revokeById(id, req.user._id, "user_revoked");
  if (!result) throw ApiError.notFound("Session not found or already revoked");
  return success(res, { revoked: true }, "Session revoked");
});

/**
 * DELETE /api/auth/sessions/others
 * Revoke every session EXCEPT the current one.
 */
export const revokeOtherSessions = asyncHandler(async (req, res) => {
  const currentRaw = req.cookies?.[env.tokens.refreshCookieName];
  if (!currentRaw) throw ApiError.unauthorized("No current session");
  const RefreshToken = (await import("../models/RefreshToken.js")).default;
  const currentHash = RefreshToken.hashToken(currentRaw);

  const result = await refreshTokens.revokeAllExceptHash(
    req.user._id,
    currentHash,
    "user_revoked_others"
  );
  return success(res, result, `${result.revoked} other session(s) revoked`);
});
