// src/controllers/lockController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as loginAttempts from "../services/loginAttemptService.js";

export const list = asyncHandler(async (req, res) => {
  const locked = loginAttempts.listLocked();
  return success(res, { locked, count: locked.length });
});

export const unlock = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest("Email is required");
  loginAttempts.unlock(email);
  return success(res, { unlocked: email }, "Account unlocked");
});
