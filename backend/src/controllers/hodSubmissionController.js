// src/controllers/hodSubmissionController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as svc from "../services/hodSubmissionService.js";
import { pushService } from "../services/pushService.js";
import { db } from "../database/index.js";
import * as notificationService from "../services/notificationService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await svc.list(req.user);
  return success(res, { submissions: items, count: items.length });
});

export const create = asyncHandler(async (req, res) => {
  const doc = await svc.create(req.body, req.user);

  // Notify admins (fire-and-forget)
  notifyAdmins(doc).catch((err) => console.error("Push failed:", err.message));

  return success(res, { submission: doc }, "Submitted to HOD", 201);
});

export const review = asyncHandler(async (req, res) => {
  const doc = await svc.review(req.params.id, req.body, req.user);
  return success(res, { submission: doc }, "Reviewed");
});

export const remove = asyncHandler(async (req, res) => {
  const result = await svc.remove(req.params.id, req.user);
  return success(res, result, "Deleted");
});




async function notifyAdmins(submission) {
  if (typeof db.listUsers !== "function") return;
  try {
    const users = await db.listUsers();
    const admins = users.filter((u) => u.role === "admin");
    if (!admins.length) return;
    console.log("🔔 Notifying " + admins.length + " admin(s) about submission");
    await notificationService.notifyMany(
      admins.map((u) => u._id),
      {
        type: "submission",
        title: (submission.facultyName || "Faculty") + " sent a " + (submission.type || "document").replace("_", " "),
        body: submission.title,
        url: "/admin/hod-inbox",
        icon: "📄",
        meta: { submissionId: submission._id },
      }
    );
  } catch (err) {
    console.error("Failed to notify admins:", err.message);
  }
}