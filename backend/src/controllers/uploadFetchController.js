// src/controllers/uploadFetchController.js
import fs from "node:fs";
import path from "node:path";
import Upload from "../models/Upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const DOC_DIR = path.join(process.cwd(), "uploads", "docs");

/**
 * Serve an uploaded file ONLY to:
 *   - its owner
 *   - admins
 *   - faculty (for review purposes)
 *   - HOD (which is admin)
 * All others → 403
 */
export const fetchUpload = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  // Basic filename sanity check
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    throw ApiError.badRequest("Invalid filename");
  }

  const record = await Upload.findOne({ filename, isActive: true }).lean();
  if (!record) throw ApiError.notFound("File not found");

  const user = req.user;
  const isOwner = record.ownerId && String(record.ownerId) === String(user._id);
  const isAdmin = user.role === "admin";
  const isFaculty = user.role === "faculty";

  if (!isOwner && !isAdmin && !isFaculty) {
    throw ApiError.forbidden("You do not have access to this file");
  }

  // Docs live in uploads/docs/, images in uploads/
  const isDoc = record.purpose === "study-material" || filename.startsWith("doc-");
  const baseDir = isDoc ? DOC_DIR : UPLOAD_DIR;
  const fullPath = path.join(baseDir, filename);
  if (!fs.existsSync(fullPath)) throw ApiError.notFound("File not found on disk");

  // Set security headers
  res.setHeader("Content-Type", record.mimeType || "application/octet-stream");
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.setHeader("X-Content-Type-Options", "nosniff");

  return res.sendFile(fullPath);
});
