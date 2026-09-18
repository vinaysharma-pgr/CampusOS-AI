import { body } from "express-validator";

export const createEventRules = [
  body("title").trim().isLength({ min: 3, max: 200 }),
  body("isPaid").optional().isBoolean().toBoolean(),
  body("price").optional().isFloat({ min: 0 }).toFloat(),
  body("currency").optional().isIn(["INR", "USD"]),
  body("type").isIn(["academic", "cultural", "sports", "placement", "workshop"]),
  body("date").matches(/^\d{4}-\d{2}-\d{2}$/),
  body("time").trim().isLength({ min: 1 }),
  body("venue").trim().isLength({ min: 2 }),
  body("description").trim().isLength({ min: 10, max: 2000 }),
];

export const updateEventRules = [
  body("title").optional().trim().isLength({ min: 3, max: 200 }),
  body("isPaid").optional().isBoolean().toBoolean(),
  body("price").optional().isFloat({ min: 0 }).toFloat(),
  body("currency").optional().isIn(["INR", "USD"]),
  body("description").optional().trim().isLength({ min: 10, max: 2000 }),
];