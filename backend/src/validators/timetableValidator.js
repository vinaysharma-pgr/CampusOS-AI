// src/validators/timetableValidator.js
import { body } from "express-validator";

export const createTimetableRules = [
  body("department").trim().notEmpty().withMessage("Department required"),
  body("semester").trim().notEmpty().withMessage("Semester required"),
  body("section").optional().trim(),
  body("academicYear").trim().notEmpty().withMessage("Academic year required"),
  body("classes").isArray({ min: 1 }).withMessage("At least one class required"),
];

export const updateTimetableRules = [
  body("classes").optional().isArray(),
  body("isActive").optional().isBoolean(),
];
