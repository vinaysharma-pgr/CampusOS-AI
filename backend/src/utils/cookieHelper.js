// src/utils/cookieHelper.js
import { env } from "../config/env.js";

export function setAuthCookie(res, token) {
  res.cookie(env.cookie.name, token, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: env.cookie.maxAgeMs,
    domain: env.cookie.domain || undefined,
    path: "/",
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(env.cookie.name, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    domain: env.cookie.domain || undefined,
    path: "/",
  });
}

/**
 * Set the refresh token cookie.
 * Scoped to /api/auth so it's ONLY sent to refresh-related endpoints.
 */
export function setRefreshCookie(res, rawToken, expiresAt) {
  res.cookie(env.tokens.refreshCookieName, rawToken, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    expires: expiresAt,
    domain: env.cookie.domain || undefined,
    path: "/api/auth",
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(env.tokens.refreshCookieName, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    domain: env.cookie.domain || undefined,
    path: "/api/auth",
  });
}
