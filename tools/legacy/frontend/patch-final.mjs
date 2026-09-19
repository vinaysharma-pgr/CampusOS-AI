import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function patch(rel, pairs) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) { console.log("  SkIP (missing) " + rel); return; }
  let src = fs.readFileSync(full, "utf8");
  let hits = 0;
  for (const [from, to] of pairs) {
    while (src.includes(from)) { src = src.replace(from, to); hits++; }
  }
  if (hits > 0) { fs.writeFileSync(full, src, "utf8"); console.log("  PATCHED (" + hits + ") " + rel); }
  else { console.log("  no-op " + rel); }
}

// 1. Global CSS - add spotlight.css import if missing
patch("src/styles/base/global.css", [
  ['@import "../utilities/hover.css";', '@import "../utilities/hover.css";\n@import "../utilities/spotlight.css";'],
]);

console.log("");
console.log("Done.");
