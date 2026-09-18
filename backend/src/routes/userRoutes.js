// src/routes/userRoutes.js
import { Router } from "express";
import { list } from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/", requireRole("admin"), list);

export default router;
