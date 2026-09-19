import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, CheckCircle2, XCircle } from "lucide-react";
import { listResultsForExam, bulkSaveResults, publishResults } from "../../api/examResults.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function FacultyExamMarks() {
  const { examId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [exam, setExam] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listResultsForExam(examId);
      setExam(data.exam);
      setRows(data.students);
    } catch (err) {
      showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [examId]);

  const setMarks = (idx, field, value) => {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = rows.map((r) => ({
        studentId: r.studentId,
        marksObtained: Number(r.marksObtained) || 0,
        isAbsent: !!r.isAbsent,
        remarks: r.remarks || "",
      }));
      const res = await bulkSaveResults(examId, payload);
      showToast({ type: "success", title: "Marks saved", description: `${res.upserted + res.modified} rows updated` });
      await load();
    } catch (err) {
      showToast({ type: "error", title: "Save failed", description: err.response?.data?.message || err.message });
    } finally { setSaving(false); }
  };

  const togglePublish = async () => {
    setPublishing(true);
    try {
      await publishResults(examId, !exam.isPublished);
      showToast({ type: "success", title: exam.isPublished ? "Unpublished" : "Published" });
      await load();
    } catch (err) {
      showToast({ type: "error", title: "Publish failed", description: err.response?.data?.message || err.message });
    } finally { setPublishing(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "300px" }}>
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div>
      <Link to="/faculty/exams" className="inline-flex items-center"
        style={{ gap: "8px", fontSize: "12.5px", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
        <ArrowLeft size={13} />
        Back to exams
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: "1.5rem", gap: "12px" }}>
        <div>
          <h1 className="text-text-primary" style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em" }}>{exam.title}</h1>
          <p className="text-text-secondary" style={{ marginTop: "4px", fontSize: "13px" }}>
            {exam.courseCode} · {exam.courseName} · Max {exam.maxMarks} · Pass {exam.passingMarks}
          </p>
        </div>
        <div className="flex items-center" style={{ gap: "8px" }}>
          <button onClick={save} disabled={saving || exam.isPublished}
            className="inline-flex items-center justify-center rounded-lg font-semibold"
            style={{ height: "40px", paddingLeft: "16px", paddingRight: "16px", gap: "6px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px", opacity: saving || exam.isPublished ? 0.5 : 1 }}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save marks</>}
          </button>
          {user?.role === "admin" && (
            <button onClick={togglePublish} disabled={publishing}
              className="inline-flex items-center justify-center rounded-lg font-medium"
              style={{ height: "40px", paddingLeft: "16px", paddingRight: "16px", gap: "6px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface)", color: "var(--color-text-primary)", fontSize: "13px", opacity: publishing ? 0.6 : 1 }}>
              {exam.isPublished ? <><XCircle size={14} /> Unpublish</> : <><CheckCircle2 size={14} /> Publish</>}
            </button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>No students in this group</p>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>
            No {exam.department} Sem {exam.semester}{exam.section ? " Section " + exam.section : ""} students found.
          </p>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-surface-raised)" }}>
                  {["Student", "Roll No", "Marks", "Absent", "Remarks"].map((h) => (
                    <th key={h} className="font-mono" style={{ padding: "12px 14px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.studentId} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--color-divider)" : "none" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <p className="text-text-primary" style={{ fontSize: "13px", fontWeight: 500 }}>{r.name}</p>
                      <p className="font-mono" style={{ marginTop: "2px", fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>{r.email}</p>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span className="font-mono text-text-secondary" style={{ fontSize: "12px" }}>{r.rollNo || "—"}</span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <input type="number" min="0" max={exam.maxMarks} value={r.marksObtained}
                        onChange={(e) => setMarks(i, "marksObtained", e.target.value)}
                        disabled={exam.isPublished || r.isAbsent}
                        style={{ width: "80px", padding: "6px 10px", fontSize: "13px", color: "var(--color-text-primary)", backgroundColor: "var(--color-surface-raised)", border: "1px solid var(--color-border-strong)", borderRadius: "6px", outline: "none", opacity: exam.isPublished || r.isAbsent ? 0.5 : 1 }} />
                      <span className="font-mono text-text-tertiary" style={{ marginLeft: "8px", fontSize: "11px" }}>/ {exam.maxMarks}</span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <input type="checkbox" checked={!!r.isAbsent}
                        onChange={(e) => setMarks(i, "isAbsent", e.target.checked)}
                        disabled={exam.isPublished}
                        style={{ cursor: exam.isPublished ? "not-allowed" : "pointer", accentColor: "var(--color-primary)", width: "16px", height: "16px" }} />
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <input type="text" value={r.remarks || ""}
                        onChange={(e) => setMarks(i, "remarks", e.target.value)}
                        disabled={exam.isPublished}
                        placeholder="Optional"
                        style={{ width: "100%", minWidth: "140px", padding: "6px 10px", fontSize: "12.5px", color: "var(--color-text-primary)", backgroundColor: "var(--color-surface-raised)", border: "1px solid var(--color-border-strong)", borderRadius: "6px", outline: "none", opacity: exam.isPublished ? 0.5 : 1 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {exam.isPublished && (
        <p className="text-text-tertiary" style={{ marginTop: "1rem", fontSize: "12px" }}>
          Results are published. Unpublish to edit marks.
        </p>
      )}
    </div>
  );
}
