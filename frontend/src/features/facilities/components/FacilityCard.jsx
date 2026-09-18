// src/features/facilities/components/FacilityCard.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Monitor, MapPin, ArrowRight, Clock } from "lucide-react";

const STATUS_META = {
  open: { label: "Open", dot: "#4ade80", text: "#4ade80" },
  busy: { label: "Busy", dot: "#f5a524", text: "#f5a524" },
  closed: { label: "Closed", dot: "#f0554d", text: "#f0554d" },
  available: { label: "Available", dot: "var(--color-primary)", text: "var(--color-primary)" },
};

export default function FacilityCard({ facility, index = 0 }) {
  const status = STATUS_META[facility.live?.status] ?? STATUS_META.open;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: "100%", minWidth: 0 }}
    >
      <Link
        to={`/facilities/${facility.id}`}
        className="group block h-full overflow-hidden hover-lift"
        style={{
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          boxShadow: "var(--shadow-sm)",
          "--lift-glow": "rgba(63,224,197,0.20)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: "16 / 10",
            backgroundColor: "var(--color-surface-raised)",
          }}
        >
          <img
            src={facility.image}
            alt={facility.name}
            loading="lazy"
            className="transition-transform duration-700 group-hover:scale-105"
            style={{ height: "100%", width: "100%", objectFit: "cover" }}
          />
          {/* Bottom gradient — keep dark for legibility over photo */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 45%, transparent 70%)",
            }}
          />

          {/* Status badge — always dark-on-glass over the photo */}
          <div
            className="absolute flex items-center"
            style={{
              top: "12px",
              left: "12px",
              gap: "6px",
              padding: "5px 10px",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <span
              className="rounded-full"
              style={{ height: "6px", width: "6px", backgroundColor: status.dot }}
            />
            <span
              className="font-mono font-medium"
              style={{
                fontSize: "9.5px",
                color: status.text,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              {status.label}
            </span>
          </div>

          {/* Code badge */}
          <div
            className="absolute"
            style={{
              top: "12px",
              right: "12px",
              padding: "3px 8px",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: "9.5px",
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.05em",
              }}
            >
              {facility.code}
            </span>
          </div>

          {/* Title overlay — always white over photo */}
          <div className="absolute inset-x-0 bottom-0" style={{ padding: "1rem" }}>
            <p
              className="font-mono"
              style={{
                fontSize: "9.5px",
                color: "var(--color-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              {facility.type}
            </p>
            <h3
              className="font-semibold"
              style={{
                marginTop: "4px",
                fontSize: "16px",
                color: "#ffffff",
                lineHeight: 1.2,
                letterSpacing: "-0.015em",
              }}
            >
              {facility.name}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem" }}>
          <p
            className="text-text-secondary"
            style={{
              fontSize: "12.5px",
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.5rem",
            }}
          >
            {facility.tagline}
          </p>

          <div
            className="grid grid-cols-3"
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--color-border)",
              gap: "8px",
            }}
          >
            <Spec icon={Users} label="Seats" value={facility.specs?.seats ?? "—"} />
            <Spec icon={Monitor} label="Systems" value={facility.specs?.systems || "—"} />
            <Spec icon={Clock} label="Hours" value={(facility.specs?.hours || "").split(" ")[0] || "—"} />
          </div>

          <div
            className="flex items-center justify-between"
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <span
              className="flex items-center font-mono"
              style={{
                gap: "6px",
                fontSize: "10px",
                color: "var(--color-text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              <MapPin size={10} />
              {facility.location?.building} · {facility.location?.floor}
            </span>
            <span
              className="flex items-center font-medium hover-icon-slide"
              style={{ gap: "4px", fontSize: "11.5px", color: "var(--color-primary)" }}
            >
              View
              <ArrowRight size={11} className="icon-slide" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div className="flex items-center" style={{ gap: "4px", color: "var(--color-text-tertiary)" }}>
        <Icon size={10} strokeWidth={2} />
        <span
          className="font-mono"
          style={{
            fontSize: "9px",
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
          marginTop: "4px",
          fontSize: "12px",
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
