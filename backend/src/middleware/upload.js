// src/middleware/upload.js
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
  cb(ApiError.badRequest("Only image files are allowed"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

const DOC_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);

const docFileFilter = (req, file, cb) => {
  if (file.mimetype && DOC_MIMES.has(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest("Unsupported file type. Allowed: image, PDF, Word, PowerPoint, plain text."));
};

export const uploadDoc = multer({
  storage,
  fileFilter: docFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB for study materials
});
