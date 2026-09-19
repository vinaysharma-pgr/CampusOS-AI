import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src");
const EXT = new Set([".jsx", ".js"]);

const REPLACEMENTS = [
  { from: '"#3fe0c5"',                to: '"var(--color-primary)"' },
  { from: "'#3fe0c5'",                to: "'var(--color-primary)'" },
  { from: '"rgba(63,224,197,0.15)"',  to: '"color-mix(in srgb, var(--color-primary) 15%, transparent)"' },
  { from: '"rgba(63,224,197,0.12)"',  to: '"color-mix(in srgb, var(--color-primary) 12%, transparent)"' },
  { from: '"rgba(63,224,197,0.10)"',  to: '"color-mix(in srgb, var(--color-primary) 10%, transparent)"' },
  { from: '"rgba(63,224,197,0.08)"',  to: '"color-mix(in srgb, var(--color-primary) 8%, transparent)"' },
  { from: '"rgba(63,224,197,0.06)"',  to: '"color-mix(in srgb, var(--color-primary) 6%, transparent)"' },
  { from: '"rgba(63,224,197,0.05)"',  to: '"color-mix(in srgb, var(--color-primary) 5%, transparent)"' },
  { from: '"rgba(63,224,197,0.04)"',  to: '"color-mix(in srgb, var(--color-primary) 4%, transparent)"' },
  { from: '"rgba(63,224,197,0.03)"',  to: '"color-mix(in srgb, var(--color-primary) 3%, transparent)"' },
  { from: '"rgba(63,224,197,0.25)"',  to: '"color-mix(in srgb, var(--color-primary) 25%, transparent)"' },
  { from: '"rgba(63,224,197,0.3)"',   to: '"color-mix(in srgb, var(--color-primary) 30%, transparent)"' },
  { from: '"rgba(63,224,197,0.35)"',  to: '"color-mix(in srgb, var(--color-primary) 35%, transparent)"' },
  { from: '"rgba(63,224,197,0.4)"',   to: '"color-mix(in srgb, var(--color-primary) 40%, transparent)"' },
  { from: '"#04150f"',                to: '"var(--color-primary-fg)"' },
  { from: '"#0d9488"',                to: '"var(--color-primary)"' },
];

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (EXT.has(path.extname(e.name))) out.push(full);
  }
  return out;
}

let filesTouched = 0;
let replCount = 0;

for (const file of walk(ROOT)) {
  const original = fs.readFileSync(file, "utf8");
  let next = original;
  let fileRepl = 0;
  for (const { from, to } of REPLACEMENTS) {
    while (next.includes(from)) {
      next = next.replace(from, to);
      fileRepl++;
    }
  }
  if (next !== original) {
    fs.writeFileSync(file, next, "utf8");
    const rel = path.relative(process.cwd(), file);
    console.log("  " + fileRepl + " replacements -> " + rel);
    filesTouched++;
    replCount += fileRepl;
  }
}

console.log("");
console.log("Done. " + filesTouched + " file(s) touched, " + replCount + " replacements.");
