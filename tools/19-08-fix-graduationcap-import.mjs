import fs from "node:fs";
import path from "node:path";

const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

const rel = "frontend/src/layouts/AdminLayout.jsx";
const full = path.join(process.cwd(), rel);

if (!fs.existsSync(full)) { fail(rel + " missing"); process.exit(1); }

let src = fs.readFileSync(full, "utf8");

// Locate the lucide-react import line specifically
const importRegex = /import\s*\{([^}]+)\}\s*from\s*"lucide-react";/;
const match = src.match(importRegex);

if (!match) { fail("no lucide-react import found in " + rel); process.exit(1); }

const inside = match[1]; // "A, B, C, ..."
const names = inside.split(",").map((s) => s.trim()).filter(Boolean);

if (names.includes("GraduationCap")) {
  info("GraduationCap already in lucide import - no change needed");
  process.exit(0);
}

names.push("GraduationCap");
// Preserve a reasonable line-width (wrap at ~90 chars) but keep it simple:
const newImport = `import {\n  ${names.join(", ")}\n} from "lucide-react";`;

src = src.replace(importRegex, newImport);
fs.writeFileSync(full, src, "utf8");
ok("added GraduationCap to lucide-react import in " + rel);