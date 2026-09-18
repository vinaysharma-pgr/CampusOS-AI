// src/api/ai.js
import apiClient from "./client.js";

export async function chatWithAI(message) {
  const { data } = await apiClient.post("/ai/chat", { message });
  return data.data; // { text }
}

export async function getAIStatus() {
  const { data } = await apiClient.get("/ai/status");
  return data.data; // { configured }
}
