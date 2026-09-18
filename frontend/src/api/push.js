// src/api/push.js
import apiClient from "./client.js";

export async function getVapidPublicKey() {
  const { data } = await apiClient.get("/push/public-key");
  return data.data.publicKey;
}

export async function subscribePush(subscription) {
  const { data } = await apiClient.post("/push/subscribe", { subscription });
  return data.data;
}

export async function unsubscribePush(endpoint) {
  const { data } = await apiClient.post("/push/unsubscribe", { endpoint });
  return data.data;
}

export async function sendTestPush() {
  const { data } = await apiClient.post("/push/test");
  return data.data;
}
