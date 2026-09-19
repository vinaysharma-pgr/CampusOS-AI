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
console.log("PHASE 22 - Stage 1 - Notice read backend");
console.log("");

writeIfMissing("backend/src/models/NoticeRead.js", `import mongoose from "mongoose";

const noticeReadSchema = new mongoose.Schema(
  {
    noticeId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    userRole: { type: String, default: "" },
    readAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

noticeReadSchema.index({ noticeId: 1, userId: 1 }, { unique: true });
noticeReadSchema.index({ userId: 1, readAt: -1 });

export default mongoose.model("NoticeRead", noticeReadSchema);
`);

patch(
  "backend/src/models/index.js",
  'export { default as StudyMaterial } from "./StudyMaterial.js";',
  'export { default as StudyMaterial } from "./StudyMaterial.js";\nexport { default as NoticeRead } from "./NoticeRead.js";'
);

writeIfMissing("backend/src/services/noticeReadService.js", `import NoticeRead from "../models/NoticeRead.js";
import Notice from "../models/Notice.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export async function markRead(noticeId, user) {
  const notice = await Notice.findById(noticeId).lean();
  if (!notice || !notice.isActive) throw ApiError.notFound("Notice not found");

  await NoticeRead.updateOne(
    { noticeId, userId: user._id },
    {
      $setOnInsert: {
        noticeId,
        userId: user._id,
        userRole: user.role || "",
        readAt: new Date(),
      },
    },
    { upsert: true }
  );
  return { marked: true, noticeId, userId: user._id };
}

export async function countForNotices(noticeIds) {
  if (!noticeIds.length) return {};
  const rows = await NoticeRead.aggregate([
    { $match: { noticeId: { $in: noticeIds } } },
    { $group: { _id: "$noticeId", count: { $sum: 1 } } },
  ]);
  const map = {};
  for (const r of rows) map[String(r._id)] = r.count;
  return map;
}

export async function readIdsForUser(userId, noticeIds) {
  if (!noticeIds.length || !userId) return new Set();
  const rows = await NoticeRead.find({ userId, noticeId: { $in: noticeIds } })
    .select("noticeId")
    .lean();
  return new Set(rows.map((r) => String(r.noticeId)));
}

export async function readersForNotice(noticeId) {
  const reads = await NoticeRead.find({ noticeId }).sort({ readAt: -1 }).lean();
  if (!reads.length) return [];

  const userIds = reads.map((r) => r.userId);
  const users = await User.find({ _id: { $in: userIds } })
    .select("name email role department semester section")
    .lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return reads.map((r) => {
    const u = byId.get(String(r.userId));
    return {
      userId: r.userId,
      readAt: r.readAt,
      name: u?.name || "(unknown user)",
      email: u?.email || "",
      role: u?.role || r.userRole,
      department: u?.department || "",
      semester: u?.semester || "",
      section: u?.section || "",
    };
  });
}

export async function statsForNotice(noticeId) {
  const notice = await Notice.findById(noticeId).lean();
  if (!notice) throw ApiError.notFound("Notice not found");

  const reads = await NoticeRead.find({ noticeId }).lean();
  const readUserIds = new Set(reads.map((r) => String(r.userId)));

  // Build audience filter based on notice's targeting
  const audienceFilter = { isActive: true, role: { $in: ["student", "faculty"] } };
  if (notice.targetAudience === "students") audienceFilter.role = "student";
  else if (notice.targetAudience === "faculty") audienceFilter.role = "faculty";
  // "all" and "department" keep both roles
  if (notice.targetDepartment) audienceFilter.department = notice.targetDepartment;

  // Exclude the author
  if (notice.author?._id) {
    audienceFilter._id = { $ne: notice.author._id };
  }

  const audience = await User.find(audienceFilter)
    .select("name email role department semester section")
    .lean();

  const readers = audience.filter((u) => readUserIds.has(String(u._id)));
  const nonReaders = audience.filter((u) => !readUserIds.has(String(u._id)));

  return {
    notice: {
      _id: notice._id,
      title: notice.title,
      targetAudience: notice.targetAudience,
      targetDepartment: notice.targetDepartment,
    },
    total: audience.length,
    read: readers.length,
    unread: nonReaders.length,
    readPercentage: audience.length ? Math.round((readers.length / audience.length) * 100) : 0,
    readers,
    nonReaders,
  };
}
`);

writeIfMissing("backend/src/controllers/noticeReadController.js", `import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as svc from "../services/noticeReadService.js";

export const markRead = asyncHandler(async (req, res) => {
  const result = await svc.markRead(req.params.id, req.user);
  return success(res, result, "Marked as read");
});

export const readers = asyncHandler(async (req, res) => {
  const list = await svc.readersForNotice(req.params.id);
  return success(res, { readers: list, count: list.length });
});

export const stats = asyncHandler(async (req, res) => {
  const result = await svc.statsForNotice(req.params.id);
  return success(res, result);
});
`);

// Patch noticeService to attach read info
patch(
  "backend/src/services/noticeService.js",
  `import { db } from "../database/index.js";
import { ApiError } from "../utils/ApiError.js";
import { pushService } from "./pushService.js";
import * as notificationService from "./notificationService.js";

export async function listNoticesForUser(user) {
  return db.listNotices({ role: user?.role, department: user?.department || null });
}

export async function listAllNotices() {
  return db.listNotices({ role: "admin" });
}`,
  `import { db } from "../database/index.js";
import { ApiError } from "../utils/ApiError.js";
import { pushService } from "./pushService.js";
import * as notificationService from "./notificationService.js";
import { countForNotices, readIdsForUser } from "./noticeReadService.js";

async function attachReadInfo(notices, user) {
  if (!notices.length) return notices;
  try {
    const ids = notices.map((n) => n._id);
    const isAdmin = user?.role === "admin" || user?.role === "faculty";
    const [readCounts, myReads] = await Promise.all([
      isAdmin ? countForNotices(ids) : Promise.resolve({}),
      readIdsForUser(user?._id, ids),
    ]);
    return notices.map((n) => ({
      ...n,
      readCount: isAdmin ? (readCounts[String(n._id)] || 0) : undefined,
      isReadByMe: myReads.has(String(n._id)),
    }));
  } catch (err) {
    // Memory store fallback — no read tracking
    return notices;
  }
}

export async function listNoticesForUser(user) {
  const notices = await db.listNotices({ role: user?.role, department: user?.department || null });
  return attachReadInfo(notices, user);
}

export async function listAllNotices() {
  const notices = await db.listNotices({ role: "admin" });
  return attachReadInfo(notices, { role: "admin" });
}`
);

// Patch noticeRoutes to add 3 endpoints
patch(
  "backend/src/routes/noticeRoutes.js",
  `import { list, get, create, update, remove } from "../controllers/noticeController.js";
import { createNoticeRules, updateNoticeRules } from "../validators/noticeValidator.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";`,
  `import { list, get, create, update, remove } from "../controllers/noticeController.js";
import { markRead, readers, stats } from "../controllers/noticeReadController.js";
import { createNoticeRules, updateNoticeRules } from "../validators/noticeValidator.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";`
);

patch(
  "backend/src/routes/noticeRoutes.js",
  `router.get("/", list);
router.get("/:id", get);`,
  `router.get("/", list);

// Read tracking (must come before /:id so it doesn't match as ID)
router.get("/:id/readers", requireRole("admin", "faculty"), readers);
router.get("/:id/stats", requireRole("admin", "faculty"), stats);
router.post("/:id/read", markRead);

router.get("/:id", get);`
);

console.log("");
console.log("Done.");