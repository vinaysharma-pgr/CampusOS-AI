// src/services/auditLogService.js
import AuditLog from "../models/AuditLog.js";

/**
 * Write an audit log entry. Fire-and-forget — never throws to the caller.
 */
export async function log({
  user = null,
  action,
  resource = "",
  resourceType = "",
  status = "success",
  message = "",
  req = null,
  metadata = {},
}) {
  try {
    const entry = {
      userId: user?._id || null,
      userName: user?.name || "",
      userEmail: user?.email || "",
      userRole: user?.role || "",
      action,
      resource,
      resourceType,
      status,
      message,
      ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || "",
      userAgent: req?.headers?.["user-agent"] || "",
      method: req?.method || "",
      path: req?.originalUrl || req?.url || "",
      metadata,
    };

    await AuditLog.create(entry);
  } catch (err) {
    console.error("[AuditLog] Failed to write log:", err.message);
  }
}

/**
 * List audit logs with filters (for admin UI).
 */
export async function listLogs({
  userId = null,
  action = null,
  status = null,
  from = null,
  to = null,
  limit = 100,
} = {}) {
  const query = {};
  if (userId) query.userId = userId;
  if (action) query.action = action;
  if (status) query.status = status;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  return AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 100, 500))
    .lean();
}

/**
 * Get recent logins for a user (used for login-alert detection).
 */
export async function recentLoginsForUser(userId, hours = 24) {
  const cutoff = new Date(Date.now() - hours * 3600 * 1000);
  return AuditLog.find({
    userId,
    action: "auth.login",
    status: "success",
    createdAt: { $gte: cutoff },
  })
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Cleanup old logs (call periodically).
 */
export async function cleanupOldLogs(daysToKeep = 90) {
  const cutoff = new Date(Date.now() - daysToKeep * 24 * 3600 * 1000);
  const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
  return { deleted: result.deletedCount };
}
