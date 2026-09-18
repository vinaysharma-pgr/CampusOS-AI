// src/api/attendance.js
import apiClient from "./client.js";

export async function listStudentsInGroup({ department, semester, section }) {
  const params = { department, semester, section };
  const { data } = await apiClient.get("/attendance/students", { params });
  return data.data.students;
}

export async function markAttendance(payload) {
  const { data } = await apiClient.post("/attendance", payload);
  return data.data.attendance;
}

export async function listAttendance(params = {}) {
  const { data } = await apiClient.get("/attendance", { params });
  return data.data.attendance;
}

export async function getAttendance(id) {
  const { data } = await apiClient.get("/attendance/" + id);
  return data.data.attendance;
}

export async function deleteAttendance(id) {
  const { data } = await apiClient.delete("/attendance/" + id);
  return data.data;
}

export async function getMyAttendanceStats() {
  const { data } = await apiClient.get("/attendance/mine/stats");
  return data.data;
}
