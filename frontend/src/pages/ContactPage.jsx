// src/pages/ContactPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Loader2, Building2, Users, MessageSquare } from "lucide-react";
import Button from "../components/ui/Button";
import { useToast } from "../contexts/ToastContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL = { name: "", email: "", org: "", role: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const update = (f) => (e) => {
    setForm((s) => ({ ...s, [f]: e.target.value }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: "" }));
  };

  const validate = () => {
    const n = {};
    if (!form.name.trim()) n.name = "Name is required.";
    if (!form.email.trim()) n.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim())) n.email = "Enter a valid email.";
    if (!form.message.trim()) n.message = "Tell us a bit about your needs.";
    else if (form.message.trim().length < 10) n.message = "Message must be at least 10 characters.";
    return n;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = validate();
    setErrors(n);
    if (Object.keys(n).length) {
      showToast({ type: "error", title: "Check the form", description: "Some fields need attention." });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm(INITIAL);
      showToast({ type: "success", title: "Message sent", description: "Our team will reach out within 24 hours." });
    }, 1100);
  };

  return (
    <section className="relative mx-auto w-full max-w-[1440px] px-6 lg:px-10 py-24 lg:py-32">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1.5 backdrop-blur-md">
            <Mail size={11} className="text-primary" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-primary">Get in Touch</span>
          </span>
          <h1 className="mt-6 text-h1 font-semibold tracking-tight text-text-primary lg:text-[3rem]">
            Let's build the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-teal-300">AI Campus</span>{" "}
            together
          </h1>
          <p className="mt-6 text-body-lg text-text-secondary max-w-lg">
            Whether you're a university IT lead, a facilities director, or just curious — we'd love to show you what CampusOS AI can do.
          </p>

          <div className="mt-10 space-y-5">
            <Info icon={Building2} label="For Universities" value="Campus-wide deployment & onboarding" />
            <Info icon={Users} label="For Integrators" value="Partnership & reseller programs" />
            <Info icon={MessageSquare} label="For Everyone" value="hello@campusos.ai · Mon–Fri, 9am–6pm IST" />
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit} noValidate
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-border bg-surface p-7 lg:p-9"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Name" id="name" value={form.name} onChange={update("name")} error={errors.name} placeholder="Ada Lovelace" />
            <Field label="Email" id="email" type="email" value={form.email} onChange={update("email")} error={errors.email} placeholder="ada@university.edu" />
            <Field label="Organization" id="org" value={form.org} onChange={update("org")} placeholder="University / Company" />
            <Field label="Role" id="role" value={form.role} onChange={update("role")} placeholder="CTO, Dean, etc." />
          </div>
          <div className="mt-5">
            <Field label="Message" id="message" as="textarea" rows={5} value={form.message} onChange={update("message")} error={errors.message}
              placeholder="Tell us about your campus and what you'd like to solve…" />
          </div>

          <Button type="submit" variant="primary" size="lg" className="mt-7 w-full justify-center" disabled={submitting}>
            {submitting ? (<><Loader2 size={16} className="animate-spin" />Sending…</>) : (<><Send size={16} />Send Message</>)}
          </Button>

          <p className="mt-4 text-center text-[11.5px] text-text-tertiary">
            We respond within one business day. No spam, ever.
          </p>
        </motion.form>
      </div>
    </section>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/25">
        <Icon size={17} strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-tertiary">{label}</p>
        <p className="mt-1 text-[13.5px] text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, id, as = "input", error, className = "", ...props }) {
  const Comp = as;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">{label}</label>
      <Comp id={id} {...props}
        className={`w-full rounded-lg border bg-surface-raised px-4 py-3 text-[13.5px] text-text-primary placeholder-text-tertiary outline-none transition-colors ${
          error ? "border-danger/60 focus:border-danger" : "border-border-strong focus:border-primary/60"
        }`}
        aria-invalid={!!error}
      />
      {error && <p className="mt-1.5 text-[11.5px] text-danger">{error}</p>}
    </div>
  );
}