// src/routes/assignmentRoutes.js
import { Router } from "express";
import { list, create, remove } from "../controllers/assignmentController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", list);
router.post("/", requireRole("faculty", "admin"), create);
router.delete("/:id", requireRole("faculty", "admin"), remove);

export default router;
