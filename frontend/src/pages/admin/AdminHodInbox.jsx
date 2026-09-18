// src/pages/admin/AdminHodInbox.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FileText, X, Check, AlertTriangle, MessageSquare, Download, Printer } from "lucide-react";
import { listHodSubmissions, reviewHodSubmission } from "../../api/hodSubmissions.js";
import { useToast } from "../../contexts/ToastContext.jsx";

const STATUS_COLORS = {
  pending: { bg: "rgba(245,165,36,0.12)", border: "rgba(245,165,36,0.3)", text: "#f5a524" },
  reviewed: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", text: "#3b82f6" },
  approved: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", text: "#16a34a" },
  rejected: { bg: "rgba(240,85,77,0.12)", border: "rgba(240,85,77,0.3)", text: "#f0554d" },
};

export default function AdminHodInbox() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("reviewed");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setItems(await listHodSubmissions()); }
    catch (err) { showToast({ type: "error", title: "Load failed", description: err.message }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const open = (item) => {
    setActive(item);
    setNotes(item.hodNotes || "");
    setStatus(item.status === "pending" ? "reviewed" : item.status);
  };

  const save = async () => {
    setSaving(true);
    try {
      await reviewHodSubmission(active._id, { status, hodNotes: notes });
      showToast({ type: "success", title: "Saved" });
      setActive(null);
      await load();
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    } finally { setSaving(false); }
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const downloadImage = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "hod-submission.jpg";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const printImage = (url, title) => {
    const w = window.open("", "_blank");
    if (!w) return;
    const safeTitle = (title || "Print").replace(/[<>&]/g, "");
    const html = "<html><head><title>" + safeTitle + "</title>"
      + "<style>body{margin:0;padding:20px;text-align:center;font-family:sans-serif}h1{font-size:16px;margin:0 0 16px}img{max-width:100%;height:auto}@media print{body{padding:0}h1{margin:12px}}</style>"
      + "</head><body>"
      + "<h1>" + safeTitle + "</h1>"
      + "<img src='" + url + "' onload='window.print()' />"
      + "</body></html>";
    w.document.write(html);
    w.document.close();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: "1.5rem", gap: "12px" }}>
        <div>
          <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>HOD Inbox</h1>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
            {loading ? "Loading..." : items.length + " total" + (pendingCount ? " - " + pendingCount + " pending review" : "")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ minHeight: "280px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <FileText size={28} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "16px", fontWeight: 600 }}>Inbox is empty</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>Faculty submissions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "12px" }}>
          {items.map((s, i) => {
            const sc = STATUS_COLORS[s.status] || STATUS_COLORS.pending;
            return (
              <motion.div key={s._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => open(s)}
                style={{ padding: "1rem", border: "1px solid " + sc.border, borderRadius: "0.75rem", backgroundColor: sc.bg, cursor: "pointer", display: "flex", gap: "12px" }}>
                {s.imageUrl && (
                  <img src={s.imageUrl} alt="" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", flexShrink: 0, border: "1px solid var(--color-border)" }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center" style={{ gap: "6px", marginBottom: "4px" }}>
                    <span className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, color: sc.text }}>{s.status}</span>
                    <span className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)" }}>{s.type.replace("_", " ")}</span>
                  </div>
                  <p className="text-text-primary" style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.3 }}>{s.title}</p>
                  <p className="font-mono" style={{ marginTop: "4px", fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>
                    From {s.facultyName} - {s.department}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
            style={{ backgroundColor: "rgba(0,0,0,0.75)", padding: "4vh 1.5rem", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.97, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "640px", width: "100%", borderRadius: "1rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", overflow: "hidden" }}>
              <div className="flex items-center justify-between" style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--color-border)" }}>
                <div>
                  <h2 className="text-text-primary" style={{ fontSize: "17px", fontWeight: 600 }}>{active.title}</h2>
                  <p className="font-mono" style={{ fontSize: "10.5px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
                    From {active.facultyName} - {active.department}
                  </p>
                </div>
                <button onClick={() => setActive(null)} aria-label="Close" style={{ height: "30px", width: "30px", color: "var(--color-text-tertiary)", background: "transparent", border: "none", cursor: "pointer" }}>
                  <X size={15} />
                </button>
              </div>

              <div style={{ padding: "1.5rem" }}>
                {active.description && (
                  <p className="text-text-secondary" style={{ fontSize: "13px", lineHeight: 1.6, marginBottom: "1rem" }}>{active.description}</p>
                )}

                {active.imageUrl ? (
                  <div>
                    <div className="flex items-center justify-end" style={{ gap: "8px", marginBottom: "10px" }}>
                      <button type="button" onClick={() => downloadImage(active.imageUrl, (active.title || "submission") + ".jpg")}
                        className="inline-flex items-center justify-center rounded-lg font-medium"
                        style={{ height: "34px", paddingLeft: "14px", paddingRight: "14px", gap: "6px", fontSize: "12.5px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", cursor: "pointer" }}>
                        <Download size={13} />
                        Download
                      </button>
                      <button type="button" onClick={() => printImage(active.imageUrl, active.title)}
                        className="inline-flex items-center justify-center rounded-lg font-medium"
                        style={{ height: "34px", paddingLeft: "14px", paddingRight: "14px", gap: "6px", fontSize: "12.5px", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)", backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)", color: "var(--color-primary)", cursor: "pointer" }}>
                        <Printer size={13} />
                        Print
                      </button>
                    </div>
                    <img src={active.imageUrl} alt="Submission" style={{ width: "100%", borderRadius: "10px", border: "1px solid var(--color-border)", marginBottom: "1.5rem" }} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", borderRadius: "10px", border: "1px dashed var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "32px" }}>📝</div>
                    <p className="text-text-tertiary" style={{ marginTop: "8px", fontSize: "12px" }}>No attachment — text-only message</p>
                  </div>
                )}

                <div style={{ marginBottom: "1rem" }}>
                  <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>
                    <MessageSquare size={11} style={{ display: "inline", marginRight: "4px" }} />
                    Your notes
                  </label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    placeholder="Any observations, corrections, or comments..."
                    style={{ width: "100%", padding: "10px 12px", fontSize: "13.5px", color: "var(--color-text-primary)", backgroundColor: "var(--color-surface-raised)", border: "1px solid var(--color-border-strong)", borderRadius: "8px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Status</label>
                  <div className="grid grid-cols-3" style={{ gap: "8px" }}>
                    {["reviewed", "approved", "rejected"].map((st) => {
                      const sc = STATUS_COLORS[st];
                      const isActive = status === st;
                      return (
                        <button key={st} type="button" onClick={() => setStatus(st)}
                          className="rounded-lg font-medium capitalize"
                          style={{ padding: "10px 0", fontSize: "12.5px", border: "1px solid " + (isActive ? sc.border : "var(--color-border-strong)"), backgroundColor: isActive ? sc.bg : "transparent", color: isActive ? sc.text : "var(--color-text-secondary)", cursor: "pointer" }}>
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex" style={{ gap: "10px" }}>
                  <button onClick={() => setActive(null)} className="flex-1 rounded-lg font-medium"
                    style={{ padding: "11px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", background: "transparent", cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button onClick={save} disabled={saving}
                    className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold"
                    style={{ padding: "11px 0", gap: "8px", fontSize: "13px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", border: "none", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Save Review</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
