// src/controllers/pushController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import { pushService } from "../services/pushService.js";

export const getPublicKey = asyncHandler(async (req, res) => {
  return success(res, { publicKey: process.env.VAPID_PUBLIC_KEY || "" });
});

export const subscribe = asyncHandler(async (req, res) => {
  const { subscription } = req.body;
  if (!subscription?.endpoint) {
    return res.status(400).json({ success: false, message: "Missing subscription endpoint" });
  }
  await pushService.addSubscription(
    req.user._id,
    subscription,
    req.headers["user-agent"] || ""
  );
  return success(res, { subscribed: true }, "Subscribed to notifications");
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ success: false, message: "Missing endpoint" });
  }
  await pushService.removeSubscription(req.user._id, endpoint);
  return success(res, { unsubscribed: true });
});

export const sendTest = asyncHandler(async (req, res) => {
  const result = await pushService.notifyUsers([req.user._id], {
    title: "Test notification",
    body: "Push notifications are working! 🎉",
    url: "/student",
    tag: "test",
  });
  return success(res, result, "Test notification sent");
});

export const getStats = asyncHandler(async (req, res) => {
  const count = await pushService.getSubscriptionCount();
  return success(res, { totalSubscriptions: count });
});
