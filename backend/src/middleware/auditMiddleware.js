// src/middleware/auditMiddleware.js
import * as auditLog from "../services/auditLogService.js";

// Map HTTP method + path to a friendly action name
const ACTION_MAP = [
  { method: "POST",   path: /^\/api\/auth\/login/,        action: "auth.login" },
  { method: "POST",   path: /^\/api\/auth\/logout/,       action: "auth.logout" },
  { method: "POST",   path: /^\/api\/auth\/register/,     action: "auth.register" },
  { method: "POST",   path: /^\/api\/auth\/signup\/verify/, action: "auth.signup_verify" },
  { method: "POST",   path: /^\/api\/auth\/login\/otp\/verify/, action: "auth.login_otp_verify" },
  { method: "POST",   path: /^\/api\/upload/,             action: "upload.create" },
  { method: "POST",   path: /^\/api\/hod-submissions/,    action: "hod.submit" },
  { method: "PUT",    path: /^\/api\/hod-submissions\//,  action: "hod.review" },
  { method: "POST",   path: /^\/api\/timetables/,         action: "timetable.create" },
  { method: "PUT",    path: /^\/api\/timetables\//,       action: "timetable.update" },
  { method: "DELETE", path: /^\/api\/timetables\//,       action: "timetable.delete" },
  { method: "POST",   path: /^\/api\/notices/,            action: "notice.create" },
  { method: "PUT",    path: /^\/api\/notices\//,          action: "notice.update" },
  { method: "DELETE", path: /^\/api\/notices\//,          action: "notice.delete" },
  { method: "POST",   path: /^\/api\/events/,             action: "event.create" },
  { method: "PUT",    path: /^\/api\/events\//,           action: "event.update" },
  { method: "DELETE", path: /^\/api\/events\//,           action: "event.delete" },
  { method: "POST",   path: /^\/api\/attendance/,         action: "attendance.mark" },
  { method: "POST",   path: /^\/api\/assignments/,        action: "assignment.create" },
  { method: "DELETE", path: /^\/api\/assignments\//,      action: "assignment.delete" },
  { method: "POST",   path: /^\/api\/payments\/order/,    action: "payment.order" },
  { method: "POST",   path: /^\/api\/payments\/verify/,   action: "payment.verify" },
];

function resolveAction(req) {
  for (const rule of ACTION_MAP) {
    if (req.method === rule.method && rule.path.test(req.originalUrl || req.url)) {
      return rule.action;
    }
  }
  return null; // not audit-worthy
}

/**
 * Express middleware — logs sensitive actions after the response is sent.
 * Fire-and-forget, never blocks the request.
 */
export function auditMiddleware(req, res, next) {
  const action = resolveAction(req);
  if (!action) return next();

  // Capture original json to detect errors from the response body
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const status = res.statusCode >= 400 ? "failure" : "success";
    const message = body?.message || "";

    // Fire-and-forget log write — never await, never throw
    auditLog.log({
      user: req.user || null,
      action,
      resource: req.originalUrl,
      resourceType: action.split(".")[0],
      status,
      message,
      req,
      metadata: {
        body: sanitizeBody(req.body),
        params: req.params,
        query: req.query,
      },
    }).catch(() => {});

    return originalJson(body);
  };

  next();
}

// Strip sensitive fields from body before logging
function sanitizeBody(body) {
  if (!body || typeof body !== "object") return {};
  const safe = { ...body };
  delete safe.password;
  delete safe.newPassword;
  delete safe.confirmPassword;
  delete safe.otp;
  delete safe.razorpay_signature;
  delete safe.resetToken;
  return safe;
}
