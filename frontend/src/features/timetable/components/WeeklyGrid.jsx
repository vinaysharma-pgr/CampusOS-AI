// src/features/timetable/components/WeeklyGrid.jsx
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import ClassPill from "./ClassPill";
import { DAYS, groupByDay, todayName } from "../utils";

export default function WeeklyGrid({ classes = [] }) {
  const grouped = groupByDay(classes);
  const today = todayName();

  if (!classes.length) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{
          minHeight: "280px",
          padding: "2rem",
          border: "1px dashed var(--color-border-strong)",
          borderRadius: "1rem",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <Calendar size={28} style={{ color: "var(--color-text-tertiary)" }} />
        <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "16px", fontWeight: 600 }}>
          No classes scheduled yet
        </h3>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>
          Your timetable will appear here once it's published.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "12px",
      }}
    >
      {DAYS.map((day) => {
        const dayClasses = grouped[day] || [];
        const isToday = day === today;
        return (
          <div
            key={day}
            style={{
              padding: "12px",
              borderRadius: "1rem",
              border: isToday ? "1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)" : "1px solid var(--color-border)",
              backgroundColor: isToday ? "color-mix(in srgb, var(--color-primary) 3%, transparent)" : "var(--color-surface)",
              minHeight: "180px",
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
              <p
                className="font-mono"
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: isToday ? "var(--color-primary)" : "var(--color-text-tertiary)",
                }}
              >
                {day}
              </p>
              {isToday && (
                <span
                  className="font-mono"
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "9999px",
                    backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
                    color: "var(--color-primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Today
                </span>
              )}
            </div>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              {dayClasses.length === 0 ? (
                <p className="font-mono" style={{ fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>
                  — No classes —
                </p>
              ) : (
                dayClasses.map((c, i) => <ClassPill key={`${c.courseCode}-${i}`} cls={c} compact />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
