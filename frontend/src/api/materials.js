import apiClient from "./client.js";

export async function listMaterials({ courseCode, category } = {}) {
  const params = {};
  if (courseCode) params.courseCode = courseCode;
  if (category) params.category = category;
  const { data } = await apiClient.get("/materials", { params });
  return data.data.materials;
}

export async function listMyMaterials() {
  const { data } = await apiClient.get("/materials/mine");
  return data.data.materials;
}

export async function getMaterial(id) {
  const { data } = await apiClient.get(`/materials/${id}`);
  return data.data.material;
}

export async function createMaterial(payload) {
  const { data } = await apiClient.post("/materials", payload);
  return data.data.material;
}

export async function deleteMaterial(id) {
  const { data } = await apiClient.delete(`/materials/${id}`);
  return data.data;
}
