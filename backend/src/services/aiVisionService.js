// src/services/aiVisionService.js
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

const EXTRACTION_PROMPT = `You are a timetable extraction AI. You will receive an image of a printed college timetable.

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
  "warnings": ["Any cells that were unclear, merged, or uncertain"]
}

Rules:
- dayOfWeek must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
- startTime and endTime must be 24-hour HH:MM strings
- type must be one of: lecture, lab, tutorial, exam
- Return ONLY the JSON. No markdown fences, no commentary.
- Do NOT invent classes. Only output what is visible.
- If a cell has multiple subjects (like "DBMS Lab / WT Lab"), pick the first and add a warning.`;

function cleanJson(text) {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
  }
  return t.trim();
}

export function isVisionConfigured() {
  return !!(env.gemini?.apiKey);
}

export async function extractTimetableFromImage(imageBuffer, mimeType = "image/jpeg") {
  if (!imageBuffer) throw ApiError.badRequest("No image provided");
  const genAI = getClient();
  if (!genAI) throw ApiError.internal("Gemini is not configured. Add GEMINI_API_KEY to .env");

  const model = genAI.getGenerativeModel({
    model: env.gemini.visionModel || env.gemini.model || "gemini-3.6-flash",
  });

  const imagePart = {
    inlineData: { data: imageBuffer.toString("base64"), mimeType },
  };

  // Retry on 503 (high demand) or 429 (rate limit)
  async function generateWithRetry(model, parts, maxAttempts = 3) {
    let lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await model.generateContent(parts);
      } catch (err) {
        lastErr = err;
        const status = err?.status || err?.response?.status || 0;
        const isTransient = status === 503 || status === 429 || /high demand|overloaded|try again/i.test(err.message || "");
        if (!isTransient || attempt === maxAttempts) throw err;
        const waitMs = Math.min(2000 * attempt, 8000);
        console.log(`Gemini busy (attempt ${attempt}/${maxAttempts}), retrying in ${waitMs}ms...`);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }
    throw lastErr;
  }

  try {
    const result = await generateWithRetry(model, [EXTRACTION_PROMPT, imagePart]);
    const raw = result.response.text();
    const cleaned = cleanJson(raw);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (jsonErr) {
      console.error("Gemini returned invalid JSON:", cleaned.slice(0, 500));
      throw ApiError.internal("AI returned malformed data. Try again or upload a clearer image.");
    }

    const detected = parsed.detected || {};
    const classes = Array.isArray(parsed.classes) ? parsed.classes : [];
    const warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];

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
