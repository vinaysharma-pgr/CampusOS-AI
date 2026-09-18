// src/routes/aiVisionRoutes.js
import { Router } from "express";
import { extractTimetable, visionStatus } from "../controllers/aiVisionController.js";
import { upload } from "../middleware/upload.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const router = Router();

const visionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many extractions. Please wait 5 minutes." },
});

router.get("/vision-status", visionStatus);
router.post(
  "/extract-timetable",
  requireAuth,
  requireRole("admin"),
  visionLimiter,
  upload.single("file"),
  extractTimetable
);

export default router;
