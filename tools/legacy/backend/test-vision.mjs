import fs from "node:fs";

const API = "http://localhost:5000/api";
const IMAGE_PATH = "C:/Users/vinay/Downloads/timetable.jpg";

if (!fs.existsSync(IMAGE_PATH)) {
  console.error("Image not found at", IMAGE_PATH);
  process.exit(1);
}
console.log("✓ Image found:", (fs.statSync(IMAGE_PATH).size / 1024).toFixed(1), "KB");

const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
}).then(r => r.json());

if (!login.success) {
  console.error("Login failed:", login.message);
  process.exit(1);
}
console.log("✓ Logged in as", login.data.user.name);
console.log("");
console.log("Extracting with Gemini Vision (20-40s)...");

const buffer = fs.readFileSync(IMAGE_PATH);
const form = new FormData();
form.append("file", new Blob([buffer], { type: "image/jpeg" }), "timetable.jpg");

const start = Date.now();
const res = await fetch(API + "/ai/extract-timetable", {
  method: "POST",
  headers: { Authorization: "Bearer " + login.data.token },
  body: form,
}).then(r => r.json());
console.log("Took", ((Date.now() - start) / 1000).toFixed(1), "s");
console.log("");

if (!res.success) {
  console.error("Extraction failed:", res.message);
  process.exit(1);
}

console.log("Extraction succeeded");
console.log("");
console.log("Detected:", JSON.stringify(res.data.detected, null, 2));
console.log("Classes found:", res.data.classes.length);
console.log("");
res.data.classes.slice(0, 20).forEach(c => {
  console.log(`  ${c.dayOfWeek} ${c.startTime}-${c.endTime} ${c.courseCode} ${c.courseName} (${c.room}) ${c.facultyName}`);
});
if (res.data.classes.length > 20) console.log(`  ... and ${res.data.classes.length - 20} more`);

if (res.data.warnings && res.data.warnings.length) {
  console.log("");
  console.log("Warnings:");
  res.data.warnings.forEach(w => console.log("  -", w));
}
