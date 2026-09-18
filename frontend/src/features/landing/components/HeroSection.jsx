// src/features/landing/components/HeroSection.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, LayoutDashboard, Compass } from "lucide-react";
import RegistrationMark from "./RegistrationMark";
import { useAuth } from "../../../contexts/AuthContext.jsx";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const MAP_LINES = [
  [10, 85, 10, 40], [10, 40, 38, 40], [38, 40, 38, 10],
  [10, 40, 10, 15], [38, 40, 72, 40], [72, 40, 72, 68], [72, 40, 90, 22],
];
const MAP_PINS = [
  { x: 10, y: 85, label: "Gate 2" },
  { x: 10, y: 15, label: "Hostel" },
  { x: 38, y: 10, label: "Library" },
  { x: 72, y: 68, label: "Block C" },
  { x: 90, y: 22, label: "Stadium" },
];

export default function HeroSection() {
  const { isAuthed, isAdmin, user } = useAuth();

  // ═══════════════════════════════════════════════
  //  LOGGED IN — Compact "portal home"
  // ═══════════════════════════════════════════════
  if (isAuthed) {
    const dashboardPath = isAdmin
      ? "/admin"
      : user?.role === "faculty"
      ? "/faculty"
      : "/student";

    return (
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-[1280px] px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.p
                variants={item}
                className="font-mono"
                style={{
                  fontSize: "10.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "var(--color-primary)",
                }}
              >
                Signed in · {user?.role || "User"}
              </motion.p>

              <motion.h1
                variants={item}
                className="text-text-primary"
                style={{
                  marginTop: "12px",
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontWeight: 600,
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  maxWidth: "22ch",
                }}
              >
                Welcome back,{" "}
                <span style={{ color: "var(--color-primary)" }}>
                  {user?.name?.split(" ")[0] || "there"}
                </span>
                .
              </motion.h1>

              <motion.p
                variants={item}
                className="text-text-secondary"
                style={{ marginTop: "12px", maxWidth: "52ch", fontSize: "14.5px", lineHeight: 1.6 }}
              >
                Jump back into your campus — check your schedule, notices, or explore
                the rest of SRMS.
              </motion.p>

              <motion.div
                variants={item}
                className="flex flex-col sm:flex-row"
                style={{ marginTop: "24px", gap: "10px" }}
              >
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center justify-center rounded-lg font-semibold transition-all hover:opacity-90"
                  style={{
                    height: "42px",
                    paddingLeft: "18px",
                    paddingRight: "18px",
                    gap: "8px",
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-fg)",
                    fontSize: "13.5px",
                  }}
                >
                  <LayoutDashboard size={15} />
                  Open Dashboard
                  <ArrowUpRight size={14} />
                </Link>
                <Link
                  to="/facilities"
                  className="inline-flex items-center justify-center rounded-lg font-medium transition-all"
                  style={{
                    height: "42px",
                    paddingLeft: "18px",
                    paddingRight: "18px",
                    gap: "8px",
                    border: "1px solid var(--color-border-strong)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    fontSize: "13.5px",
                  }}
                >
                  <Compass size={15} />
                  Explore campus
                </Link>
              </motion.div>

              {/* Quick facts — flat, not showy */}
              <motion.div
                variants={item}
                className="flex flex-wrap items-center"
                style={{
                  marginTop: "28px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--color-border)",
                  gap: "24px",
                }}
              >
                {[
                  ["17", "buildings"],
                  ["180+", "rooms"],
                  ["24/7", "live map"],
                ].map(([v, l], i) => (
                  <div key={l} className="flex items-baseline" style={{ gap: "6px" }}>
                    <span
                      className="font-mono text-text-primary"
                      style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.02em" }}
                    >
                      {v}
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "10.5px",
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      {l}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — compact map card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full lg:w-[380px]"
            >
              <RegistrationMark />
              <div
                className="relative overflow-hidden rounded-xl"
                style={{
                  padding: "14px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                  <p className="text-text-primary" style={{ fontSize: "12.5px", fontWeight: 500 }}>
                    Campus map
                  </p>
                  <span
                    className="flex items-center font-mono"
                    style={{ gap: "5px", fontSize: "9.5px", color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.14em" }}
                  >
                    <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: "#4ade80" }} />
                    live
                  </span>
                </div>

                <div className="relative w-full" style={{ height: "160px" }}>
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
                    {MAP_LINES.map(([x1, y1, x2, y2], i) => (
                      <motion.line
                        key={i}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="var(--color-border-strong)"
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.06 }}
                      />
                    ))}
                    {MAP_PINS.map((p, i) => (
                      <motion.circle
                        key={p.label}
                        cx={p.x} cy={p.y} r="2"
                        fill="var(--color-primary)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.8 + i * 0.06 }}
                      />
                    ))}
                  </svg>
                  {MAP_PINS.map((p) => (
                    <span
                      key={p.label}
                      className="absolute whitespace-nowrap"
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        transform: "translate(-50%, 8px)",
                        fontSize: "9.5px",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      {p.label}
                    </span>
                  ))}
                </div>

                <div
                  className="flex items-center justify-between"
                  style={{
                    marginTop: "12px",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--color-border)",
                    fontSize: "10px",
                    color: "var(--color-text-tertiary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span className="flex items-center" style={{ gap: "4px" }}>
                    <MapPin size={9} />
                    28.6203° N, 79.6236° E
                  </span>
                  <span>7 rooms</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════════════
  //  LOGGED OUT — Full marketing hero (unchanged)
  // ═══════════════════════════════════════════════
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 30% 40%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 65%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-14 lg:px-10 lg:py-24 xl:py-28">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-4 backdrop-blur-xl"
            style={{
              border: "1px solid var(--color-border-strong)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <span
              className="flex h-6 items-center rounded-full px-2.5"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <span
                className="font-mono font-semibold uppercase"
                style={{ fontSize: "10px", color: "var(--color-primary-fg)", letterSpacing: "0.14em" }}
              >
                New
              </span>
            </span>
            <span className="font-medium text-text-secondary" style={{ fontSize: "12px" }}>
              A student project for SRMS CET Bareilly
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-text-primary"
            style={{
              marginTop: "1.5rem",
              fontSize: "clamp(2rem, 7vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              maxWidth: "16ch",
            }}
          >
            Your campus,{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(to bottom right, var(--color-primary), #7fedd8, var(--color-primary))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              mapped
            </span>{" "}
            down to the classroom.
          </motion.h1>

          <motion.p
            variants={item}
            className="text-text-secondary"
            style={{ marginTop: "1.5rem", maxWidth: "46ch", fontSize: "15px", lineHeight: 1.6 }}
          >
            CampusOS gives every SRMS block a live digital twin — navigation, safety alerts, facility
            status, and an assistant that knows the building you're standing in.
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row"
            style={{ marginTop: "2rem", gap: "12px" }}
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
                paddingLeft: "24px",
                paddingRight: "24px",
                border: "1px solid var(--color-border-strong)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                fontSize: "14px",
              }}
            >
              Sign in
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            className="flex items-center"
            style={{
              marginTop: "2.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--color-border)",
              gap: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            {[["17", "buildings"], ["180+", "rooms"], ["24/7", "live map"]].map(([v, l], i) => (
              <div key={l} style={{ paddingLeft: i > 0 ? "1.25rem" : 0, borderLeft: i > 0 ? "1px solid var(--color-border)" : "none" }}>
                <p className="font-mono font-semibold text-text-primary" style={{ fontSize: "17px", fontVariantNumeric: "tabular-nums" }}>{v}</p>
                <p className="text-text-tertiary" style={{ fontSize: "11.5px" }}>{l}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="relative"
          style={{ minWidth: 0, width: "100%" }}
        >
          <RegistrationMark />
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              padding: "1.25rem",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-text-primary" style={{ fontSize: "12.5px" }}>Block C, ground floor</p>
              <span className="flex items-center" style={{ gap: "6px", fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>
                <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: "#4ade80" }} />
                live
              </span>
            </div>
            <div className="relative w-full" style={{ marginTop: "1rem", height: "14rem" }}>
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
                {MAP_LINES.map(([x1, y1, x2, y2], i) => (
                  <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-border-strong)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.6 + i * 0.08 }} />
                ))}
                {MAP_PINS.map((p, i) => (
                  <motion.circle key={p.label} cx={p.x} cy={p.y} r="2.2" fill="var(--color-primary)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 1.1 + i * 0.08 }} />
                ))}
              </svg>
              {MAP_PINS.map((p) => (
                <span key={p.label} className="absolute whitespace-nowrap" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, 8px)", fontSize: "10px", color: "var(--color-text-tertiary)" }}>{p.label}</span>
              ))}
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)", fontSize: "10.5px", color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
              <span className="flex items-center" style={{ gap: "6px" }}><MapPin size={10} /> 28.6203° N, 79.6236° E</span>
              <span>7 rooms tracked</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
