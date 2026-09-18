// src/features/landing/components/TrustBar.jsx
import { motion } from "framer-motion";

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

const HIGHLIGHTS = [
  "Built for SRMS CET Bareilly",
  "Live occupancy data",
  "AI-powered assistant",
  "Emergency-ready",
];

export default function TrustBar() {
  return (
    <section
      className="relative"
      style={{
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface-raised)",
      }}
    >
      <div
        style={{
          ...CONTAINER_STYLE,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          paddingTop: "2.5rem",
          paddingBottom: "2.5rem",
        }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-mono text-text-tertiary"
          style={{
            fontSize: "10.5px",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
          }}
        >
          A college mini-project
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center"
          style={{ columnGap: "2.5rem", rowGap: "1rem" }}
        >
          {HIGHLIGHTS.map((e) => (
            <span
              key={e}
              className="font-semibold text-text-secondary"
              style={{ fontSize: "14px", letterSpacing: "-0.01em" }}
            >
              {e}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
