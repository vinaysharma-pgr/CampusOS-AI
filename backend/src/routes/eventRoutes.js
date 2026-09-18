import { Router } from "express";
import { list, get, create, update, remove } from "../controllers/eventController.js";
import { createEventRules, updateEventRules } from "../validators/eventValidator.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.get("/", list);
router.get("/:id", get);
router.post("/", requireAuth, requireRole("admin"), createEventRules, validate, create);
router.put("/:id", requireAuth, requireRole("admin"), updateEventRules, validate, update);
router.delete("/:id", requireAuth, requireRole("admin"), remove);

export default router;