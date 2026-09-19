import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

function writeIfMissing(rel, content) {
  const full = path.join(ROOT, rel);
  if (fs.existsSync(full)) { info(rel + " already exists - skipping"); return; }
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  ok("created " + rel);
}

function patch(rel, from, to) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) { fail(rel + " missing"); return; }
  let src = fs.readFileSync(full, "utf8");
  if (src.includes(to)) { info(rel + " already patched"); return; }
  if (!src.includes(from)) { fail(rel + " anchor not found"); return; }
  src = src.replace(from, to);
  fs.writeFileSync(full, src, "utf8");
  ok("patched " + rel);
}

console.log("");
console.log("PHASE 19 - STAGE 4 - Frontend admin exams");
console.log("");

writeIfMissing("frontend/src/api/exams.js", `import apiClient from "./client.js";

export async function listExams({ department, semester, section, type, from, to } = {}) {
  const params = {};
  if (department) params.department = department;
  if (semester) params.semester = semester;
  if (section) params.section = section;
  if (type) params.type = type;
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await apiClient.get("/exams", { params });
  return data.data.exams;
}

export async function listUpcomingExams() {
  const { data } = await apiClient.get("/exams/upcoming");
  return data.data.exams;
}

export async function getExam(id) {
  const { data } = await apiClient.get(\`/exams/\${id}\`);
  return data.data.exam;
}

export async function createExam(payload) {
  const { data } = await apiClient.post("/exams", payload);
  return data.data.exam;
}

export async function updateExam(id, payload) {
  const { data } = await apiClient.put(\`/exams/\${id}\`, payload);
  return data.data.exam;
}

export async function deleteExam(id) {
  const { data } = await apiClient.delete(\`/exams/\${id}\`);
  return data.data;
}
`);

writeIfMissing("frontend/src/api/examResults.js", `import apiClient from "./client.js";

export async function listResultsForExam(examId) {
  const { data } = await apiClient.get(\`/exam-results/exam/\${examId}\`);
  return data.data;
}

export async function bulkSaveResults(examId, results) {
  const { data } = await apiClient.post(\`/exam-results/exam/\${examId}/bulk\`, { results });
  return data.data;
}

export async function publishResults(examId, publish = true) {
  const { data } = await apiClient.put(\`/exam-results/exam/\${examId}/publish\`, { publish });
  return data.data;
}

export async function getMyResults() {
  const { data } = await apiClient.get("/exam-results/mine");
  return data.data;
}

export async function getExamStats(examId) {
  const { data } = await apiClient.get(\`/exam-results/exam/\${examId}/stats\`);
  return data.data;
}
`);

writeIfMissing("frontend/src/pages/admin/AdminExams.jsx", `import { useEffect, useState } from "react";
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
            {loading ? "Loading…" : \`\${exams.length} \${exams.length === 1 ? "exam" : "exams"} scheduled\`}
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
                            style={{ height: "38px", width: "38px", backgroundColor: \`\${color}15\`, color, border: \`1px solid \${color}40\` }}>
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
                          style={{ padding: "3px 8px", fontSize: "10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.1em", backgroundColor: \`\${color}15\`, color, border: \`1px solid \${color}40\` }}>
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
                          {e.department} · Sem {e.semester}{e.section ? \` · \${e.section}\` : ""}
                        </p>
                        {e.room && (
                          <p className="flex items-center text-text-tertiary" style={{ marginTop: "3px", gap: "4px", fontSize: "10.5px" }}>
                            <MapPin size={10} /> {e.room}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {e.isPublished ? (
                          <span className="inline-flex items-center" style={{ gap: "5px", fontSize: "11.5px", fontWeight: 600, color: "#4ade80" }}>
                            <CheckCircle2 size={12} /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center" style={{ gap: "5px", fontSize: "11.5px", fontWeight: 600, color: "#f5a524" }}>
                            <XCircle size={12} /> Draft
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div className="flex items-center justify-end" style={{ gap: "6px" }}>
                          <Link to={\`/admin/exams/\${e._id}/edit\`} aria-label="Edit"
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
`);

writeIfMissing("frontend/src/pages/admin/AdminExamForm.jsx", `import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createExam, updateExam, getExam } from "../../api/exams.js";
import { useToast } from "../../contexts/ToastContext.jsx";

const DEPARTMENTS = ["CSE", "IT", "ECE", "ME", "CE", "MBA", "MCA", "Pharmacy"];
const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const SECTIONS = ["", "A", "B", "C"];
const EXAM_TYPES = [
  { id: "mid-sem", label: "Mid Semester" },
  { id: "end-sem", label: "End Semester" },
  { id: "practical", label: "Practical" },
  { id: "viva", label: "Viva" },
  { id: "quiz", label: "Quiz" },
  { id: "assignment-test", label: "Assignment Test" },
];

const EMPTY = {
  title: "",
  courseCode: "",
  courseName: "",
  examType: "mid-sem",
  date: "",
  startTime: "10:00",
  durationMinutes: 120,
  room: "",
  department: "CSE",
  semester: "5",
  section: "",
  maxMarks: 100,
  passingMarks: 40,
};

export default function AdminExamForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getExam(id)
      .then((e) => setForm({ ...EMPTY, ...e }))
      .catch((err) => {
        showToast({ type: "error", title: "Not found", description: err.response?.data?.message || err.message });
        navigate("/admin/exams");
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, showToast]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateExam(id, form);
        showToast({ type: "success", title: "Updated", description: form.title });
      } else {
        await createExam(form);
        showToast({ type: "success", title: "Created", description: form.title });
      }
      navigate("/admin/exams");
    } catch (err) {
      showToast({
        type: "error",
        title: isEdit ? "Update failed" : "Create failed",
        description: err.response?.data?.message || err.message,
      });
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "300px" }}>
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Link to="/admin/exams" className="inline-flex items-center"
        style={{ gap: "8px", fontSize: "12.5px", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
        <ArrowLeft size={13} />
        Back to exams
      </Link>

      <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
        {isEdit ? \`Edit \${form.title || "exam"}\` : "Schedule new exam"}
      </h1>
      <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
        {isEdit ? "Update details and save." : "Fill the details below — it appears to students and faculty instantly."}
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "2rem", maxWidth: "800px" }}>
        <Section title="Basic information">
          <Field label="Exam title" required>
            <input required value={form.title} onChange={(e) => update("title", e.target.value)}
              placeholder="Mid-Sem CS301" style={inputStyle} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1rem", marginTop: "1rem" }}>
            <Field label="Course code" required>
              <input required value={form.courseCode} onChange={(e) => update("courseCode", e.target.value.toUpperCase())}
                placeholder="CS301" style={inputStyle} />
            </Field>
            <Field label="Course name" required>
              <input required value={form.courseName} onChange={(e) => update("courseName", e.target.value)}
                placeholder="Design & Analysis of Algorithms" style={inputStyle} />
            </Field>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <Field label="Exam type" required>
              <select value={form.examType} onChange={(e) => update("examType", e.target.value)} style={inputStyle}>
                {EXAM_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="When and where">
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "1rem" }}>
            <Field label="Date" required>
              <input required type="date" value={form.date} onChange={(e) => update("date", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Start time" required>
              <input required type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Duration (min)">
              <input type="number" min="15" value={form.durationMinutes} onChange={(e) => update("durationMinutes", Number(e.target.value))} style={inputStyle} />
            </Field>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <Field label="Room / venue">
              <input value={form.room} onChange={(e) => update("room", e.target.value)} placeholder="B-201" style={inputStyle} />
            </Field>
          </div>
        </Section>

        <Section title="Target group">
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "1rem" }}>
            <Field label="Department" required>
              <select value={form.department} onChange={(e) => update("department", e.target.value)} style={inputStyle}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Semester" required>
              <select value={form.semester} onChange={(e) => update("semester", e.target.value)} style={inputStyle}>
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Section" hint="Leave empty for all">
              <select value={form.section} onChange={(e) => update("section", e.target.value)} style={inputStyle}>
                {SECTIONS.map((s) => <option key={s} value={s}>{s || "— All —"}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Marks">
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1rem" }}>
            <Field label="Maximum marks" required>
              <input type="number" min="1" value={form.maxMarks} onChange={(e) => update("maxMarks", Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Passing marks" required>
              <input type="number" min="0" value={form.passingMarks} onChange={(e) => update("passingMarks", Number(e.target.value))} style={inputStyle} />
            </Field>
          </div>
        </Section>

        <div className="flex flex-col sm:flex-row" style={{ gap: "10px", marginTop: "2rem" }}>
          <button type="submit" disabled={saving}
            className="inline-flex items-center justify-center rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ height: "44px", paddingLeft: "24px", paddingRight: "24px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13.5px" }}>
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> {isEdit ? "Save changes" : "Create exam"}</>}
          </button>
          <Link to="/admin/exams"
            className="inline-flex items-center justify-center rounded-lg font-medium"
            style={{ height: "44px", paddingLeft: "24px", paddingRight: "24px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", fontSize: "13.5px" }}>
            Cancel
          </Link>
        </div>
      </form>
    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ padding: "1.5rem", marginBottom: "1rem", border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
      <h2 className="font-mono text-text-tertiary" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "1rem" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children, required, hint }) {
  return (
    <div>
      <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>
        {label} {required && <span style={{ color: "#f0554d" }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-text-tertiary" style={{ marginTop: "4px", fontSize: "11px" }}>{hint}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", fontSize: "13.5px",
  color: "var(--color-text-primary)", backgroundColor: "var(--color-surface-raised)",
  border: "1px solid var(--color-border-strong)", borderRadius: "8px",
  outline: "none", fontFamily: "inherit",
};
`);

// --- Patch AdminLayout: add nav + shortcut, fix Users duplicate ---
patch(
  "frontend/src/layouts/AdminLayout.jsx",
  'AuditLogs, Users, LogOut, ArrowLeft, Command, Search, Settings, CalendarClock, Inbox, ClipboardCheck, ScrollText,',
  'AuditLogs, Users, LogOut, ArrowLeft, Command, Search, Settings, CalendarClock, Inbox, ClipboardCheck, ScrollText, GraduationCap,'
);

patch(
  "frontend/src/layouts/AdminLayout.jsx",
  '  { label: "Audit Logs", to: "/admin/audit-logs", icon: ScrollText, shortcut: "8" },\n  { label: "Users", to: "/admin/users", icon: Users, shortcut: "6" },',
  '  { label: "Audit Logs", to: "/admin/audit-logs", icon: ScrollText, shortcut: "8" },\n  { label: "Exams", to: "/admin/exams", icon: GraduationCap, shortcut: "9" },\n  { label: "Users", to: "/admin/users", icon: Users, shortcut: "0" },'
);

patch(
  "frontend/src/layouts/AdminLayout.jsx",
  'if (e.altKey && ["1", "2", "3", "4", "5", "6", "7", "8"].includes(e.key)) {',
  'if (e.altKey && ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(e.key)) {'
);

// --- Patch AppRoutes: add routes for AdminExams + AdminExamForm ---
patch(
  "frontend/src/routes/AppRoutes.jsx",
  'import AdminTimetable from "../pages/admin/AdminTimetable";',
  'import AdminTimetable from "../pages/admin/AdminTimetable";\nimport AdminExams from "../pages/admin/AdminExams";\nimport AdminExamForm from "../pages/admin/AdminExamForm";'
);

patch(
  "frontend/src/routes/AppRoutes.jsx",
  '        <Route path="timetable" element={<AdminTimetable />} />',
  '        <Route path="timetable" element={<AdminTimetable />} />\n        <Route path="exams" element={<AdminExams />} />\n        <Route path="exams/new" element={<AdminExamForm />} />\n        <Route path="exams/:id/edit" element={<AdminExamForm />} />'
);

console.log("");
console.log("Done.");