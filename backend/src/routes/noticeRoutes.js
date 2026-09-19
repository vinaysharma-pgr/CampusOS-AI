// src/routes/noticeRoutes.js
import { Router } from "express";
import { list, get, create, update, remove } from "../controllers/noticeController.js";
import { markRead, readers, stats } from "../controllers/noticeReadController.js";
import { createNoticeRules, updateNoticeRules } from "../validators/noticeValidator.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth); // every notice route requires auth

router.get("/", list);

// Read tracking (must come before /:id so it doesn't match as ID)
router.get("/:id/readers", requireRole("admin", "faculty"), readers);
router.get("/:id/stats", requireRole("admin", "faculty"), stats);
router.post("/:id/read", markRead);

router.get("/:id", get);

router.post("/",
  requireRole("admin", "faculty"),
  createNoticeRules,
  validate,
  create
);

router.put("/:id",
  requireRole("admin", "faculty"),
  updateNoticeRules,
  validate,
  update
);

router.delete("/:id",
  requireRole("admin", "faculty"),
  remove
);

export default router;