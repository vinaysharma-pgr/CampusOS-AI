// src/routes/attendanceRoutes.js
import { Router } from "express";
import { listStudents, mark, list, get, remove, myStats } from "../controllers/attendanceController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Student: their own stats
router.get("/mine/stats", myStats);

// Faculty/admin: list students in a group
router.get("/students", requireRole("faculty", "admin"), listStudents);

// Mark / list / get / delete
router.post("/", requireRole("faculty", "admin"), mark);
router.get("/", requireRole("faculty", "admin"), list);
router.get("/:id", requireRole("faculty", "admin"), get);
router.delete("/:id", requireRole("faculty", "admin"), remove);

export default router;
