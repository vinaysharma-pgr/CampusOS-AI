// src/components/ui/NewsletterForm.jsx
import { useState } from "react";
import { Mail, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Enter an email to subscribe.");
    if (!EMAIL_RE.test(email.trim()))
      return setError("That doesn't look like a valid email.");

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      showToast({
        type: "success",
        title: "Subscribed",
        description: `${email} will receive project updates.`,
      });
      setEmail("");
      setTimeout(() => setStatus("idle"), 2400);
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label
        htmlFor="newsletter"
        className="font-mono text-text-tertiary"
        style={{
          display: "block",
          marginBottom: "10px",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
        }}
      >
        Project Updates
      </label>

      <div
        className="flex items-center rounded-lg transition-colors"
        style={{
          maxWidth: "22rem",
          padding: "4px",
          gap: "4px",
          border: error
            ? "1px solid rgba(240,85,77,0.5)"
            : "1px solid rgba(255,255,255,0.13)",
          backgroundColor: "#0e1014",
        }}
      >
        <Mail
          size={14}
          style={{ marginLeft: "12px", color: "#5b6470", flexShrink: 0 }}
        />
        <input
          id="newsletter"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          disabled={status !== "idle"}
          placeholder="you@srms.ac.in"
          className="flex-1 bg-transparent text-text-primary placeholder-text-tertiary outline-none disabled:opacity-60"
          style={{
            padding: "8px 4px",
            fontSize: "12.5px",
            minWidth: 0,
          }}
          aria-invalid={!!error}
        />
        <button
          type="submit"
          disabled={status !== "idle"}
          className="flex items-center justify-center rounded-md font-medium transition-all hover:opacity-90 disabled:opacity-70"
          style={{
            height: "30px",
            paddingLeft: "12px",
            paddingRight: "12px",
            gap: "6px",
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-fg)",
            fontSize: "11.5px",
            letterSpacing: "-0.005em",
            flexShrink: 0,
          }}
        >
          {status === "loading" && <Loader2 size={11} className="animate-spin" />}
          {status === "success" && <CheckCircle2 size={11} />}
          {status === "idle" && <ArrowRight size={11} />}
          <span>
            {status === "idle"
              ? "Subscribe"
              : status === "loading"
              ? "Sending…"
              : "Done"}
          </span>
        </button>
      </div>
      {error && (
        <p style={{ marginTop: "8px", fontSize: "11.5px", color: "#f0554d" }}>
          {error}
        </p>
      )}
    </form>
  );
}