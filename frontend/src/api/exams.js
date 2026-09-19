import apiClient from "./client.js";

export async function listExams({ department, semester, section, type, from, to } = {}) {
  const params = {};
  if (department) params.department = department;
  if (semester) params.semester = semester;
  if (section) params.section = section;
  if (type) params.type = type;
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await apiClient.get("/exams", { params });
  return data.data.exams;
}

export async function listUpcomingExams() {
  const { data } = await apiClient.get("/exams/upcoming");
  return data.data.exams;
}

export async function getExam(id) {
  const { data } = await apiClient.get(`/exams/${id}`);
  return data.data.exam;
}

export async function createExam(payload) {
  const { data } = await apiClient.post("/exams", payload);
  return data.data.exam;
}

export async function updateExam(id, payload) {
  const { data } = await apiClient.put(`/exams/${id}`, payload);
  return data.data.exam;
}

export async function deleteExam(id) {
  const { data } = await apiClient.delete(`/exams/${id}`);
  return data.data;
}
