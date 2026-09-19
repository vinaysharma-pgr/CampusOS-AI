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
  if (!src.includes(from)) {
    fail(rel + " anchor not found:");
    console.log("    FROM >> " + from.slice(0, 80).replace(/\n/g, "\\n"));
    return false;
  }
  src = src.replace(from, to);
  const out = usesCRLF ? src.replace(/\n/g, "\r\n") : src;
  fs.writeFileSync(full, out, "utf8");
  ok("patched " + rel);
  return true;
}

console.log("");
console.log("PHASE 19.5 - Exam visibility + best-of-N flexibility");
console.log("");

// ---------- 1. Exam model: add 2 flags ----------
patch(
  "backend/src/models/Exam.js",
  `    isPublished: { type: Boolean, default: false },`,
  `    isPublished: { type: Boolean, default: false },
    showToStudents: { type: Boolean, default: true },
    countsTowardTotal: { type: Boolean, default: true },`
);

// ---------- 2. examService: pass flags through create/update ----------
// No change needed -- createExam already spreads `...data`, updateExam passes `updates` through.

// ---------- 3. examResultService: filter by showToStudents in getMyResults + countsTowardTotal for aggregate ----------
patch(
  "backend/src/services/examResultService.js",
  `  const examIds = results.map((r) => r.examId);
  const exams = await Exam.find({ _id: { $in: examIds } }).lean();
  const byId = new Map(exams.map((e) => [String(e._id), e]));

  const enriched = results
    .map((r) => {
      const ex = byId.get(String(r.examId));
      if (!ex) return null;`,
  `  const examIds = results.map((r) => r.examId);
  const exams = await Exam.find({ _id: { $in: examIds } }).lean();
  const byId = new Map(exams.map((e) => [String(e._id), e]));

  // Only show marks for exams explicitly marked visible to students
  const visibleResults = results.filter((r) => {
    const ex = byId.get(String(r.examId));
    return ex && ex.showToStudents !== false;
  });

  const enriched = visibleResults
    .map((r) => {
      const ex = byId.get(String(r.examId));
      if (!ex) return null;`
);

patch(
  "backend/src/services/examResultService.js",
  `        percentage: pct,
        passed,
        isAbsent: r.isAbsent,
        remarks: r.remarks,
      };
    })
    .filter(Boolean);`,
  `        percentage: pct,
        passed,
        isAbsent: r.isAbsent,
        remarks: r.remarks,
        countsTowardTotal: ex.countsTowardTotal !== false,
      };
    })
    .filter(Boolean);`
);

// ---------- 4. Aggregate only counts exams where countsTowardTotal=true ----------
patch(
  "backend/src/services/examResultService.js",
  `    const c = byCourseMap.get(key);
    c.exams.push(r);
    c.totalObtained += r.marksObtained;
    c.totalMax += r.maxMarks;
    if (r.passed) c.passed++;`,
  `    const c = byCourseMap.get(key);
    c.exams.push(r);
    if (r.countsTowardTotal) {
      c.totalObtained += r.marksObtained;
      c.totalMax += r.maxMarks;
      if (r.passed) c.passed++;
    }`
);

patch(
  "backend/src/services/examResultService.js",
  `  const totalObtained = enriched.reduce((s, r) => s + r.marksObtained, 0);
  const totalMax = enriched.reduce((s, r) => s + r.maxMarks, 0);`,
  `  const counted = enriched.filter((r) => r.countsTowardTotal);
  const totalObtained = counted.reduce((s, r) => s + r.marksObtained, 0);
  const totalMax = counted.reduce((s, r) => s + r.maxMarks, 0);`
);

// ---------- 5. Class stats: exclude hidden exams from student-facing totals ----------
// (No change -- getClassStats is admin-facing and uses all results)

console.log("");
console.log("Stage A done (backend).");
console.log("");