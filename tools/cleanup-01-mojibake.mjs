import fs from "node:fs";
import path from "node:path";

const ok = (m) => console.log("  [OK]   " + m);
const info = (m) => console.log("  [INFO] " + m);
const fail = (m) => console.log("  [FAIL] " + m);

// Mojibake byte-pair -> correct UTF-8 char
const REPLACEMENTS = [
  // Double-encoded (most common: UTF-8 bytes read as Latin-1, then re-encoded)
  ["\u00C3\u00A2\u20AC\u201D", "\u2014"],   // â€" -> em-dash
  ["\u00C3\u00A2\u20AC\u009D", "\u201D"],   // â€  -> right double quote
  ["\u00C3\u00A2\u20AC\u0153", "\u201C"],   // â€œ -> left double quote
  ["\u00C3\u00A2\u20AC\u2122", "\u2019"],   // â€™ -> right single quote
  ["\u00C3\u00A2\u20AC\u00A6", "\u2026"],   // â€¦ -> ellipsis
  // Single-encoded
  ["\u00E2\u20AC\u201D", "\u2014"],
  ["\u00E2\u20AC\u009D", "\u201D"],
  ["\u00E2\u20AC\u0153", "\u201C"],
  ["\u00E2\u20AC\u2122", "\u2019"],
  ["\u00E2\u20AC\u00A6", "\u2026"],
];

// Files to scan (expand if you see mojibake elsewhere)
const TARGETS = [
  "frontend/index.html",
  "README.md",
  "frontend/README.md",
  "backend/README.md",
];

let totalReplacements = 0;
let filesTouched = 0;

console.log("");
console.log("CLEANUP - Mojibake fix");
console.log("");

for (const rel of TARGETS) {
  const full = path.join(process.cwd(), rel);
  if (!fs.existsSync(full)) { info(rel + " not present - skip"); continue; }

  let raw = fs.readFileSync(full, "utf8");
  const usesCRLF = raw.includes("\r\n");
  let src = usesCRLF ? raw.replace(/\r\n/g, "\n") : raw;
  let fileRepl = 0;

  for (const [from, to] of REPLACEMENTS) {
    while (src.includes(from)) { src = src.replace(from, to); fileRepl++; }
  }

  if (fileRepl > 0) {
    const out = usesCRLF ? src.replace(/\n/g, "\r\n") : src;
    fs.writeFileSync(full, out, "utf8");
    ok(rel + " - " + fileRepl + " replacement" + (fileRepl === 1 ? "" : "s"));
    filesTouched++;
    totalReplacements += fileRepl;
  } else {
    info(rel + " - clean");
  }
}

console.log("");
console.log("Files touched: " + filesTouched + " | Replacements: " + totalReplacements);
console.log("");