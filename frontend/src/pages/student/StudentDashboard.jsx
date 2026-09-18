// src/pages/student/StudentDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, Bell, ArrowRight, CheckCircle2, Circle, ChevronRight, MapPin, BookOpen,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { listNotices } from "../../api/notices.js";
import { getMyTimetable } from "../../api/timetables.js";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function todayName() {
  const d = new Date().getDay();
  if (d === 0) return null;
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d - 1];
}

function fmtTime(hhmm) {
  if (!hhmm || !hhmm.includes(":")) return hhmm || "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
}

function classState(cls, now = new Date()) {
  if (!cls?.startTime || !cls?.endTime) return "upcoming";
  const [sh, sm] = cls.startTime.split(":").map(Number);
  const [eh, em] = cls.endTime.split(":").map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0, 0);
  const end   = new Date(now); end.setHours(eh, em, 0, 0);
  if (now > end) return "past";
  if (now >= start && now <= end) return "now";
  return "upcoming";
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [ttLoading, setTtLoading] = useState(true);

  useEffect(() => {
    listNotices()
      .then((data) => setNotices(data.slice(0, 4)))
      .catch(() => setNotices([]))
      .finally(() => setNoticesLoading(false));
  }, []);

  useEffect(() => {
    getMyTimetable()
      .then((data) => setClasses(data.classes || []))
      .catch(() => setClasses([]))
      .finally(() => setTtLoading(false));
  }, []);

  const today = todayName();
  const todayList = today
    ? classes
        .filter((c) => c.dayOfWeek === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];

  // "Next" = first class whose start time is in the future
  const now = new Date();
  const nextIdx = todayList.findIndex((c) => {
    const [h, m] = c.startTime.split(":").map(Number);
    const start = new Date(now); start.setHours(h, m, 0, 0);
    return start > now;
  });

  const nextCls = nextIdx >= 0 ? todayList[nextIdx] : null;
  const doneCount = todayList.filter((c) => classState(c) === "past").length;

  return (
    <div className="max-w-[1280px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between flex-wrap"
        style={{ gap: "16px", marginBottom: "2rem" }}
      >
        <div>
          <div className="flex items-center" style={{ gap: "10px", flexWrap: "wrap" }}>
            <h1 className="text-text-primary" style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Dashboard
            </h1>
            {user?.section && user?.semester && (
              <span className="font-mono" style={{ padding: "3px 10px", borderRadius: "9999px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}>
                {user.section} - Year {Math.ceil(Number(user.semester) / 2)}
              </span>
            )}
          </div>
          <p className="text-text-secondary" style={{ marginTop: "4px", fontSize: "13px" }}>
            {ttLoading
              ? "Loading schedule…"
              : nextCls
              ? `Next: ${nextCls.courseCode} at ${fmtTime(nextCls.startTime)} · ${nextCls.room}`
              : todayList.length
              ? "All classes done for today"
              : "No classes today"}
          </p>
        </div>
        <LiveStatus />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ marginBottom: "1.5rem", gap: "10px" }}>
        <Stat label="Classes" value={ttLoading ? "…" : `${doneCount}/${todayList.length}`} hint="attended today" accent="var(--color-primary)" />
        <Stat label="Attendance" value="82%" hint="this semester" accent="#4ade80" trend="+2%" />
        <Stat label="Pending" value="3" hint="assignments" accent="#f59e0b" />
        <Stat label="CGPA" value="8.4" hint="current" accent="#a855f7" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]" style={{ gap: "16px", alignItems: "start" }}>
        {/* LEFT */}
        <div className="flex flex-col" style={{ gap: "16px", minWidth: 0 }}>
          <Panel title="Today's schedule" action={{ to: "/student/timetable", label: "Full week" }}>
            {ttLoading ? (
              <div className="flex items-center justify-center" style={{ padding: "1.5rem 0" }}>
                <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>Loading…</span>
              </div>
            ) : todayList.length === 0 ? (
              <div className="flex items-center justify-center" style={{ padding: "1.5rem 0" }}>
                <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                  No classes today
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                {todayList.map((c, i) => (
                  <ClassRow key={i} cls={c} index={i} last={i === todayList.length - 1} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Weekly overview">
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                const count = classes.filter((c) => c.dayOfWeek === day).length;
                const isToday = day === today;
                return (
                  <div key={day} className="flex items-center" style={{ gap: "12px" }}>
                    <span className="font-mono" style={{ width: "72px", fontSize: "11px", fontWeight: isToday ? 700 : 500, color: isToday ? "var(--color-primary)" : "var(--color-text-secondary)" }}>
                      {day}
                    </span>
                    <div style={{ flex: 1, height: "6px", borderRadius: "9999px", backgroundColor: "var(--color-surface-raised)", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(count * 18, 100)}%` }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: "100%", borderRadius: "9999px", backgroundColor: isToday ? "var(--color-primary)" : "#4ade80" }}
                      />
                    </div>
                    <span className="font-mono" style={{ width: "36px", textAlign: "right", fontSize: "11px", color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col" style={{ gap: "16px", minWidth: 0 }}>
          <Panel title="Notices" action={{ to: "/student/notices", label: "View all" }}>
            {noticesLoading ? (
              <div className="flex items-center justify-center" style={{ padding: "1.5rem 0" }}>
                <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>Loading…</span>
              </div>
            ) : notices.length === 0 ? (
              <div className="flex items-center justify-center" style={{ padding: "1.5rem 0" }}>
                <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>No notices yet</span>
              </div>
            ) : (
              <div className="flex flex-col">
                {notices.map((n, i) => (
                  <NoticeRow key={n._id} notice={n} last={i === notices.length - 1} />
                ))}
              </div>
            )}
          </Panel>

          <Link
            to="/ai"
            className="group"
            style={{
              display: "block",
              padding: "1rem 1.25rem",
              borderRadius: "0.75rem",
              border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--color-primary) 3%, transparent)",
              textDecoration: "none",
            }}
          >
            <div className="flex items-center justify-between" style={{ gap: "12px" }}>
              <div style={{ minWidth: 0 }}>
                <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-primary)" }}>
                  AI Assistant
                </p>
                <p className="text-text-primary" style={{ marginTop: "6px", fontSize: "13.5px", fontWeight: 500 }}>
                  Ask anything about your campus
                </p>
              </div>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" style={{ color: "var(--color-primary)", flexShrink: 0 }} />
            </div>
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
      <span className="font-mono" style={{ fontSize: "11.5px", color: "var(--color-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
        {formatted}
      </span>
    </div>
  );
}

function Stat({ label, value, hint, accent, trend }) {
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
      <div className="flex items-center justify-between">
        <p className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>
          {label}
        </p>
        {trend && <span className="font-mono" style={{ fontSize: "9.5px", color: "#4ade80" }}>{trend}</span>}
      </div>
      <p className="font-mono text-text-primary" style={{ marginTop: "6px", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
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

function ClassRow({ cls, index, last }) {
  const status = classState(cls);
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
        <p className="font-mono text-text-primary" style={{ fontSize: "12px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmtTime(cls.startTime)}</p>
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
        <p className="text-text-primary" style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: isPast ? 0.6 : 1 }}>
          {cls.courseName}
        </p>
        <div className="flex items-center" style={{ marginTop: "3px", gap: "10px", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
          <span className="flex items-center" style={{ gap: "3px" }}><MapPin size={9} />{cls.room}</span>
          {cls.facultyName && <span className="truncate-1">{cls.facultyName}</span>}
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
    <Link
      to="/student/notices"
      style={{ display: "block", padding: "10px 0", borderBottom: last ? "none" : "1px solid var(--color-divider)", textDecoration: "none" }}
    >
      <div className="flex items-start" style={{ gap: "8px" }}>
        <span style={{ flexShrink: 0, marginTop: "6px", height: "5px", width: "5px", borderRadius: "9999px", backgroundColor: isUrgent ? "#f0554d" : "var(--color-primary)" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "6px", marginBottom: "2px" }}>
            <span className="font-mono" style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: isUrgent ? "#f0554d" : "var(--color-text-tertiary)", fontWeight: 600 }}>
              {notice.category}
            </span>
          </div>
          <p className="text-text-primary" style={{ fontSize: "12.5px", fontWeight: 600, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {notice.title}
          </p>
          <div className="flex items-center" style={{ marginTop: "3px", gap: "6px", fontSize: "10px", color: "var(--color-text-tertiary)" }}>
            <span>{notice.author?.name || "System"}</span>
            <span>·</span>
            <span>{timeAgo(notice.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
