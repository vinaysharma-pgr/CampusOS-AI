// src/api/auditLogs.js
import apiClient from "./client.js";

export async function listAuditLogs({ userId, action, status, from, to, limit } = {}) {
  const params = {};
  if (userId) params.userId = userId;
  if (action) params.action = action;
  if (status) params.status = status;
  if (from) params.from = from;
  if (to) params.to = to;
  if (limit) params.limit = limit;
  const { data } = await apiClient.get("/audit-logs", { params });
  return data.data; // { logs, count }
}

export async function cleanupAuditLogs(days = 90) {
  const { data } = await apiClient.delete(`/audit-logs/cleanup?days=${days}`);
  return data.data;
}
