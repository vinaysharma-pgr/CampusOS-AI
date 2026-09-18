// src/features/timetable/components/ClassPill.jsx
import { motion } from "framer-motion";
import { MapPin, User } from "lucide-react";
import { TYPE_COLORS, fmtTime, classStatus } from "../utils";

export default function ClassPill({ cls, compact = false, onClick }) {
  const tone = TYPE_COLORS[cls.type] || TYPE_COLORS.lecture;
  const status = classStatus(cls);
  const isNow = status === "now";
  const isPast = status === "past";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      style={{
        textAlign: "left",
        width: "100%",
        padding: compact ? "8px 10px" : "12px 14px",
        borderRadius: "10px",
        border: isNow
          ? `1px solid ${tone.text}`
          : `1px solid var(--color-border)`,
        backgroundColor: tone.bg,
        opacity: isPast ? 0.55 : 1,
        cursor: "pointer",
        position: "relative",
      }}
    >
      {isNow && (
        <span
          style={{
            position: "absolute",
            top: "-6px",
            right: "10px",
            padding: "2px 8px",
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            borderRadius: "9999px",
            backgroundColor: tone.text,
            color: "var(--color-primary-fg)",
          }}
        >
          Now
        </span>
      )}
      <div className="flex items-center" style={{ gap: "6px", marginBottom: "4px" }}>
        <span
          className="font-mono"
          style={{
            fontSize: "9.5px",
            fontWeight: 700,
            color: tone.text,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {cls.courseCode}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: "9.5px",
            color: "var(--color-text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {cls.type}
        </span>
      </div>
      <p
        className="text-text-primary"
        style={{
          fontSize: compact ? "12px" : "13px",
          fontWeight: 600,
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {cls.courseName}
      </p>
      <div
        className="flex items-center"
        style={{
          marginTop: "6px",
          gap: "10px",
          fontSize: "10.5px",
          color: "var(--color-text-tertiary)",
          flexWrap: "wrap",
        }}
      >
        <span className="flex items-center" style={{ gap: "3px" }}>
          <span className="font-mono">{fmtTime(cls.startTime)} – {fmtTime(cls.endTime)}</span>
        </span>
        <span className="flex items-center" style={{ gap: "3px" }}>
          <MapPin size={9} /> {cls.room}
        </span>
        {cls.facultyName && (
          <span className="flex items-center" style={{ gap: "3px" }}>
            <User size={9} /> {cls.facultyName}
          </span>
        )}
      </div>
    </motion.button>
  );
}
