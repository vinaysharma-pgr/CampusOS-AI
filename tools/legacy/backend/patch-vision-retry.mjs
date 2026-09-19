import fs from "node:fs";

const path = "src/services/aiVisionService.js";
let c = fs.readFileSync(path, "utf8");

// Wrap the generateContent call in a retry loop
const OLD = `  try {
    const result = await model.generateContent([EXTRACTION_PROMPT, imagePart]);
    const raw = result.response.text();`;

const NEW = `  // Retry on 503 (high demand) or 429 (rate limit)
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
        console.log(\`Gemini busy (attempt \${attempt}/\${maxAttempts}), retrying in \${waitMs}ms...\`);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }
    throw lastErr;
  }

  try {
    const result = await generateWithRetry(model, [EXTRACTION_PROMPT, imagePart]);
    const raw = result.response.text();`;

if (c.includes(OLD)) {
  c = c.replace(OLD, NEW);
  fs.writeFileSync(path, c, "utf8");
  console.log("✓ aiVisionService.js — retry logic added");
} else {
  console.log("✗ Could not find anchor. Showing context:");
  const idx = c.indexOf("const result = await model.generateContent");
  console.log(c.slice(Math.max(0, idx - 300), idx + 200));
}