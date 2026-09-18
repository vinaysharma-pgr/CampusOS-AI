// src/controllers/noticeController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as noticeService from "../services/noticeService.js";

export const list = asyncHandler(async (req, res) => {
  const notices = req.user.role === "admin" && req.query.all === "true"
    ? await noticeService.listAllNotices()
    : await noticeService.listNoticesForUser(req.user);
  return success(res, { notices, count: notices.length });
});

export const get = asyncHandler(async (req, res) => {
  const notice = await noticeService.getNotice(req.params.id);
  return success(res, { notice });
});

export const create = asyncHandler(async (req, res) => {
  const notice = await noticeService.createNotice(req.body, req.user);
  return success(res, { notice }, "Notice posted", 201);
});

export const update = asyncHandler(async (req, res) => {
  const notice = await noticeService.updateNotice(req.params.id, req.body, req.user);
  return success(res, { notice }, "Notice updated");
});

export const remove = asyncHandler(async (req, res) => {
  const result = await noticeService.deleteNotice(req.params.id, req.user);
  return success(res, result, "Notice deleted");
});