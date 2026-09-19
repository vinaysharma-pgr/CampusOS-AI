import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

function patch(rel, from, to) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) { fail(rel + " missing"); return false; }
  let raw = fs.readFileSync(full, "utf8");
  const usesCRLF = raw.includes("\r\n");
  let src = usesCRLF ? raw.replace(/\r\n/g, "\n") : raw;

  if (src.includes(to)) { info(rel + " already patched"); return false; }
  if (!src.includes(from)) { fail(rel + " anchor not found"); return false; }
  src = src.replace(from, to);
  const out = usesCRLF ? src.replace(/\n/g, "\r\n") : src;
  fs.writeFileSync(full, out, "utf8");
  ok("patched " + rel);
  return true;
}

console.log("");
console.log("PHASE 19.5c - Expand exam types + custom fallback");
console.log("");

// 1. Exam model -- expand enum, add customType
patch(
  "backend/src/models/Exam.js",
  `    examType: {
      type: String,
      required: true,
      enum: ["mid-sem", "end-sem", "practical", "viva", "quiz", "assignment-test"],
    },`,
  `    examType: {
      type: String,
      required: true,
      enum: [
        "mid-sem",
        "end-sem",
        "class-test",
        "pre-university",
        "internal",
        "practical",
        "viva",
        "lab-viva",
        "quiz",
        "assignment-test",
        "other",
      ],
    },
    customType: { type: String, default: "", trim: true, maxlength: 80 },`
);

// 2. Frontend AdminExamForm -- expand dropdown + customType input
patch(
  "frontend/src/pages/admin/AdminExamForm.jsx",
  `const EXAM_TYPES = [
  { id: "mid-sem", label: "Mid Semester" },
  { id: "end-sem", label: "End Semester" },
  { id: "practical", label: "Practical" },
  { id: "viva", label: "Viva" },
  { id: "quiz", label: "Quiz" },
  { id: "assignment-test", label: "Assignment Test" },
];`,
  `const EXAM_TYPES = [
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
];`
);

patch(
  "frontend/src/pages/admin/AdminExamForm.jsx",
  `  maxMarks: 100,
  passingMarks: 40,
  showToStudents: true,
  countsTowardTotal: true,
};`,
  `  maxMarks: 100,
  passingMarks: 40,
  showToStudents: true,
  countsTowardTotal: true,
  customType: "",
};`
);

patch(
  "frontend/src/pages/admin/AdminExamForm.jsx",
  `          <div style={{ marginTop: "1rem" }}>
            <Field label="Exam type" required>
              <select value={form.examType} onChange={(e) => update("examType", e.target.value)} style={inputStyle}>
                {EXAM_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
          </div>`,
  `          <div style={{ marginTop: "1rem" }}>
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
          )}`
);

console.log("");
console.log("Done.");