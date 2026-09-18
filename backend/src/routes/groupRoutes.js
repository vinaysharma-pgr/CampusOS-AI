// src/routes/groupRoutes.js
import { Router } from "express";
import { list } from "../controllers/groupController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/", list);

export default router;
