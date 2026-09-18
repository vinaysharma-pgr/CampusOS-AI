import apiClient from "./client.js";

export async function listEvents({ type, q } = {}) {
  const params = {};
  if (type && type !== "all") params.type = type;
  if (q) params.q = q;
  const { data } = await apiClient.get("/events", { params });
  return data.data.events;
}

export async function getEvent(id) {
  const { data } = await apiClient.get(`/events/${id}`);
  return data.data.event;
}

export async function createEvent(payload) {
  const { data } = await apiClient.post("/events", payload);
  return data.data.event;
}

export async function updateEvent(id, payload) {
  const { data } = await apiClient.put(`/events/${id}`, payload);
  return data.data.event;
}

export async function deleteEvent(id) {
  const { data } = await apiClient.delete(`/events/${id}`);
  return data.data;
}