// src/controllers/clashController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as clashService from "../services/clashDetectionService.js";

export const checkClashes = asyncHandler(async (req, res) => {
  const result = await clashService.detectClashes(req.body || {});
  return success(res, result, "Clash check complete");
});
