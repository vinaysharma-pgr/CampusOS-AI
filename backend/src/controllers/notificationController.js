// src/controllers/notificationController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as svc from "../services/notificationService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await svc.listNotifications(req.user._id);
  const unread = items.filter((n) => !n.read).length;
  return success(res, { notifications: items, count: items.length, unread });
});

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await svc.unreadCount(req.user._id);
  return success(res, { unread: count });
});

export const markRead = asyncHandler(async (req, res) => {
  const doc = await svc.markRead(req.params.id, req.user._id);
  return success(res, { notification: doc }, "Marked as read");
});

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await svc.markAllRead(req.user._id);
  return success(res, result, "All marked as read");
});

export const remove = asyncHandler(async (req, res) => {
  const result = await svc.deleteNotification(req.params.id, req.user._id);
  return success(res, result, "Deleted");
});
