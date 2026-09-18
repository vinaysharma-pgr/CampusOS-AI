// src/routes/pushRoutes.js
import { Router } from "express";
import {
  getPublicKey, subscribe, unsubscribe, sendTest, getStats,
} from "../controllers/pushController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/public-key", getPublicKey);
router.post("/subscribe", requireAuth, subscribe);
router.post("/unsubscribe", requireAuth, unsubscribe);
router.post("/test", requireAuth, sendTest);
router.get("/stats", requireAuth, requireRole("admin"), getStats);

export default router;
