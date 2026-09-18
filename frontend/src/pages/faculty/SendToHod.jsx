// src/pages/faculty/SendToHod.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, FileCheck, FileText, X, Trash2 } from "lucide-react";
import { listHodSubmissions, createHodSubmission, deleteHodSubmission } from "../../api/hodSubmissions.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import ImagePicker from "../../components/ui/ImagePicker.jsx";

export default function SendToHod() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", type: "exam_paper", imageUrl: "" });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setItems(await listHodSubmissions()); }
    catch (err) { showToast({ type: "error", title: "Load failed", description: err.message }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast({ type: "error", title: "Title required" });
    if (!form.imageUrl && !form.description.trim()) return showToast({ type: "error", title: "Add a description or attach an image" });
    setSaving(true);
    try {
      await createHodSubmission(form);
      showToast({ type: "success", title: "Sent to HOD" });
      setForm({ title: "", description: "", type: "exam_paper", imageUrl: "" });
      await load();
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this submission?")) return;
    try { await deleteHodSubmission(id); await load(); showToast({ type: "success", title: "Deleted" }); }
    catch (err) { showToast({ type: "error", title: "Delete failed", description: err.message }); }
  };

  const inputStyle = { width: "100%", padding: "10px 12px", fontSize: "13.5px", color: "var(--color-text-primary)", backgroundColor: "var(--color-surface-raised)", border: "1px solid var(--color-border-strong)", borderRadius: "8px", outline: "none", fontFamily: "inherit" };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>Send to HOD</h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          Upload exam papers, reports, or documents directly to the Head of Department.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "1.5rem", alignItems: "start" }}>
        <form onSubmit={submit} style={{ padding: "1.5rem", border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <h2 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", marginBottom: "1rem" }}>
            New Submission
          </h2>
          <div className="flex flex-col" style={{ gap: "1rem" }}>
            <div>
              <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Title <span style={{ color: "#f0554d" }}>*</span></label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Mid-sem Exam Paper - MLT" style={inputStyle} />
            </div>
            <div>
              <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={inputStyle}>
                <option value="exam_paper">Exam Paper</option>
                <option value="report">Report</option>
                <option value="other">Other Document</option>
              </select>
            </div>
            <div>
              <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Description / Message</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Notes for HOD (optional)" style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <ImagePicker label="Attach document (optional — leave empty for text-only)" value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
          </div>
          <button type="submit" disabled={saving}
            className="w-full inline-flex items-center justify-center rounded-lg font-semibold"
            style={{ marginTop: "1.5rem", height: "44px", gap: "8px", fontSize: "13.5px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", border: "none", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : <><Send size={15} /> Send to HOD</>}
          </button>
        </form>

        <div>
          <h2 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", marginBottom: "1rem" }}>
            Your Submissions ({items.length})
          </h2>
          {loading ? (
            <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-primary)" }} />
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
              <FileText size={24} style={{ color: "var(--color-text-tertiary)", margin: "0 auto" }} />
              <p className="text-text-secondary" style={{ marginTop: "10px", fontSize: "13px" }}>No submissions yet</p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {items.map((s, i) => (
                <motion.div key={s._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ padding: "1rem", border: "1px solid var(--color-border)", borderRadius: "0.75rem", backgroundColor: "var(--color-surface)" }}>
                  <div className="flex items-start justify-between" style={{ gap: "10px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center" style={{ gap: "6px", marginBottom: "4px" }}>
                        <span className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-primary)", fontWeight: 700 }}>
                          {s.type.replace("_", " ")}
                        </span>
                        <span className="font-mono" style={{ fontSize: "9.5px", padding: "2px 8px", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: s.status === "approved" ? "rgba(34,197,94,0.15)" : s.status === "rejected" ? "rgba(240,85,77,0.15)" : s.status === "reviewed" ? "rgba(59,130,246,0.15)" : "rgba(245,165,36,0.15)", color: s.status === "approved" ? "#16a34a" : s.status === "rejected" ? "#f0554d" : s.status === "reviewed" ? "#3b82f6" : "#f5a524" }}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600 }}>{s.title}</p>
                      {s.hodNotes && (
                        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "12px", fontStyle: "italic" }}>HOD: {s.hodNotes}</p>
                      )}
                    </div>
                    <button onClick={() => remove(s._id)} aria-label="Delete"
                      style={{ height: "28px", width: "28px", borderRadius: "6px", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", background: "transparent", cursor: "pointer", flexShrink: 0 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
