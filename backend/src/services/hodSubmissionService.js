// src/services/hodSubmissionService.js
import HodSubmission from "../models/HodSubmission.js";
import { ApiError } from "../utils/ApiError.js";

export async function list(user) {
  if (user.role === "admin") {
    return HodSubmission.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  }
  return HodSubmission.find({ isActive: true, facultyId: user._id }).sort({ createdAt: -1 }).lean();
}

export async function create(data, user) {
  if (!data.title?.trim()) throw ApiError.badRequest("Title is required");
  if (!data.description?.trim() && !data.imageUrl?.trim()) throw ApiError.badRequest("Add a description or attach an image");
  if (!user.department) throw ApiError.badRequest("Your account has no department set. Contact admin.");

  const doc = await HodSubmission.create({
    title: data.title.trim(),
    description: data.description || "",
    type: data.type || "exam_paper",
    imageUrl: (data.imageUrl || "").trim(),
    department: user.department,
    facultyId: user._id,
    facultyName: user.name || "",
    status: "pending",
  });
  return doc.toObject();
}

export async function review(id, data, user) {
  if (user.role !== "admin") throw ApiError.forbidden("Only HOD (admin) can review");
  const doc = await HodSubmission.findById(id);
  if (!doc || !doc.isActive) throw ApiError.notFound("Submission not found");
  if (data.status) doc.status = data.status;
  if (data.hodNotes !== undefined) doc.hodNotes = data.hodNotes;
  doc.reviewedAt = new Date();
  await doc.save();
  return doc.toObject();
}

export async function remove(id, user) {
  const doc = await HodSubmission.findById(id);
  if (!doc || !doc.isActive) throw ApiError.notFound("Submission not found");
  if (user.role !== "admin" && String(doc.facultyId) !== String(user._id)) {
    throw ApiError.forbidden("You can only delete your own submissions");
  }
  doc.isActive = false;
  await doc.save();
  return { deleted: true };
}
