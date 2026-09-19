import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Calendar, Loader2, Search, Clock, MapPin, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { listExams, deleteExam } from "../../api/exams.js";
import { useToast } from "../../contexts/ToastContext.jsx";

const TYPE_COLORS = {
  "mid-sem": "#3b82f6",
  "end-sem": "#a855f7",
  "practical": "#10b981",
  "viva": "#f97316",
  "quiz": "#ec4899",
  "assignment-test": "#eab308",
};

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await listExams();
      setExams(data);
      setFiltered(data);
    } catch (err) {
      showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) return setFiltered(exams);
    const q = search.toLowerCase();
    setFiltered(exams.filter((e) =>
      (e.title || "").toLowerCase().includes(q) ||
      (e.courseCode || "").toLowerCase().includes(q) ||
      (e.courseName || "").toLowerCase().includes(q) ||
      (e.room || "").toLowerCase().includes(q)
    ));
  }, [search, exams]);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteExam(id);
      showToast({ type: "success", title: "Deleted", description: "Exam removed" });
      setConfirmDelete(null);
      await load();
    } catch (err) {
      showToast({ type: "error", title: "Delete failed", description: err.response?.data?.message || err.message });
    } finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: "1.5rem", gap: "12px" }}>
        <div>
          <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>Exams</h1>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
            {loading ? "Loading…" : `${exams.length} ${exams.length === 1 ? "exam" : "exams"} scheduled`}
          </p>
        </div>
        <Link to="/admin/exams/new"
          className="inline-flex items-center justify-center rounded-lg font-semibold transition-all hover:opacity-90"
          style={{ height: "40px", paddingLeft: "16px", paddingRight: "16px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px" }}>
          <Plus size={15} strokeWidth={2.5} />
          Add Exam
        </Link>
      </div>

      {exams.length > 0 && (
        <div className="flex items-center"
          style={{ maxWidth: "360px", padding: "8px 12px", gap: "10px", marginBottom: "1rem", borderRadius: "0.75rem", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface)" }}>
          <Search size={14} style={{ color: "var(--color-text-tertiary)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exams…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13px", color: "var(--color-text-primary)" }} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  {["Exam", "Type", "Date & Time", "Group", "Status", ""].map((h) => (
                    <th key={h} className="font-mono text-text-tertiary"
                      style={{ padding: "14px 16px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const color = TYPE_COLORS[e.examType] || "#3fe0c5";
                  return (
                    <motion.tr key={e._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: i * 0.02 }}
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none" }}
                      onMouseEnter={(ev) => { ev.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"; }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.backgroundColor = "transparent"; }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div className="flex items-center" style={{ gap: "12px" }}>
                          <span className="flex items-center justify-center rounded-lg shrink-0"
                            style={{ height: "38px", width: "38px", backgroundColor: `${color}15`, color, border: `1px solid ${color}40` }}>
                            <Calendar size={15} />
                          </span>
                          <div>
                            <p className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600 }}>{e.title}</p>
                            <p className="font-mono" style={{ marginTop: "2px", fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>
                              {e.courseCode} · {e.courseName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span className="font-mono"
                          style={{ padding: "3px 8px", fontSize: "10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.1em", backgroundColor: `${color}15`, color, border: `1px solid ${color}40` }}>
                          {e.examType}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <p className="font-mono text-text-secondary" style={{ fontSize: "12px" }}>{e.date}</p>
                        <p className="flex items-center text-text-tertiary" style={{ marginTop: "3px", gap: "4px", fontSize: "10.5px" }}>
                          <Clock size={10} /> {e.startTime} · {e.durationMinutes}m
                        </p>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <p className="font-mono text-text-secondary" style={{ fontSize: "11.5px" }}>
                          {e.department} · Sem {e.semester}{e.section ? ` · ${e.section}` : ""}
                        </p>
                        {e.room && (
                          <p className="flex items-center text-text-tertiary" style={{ marginTop: "3px", gap: "4px", fontSize: "10.5px" }}>
                            <MapPin size={10} /> {e.room}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div className="flex flex-col" style={{ gap: "3px" }}>
                          {e.isPublished ? (
                            <span className="inline-flex items-center" style={{ gap: "5px", fontSize: "11.5px", fontWeight: 600, color: "#4ade80" }}>
                              <CheckCircle2 size={12} /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center" style={{ gap: "5px", fontSize: "11.5px", fontWeight: 600, color: "#f5a524" }}>
                              <XCircle size={12} /> Draft
                            </span>
                          )}
                          {e.showToStudents === false && (
                            <span className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)" }}>
                              Internal only
                            </span>
                          )}
                          {e.countsTowardTotal === false && (
                            <span className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)" }}>
                              Not counted
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div className="flex items-center justify-end" style={{ gap: "6px" }}>
                          <Link to={`/admin/exams/${e._id}/edit`} aria-label="Edit"
                            className="flex items-center justify-center rounded-md"
                            style={{ height: "30px", width: "30px", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-strong)" }}>
                            <Edit2 size={13} />
                          </Link>
                          <button onClick={() => setConfirmDelete(e)} aria-label="Delete"
                            className="flex items-center justify-center rounded-md"
                            style={{ height: "30px", width: "30px", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !deleting && setConfirmDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: "1.5rem", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(ev) => ev.stopPropagation()}
              style={{ maxWidth: "420px", width: "100%", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "var(--color-surface)" }}>
              <div className="flex items-start" style={{ gap: "14px" }}>
                <span className="flex items-center justify-center shrink-0"
                  style={{ height: "40px", width: "40px", backgroundColor: "rgba(240,85,77,0.1)", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", borderRadius: "10px" }}>
                  <AlertTriangle size={18} />
                </span>
                <div>
                  <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>Delete "{confirmDelete.title}"?</p>
                  <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.5 }}>
                    Any marks already entered for this exam will be hidden.
                  </p>
                </div>
              </div>
              <div className="flex" style={{ marginTop: "1.5rem", gap: "10px" }}>
                <button onClick={() => setConfirmDelete(null)} disabled={deleting}
                  className="flex-1 rounded-lg font-medium"
                  style={{ padding: "10px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", background: "transparent" }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete._id)} disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold"
                  style={{ padding: "10px 0", gap: "8px", fontSize: "13px", backgroundColor: "#f0554d", color: "#ffffff", opacity: deleting ? 0.6 : 1 }}>
                  {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center"
      style={{ minHeight: "320px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
      <span className="flex items-center justify-center rounded-xl"
        style={{ height: "56px", width: "56px", backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}>
        <Calendar size={24} strokeWidth={1.75} />
      </span>
      <h2 className="text-text-primary" style={{ marginTop: "1.25rem", fontSize: "18px", fontWeight: 600 }}>No exams scheduled</h2>
      <p className="text-text-secondary" style={{ marginTop: "8px", maxWidth: "36ch", fontSize: "13.5px", lineHeight: 1.6 }}>
        Create the first exam — students and faculty will see it instantly.
      </p>
      <Link to="/admin/exams/new"
        className="inline-flex items-center justify-center rounded-lg font-semibold"
        style={{ marginTop: "1.5rem", height: "42px", paddingLeft: "22px", paddingRight: "22px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px" }}>
        <Plus size={15} strokeWidth={2.5} />
        Add Exam
      </Link>
    </div>
  );
}
