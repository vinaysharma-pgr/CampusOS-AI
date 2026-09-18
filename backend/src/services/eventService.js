import { db } from "../database/index.js";
import { ApiError } from "../utils/ApiError.js";

export async function listEvents({ type, q } = {}) {
  let items = await db.listEvents();
  if (type && type !== "all") items = items.filter((e) => e.type === type);
  if (q) {
    const lower = q.toLowerCase();
    items = items.filter((e) => e.title.toLowerCase().includes(lower) || e.venue.toLowerCase().includes(lower));
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getEvent(id) {
  const e = await db.getEventById(id);
  if (!e) throw ApiError.notFound("Event not found");
  return e;
}

export async function createEvent(data, userId) {
  const payload = { ...data, createdBy: userId };
  // Ensure pricing fields are normalized
  payload.isPaid = !!data.isPaid;
  payload.price = payload.isPaid ? Number(data.price || 0) : 0;
  payload.currency = data.currency || "INR";
  if (data.coordinatorIds) payload.coordinatorIds = data.coordinatorIds;
  if (data.coordinatorNames) payload.coordinatorNames = data.coordinatorNames;
  return db.createEvent(payload);
}

export async function updateEvent(id, updates) {
  if (updates.isPaid !== undefined) {
    updates.isPaid = !!updates.isPaid;
    updates.price = updates.isPaid ? Number(updates.price || 0) : 0;
  }
  const e = await db.updateEvent(id, updates);
  if (!e) throw ApiError.notFound("Event not found");
  return e;
}

export async function deleteEvent(id) {
  const ok = await db.deleteEvent(id);
  if (!ok) throw ApiError.notFound("Event not found");
  return { deleted: true };
}