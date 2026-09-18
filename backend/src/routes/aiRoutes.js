// src/routes/aiRoutes.js
import { Router } from "express";
import { chat, status } from "../controllers/aiController.js";
import rateLimit from "express-rate-limit";

const router = Router();

// Chat rate limit: 20 requests per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many requests. Please wait a minute." },
});

router.get("/status", status);
router.post("/chat", chatLimiter, chat);

export default router;
