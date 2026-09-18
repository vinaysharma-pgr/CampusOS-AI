// src/features/landing/components/CTASection.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "900px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

export default function CTASection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ paddingTop: "8rem", paddingBottom: "8rem" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 65%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center text-center"
        style={CONTAINER_STYLE}
      >
        <p
          className="font-mono text-primary"
          style={{
            fontSize: "10.5px",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
          }}
        >
          Get started
        </p>

        <h2
          className="text-text-primary"
          style={{
            marginTop: "1.5rem",
            fontSize: "clamp(2.25rem, 5vw, 4rem)",
            fontWeight: 600,
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
          }}
        >
          Bring your campus{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(to bottom right, var(--color-primary), #7fedd8, var(--color-primary))",
            }}
          >
            online
          </span>
          .
        </h2>

        <p
          className="text-text-secondary"
          style={{
            marginTop: "1.5rem",
            maxWidth: "32rem",
            fontSize: "15.5px",
            lineHeight: 1.6,
          }}
        >
          Create an account to explore the live campus map, check facility availability, and talk to the AI assistant.
        </p>

        <div
          className="flex flex-col sm:flex-row"
          style={{
            marginTop: "2.5rem",
            gap: "12px",
            width: "100%",
            maxWidth: "360px",
            justifyContent: "center",
          }}
        >
          <Link
            to="/signup/otp"
            className="group inline-flex items-center justify-center rounded-full font-semibold transition-all hover:opacity-90"
            style={{
              height: "48px",
              width: "100%",
              paddingLeft: "24px",
              paddingRight: "24px",
              gap: "8px",
              backgroundColor: "var(--color-text-primary)",
              color: "var(--color-background)",
              fontSize: "14px",
              letterSpacing: "-0.015em",
              boxSizing: "border-box",
            }}
          >
            Sign up
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full font-medium transition-all"
            style={{
              height: "48px",
              width: "100%",
              paddingLeft: "24px",
              paddingRight: "24px",
              border: "1px solid var(--color-border-strong)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              fontSize: "14px",
              letterSpacing: "-0.015em",
              boxSizing: "border-box",
            }}
          >
            Sign in
          </Link>
        </div>

        <p
          className="font-mono text-text-tertiary"
          style={{
            marginTop: "1.5rem",
            fontSize: "10.5px",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
          }}
        >
          Open to all SRMS students
        </p>
      </motion.div>
    </section>
  );
}