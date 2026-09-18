// src/controllers/timetableController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as timetableService from "../services/timetableService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await timetableService.listTimetables({
    department: req.query.department,
    semester: req.query.semester,
  });
  return success(res, { timetables: items, count: items.length });
});

export const getMine = asyncHandler(async (req, res) => {
  const result = await timetableService.getTimetableForUser(req.user);
  return success(res, result);
});

export const get = asyncHandler(async (req, res) => {
  const tt = await timetableService.getTimetableById(req.params.id);
  if (!tt) return res.status(404).json({ success: false, message: "Timetable not found" });
  return success(res, { timetable: tt });
});

export const create = asyncHandler(async (req, res) => {
  const tt = await timetableService.createTimetable(req.body, req.user._id);
  return success(res, { timetable: tt }, "Timetable created", 201);
});

export const update = asyncHandler(async (req, res) => {
  const tt = await timetableService.updateTimetable(req.params.id, req.body);
  return success(res, { timetable: tt }, "Timetable updated");
});

export const remove = asyncHandler(async (req, res) => {
  const result = await timetableService.deleteTimetable(req.params.id);
  return success(res, result, "Timetable deleted");
});
