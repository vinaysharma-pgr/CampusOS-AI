// src/pages/faculty/FacultyAssignments.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Loader2, AlertTriangle, X, BookOpen } from "lucide-react";
import { listAssignments, createAssignment, deleteAssignment } from "../../api/assignments.js";
import { listGroups } from "../../api/groups.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import ImagePicker from "../../components/ui/ImagePicker.jsx";

export default function FacultyAssignments() {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [a, g] = await Promise.all([listAssignments(), listGroups()]);
      setItems(a);
      setGroups(g);
    } catch (err) {
      showToast({ type: "error", title: "Failed to load", description: err.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteAssignment(id);
      showToast({ type: "success", title: "Deleted" });
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
          <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>Assignments</h1>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
            {loading ? "Loading..." : items.length + " " + (items.length === 1 ? "assignment" : "assignments")}
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center rounded-lg font-semibold"
          style={{ height: "40px", paddingLeft: "16px", paddingRight: "16px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px" }}>
          <Plus size={15} strokeWidth={2.5} />
          New Assignment
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ minHeight: "280px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <BookOpen size={28} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "16px", fontWeight: 600 }}>No assignments yet</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>Post one to your class — students will see it instantly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "12px" }}>
          {items.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ padding: "1.25rem", border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
              <div className="flex items-start justify-between" style={{ gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-primary)", fontWeight: 700 }}>
                    {a.groupCode} - {a.courseName || a.courseCode}
                  </span>
                  <h3 className="text-text-primary" style={{ marginTop: "6px", fontSize: "15px", fontWeight: 600 }}>{a.title}</h3>
                  <p className="text-text-secondary" style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.5 }}>{a.description}</p>
                  {a.dueDate && (
                    <p className="font-mono" style={{ marginTop: "10px", fontSize: "11px", color: "var(--color-text-tertiary)" }}>Due: {a.dueDate}</p>
                  )}
                  {a.imageUrl && (
                    <img src={a.imageUrl} alt="" style={{ marginTop: "10px", width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--color-border)" }} />
                  )}
                </div>
                <button onClick={() => setConfirmDelete(a)}
                  style={{ flexShrink: 0, height: "30px", width: "30px", borderRadius: "8px", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", background: "transparent", cursor: "pointer" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <AssignmentForm groups={groups} onClose={() => setShowForm(false)} onSaved={async () => { setShowForm(false); await load(); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !deleting && setConfirmDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: "1.5rem", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "400px", width: "100%", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "var(--color-surface)" }}>
              <div className="flex items-start" style={{ gap: "14px" }}>
                <span style={{ height: "40px", width: "40px", flexShrink: 0, backgroundColor: "rgba(240,85,77,0.1)", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={18} />
                </span>
                <div>
                  <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>Delete this assignment?</p>
                  <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>{confirmDelete.title}</p>
                </div>
              </div>
              <div className="flex" style={{ marginTop: "1.5rem", gap: "10px" }}>
                <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="flex-1 rounded-lg font-medium" style={{ padding: "10px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", background: "transparent", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => handleDelete(confirmDelete._id)} disabled={deleting} className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold" style={{ padding: "10px 0", gap: "8px", fontSize: "13px", backgroundColor: "#f0554d", color: "#fff", border: "none", cursor: "pointer" }}>
                  {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AssignmentForm({ groups, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: "", description: "", dueDate: "", type: "assignment",
    groupCode: groups[0]?.code || "", courseCode: "", courseName: "", imageUrl: "",
  });
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast({ type: "error", title: "Title required" });
    if (!form.description.trim()) return showToast({ type: "error", title: "Description required" });
    if (!form.groupCode) return showToast({ type: "error", title: "Select a class" });

    const g = groups.find((x) => x.code === form.groupCode);
    if (!g) return showToast({ type: "error", title: "Invalid class" });

    setSaving(true);
    try {
      await createAssignment({
        ...form,
        department: g.department,
        year: g.year,
        semester: g.semester,
        section: g.section,
      });
      showToast({ type: "success", title: "Assignment posted" });
      onSaved?.();
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    } finally { setSaving(false); }
  };

  const inputStyle = { width: "100%", padding: "10px 12px", fontSize: "13.5px", color: "var(--color-text-primary)", backgroundColor: "var(--color-surface-raised)", border: "1px solid var(--color-border-strong)", borderRadius: "8px", outline: "none", fontFamily: "inherit" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: "4vh 1.5rem", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ scale: 0.97, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "640px", width: "100%", borderRadius: "1rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", overflow: "hidden" }}>
        <div className="flex items-center justify-between" style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--color-border)" }}>
          <h2 className="text-text-primary" style={{ fontSize: "17px", fontWeight: 600 }}>New Assignment</h2>
          <button onClick={onClose} aria-label="Close" style={{ height: "30px", width: "30px", color: "var(--color-text-tertiary)", background: "transparent", border: "none", cursor: "pointer" }}><X size={15} /></button>
        </div>
        <form onSubmit={submit} style={{ padding: "1.5rem" }}>
          <div className="flex flex-col" style={{ gap: "1rem" }}>
            <div>
              <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Class <span style={{ color: "#f0554d" }}>*</span></label>
              <select value={form.groupCode} onChange={(e) => update("groupCode", e.target.value)} style={inputStyle}>
                {groups.map((g) => <option key={g.code} value={g.code}>{g.code} - {g.department} Y{g.year} (Sem {g.semester})</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Title <span style={{ color: "#f0554d" }}>*</span></label>
              <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Assignment 3 - Chapter 5" style={inputStyle} />
            </div>
            <div>
              <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Description <span style={{ color: "#f0554d" }}>*</span></label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="What to do, which problems..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <div className="grid grid-cols-2" style={{ gap: "1rem" }}>
              <div>
                <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Course code</label>
                <input value={form.courseCode} onChange={(e) => update("courseCode", e.target.value)} placeholder="CS1" style={inputStyle} />
              </div>
              <div>
                <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Course name</label>
                <input value={form.courseName} onChange={(e) => update("courseName", e.target.value)} placeholder="Machine Learning" style={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-2" style={{ gap: "1rem" }}>
              <div>
                <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Type</label>
                <select value={form.type} onChange={(e) => update("type", e.target.value)} style={inputStyle}>
                  <option value="assignment">Assignment</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
              <div>
                <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Due date</label>
                <input type="date" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} style={inputStyle} />
              </div>
            </div>
            <ImagePicker label="Attach problem image (optional)" value={form.imageUrl} onChange={(url) => update("imageUrl", url)} />
          </div>
          <div className="flex" style={{ marginTop: "1.5rem", gap: "10px" }}>
            <button type="button" onClick={onClose} className="flex-1 rounded-lg font-medium" style={{ padding: "11px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", background: "transparent", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold" style={{ padding: "11px 0", gap: "8px", fontSize: "13px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", border: "none", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Posting...</> : "Post Assignment"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
