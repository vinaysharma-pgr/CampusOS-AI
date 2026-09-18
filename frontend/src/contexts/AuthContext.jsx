// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  loginRequest, registerRequest, getMeRequest, logoutRequest,
  signupStartRequest, signupVerifyRequest,
  loginOTPStartRequest, loginOTPVerifyRequest,
  forgotStartRequest, forgotVerifyRequest, resetPasswordRequest,
  verifyPasswordLoginOTPRequest,
} from "../api/auth.js";

const AuthContext = createContext(null);
const USER_KEY = "campusos_user"; // only cache non-sensitive user object

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const persist = useCallback((user) => {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
    setUser(user);
  }, []);

  // ───── Password flow (Stage 2: 2-step with OTP) ─────
  const login = useCallback(async (credentials, { returnRaw = false } = {}) => {
    setLoading(true);
    try {
      const raw = await loginRequest(credentials);

      // Stage 2: password login may return { requiresOTP: true, email } instead of { user }
      if (raw?.requiresOTP) {
        return raw;
      }

      // Caller asked for the raw response (e.g. wants to inspect it)
      if (returnRaw) {
        if (raw?.user) persist(raw.user);
        return raw;
      }

      // Default: just the user
      persist(raw.user);
      return raw.user;
    } finally {
      setLoading(false);
    }
  }, [persist]);

  // ───── Second step of password login: verify OTP ─────
  const verifyPasswordOTP = useCallback(async ({ email, otp }) => {
    setLoading(true);
    try {
      const { user } = await verifyPasswordLoginOTPRequest({ email, otp });
      persist(user);
      return user;
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { user } = await registerRequest(payload);
      persist(user);
      return user;
    } finally {
      setLoading(false);
    }
  }, [persist]);

  // ───── OTP Signup ─────
  const startSignupOTP = useCallback(async (payload) => {
    setLoading(true);
    try { return await signupStartRequest(payload); }
    finally { setLoading(false); }
  }, []);

  const verifySignupOTP = useCallback(async ({ email, otp }) => {
    setLoading(true);
    try {
      const { user } = await signupVerifyRequest({ email, otp });
      persist(user);
      return user;
    } finally {
      setLoading(false);
    }
  }, [persist]);

  // ───── OTP Login (passwordless) ─────
  const startLoginOTP = useCallback(async ({ email }) => {
    setLoading(true);
    try { return await loginOTPStartRequest({ email }); }
    finally { setLoading(false); }
  }, []);

  const verifyLoginOTP = useCallback(async ({ email, otp }) => {
    setLoading(true);
    try {
      const { user } = await loginOTPVerifyRequest({ email, otp });
      persist(user);
      return user;
    } finally {
      setLoading(false);
    }
  }, [persist]);

  // ───── Forgot Password ─────
  const startForgot = useCallback(async ({ email }) => {
    setLoading(true);
    try { return await forgotStartRequest({ email }); }
    finally { setLoading(false); }
  }, []);

  const verifyForgotOTP = useCallback(async ({ email, otp }) => {
    setLoading(true);
    try { return await forgotVerifyRequest({ email, otp }); }
    finally { setLoading(false); }
  }, []);

  const resetPassword = useCallback(async ({ resetToken, newPassword }) => {
    setLoading(true);
    try { return await resetPasswordRequest({ resetToken, newPassword }); }
    finally { setLoading(false); }
  }, []);

  // ───── Logout + refresh ─────
  const logout = useCallback(async () => {
    try { await logoutRequest(); } catch {}
    try { localStorage.removeItem(USER_KEY); } catch {}
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await getMeRequest();
      setUser(user);
      try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
      return user;
    } catch {
      await logout();
      return null;
    }
  }, [logout]);

  // On mount — always verify with server via cookie
  useEffect(() => {
    refreshUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{
        user, loading, isAuthed: !!user, isAdmin: user?.role === "admin",
        login, verifyPasswordOTP, register, logout, refreshUser,
        startSignupOTP, verifySignupOTP,
        startLoginOTP, verifyLoginOTP,
        startForgot, verifyForgotOTP, resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
