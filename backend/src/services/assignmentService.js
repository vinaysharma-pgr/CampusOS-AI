// src/services/assignmentService.js
import Assignment from "../models/Assignment.js";
import { ApiError } from "../utils/ApiError.js";
import * as notificationService from "./notificationService.js";
import User from "../models/User.js";

export async function listForUser(user) {
  // Admin/faculty see all their own; students see by their group
  if (user.role === "admin") {
    return Assignment.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  }
  if (user.role === "faculty") {
    return Assignment.find({ isActive: true, facultyId: user._id }).sort({ createdAt: -1 }).lean();
  }
  // Student: match by department + semester + section
  const query = { isActive: true };
  if (user.department) query.department = user.department;
  if (user.semester) query.semester = String(user.semester);
  if (user.section) query.section = user.section;
  return Assignment.find(query).sort({ createdAt: -1 }).lean();
}

export async function getById(id) {
  return Assignment.findById(id).lean();
}

export async function create(data, user) {
  if (!data.title?.trim()) throw ApiError.badRequest("Title is required");
  if (!data.description?.trim()) throw ApiError.badRequest("Description is required");
  if (!data.groupCode) throw ApiError.badRequest("Please select a class");

  const doc = await Assignment.create({
    title: data.title.trim(),
    description: data.description.trim(),
    dueDate: data.dueDate || "",
    type: data.type || "assignment",
    groupCode: data.groupCode.toUpperCase(),
    department: data.department || "",
    year: data.year || 0,
    semester: String(data.semester || ""),
    section: data.section || "",
    courseCode: data.courseCode || "",
    courseName: data.courseName || "",
    facultyId: user._id,
    facultyName: user.name || "",
    imageUrl: data.imageUrl || "",
  });

  // Notify students in this group (fire-and-forget)
  notifyGroupStudents(doc).catch((err) => console.error("Group notify failed:", err.message));
  return doc.toObject();
}

export async function remove(id, user) {
  const a = await Assignment.findById(id);
  if (!a || !a.isActive) throw ApiError.notFound("Assignment not found");
  if (user.role !== "admin" && String(a.facultyId) !== String(user._id)) {
    throw ApiError.forbidden("You can only delete your own assignments");
  }
  a.isActive = false;
  await a.save();
  return { deleted: true };
}


async function notifyGroupStudents(assignment) {
  try {
    console.log("🔔 Looking for students in " + assignment.department + " / Sem " + assignment.semester + " / " + assignment.section);
    const students = await User.find({
      role: "student",
      isActive: true,
      department: assignment.department,
      semester: String(assignment.semester),
      section: assignment.section,
    }).select("_id");
    if (!students.length) {
      console.log("🔔 No students matched for notification");
      return;
    }
    console.log("🔔 Notifying " + students.length + " student(s)");
    await notificationService.notifyMany(
      students.map((s) => s._id),
      {
        type: "assignment",
        title: "New assignment in " + (assignment.courseName || assignment.courseCode || assignment.groupCode),
        body: assignment.title,
        url: "/student/assignments",
        icon: "📚",
        meta: { assignmentId: assignment._id },
      }
    );
  } catch (err) {
    console.error("Failed to notify students:", err.message);
  }
}