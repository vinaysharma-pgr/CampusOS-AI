import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const rel = "frontend/src/layouts/AdminLayout.jsx";
const full = path.join(ROOT, rel);

if (!fs.existsSync(full)) {
  console.log("  [FAIL] " + rel + " missing");
  process.exit(1);
}

let src = fs.readFileSync(full, "utf8");

// Already imported?
if (src.includes("GraduationCap")) {
  console.log("  [INFO] GraduationCap already imported - no change needed");
  process.exit(0);
}

// Insert GraduationCap before the closing } from "lucide-react"
const fromAnchor = '} from "lucide-react";';
if (!src.includes(fromAnchor)) {
  console.log("  [FAIL] lucide-react import anchor not found");
  process.exit(1);
}

// Find the last occurrence of this anchor (there might be other imports from lucide)
const idx = src.lastIndexOf(fromAnchor);
const before = src.slice(0, idx);
const after = src.slice(idx);

// Walk backwards from the closing brace to find the preceding non-whitespace char
const trimmed = before.replace(/\s+$/, "");
const needsComma = !trimmed.endsWith(",");
const insert = (needsComma ? "," : "") + "\n  GraduationCap";

const newSrc = before + insert + "\n" + after;
fs.writeFileSync(full, newSrc, "utf8");
console.log("  [OK]   added GraduationCap import to " + rel);