// src/features/facilities/components/FacilityHero.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Users, Monitor, Clock } from "lucide-react";

const STATUS_META = {
  open: { label: "Open now", dot: "#4ade80", text: "#4ade80" },
  busy: { label: "Busy", dot: "#f5a524", text: "#f5a524" },
  closed: { label: "Closed", dot: "#f0554d", text: "#f0554d" },
  available: { label: "Available", dot: "var(--color-primary)", text: "var(--color-primary)" },
};

export default function FacilityHero({ facility }) {
  const status = STATUS_META[facility.live.status] ?? STATUS_META.open;

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: "1.5rem" }}
      >
        <Link
          to="/facilities"
          className="inline-flex items-center"
          style={{
            gap: "8px",
            fontSize: "12.5px",
            fontWeight: 500,
            color: "var(--color-text-secondary)",
          }}
        >
          <ArrowLeft size={13} />
          All facilities
        </Link>
      </motion.div>

      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden"
        style={{
          aspectRatio: "16 / 7",
          width: "100%",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <img
          src={facility.image}
          alt={facility.name}
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(8,9,11,0.95) 0%, rgba(8,9,11,0.55) 45%, transparent 75%)",
          }}
        />

        {/* Top badges */}
        <div
          className="absolute flex flex-wrap"
          style={{ top: "1.25rem", left: "1.25rem", gap: "8px" }}
        >
          <div
            className="flex items-center"
            style={{
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.15)",
              backgroundColor: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <span
              className="rounded-full animate-pulse"
              style={{ height: "6px", width: "6px", backgroundColor: status.dot }}
            />
            <span
              className="font-mono font-medium"
              style={{
                fontSize: "10px",
                color: status.text,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              {status.label}
            </span>
          </div>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.15)",
              backgroundColor: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.85)",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              {facility.code}
            </span>
          </div>
        </div>

        {/* Title overlay */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ padding: "1.75rem 1.5rem" }}
        >
          <p
            className="font-mono"
            style={{
              fontSize: "10.5px",
              color: "var(--color-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            {facility.type}
          </p>
          <h1
            className="font-semibold"
            style={{
              marginTop: "8px",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            {facility.name}
          </h1>
          <p
            style={{
              marginTop: "12px",
              maxWidth: "42rem",
              fontSize: "14px",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {facility.tagline}
          </p>
        </div>
      </motion.div>

      {/* Quick stats — with clear visible values */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ marginTop: "1rem", gap: "12px" }}
      >
        <QuickStat
          icon={Users}
          label="Capacity"
          value={`${facility.specs.seats} seats`}
        />
        <QuickStat
          icon={Monitor}
          label="Systems"
          value={facility.specs.systems ? `${facility.specs.systems} units` : "—"}
        />
        <QuickStat
          icon={Clock}
          label="Hours"
          value={facility.specs.hours}
        />
        <QuickStat
          icon={MapPin}
          label="Location"
          value={`${facility.location.building} · Floor ${facility.location.floor}`}
        />
      </motion.div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        borderRadius: "0.75rem",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        minWidth: 0,
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: "6px", color: "var(--color-text-tertiary)" }}
      >
        <Icon size={11} strokeWidth={2} />
        <span
          className="font-mono"
          style={{
            fontSize: "9.5px",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
          }}
        >
          {label}
        </span>
      </div>
      <p
        className="font-mono font-semibold text-text-primary"
        style={{
          marginTop: "8px",
          fontSize: "14px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </p>
    </div>
  );
}