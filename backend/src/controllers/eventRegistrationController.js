// src/controllers/eventRegistrationController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as svc from "../services/eventRegistrationService.js";

export const register = asyncHandler(async (req, res) => {
  const reg = await svc.registerForEvent(req.params.eventId, req.user);
  return success(res, { registration: reg }, "Registered", 201);
});

export const listForEvent = asyncHandler(async (req, res) => {
  const items = await svc.listRegistrationsForEvent(req.params.eventId, req.user);
  return success(res, { registrations: items, count: items.length });
});

export const listMine = asyncHandler(async (req, res) => {
  const items = await svc.listMyRegistrations(req.user);
  return success(res, { registrations: items, count: items.length });
});

export const myEventIds = asyncHandler(async (req, res) => {
  const ids = await svc.getMyRegisteredEventIds(req.user);
  return success(res, { eventIds: ids });
});

export const myCoordinated = asyncHandler(async (req, res) => {
  const items = await svc.listMyCoordinatedEvents(req.user);
  return success(res, { events: items, count: items.length });
});

export const counts = asyncHandler(async (req, res) => {
  const map = await svc.getRegistrationCounts();
  return success(res, { counts: map });
});
