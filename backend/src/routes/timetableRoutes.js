// src/routes/timetableRoutes.js
import { Router } from "express";
import { list, getMine, get, create, update, remove } from "../controllers/timetableController.js";
import { checkClashes } from "../controllers/clashController.js";
import { createTimetableRules, updateTimetableRules } from "../validators/timetableValidator.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// User's own timetable (works for students, faculty, admin)
router.get("/mine", getMine);

// Clash detection (admin only, must come before /:id)
router.post("/check-clash", requireRole("admin"), checkClashes);

// List / get specific
router.get("/", list);
router.get("/:id", get);

// Admin only
router.post("/", requireRole("admin"), createTimetableRules, validate, create);
router.put("/:id", requireRole("admin"), updateTimetableRules, validate, update);
router.delete("/:id", requireRole("admin"), remove);

export default router;
