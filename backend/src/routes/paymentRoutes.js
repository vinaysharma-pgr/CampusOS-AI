// src/routes/paymentRoutes.js
import { Router } from "express";
import { createPaymentOrder, verifyPayment, paymentStatus } from "../controllers/paymentController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/status", paymentStatus);
router.post("/order", requireAuth, requireRole("student"), createPaymentOrder);
router.post("/verify", requireAuth, requireRole("student"), verifyPayment);

export default router;
