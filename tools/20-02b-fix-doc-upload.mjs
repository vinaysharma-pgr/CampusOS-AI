import fs from "node:fs";
import path from "node:path";

const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

const rel = "backend/src/middleware/upload.js";
const full = path.join(process.cwd(), rel);

if (!fs.existsSync(full)) { fail(rel + " missing"); process.exit(1); }

let raw = fs.readFileSync(full, "utf8");

console.log("");
console.log("=== DIAGNOSTIC ===");
console.log("File length:", raw.length, "bytes");
console.log("Has CRLF:", raw.includes("\r\n"));
console.log("Has LF-only:", raw.includes("\n") && !raw.includes("\r\n"));
console.log("");

// Normalize to LF for anchoring, remember original ending style
const usesCRLF = raw.includes("\r\n");
let src = usesCRLF ? raw.replace(/\r\n/g, "\n") : raw;

// If uploadDoc export is already present, skip
if (src.includes("export const uploadDoc = multer")) {
  info("uploadDoc already exists - no change needed");
  process.exit(0);
}

// Find the closing of the existing `upload` export via regex
const re = /(export const upload = multer\(\{[\s\S]*?\n\}\);)/;
const match = src.match(re);

if (!match) {
  fail("could not locate `export const upload = multer({ ... });` block");
  console.log("First 500 chars of file:");
  console.log(src.slice(0, 500));
  process.exit(1);
}

const newBlock = match[1] + `

const DOC_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);

const docFileFilter = (req, file, cb) => {
  if (file.mimetype && DOC_MIMES.has(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest("Unsupported file type. Allowed: image, PDF, Word, PowerPoint, plain text."));
};

export const uploadDoc = multer({
  storage,
  fileFilter: docFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB for study materials
});`;

src = src.replace(re, newBlock);

// Restore original line ending style if needed
const out = usesCRLF ? src.replace(/\n/g, "\r\n") : src;
fs.writeFileSync(full, out, "utf8");
ok("added uploadDoc to " + rel + (usesCRLF ? " (CRLF preserved)" : ""));