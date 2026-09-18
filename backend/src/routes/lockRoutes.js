// src/routes/lockRoutes.js
import { Router } from "express";
import { list, unlock } from "../controllers/lockController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", list);
router.post("/unlock", unlock);

export default router;
