// src/components/feedback/ComingSoon.jsx
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ComingSoon({ title, description, backTo = "/student", backLabel = "Dashboard" }) {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "70vh", padding: "2rem" }}>
      <div
        className="flex items-center justify-center"
        style={{
          height: "48px",
          width: "48px",
          borderRadius: "12px",
          backgroundColor: "rgba(63,224,197,0.1)",
          color: "var(--color-primary)",
          border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
        }}
      >
        <Construction size={20} strokeWidth={1.75} />
      </div>

      <h2
        className="text-text-primary"
        style={{
          marginTop: "1.25rem",
          fontSize: "18px",
          fontWeight: 600,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      <p
        className="text-text-secondary"
        style={{
          marginTop: "8px",
          maxWidth: "42ch",
          fontSize: "13.5px",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

      <div
        className="font-mono"
        style={{
          marginTop: "1.5rem",
          padding: "6px 12px",
          borderRadius: "9999px",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          backgroundColor: "var(--color-surface-raised)",
          color: "var(--color-text-tertiary)",
          border: "1px solid var(--color-border)",
        }}
      >
        In development
      </div>

      <Link
        to={backTo}
        className="inline-flex items-center"
        style={{
          marginTop: "2rem",
          gap: "8px",
          fontSize: "13px",
          color: "var(--color-text-secondary)",
        }}
      >
        <ArrowLeft size={13} />
        Back to {backLabel}
      </Link>
    </div>
  );
}
