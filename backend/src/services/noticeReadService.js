import NoticeRead from "../models/NoticeRead.js";
import Notice from "../models/Notice.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export async function markRead(noticeId, user) {
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
}

export async function countForNotices(noticeIds) {
  if (!noticeIds.length) return {};
  const strIds = noticeIds.map((id) => String(id));
  const rows = await NoticeRead.aggregate([
    { $match: { noticeId: { $in: strIds } } },
    { $group: { _id: "$noticeId", count: { $sum: 1 } } },
  ]);
  const map = {};
  for (const r of rows) map[String(r._id)] = r.count;
  return map;
}

export async function readIdsForUser(userId, noticeIds) {
  if (!noticeIds.length || !userId) return new Set();
  const strIds = noticeIds.map((id) => String(id));
  const rows = await NoticeRead.find({
    userId: String(userId),
    noticeId: { $in: strIds },
  })
    .select("noticeId")
    .lean();
  return new Set(rows.map((r) => String(r.noticeId)));
}

export async function readersForNotice(noticeId) {
  const reads = await NoticeRead.find({ noticeId: String(noticeId) }).sort({ readAt: -1 }).lean();
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
