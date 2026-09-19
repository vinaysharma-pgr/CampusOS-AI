// src/routes/uploadRoutes.js
import { Router } from "express";
import { uploadImage, uploadDocument } from "../controllers/uploadController.js";
import { fetchUpload } from "../controllers/uploadFetchController.js";
import { upload, uploadDoc } from "../middleware/upload.js";
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

// Document upload (images + PDFs + Office docs, up to 25 MB)
router.post("/doc",
  requireAuth,
  uploadRateLimiter,
  uploadDoc.single("file"),
  uploadQuotaGuard,
  uploadDocument
);

// Fetch document by filename (authenticated + ownership checked)
router.get("/doc/:filename", requireAuth, fetchUpload);

// Fetch by filename (authenticated + ownership checked)
router.get("/:filename", requireAuth, fetchUpload);

export default router;
