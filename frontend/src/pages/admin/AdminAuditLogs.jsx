// src/pages/admin/AdminAuditLogs.jsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Loader2, Filter, Download, RefreshCw, User, AlertTriangle,
  CheckCircle2, XCircle, Clock, Search, Trash2,
} from "lucide-react";
import { listAuditLogs, cleanupAuditLogs } from "../../api/auditLogs.js";
import { useToast } from "../../contexts/ToastContext.jsx";

// Map action prefixes to human-friendly labels
const ACTION_LABELS = {
  "auth": "Authentication",
  "upload": "Uploads",
  "hod": "HOD Submissions",
  "timetable": "Timetables",
  "notice": "Notices",
  "event": "Events",
  "attendance": "Attendance",
  "assignment": "Assignments",
  "payment": "Payments",
};

function labelForAction(action) {
  if (!action) return "Unknown";
  return action
    .split(".")
    .map((s) => s.replace(/_/g, " "))
    .join(" · ");
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + "d ago";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fmtFull(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminAuditLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cleaning, setCleaning] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await listAuditLogs({ limit: 300 });
      setLogs(data.logs || []);
    } catch (err) {
      showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (actionFilter !== "all") {
        const prefix = actionFilter;
        if (!l.action?.startsWith(prefix)) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = [
          l.action, l.userName, l.userEmail, l.message,
          l.ipAddress, l.path, JSON.stringify(l.metadata || {}),
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [logs, search, actionFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const failed = logs.filter((l) => l.status === "failure").length;
    const last24h = logs.filter((l) => Date.now() - new Date(l.createdAt).getTime() < 24 * 3600 * 1000).length;
    return { total, failed, last24h };
  }, [logs]);

  const exportCSV = () => {
    if (filtered.length === 0) {
      showToast({ type: "info", title: "Nothing to export" });
      return;
    }
    const headers = ["Time", "Action", "Status", "User", "Email", "Role", "IP", "Method", "Path", "Message"];
    const rows = filtered.map((l) => [
      new Date(l.createdAt).toISOString(),
      l.action || "",
      l.status || "",
      l.userName || "",
      l.userEmail || "",
      l.userRole || "",
      l.ipAddress || "",
      l.method || "",
      l.path || "",
      (l.message || "").replace(/,/g, " ").replace(/\n/g, " "),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast({ type: "success", title: "CSV downloaded" });
  };

  const handleCleanup = async () => {
    if (!confirm("Delete all audit logs older than 90 days? This cannot be undone.")) return;
    setCleaning(true);
    try {
      const result = await cleanupAuditLogs(90);
      showToast({ type: "success", title: `Deleted ${result.deleted || 0} old logs` });
      await load();
    } catch (err) {
      showToast({ type: "error", title: "Cleanup failed", description: err.response?.data?.message || err.message });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: "1.5rem", gap: "12px" }}>
        <div>
          <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Audit Logs
          </h1>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
            {loading ? "Loading..." : `${filtered.length} of ${logs.length} entries`}
          </p>
        </div>
        <div className="flex flex-wrap items-center" style={{ gap: "8px" }}>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-lg font-medium"
            style={{ height: "40px", paddingLeft: "14px", paddingRight: "14px", gap: "6px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface)", color: "var(--color-text-primary)", fontSize: "13px", cursor: "pointer" }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center rounded-lg font-semibold"
            style={{ height: "40px", paddingLeft: "16px", paddingRight: "16px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px", border: "none", cursor: "pointer" }}
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={handleCleanup}
            disabled={cleaning}
            className="inline-flex items-center justify-center rounded-lg font-medium"
            style={{ height: "40px", paddingLeft: "14px", paddingRight: "14px", gap: "6px", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "rgba(240,85,77,0.06)", color: "#f0554d", fontSize: "13px", cursor: cleaning ? "not-allowed" : "pointer", opacity: cleaning ? 0.6 : 1 }}
          >
            <Trash2 size={14} />
            Cleanup old
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "10px", marginBottom: "1.5rem" }}>
        <StatCard label="Total entries" value={stats.total} accent="#3fe0c5" icon={Shield} />
        <StatCard label="Failed actions" value={stats.failed} accent={stats.failed > 0 ? "#f0554d" : "#4ade80"} icon={XCircle} />
        <StatCard label="Last 24 hours" value={stats.last24h} accent="#a855f7" icon={Clock} />
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center"
        style={{ padding: "1rem 1.25rem", gap: "12px", marginBottom: "1rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex items-center" style={{ gap: "8px", color: "var(--color-text-tertiary)", flexShrink: 0 }}>
          <Filter size={13} />
          <span className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>
            Filter
          </span>
        </div>

        <div className="flex items-center" style={{ gap: "8px", flex: "1 1 240px", minWidth: 0, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)" }}>
          <Search size={13} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions, users, IPs..."
            style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontSize: "12.5px", color: "var(--color-text-primary)" }}
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{ padding: "8px 12px", fontSize: "12.5px", borderRadius: "8px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", outline: "none" }}
        >
          <option value="all">All actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px 12px", fontSize: "12.5px", borderRadius: "8px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", outline: "none" }}
        >
          <option value="all">All statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>

        {(search || actionFilter !== "all" || statusFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setActionFilter("all"); setStatusFilter("all"); }}
            className="font-mono"
            style={{ marginLeft: "auto", padding: "6px 10px", fontSize: "10px", borderRadius: "6px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.14em", background: "transparent", cursor: "pointer" }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "300px" }}>
          <Loader2 size={26} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "280px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <Shield size={28} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "16px", fontWeight: 600 }}>
            {logs.length === 0 ? "No activity yet" : "No matching entries"}
          </h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>
            {logs.length === 0 ? "Actions will appear here as users interact with the system." : "Try different filters."}
          </p>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-surface-raised)" }}>
                  {["Time", "Action", "Status", "User", "IP", "Path"].map((h) => (
                    <th key={h} className="font-mono" style={{ padding: "12px 14px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <motion.tr
                    key={l._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.005, 0.3) }}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-divider)" : "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <p className="text-text-primary" style={{ fontSize: "12.5px", fontWeight: 500 }}>{timeAgo(l.createdAt)}</p>
                      <p className="font-mono" style={{ marginTop: "2px", fontSize: "10px", color: "var(--color-text-tertiary)" }}>{fmtFull(l.createdAt)}</p>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {labelForAction(l.action)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="inline-flex items-center" style={{ gap: "5px", fontSize: "11.5px", fontWeight: 600, color: l.status === "success" ? "#4ade80" : "#f0554d" }}>
                        {l.status === "success" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {l.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {l.userName ? (
                        <>
                          <p className="text-text-primary" style={{ fontSize: "12.5px" }}>{l.userName}</p>
                          <p className="font-mono" style={{ marginTop: "2px", fontSize: "10px", color: "var(--color-text-tertiary)" }}>{l.userEmail}</p>
                        </>
                      ) : (
                        <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>anonymous</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{l.ipAddress || "—"}</span>
                    </td>
                    <td style={{ padding: "12px 14px", maxWidth: "280px" }}>
                      <p className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ color: "var(--color-text-tertiary)", marginRight: "6px" }}>{l.method}</span>
                        {l.path}
                      </p>
                      {l.message && l.status === "failure" && (
                        <p style={{ marginTop: "4px", fontSize: "10.5px", color: "#f0554d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {l.message}
                        </p>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="font-mono" style={{ marginTop: "12px", fontSize: "10.5px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "right" }}>
          Showing {filtered.length} of {logs.length} entries
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <div style={{ padding: "1rem 1.25rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
      <div className="flex items-center" style={{ gap: "6px", color: "var(--color-text-tertiary)" }}>
        <Icon size={11} strokeWidth={2} />
        <p className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.14em" }}>{label}</p>
      </div>
      <p className="font-mono" style={{ marginTop: "6px", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, color: accent }}>
        {value}
      </p>
    </div>
  );
}
