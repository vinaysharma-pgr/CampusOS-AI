// src/pages/admin/AdminAttendance.jsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck, Users, TrendingUp, AlertTriangle, Loader2,
  Download, Calendar, BookOpen, Filter, Info,
} from "lucide-react";
import { listAttendance } from "../../api/attendance.js";
import { listGroups } from "../../api/groups.js";
import { useToast } from "../../contexts/ToastContext.jsx";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminAttendance() {
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true)
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [r, g] = await Promise.all([listAttendance({ limit: 500 }), listGroups()]);
      setRecords(r);
      setGroups(g);
    } catch (err) {
      showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ─── Filtering ───
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filterGroup !== "all" && r.groupCode !== filterGroup) return false;
      if (filterFrom && r.date < filterFrom) return false;
      if (filterTo && r.date > filterTo) return false;
      return true;
    });
  }, [records, filterGroup, filterFrom, filterTo]);

  // ─── Stats ───
  const stats = useMemo(() => {
    const totalClasses = filtered.length;
    let totalPresent = 0;
    let totalStudents = 0;
    for (const r of filtered) {
      totalPresent += r.presentCount || 0;
      totalStudents += r.totalStudents || 0;
    }
    const avgAttendance = totalStudents
      ? Math.round((totalPresent / totalStudents) * 100)
      : 0;

    // Records this week (Mon-Sun)
    const now = new Date();
    const dow = now.getDay() || 7; // Sunday -> 7
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dow - 1));
    const weekStart = monday.toISOString().slice(0, 10);
    const thisWeek = filtered.filter((r) => r.date >= weekStart).length;

    return { totalClasses, avgAttendance, thisWeek };
  }, [filtered]);

  // ─── CSV Export ───
  const exportCSV = () => {
    if (filtered.length === 0) {
      showToast({ type: "info", title: "Nothing to export" });
      return;
    }
    const headers = ["Date", "Day", "Group", "Course Code", "Course Name", "Faculty", "Present", "Absent", "Total"];
    const rows = filtered.map((r) => [
      r.date,
      r.dayOfWeek || "",
      r.groupCode || "",
      r.courseCode || "",
      (r.courseName || "").replace(/,/g, " "),
      (r.facultyName || "").replace(/,/g, " "),
      r.presentCount || 0,
      r.absentCount || 0,
      r.totalStudents || 0,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast({ type: "success", title: "CSV downloaded" });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: "1.5rem", gap: "12px" }}>
        <div>
          <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Attendance
          </h1>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
            Manual attendance records across your department
          </p>
        </div>
        <button onClick={exportCSV}
          className="inline-flex items-center justify-center rounded-lg font-semibold"
          style={{ height: "40px", paddingLeft: "16px", paddingRight: "16px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px", border: "none", cursor: "pointer" }}>
          <Download size={15} strokeWidth={2.5} />
          Export CSV
        </button>
      </div>

      {/* Module status banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start"
        style={{ padding: "1.25rem 1.5rem", gap: "14px", borderRadius: "1rem", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)", backgroundColor: "color-mix(in srgb, var(--color-primary) 5%, transparent)", marginBottom: "1.5rem" }}>
        <span className="flex items-center justify-center"
          style={{ height: "44px", width: "44px", flexShrink: 0, borderRadius: "11px", backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}>
          <ClipboardCheck size={20} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "10px", flexWrap: "wrap" }}>
            <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>
              Attendance Module — Manual Mode
            </p>
            <span className="font-mono" style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", gap: "5px", borderRadius: "9999px", fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", backgroundColor: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
              <span className="rounded-full animate-pulse" style={{ height: "6px", width: "6px", backgroundColor: "#4ade80" }} />
              Active
            </span>
          </div>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "12.5px", lineHeight: 1.55 }}>
            Faculty mark attendance per class from the Faculty Portal. No biometric or thumb-machine API is connected — all entries are entered manually.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: "10px", marginBottom: "1.5rem" }}>
        <StatCard icon={BookOpen} label="Classes marked" value={stats.totalClasses} accent="#3fe0c5" />
        <StatCard icon={TrendingUp} label="Avg attendance" value={stats.avgAttendance + "%"} accent={stats.avgAttendance >= 75 ? "#4ade80" : "#f0554d"} />
        <StatCard icon={Users} label="This week" value={stats.thisWeek} accent="#a855f7" />
        <StatCard icon={Calendar} label="Groups" value={groups.length} accent="#f5a524" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center"
        style={{ padding: "1rem 1.25rem", gap: "12px", marginBottom: "1rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center" style={{ gap: "8px", color: "var(--color-text-tertiary)" }}>
          <Filter size={13} />
          <span className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>
            Filter
          </span>
        </div>

        <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}
          style={{ padding: "8px 12px", fontSize: "12.5px", borderRadius: "8px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", outline: "none" }}>
          <option value="all">All groups</option>
          {groups.map((g) => <option key={g.code} value={g.code}>{g.code}</option>)}
        </select>

        <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
          style={{ padding: "8px 12px", fontSize: "12.5px", borderRadius: "8px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", outline: "none" }} />
        <span className="text-text-tertiary" style={{ fontSize: "12px" }}>to</span>
        <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)}
          style={{ padding: "8px 12px", fontSize: "12.5px", borderRadius: "8px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", outline: "none" }} />

        {(filterGroup !== "all" || filterFrom || filterTo) && (
          <button onClick={() => { setFilterGroup("all"); setFilterFrom(""); setFilterTo(""); }}
            className="font-mono"
            style={{ marginLeft: "auto", padding: "6px 10px", fontSize: "10px", borderRadius: "6px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.14em", background: "transparent", cursor: "pointer" }}>
            Reset
          </button>
        )}
      </div>

      {/* Records table */}
      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "240px" }}>
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ minHeight: "280px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <Info size={26} style={{ color: "var(--color-text-tertiary)" }} />
          <p className="text-text-primary" style={{ marginTop: "1rem", fontSize: "15px", fontWeight: 600 }}>No attendance records</p>
          <p className="text-text-secondary" style={{ marginTop: "6px", maxWidth: "40ch", fontSize: "13px", lineHeight: 1.5 }}>
            Faculty need to mark attendance from their portal first.
          </p>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-surface-raised)" }}>
                  {["Date", "Group", "Course", "Faculty", "Present", "Absent"].map((h) => (
                    <th key={h} className="font-mono" style={{ padding: "12px 14px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r._id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-divider)" : "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                    <td style={{ padding: "12px 14px", fontSize: "12.5px" }}>
                      <p className="text-text-primary" style={{ fontWeight: 500 }}>{r.date}</p>
                      <p className="font-mono" style={{ marginTop: "2px", fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{r.dayOfWeek}</p>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="font-mono" style={{ padding: "3px 8px", fontSize: "10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>{r.groupCode}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <p className="text-text-primary" style={{ fontSize: "12.5px", fontWeight: 500 }}>{r.courseName || r.courseCode}</p>
                      <p className="font-mono" style={{ marginTop: "2px", fontSize: "10px", color: "var(--color-text-tertiary)" }}>{r.courseCode}</p>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "12.5px", color: "var(--color-text-secondary)" }}>
                      {r.facultyName || "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "13px" }}>{r.presentCount}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ color: "#f0554d", fontWeight: 600, fontSize: "13px" }}>{r.absentCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="font-mono" style={{ marginTop: "12px", fontSize: "10.5px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "right" }}>
          Showing {filtered.length} of {records.length} records
        </p>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
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
