import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

const rel = "backend/src/services/noticeReadService.js";
const full = path.join(ROOT, rel);
if (!fs.existsSync(full)) { fail(rel + " missing"); process.exit(1); }

let raw = fs.readFileSync(full, "utf8");
const usesCRLF = raw.includes("\r\n");
let src = usesCRLF ? raw.replace(/\r\n/g, "\n") : raw;

// 1. markRead: normalize noticeId to String before storing
const oldMark = `export async function markRead(noticeId, user) {
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
}`;

const newMark = `export async function markRead(noticeId, user) {
  const notice = await Notice.findById(noticeId).lean();
  if (!notice || !notice.isActive) throw ApiError.notFound("Notice not found");

  // Store as strings for consistent matching with $in queries below
  const noticeIdStr = String(noticeId);
  const userIdStr = String(user._id);

  await NoticeRead.updateOne(
    { noticeId: noticeIdStr, userId: userIdStr },
    {
      $setOnInsert: {
        noticeId: noticeIdStr,
        userId: userIdStr,
        userRole: user.role || "",
        readAt: new Date(),
      },
    },
    { upsert: true }
  );
  return { marked: true, noticeId: noticeIdStr, userId: userIdStr };
}`;

if (src.includes(newMark)) {
  info("markRead already patched");
} else if (src.includes(oldMark)) {
  src = src.replace(oldMark, newMark);
  ok("patched markRead (string normalization)");
} else {
  fail("markRead anchor not found");
}

// 2. countForNotices: stringify incoming ids
const oldCount = `  const rows = await NoticeRead.aggregate([
    { $match: { noticeId: { $in: noticeIds } } },
    { $group: { _id: "$noticeId", count: { $sum: 1 } } },
  ]);`;
const newCount = `  const strIds = noticeIds.map((id) => String(id));
  const rows = await NoticeRead.aggregate([
    { $match: { noticeId: { $in: strIds } } },
    { $group: { _id: "$noticeId", count: { $sum: 1 } } },
  ]);`;

if (src.includes(newCount)) {
  info("countForNotices already patched");
} else if (src.includes(oldCount)) {
  src = src.replace(oldCount, newCount);
  ok("patched countForNotices (stringify)");
} else {
  fail("countForNotices anchor not found");
}

// 3. readIdsForUser: stringify both userId and noticeIds
const oldRead = `  const rows = await NoticeRead.find({ userId, noticeId: { $in: noticeIds } })
    .select("noticeId")
    .lean();`;
const newRead = `  const strIds = noticeIds.map((id) => String(id));
  const rows = await NoticeRead.find({
    userId: String(userId),
    noticeId: { $in: strIds },
  })
    .select("noticeId")
    .lean();`;

if (src.includes(newRead)) {
  info("readIdsForUser already patched");
} else if (src.includes(oldRead)) {
  src = src.replace(oldRead, newRead);
  ok("patched readIdsForUser (stringify both)");
} else {
  fail("readIdsForUser anchor not found");
}

// 4. readersForNotice: stringify noticeId
const oldReaders = `  const reads = await NoticeRead.find({ noticeId }).sort({ readAt: -1 }).lean();`;
const newReaders = `  const reads = await NoticeRead.find({ noticeId: String(noticeId) }).sort({ readAt: -1 }).lean();`;

if (src.includes(newReaders)) {
  info("readersForNotice already patched");
} else if (src.includes(oldReaders)) {
  src = src.replace(oldReaders, newReaders);
  ok("patched readersForNotice (stringify)");
} else {
  fail("readersForNotice anchor not found");
}

const out = usesCRLF ? src.replace(/\n/g, "\r\n") : src;
fs.writeFileSync(full, out, "utf8");

console.log("");
console.log("Done.");