// src/database/mongoStore.js
// MongoDB adapter — same API as memoryStore so nothing else needs to change.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Facility from "../models/Facility.js";
import Event from "../models/Event.js";
import Notice from "../models/Notice.js";

export const mongoStore = {
  // ============ USERS ============
  async listUsers() {
    return User.find({ isActive: true }).lean();
  },
    async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() }).lean();
  },
  async findUserById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return User.findById(id).lean();
  },
  async createUser({ name, email, password, role, organization, department, semester, section }) {
    // NOTE: password is hashed by the User model's pre-save hook.
    // Do NOT hash here — that would double-hash and break login.
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "student",
      organization: organization || "SRMS CET Bareilly",
      semester: semester || null,
      section: section || null,
      department: department || null,
    });
    const obj = user.toObject();
    delete obj.password;
    return obj;
  },
  async comparePassword(userId, candidate) {
    const u = await User.findById(userId).select("+password");
    if (!u) return false;
    return bcrypt.compare(candidate, u.password);
  },
  async getUserWithPassword(email) {
    return User.findOne({ email: email.toLowerCase().trim() }).select("+password").lean();
  },
  async updateUserPassword(userId, newPassword) {
    // Use updateOne on the doc so we can access it — but since we need
    // the pre-save hook, fetch + modify + save is the correct path.
    const user = await User.findById(userId).select("+password");
    if (!user) return false;
    user.password = newPassword;
    await user.save();
    return true;
  },

  // ============ FACILITIES ============
  async listFacilities() {
    return Facility.find({ isActive: true }).lean();
  },
  async getFacilityById(id) {
    return Facility.findOne({ id, isActive: true }).lean();
  },
  async createFacility(data) {
    const exists = await Facility.findOne({ id: data.id.toLowerCase().trim() });
    if (exists) throw new Error(`Facility with id "${data.id}" already exists`);
    const doc = await Facility.create({
      ...data,
      id: data.id.toLowerCase().trim(),
      code: (data.code || "").toUpperCase().trim(),
    });
    return doc.toObject();
  },
  async updateFacility(id, updates) {
    const doc = await Facility.findOneAndUpdate({ id }, updates, { new: true }).lean();
    return doc;
  },
  async deleteFacility(id) {
    const res = await Facility.findOneAndUpdate({ id }, { isActive: false }, { new: true });
    return !!res;
  },

  // ============ EVENTS ============
  async listEvents() {
    return Event.find({ isActive: true }).sort({ date: 1 }).lean();
  },
  async getEventById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Event.findById(id).lean();
  },
  async createEvent(data) {
    const doc = await Event.create(data);
    return doc.toObject();
  },
  async updateEvent(id, updates) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Event.findByIdAndUpdate(id, updates, { new: true }).lean();
  },
  async deleteEvent(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const res = await Event.findByIdAndUpdate(id, { isActive: false }, { new: true });
    return !!res;
  },

  // ============ NOTICES ============
  async listNotices({ role, department } = {}) {
    const query = { isActive: true };
    const now = new Date();
    query.$or = [{ expiresAt: null }, { expiresAt: { $gte: now } }];

    // Admin sees everything
    if (role === "admin") {
      return Notice.find(query).sort({ createdAt: -1 }).lean();
    }

    // Others: filter by audience + department
    const audienceQuery = {
      $or: [
        { targetAudience: "all" },
        { targetAudience: "students", ...(role === "student" ? {} : { _never: true }) },
        { targetAudience: "faculty", ...(role === "faculty" ? {} : { _never: true }) },
        { targetAudience: "department" },
      ],
    };

    const all = await Notice.find({ ...query, ...audienceQuery }).sort({ createdAt: -1 }).lean();

    // Additional department-level filtering
    return all.filter((n) => {
      if (n.targetAudience === "all") return true;
      if (n.targetAudience === "students" && role !== "student") return false;
      if (n.targetAudience === "faculty" && role !== "faculty") return false;
      if (n.targetDepartment && n.targetDepartment !== department) return false;
      return true;
    });
  },
  async getNoticeById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Notice.findById(id).lean();
  },
  async createNotice(data) {
    const doc = await Notice.create(data);
    return doc.toObject();
  },
  async updateNotice(id, updates) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Notice.findByIdAndUpdate(id, updates, { new: true }).lean();
  },
  async deleteNotice(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const res = await Notice.findByIdAndUpdate(id, { isActive: false }, { new: true });
    return !!res;
  },

  // Utility
  _clearNotices() {
    // No-op in Mongo — we don't clear data on every restart
  },

  // ============ TIMETABLES ============
  async listTimetables({ department, semester } = {}) {
    const query = { isActive: true };
    if (department) query.department = department;
    if (semester) query.semester = String(semester);
    const Timetable = (await import("../models/Timetable.js")).default;
    return Timetable.find(query).sort({ department: 1, semester: 1, section: 1 }).lean();
  },
  async createTimetable(data) {
    const Timetable = (await import("../models/Timetable.js")).default;
    const doc = await Timetable.create(data);
    return doc.toObject();
  },
};