import { Router } from "express";
import { list, mine, get, create, remove } from "../controllers/studyMaterialController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", list);
router.get("/mine", mine);
router.get("/:id", get);

router.post("/", requireRole("faculty", "admin"), create);
router.delete("/:id", requireRole("faculty", "admin"), remove);

export default router;
