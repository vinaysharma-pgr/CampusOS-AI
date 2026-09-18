// src/routes/uploadRoutes.js
import { Router } from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { fetchUpload } from "../controllers/uploadFetchController.js";
import { upload } from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadRateLimiter, uploadQuotaGuard } from "../middleware/uploadLimiter.js";

const router = Router();

// Upload (authenticated)
router.post("/",
  requireAuth,
  uploadRateLimiter,
  upload.single("file"),
  uploadQuotaGuard,
  uploadImage
);

// Fetch by filename (authenticated + ownership checked)
router.get("/:filename", requireAuth, fetchUpload);

export default router;
