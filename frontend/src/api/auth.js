// src/api/auth.js
import apiClient from "./client.js";

// ────────── Password-based ──────────
export async function loginRequest({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data.data; // { user }
}

export async function registerRequest(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data.data; // { user }
}

export async function getMeRequest() {
  const { data } = await apiClient.get("/auth/me");
  return data.data; // { user }
}

export async function logoutRequest() {
  const { data } = await apiClient.post("/auth/logout");
  return data;
}

// ────────── OTP Signup ──────────
export async function signupStartRequest(payload) {
  const { data } = await apiClient.post("/auth/signup/start", payload);
  return data.data;
}

export async function signupVerifyRequest({ email, otp }) {
  const { data } = await apiClient.post("/auth/signup/verify", { email, otp });
  return data.data; // { user }
}

// ────────── OTP Login ──────────
export async function loginOTPStartRequest({ email }) {
  const { data } = await apiClient.post("/auth/login/otp/start", { email });
  return data.data;
}

export async function loginOTPVerifyRequest({ email, otp }) {
  const { data } = await apiClient.post("/auth/login/otp/verify", { email, otp });
  return data.data; // { user }
}

// ────────── Forgot Password ──────────
export async function forgotStartRequest({ email }) {
  const { data } = await apiClient.post("/auth/forgot/start", { email });
  return data.data;
}

export async function forgotVerifyRequest({ email, otp }) {
  const { data } = await apiClient.post("/auth/forgot/verify", { email, otp });
  return data.data; // { resetToken }
}

export async function resetPasswordRequest({ resetToken, newPassword }) {
  const { data } = await apiClient.post("/auth/reset", { resetToken, newPassword });
  return data.data;
}

// ────────── Password + OTP (two-step login) ──────────
export async function verifyPasswordLoginOTPRequest({ email, otp }) {
  const { data } = await apiClient.post("/auth/login/verify-password-otp", { email, otp });
  return data.data; // { user }
}
