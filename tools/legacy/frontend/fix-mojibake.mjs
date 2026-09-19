// fix-mojibake.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src");
const EXT = new Set([".jsx", ".js", ".css"]);

// Byte-pair map: mojibake sequence -> correct UTF-8 sequence
const REPLACEMENTS = [
  // "â€"" (double-encoded em-dash, most common) -> em-dash
  { from: "\u00C3\u00A2\u20AC\u201D", to: "\u2014" },
  // "â€"" (double-encoded right double quote) -> right double quote
  { from: "\u00C3\u00A2\u20AC\u009D", to: "\u201D" },
  // "â€œ" (double-encoded left double quote) -> left double quote
  { from: "\u00C3\u00A2\u20AC\u0153", to: "\u201C" },
  // "â€™" (double-encoded right single quote / apostrophe) -> right single quote
  { from: "\u00C3\u00A2\u20AC\u2122", to: "\u2019" },
  // "â€¦" (double-encoded ellipsis) -> ellipsis
  { from: "\u00C3\u00A2\u20AC\u00A6", to: "\u2026" },
  // "â€"" (single-encoded em-dash, if any remain) -> em-dash
  { from: "\u00E2\u20AC\u201D", to: "\u2014" },
  // "â€"" (single-encoded right double quote) -> right double quote
  { from: "\u00E2\u20AC\u009D", to: "\u201D" },
  // "â€œ" (single-encoded left double quote) -> left double quote
  { from: "\u00E2\u20AC\u0153", to: "\u201C" },
  // "â€™" (single-encoded right single quote) -> right single quote
  { from: "\u00E2\u20AC\u2122", to: "\u2019" },
  // "â€¦" (single-encoded ellipsis) -> ellipsis
  { from: "\u00E2\u20AC\u00A6", to: "\u2026" },
  // Box drawing horizontal "â"€" -> horizontal line
  { from: "\u00E2\u201D\u20AC", to: "\u2500" },
  // Box drawing double "â•" -> double horizontal line
  { from: "\u00E2\u2022", to: "\u2550" },
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (EXT.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const files = walk(ROOT);
let totalFixed = 0;
let totalReplacements = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  let next = original;
  let fileReplacements = 0;

  for (const { from, to } of REPLACEMENTS) {
    while (next.includes(from)) {
      next = next.replace(from, to);
      fileReplacements++;
    }
  }

  if (next !== original) {
    fs.writeFileSync(file, next, "utf8");
    const rel = path.relative(process.cwd(), file);
    console.log(`  fixed ${fileReplacements} in ${rel}`);
    totalFixed++;
    totalReplacements += fileReplacements;
  }
}

console.log("");
console.log(`Done. ${totalFixed} file(s) updated, ${totalReplacements} replacement(s) made.`);