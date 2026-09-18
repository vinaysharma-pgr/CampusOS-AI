// src/api/timetables.js (extend existing)
import apiClient from "./client.js";

export async function listTimetables({ department, semester } = {}) {
  const params = {};
  if (department) params.department = department;
  if (semester) params.semester = semester;
  const { data } = await apiClient.get("/timetables", { params });
  return data.data.timetables;
}

export async function getMyTimetable() {
  const { data } = await apiClient.get("/timetables/mine");
  return data.data;
}

export async function getTimetable(id) {
  const { data } = await apiClient.get(`/timetables/${id}`);
  return data.data.timetable;
}

export async function createTimetable(payload) {
  const { data } = await apiClient.post("/timetables", payload);
  return data.data.timetable;
}

export async function updateTimetable(id, payload) {
  const { data } = await apiClient.put(`/timetables/${id}`, payload);
  return data.data.timetable;
}

export async function deleteTimetable(id) {
  const { data } = await apiClient.delete(`/timetables/${id}`);
  return data.data;
}

export async function checkClashes(payload) {
  const { data } = await apiClient.post("/timetables/check-clash", payload);
  return data.data; // { clashes, warnings }
}
