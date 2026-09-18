// src/controllers/groupController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as groupService from "../services/groupService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await groupService.listGroups();
  return success(res, { groups: items, count: items.length });
});
