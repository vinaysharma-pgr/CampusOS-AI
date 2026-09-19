import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Loader2, Upload, FileText, X, AlertTriangle,
  BookOpen, Presentation, FileQuestion, Library, File as FileIcon,
} from "lucide-react";
import { listMyMaterials, createMaterial, deleteMaterial } from "../../api/materials.js";
import { uploadDocument } from "../../api/upload.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";

const CATEGORIES = [
  { id: "notes",     label: "Class Notes",    icon: BookOpen },
  { id: "slides",    label: "Slides",         icon: Presentation },
  { id: "pyq",       label: "Previous Year Q",icon: FileQuestion },
  { id: "reference", label: "Reference",      icon: Library },
  { id: "other",     label: "Other",          icon: FileIcon },
];

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

export default function FacultyMaterials() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await listMyMaterials());
    } catch (err) {
      showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteMaterial(id);
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
          <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>Study Materials</h1>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
            {loading ? "Loading…" : `${items.length} upload${items.length === 1 ? "" : "s"} for your department`}
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center rounded-lg font-semibold"
          style={{ height: "40px", paddingLeft: "16px", paddingRight: "16px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px" }}>
          <Plus size={15} strokeWidth={2.5} />
          Upload Material
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ minHeight: "280px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <Upload size={28} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "16px", fontWeight: 600 }}>No uploads yet</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>Upload notes, slides, or PYQs — students in your department will see them instantly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "12px" }}>
          {items.map((m, i) => (
            <motion.div key={m._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              style={{ padding: "1.1rem 1.25rem", borderRadius: "0.85rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", display: "flex", gap: "14px" }}>
              <span className="flex items-center justify-center shrink-0"
                style={{ height: "44px", width: "44px", borderRadius: "10px", backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)" }}>
                <FileText size={18} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center" style={{ gap: "6px", marginBottom: "4px" }}>
                  <span className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--color-primary)" }}>
                    {m.courseCode}
                  </span>
                  <span className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)" }}>
                    {CATEGORY_LABELS[m.category] || m.category}
                  </span>
                  {m.section && <span className="font-mono" style={{ fontSize: "9.5px", color: "var(--color-text-tertiary)" }}>· Sec {m.section}</span>}
                </div>
                <p className="text-text-primary" style={{ fontSize: "14px", fontWeight: 600 }}>{m.title}</p>
                {m.description && (
                  <p className="text-text-secondary" style={{ marginTop: "4px", fontSize: "12.5px", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {m.description}
                  </p>
                )}
                <div className="flex items-center" style={{ marginTop: "8px", gap: "10px", fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>
                  <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Open</a>
                  <span>·</span>
                  <span>{new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              </div>
              <button onClick={() => setConfirmDelete(m)} aria-label="Delete"
                style={{ flexShrink: 0, height: "30px", width: "30px", borderRadius: "8px", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", background: "transparent", cursor: "pointer" }}>
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && <UploadModal onClose={() => setShowForm(false)} onSaved={async () => { setShowForm(false); await load(); }} user={user} />}
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
                  <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>Delete this material?</p>
                  <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>{confirmDelete.title}</p>
                </div>
              </div>
              <div className="flex" style={{ marginTop: "1.5rem", gap: "10px" }}>
                <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="flex-1 rounded-lg font-medium" style={{ padding: "10px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", background: "transparent", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => handleDelete(confirmDelete._id)} disabled={deleting} className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold" style={{ padding: "10px 0", gap: "8px", fontSize: "13px", backgroundColor: "#f0554d", color: "#fff", border: "none", cursor: "pointer" }}>
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

function UploadModal({ onClose, onSaved, user }) {
  const { showToast } = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "notes",
    courseCode: "",
    courseName: "",
    semester: user?.semester || "5",
    section: user?.section || "",
    fileUrl: "",
    fileName: "",
    fileSize: 0,
    mimeType: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadDocument(file);
      setForm((f) => ({
        ...f,
        fileUrl: res.url,
        fileName: res.originalName || file.name,
        fileSize: res.size,
        mimeType: res.mime,
      }));
      if (!form.title) update("title", file.name.replace(/\.[^.]+$/, ""));
      showToast({ type: "success", title: "File uploaded" });
    } catch (err) {
      const status = err.response?.status;
      if (status === 413) {
        showToast({ type: "error", title: "Storage quota exceeded", description: err.response?.data?.message });
      } else if (status === 429) {
        showToast({ type: "error", title: "Slow down", description: err.response?.data?.message });
      } else {
        showToast({ type: "error", title: "Upload failed", description: err.response?.data?.message || err.message });
      }
    } finally { setUploading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast({ type: "error", title: "Title required" });
    if (!form.courseCode.trim()) return showToast({ type: "error", title: "Course code required" });
    if (!form.fileUrl) return showToast({ type: "error", title: "Upload a file first" });

    setSaving(true);
    try {
      await createMaterial(form);
      showToast({ type: "success", title: "Material added" });
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
          <h2 className="text-text-primary" style={{ fontSize: "17px", fontWeight: 600 }}>Upload Study Material</h2>
          <button onClick={onClose} aria-label="Close" style={{ height: "30px", width: "30px", color: "var(--color-text-tertiary)", background: "transparent", border: "none", cursor: "pointer" }}><X size={15} /></button>
        </div>
        <form onSubmit={submit} style={{ padding: "1.5rem" }}>
          <div className="flex flex-col" style={{ gap: "1rem" }}>
            <div>
              <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>File <span style={{ color: "#f0554d" }}>*</span></label>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*" style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="inline-flex items-center justify-center rounded-lg font-medium"
                style={{ width: "100%", padding: "14px", gap: "8px", fontSize: "13px", border: "1px dashed var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", opacity: uploading ? 0.6 : 1, cursor: "pointer" }}>
                {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : form.fileUrl ? <><FileText size={14} /> {form.fileName} ({(form.fileSize / 1024).toFixed(0)} KB)</> : <><Upload size={14} /> Choose file (PDF, DOCX, PPTX, TXT, image — max 25 MB)</>}
              </button>
            </div>

            <div>
              <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Title <span style={{ color: "#f0554d" }}>*</span></label>
              <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Unit 3 - Linked Lists" style={inputStyle} />
            </div>

            <div className="grid grid-cols-2" style={{ gap: "1rem" }}>
              <div>
                <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Category</label>
                <select value={form.category} onChange={(e) => update("category", e.target.value)} style={inputStyle}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Course code <span style={{ color: "#f0554d" }}>*</span></label>
                <input value={form.courseCode} onChange={(e) => update("courseCode", e.target.value.toUpperCase())} placeholder="CS301" style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Course name</label>
              <input value={form.courseName} onChange={(e) => update("courseName", e.target.value)} placeholder="Design & Analysis of Algorithms" style={inputStyle} />
            </div>

            <div className="grid grid-cols-2" style={{ gap: "1rem" }}>
              <div>
                <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Semester</label>
                <select value={form.semester} onChange={(e) => update("semester", e.target.value)} style={inputStyle}>
                  {["1","2","3","4","5","6","7","8"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Section <span style={{ color: "var(--color-text-tertiary)", fontSize: "11px" }}>(blank = all)</span></label>
                <input value={form.section} onChange={(e) => update("section", e.target.value)} placeholder="CS1" style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3}
                placeholder="Optional notes for students…" style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
            </div>
          </div>

          <div className="flex" style={{ marginTop: "1.5rem", gap: "10px" }}>
            <button type="button" onClick={onClose} className="flex-1 rounded-lg font-medium" style={{ padding: "11px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", background: "transparent", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving || uploading} className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold" style={{ padding: "11px 0", gap: "8px", fontSize: "13px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", border: "none", cursor: "pointer", opacity: (saving || uploading) ? 0.6 : 1 }}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Publish Material"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
