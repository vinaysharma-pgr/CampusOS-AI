// src/config/email.js
import nodemailer from "nodemailer";
import { env } from "./env.js";

let transporter = null;

if (env.smtp.user && env.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: false,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  transporter.verify((err) => {
    if (err) console.error("❌ SMTP connection failed:", err.message);
    else console.log("✅ SMTP ready — emails will send");
  });
} else {
  console.warn("⚠️  SMTP not configured — OTP emails will NOT send");
  console.warn("   Set SMTP_USER and SMTP_PASS in .env to enable");
}

export default transporter;