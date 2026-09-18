// src/controllers/aiVisionController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as visionService from "../services/aiVisionService.js";

export const extractTimetable = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("Please upload a timetable image");
  const result = await visionService.extractTimetableFromImage(req.file.buffer, req.file.mimetype);
  return success(res, result, "Extraction complete");
});

export const visionStatus = asyncHandler(async (req, res) => {
  return success(res, { configured: visionService.isVisionConfigured() });
});
