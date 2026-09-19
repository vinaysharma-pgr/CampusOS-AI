import { useEffect, useState } from "react";
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
  { id: "class-test", label: "Class Test" },
  { id: "pre-university", label: "Pre-University" },
  { id: "internal", label: "Internal" },
  { id: "practical", label: "Practical" },
  { id: "viva", label: "Viva" },
  { id: "lab-viva", label: "Lab Viva" },
  { id: "quiz", label: "Quiz" },
  { id: "assignment-test", label: "Assignment Test" },
  { id: "other", label: "Other (specify below)" },
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
  showToStudents: true,
  countsTowardTotal: true,
  customType: "",
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
        {isEdit ? `Edit ${form.title || "exam"}` : "Schedule new exam"}
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

          {form.examType === "other" && (
            <div style={{ marginTop: "1rem" }}>
              <Field label="Custom type label" required hint="e.g. Surprise Quiz, Makeup Exam">
                <input value={form.customType} onChange={(e) => update("customType", e.target.value)}
                  placeholder="Type the exam type" style={inputStyle} />
              </Field>
            </div>
          )}
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

        <Section title="Visibility">
          <div className="flex flex-col" style={{ gap: "1rem" }}>
            <label className="flex items-start" style={{ gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" checked={!!form.showToStudents}
                onChange={(e) => update("showToStudents", e.target.checked)}
                style={{ marginTop: "2px", height: "16px", width: "16px", accentColor: "var(--color-primary)", cursor: "pointer", flexShrink: 0 }} />
              <span>
                <span className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600 }}>Show marks to students</span>
                <span className="text-text-secondary" style={{ display: "block", marginTop: "3px", fontSize: "12px", lineHeight: 1.5 }}>
                  When off, only admins and faculty can see marks for this exam. Use this for internal class tests, quizzes, and lab vivas.
                </span>
              </span>
            </label>

            <label className="flex items-start" style={{ gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" checked={!!form.countsTowardTotal}
                onChange={(e) => update("countsTowardTotal", e.target.checked)}
                style={{ marginTop: "2px", height: "16px", width: "16px", accentColor: "var(--color-primary)", cursor: "pointer", flexShrink: 0 }} />
              <span>
                <span className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600 }}>Counts toward student's total percentage</span>
                <span className="text-text-secondary" style={{ display: "block", marginTop: "3px", fontSize: "12px", lineHeight: 1.5 }}>
                  When off, marks are shown but excluded from the overall percentage. Use this for practice quizzes or non-credit tests.
                </span>
              </span>
            </label>
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
