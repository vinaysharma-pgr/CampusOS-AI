import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as eventService from "../services/eventService.js";

export const list = asyncHandler(async (req, res) => {
  const items = await eventService.listEvents({ type: req.query.type, q: req.query.q });
  return success(res, { events: items, count: items.length });
});

export const get = asyncHandler(async (req, res) => {
  const e = await eventService.getEvent(req.params.id);
  return success(res, { event: e });
});

export const create = asyncHandler(async (req, res) => {
  const e = await eventService.createEvent(req.body, req.user._id);
  return success(res, { event: e }, "Event created", 201);
});

export const update = asyncHandler(async (req, res) => {
  const e = await eventService.updateEvent(req.params.id, req.body);
  return success(res, { event: e }, "Event updated");
});

export const remove = asyncHandler(async (req, res) => {
  const result = await eventService.deleteEvent(req.params.id);
  return success(res, result, "Event deleted");
});