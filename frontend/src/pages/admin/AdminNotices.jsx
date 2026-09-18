// src/pages/admin/AdminNotices.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Bell, Loader2, AlertTriangle, X } from "lucide-react";
import { listNotices, deleteNotice, createNotice } from "../../api/notices.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import NoticeCard from "../../components/notices/NoticeCard.jsx";

const CATEGORIES = ["General", "Academic", "Exam", "Cultural", "Sports", "Placement", "Facility"];
const AUDIENCES = ["all", "students", "faculty", "department"];
const DEPARTMENTS = ["CSE", "IT", "ECE", "ME", "CE", "MBA", "MCA", "Pharmacy"];

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await listNotices({ all: true });
      setNotices(data);
    } catch (err) {
      showToast({ type: "error", title: "Failed to load", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (notice) => {
    setDeleting(true);
    try {
      await deleteNotice(notice._id);
      showToast({ type: "success", title: "Deleted" });
      setConfirmDelete(null);
      await load();
    } catch (err) {
      showToast({ type: "error", title: "Delete failed", description: err.response?.data?.message || err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: "1.5rem", gap: "12px" }}>
        <div>
          <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Notices
          </h1>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
            {loading ? "Loading…" : `${notices.length} active notices`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center rounded-lg font-semibold transition-all hover:opacity-90"
          style={{ height: "40px", paddingLeft: "16px", paddingRight: "16px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px" }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Post Notice
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : notices.length === 0 ? (
        <EmptyNotices onPost={() => setShowForm(true)} />
      ) : (
        <div className="flex flex-col" style={{ gap: "10px" }}>
          {notices.map((n, i) => (
            <NoticeCard
              key={n._id}
              notice={n}
              index={i}
              showActions
              onDelete={(n) => setConfirmDelete(n)}
            />
          ))}
        </div>
      )}

      {/* Create form modal */}
      <AnimatePresence>
        {showForm && (
          <NoticeFormModal
            onClose={() => setShowForm(false)}
            onSaved={async () => { setShowForm(false); await load(); }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !deleting && setConfirmDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: "1.5rem", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "420px", width: "100%", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "var(--color-surface)" }}
            >
              <div className="flex items-start" style={{ gap: "14px" }}>
                <span className="flex items-center justify-center" style={{ height: "40px", width: "40px", flexShrink: 0, backgroundColor: "rgba(240,85,77,0.1)", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", borderRadius: "10px" }}>
                  <AlertTriangle size={18} />
                </span>
                <div>
                  <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>Delete this notice?</p>
                  <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.5 }}>{confirmDelete.title}</p>
                </div>
              </div>
              <div className="flex" style={{ marginTop: "1.5rem", gap: "10px" }}>
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleting}
                  className="flex-1 rounded-lg font-medium"
                  style={{ padding: "10px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)" }}
                >Cancel</button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold"
                  style={{ padding: "10px 0", gap: "8px", fontSize: "13px", backgroundColor: "#f0554d", color: "#fff", opacity: deleting ? 0.6 : 1 }}
                >
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

// ═══════════════════════════════════════════════
//  NOTICE FORM MODAL
// ═══════════════════════════════════════════════
function NoticeFormModal({ onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "General",
    priority: "normal",
    targetAudience: "all",
    targetDepartment: null,
    expiresAt: "",
  });
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast({ type: "error", title: "Title required" });
    if (!form.body.trim()) return showToast({ type: "error", title: "Body required" });
    if (form.targetAudience === "department" && !form.targetDepartment) {
      return showToast({ type: "error", title: "Pick a department" });
    }

    setSaving(true);
    try {
      await createNotice({
        ...form,
        targetDepartment: form.targetAudience === "department" || form.targetAudience === "students" || form.targetAudience === "faculty"
          ? form.targetDepartment || null
          : null,
        expiresAt: form.expiresAt || null,
      });
      showToast({ type: "success", title: "Notice posted" });
      onSaved?.();
    } catch (err) {
      const apiErr = err.response?.data;
      const detailed = apiErr?.errors?.[0]?.message;
      showToast({
        type: "error",
        title: apiErr?.message || "Failed",
        description: detailed || apiErr?.message || err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: "4vh 1.5rem", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.97, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "640px",
          width: "100%",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          overflow: "hidden",
        }}
      >
        <div className="flex items-center justify-between" style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--color-border)" }}>
          <h2 className="text-text-primary" style={{ fontSize: "17px", fontWeight: 600 }}>Post a new notice</h2>
          <button onClick={onClose} aria-label="Close" className="flex items-center justify-center" style={{ height: "30px", width: "30px", color: "var(--color-text-tertiary)" }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
          <div className="flex flex-col" style={{ gap: "1rem" }}>
            <Field label="Title" required>
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g., Mid-semester exam schedule released"
                style={inputStyle}
              />
            </Field>

            <Field label="Body" required>
              <textarea
                value={form.body}
                onChange={(e) => update("body", e.target.value)}
                rows={5}
                placeholder="Write the full notice here…"
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </Field>

            <div className="grid grid-cols-2" style={{ gap: "1rem" }}>
              <Field label="Category">
                <select value={form.category} onChange={(e) => update("category", e.target.value)} style={inputStyle}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select value={form.priority} onChange={(e) => update("priority", e.target.value)} style={inputStyle}>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2" style={{ gap: "1rem" }}>
              <Field label="Audience">
                <select value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} style={inputStyle}>
                  {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Department (optional)">
                <select value={form.targetDepartment || ""} onChange={(e) => update("targetDepartment", e.target.value || null)} style={inputStyle}>
                  <option value="">— None —</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Expires at (optional)">
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => update("expiresAt", e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>

          <div className="flex" style={{ marginTop: "1.5rem", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg font-medium"
              style={{ padding: "11px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)" }}
            >Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold"
              style={{ padding: "11px 0", gap: "8px", fontSize: "13px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Posting…</> : "Post Notice"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>
        {label} {required && <span style={{ color: "#f0554d" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "13.5px",
  color: "var(--color-text-primary)",
  backgroundColor: "var(--color-surface-raised)",
  border: "1px solid var(--color-border-strong)",
  borderRadius: "8px",
  outline: "none",
  fontFamily: "inherit",
};

function EmptyNotices({ onPost }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ minHeight: "280px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}
    >
      <span className="flex items-center justify-center" style={{ height: "48px", width: "48px", backgroundColor: "rgba(63,224,197,0.1)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)", borderRadius: "12px" }}>
        <Bell size={20} />
      </span>
      <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "16px", fontWeight: 600 }}>No notices yet</h3>
      <p className="text-text-secondary" style={{ marginTop: "6px", maxWidth: "36ch", fontSize: "13px", lineHeight: 1.5 }}>
        Post the first notice — it appears on every student's dashboard instantly.
      </p>
      <button
        onClick={onPost}
        className="inline-flex items-center justify-center rounded-lg font-semibold"
        style={{ marginTop: "1.25rem", height: "40px", paddingLeft: "18px", paddingRight: "18px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px" }}
      >
        <Plus size={15} strokeWidth={2.5} />
        Post Notice
      </button>
    </div>
  );
}
