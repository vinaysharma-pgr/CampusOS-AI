import { Router } from "express";
import { list, upcoming, get, create, update, remove } from "../controllers/examController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/upcoming", upcoming);
router.get("/", list);
router.get("/:id", get);

router.post("/", requireRole("admin"), create);
router.put("/:id", requireRole("admin"), update);
router.delete("/:id", requireRole("admin"), remove);

export default router;
