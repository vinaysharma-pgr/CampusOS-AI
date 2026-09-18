// src/routes/hodSubmissionRoutes.js
import { Router } from "express";
import { list, create, review, remove } from "../controllers/hodSubmissionController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", list);
router.post("/", requireRole("faculty"), create);
router.put("/:id", requireRole("admin"), review);
router.delete("/:id", requireRole("faculty", "admin"), remove);

export default router;
