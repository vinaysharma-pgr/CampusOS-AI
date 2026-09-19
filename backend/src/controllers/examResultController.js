import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as svc from "../services/examResultService.js";

export const listForExam = asyncHandler(async (req, res) => {
  const data = await svc.listResultsForExam(req.params.examId, req.user);
  return success(res, data);
});

export const bulkSave = asyncHandler(async (req, res) => {
  const result = await svc.bulkUpsertResults(req.params.examId, req.body.results, req.user);
  return success(res, result, "Results saved");
});

export const publish = asyncHandler(async (req, res) => {
  const publish = req.body?.publish !== false;
  const result = await svc.publishResults(req.params.examId, publish, req.user);
  return success(res, result, publish ? "Results published" : "Results unpublished");
});

export const mine = asyncHandler(async (req, res) => {
  const data = await svc.getMyResults(req.user._id);
  return success(res, data);
});

export const stats = asyncHandler(async (req, res) => {
  const data = await svc.getClassStats(req.params.examId);
  return success(res, data);
});
