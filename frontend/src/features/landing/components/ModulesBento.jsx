// src/features/landing/components/ModulesBento.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, MapPinned, ShieldAlert, BarChart3, ArrowUpRight } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

const CARD_STYLE = {
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface)",
};

export default function ModulesBento() {
  return (
    <section style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div style={CONTAINER_STYLE}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between"
          style={{ marginBottom: "3.5rem" }}
        >
          <div style={{ maxWidth: "36rem" }}>
            <p
              className="font-mono text-primary"
              style={{
                fontSize: "10.5px",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              The platform
            </p>
            <h2
              className="text-text-primary"
              style={{
                marginTop: "1rem",
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Four systems.
              <br />
              One coherent layer.
            </h2>
          </div>
          <p
            className="text-text-secondary"
            style={{ maxWidth: "28rem", fontSize: "15px", lineHeight: 1.6 }}
          >
            Each module solves a real problem — navigation, safety, operations, or intelligence. Together, they run the campus.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-4 md:grid-cols-6"
        >
          {/* Tile 1 — AI (large) */}
          <motion.div variants={item} className="md:col-span-4">
            <Link
              to="/ai"
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl transition-all"
              style={{
                ...CARD_STYLE,
                minHeight: "340px",
                padding: "2rem",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  opacity: 0.4,
                  background:
                    "radial-gradient(ellipse 70% 60% at 80% 20%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 60%)",
                }}
              />
              <div className="relative">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    height: "44px",
                    width: "44px",
                    backgroundColor: "rgba(63,224,197,0.1)",
                    color: "var(--color-primary)",
                    border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
                  }}
                >
                  <Bot size={20} strokeWidth={1.75} />
                </div>
                <p
                  className="font-mono"
                  style={{
                    marginTop: "2rem",
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  Module 01
                </p>
                <h3
                  className="text-text-primary"
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "clamp(1.5rem, 2.2vw, 2rem)",
                    fontWeight: 600,
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    maxWidth: "24rem",
                  }}
                >
                  An AI that actually knows your campus
                </h3>
                <p
                  className="text-text-secondary"
                  style={{
                    marginTop: "1.25rem",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    maxWidth: "26rem",
                  }}
                >
                  Ask it anything. Where's CS 301? When's the next bus? Is the library crowded? Real answers, in real time, grounded in live campus data.
                </p>
              </div>
              <div
                className="relative flex items-center gap-2 text-primary"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Explore the assistant
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </Link>
          </motion.div>

          {/* Tile 2 — Navigation */}
          <motion.div variants={item} className="md:col-span-2">
            <Link
              to="/navigation"
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl transition-all"
              style={{ ...CARD_STYLE, minHeight: "340px", padding: "2rem" }}
            >
              <div>
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    height: "44px",
                    width: "44px",
                    backgroundColor: "rgba(63,224,197,0.1)",
                    color: "var(--color-primary)",
                    border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
                  }}
                >
                  <MapPinned size={20} strokeWidth={1.75} />
                </div>
                <p
                  className="font-mono"
                  style={{
                    marginTop: "2rem",
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  Module 02
                </p>
                <h3
                  className="text-text-primary"
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "20px",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Living digital twin
                </h3>
                <p
                  className="text-text-secondary"
                  style={{ marginTop: "1rem", fontSize: "13.5px", lineHeight: 1.6 }}
                >
                  Every building, floor, and room — mapped and live.
                </p>
              </div>
              <div
                className="flex items-center gap-2 text-primary"
                style={{ fontSize: "12.5px", fontWeight: 500 }}
              >
                Open map
                <ArrowUpRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </Link>
          </motion.div>

          {/* Tile 3 — SOS */}
          <motion.div variants={item} className="md:col-span-2">
            <div
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl"
              style={{
                minHeight: "260px",
                padding: "2rem",
                border: "1px solid rgba(240,85,77,0.2)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div>
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    height: "44px",
                    width: "44px",
                    backgroundColor: "rgba(240,85,77,0.1)",
                    color: "#f0554d",
                    border: "1px solid rgba(240,85,77,0.25)",
                  }}
                >
                  <ShieldAlert size={20} strokeWidth={1.75} />
                </div>
                <p
                  className="font-mono"
                  style={{
                    marginTop: "2rem",
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  Module 03
                </p>
                <h3
                  className="text-text-primary"
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "20px",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Emergency SOS
                </h3>
                <p
                  className="text-text-secondary"
                  style={{ marginTop: "1rem", fontSize: "13.5px", lineHeight: 1.6 }}
                >
                  One-tap alerts routed to security with live location.
                </p>
              </div>
              <div
                className="flex items-center gap-2 font-mono"
                style={{
                  fontSize: "10.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#f0554d",
                }}
              >
                <span
                  className="animate-pulse rounded-full"
                  style={{ height: "6px", width: "6px", backgroundColor: "#f0554d" }}
                />
                Always armed
              </div>
            </div>
          </motion.div>

          {/* Tile 4 — Heatmap */}
          <motion.div variants={item} className="md:col-span-4">
            <Link
              to="/heatmap"
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl transition-all"
              style={{ ...CARD_STYLE, minHeight: "260px", padding: "2rem" }}
            >
              <div>
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    height: "44px",
                    width: "44px",
                    backgroundColor: "rgba(63,224,197,0.1)",
                    color: "var(--color-primary)",
                    border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
                  }}
                >
                  <BarChart3 size={20} strokeWidth={1.75} />
                </div>
                <p
                  className="font-mono"
                  style={{
                    marginTop: "2rem",
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  Module 04
                </p>
                <h3
                  className="text-text-primary"
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "20px",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Live occupancy heatmap
                </h3>
                <p
                  className="text-text-secondary"
                  style={{
                    marginTop: "1rem",
                    fontSize: "13.5px",
                    lineHeight: 1.6,
                    maxWidth: "32rem",
                  }}
                >
                  Watch the campus breathe. Hour-by-hour utilization across every facility — from the library to the cafeteria.
                </p>
              </div>
              <div
                className="flex items-center gap-2 text-primary"
                style={{ fontSize: "12.5px", fontWeight: 500 }}
              >
                See the heatmap
                <ArrowUpRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0"
                style={{ height: "6rem", opacity: 0.3 }}
              >
                <svg
                  viewBox="0 0 400 100"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <path
                    d="M0,80 L40,70 L80,75 L120,55 L160,60 L200,40 L240,45 L280,30 L320,35 L360,20 L400,25"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}