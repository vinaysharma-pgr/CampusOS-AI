// src/services/timetableService.js
import mongoose from "mongoose";
import Timetable from "../models/Timetable.js";
import { ApiError } from "../utils/ApiError.js";

const memoryTimetables = new Map(); // id → timetable (fallback)

const usingMongo = () => process.env.USE_MONGO === "true" && mongoose.connection.readyState === 1;

export async function listTimetables({ department, semester } = {}) {
  if (usingMongo()) {
    const query = { isActive: true };
    if (department) query.department = department;
    if (semester) query.semester = semester;
    return Timetable.find(query).sort({ department: 1, semester: 1, section: 1 }).lean();
  }
  return Array.from(memoryTimetables.values()).filter((t) => t.isActive);
}

export async function getTimetableById(id) {
  if (usingMongo()) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Timetable.findById(id).lean();
  }
  return memoryTimetables.get(id) || null;
}

/**
 * Get the timetable relevant for a specific user (student or faculty)
 */
export async function getTimetableForUser(user) {
  if (usingMongo()) {
    if (user.role === "student") {
      const query = { isActive: true };
      if (user.department) query.department = user.department;
      if (user.semester) query.semester = String(user.semester);
      if (user.section) query.section = user.section;
      const docs = await Timetable.find(query).lean();
      const allClasses = docs.flatMap((d) => d.classes || []);
      return { timetables: docs, classes: allClasses };
    }
    if (user.role === "faculty") {
      // Extract faculty code from name like "Faculty (SB)" -> "SB"
      const match = (user.name || "").match(/[(]([A-Z]+)[)]/);
      const code = match ? match[1] : null;
      const docs = await Timetable.find({ isActive: true }).lean();
      const allClasses = docs.flatMap((d) =>
        (d.classes || []).filter((c) =>
          (c.facultyId && c.facultyId.toString() === user._id.toString()) ||
          (code && c.facultyName === code)
        )
      );
      return { timetables: docs, classes: allClasses };
    }
    // Admin sees everything
    const docs = await Timetable.find({ isActive: true }).lean();
    return { timetables: docs, classes: docs.flatMap((d) => d.classes || []) };
  }

  // Fallback
  const all = Array.from(memoryTimetables.values());
  return { timetables: all, classes: all.flatMap((d) => d.classes || []) };
}

export async function createTimetable(data, userId) {
  if (usingMongo()) {
    const existing = await Timetable.findOne({
      department: data.department,
      semester: data.semester,
      section: data.section,
      academicYear: data.academicYear,
    });
    if (existing) {
      throw ApiError.conflict(
        `Timetable for ${data.department} Sem ${data.semester} Section ${data.section} already exists. Edit it instead.`
      );
    }
    const doc = await Timetable.create({ ...data, createdBy: userId });
    return doc.toObject();
  }
  const id = `tt_${Date.now()}`;
  const doc = { _id: id, ...data, isActive: true, createdAt: new Date() };
  memoryTimetables.set(id, doc);
  return doc;
}

export async function updateTimetable(id, updates) {
  if (usingMongo()) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.notFound("Timetable not found");
    const doc = await Timetable.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!doc) throw ApiError.notFound("Timetable not found");
    return doc;
  }
  const existing = memoryTimetables.get(id);
  if (!existing) throw ApiError.notFound("Timetable not found");
  const updated = { ...existing, ...updates, updatedAt: new Date() };
  memoryTimetables.set(id, updated);
  return updated;
}

export async function deleteTimetable(id) {
  if (usingMongo()) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.notFound("Timetable not found");
    const doc = await Timetable.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!doc) throw ApiError.notFound("Timetable not found");
    return { deleted: true };
  }
  const existing = memoryTimetables.get(id);
  if (!existing) throw ApiError.notFound("Timetable not found");
  existing.isActive = false;
  memoryTimetables.set(id, existing);
  return { deleted: true };
}
