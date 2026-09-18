// src/api/hodSubmissions.js
import apiClient from "./client.js";

export async function listHodSubmissions() {
  const { data } = await apiClient.get("/hod-submissions");
  return data.data.submissions;
}

export async function createHodSubmission(payload) {
  const { data } = await apiClient.post("/hod-submissions", payload);
  return data.data.submission;
}

export async function reviewHodSubmission(id, payload) {
  const { data } = await apiClient.put("/hod-submissions/" + id, payload);
  return data.data.submission;
}

export async function deleteHodSubmission(id) {
  const { data } = await apiClient.delete("/hod-submissions/" + id);
  return data.data;
}
