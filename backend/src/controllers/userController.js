// src/controllers/userController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as svc from "../services/userService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await svc.listUsersByRole(req.query.role);
  return success(res, { users: items, count: items.length });
});
