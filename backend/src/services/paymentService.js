// src/services/paymentService.js
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

let client = null;
function getClient() {
  if (client) return client;
  if (!env.razorpay?.keyId || !env.razorpay?.keySecret) return null;
  client = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });
  return client;
}

export function isConfigured() {
  return !!(env.razorpay?.keyId && env.razorpay?.keySecret);
}

// Create a Razorpay order. amount is in rupees, converted to paise.
export async function createOrder({ amount, currency = "INR", receipt, notes = {} }) {
  const rzp = getClient();
  if (!rzp) throw ApiError.internal("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env");
  if (!amount || amount <= 0) throw ApiError.badRequest("Amount must be greater than 0");

  const order = await rzp.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt: receipt || "rcpt_" + Date.now(),
    notes,
  });

  return {
    orderId: order.id,
    amount: order.amount, // in paise
    currency: order.currency,
    keyId: env.razorpay.keyId, // safe to expose to frontend
  };
}

// Verify Razorpay signature — HMAC-SHA256 of (orderId|paymentId) with key_secret
export function verifySignature({ orderId, paymentId, signature }) {
  if (!env.razorpay?.keySecret) throw ApiError.internal("Razorpay secret missing");
  if (!orderId || !paymentId || !signature) return false;

  const body = orderId + "|" + paymentId;
  const expected = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(body)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
