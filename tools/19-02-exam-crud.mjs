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
console.log("PHASE 19 - STAGE 2 - Exam CRUD");
console.log("");

writeIfMissing("backend/src/services/examService.js", `import Exam from "../models/Exam.js";
import { ApiError } from "../utils/ApiError.js";

export async function listExams({ department, semester, section, type, from, to } = {}) {
  const query = { isActive: true };
  if (department) query.department = department;
  if (semester) query.semester = String(semester);
  if (section) query.section = section;
  if (type) query.examType = type;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = from;
    if (to) query.date.$lte = to;
  }
  return Exam.find(query).sort({ date: 1, startTime: 1 }).lean();
}

export async function getExamById(id) {
  const doc = await Exam.findById(id).lean();
  if (!doc || !doc.isActive) throw ApiError.notFound("Exam not found");
  return doc;
}

export async function createExam(data, admin) {
  if (!data.title?.trim()) throw ApiError.badRequest("Title is required");
  if (!data.courseCode?.trim()) throw ApiError.badRequest("Course code is required");
  if (!data.courseName?.trim()) throw ApiError.badRequest("Course name is required");
  if (!data.examType) throw ApiError.badRequest("Exam type is required");
  if (!data.date) throw ApiError.badRequest("Date is required");
  if (!data.startTime) throw ApiError.badRequest("Start time is required");
  if (!data.department) throw ApiError.badRequest("Department is required");
  if (!data.semester) throw ApiError.badRequest("Semester is required");

  const doc = await Exam.create({
    ...data,
    courseCode: data.courseCode.toUpperCase(),
    semester: String(data.semester),
    createdBy: admin?._id || null,
  });
  return doc.toObject();
}

export async function updateExam(id, updates) {
  if (updates.courseCode) updates.courseCode = updates.courseCode.toUpperCase();
  if (updates.semester) updates.semester = String(updates.semester);
  const doc = await Exam.findByIdAndUpdate(id, updates, { new: true }).lean();
  if (!doc) throw ApiError.notFound("Exam not found");
  return doc;
}

export async function deleteExam(id) {
  const doc = await Exam.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!doc) throw ApiError.notFound("Exam not found");
  return { deleted: true };
}

export async function listUpcomingForUser(user) {
  const today = new Date().toISOString().slice(0, 10);
  const query = { isActive: true, date: { $gte: today } };
  if (user.role === "student") {
    if (user.department) query.department = user.department;
    if (user.semester) query.semester = String(user.semester);
    if (user.section) query.section = user.section;
  } else if (user.role === "faculty") {
    if (user.department) query.department = user.department;
  }
  return Exam.find(query).sort({ date: 1, startTime: 1 }).lean();
}
`);

writeIfMissing("backend/src/controllers/examController.js", `import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as examService from "../services/examService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await examService.listExams({
    department: req.query.department,
    semester: req.query.semester,
    section: req.query.section,
    type: req.query.type,
    from: req.query.from,
    to: req.query.to,
  });
  return success(res, { exams: items, count: items.length });
});

export const upcoming = asyncHandler(async (req, res) => {
  const items = await examService.listUpcomingForUser(req.user);
  return success(res, { exams: items, count: items.length });
});

export const get = asyncHandler(async (req, res) => {
  const exam = await examService.getExamById(req.params.id);
  return success(res, { exam });
});

export const create = asyncHandler(async (req, res) => {
  const exam = await examService.createExam(req.body, req.user);
  return success(res, { exam }, "Exam created", 201);
});

export const update = asyncHandler(async (req, res) => {
  const exam = await examService.updateExam(req.params.id, req.body);
  return success(res, { exam }, "Exam updated");
});

export const remove = asyncHandler(async (req, res) => {
  const result = await examService.deleteExam(req.params.id);
  return success(res, result, "Exam deleted");
});
`);

writeIfMissing("backend/src/routes/examRoutes.js", `import { Router } from "express";
import { list, upcoming, get, create, update, remove } from "../controllers/examController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/upcoming", upcoming);
router.get("/", list);
router.get("/:id", get);

router.post("/", requireRole("admin"), create);
router.put("/:id", requireRole("admin"), update);
router.delete("/:id", requireRole("admin"), remove);

export default router;
`);

patch(
  "backend/src/routes/index.js",
  'import lockRoutes from "./lockRoutes.js";',
  'import lockRoutes from "./lockRoutes.js";\nimport examRoutes from "./examRoutes.js";'
);

patch(
  "backend/src/routes/index.js",
  'router.use("/admin/locks", lockRoutes);',
  'router.use("/admin/locks", lockRoutes);\nrouter.use("/exams", examRoutes);'
);

console.log("");
console.log("Done.");