// src/services/noticeService.js
import { db } from "../database/index.js";
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
}

export async function getNotice(id) {
  const n = await db.getNoticeById(id);
  if (!n || !n.isActive) throw ApiError.notFound("Notice not found");
  return n;
}

export async function createNotice(data, user) {
  if (!data.title?.trim()) throw ApiError.badRequest("Title is required");
  if (!data.body?.trim()) throw ApiError.badRequest("Body is required");

  let targetAudience = data.targetAudience || "all";
  let targetDepartment = data.targetDepartment || null;

  if (user.role === "faculty") {
    targetAudience = "students";
    targetDepartment = user.department || targetDepartment;
    if (!targetDepartment) {
      throw ApiError.badRequest("Your faculty account has no department set. Contact admin.");
    }
  }

  const notice = await db.createNotice({
    ...data,
    targetAudience,
    targetDepartment,
    author: { _id: user._id, name: user.name, role: user.role },
  });

  // 🔔 Fire push + in-app notifications in background
  notifyAudience(notice).catch((err) =>
    console.error("Push notification failed:", err.message)
  );
  notifyAudienceInApp(notice).catch((err) =>
    console.error("In-app notification failed:", err.message)
  );

  return notice;
}

export async function updateNotice(id, updates, user) {
  const existing = await db.getNoticeById(id);
  if (!existing || !existing.isActive) throw ApiError.notFound("Notice not found");
  if (user.role !== "admin" && existing.author?._id !== user._id) {
    throw ApiError.forbidden("You can only edit your own notices");
  }
  return db.updateNotice(id, updates);
}

export async function deleteNotice(id, user) {
  const existing = await db.getNoticeById(id);
  if (!existing || !existing.isActive) throw ApiError.notFound("Notice not found");
  if (user.role !== "admin" && existing.author?._id !== user._id) {
    throw ApiError.forbidden("You can only delete your own notices");
  }
  await db.deleteNotice(id);
  return { deleted: true };
}

// ─── Push notification dispatcher ───
async function notifyAudience(notice) {
  if (typeof db.listUsers !== "function") {
    console.log("🔔 listUsers not available — skipping push");
    return { sent: 0 };
  }

  const users = await db.listUsers();
  const targets = users.filter((u) => {
    // Don't notify the author
    if (u._id?.toString() === notice.author?._id?.toString()) return false;

    // Audience match
    if (notice.targetAudience === "all") return true;
    if (notice.targetAudience === "students") return u.role === "student";
    if (notice.targetAudience === "faculty") return u.role === "faculty";
    if (notice.targetAudience === "department") return u.department === notice.targetDepartment;
    return false;
  });

  // Department filter (applies to students/faculty too)
  const filtered = targets.filter((u) => {
    if (!notice.targetDepartment) return true;
    return u.department === notice.targetDepartment || u.role === "admin";
  });

  const userIds = filtered.map((u) => u._id);
  if (userIds.length === 0) {
    console.log("🔔 No users match audience — nothing sent");
    return { sent: 0 };
  }

  console.log(`🔔 Notifying ${userIds.length} users about: ${notice.title}`);

  return pushService.notifyUsers(userIds, {
    title: notice.title,
    body: notice.body.slice(0, 120) + (notice.body.length > 120 ? "…" : ""),
    url: "/student/notices",
    tag: `notice-${notice._id}`,
    category: notice.category,
    priority: notice.priority,
  });
}


async function notifyAudienceInApp(notice) {
  if (typeof db.listUsers !== "function") return;
  const users = await db.listUsers();
  const targets = users.filter((u) => {
    if (u._id?.toString() === notice.author?._id?.toString()) return false;
    if (notice.targetAudience === "all") return true;
    if (notice.targetAudience === "students") return u.role === "student";
    if (notice.targetAudience === "faculty") return u.role === "faculty";
    if (notice.targetAudience === "department") return u.department === notice.targetDepartment;
    return false;
  });
  const filtered = targets.filter((u) => {
    if (!notice.targetDepartment) return true;
    return u.department === notice.targetDepartment || u.role === "admin";
  });
  if (!filtered.length) return;
  await notificationService.notifyMany(
    filtered.map((u) => u._id),
    {
      type: "notice",
      title: notice.title,
      body: notice.body.slice(0, 120) + (notice.body.length > 120 ? "…" : ""),
      url: "/student/notices",
      icon: notice.priority === "urgent" ? "🚨" : "📢",
      meta: { noticeId: notice._id },
    }
  );
}