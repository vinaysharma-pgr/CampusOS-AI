// src/routes/notificationRoutes.js
import { Router } from "express";
import { list, unreadCount, markRead, markAllRead, remove } from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", list);
router.get("/unread-count", unreadCount);
router.put("/:id/read", markRead);
router.put("/read-all", markAllRead);
router.delete("/:id", remove);

export default router;
