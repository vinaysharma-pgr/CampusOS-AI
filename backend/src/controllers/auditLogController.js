// src/controllers/auditLogController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import * as auditLog from "../services/auditLogService.js";

export const list = asyncHandler(async (req, res) => {
  const logs = await auditLog.listLogs({
    userId: req.query.userId,
    action: req.query.action,
    status: req.query.status,
    from: req.query.from,
    to: req.query.to,
    limit: req.query.limit,
  });
  return success(res, { logs, count: logs.length });
});

export const cleanup = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 90;
  const result = await auditLog.cleanupOldLogs(days);
  return success(res, result, "Cleanup complete");
});
