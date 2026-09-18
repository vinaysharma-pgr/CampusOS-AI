import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ScanEye, Mail, ArrowUpRight, Loader2, ArrowLeft, Check, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import OTPInput from "../components/auth/OTPInput.jsx";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { startForgot, verifyForgotOTP, resetPassword, loading } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useState(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  });

  const sendCode = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast({ type: "error", title: "Enter a valid email" });
      return;
    }
    try {
      await startForgot({ email });
      showToast({ type: "success", title: "Reset code sent", description: `Check ${email}` });
      setStep(2);
      setCooldown(60);
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      showToast({ type: "error", title: "Enter all 6 digits" });
      return;
    }
    try {
      const { resetToken } = await verifyForgotOTP({ email, otp });
      setResetToken(resetToken);
      setStep(3);
      showToast({ type: "success", title: "Code verified" });
    } catch (err) {
      showToast({ type: "error", title: "Verification failed", description: err.response?.data?.message || err.message });
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast({ type: "error", title: "Password must be 8+ characters" });
      return;
    }
    if (newPassword !== confirm) {
      showToast({ type: "error", title: "Passwords don't match" });
      return;
    }
    try {
      await resetPassword({ resetToken, newPassword });
      showToast({ type: "success", title: "Password updated", description: "Sign in with your new password" });
      navigate("/login", { replace: true });
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(63,224,197,0.1), transparent 70%)" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative w-full max-w-md rounded-2xl p-8 lg:p-10" style={{ border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "0 24px 80px -12px rgba(0,0,0,0.4)" }}>
        <Link to="/" className="mb-8 flex items-center justify-center" style={{ gap: "10px" }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(63,224,197,0.1)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}>
            <ScanEye size={18} strokeWidth={1.75} />
          </span>
          <span className="font-semibold text-text-primary" style={{ fontSize: "15px" }}>
            CampusOS<span style={{ color: "var(--color-primary)" }}>.ai</span>
          </span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center justify-center" style={{ gap: "8px", marginBottom: "1.5rem" }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ width: n === step ? "24px" : "8px", height: "4px", borderRadius: "9999px", backgroundColor: n <= step ? "var(--color-primary)" : "var(--color-border-strong)", transition: "all 0.3s" }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h1 className="text-center text-text-primary" style={{ fontSize: "22px", fontWeight: 600 }}>Forgot your password?</h1>
              <p className="text-center text-text-secondary" style={{ marginTop: "8px", fontSize: "13px" }}>
                Enter your email — we'll send a code to reset it.
              </p>

              <form onSubmit={sendCode} className="flex flex-col" style={{ marginTop: "2rem", gap: "1.25rem" }}>
                <div>
                  <label htmlFor="email" className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>Email</label>
                  <div className="flex items-center rounded-lg" style={{ border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)" }}>
                    <Mail size={15} style={{ marginLeft: "14px", color: "var(--color-text-tertiary)" }} />
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@srms.ac.in" className="w-full bg-transparent text-text-primary outline-none" style={{ padding: "12px 14px 12px 12px", fontSize: "13.5px" }} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-lg font-semibold disabled:opacity-60" style={{ height: "44px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13.5px" }}>
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : <>Send reset code <ArrowUpRight size={14} /></>}
                </button>
              </form>

              <p className="text-center" style={{ marginTop: "1.5rem", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                Remembered it? <Link to="/login" className="text-primary hover:underline underline-offset-4">Sign in</Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center" style={{ gap: "8px", fontSize: "12.5px", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                <ArrowLeft size={13} />
                Change email
              </button>

              <h1 className="text-center text-text-primary" style={{ fontSize: "22px", fontWeight: 600 }}>Check your email</h1>
              <p className="text-center text-text-secondary" style={{ marginTop: "8px", fontSize: "13px" }}>
                Enter the 6-digit code sent to <span style={{ color: "var(--color-primary)" }}>{email}</span>. It may take up to 30 seconds to arrive.
              </p>

              <form onSubmit={verifyOtp} className="flex flex-col" style={{ marginTop: "1.75rem", gap: "1.5rem" }}>
                <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />
                <button type="submit" disabled={loading || otp.length !== 6} className="inline-flex items-center justify-center rounded-lg font-semibold disabled:opacity-60" style={{ height: "44px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13.5px" }}>
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Verifying…</> : <>Continue <ArrowUpRight size={14} /></>}
                </button>
                <div className="text-center" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  Didn't get it?{" "}
                  {cooldown > 0 ? (
                    <span style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>Resend in {cooldown}s</span>
                  ) : (
                    <button type="button" onClick={(e) => { e.preventDefault(); sendCode(e); }} className="text-primary hover:underline underline-offset-4">Resend</button>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <h1 className="text-center text-text-primary" style={{ fontSize: "22px", fontWeight: 600 }}>Set a new password</h1>
              <p className="text-center text-text-secondary" style={{ marginTop: "8px", fontSize: "13px" }}>
                Choose something you'll remember.
              </p>

              <form onSubmit={updatePassword} className="flex flex-col" style={{ marginTop: "2rem", gap: "1.25rem" }}>
                <div>
                  <label className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>New password</label>
                  <div className="flex items-center rounded-lg" style={{ border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)" }}>
                    <Lock size={15} style={{ marginLeft: "14px", color: "var(--color-text-tertiary)" }} />
                    <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" className="w-full bg-transparent text-text-primary outline-none" style={{ padding: "12px 14px 12px 12px", fontSize: "13.5px" }} />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>Confirm password</label>
                  <div className="flex items-center rounded-lg" style={{ border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)" }}>
                    <Lock size={15} style={{ marginLeft: "14px", color: "var(--color-text-tertiary)" }} />
                    <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" className="w-full bg-transparent text-text-primary outline-none" style={{ padding: "12px 14px 12px 12px", fontSize: "13.5px" }} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-lg font-semibold disabled:opacity-60" style={{ height: "44px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13.5px" }}>
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : <>Update password <Check size={14} /></>}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
