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

export async function uploadDocument(file, purpose = "study-material") {
  const form = new FormData();
  form.append("file", file);
  form.append("purpose", purpose);
  const { data } = await apiClient.post("/upload/doc", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}
