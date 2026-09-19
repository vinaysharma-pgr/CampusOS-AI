import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as svc from "../services/studyMaterialService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await svc.listForUser(req.user, {
    courseCode: req.query.courseCode,
    category: req.query.category,
  });
  return success(res, { materials: items, count: items.length });
});

export const mine = asyncHandler(async (req, res) => {
  const items = await svc.listMine(req.user);
  return success(res, { materials: items, count: items.length });
});

export const get = asyncHandler(async (req, res) => {
  const material = await svc.getById(req.params.id);
  return success(res, { material });
});

export const create = asyncHandler(async (req, res) => {
  const material = await svc.create(req.body, req.user);
  return success(res, { material }, "Material uploaded", 201);
});

export const remove = asyncHandler(async (req, res) => {
  const result = await svc.remove(req.params.id, req.user);
  return success(res, result, "Deleted");
});
