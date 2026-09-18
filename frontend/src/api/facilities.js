import apiClient from "./client.js";

export async function listFacilities({ type, q } = {}) {
  const params = {};
  if (type && type !== "all") params.type = type;
  if (q) params.q = q;
  const { data } = await apiClient.get("/facilities", { params });
  return data.data.facilities;
}

export async function getFacility(id) {
  const { data } = await apiClient.get(`/facilities/${id}`);
  return data.data.facility;
}

export async function createFacility(payload) {
  const { data } = await apiClient.post("/facilities", payload);
  return data.data.facility;
}

export async function updateFacility(id, payload) {
  const { data } = await apiClient.put(`/facilities/${id}`, payload);
  return data.data.facility;
}

export async function deleteFacility(id) {
  const { data } = await apiClient.delete(`/facilities/${id}`);
  return data.data;
}