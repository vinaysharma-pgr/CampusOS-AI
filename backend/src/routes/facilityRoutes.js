import { Router } from "express";
import { list, get, create, update, remove } from "../controllers/facilityController.js";
import { createFacilityRules, updateFacilityRules } from "../validators/facilityValidator.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.get("/", list);
router.get("/:id", get);
router.post("/", requireAuth, requireRole("admin"), createFacilityRules, validate, create);
router.put("/:id", requireAuth, requireRole("admin"), updateFacilityRules, validate, update);
router.delete("/:id", requireAuth, requireRole("admin"), remove);

export default router;