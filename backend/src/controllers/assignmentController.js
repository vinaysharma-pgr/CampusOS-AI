// src/controllers/assignmentController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as assignmentService from "../services/assignmentService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await assignmentService.listForUser(req.user);
  return success(res, { assignments: items, count: items.length });
});

export const create = asyncHandler(async (req, res) => {
  const a = await assignmentService.create(req.body, req.user);
  return success(res, { assignment: a }, "Assignment created", 201);
});

export const remove = asyncHandler(async (req, res) => {
  const result = await assignmentService.remove(req.params.id, req.user);
  return success(res, result, "Assignment deleted");
});
