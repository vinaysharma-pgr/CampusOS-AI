// src/api/payments.js
import apiClient from "./client.js";

export async function createPaymentOrder(eventId) {
  const { data } = await apiClient.post("/payments/order", { eventId });
  return data.data; // { order: { orderId, amount, currency, keyId } }
}

export async function verifyPayment({ eventId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const { data } = await apiClient.post("/payments/verify", {
    eventId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  return data.data.registration;
}

export async function getPaymentStatus() {
  const { data } = await apiClient.get("/payments/status");
  return data.data;
}
