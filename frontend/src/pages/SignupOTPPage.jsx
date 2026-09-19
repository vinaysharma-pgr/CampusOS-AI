import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ScanEye, Mail, Lock, User, Building2, ArrowUpRight, Loader2, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import OTPInput from "../components/auth/OTPInput.jsx";

const ROLES = ["student", "faculty", "admin", "it"];

export default function SignupOTPPage() {
  const navigate = useNavigate();
  const { startSignupOTP, verifySignupOTP, loading } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [form, setForm] = useState({ name: "", email: "", org: "SRMS CET Bareilly", password: "", confirm: "", role: "student", department: "CS", semester: "5", section: "CS1" });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const validate = () => {
    const n = {};
    if (!form.name.trim()) n.name = "Name required";
    if (!form.email.trim()) n.email = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) n.email = "Invalid email";
    if (!form.password) n.password = "Password required";
    else if (form.password.length < 8) n.password = "Min 8 chars";
    if (form.confirm !== form.password) n.confirm = "Passwords don't match";
    return n;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const n = validate();
    setErrors(n);
    if (Object.keys(n).length) {
      showToast({ type: "error", title: "Check the form" });
      return;
    }
    try {
      await startSignupOTP({ name: form.name, email: form.email, password: form.password, organization: form.org, role: form.role, department: form.department, semester: form.semester, section: form.section });
      showToast({ type: "success", title: "Code sent", description: `Check ${form.email} for the 6-digit code` });
      setStep(2);
      setCooldown(60);
    } catch (err) {
      showToast({ type: "error", title: "Failed to send code", description: err.response?.data?.message || err.message });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      showToast({ type: "error", title: "Enter all 6 digits" });
      return;
    }
    try {
      const user = await verifySignupOTP({ email: form.email, otp });
      showToast({ type: "success", title: "Welcome!", description: `Account created for ${user.email}` });
      navigate("/", { replace: true });
    } catch (err) {
      showToast({ type: "error", title: "Verification failed", description: err.response?.data?.message || err.message });
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    try {
      await startSignupOTP({ name: form.name, email: form.email, password: form.password, organization: form.org, role: form.role, department: form.department, semester: form.semester, section: form.section });
      showToast({ type: "success", title: "New code sent" });
      setCooldown(60);
    } catch (err) {
      showToast({ type: "error", title: "Failed to resend", description: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      {/* Left panel */}
      <div className="relative hidden overflow-hidden lg:flex" style={{ width: "45%", borderRight: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="relative flex w-full flex-col justify-between" style={{ padding: "3rem" }}>
          <Link to="/" className="flex items-center" style={{ gap: "10px" }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}>
              <ScanEye size={17} strokeWidth={1.75} />
            </span>
            <span className="font-semibold text-text-primary" style={{ fontSize: "15px" }}>
              CampusOS<span style={{ color: "var(--color-primary)" }}>.ai</span>
            </span>
          </Link>

          <div>
            <h2 className="text-text-primary" style={{ fontSize: "2.5rem", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "20ch" }}>
              Join the <span style={{ backgroundImage: "linear-gradient(to bottom right, var(--color-primary), #7fedd8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>smart campus</span>.
            </h2>
            <p className="text-text-secondary" style={{ marginTop: "1.5rem", maxWidth: "36ch", fontSize: "15px", lineHeight: 1.6 }}>
              We'll send a 6-digit code to your email to verify it's really you.
            </p>
            <ul className="flex flex-col" style={{ marginTop: "2.5rem", gap: "1rem" }}>
              {["Free forever for SRMS students", "Verified email = secure account", "No spam, ever"].map((t) => (
                <li key={t} className="flex items-center text-text-secondary" style={{ gap: "12px", fontSize: "13.5px" }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)" }}>
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <p className="font-mono text-text-tertiary" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            © {new Date().getFullYear()} CampusOS.ai · SRMS CET
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center" style={{ padding: "2rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ width: "100%", maxWidth: "28rem" }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h1 className="text-text-primary" style={{ fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>Create your account</h1>
                <p className="text-text-secondary" style={{ marginTop: "10px", fontSize: "13.5px" }}>
                  Already have one? <Link to="/login" className="text-primary hover:underline underline-offset-4">Sign in</Link>
                </p>

                <form onSubmit={handleSendOTP} className="flex flex-col" style={{ marginTop: "2rem", gap: "1.25rem" }}>
                  <Input icon={User} label="Full name" id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="Ada Lovelace" />
                  <Input icon={Mail} label="Email" id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} placeholder="you@srms.ac.in" />
                  <Input icon={Building2} label="Organization" id="org" value={form.org} onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))} placeholder="SRMS CET" />

                  <div>
                    <label className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>Role</label>
                    <div className="grid grid-cols-4" style={{ gap: "8px" }}>
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, role: r }))}
                          className="rounded-lg font-medium capitalize"
                          style={{
                            paddingTop: "8px", paddingBottom: "8px", fontSize: "11.5px",
                            border: form.role === r ? "1px solid var(--color-primary)" : "1px solid var(--color-border-strong)",
                            backgroundColor: form.role === r ? "rgba(63,224,197,0.1)" : "transparent",
                            color: form.role === r ? "var(--color-primary)" : "var(--color-text-secondary)",
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3" style={{ gap: "0.75rem" }}>
              <div>
                <label className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>Dept</label>
                <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} style={{ width: "100%", padding: "12px", fontSize: "13.5px", borderRadius: "8px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", outline: "none" }}>
                  <option value="CS">CS</option><option value="IT">IT</option><option value="AIML">AIML</option><option value="ECE">ECE</option><option value="ME">ME</option><option value="CE">CE</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>Sem</label>
                <select value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))} style={{ width: "100%", padding: "12px", fontSize: "13.5px", borderRadius: "8px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", outline: "none" }}>
                  <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>Section</label>
                <select value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} style={{ width: "100%", padding: "12px", fontSize: "13.5px", borderRadius: "8px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", outline: "none" }}>
                  <option value="CS1">CS1</option><option value="CS2">CS2</option>
                </select>
              </div>
            </div>

            <Input icon={Lock} label="Password" id="password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} placeholder="At least 8 characters" />
                  <Input icon={Lock} label="Confirm password" id="confirm" type="password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} error={errors.confirm} placeholder="Repeat password" />

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ height: "44px", marginTop: "0.5rem", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13.5px" }}
                  >
                    {loading ? <><Loader2 size={15} className="animate-spin" /> Sending code…</> : <>Continue <ArrowUpRight size={14} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <button type="button" onClick={() => setStep(1)} className="inline-flex items-center" style={{ gap: "8px", fontSize: "12.5px", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                  <ArrowLeft size={13} />
                  Edit details
                </button>

                <h1 className="text-text-primary" style={{ fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>Check your email</h1>
                <p className="text-text-secondary" style={{ marginTop: "10px", fontSize: "13.5px" }}>
                  We sent a 6-digit code to <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>{form.email}</span>. It may take up to 30 seconds to arrive.
                </p>

                <form onSubmit={handleVerifyOTP} className="flex flex-col" style={{ marginTop: "2rem", gap: "1.5rem" }}>
                  <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ height: "44px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13.5px" }}
                  >
                    {loading ? <><Loader2 size={15} className="animate-spin" /> Verifying…</> : <>Verify email <Check size={14} /></>}
                  </button>

                  <div className="text-center" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                    Didn't receive it?{" "}
                    {cooldown > 0 ? (
                      <span style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>Resend in {cooldown}s</span>
                    ) : (
                      <button type="button" onClick={resend} className="text-primary hover:underline underline-offset-4">Resend code</button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function Input({ icon: Icon, label, id, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>{label}</label>
      <div className="flex items-center rounded-lg" style={{ border: error ? "1px solid rgba(240,85,77,0.6)" : "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)" }}>
        <Icon size={15} style={{ marginLeft: "14px", color: "var(--color-text-tertiary)" }} />
        <input id={id} {...props} className="w-full bg-transparent text-text-primary outline-none" style={{ padding: "12px 14px 12px 12px", fontSize: "13.5px" }} />
      </div>
      {error && <p style={{ marginTop: "6px", fontSize: "11.5px", color: "#f0554d" }}>{error}</p>}
    </div>
  );
}
