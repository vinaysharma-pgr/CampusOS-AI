// src/api/notifications.js
import apiClient from "./client.js";

export async function listNotifications() {
  const { data } = await apiClient.get("/notifications");
  return data.data; // { notifications, count, unread }
}

export async function getUnreadCount() {
  const { data } = await apiClient.get("/notifications/unread-count");
  return data.data.unread;
}

export async function markNotificationRead(id) {
  const { data } = await apiClient.put("/notifications/" + id + "/read");
  return data.data.notification;
}

export async function markAllNotificationsRead() {
  const { data } = await apiClient.put("/notifications/read-all");
  return data.data;
}

export async function deleteNotification(id) {
  const { data } = await apiClient.delete("/notifications/" + id);
  return data.data;
}
