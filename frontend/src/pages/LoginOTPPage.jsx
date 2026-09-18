import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ScanEye, Mail, ArrowUpRight, Loader2, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import OTPInput from "../components/auth/OTPInput.jsx";

export default function LoginOTPPage() {
  const navigate = useNavigate();
  const { startLoginOTP, verifyLoginOTP, loading } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useState(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  });

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast({ type: "error", title: "Enter a valid email" });
      return;
    }
    try {
      await startLoginOTP({ email });
      showToast({ type: "success", title: "Code sent", description: `Check ${email}` });
      setStep(2);
      setCooldown(60);
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      showToast({ type: "error", title: "Enter all 6 digits" });
      return;
    }
    try {
      const user = await verifyLoginOTP({ email, otp });
      showToast({ type: "success", title: "Welcome back", description: user.name });
      navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      showToast({ type: "error", title: "Verification failed", description: err.response?.data?.message || err.message });
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    try {
      await startLoginOTP({ email });
      showToast({ type: "success", title: "New code sent" });
      setCooldown(60);
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(63,224,197,0.1), transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-2xl p-8 lg:p-10"
        style={{ border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "0 24px 80px -12px rgba(0,0,0,0.4)" }}
      >
        <Link to="/" className="mb-8 flex items-center justify-center" style={{ gap: "10px" }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(63,224,197,0.1)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}>
            <ScanEye size={18} strokeWidth={1.75} />
          </span>
          <span className="font-semibold text-text-primary" style={{ fontSize: "15px" }}>
            CampusOS<span style={{ color: "var(--color-primary)" }}>.ai</span>
          </span>
        </Link>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h1 className="text-center text-text-primary" style={{ fontSize: "22px", fontWeight: 600 }}>Sign in with email</h1>
              <p className="text-center text-text-secondary" style={{ marginTop: "8px", fontSize: "13px" }}>
                We'll send you a one-time code. No password needed.
              </p>

              <form onSubmit={handleSendOTP} className="flex flex-col" style={{ marginTop: "2rem", gap: "1.25rem" }}>
                <div>
                  <label htmlFor="email" className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>Email</label>
                  <div className="flex items-center rounded-lg" style={{ border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)" }}>
                    <Mail size={15} style={{ marginLeft: "14px", color: "var(--color-text-tertiary)" }} />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@srms.ac.in"
                      className="w-full bg-transparent text-text-primary outline-none"
                      style={{ padding: "12px 14px 12px 12px", fontSize: "13.5px" }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-lg font-semibold disabled:opacity-60" style={{ height: "44px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13.5px" }}>
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : <>Send code <ArrowUpRight size={14} /></>}
                </button>
              </form>

              <p className="text-center" style={{ marginTop: "1.5rem", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                <Link to="/login" className="text-primary hover:underline underline-offset-4">Use password instead</Link>
                {" · "}
                <Link to="/register" className="text-primary hover:underline underline-offset-4">Create account</Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center" style={{ gap: "8px", fontSize: "12.5px", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                <ArrowLeft size={13} />
                Change email
              </button>

              <h1 className="text-center text-text-primary" style={{ fontSize: "22px", fontWeight: 600 }}>Enter your code</h1>
              <p className="text-center text-text-secondary" style={{ marginTop: "8px", fontSize: "13px" }}>
                We sent a 6-digit code to <span style={{ color: "var(--color-primary)" }}>{email}</span>. It may take up to 30 seconds to arrive.
              </p>

              <form onSubmit={handleVerify} className="flex flex-col" style={{ marginTop: "1.75rem", gap: "1.5rem" }}>
                <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />

                <button type="submit" disabled={loading || otp.length !== 6} className="inline-flex items-center justify-center rounded-lg font-semibold disabled:opacity-60" style={{ height: "44px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13.5px" }}>
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : <>Sign in <Check size={14} /></>}
                </button>

                <div className="text-center" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  Didn't get it?{" "}
                  {cooldown > 0 ? (
                    <span style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>Resend in {cooldown}s</span>
                  ) : (
                    <button type="button" onClick={resend} className="text-primary hover:underline underline-offset-4">Resend</button>
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
