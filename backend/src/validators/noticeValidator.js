// src/validators/noticeValidator.js
import { body } from "express-validator";

export const createNoticeRules = [
  body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Title 3–200 chars"),
  body("body").trim().isLength({ min: 5, max: 5000 }).withMessage("Body 5–5000 chars"),
  body("category").optional().isIn(["Academic", "Exam", "Cultural", "Sports", "Placement", "Facility", "General"]),
  body("priority").optional().isIn(["normal", "urgent"]),
  body("targetAudience").optional().isIn(["all", "students", "faculty", "department"]),
  body("targetDepartment").optional({ nullable: true }).isString(),
  body("expiresAt").optional({ nullable: true }).isISO8601(),
];

export const updateNoticeRules = [
  body("title").optional().trim().isLength({ min: 3, max: 200 }),
  body("body").optional().trim().isLength({ min: 5, max: 5000 }),
  body("priority").optional().isIn(["normal", "urgent"]),
];