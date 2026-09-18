import { body } from "express-validator";

export const createFacilityRules = [
  body("id").trim().matches(/^[a-z0-9-]+$/).withMessage("ID must be lowercase letters, numbers, and hyphens"),
  body("name").trim().isLength({ min: 2, max: 100 }),
  body("type").isIn(["lab", "library", "classroom", "sports", "cafeteria", "auditorium", "facility"]),
  body("tagline").trim().isLength({ min: 5, max: 200 }),
  body("description").trim().isLength({ min: 10, max: 2000 }),
  body("code").optional().trim(),
];

export const updateFacilityRules = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }),
  body("tagline").optional().trim().isLength({ min: 5, max: 200 }),
  body("description").optional().trim().isLength({ min: 10, max: 2000 }),
];