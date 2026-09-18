// src/controllers/uploadController.js
// Local-disk image storage with auth-protected access.
// Every upload is tracked in the DB and served only through a protected route.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Upload from "../models/Upload.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");

  const ext = EXT_BY_MIME[req.file.mimetype] || ".jpg";
  // 32-hex-char random name — unguessable
  const random = crypto.randomBytes(16).toString("hex");
  const filename = `${Date.now()}-${random}${ext}`;
  const fullPath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(fullPath, req.file.buffer);

  // Record metadata so we can authorize later
  const doc = await Upload.create({
    filename,
    originalName: req.file.originalname || "",
    mimeType: req.file.mimetype,
    size: req.file.size,
    ownerId: req.user?._id || null,
    ownerName: req.user?.name || "",
    ownerRole: req.user?.role || "",
    purpose: req.body?.purpose || "generic",
  });

  // Return a PROTECTED url — not the raw disk path
  const url = `/api/upload/${filename}`;

  return success(res, {
    url,
    filename,
    size: req.file.size,
    mime: req.file.mimetype,
    uploadId: doc._id,
  }, "Image uploaded", 201);
});
