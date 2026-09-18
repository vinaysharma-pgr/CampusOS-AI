// src/pages/FeaturesPage.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Activity } from "lucide-react";
import ModulesBento from "../features/landing/components/ModulesBento";
import { useAuth } from "../contexts/AuthContext.jsx";

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1100px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

const STATS = [
  { label: "Modules shipped", value: "4" },
  { label: "Response", value: "0.4s" },
  { label: "Blocks mapped", value: "17" },
  { label: "Uptime", value: "99.99%" },
];

export default function FeaturesPage() {
  const { isAuthed } = useAuth();
  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          borderBottom: "1px solid var(--color-border)",
          paddingTop: "5rem",
          paddingBottom: "5rem",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(63,224,197,0.09), transparent 65%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.5,
            backgroundImage:
              "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 65% 55% at 50% 40%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 65% 55% at 50% 40%, black 20%, transparent 75%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-center"
          style={CONTAINER_STYLE}
        >
          <span
            className="inline-flex items-center rounded-full backdrop-blur-xl"
            style={{
              gap: "10px",
              padding: "6px 16px 6px 8px",
              border: "1px solid var(--color-border-strong)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <span
              className="flex items-center rounded-full"
              style={{
                height: "24px",
                paddingLeft: "10px",
                paddingRight: "10px",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span
                className="font-mono font-semibold"
                style={{
                  fontSize: "10px",
                  color: "var(--color-primary-fg)",
                  letterSpacing: "0.14em",
                }}
              >
                PLATFORM
              </span>
            </span>
            <span
              className="font-medium"
              style={{
                fontSize: "12.5px",
                color: "var(--color-text-secondary)",
              }}
            >
              Every module on the platform
            </span>
          </span>

          <h1
            className="text-text-primary"
            style={{
              marginTop: "1.5rem",
              fontSize: "clamp(2.5rem, 5.5vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
            }}
          >
            Everything your campus needs,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom right, var(--color-primary), #7fedd8, var(--color-primary))",
              }}
            >
              in one layer
            </span>
            .
          </h1>

          <p
            className="text-text-secondary"
            style={{
              marginTop: "1.5rem",
              maxWidth: "42rem",
              marginLeft: "auto",
              marginRight: "auto",
              fontSize: "16px",
              lineHeight: 1.6,
            }}
          >
            From AI assistance to live navigation to occupancy analytics — every module is designed to solve a real problem for SRMS students and staff.
          </p>

          {!isAuthed && (
            <div
              className="flex flex-col items-center justify-center sm:flex-row"
              style={{ marginTop: "2.5rem", gap: "12px" }}
            >
              <Link
                to="/signup/otp"
                className="group inline-flex items-center justify-center rounded-full font-semibold transition-all hover:opacity-90"
                style={{
                  height: "48px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  gap: "8px",
                  backgroundColor: "var(--color-text-primary)",
                  color: "var(--color-background)",
                  fontSize: "14px",
                  letterSpacing: "-0.015em",
                }}
              >
                Create an account
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <Link
                to="/facilities"
                className="inline-flex items-center justify-center rounded-full font-medium transition-all"
                style={{
                  height: "48px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  border: "1px solid var(--color-border-strong)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  fontSize: "14px",
                  letterSpacing: "-0.015em",
                }}
              >
                Explore facilities
              </Link>
            </div>
          )}
        </motion.div>
      </section>

      <ModulesBento />

      <section
        className="relative"
        style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "6rem",
          paddingBottom: "6rem",
        }}
      >
        <div style={CONTAINER_STYLE}>
          <div style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }}>
            <p
              className="font-mono text-primary"
              style={{
                fontSize: "10.5px",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              Why it matters
            </p>
            <h2
              className="text-text-primary"
              style={{
                marginTop: "1rem",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Universities don't need another dashboard. They need an operating system.
            </h2>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{ marginTop: "4rem", gap: "2.5rem" }}
          >
            <Pillar
              index="01"
              title="One coherent layer"
              body="Navigation, safety, facilities, and analytics share the same live data — so a fire alarm in Block C updates the map, the AI assistant, and the ops dashboard simultaneously."
            />
            <Pillar
              index="02"
              title="Grounded in your campus"
              body="Every building, room, bus, and staff member is indexed. Answers, ETAs, and alerts reference SRMS data — not a generic model's guess."
            />
            <Pillar
              index="03"
              title="Runs on the same primitives"
              body="Start with one department. Onboard new blocks without migrations. Everything runs on the same data model, so growth is linear."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Pillar({ index, title, body }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderTop: "1px solid var(--color-border)",
        paddingTop: "1.5rem",
      }}
    >
      <div className="flex items-center" style={{ gap: "12px" }}>
        <span
          className="font-mono text-primary"
          style={{
            fontSize: "10.5px",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
          }}
        >
          {index}
        </span>
        <Activity size={11} style={{ color: "var(--color-text-tertiary)" }} />
      </div>
      <h3
        className="text-text-primary"
        style={{
          marginTop: "1.5rem",
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>
      <p
        className="text-text-secondary"
        style={{ marginTop: "1rem", fontSize: "14.5px", lineHeight: 1.6 }}
      >
        {body}
      </p>
    </motion.div>
  );
}