import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as facilityService from "../services/facilityService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await facilityService.listFacilities({ type: req.query.type, q: req.query.q });
  return success(res, { facilities: items, count: items.length });
});

export const get = asyncHandler(async (req, res) => {
  const f = await facilityService.getFacility(req.params.id);
  return success(res, { facility: f });
});

export const create = asyncHandler(async (req, res) => {
  const f = await facilityService.createFacility(req.body, req.user._id);
  return success(res, { facility: f }, "Facility created", 201);
});

export const update = asyncHandler(async (req, res) => {
  const f = await facilityService.updateFacility(req.params.id, req.body);
  return success(res, { facility: f }, "Facility updated");
});

export const remove = asyncHandler(async (req, res) => {
  const result = await facilityService.deleteFacility(req.params.id);
  return success(res, result, "Facility deleted");
});