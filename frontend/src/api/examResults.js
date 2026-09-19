import apiClient from "./client.js";

export async function listResultsForExam(examId) {
  const { data } = await apiClient.get(`/exam-results/exam/${examId}`);
  return data.data;
}

export async function bulkSaveResults(examId, results) {
  const { data } = await apiClient.post(`/exam-results/exam/${examId}/bulk`, { results });
  return data.data;
}

export async function publishResults(examId, publish = true) {
  const { data } = await apiClient.put(`/exam-results/exam/${examId}/publish`, { publish });
  return data.data;
}

export async function getMyResults() {
  const { data } = await apiClient.get("/exam-results/mine");
  return data.data;
}

export async function getExamStats(examId) {
  const { data } = await apiClient.get(`/exam-results/exam/${examId}/stats`);
  return data.data;
}
