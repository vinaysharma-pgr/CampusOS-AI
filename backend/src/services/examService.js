import Exam from "../models/Exam.js";
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
