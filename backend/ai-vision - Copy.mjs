// ai-vision.mjs — creates the Gemini Vision service + endpoint
import fs from "node:fs";

// ─── 1. Extend env.js with Gemini vision model ───
const envPath = "src/config/env.js";
let envC = fs.readFileSync(envPath, "utf8");
if (!envC.includes("visionModel")) {
  envC = envC.replace(
    '    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",',
    '    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",\n    visionModel: process.env.GEMINI_VISION_MODEL || "gemini-3.6-flash",'
  );
  fs.writeFileSync(envPath, envC, "utf8");
  console.log("✓ env.js — added visionModel");
}

// ─── 2. Create the vision service ───
const visionService = `// src/services/aiVisionService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

let client = null;
function getClient() {
  if (client) return client;
  if (!env.gemini?.apiKey) return null;
  client = new GoogleGenerativeAI(env.gemini.apiKey);
  return client;
}

// System prompt that tells Gemini exactly what JSON to produce
const EXTRACTION_PROMPT = \`You are a timetable extraction AI. You will receive an image of a printed college timetable.

Your job:
1. Detect the department, semester, section, and academic year from the image header.
2. Extract every class row.
3. Return a strict JSON object — nothing else.

Output format (strict):
{
  "detected": {
    "department": "CS",
    "semester": "5",
    "section": "CS1",
    "academicYear": "2025-26",
    "confidence": 0.85
  },
  "classes": [
    {
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "10:00",
      "courseCode": "CS1",
      "courseName": "Machine Learning Techniques",
      "room": "303",
      "facultyName": "SB",
      "type": "lecture"
    }
  ],
  "warnings": [
    "Any cells that were unclear, merged, or uncertain"
  ]
}

Rules:
- "dayOfWeek" must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.
- "startTime" and "endTime" must be 24-hour HH:MM strings.
- "type" must be one of: lecture, lab, tutorial, exam.
- "room" is the room number/name as text. If unknown, use "—".
- "facultyName" is whatever name/code appears. If unknown, use "".
- Do NOT invent classes. Only output what is visible.
- If a cell is a merged slot with multiple subjects (like "DBMS Lab / WT Lab"), pick the first and add a warning.
- Return ONLY the JSON. No markdown fences, no commentary.

Read the image carefully. Extract every visible class.\`;

// Helper — strip markdown fences if Gemini adds them
function cleanJson(text) {
  let t = text.trim();
  if (t.startsWith("\`\`\`")) {
    t = t.replace(/^\`\`\`(json)?\\n?/, "").replace(/\\n?\`\`\`$/, "");
  }
  return t.trim();
}

export function isVisionConfigured() {
  return !!(env.gemini?.apiKey);
}

/**
 * Extract timetable data from an image buffer.
 * @param {Buffer} imageBuffer
 * @param {string} mimeType — e.g. "image/jpeg", "image/png"
 * @returns {Promise<{detected, classes, warnings}>}
 */
export async function extractTimetableFromImage(imageBuffer, mimeType = "image/jpeg") {
  if (!imageBuffer) throw ApiError.badRequest("No image provided");

  const genAI = getClient();
  if (!genAI) throw ApiError.internal("Gemini is not configured. Add GEMINI_API_KEY to .env");

  const model = genAI.getGenerativeModel({
    model: env.gemini.visionModel || "gemini-3.6-flash",
  });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType,
    },
  };

  try {
    const result = await model.generateContent([EXTRACTION_PROMPT, imagePart]);
    const raw = result.response.text();
    const cleaned = cleanJson(raw);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (jsonErr) {
      console.error("Gemini returned invalid JSON:", cleaned.slice(0, 500));
      throw ApiError.internal("AI returned malformed data. Try again or upload a clearer image.");
    }

    // Normalize / validate
    const detected = parsed.detected || {};
    const classes = Array.isArray(parsed.classes) ? parsed.classes : [];
    const warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];

    // Sanitize each class
    const VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const VALID_TYPES = ["lecture", "lab", "tutorial", "exam"];

    const cleanClasses = classes
      .filter((c) => c && c.dayOfWeek && VALID_DAYS.includes(c.dayOfWeek))
      .map((c) => ({
        dayOfWeek: c.dayOfWeek,
        startTime: String(c.startTime || "").slice(0, 5),
        endTime: String(c.endTime || "").slice(0, 5),
        courseCode: (c.courseCode || "").toString().trim() || "—",
        courseName: (c.courseName || "").toString().trim() || "—",
        room: (c.room || "—").toString().trim(),
        facultyName: (c.facultyName || "").toString().trim(),
        type: VALID_TYPES.includes(c.type) ? c.type : "lecture",
      }));

    return {
      detected: {
        department: (detected.department || "").toString().toUpperCase().trim(),
        semester: (detected.semester || "").toString().trim(),
        section: (detected.section || "").toString().trim(),
        academicYear: (detected.academicYear || "2025-26").toString().trim(),
        confidence: typeof detected.confidence === "number" ? detected.confidence : 0.7,
      },
      classes: cleanClasses,
      warnings,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("Gemini vision error:", err.message);
    throw ApiError.internal("AI extraction failed: " + err.message);
  }
}
`;

fs.writeFileSync("src/services/aiVisionService.js", visionService, "utf8");
console.log("✓ src/services/aiVisionService.js created");

// ─── 3. Add extraction controller ───
const controller = `// src/controllers/aiVisionController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as visionService from "../services/aiVisionService.js";

export const extractTimetable = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("Please upload a timetable image");
  const result = await visionService.extractTimetableFromImage(
    req.file.buffer,
    req.file.mimetype
  );
  return success(res, result, "Extraction complete");
});

export const visionStatus = asyncHandler(async (req, res) => {
  return success(res, { configured: visionService.isVisionConfigured() });
});
`;

fs.writeFileSync("src/controllers/aiVisionController.js", controller, "utf8");
console.log("✓ src/controllers/aiVisionController.js created");

// ─── 4. Add routes ───
const routes = `// src/routes/aiVisionRoutes.js
import { Router } from "express";
import { extractTimetable, visionStatus } from "../controllers/aiVisionController.js";
import { upload } from "../middleware/upload.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const router = Router();

// Vision extraction is expensive — limit to 10 per 5 min per IP
const visionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many extractions. Please wait 5 minutes." },
});

router.get("/status", visionStatus);
router.post(
  "/extract-timetable",
  requireAuth,
  requireRole("admin"),
  visionLimiter,
  upload.single("file"),
  extractTimetable
);

export default router;
`;

fs.writeFileSync("src/routes/aiVisionRoutes.js", routes, "utf8");
console.log("✓ src/routes/aiVisionRoutes.js created");

// ─── 5. Register in routes/index.js ───
const routesPath = "src/routes/index.js";
let routesC = fs.readFileSync(routesPath, "utf8");
if (!routesC.includes("aiVisionRoutes")) {
  routesC = routesC.replace(
    'import aiRoutes from "./aiRoutes.js";',
    'import aiRoutes from "./aiRoutes.js";\nimport aiVisionRoutes from "./aiVisionRoutes.js";'
  );
  routesC = routesC.replace(
    'router.use("/ai", aiRoutes);',
    'router.use("/ai", aiRoutes);\nrouter.use("/ai", aiVisionRoutes);'
  );
  fs.writeFileSync(routesPath, routesC, "utf8");
  console.log("✓ routes/index.js — /api/ai/extract-timetable registered");
} else {
  console.log("= routes/index.js already has aiVisionRoutes");
}

console.log("");
console.log("Script 1 complete. Restart backend.");