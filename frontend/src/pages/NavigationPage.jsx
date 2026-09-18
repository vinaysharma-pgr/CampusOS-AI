// src/pages/NavigationPage.jsx
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import CampusPreviewSection from "../features/landing/components/CampusPreviewSection";

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1100px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

export default function NavigationPage() {
  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
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
              "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
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
              border: "1px solid rgba(255,255,255,0.13)",
              backgroundColor: "rgba(14,16,20,0.6)",
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
                style={{ fontSize: "10px", color: "var(--color-primary-fg)", letterSpacing: "0.14em" }}
              >
                LIVE
              </span>
            </span>
            <span className="font-medium text-text-secondary" style={{ fontSize: "12.5px" }}>
              Campus Navigation
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
            A living{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom right, var(--color-primary), #7fedd8, var(--color-primary))",
              }}
            >
              digital twin
            </span>{" "}
            of your campus.
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
            Navigate floor by floor, room by room. Real-time occupancy, accessibility routes, and instant wayfinding.
          </p>

          <div
            className="flex flex-col items-center justify-center sm:flex-row"
            style={{ marginTop: "2.5rem", gap: "12px" }}
          >
            <Link
              to="/facilities"
              className="group inline-flex items-center justify-center rounded-full font-semibold transition-all hover:opacity-90"
              style={{
                height: "48px",
                paddingLeft: "24px",
                paddingRight: "24px",
                gap: "8px",
                backgroundColor: "#f3f5f8",
                color: "#08090b",
                fontSize: "14px",
                letterSpacing: "-0.015em",
              }}
            >
              Explore the map
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center justify-center rounded-full font-medium transition-all hover:bg-white/[0.06]"
              style={{
                height: "48px",
                paddingLeft: "24px",
                paddingRight: "24px",
                border: "1px solid rgba(255,255,255,0.14)",
                backgroundColor: "rgba(14,16,20,0.6)",
                color: "#f3f5f8",
                fontSize: "14px",
                letterSpacing: "-0.015em",
              }}
            >
              See all features
            </Link>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-4"
            style={{
              marginTop: "4rem",
              paddingTop: "2.5rem",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              gap: "2rem 0",
            }}
          >
            {[
              ["17", "buildings mapped"],
              ["180+", "rooms indexed"],
              ["0.4s", "wayfinding time"],
              ["24/7", "live updates"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col items-center">
                <p
                  className="font-mono font-semibold text-text-primary"
                  style={{ fontSize: "26px", letterSpacing: "-0.02em" }}
                >
                  {value}
                </p>
                <p
                  className="font-mono text-text-tertiary"
                  style={{
                    marginTop: "4px",
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <CampusPreviewSection />

      <section
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: "6rem",
          paddingBottom: "6rem",
        }}
      >
        <div style={CONTAINER_STYLE}>
          <div
            className="text-center"
            style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }}
          >
            <p
              className="font-mono text-primary"
              style={{
                fontSize: "10.5px",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              How it works
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
              Three steps from gate to seat.
            </h2>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{ marginTop: "4rem", gap: "1.5rem" }}
          >
            {[
              { index: "01", title: "Search anything", body: "Type a room, department, professor, or event. The AI understands natural language — no need to know building codes." },
              { index: "02", title: "Get the exact route", body: "Floor-by-floor directions with accessible alternatives. Real-time occupancy means you can pick the quietest path." },
              { index: "03", title: "Arrive with context", body: "See who's in the room, what events are scheduled, and how to reach the nearest washroom — before you even step inside." },
            ].map((step) => (
              <motion.div
                key={step.index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: "1.75rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backgroundColor: "#0e1014",
                }}
              >
                <p
                  className="font-mono text-primary"
                  style={{
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                  }}
                >
                  {step.index}
                </p>
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
                  {step.title}
                </h3>
                <p
                  className="text-text-secondary"
                  style={{ marginTop: "0.75rem", fontSize: "14px", lineHeight: 1.6 }}
                >
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}