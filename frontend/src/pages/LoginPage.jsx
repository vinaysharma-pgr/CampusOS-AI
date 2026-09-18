import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanEye, Mail, Lock, ArrowUpRight, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      showToast({ type: "error", title: "Missing fields", description: "Enter email and password." });
      return;
    }
    try {
      const user = await login(form);
      showToast({ type: "success", title: "Welcome back", description: `Signed in as ${user.name}` });
      const from = location.state?.from;
      navigate(from || "/", { replace: true });
    } catch (err) {
      showToast({
        type: "error",
        title: "Login failed",
        description: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(63,224,197,0.1), transparent 70%)",
        }}
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

        <h1 className="text-center text-[22px] font-semibold tracking-tight text-text-primary">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-[13px] text-text-secondary">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Field icon={Mail} label="Email" id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@srms.ac.in" />
          <Field icon={Lock} label="Password" id="password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />

          <div className="flex justify-end">
            <a href="#" className="text-[11.5px] text-text-tertiary hover:text-primary">
              Forgot password?
            </a>
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
            {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : <>Sign in <ArrowUpRight size={14} /></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-text-tertiary" style={{ display: "block", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em" }}>
        {label}
      </label>
      <div className="flex items-center rounded-lg" style={{ border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)" }}>
        <Icon size={15} style={{ marginLeft: "14px", color: "var(--color-text-tertiary)" }} />
        <input id={id} {...props} className="w-full bg-transparent text-text-primary outline-none" style={{ padding: "12px 14px 12px 12px", fontSize: "13.5px" }} />
      </div>
    </div>
  );
}