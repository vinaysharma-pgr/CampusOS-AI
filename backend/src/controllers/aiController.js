// src/controllers/aiController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as aiService from "../services/aiService.js";
import { db } from "../database/index.js";

export const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const user = req.user || null; // auth is optional for chat
  const result = await aiService.chatWithCampus(message, user, db);
  return success(res, result);
});

export const status = asyncHandler(async (req, res) => {
  return success(res, { configured: aiService.isConfigured() });
});
