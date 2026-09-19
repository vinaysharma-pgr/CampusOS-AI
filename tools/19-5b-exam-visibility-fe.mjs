import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

function patch(rel, from, to) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) { fail(rel + " missing"); return; }
  let raw = fs.readFileSync(full, "utf8");
  const usesCRLF = raw.includes("\r\n");
  let src = usesCRLF ? raw.replace(/\r\n/g, "\n") : raw;

  if (src.includes(to)) { info(rel + " already patched"); return; }
  if (!src.includes(from)) { fail(rel + " anchor not found"); return; }
  src = src.replace(from, to);
  const out = usesCRLF ? src.replace(/\n/g, "\r\n") : src;
  fs.writeFileSync(full, out, "utf8");
  ok("patched " + rel);
}

console.log("");
console.log("PHASE 19.5b - Exam visibility (frontend)");
console.log("");

// ---------- 1. AdminExamForm: default values + checkboxes ----------
patch(
  "frontend/src/pages/admin/AdminExamForm.jsx",
  `  maxMarks: 100,
  passingMarks: 40,
};`,
  `  maxMarks: 100,
  passingMarks: 40,
  showToStudents: true,
  countsTowardTotal: true,
};`
);

patch(
  "frontend/src/pages/admin/AdminExamForm.jsx",
  `        <Section title="Marks">
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1rem" }}>
            <Field label="Maximum marks" required>
              <input type="number" min="1" value={form.maxMarks} onChange={(e) => update("maxMarks", Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Passing marks" required>
              <input type="number" min="0" value={form.passingMarks} onChange={(e) => update("passingMarks", Number(e.target.value))} style={inputStyle} />
            </Field>
          </div>
        </Section>`,
  `        <Section title="Marks">
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
        </Section>`
);

// ---------- 2. AdminExams: badge for internal-only exams ----------
patch(
  "frontend/src/pages/admin/AdminExams.jsx",
  `                      <td style={{ padding: "14px 16px" }}>
                        {e.isPublished ? (
                          <span className="inline-flex items-center" style={{ gap: "5px", fontSize: "11.5px", fontWeight: 600, color: "#4ade80" }}>
                            <CheckCircle2 size={12} /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center" style={{ gap: "5px", fontSize: "11.5px", fontWeight: 600, color: "#f5a524" }}>
                            <XCircle size={12} /> Draft
                          </span>
                        )}
                      </td>`,
  `                      <td style={{ padding: "14px 16px" }}>
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
                      </td>`
);

// ---------- 3. FacultyExamMarks: header badge if internal-only ----------
patch(
  "frontend/src/pages/faculty/FacultyExamMarks.jsx",
  `          <p className="text-text-secondary" style={{ marginTop: "4px", fontSize: "13px" }}>
            {exam.courseCode} · {exam.courseName} · Max {exam.maxMarks} · Pass {exam.passingMarks}
          </p>`,
  `          <p className="text-text-secondary" style={{ marginTop: "4px", fontSize: "13px" }}>
            {exam.courseCode} · {exam.courseName} · Max {exam.maxMarks} · Pass {exam.passingMarks}
          </p>
          {exam.showToStudents === false && (
            <span className="font-mono inline-flex items-center" style={{ marginTop: "6px", padding: "3px 8px", gap: "5px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "rgba(245,165,36,0.12)", color: "#f5a524", border: "1px solid rgba(245,165,36,0.3)" }}>
              Internal — students won't see these marks
            </span>
          )}`
);

// ---------- 4. StudentResults: badge "Not counted" for excluded exams ----------
patch(
  "frontend/src/pages/student/StudentResults.jsx",
  `                    {c.exams.map((e) => (
                      <span key={e.resultId} className="font-mono"
                        style={{ padding: "3px 9px", borderRadius: "6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, backgroundColor: e.passed ? "rgba(74,222,128,0.12)" : "rgba(240,85,77,0.12)", color: e.passed ? "#4ade80" : "#f0554d" }}>
                        {e.examType}: {e.isAbsent ? "Absent" : e.marksObtained}/{e.maxMarks}
                      </span>
                    ))}`,
  `                    {c.exams.map((e) => (
                      <span key={e.resultId} className="font-mono"
                        style={{ padding: "3px 9px", borderRadius: "6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, backgroundColor: e.countsTowardTotal === false ? "var(--color-surface-raised)" : e.passed ? "rgba(74,222,128,0.12)" : "rgba(240,85,77,0.12)", color: e.countsTowardTotal === false ? "var(--color-text-tertiary)" : e.passed ? "#4ade80" : "#f0554d" }}>
                        {e.examType}: {e.isAbsent ? "Absent" : e.marksObtained}/{e.maxMarks}{e.countsTowardTotal === false ? " (not counted)" : ""}
                      </span>
                    ))}`
);

console.log("");
console.log("Stage B done (frontend).");
console.log("");