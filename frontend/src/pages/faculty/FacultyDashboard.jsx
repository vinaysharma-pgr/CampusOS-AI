// src/pages/faculty/FacultyDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, Bell, MapPin, Users, ChevronRight, ArrowRight,
  CheckCircle2, Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { listNotices } from "../../api/notices.js";
import { getMyTimetable } from "../../api/timetables.js";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function fmtTime(hhmm) {
  if (!hhmm || !hhmm.includes(":")) return hhmm || "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return hr + ":" + String(m).padStart(2, "0") + " " + period;
}

function classState(cls, now) {
  if (!cls?.startTime || !cls?.endTime) return "upcoming";
  const [sh, sm] = cls.startTime.split(":").map(Number);
  const [eh, em] = cls.endTime.split(":").map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0, 0);
  const end = new Date(now); end.setHours(eh, em, 0, 0);
  if (now > end) return "past";
  if (now >= start && now <= end) return "now";
  return "upcoming";
}

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTimetable()
      .then((data) => setClasses(data.classes || []))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    listNotices()
      .then((data) => setNotices(data.slice(0, 4)))
      .catch(() => setNotices([]));
  }, []);

  const today = DAYS[new Date().getDay()];
  const isSunday = today === "Sunday";

  const todayClasses = isSunday
    ? []
    : classes
        .filter((c) => c.dayOfWeek === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = new Date();
  const nextCls = todayClasses.find((c) => classState(c, now) !== "past");
  const doneCount = todayClasses.filter((c) => classState(c, now) === "past").length;

  const dayCounts = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => ({
    day: d,
    count: classes.filter((c) => c.dayOfWeek === d).length,
  }));
  const maxCount = Math.max(1, ...dayCounts.map((d) => d.count));

  const uniqueSections = Array.from(
    new Set(classes.map((c) => c.courseCode).filter(Boolean))
  ).length;

  return (
    <div className="max-w-[1280px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between flex-wrap"
        style={{ gap: "16px", marginBottom: "2rem" }}
      >
        <div>
          <h1 className="text-text-primary" style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Faculty Dashboard
          </h1>
          <p className="text-text-secondary" style={{ marginTop: "4px", fontSize: "13px" }}>
            {loading
              ? "Loading your schedule..."
              : nextCls
              ? "Next: " + nextCls.courseCode + " at " + fmtTime(nextCls.startTime) + " - " + nextCls.room
              : todayClasses.length
              ? "All classes done for today"
              : isSunday
              ? "Sunday - Campus closed"
              : "No classes today"}
          </p>
        </div>
        <LiveStatus />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ marginBottom: "1.5rem", gap: "10px" }}>
        <Stat label="Today" value={loading ? "..." : doneCount + "/" + todayClasses.length} hint="attended" accent="#3fe0c5" />
        <Stat label="Weekly load" value={loading ? "..." : classes.length} hint="classes / week" accent="#4ade80" />
        <Stat label="Courses" value={loading ? "..." : uniqueSections} hint="unique subjects" accent="#f59e0b" />
        <Stat label="Notices" value={notices.length} hint="recent" accent="#a855f7" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]" style={{ gap: "16px", alignItems: "start" }}>
        {/* LEFT */}
        <div className="flex flex-col" style={{ gap: "16px", minWidth: 0 }}>
          <Panel title={"Today - " + today} action={{ to: "/faculty/timetable", label: "Full week" }}>
            {loading ? (
              <CenterMsg>Loading schedule...</CenterMsg>
            ) : todayClasses.length === 0 ? (
              <CenterMsg>{isSunday ? "No classes on Sunday" : "No classes today"}</CenterMsg>
            ) : (
              <div className="flex flex-col">
                {todayClasses.map((c, i) => (
                  <ClassRow key={i} cls={c} index={i} last={i === todayClasses.length - 1} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Weekly load">
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {dayCounts.map((d, i) => {
                const pct = Math.round((d.count / maxCount) * 100);
                const isToday = d.day === today;
                return (
                  <div key={d.day} className="flex items-center" style={{ gap: "12px" }}>
                    <span className="font-mono" style={{ width: "72px", fontSize: "11px", fontWeight: isToday ? 700 : 500, color: isToday ? "#3fe0c5" : "var(--color-text-secondary)" }}>
                      {d.day.slice(0, 3)}
                    </span>
                    <div style={{ flex: 1, height: "6px", borderRadius: "9999px", backgroundColor: "var(--color-surface-raised)", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: pct + "%" }}
                        transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: "100%", borderRadius: "9999px", backgroundColor: isToday ? "#3fe0c5" : "#4ade80" }}
                      />
                    </div>
                    <span className="font-mono" style={{ width: "36px", textAlign: "right", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                      {d.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col" style={{ gap: "16px", minWidth: 0 }}>
          <Panel title="Recent notices" action={{ to: "/faculty/notices", label: "Post / View all" }}>
            {notices.length === 0 ? (
              <CenterMsg>No notices yet</CenterMsg>
            ) : (
              <div className="flex flex-col">
                {notices.map((n, i) => (
                  <NoticeRow key={n._id || i} notice={n} last={i === notices.length - 1} />
                ))}
              </div>
            )}
          </Panel>

          <Link
            to="/faculty/notices"
            className="group flex items-center justify-between"
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "0.75rem",
              border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--color-primary) 3%, transparent)",
              textDecoration: "none",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-primary)" }}>
                Quick action
              </p>
              <p className="text-text-primary" style={{ marginTop: "6px", fontSize: "13.5px", fontWeight: 500 }}>
                Post a notice to your students
              </p>
            </div>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" style={{ color: "var(--color-primary)", flexShrink: 0 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function LiveStatus() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const formatted = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return (
    <div className="flex items-center" style={{ gap: "8px", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
      <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: "#4ade80" }} />
      <span className="font-mono" style={{ fontSize: "11.5px", color: "var(--color-text-secondary)" }}>{formatted}</span>
    </div>
  );
}

function Stat({ label, value, hint, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: "0.875rem 1rem",
        borderRadius: "0.75rem",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <p className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>
        {label}
      </p>
      <p className="font-mono text-text-primary" style={{ marginTop: "6px", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, color: accent }}>
        {value}
      </p>
      <p className="text-text-tertiary" style={{ marginTop: "3px", fontSize: "11px" }}>{hint}</p>
    </motion.div>
  );
}

function Panel({ title, action, children }) {
  return (
    <div style={{ borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", overflow: "hidden" }}>
      <div className="flex items-center justify-between" style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <h3 className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", fontWeight: 500 }}>
          {title}
        </h3>
        {action && (
          <Link to={action.to} className="group inline-flex items-center" style={{ gap: "2px", fontSize: "11.5px", color: "var(--color-primary)", fontWeight: 500 }}>
            {action.label}
            <ChevronRight size={11} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <div style={{ padding: "12px 16px 16px" }}>{children}</div>
    </div>
  );
}

function CenterMsg({ children }) {
  return (
    <div className="flex items-center justify-center" style={{ padding: "1.5rem 0" }}>
      <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>{children}</span>
    </div>
  );
}

function ClassRow({ cls, index, last }) {
  const status = classState(cls, new Date());
  const isPast = status === "past";
  const isNow = status === "now";

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex items-center"
      style={{ padding: "12px 0", gap: "14px", borderBottom: last ? "none" : "1px solid var(--color-divider)" }}
    >
      <div style={{ minWidth: "58px" }}>
        <p className="font-mono text-text-primary" style={{ fontSize: "12px", fontWeight: 600 }}>{fmtTime(cls.startTime)}</p>
        <p className="font-mono" style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "1px" }}>{fmtTime(cls.endTime)}</p>
      </div>
      <div style={{ height: "32px", width: "1px", backgroundColor: "var(--color-divider)" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center" style={{ gap: "6px", marginBottom: "2px" }}>
          <span className="font-mono" style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: isNow ? "var(--color-primary)" : "var(--color-text-tertiary)", fontWeight: 600 }}>
            {cls.courseCode}
          </span>
          {isNow && (
            <span className="font-mono" style={{ fontSize: "8px", padding: "1px 5px", borderRadius: "3px", backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
              Now
            </span>
          )}
        </div>
        <p className="text-text-primary" style={{ fontSize: "13px", fontWeight: 500, opacity: isPast ? 0.6 : 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {cls.courseName}
        </p>
        <div className="flex items-center" style={{ marginTop: "3px", gap: "10px", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
          <span className="flex items-center" style={{ gap: "3px" }}><MapPin size={9} />{cls.room}</span>
        </div>
      </div>
      {isPast && (
        <span className="flex items-center justify-center" style={{ height: "20px", width: "20px", color: "#4ade80" }}>
          <CheckCircle2 size={14} />
        </span>
      )}
    </motion.div>
  );
}

function NoticeRow({ notice, last }) {
  const isUrgent = notice.priority === "urgent";
  return (
    <Link to="/faculty/notices" style={{ display: "block", padding: "10px 0", borderBottom: last ? "none" : "1px solid var(--color-divider)", textDecoration: "none" }}>
      <div className="flex items-start" style={{ gap: "8px" }}>
        <span style={{ flexShrink: 0, marginTop: "6px", height: "5px", width: "5px", borderRadius: "9999px", backgroundColor: isUrgent ? "#f0554d" : "#3fe0c5" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="font-mono" style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: isUrgent ? "#f0554d" : "var(--color-text-tertiary)", fontWeight: 600 }}>
            {notice.category}
          </span>
          <p className="text-text-primary" style={{ marginTop: "2px", fontSize: "12.5px", fontWeight: 600, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {notice.title}
          </p>
        </div>
      </div>
    </Link>
  );
}
