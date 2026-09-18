// src/api/client.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ═══════════════════════════════════════════════════════
//  AUTO-REFRESH on 401
//  - When a request 401s, try to refresh the session via
//    POST /auth/refresh (cookie-based, no JS token needed).
//  - While refreshing, queue other 401'd requests so we
//    don't fire multiple refreshes in parallel.
//  - On refresh success → replay the original requests.
//  - On refresh failure → logout (session truly expired).
// ═══════════════════════════════════════════════════════

let isRefreshing = false;
let queue = []; // { resolve, reject, config }

function processQueue(error) {
  queue.forEach(({ resolve, reject, config }) => {
    if (error) reject(error);
    else resolve(apiClient(config));
  });
  queue = [];
}

// Paths that must NOT trigger auto-refresh (avoid loops)
const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/refresh",
  "/auth/signup/start",
  "/auth/signup/verify",
  "/auth/login/otp/start",
  "/auth/login/otp/verify",
  "/auth/forgot/start",
  "/auth/forgot/verify",
  "/auth/reset",
];

function shouldSkipRefresh(url = "") {
  return NO_REFRESH_PATHS.some((p) => url.includes(p));
}

let redirecting = false;
function forceLogout() {
  try {
    localStorage.removeItem("campusos_user");
  } catch {}
  if (!redirecting && typeof window !== "undefined") {
    const path = window.location.pathname;
    const isAuthPage = path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/forgot");
    if (!isAuthPage) {
      redirecting = true;
      window.location.href = "/login?expired=1";
    }
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Only handle 401s, and only once per request
    if (status !== 401 || originalRequest._retry || shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Fire the refresh request (cookie-based)
      await axios.post(API_BASE + "/auth/refresh", {}, { withCredentials: true });

      // Refresh succeeded — replay queued requests and the original
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshErr) {
      // Refresh failed — session truly expired
      processQueue(refreshErr);
      forceLogout();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
