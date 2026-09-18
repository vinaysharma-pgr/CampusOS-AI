// src/api/sessions.js
import apiClient from "./client.js";

export async function listSessions() {
  const { data } = await apiClient.get("/auth/sessions");
  return data.data; // { sessions, count }
}

export async function revokeSession(id) {
  const { data } = await apiClient.delete("/auth/sessions/" + id);
  return data.data;
}

export async function revokeOtherSessions() {
  const { data } = await apiClient.delete("/auth/sessions/others");
  return data.data;
}
