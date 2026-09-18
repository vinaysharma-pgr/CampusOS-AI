import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanEye, Mail, Lock, User, Building2, ArrowUpRight, Loader2, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";

const ROLES = ["Student", "Faculty", "Admin", "IT"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", org: "SRMS CET Bareilly", password: "", confirm: "", role: "student" });
  const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = validate();
    setErrors(n);
    if (Object.keys(n).length) {
      showToast({ type: "error", title: "Check the form", description: "Some fields need attention" });
      return;
    }
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        organization: form.org,
        role: form.role,
      });
      showToast({ type: "success", title: "Welcome", description: `Account created for ${user.email}` });
      navigate("/", { replace: true });
    } catch (err) {
      showToast({
        type: "error",
        title: "Registration failed",
        description: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <div className="relative hidden overflow-hidden lg:flex" style={{ width: "50%", borderRight: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="relative flex w-full flex-col justify-between" style={{ padding: "3rem" }}>
          <Link to="/" className="flex items-center" style={{ gap: "10px" }}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(63,224,197,0.1)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}>
              <ScanEye size={16} strokeWidth={1.75} />
            </span>
            <span className="font-semibold text-text-primary" style={{ fontSize: "14.5px" }}>
              CampusOS<span style={{ color: "var(--color-primary)" }}>.ai</span>
            </span>
          </Link>

          <div>
            <h2 className="text-text-primary" style={{ fontSize: "2.5rem", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "20ch" }}>
              Join the <span style={{ backgroundImage: "linear-gradient(to bottom right, var(--color-primary), #7fedd8, var(--color-primary))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>smart campus</span>.
            </h2>
            <p className="text-text-secondary" style={{ marginTop: "1.5rem", maxWidth: "36ch", fontSize: "15px", lineHeight: 1.6 }}>
              One account for navigation, safety alerts, facility booking, and the AI assistant.
            </p>
            <ul className="flex flex-col" style={{ marginTop: "2.5rem", gap: "1rem" }}>
              {["Free forever for SRMS students", "Live campus map, updated daily", "AI assistant that knows your block"].map((t) => (
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

      <div className="flex flex-1 items-center justify-center" style={{ padding: "2rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ width: "100%", maxWidth: "28rem" }}>
          <h1 className="text-text-primary" style={{ fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Create your account
          </h1>
          <p className="text-text-secondary" style={{ marginTop: "10px", fontSize: "13.5px" }}>
            Already have one? <Link to="/login" className="text-primary hover:underline underline-offset-4">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col" style={{ marginTop: "2rem", gap: "1.25rem" }}>
            <Input icon={User} label="Full name" id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="Ada Lovelace" />
            <Input icon={Mail} label="Email" id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} placeholder="ada@srms.ac.in" />
            <Input icon={Building2} label="Organization" id="org" value={form.org} onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))} placeholder="SRMS CET" />

            <div>
              <label className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                Role
              </label>
              <div className="grid grid-cols-4" style={{ gap: "8px" }}>
                {ROLES.map((r) => {
                  const val = r.toLowerCase();
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: val }))}
                      className="rounded-lg font-medium"
                      style={{
                        paddingTop: "8px",
                        paddingBottom: "8px",
                        fontSize: "11.5px",
                        border: form.role === val ? "1px solid var(--color-primary)" : "1px solid var(--color-border-strong)",
                        backgroundColor: form.role === val ? "rgba(63,224,197,0.1)" : "transparent",
                        color: form.role === val ? "var(--color-primary)" : "var(--color-text-secondary)",
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
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
              {loading ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : <>Create account <ArrowUpRight size={14} /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function Input({ icon: Icon, label, id, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>
        {label}
      </label>
      <div className="flex items-center rounded-lg" style={{ border: error ? "1px solid rgba(240,85,77,0.6)" : "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)" }}>
        <Icon size={15} style={{ marginLeft: "14px", color: "var(--color-text-tertiary)" }} />
        <input id={id} {...props} className="w-full bg-transparent text-text-primary outline-none" style={{ padding: "12px 14px 12px 12px", fontSize: "13.5px" }} />
      </div>
      {error && <p style={{ marginTop: "6px", fontSize: "11.5px", color: "#f0554d" }}>{error}</p>}
    </div>
  );
}