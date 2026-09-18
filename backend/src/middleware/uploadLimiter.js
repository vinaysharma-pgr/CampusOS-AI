// src/middleware/uploadLimiter.js
import rateLimit from "express-rate-limit";
import Upload from "../models/Upload.js";

const PER_HOUR = Number(process.env.UPLOAD_RATE_PER_HOUR) || 20;
const PER_USER_MB = Number(process.env.UPLOAD_QUOTA_MB) || 100;

/**
 * Rate limiter keyed by authenticated user id.
 * Falls back to IP if somehow unauthenticated (shouldn't happen — requireAuth runs first).
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: PER_HOUR,
  keyGenerator: (req) => String(req.user?._id || req.ip || "anon"),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: `Upload limit reached. Max ${PER_HOUR} uploads per hour. Try again later.`,
      errors: [],
    });
  },
});

/**
 * Per-user storage quota guard.
 * Sums the size of the user's active uploads and compares to PER_USER_MB.
 * Reads req.file.size (multer has already parsed it by this point).
 */
export async function uploadQuotaGuard(req, res, next) {
  try {
    if (!req.user?._id) return next();
    if (!req.file?.size) return next();

    const agg = await Upload.aggregate([
      { $match: { ownerId: req.user._id, isActive: true } },
      { $group: { _id: null, total: { $sum: "$size" } } },
    ]);
    const usedBytes = agg[0]?.total || 0;
    const quotaBytes = PER_USER_MB * 1024 * 1024;

    if (usedBytes + req.file.size > quotaBytes) {
      const usedMB = (usedBytes / 1024 / 1024).toFixed(1);
      return res.status(413).json({
        success: false,
        message: `Storage quota exceeded. You are using ${usedMB} MB of ${PER_USER_MB} MB. Delete old uploads to free space.`,
        errors: [],
      });
    }

    // Attach info to request for logging
    req._uploadQuota = {
      usedBytes,
      quotaBytes,
      willBeUsedBytes: usedBytes + req.file.size,
    };
    next();
  } catch (err) {
    console.error("uploadQuotaGuard error:", err.message);
    next(); // fail open — don't block uploads on quota lookup errors
  }
}
