// src/services/emailTemplates.js
// Beautiful dark-themed HTML email templates matching CampusOS brand

const BRAND = {
  bg: "#08090b",
  surface: "#0e1014",
  surfaceRaised: "#161a20",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.13)",
  text: "#f3f5f8",
  textSecondary: "#939aa5",
  textTertiary: "#5b6470",
  primary: "#3fe0c5",
  primaryFg: "#04150f",
  danger: "#f0554d",
};

function otpBox(otp) {
  return `
    <div style="margin:32px 0;padding:24px;border-radius:12px;background:${BRAND.surfaceRaised};border:1px solid ${BRAND.border};text-align:center;">
      <div style="font-family:'SF Mono','Monaco','Courier New',monospace;font-size:36px;font-weight:700;letter-spacing:0.3em;color:${BRAND.primary};text-shadow:0 0 24px rgba(63,224,197,0.4);">
        ${otp}
      </div>
      <div style="margin-top:12px;font-family:'SF Mono','Monaco',monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.textTertiary};">
        Valid for 10 minutes
      </div>
    </div>
  `;
}

function button(url, label) {
  return `
    <div style="margin:24px 0;text-align:center;">
      <a href="${url}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:${BRAND.primary};color:${BRAND.primaryFg};font-size:14px;font-weight:600;text-decoration:none;letter-spacing:-0.01em;">
        ${label}
      </a>
    </div>
  `;
}

function wrap({ title, preheader, body }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark light" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:0;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
  <div style="max-width:520px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;padding:10px;border-radius:12px;background:rgba(63,224,197,0.1);border:1px solid rgba(63,224,197,0.3);">
        <span style="font-size:18px;color:${BRAND.primary};">◉</span>
      </div>
      <div style="margin-top:10px;font-size:15px;font-weight:600;color:${BRAND.text};letter-spacing:-0.01em;">
        CampusOS<span style="color:${BRAND.primary};">.ai</span>
      </div>
    </div>

    <div style="padding:32px 28px;border-radius:16px;background:${BRAND.surface};border:1px solid ${BRAND.border};">
      <h1 style="margin:0;font-size:22px;font-weight:600;color:${BRAND.text};letter-spacing:-0.02em;line-height:1.3;">
        ${title}
      </h1>
      <div style="margin-top:16px;font-size:14px;line-height:1.6;color:${BRAND.textSecondary};">
        ${body}
      </div>
    </div>

    <div style="margin-top:24px;text-align:center;">
      <p style="margin:0;font-size:11px;color:${BRAND.textTertiary};line-height:1.6;">
        © ${new Date().getFullYear()} CampusOS.ai · SRMS CET Bareilly<br />
        If you didn't request this email, you can safely ignore it.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function signupOTPTemplate({ name, otp }) {
  return {
    subject: `${otp} is your CampusOS verification code`,
    html: wrap({
      title: `Verify your email, ${name}`,
      preheader: `Your verification code is ${otp}`,
      body: `
        <p style="margin:0;">Enter this code in the app to verify your email address and activate your CampusOS account.</p>
        ${otpBox(otp)}
        <p style="margin:0;font-size:13px;color:${BRAND.textTertiary};">Never share this code with anyone — CampusOS will never ask for it.</p>
      `,
    }),
    text: `Welcome to CampusOS, ${name}!\n\nYour verification code is: ${otp}\n\nValid for 10 minutes.\n\nIf you didn't request this, ignore this email.`,
  };
}

export function loginOTPTemplate({ name, otp, ip }) {
  return {
    subject: `${otp} is your CampusOS login code`,
    html: wrap({
      title: `Login code for ${name}`,
      preheader: `Your login code is ${otp}`,
      body: `
        <p style="margin:0;">Use this code to sign in to your CampusOS account.</p>
        ${otpBox(otp)}
        <div style="margin-top:20px;padding:12px 14px;border-radius:8px;background:${BRAND.surfaceRaised};border:1px solid ${BRAND.border};font-size:12px;color:${BRAND.textTertiary};">
          <strong style="color:${BRAND.textSecondary};">Request details:</strong><br />
          ${ip ? `IP: ${ip}<br />` : ""}Time: ${new Date().toLocaleString("en-IN")}
        </div>
      `,
    }),
    text: `Your CampusOS login code is: ${otp}\n\nValid for 10 minutes.`,
  };
}

export function forgotPasswordTemplate({ name, otp }) {
  return {
    subject: `${otp} is your CampusOS password reset code`,
    html: wrap({
      title: `Reset your password, ${name}`,
      preheader: `Your password reset code is ${otp}`,
      body: `
        <p style="margin:0;">We received a request to reset your CampusOS password. Use this code to proceed.</p>
        ${otpBox(otp)}
        <p style="margin:0;font-size:13px;color:${BRAND.textTertiary};">If you didn't request a password reset, you can safely ignore this email — your password will stay the same.</p>
      `,
    }),
    text: `Your CampusOS password reset code is: ${otp}\n\nValid for 10 minutes.\n\nIf you didn't request this, ignore this email.`,
  };
}

export function welcomeTemplate({ name }) {
  return {
    subject: `Welcome to CampusOS, ${name}! 🎉`,
    html: wrap({
      title: `Welcome aboard, ${name}!`,
      preheader: `Your CampusOS account is ready`,
      body: `
        <p style="margin:0;">Your CampusOS account is now active. Here's what you can do:</p>
        <ul style="margin:16px 0;padding-left:20px;color:${BRAND.textSecondary};line-height:1.8;">
          <li>Navigate any building on campus with the live map</li>
          <li>Check real-time facility occupancy before you leave your room</li>
          <li>Ask the AI assistant anything about SRMS</li>
          <li>See events, fests, and placement drives</li>
        </ul>
        ${button("http://localhost:5173/facilities", "Explore the campus")}
      `,
    }),
    text: `Welcome to CampusOS, ${name}!\n\nYour account is active. Visit http://localhost:5173 to get started.`,
  };
}