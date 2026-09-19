import { Router } from "express";
import { listForExam, bulkSave, publish, mine, stats } from "../controllers/examResultController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Student: my published results
router.get("/mine", mine);

// Faculty/Admin: list students + existing marks for an exam
router.get("/exam/:examId", requireRole("faculty", "admin"), listForExam);

// Faculty/Admin: bulk save marks
router.post("/exam/:examId/bulk", requireRole("faculty", "admin"), bulkSave);

// Admin: publish/unpublish
router.put("/exam/:examId/publish", requireRole("admin"), publish);

// Admin/HOD: class stats
router.get("/exam/:examId/stats", requireRole("faculty", "admin"), stats);

export default router;
