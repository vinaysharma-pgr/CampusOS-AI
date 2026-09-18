// src/api/upload.js
import apiClient from "./client.js";

export async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data; // { url, filename, size, mime }
}
