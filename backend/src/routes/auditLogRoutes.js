// src/routes/auditLogRoutes.js
import { Router } from "express";
import { list, cleanup } from "../controllers/auditLogController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", list);
router.delete("/cleanup", cleanup);

export default router;
