// src/services/notificationService.js
import Notification from "../models/Notification.js";

// In-memory fallback
const memoryNotifs = new Map(); // userId -> [notifications]
let memCounter = 1;

// Socket.io emitter (set from server.js)
let io = null;
export function setIo(socketInstance) { io = socketInstance; }

function emitToUser(userId, notification) {
  if (!io) return;
  try {
    io.to("user:" + String(userId)).emit("notification", notification);
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }
}

export async function createNotification({
  userId, type, title, body = "", url = "/", icon = "", meta = {},
}) {
  if (!userId) return null;

  const doc = {
    _id: "mem_" + Date.now() + "_" + memCounter++,
    userId,
    type,
    title,
    body,
    url,
    icon,
    read: false,
    meta,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const real = await Notification.create({
      userId, type, title, body, url, icon, meta,
    });
    const obj = real.toObject();
    emitToUser(userId, obj);
    return obj;
  } catch (err) {
    console.error("Notification DB write failed, using memory:", err.message);
    const list = memoryNotifs.get(String(userId)) || [];
    list.unshift(doc);
    memoryNotifs.set(String(userId), list);
    emitToUser(userId, doc);
    return doc;
  }
}

export async function listNotifications(userId) {
  try {
    return await Notification.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  } catch {
    return memoryNotifs.get(String(userId)) || [];
  }
}

export async function unreadCount(userId) {
  try {
    return await Notification.countDocuments({ userId, isActive: true, read: false });
  } catch {
    const list = memoryNotifs.get(String(userId)) || [];
    return list.filter((n) => !n.read).length;
  }
}

export async function markRead(id, userId) {
  try {
    const doc = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    ).lean();
    return doc;
  } catch {
    const list = memoryNotifs.get(String(userId)) || [];
    const n = list.find((x) => x._id === id);
    if (n) n.read = true;
    return n;
  }
}

export async function markAllRead(userId) {
  try {
    await Notification.updateMany({ userId, read: false }, { read: true });
    return { ok: true };
  } catch {
    const list = memoryNotifs.get(String(userId)) || [];
    list.forEach((n) => (n.read = true));
    return { ok: true };
  }
}

export async function deleteNotification(id, userId) {
  try {
    await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false }
    );
    return { deleted: true };
  } catch {
    const list = memoryNotifs.get(String(userId)) || [];
    memoryNotifs.set(String(userId), list.filter((n) => n._id !== id));
    return { deleted: true };
  }
}

// Bulk notify (used when posting assignments/notices to many users)
export async function notifyMany(userIds, payload) {
  const results = [];
  for (const uid of userIds) {
    const r = await createNotification({ ...payload, userId: uid });
    if (r) results.push(r);
  }
  return results;
}
