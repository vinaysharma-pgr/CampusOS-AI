// src/validators/authValidator.js
import { body } from "express-validator";

export const registerRules = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 chars"),
  body("email").trim().isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password")
    .isLength({ min: 10 })
    .withMessage("Password must be at least 10 characters")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number"),
  body("role").optional().isIn(["student", "faculty", "admin", "it"]),
  body("organization").optional().trim(),
];

export const loginRules = [
  body("email").trim().isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const emailOnlyRules = [
  body("email").trim().isEmail().withMessage("Invalid email").normalizeEmail(),
];

export const otpRules = [
  body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits").isNumeric(),
];

export const resetPasswordRules = [
  body("resetToken").trim().notEmpty().withMessage("Reset token missing"),
  body("newPassword")
    .isLength({ min: 10 })
    .withMessage("Password must be at least 10 characters")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number"),
];
