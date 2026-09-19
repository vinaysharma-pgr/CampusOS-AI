import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as examService from "../services/examService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await examService.listExams({
    department: req.query.department,
    semester: req.query.semester,
    section: req.query.section,
    type: req.query.type,
    from: req.query.from,
    to: req.query.to,
  });
  return success(res, { exams: items, count: items.length });
});

export const upcoming = asyncHandler(async (req, res) => {
  const items = await examService.listUpcomingForUser(req.user);
  return success(res, { exams: items, count: items.length });
});

export const get = asyncHandler(async (req, res) => {
  const exam = await examService.getExamById(req.params.id);
  return success(res, { exam });
});

export const create = asyncHandler(async (req, res) => {
  const exam = await examService.createExam(req.body, req.user);
  return success(res, { exam }, "Exam created", 201);
});

export const update = asyncHandler(async (req, res) => {
  const exam = await examService.updateExam(req.params.id, req.body);
  return success(res, { exam }, "Exam updated");
});

export const remove = asyncHandler(async (req, res) => {
  const result = await examService.deleteExam(req.params.id);
  return success(res, result, "Exam deleted");
});
