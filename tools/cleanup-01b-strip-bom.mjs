import fs from "node:fs";
import path from "node:path";

const rel = "frontend/index.html";
const full = path.join(process.cwd(), rel);

if (!fs.existsSync(full)) {
  console.log("  [FAIL] " + rel + " missing");
  process.exit(1);
}

const buf = fs.readFileSync(full);

// UTF-8 BOM = EF BB BF at byte 0
const hasBOM = buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;

if (!hasBOM) {
  console.log("  [INFO] " + rel + " has no BOM - nothing to do");
  process.exit(0);
}

const stripped = buf.slice(3);
fs.writeFileSync(full, stripped);
console.log("  [OK]   stripped UTF-8 BOM from " + rel);