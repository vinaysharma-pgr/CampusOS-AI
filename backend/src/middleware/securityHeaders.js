// src/middleware/securityHeaders.js
import helmet from "helmet";
import { env } from "../config/env.js";

// Content Security Policy
// Adjust `connectSrc` and `imgSrc` for your frontend + Cloudinary domains
const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],

  // Scripts: self + Razorpay checkout (only source we trust)
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",         // needed for Vite dev + Razorpay inline events
    "'unsafe-eval'",           // needed by Vite dev (removed in prod via env check below)
    "https://checkout.razorpay.com",
    "https://api.razorpay.com",
  ],

  // Styles
  styleSrc: [
    "'self'",
    "'unsafe-inline'",         // needed by Framer Motion and Tailwind inline styles
    "https://fonts.googleapis.com",
  ],

  // Fonts
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "data:",
  ],

  // Images: allow data URIs, blob, localhost uploads, Cloudinary, Unsplash
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "http://localhost:5000",
    "https://res.cloudinary.com",
    "https://images.unsplash.com",
    "https://*.razorpay.com",
  ],

  // XHR/Fetch/WebSocket endpoints
  connectSrc: [
    "'self'",
    "http://localhost:5000",
    "ws://localhost:5000",
    "wss://localhost:5000",
    "https://api.razorpay.com",
    "https://lumberjack.razorpay.com",
  ],

  // Frames: allow Razorpay checkout iframe
  frameSrc: [
    "'self'",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
  ],

  // Media
  mediaSrc: ["'self'", "blob:", "data:"],

  // Workers (service worker for push)
  workerSrc: ["'self'", "blob:"],

  // Form submissions
  formAction: ["'self'"],

  // Block embedding this site in iframes
  frameAncestors: ["'none'"],

  // Upgrade insecure requests — commented out for local HTTP dev
  // upgradeInsecureRequests: [],
};

// Relax CSP for local dev (Vite dev server needs eval)
const isDev = env.nodeEnv !== "production";

export const securityHeaders = [
  helmet({
    contentSecurityPolicy: isDev
      ? false // disable CSP in dev; Vite needs eval + inline scripts
      : { directives: CSP_DIRECTIVES },
    crossOriginEmbedderPolicy: false, // Razorpay needs this off
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: isDev
      ? false
      : {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
  }),

  // Permissions Policy — disable browser features we don't use
  (req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      [
        "camera=(self)",          // allow self (ImagePicker needs it)
        "microphone=()",           // block mic
        "geolocation=(self)",      // allow self (SOS feature)
        "payment=(self https://checkout.razorpay.com)", // allow payment
        "usb=()",
        "magnetometer=()",
        "gyroscope=()",
        "accelerometer=()",
      ].join(", ")
    );
    next();
  },

  // Custom security headers
  (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    next();
  },
];
