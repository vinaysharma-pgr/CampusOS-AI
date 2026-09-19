import StudyMaterial from "../models/StudyMaterial.js";
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
