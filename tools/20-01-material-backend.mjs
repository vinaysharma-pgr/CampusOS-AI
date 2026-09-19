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
console.log("PHASE 20 - STAGE 1 - StudyMaterial backend");
console.log("");

writeIfMissing("backend/src/models/StudyMaterial.js", `import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 2000 },
    category: {
      type: String,
      enum: ["notes", "slides", "pyq", "reference", "other"],
      default: "notes",
    },
    courseCode: { type: String, required: true, trim: true, uppercase: true, index: true },
    courseName: { type: String, default: "" },
    department: { type: String, required: true, index: true },
    semester: { type: String, required: true },
    section: { type: String, default: "" }, // empty = applies to all sections
    facultyId: { type: mongoose.Schema.Types.Mixed, default: null },
    facultyName: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studyMaterialSchema.index({ department: 1, semester: 1, section: 1, courseCode: 1 });
studyMaterialSchema.index({ facultyId: 1, createdAt: -1 });
studyMaterialSchema.index({ createdAt: -1 });

export default mongoose.model("StudyMaterial", studyMaterialSchema);
`);

patch(
  "backend/src/models/index.js",
  'export { default as ExamResult } from "./ExamResult.js";',
  'export { default as ExamResult } from "./ExamResult.js";\nexport { default as StudyMaterial } from "./StudyMaterial.js";'
);

writeIfMissing("backend/src/services/studyMaterialService.js", `import StudyMaterial from "../models/StudyMaterial.js";
import { ApiError } from "../utils/ApiError.js";

// List for the current user, filtered by role
export async function listForUser(user, { courseCode, category } = {}) {
  const query = { isActive: true };

  if (user.role === "student") {
    if (user.department) query.department = user.department;
    if (user.semester) query.semester = String(user.semester);
    // section matches user's section OR material is "all sections"
    if (user.section) {
      query.$or = [{ section: user.section }, { section: "" }, { section: null }];
    }
  } else if (user.role === "faculty") {
    if (user.department) query.department = user.department;
  }
  // admin sees all

  if (courseCode) query.courseCode = courseCode.toUpperCase();
  if (category) query.category = category;

  return StudyMaterial.find(query).sort({ createdAt: -1 }).lean();
}

export async function listMine(user) {
  return StudyMaterial.find({ isActive: true, facultyId: user._id })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getById(id) {
  const doc = await StudyMaterial.findById(id).lean();
  if (!doc || !doc.isActive) throw ApiError.notFound("Material not found");
  return doc;
}

export async function create(data, user) {
  if (!data.title?.trim()) throw ApiError.badRequest("Title is required");
  if (!data.courseCode?.trim()) throw ApiError.badRequest("Course code is required");
  if (!data.fileUrl?.trim()) throw ApiError.badRequest("Upload a file first");

  if (user.role !== "faculty" && user.role !== "admin") {
    throw ApiError.forbidden("Only faculty can upload materials");
  }
  if (!user.department) {
    throw ApiError.badRequest("Your account has no department set. Contact admin.");
  }

  const doc = await StudyMaterial.create({
    title: data.title.trim(),
    description: (data.description || "").trim().slice(0, 2000),
    category: data.category || "notes",
    courseCode: data.courseCode.toUpperCase().trim(),
    courseName: (data.courseName || "").trim(),
    department: user.department,
    semester: String(data.semester || user.semester || ""),
    section: (data.section || "").trim(),
    facultyId: user._id,
    facultyName: user.name || "",
    fileUrl: data.fileUrl,
    fileName: data.fileName || "",
    fileSize: Number(data.fileSize) || 0,
    mimeType: data.mimeType || "",
    isActive: true,
  });
  return doc.toObject();
}

export async function remove(id, user) {
  const doc = await StudyMaterial.findById(id);
  if (!doc || !doc.isActive) throw ApiError.notFound("Material not found");
  if (user.role !== "admin" && String(doc.facultyId) !== String(user._id)) {
    throw ApiError.forbidden("You can only delete your own uploads");
  }
  doc.isActive = false;
  await doc.save();
  return { deleted: true };
}
`);

writeIfMissing("backend/src/controllers/studyMaterialController.js", `import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as svc from "../services/studyMaterialService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await svc.listForUser(req.user, {
    courseCode: req.query.courseCode,
    category: req.query.category,
  });
  return success(res, { materials: items, count: items.length });
});

export const mine = asyncHandler(async (req, res) => {
  const items = await svc.listMine(req.user);
  return success(res, { materials: items, count: items.length });
});

export const get = asyncHandler(async (req, res) => {
  const material = await svc.getById(req.params.id);
  return success(res, { material });
});

export const create = asyncHandler(async (req, res) => {
  const material = await svc.create(req.body, req.user);
  return success(res, { material }, "Material uploaded", 201);
});

export const remove = asyncHandler(async (req, res) => {
  const result = await svc.remove(req.params.id, req.user);
  return success(res, result, "Deleted");
});
`);

writeIfMissing("backend/src/routes/studyMaterialRoutes.js", `import { Router } from "express";
import { list, mine, get, create, remove } from "../controllers/studyMaterialController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", list);
router.get("/mine", mine);
router.get("/:id", get);

router.post("/", requireRole("faculty", "admin"), create);
router.delete("/:id", requireRole("faculty", "admin"), remove);

export default router;
`);

patch(
  "backend/src/routes/index.js",
  'import examResultRoutes from "./examResultRoutes.js";',
  'import examResultRoutes from "./examResultRoutes.js";\nimport studyMaterialRoutes from "./studyMaterialRoutes.js";'
);

patch(
  "backend/src/routes/index.js",
  'router.use("/exam-results", examResultRoutes);',
  'router.use("/exam-results", examResultRoutes);\nrouter.use("/materials", studyMaterialRoutes);'
);

console.log("");
console.log("Done.");