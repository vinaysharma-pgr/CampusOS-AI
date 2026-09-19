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
console.log("PHASE 19 - STAGE 5 - Faculty marks + Student exams/results");
console.log("");

// ---------- FacultyExams ----------
writeIfMissing("frontend/src/pages/faculty/FacultyExams.jsx", `import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Loader2, Clock, MapPin, CheckCircle2, XCircle, Edit2 } from "lucide-react";
import { listExams } from "../../api/exams.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function FacultyExams() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listExams({ department: user?.department })
      .then(setExams)
      .catch((err) => showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message }))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>Exams</h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading ? "Loading…" : \`\${exams.length} exam\${exams.length === 1 ? "" : "s"} in your department\`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <Calendar size={28} style={{ color: "var(--color-text-tertiary)" }} />
          <p className="text-text-primary" style={{ marginTop: "1rem", fontSize: "15px", fontWeight: 600 }}>No exams yet</p>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>Your department admin hasn't scheduled any exams.</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "10px" }}>
          {exams.map((e, i) => (
            <motion.div key={e._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex flex-wrap items-center"
              style={{ padding: "1rem 1.25rem", gap: "16px", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div className="flex items-center" style={{ gap: "8px", marginBottom: "4px" }}>
                  <span className="font-mono" style={{ padding: "2px 7px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                    {e.courseCode}
                  </span>
                  <span className="font-mono" style={{ fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{e.examType}</span>
                  {e.isPublished ? (
                    <span className="inline-flex items-center" style={{ gap: "4px", fontSize: "10px", fontWeight: 700, color: "#4ade80" }}>
                      <CheckCircle2 size={10} /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center" style={{ gap: "4px", fontSize: "10px", fontWeight: 700, color: "#f5a524" }}>
                      <XCircle size={10} /> Draft
                    </span>
                  )}
                </div>
                <p className="text-text-primary" style={{ fontSize: "14px", fontWeight: 600 }}>{e.title}</p>
                <div className="flex items-center flex-wrap" style={{ marginTop: "6px", gap: "12px", fontSize: "11.5px", color: "var(--color-text-tertiary)" }}>
                  <span className="flex items-center" style={{ gap: "4px" }}><Calendar size={10} /> {e.date}</span>
                  <span className="flex items-center" style={{ gap: "4px" }}><Clock size={10} /> {e.startTime}</span>
                  {e.room && <span className="flex items-center" style={{ gap: "4px" }}><MapPin size={10} /> {e.room}</span>}
                  <span>· {e.department} · Sem {e.semester}{e.section ? " · " + e.section : ""}</span>
                </div>
              </div>
              <Link to={\`/faculty/exams/\${e._id}/marks\`}
                className="inline-flex items-center justify-center rounded-lg font-semibold"
                style={{ height: "38px", paddingLeft: "16px", paddingRight: "16px", gap: "6px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "12.5px" }}>
                <Edit2 size={13} />
                {e.isPublished ? "View marks" : "Enter marks"}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// ---------- FacultyExamMarks ----------
writeIfMissing("frontend/src/pages/faculty/FacultyExamMarks.jsx", `import { useEffect, useState } from "react";
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
      showToast({ type: "success", title: "Marks saved", description: \`\${res.upserted + res.modified} rows updated\` });
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
`);

// ---------- StudentExams ----------
writeIfMissing("frontend/src/pages/student/StudentExams.jsx", `import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2, Clock, MapPin } from "lucide-react";
import { listUpcomingExams } from "../../api/exams.js";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function StudentExams() {
  const { showToast } = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUpcomingExams()
      .then(setExams)
      .catch((err) => showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message }))
      .finally(() => setLoading(false));
  }, []);

  const grouped = exams.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-text-tertiary)" }}>
          Upcoming exams
        </p>
        <h1 className="text-text-primary" style={{ marginTop: "6px", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Exam schedule
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading ? "Loading…" : \`\${exams.length} upcoming exam\${exams.length === 1 ? "" : "s"}\`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "280px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ padding: "3rem 1.5rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <Calendar size={32} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "17px", fontWeight: 600 }}>No upcoming exams</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>When your department schedules exams, they'll appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "1.5rem" }}>
          {dates.map((date) => (
            <div key={date}>
              <div className="flex items-center" style={{ gap: "12px", marginBottom: "10px" }}>
                <p className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>
                  {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <span style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
                <span className="font-mono" style={{ fontSize: "10.5px", color: "var(--color-primary)" }}>
                  {grouped[date].length} exam{grouped[date].length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: "8px" }}>
                {grouped[date].map((e, i) => (
                  <motion.div key={e._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex flex-wrap items-center"
                    style={{ padding: "12px 16px", gap: "12px", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div className="flex items-center" style={{ gap: "8px", marginBottom: "4px" }}>
                        <span className="font-mono" style={{ padding: "2px 7px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                          {e.courseCode}
                        </span>
                        <span className="font-mono" style={{ fontSize: "9.5px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{e.examType}</span>
                      </div>
                      <p className="text-text-primary" style={{ fontSize: "14px", fontWeight: 600 }}>{e.title}</p>
                      <p className="text-text-secondary" style={{ marginTop: "2px", fontSize: "12px" }}>{e.courseName}</p>
                    </div>
                    <div className="flex items-center" style={{ gap: "16px", fontSize: "11.5px", color: "var(--color-text-tertiary)" }}>
                      <span className="flex items-center" style={{ gap: "4px" }}><Clock size={11} /> {e.startTime} · {e.durationMinutes}m</span>
                      {e.room && <span className="flex items-center" style={{ gap: "4px" }}><MapPin size={11} /> {e.room}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// ---------- StudentResults ----------
writeIfMissing("frontend/src/pages/student/StudentResults.jsx", `import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import { getMyResults } from "../../api/examResults.js";

export default function StudentResults() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyResults()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <Loader2 size={26} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>Failed to load</p>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>{error}</p>
      </div>
    );
  }

  const results = data?.results || [];
  const byCourse = data?.byCourse || [];
  const summary = data?.summary;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-text-tertiary)" }}>
          Your results
        </p>
        <h1 className="text-text-primary" style={{ marginTop: "6px", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Results
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {results.length === 0 ? "No published results yet" : \`\${summary.coursesCount} course\${summary.coursesCount === 1 ? "" : "s"} · \${summary.examsTaken} exams taken\`}
        </p>
      </motion.div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ marginTop: "1.5rem", padding: "3rem 1.5rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <BookOpen size={32} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "17px", fontWeight: 600 }}>No results yet</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>Once your faculty enters marks and admin publishes them, they'll appear here.</p>
        </div>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ marginTop: "1.5rem", gap: "10px" }}>
              <StatCard icon={TrendingUp} label="Overall" value={summary.overallPercentage + "%"} accent={summary.overallPercentage >= 60 ? "#4ade80" : "#f5a524"} />
              <StatCard icon={CheckCircle2} label="Passed" value={summary.passedCount} accent="#4ade80" />
              <StatCard icon={XCircle} label="Total exams" value={summary.examsTaken} accent="#3fe0c5" />
              <StatCard icon={BookOpen} label="Marks" value={summary.totalObtained + "/" + summary.totalMax} accent="#a855f7" />
            </div>
          )}

          <div style={{ marginTop: "2rem" }}>
            <h2 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>
              By course
            </h2>
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {byCourse.map((c, i) => (
                <motion.div key={c.courseCode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ padding: "1rem 1.25rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                  <div className="flex items-center justify-between flex-wrap" style={{ gap: "12px", marginBottom: "10px" }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                        {c.courseCode}
                      </span>
                      <p className="text-text-primary" style={{ marginTop: "6px", fontSize: "14px", fontWeight: 600 }}>{c.courseName}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="font-mono" style={{ fontSize: "20px", fontWeight: 700, color: c.percentage >= 60 ? "#4ade80" : c.percentage >= 40 ? "#f5a524" : "#f0554d" }}>{c.percentage}%</p>
                      <p className="font-mono" style={{ marginTop: "2px", fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>{c.totalObtained}/{c.totalMax}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap" style={{ gap: "6px" }}>
                    {c.exams.map((e) => (
                      <span key={e.resultId} className="font-mono"
                        style={{ padding: "3px 9px", borderRadius: "6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, backgroundColor: e.passed ? "rgba(74,222,128,0.12)" : "rgba(240,85,77,0.12)", color: e.passed ? "#4ade80" : "#f0554d" }}>
                        {e.examType}: {e.isAbsent ? "Absent" : e.marksObtained}/{e.maxMarks}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={{ padding: "0.875rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
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
`);

// ---------- Patch DashboardLayout: imports + nav entries ----------
patch(
  "frontend/src/layouts/DashboardLayout.jsx",
  'import { ScanEye, LayoutDashboard, Calendar, Bell, BookOpen, LogOut, ArrowLeft, Upload, ClipboardCheck, Ticket, Shield } from "lucide-react";',
  'import { ScanEye, LayoutDashboard, Calendar, Bell, BookOpen, LogOut, ArrowLeft, Upload, ClipboardCheck, Ticket, Shield, GraduationCap, FileText } from "lucide-react";'
);

patch(
  "frontend/src/layouts/DashboardLayout.jsx",
  '  { label: "Assignments", to: "/student/assignments", icon: BookOpen },\n  { label: "Sessions", to: "/settings/sessions", icon: Shield },',
  '  { label: "Assignments", to: "/student/assignments", icon: BookOpen },\n  { label: "Exams", to: "/student/exams", icon: GraduationCap },\n  { label: "Results", to: "/student/results", icon: FileText },\n  { label: "Sessions", to: "/settings/sessions", icon: Shield },'
);

patch(
  "frontend/src/layouts/DashboardLayout.jsx",
  '  { label: "Post Notice", to: "/faculty/notices", icon: Bell },\n  { label: "Sessions", to: "/settings/sessions", icon: Shield },',
  '  { label: "Post Notice", to: "/faculty/notices", icon: Bell },\n  { label: "Exams", to: "/faculty/exams", icon: GraduationCap },\n  { label: "Sessions", to: "/settings/sessions", icon: Shield },'
);

// ---------- Patch AppRoutes: imports + routes ----------
patch(
  "frontend/src/routes/AppRoutes.jsx",
  'import FacultyDashboard from "../pages/faculty/FacultyDashboard";',
  'import FacultyDashboard from "../pages/faculty/FacultyDashboard";\nimport FacultyExams from "../pages/faculty/FacultyExams";\nimport FacultyExamMarks from "../pages/faculty/FacultyExamMarks";'
);

patch(
  "frontend/src/routes/AppRoutes.jsx",
  'import StudentDashboard from "../pages/student/StudentDashboard";',
  'import StudentDashboard from "../pages/student/StudentDashboard";\nimport StudentExams from "../pages/student/StudentExams";\nimport StudentResults from "../pages/student/StudentResults";'
);

patch(
  "frontend/src/routes/AppRoutes.jsx",
  '        <Route path="timetable" element={<FacultyTimetable />} />',
  '        <Route path="timetable" element={<FacultyTimetable />} />\n        <Route path="exams" element={<FacultyExams />} />\n        <Route path="exams/:examId/marks" element={<FacultyExamMarks />} />'
);

patch(
  "frontend/src/routes/AppRoutes.jsx",
  '        <Route path="timetable" element={<StudentTimetable />} />',
  '        <Route path="timetable" element={<StudentTimetable />} />\n        <Route path="exams" element={<StudentExams />} />\n        <Route path="results" element={<StudentResults />} />'
);

console.log("");
console.log("Done.");