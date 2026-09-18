// src/services/attendanceService.js
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

// ── List students in a group (for faculty to mark) ──
export async function listStudentsInGroup({ department, semester, section }) {
  return User.find({
    role: "student",
    isActive: true,
    department,
    semester: String(semester),
    section,
  }).select("_id name email rollNo").sort({ name: 1 }).lean();
}

// ── Create or update an attendance record ──
export async function markAttendance(data, user) {
  if (!data.date) throw ApiError.badRequest("Date is required");
  if (!data.groupCode) throw ApiError.badRequest("Group is required");
  if (!data.courseCode) throw ApiError.badRequest("Course is required");
  if (!Array.isArray(data.present) || !Array.isArray(data.absent)) {
    throw ApiError.badRequest("present and absent must be arrays of user IDs");
  }

  const present = data.present.map(String);
  const absent = data.absent.map(String);
  const total = present.length + absent.length;

  const filter = {
    date: data.date,
    groupCode: data.groupCode.toUpperCase(),
    courseCode: data.courseCode.toUpperCase(),
    period: Number(data.period) || 0,
  };

  const update = {
    ...filter,
    dayOfWeek: data.dayOfWeek || "",
    department: data.department || "",
    semester: String(data.semester || ""),
    section: data.section || "",
    courseName: data.courseName || "",
    timeSlot: data.timeSlot || "",
    facultyId: user._id,
    facultyName: user.name || "",
    present,
    absent,
    totalStudents: total,
    presentCount: present.length,
    absentCount: absent.length,
    isActive: true,
  };

  const doc = await Attendance.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).lean();

  return doc;
}

// ── List records (admin / faculty) ──
export async function listAttendance(query = {}, user) {
  const filter = { isActive: true };

  // Faculty sees only their own records
  if (user.role === "faculty") filter.facultyId = user._id;

  if (query.date) filter.date = query.date;
  if (query.groupCode) filter.groupCode = query.groupCode.toUpperCase();
  if (query.courseCode) filter.courseCode = query.courseCode.toUpperCase();
  if (query.department) filter.department = query.department;
  if (query.semester) filter.semester = String(query.semester);
  if (query.section) filter.section = query.section;

  const limit = Math.min(Number(query.limit) || 100, 500);

  return Attendance.find(filter)
    .sort({ date: -1, period: 1 })
    .limit(limit)
    .lean();
}

// ── Get single record ──
export async function getAttendanceById(id, user) {
  const doc = await Attendance.findById(id).lean();
  if (!doc || !doc.isActive) throw ApiError.notFound("Attendance not found");
  if (user.role === "faculty" && String(doc.facultyId) !== String(user._id)) {
    throw ApiError.forbidden("You can only view your own records");
  }
  return doc;
}

// ── Delete (soft) ──
export async function deleteAttendance(id, user) {
  const doc = await Attendance.findById(id);
  if (!doc || !doc.isActive) throw ApiError.notFound("Attendance not found");
  if (user.role === "faculty" && String(doc.facultyId) !== String(user._id)) {
    throw ApiError.forbidden("You can only delete your own records");
  }
  doc.isActive = false;
  await doc.save();
  return { deleted: true };
}

// ── Student: their own attendance stats per subject ──
export async function getMyAttendanceStats(user) {
  if (user.role !== "student") {
    throw ApiError.badRequest("Only students have attendance stats");
  }

  const docs = await Attendance.find({
    isActive: true,
    groupCode: { $exists: true },
    department: user.department,
    semester: String(user.semester || ""),
    section: user.section,
  }).lean();

  // Group by subject (courseCode)
  const bySubject = {};
  let totalClasses = 0;
  let totalPresent = 0;

  for (const a of docs) {
    const code = a.courseCode;
    if (!code) continue;
    if (!bySubject[code]) {
      bySubject[code] = {
        courseCode: code,
        courseName: a.courseName || "",
        facultyName: a.facultyName || "",
        totalClasses: 0,
        present: 0,
        absent: 0,
      };
    }
    const s = bySubject[code];
    s.totalClasses += 1;
    totalClasses += 1;

    const inPresent = (a.present || []).some((id) => String(id) === String(user._id));
    const inAbsent = (a.absent || []).some((id) => String(id) === String(user._id));

    if (inPresent) { s.present += 1; totalPresent += 1; }
    else if (inAbsent) { s.absent += 1; }
  }

  const subjects = Object.values(bySubject).map((s) => ({
    ...s,
    percentage: s.totalClasses ? Math.round((s.present / s.totalClasses) * 100) : 0,
    belowThreshold: s.totalClasses > 0 && (s.present / s.totalClasses) * 100 < 75,
  }));

  const overall = totalClasses
    ? Math.round((totalPresent / totalClasses) * 100)
    : 0;

  return {
    subjects,
    totalClasses,
    totalPresent,
    totalAbsent: totalClasses - totalPresent,
    overall,
    belowThresholdCount: subjects.filter((s) => s.belowThreshold).length,
  };
}
