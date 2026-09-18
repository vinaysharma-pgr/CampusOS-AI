// src/api/assignments.js
import apiClient from "./client.js";

export async function listAssignments() {
  const { data } = await apiClient.get("/assignments");
  return data.data.assignments;
}

export async function createAssignment(payload) {
  const { data } = await apiClient.post("/assignments", payload);
  return data.data.assignment;
}

export async function deleteAssignment(id) {
  const { data } = await apiClient.delete("/assignments/" + id);
  return data.data;
}
