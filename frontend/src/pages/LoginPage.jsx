// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ScanEye, Mail, Lock, ArrowUpRight, Loader2, ArrowLeft, Check, KeyRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import OTPInput from "../components/auth/OTPInput.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyPasswordOTP, loading } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1 = email+password, 2 = OTP
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer for resend (only used in step 2)
  useState(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  });

  const redirectTo = location.state?.from || "/";

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      showToast({ type: "error", title: "Missing fields", description: "Enter email and password." });
      return;
    }
    try {
      const result = await login(form);
      // Dev bypass: login() returns the user object directly
      if (result) {
        showToast({ type: "success", title: "Welcome back", description: `Signed in as ${result.name}` });
        navigate(redirectTo, { replace: true });
        return;
      }
      // Normal flow: login() threw? No — check below.
    } catch (err) {
      const status = err.response?.status;
      const apiErr = err.response?.data;
      // If backend returns requiresOTP wrapped in an error? No — it returns 200 with requiresOTP.
      // This catch only fires on real errors.
      showToast({
        type: "error",
        title: "Login failed",
        description: apiErr?.message || err.message,
      });
    }
  };

  // Since our backend returns { requiresOTP: true } as a SUCCESS (200), we can't rely on throw.
  // So we wrap login() to inspect the response shape.
  const submitPassword = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      showToast({ type: "error", title: "Missing fields", description: "Enter email and password." });
      return;
    }
    try {
      const result = await login(form, { returnRaw: true });
      if (result?.requiresOTP) {
        showToast({ type: "info", title: "Code sent", description: `Check ${result.email} for your 6-digit code.` });
        setStep(2);
        setCooldown(60);
      } else if (result?.user) {
        // Dev bypass path
        showToast({ type: "success", title: "Welcome back", description: `Signed in as ${result.user.name}` });
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      showToast({
        type: "error",
        title: "Login failed",
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const submitOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      showToast({ type: "error", title: "Enter all 6 digits" });
      return;
    }
    try {
      const user = await verifyPasswordOTP({ email: form.email, otp });
      showToast({ type: "success", title: "Welcome back", description: `Signed in as ${user.name}` });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      showToast({
        type: "error",
        title: "Verification failed",
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    try {
      const result = await login(form, { returnRaw: true });
      if (result?.requiresOTP) {
        showToast({ type: "success", title: "New code sent" });
        setCooldown(60);
      }
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(63,224,197,0.1), transparent 70%)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-2xl p-8 lg:p-10"
        style={{
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          boxShadow: "0 24px 80px -12px rgba(0,0,0,0.4)",
        }}
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              backgroundColor: "rgba(63,224,197,0.1)",
              color: "var(--color-primary)",
              border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            <ScanEye size={18} strokeWidth={1.75} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            CampusOS<span style={{ color: "var(--color-primary)" }}>.ai</span>
          </span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center justify-center" style={{ gap: "8px", marginBottom: "1.5rem" }}>
          {[1, 2].map((n) => (
            <div
              key={n}
              style={{
                width: n === step ? "24px" : "8px",
                height: "4px",
                borderRadius: "9999px",
                backgroundColor: n <= step ? "var(--color-primary)" : "var(--color-border-strong)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-center text-[22px] font-semibold tracking-tight text-text-primary">
                Welcome back
              </h1>
              <p className="mt-2 text-center text-[13px] text-text-secondary">
                Sign in with email and password. We'll send a code to confirm.
              </p>

              <form onSubmit={submitPassword} className="mt-8 flex flex-col gap-4">
                <Field
                  icon={Mail}
                  label="Email"
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@srms.ac.in"
                />
                <Field
                  icon={Lock}
                  label="Password"
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                />

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-[11.5px] text-text-tertiary hover:text-primary">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{
                    height: "44px",
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-fg)",
                    fontSize: "13.5px",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Verifying…
                    </>
                  ) : (
                    <>
                      Continue <ArrowUpRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center" style={{ marginTop: "1.5rem", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                Don't have an account?{" "}
                <Link to="/signup/otp" className="text-primary hover:underline underline-offset-4">
                  Sign up
                </Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center"
                style={{ gap: "8px", fontSize: "12.5px", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}
              >
                <ArrowLeft size={13} />
                Back
              </button>

              <div className="flex flex-col items-center text-center">
                <span
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    height: "48px",
                    width: "48px",
                    backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                    color: "var(--color-primary)",
                    border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  }}
                >
                  <KeyRound size={20} />
                </span>
                <h1 className="mt-4 text-[22px] font-semibold tracking-tight text-text-primary">
                  Enter verification code
                </h1>
                <p className="mt-2 text-[13px] text-text-secondary" style={{ maxWidth: "32ch" }}>
                  We sent a 6-digit code to <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>{form.email}</span>
                </p>
              </div>

              <form onSubmit={submitOTP} className="mt-7 flex flex-col gap-6">
                <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{
                    height: "44px",
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-fg)",
                    fontSize: "13.5px",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Signing in…
                    </>
                  ) : (
                    <>
                      Sign in <Check size={14} />
                    </>
                  )}
                </button>

                <div className="text-center" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  Didn't get it?{" "}
                  {cooldown > 0 ? (
                    <span style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      Resend in {cooldown}s
                    </span>
                  ) : (
                    <button type="button" onClick={resend} className="text-primary hover:underline underline-offset-4">
                      Resend code
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, id, ...props }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-text-tertiary"
        style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}
      >
        {label}
      </label>
      <div className="flex items-center rounded-lg" style={{ border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)" }}>
        <Icon size={15} style={{ marginLeft: "14px", color: "var(--color-text-tertiary)" }} />
        <input
          id={id}
          {...props}
          className="w-full bg-transparent text-text-primary outline-none"
          style={{ padding: "12px 14px 12px 12px", fontSize: "13.5px" }}
        />
      </div>
    </div>
  );
}
