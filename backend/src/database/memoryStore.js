// src/database/memoryStore.js
import bcrypt from "bcryptjs";

const users = new Map();
const facilities = new Map();
const events = new Map();
const notices = new Map();
const timetables = new Map();

let userIdCounter = 1;
let facilityIdCounter = 1;
let eventIdCounter = 1;
let noticeIdCounter = 1;
let timetableIdCounter = 1;

const generateUserId = () => `mem_${Date.now()}_${userIdCounter++}`;

export const memoryStore = {
  _isMongo: false,

  // ============ USERS ============
  async listUsers() {
    return Array.from(users.values())
      .filter((u) => u.isActive)
      .map((u) => {
        const { password, ...safe } = u;
        return safe;
      });
  },
  async findByEmail(email) {
    const lower = email.toLowerCase().trim();
    for (const u of users.values()) if (u.email === lower) return u;
    return null;
  },
  async findUserById(id) {
    return users.get(id) || null;
  },
  async createUser({ name, email, password, role, organization, department, semester, section }) {
    const lower = email.toLowerCase().trim();
    if (await this.findByEmail(lower)) throw new Error("Email already registered");
    const hashed = await bcrypt.hash(password, 12);
    const user = {
      _id: generateUserId(),
      name: name.trim(),
      email: lower,
      password: hashed,
      role: role || "student",
      organization: organization || "SRMS CET Bareilly",
      semester: semester || null,
      section: section || null,
      department: department || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(user._id, user);
    const { password: _, ...safe } = user;
    return safe;
  },
  async comparePassword(userId, candidate) {
    const u = users.get(userId);
    if (!u) return false;
    return bcrypt.compare(candidate, u.password);
  },
  async getUserWithPassword(email) {
    const lower = email.toLowerCase().trim();
    for (const u of users.values()) if (u.email === lower) return u;
    return null;
  },
  async updateUserPassword(userId, newPassword) {
    const user = users.get(userId);
    if (!user) return false;
    user.password = await bcrypt.hash(newPassword, 12);
    user.updatedAt = new Date();
    users.set(userId, user);
    return true;
  },

  // ============ FACILITIES ============
  async listFacilities() {
    return Array.from(facilities.values()).filter((f) => f.isActive);
  },
  async getFacilityById(id) {
    const f = facilities.get(id);
    if (!f || !f.isActive) return null;
    return f;
  },
  async createFacility(data) {
    if (facilities.has(data.id)) throw new Error(`Facility with id "${data.id}" already exists`);
    const facility = {
      _id: `fac_${Date.now()}_${facilityIdCounter++}`,
      id: data.id.toLowerCase().trim(),
      code: (data.code || "").toUpperCase().trim(),
      name: data.name.trim(),
      type: data.type,
      tagline: data.tagline,
      description: data.description,
      image: data.image || "",
      gallery: data.gallery || [],
      specs: {
        seats: data.specs?.seats ?? 0,
        systems: data.specs?.systems ?? 0,
        floors: data.specs?.floors ?? 1,
        area: data.specs?.area || "",
        hours: data.specs?.hours || "",
      },
      amenities: data.amenities || [],
      live: {
        occupancy: data.live?.occupancy ?? 0,
        seatsAvailable: data.live?.seatsAvailable ?? 0,
        systemsAvailable: data.live?.systemsAvailable ?? 0,
        status: data.live?.status || "open",
      },
      location: {
        building: data.location?.building || "",
        floor: data.location?.floor || "",
        x: data.location?.x ?? 50,
        y: data.location?.y ?? 50,
      },
      isActive: true,
      createdBy: data.createdBy || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    facilities.set(facility.id, facility);
    return facility;
  },
  async updateFacility(id, updates) {
    const f = facilities.get(id);
    if (!f) return null;
    const updated = {
      ...f,
      ...updates,
      id: f.id,
      _id: f._id,
      specs: { ...f.specs, ...(updates.specs || {}) },
      live: { ...f.live, ...(updates.live || {}) },
      location: { ...f.location, ...(updates.location || {}) },
      updatedAt: new Date(),
    };
    facilities.set(id, updated);
    return updated;
  },
  async deleteFacility(id) {
    const f = facilities.get(id);
    if (!f) return false;
    f.isActive = false;
    f.updatedAt = new Date();
    facilities.set(id, f);
    return true;
  },

  // ============ EVENTS ============
  async listEvents() {
    return Array.from(events.values()).filter((e) => e.isActive);
  },
  async getEventById(id) {
    const e = events.get(id);
    if (!e || !e.isActive) return null;
    return e;
  },
  async createEvent(data) {
    const event = {
      _id: `evt_${Date.now()}_${eventIdCounter++}`,
      title: data.title.trim(),
      type: data.type,
      date: data.date,
      time: data.time,
      venue: data.venue,
      speaker: data.speaker || "",
      description: data.description,
      seats: data.seats || 0,
      registered: data.registered || 0,
      tag: data.tag || "",
      banner: data.banner || "",
      isActive: true,
      createdBy: data.createdBy || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    events.set(event._id, event);
    return event;
  },
  async updateEvent(id, updates) {
    const e = events.get(id);
    if (!e) return null;
    const updated = { ...e, ...updates, _id: e._id, updatedAt: new Date() };
    events.set(id, updated);
    return updated;
  },
  async deleteEvent(id) {
    const e = events.get(id);
    if (!e) return false;
    e.isActive = false;
    e.updatedAt = new Date();
    events.set(id, e);
    return true;
  },

  // ============ NOTICES ============
  async listNotices({ role, department } = {}) {
    const all = Array.from(notices.values())
      .filter((n) => {
        if (!n.isActive) return false;
        if (n.expiresAt && new Date(n.expiresAt) < new Date()) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (role === "admin") return all;

    return all.filter((n) => {
      if (n.targetAudience === "all") return true;
      if (n.targetAudience === "students") {
        if (role !== "student") return false;
        if (n.targetDepartment && n.targetDepartment !== department) return false;
        return true;
      }
      if (n.targetAudience === "faculty") {
        if (role !== "faculty") return false;
        if (n.targetDepartment && n.targetDepartment !== department) return false;
        return true;
      }
      if (n.targetAudience === "department") {
        if (n.targetDepartment && n.targetDepartment !== department) return false;
        return true;
      }
      return false;
    });
  },
  async getNoticeById(id) {
    return notices.get(id) || null;
  },
  async createNotice(data) {
    const now = new Date();
    const notice = {
      _id: `not_${Date.now()}_${noticeIdCounter++}`,
      title: data.title.trim(),
      body: data.body.trim(),
      category: data.category || "General",
      priority: data.priority || "normal",
      targetAudience: data.targetAudience || "all",
      targetDepartment: data.targetDepartment || null,
      author: data.author || { name: "Admin", role: "admin", _id: null },
      attachments: data.attachments || [],
      expiresAt: data.expiresAt || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    notices.set(notice._id, notice);
    return notice;
  },
  async updateNotice(id, updates) {
    const n = notices.get(id);
    if (!n) return null;
    const updated = { ...n, ...updates, _id: n._id, updatedAt: new Date() };
    notices.set(id, updated);
    return updated;
  },
  async deleteNotice(id) {
    const n = notices.get(id);
    if (!n) return false;
    n.isActive = false;
    n.updatedAt = new Date();
    notices.set(id, n);
    return true;
  },

  // ============ TIMETABLES ============
  async listTimetables({ department, semester } = {}) {
    const all = Array.from(timetables.values()).filter((t) => t.isActive);
    return all.filter((t) => {
      if (department && t.department !== department) return false;
      if (semester && t.semester !== String(semester)) return false;
      return true;
    });
  },
  async getTimetableById(id) {
    return timetables.get(id) || null;
  },
  async createTimetable(data) {
    const id = `tt_${Date.now()}_${timetableIdCounter++}`;
    const doc = { _id: id, ...data, isActive: true, createdAt: new Date() };
    timetables.set(id, doc);
    return doc;
  },
  async updateTimetable(id, updates) {
    const existing = timetables.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, _id: existing._id, updatedAt: new Date() };
    timetables.set(id, updated);
    return updated;
  },
  async deleteTimetable(id) {
    const existing = timetables.get(id);
    if (!existing) return false;
    existing.isActive = false;
    existing.updatedAt = new Date();
    timetables.set(id, existing);
    return true;
  },
  async getTimetableForUser(user) {
    const all = Array.from(timetables.values()).filter((t) => t.isActive);
    if (user.role === "admin") {
      return { timetables: all, classes: all.flatMap((d) => d.classes || []) };
    }
    if (user.role === "student") {
      const docs = all.filter((t) => {
        if (user.department && t.department !== user.department) return false;
        if (user.semester && t.semester !== String(user.semester)) return false;
        return true;
      });
      const classes = docs.flatMap((d) => d.classes || []);
      return { timetables: docs, classes };
    }
    if (user.role === "faculty") {
      const docs = all;
      const classes = docs.flatMap((d) =>
        (d.classes || []).filter((c) =>
          c.facultyId?.toString() === user._id?.toString() ||
          (c.facultyName && user.name && c.facultyName === user.name)
        )
      );
      return { timetables: docs, classes };
    }
    return { timetables: [], classes: [] };
  },

  // Utility — clear all notices (used during seeding)
  _clearNotices() {
    notices.clear();
  },
};
