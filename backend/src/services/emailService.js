// src/services/emailService.js
import transporter from "../config/email.js";
import { env } from "../config/env.js";
import {
  signupOTPTemplate,
  loginOTPTemplate,
  forgotPasswordTemplate,
  welcomeTemplate,
} from "./emailTemplates.js";

async function send({ to, subject, html, text }) {
  if (!transporter) {
    console.warn(`⚠️  SMTP disabled — would have sent "${subject}" to ${to}`);
    console.warn(`   (Set SMTP_USER + SMTP_PASS in .env to enable real emails)`);
    return { skipped: true };
  }

  try {
    const info = await transporter.sendMail({
      from: env.smtp.from || env.smtp.user,
      to,
      subject,
      html,
      text,
    });
    console.log(`📧 Email sent to ${to} — ${info.messageId}`);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
    throw new Error("Failed to send email. Please try again.");
  }
}

export async function sendSignupOTP({ to, name, otp }) {
  const t = signupOTPTemplate({ name, otp });
  return send({ to, ...t });
}

export async function sendLoginOTP({ to, name, otp, ip }) {
  const t = loginOTPTemplate({ name, otp, ip });
  return send({ to, ...t });
}

export async function sendForgotPasswordOTP({ to, name, otp }) {
  const t = forgotPasswordTemplate({ name, otp });
  return send({ to, ...t });
}

export async function sendWelcome({ to, name }) {
  const t = welcomeTemplate({ name });
  return send({ to, ...t });
}