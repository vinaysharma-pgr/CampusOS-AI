// src/api/notices.js
import apiClient from "./client.js";

export async function listNotices({ all = false } = {}) {
  const params = all ? { all: "true" } : {};
  const { data } = await apiClient.get("/notices", { params });
  return data.data.notices;
}

export async function getNotice(id) {
  const { data } = await apiClient.get(`/notices/${id}`);
  return data.data.notice;
}

export async function createNotice(payload) {
  const { data } = await apiClient.post("/notices", payload);
  return data.data.notice;
}

export async function updateNotice(id, payload) {
  const { data } = await apiClient.put(`/notices/${id}`, payload);
  return data.data.notice;
}

export async function deleteNotice(id) {
  const { data } = await apiClient.delete(`/notices/${id}`);
  return data.data;
}

export async function markNoticeRead(id) {
  const { data } = await apiClient.post(`/notices/${id}/read`);
  return data.data;
}
