// src/api/groups.js
import apiClient from "./client.js";

export async function listGroups() {
  const { data } = await apiClient.get("/groups");
  return data.data.groups;
}
