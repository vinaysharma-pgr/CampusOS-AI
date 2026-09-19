import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as svc from "../services/noticeReadService.js";

export const markRead = asyncHandler(async (req, res) => {
  const result = await svc.markRead(req.params.id, req.user);
  return success(res, result, "Marked as read");
});

export const readers = asyncHandler(async (req, res) => {
  const list = await svc.readersForNotice(req.params.id);
  return success(res, { readers: list, count: list.length });
});

export const stats = asyncHandler(async (req, res) => {
  const result = await svc.statsForNotice(req.params.id);
  return success(res, result);
});
