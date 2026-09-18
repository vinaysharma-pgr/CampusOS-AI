// src/api/eventRegistrations.js
import apiClient from "./client.js";

export async function registerForEvent(eventId) {
  const { data } = await apiClient.post("/event-registrations/event/" + eventId);
  return data.data.registration;
}

export async function listMyRegistrations() {
  const { data } = await apiClient.get("/event-registrations/mine");
  return data.data.registrations;
}

export async function getMyEventIds() {
  const { data } = await apiClient.get("/event-registrations/mine/event-ids");
  return data.data.eventIds;
}

export async function listForEvent(eventId) {
  const { data } = await apiClient.get("/event-registrations/event/" + eventId);
  return data.data.registrations;
}

export async function listMyCoordinatedEvents() {
  const { data } = await apiClient.get("/event-registrations/coordinated");
  return data.data.events;
}

export async function getRegistrationCounts() {
  const { data } = await apiClient.get("/event-registrations/counts");
  return data.data.counts;
}
