// src/services/eventRegistrationService.js
import EventRegistration from "../models/EventRegistration.js";
import Event from "../models/Event.js";
import { ApiError } from "../utils/ApiError.js";

export async function registerForEvent(eventId, user) {
  if (user.role !== "student") throw ApiError.forbidden("Only students can register");
  const event = await Event.findById(eventId).lean();
  if (!event || !event.isActive) throw ApiError.notFound("Event not found");
  if (event.seats > 0 && (event.registered || 0) >= event.seats) throw ApiError.badRequest("This event is full");
  const existing = await EventRegistration.findOne({ eventId, userId: user._id, isActive: true });
  if (existing) throw ApiError.conflict("You are already registered for this event");
  const reg = await EventRegistration.create({
    eventId,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    eventVenue: event.venue,
    eventType: event.type,
    userId: user._id,
    userName: user.name || "",
    userEmail: user.email || "",
    userDepartment: user.department || "",
    userSemester: String(user.semester || ""),
    userSection: user.section || "",
  });
  await Event.findByIdAndUpdate(eventId, { $inc: { registered: 1 } });
  return reg.toObject();
}

export async function listRegistrationsForEvent(eventId, user) {
  const event = await Event.findById(eventId).lean();
  if (!event) throw ApiError.notFound("Event not found");
  const isAdmin = user.role === "admin";
  const isCoordinator = (event.coordinatorIds || []).some((id) => String(id) === String(user._id));
  if (!isAdmin && !isCoordinator) throw ApiError.forbidden("Admin or coordinator only");
  return EventRegistration.find({ eventId, isActive: true }).sort({ registeredAt: -1 }).lean();
}

export async function listMyRegistrations(user) {
  return EventRegistration.find({ userId: user._id, isActive: true }).sort({ registeredAt: -1 }).lean();
}

export async function listMyCoordinatedEvents(user) {
  return Event.find({ isActive: true, coordinatorIds: user._id }).sort({ date: 1 }).lean();
}

export async function getMyRegisteredEventIds(user) {
  const regs = await EventRegistration.find({ userId: user._id, isActive: true }).select("eventId").lean();
  return regs.map((r) => String(r.eventId));
}

export async function getRegistrationCounts() {
  const counts = await EventRegistration.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$eventId", count: { $sum: 1 } } },
  ]);
  const map = {};
  for (const c of counts) map[String(c._id)] = c.count;
  return map;
}


// ─── Payment-related helpers ───
export async function findRegistration(eventId, userId) {
  return EventRegistration.findOne({ eventId, userId, isActive: true }).lean();
}

export async function createPendingRegistration(eventId, user, orderId, amount, currency) {
  const event = await Event.findById(eventId).lean();
  if (!event) throw ApiError.notFound("Event not found");

  const existing = await EventRegistration.findOne({ eventId, userId: user._id });
  if (existing) {
    // Update to fresh pending order
    existing.paymentStatus = "pending";
    existing.razorpayOrderId = orderId;
    existing.amountPaid = 0;
    existing.currency = currency;
    existing.isActive = true;
    await existing.save();
    return existing.toObject();
  }

  const reg = await EventRegistration.create({
    eventId,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    eventVenue: event.venue,
    eventType: event.type,
    userId: user._id,
    userName: user.name || "",
    userEmail: user.email || "",
    userDepartment: user.department || "",
    userSemester: String(user.semester || ""),
    userSection: user.section || "",
    paymentStatus: "pending",
    razorpayOrderId: orderId,
    currency,
  });
  return reg.toObject();
}

export async function confirmPaidRegistration({ eventId, userId, orderId, paymentId, signature }) {
  const reg = await EventRegistration.findOne({ eventId, userId });
  if (!reg) throw ApiError.notFound("Pending registration not found");

  reg.paymentStatus = "paid";
  reg.razorpayPaymentId = paymentId;
  reg.razorpaySignature = signature;
  // Look up the pending amount from the order metadata
  // (fall back to zero if the lookup fails)
  try {
    const Event = (await import("../models/Event.js")).default;
    const evt = await Event.findById(eventId).lean();
    if (evt?.price) reg.amountPaid = evt.price;
  } catch {}
  await reg.save();

  // Increment registered count on the event (once)
  if (!reg.__wasCounted) {
    await Event.findByIdAndUpdate(eventId, { $inc: { registered: 1 } });
  }

  return reg.toObject();
}

export async function markPaymentFailed(orderId, userId) {
  await EventRegistration.updateOne(
    { razorpayOrderId: orderId, userId },
    { paymentStatus: "failed" }
  );
}