// src/models/AuditLog.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    // Who
    userId: { type: mongoose.Schema.Types.Mixed, default: null, index: true },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    userRole: { type: String, default: "" },

    // What
    action: {
      type: String,
      required: true,
      index: true,
      // Examples: "auth.login", "auth.logout", "auth.register",
      // "upload.create", "hod.submit", "hod.review",
      // "timetable.create", "timetable.update", "timetable.delete",
      // "notice.create", "notice.delete",
      // "event.create", "event.delete",
      // "attendance.mark", "assignment.create"
    },
    resource: { type: String, default: "" },   // e.g. "timetable:abc123"
    resourceType: { type: String, default: "" }, // "timetable" | "notice" | ...

    // Result
    status: { type: String, enum: ["success", "failure"], default: "success", index: true },
    message: { type: String, default: "" },

    // Context
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    method: { type: String, default: "" },     // GET / POST / PUT / DELETE
    path: { type: String, default: "" },       // /api/auth/login

    // Extra
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Fast lookups by user, action, or date
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
