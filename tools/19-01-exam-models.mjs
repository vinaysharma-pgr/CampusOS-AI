import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

function writeIfMissing(rel, content) {
  const full = path.join(ROOT, rel);
  if (fs.existsSync(full)) {
    info(rel + " already exists - skipping");
    return false;
  }
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  ok("created " + rel);
  return true;
}

function patch(rel, from, to) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) { fail(rel + " missing"); return false; }
  let src = fs.readFileSync(full, "utf8");
  if (src.includes(to)) { info(rel + " already patched"); return false; }
  if (!src.includes(from)) { fail(rel + " anchor not found"); return false; }
  src = src.replace(from, to);
  fs.writeFileSync(full, src, "utf8");
  ok("patched " + rel);
  return true;
}

console.log("");
console.log("PHASE 19 - STAGE 1 - Exam + ExamResult models");
console.log("");

writeIfMissing("backend/src/models/Exam.js", `import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    courseCode: { type: String, required: true, trim: true, uppercase: true },
    courseName: { type: String, required: true, trim: true },
    examType: {
      type: String,
      required: true,
      enum: ["mid-sem", "end-sem", "practical", "viva", "quiz", "assignment-test"],
    },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    durationMinutes: { type: Number, default: 120 },
    room: { type: String, default: "" },
    department: { type: String, required: true, index: true },
    semester: { type: String, required: true },
    section: { type: String, default: "" },
    maxMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 40 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.Mixed, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

examSchema.index({ department: 1, semester: 1, section: 1, date: 1 });
examSchema.index({ date: 1, isActive: 1 });

export default mongoose.model("Exam", examSchema);
`);

writeIfMissing("backend/src/models/ExamResult.js", `import mongoose from "mongoose";

const examResultSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    studentId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    studentName: { type: String, default: "" },
    studentRollNo: { type: String, default: "" },
    marksObtained: { type: Number, default: 0, min: 0 },
    isAbsent: { type: Boolean, default: false },
    remarks: { type: String, default: "" },
    enteredBy: { type: mongoose.Schema.Types.Mixed, default: null },
    enteredByName: { type: String, default: "" },
    publishedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });
examResultSchema.index({ studentId: 1, isActive: 1 });

export default mongoose.model("ExamResult", examResultSchema);
`);

patch(
  "backend/src/models/index.js",
  'export { default as RefreshToken } from "./RefreshToken.js";',
  'export { default as RefreshToken } from "./RefreshToken.js";\nexport { default as Exam } from "./Exam.js";\nexport { default as ExamResult } from "./ExamResult.js";'
);

console.log("");
console.log("Done.");