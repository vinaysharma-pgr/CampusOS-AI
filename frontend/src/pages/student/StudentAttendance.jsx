// src/pages/student/StudentAttendance.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2, TrendingUp, BookOpen, ClipboardCheck } from "lucide-react";
import { getMyAttendanceStats } from "../../api/attendance.js";
import SafeSkipCard from "../../features/attendance/components/SafeSkipCard.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

function Ring({ percent, size = 56 }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const color = percent >= 85 ? "#4ade80" : percent >= 75 ? "#f5a524" : "#f0554d";

  return (
    <div className="relative" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-surface-raised)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-primary)" }}>{percent}%</span>
      </div>
    </div>
  );
}

export default function StudentAttendance() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("");

  useEffect(() => {
    getMyAttendanceStats()
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const groupLabel = user?.section && user?.semester
    ? user.section + " - Year " + Math.ceil(Number(user.semester) / 2)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <Loader2 size={26} className="animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <AlertTriangle size={28} style={{ color: "#f0554d", margin: "0 auto" }} />
        <p className="text-text-primary" style={{ marginTop: "1rem", fontSize: "15px", fontWeight: 600 }}>Failed to load attendance</p>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>{error}</p>
      </div>
    );
  }

  const subjects = stats?.subjects || [];
  const below = subjects.filter((s) => s.belowThreshold);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-text-tertiary)" }}>
          Your attendance
        </p>
        <h1 className="text-text-primary" style={{ marginTop: "6px", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Attendance
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {subjects.length + " " + (subjects.length === 1 ? "subject" : "subjects")} tracked
          {groupLabel ? " - " + groupLabel : ""}
        </p>
      </motion.div>

      {/* Overall cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ marginTop: "1.5rem", gap: "10px" }}>
        <StatCard icon={TrendingUp} label="Overall" value={stats?.overall + "%"} accent={stats?.overall >= 75 ? "#4ade80" : "#f0554d"} />
        <StatCard icon={BookOpen} label="Total classes" value={stats?.totalClasses || 0} accent="#3fe0c5" />
        <StatCard icon={CheckCircle2} label="Present" value={stats?.totalPresent || 0} accent="#4ade80" />
        <StatCard icon={AlertTriangle} label="Below 75%" value={stats?.belowThresholdCount || 0} accent={below.length ? "#f0554d" : "var(--color-text-tertiary)"} />
      </div>

      {/* Warning if below threshold */}
      {below.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-start"
          style={{ marginTop: "1.25rem", padding: "1rem 1.25rem", gap: "12px", borderRadius: "0.75rem", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "rgba(240,85,77,0.05)" }}>
          <span style={{ height: "36px", width: "36px", flexShrink: 0, backgroundColor: "rgba(240,85,77,0.12)", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={16} />
          </span>
          <div>
            <p className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600 }}>
              {below.length} {below.length === 1 ? "subject is" : "subjects are"} below the 75% threshold
            </p>
            <p className="text-text-secondary" style={{ marginTop: "3px", fontSize: "12.5px", lineHeight: 1.5 }}>
              You may be detained in: {below.map((s) => s.courseCode).join(", ")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Subject list */}
      <div style={{ marginTop: "1.75rem" }}>
        <h2 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>
          Subject-wise breakdown
        </h2>

        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center"
            style={{ padding: "3rem 1.5rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
            <ClipboardCheck size={28} style={{ color: "var(--color-text-tertiary)" }} />
            <p className="text-text-primary" style={{ marginTop: "1rem", fontSize: "15px", fontWeight: 600 }}>No attendance yet</p>
            <p className="text-text-secondary" style={{ marginTop: "6px", maxWidth: "40ch", fontSize: "13px", lineHeight: 1.5 }}>
              Once your faculty starts marking attendance, per-subject stats will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: "10px" }}>
            {subjects.map((s, i) => {
              const tone = s.percentage >= 85 ? "#4ade80" : s.percentage >= 75 ? "#f5a524" : "#f0554d";
              return (
                <motion.div key={s.courseCode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center"
                  style={{ padding: "1rem 1.25rem", gap: "16px", borderRadius: "0.75rem", border: "1px solid " + (s.belowThreshold ? "rgba(240,85,77,0.3)" : "var(--color-border)"), backgroundColor: s.belowThreshold ? "rgba(240,85,77,0.03)" : "var(--color-surface)" }}>
                  <Ring percent={s.percentage} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center" style={{ gap: "8px", marginBottom: "4px" }}>
                      <span className="font-mono" style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                        {s.courseCode}
                      </span>
                      {s.belowThreshold && (
                        <span className="font-mono" style={{ fontSize: "9.5px", padding: "2px 7px", borderRadius: "5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "rgba(240,85,77,0.15)", color: "#f0554d" }}>
                          At risk
                        </span>
                      )}
                    </div>
                    <p className="text-text-primary" style={{ fontSize: "14px", fontWeight: 600 }}>{s.courseName || s.courseCode}</p>
                    <div className="flex items-center" style={{ marginTop: "4px", gap: "12px", fontSize: "11.5px", color: "var(--color-text-tertiary)" }}>
                      <span>{s.present}/{s.totalClasses} attended</span>
                      {s.facultyName && <span>· {s.facultyName}</span>}
                    </div>
                  </div>
                  <div className="shrink-0" style={{ textAlign: "right" }}>
                    <p className="font-mono" style={{ fontSize: "20px", fontWeight: 700, color: tone }}>{s.percentage}%</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {subjects.length > 0 && <SafeSkipCard subjects={subjects} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ padding: "0.875rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
      <div className="flex items-center" style={{ gap: "6px", color: "var(--color-text-tertiary)" }}>
        <Icon size={11} strokeWidth={2} />
        <p className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.14em" }}>{label}</p>
      </div>
      <p className="font-mono" style={{ marginTop: "6px", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, color: accent }}>
        {value}
      </p>
    </motion.div>
  );
}
