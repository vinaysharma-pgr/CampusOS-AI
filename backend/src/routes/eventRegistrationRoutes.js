// src/routes/eventRegistrationRoutes.js
import { Router } from "express";
import { register, listForEvent, listMine, myEventIds, myCoordinated, counts } from "../controllers/eventRegistrationController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/mine", listMine);
router.get("/mine/event-ids", myEventIds);
router.get("/coordinated", requireRole("faculty"), myCoordinated);
router.get("/counts", requireRole("admin"), counts);
router.get("/event/:eventId", requireRole("admin", "faculty"), listForEvent);
router.post("/event/:eventId", requireRole("student"), register);

export default router;
