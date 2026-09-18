// src/controllers/paymentController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as paymentService from "../services/paymentService.js";
import * as regService from "../services/eventRegistrationService.js";
import Event from "../models/Event.js";

// POST /api/payments/order  { eventId }
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) throw ApiError.badRequest("eventId is required");

  const event = await Event.findById(eventId).lean();
  if (!event || !event.isActive) throw ApiError.notFound("Event not found");
  if (!event.isPaid || !event.price) throw ApiError.badRequest("This event is free — no payment required");

  // Capacity check
  if (event.seats > 0 && (event.registered || 0) >= event.seats) {
    throw ApiError.badRequest("This event is full");
  }

  // Duplicate check
  const existing = await regService.findRegistration(eventId, req.user._id);
  if (existing && existing.paymentStatus === "paid") {
    throw ApiError.conflict("You are already registered for this event");
  }

  const order = await paymentService.createOrder({
    amount: event.price,
    currency: event.currency || "INR",
    receipt: "evt_" + String(eventId).slice(-8) + "_" + Date.now(),
    notes: {
      eventId: String(eventId),
      eventTitle: event.title,
      userId: String(req.user._id),
      userName: req.user.name || "",
      userEmail: req.user.email || "",
    },
  });

  // Create/update a pending registration so we can track it
  await regService.createPendingRegistration(eventId, req.user, order.orderId, event.price, event.currency || "INR");

  return success(res, { order }, "Order created");
});

// POST /api/payments/verify  { eventId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = asyncHandler(async (req, res) => {
  const { eventId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!eventId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw ApiError.badRequest("Missing payment verification fields");
  }

  const ok = paymentService.verifySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!ok) {
    await regService.markPaymentFailed(razorpay_order_id, req.user._id);
    throw ApiError.badRequest("Payment signature verification failed");
  }

  const reg = await regService.confirmPaidRegistration({
    eventId,
    userId: req.user._id,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  return success(res, { registration: reg }, "Payment verified");
});

// GET /api/payments/status
export const paymentStatus = asyncHandler(async (req, res) => {
  return success(res, { configured: paymentService.isConfigured() });
});
