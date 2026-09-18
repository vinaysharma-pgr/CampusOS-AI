// src/controllers/attendanceController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as svc from "../services/attendanceService.js";

export const listStudents = asyncHandler(async (req, res) => {
  const students = await svc.listStudentsInGroup({
    department: req.query.department,
    semester: req.query.semester,
    section: req.query.section,
  });
  return success(res, { students, count: students.length });
});

export const mark = asyncHandler(async (req, res) => {
  const doc = await svc.markAttendance(req.body, req.user);
  return success(res, { attendance: doc }, "Attendance saved", 201);
});

export const list = asyncHandler(async (req, res) => {
  const items = await svc.listAttendance(req.query, req.user);
  return success(res, { attendance: items, count: items.length });
});

export const get = asyncHandler(async (req, res) => {
  const doc = await svc.getAttendanceById(req.params.id, req.user);
  return success(res, { attendance: doc });
});

export const remove = asyncHandler(async (req, res) => {
  const result = await svc.deleteAttendance(req.params.id, req.user);
  return success(res, result, "Deleted");
});

export const myStats = asyncHandler(async (req, res) => {
  const stats = await svc.getMyAttendanceStats(req.user);
  return success(res, stats);
});
