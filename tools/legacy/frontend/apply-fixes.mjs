import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("  WROTE " + rel);
}

function patch(rel, pairs) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) { console.log("  SKIP (missing) " + rel); return; }
  let src = fs.readFileSync(full, "utf8");
  let hits = 0;
  for (const [from, to] of pairs) {
    while (src.includes(from)) { src = src.replace(from, to); hits++; }
  }
  if (hits > 0) { fs.writeFileSync(full, src, "utf8"); console.log("  PATCHED (" + hits + ") " + rel); }
  else { console.log("  no-op " + rel); }
}

console.log("");
console.log("[1/4] Fix light-theme color tokens...");

const colorPairs = [
  ['"#3fe0c5"',                '"var(--color-primary)"'],
  ["'#3fe0c5'",                "'var(--color-primary)'"],
  ['"rgba(63,224,197,0.15)"',  '"color-mix(in srgb, var(--color-primary) 15%, transparent)"'],
  ['"rgba(63,224,197,0.12)"',  '"color-mix(in srgb, var(--color-primary) 12%, transparent)"'],
  ['"rgba(63,224,197,0.10)"',  '"color-mix(in srgb, var(--color-primary) 10%, transparent)"'],
  ['"rgba(63,224,197,0.08)"',  '"color-mix(in srgb, var(--color-primary) 8%, transparent)"'],
  ['"rgba(63,224,197,0.06)"',  '"color-mix(in srgb, var(--color-primary) 6%, transparent)"'],
  ['"rgba(63,224,197,0.05)"',  '"color-mix(in srgb, var(--color-primary) 5%, transparent)"'],
  ['"rgba(63,224,197,0.04)"',  '"color-mix(in srgb, var(--color-primary) 4%, transparent)"'],
  ['"rgba(63,224,197,0.03)"',  '"color-mix(in srgb, var(--color-primary) 3%, transparent)"'],
  ['"rgba(63,224,197,0.25)"',  '"color-mix(in srgb, var(--color-primary) 25%, transparent)"'],
  ['"rgba(63,224,197,0.3)"',   '"color-mix(in srgb, var(--color-primary) 30%, transparent)"'],
  ['"rgba(63,224,197,0.35)"',  '"color-mix(in srgb, var(--color-primary) 35%, transparent)"'],
  ['"rgba(63,224,197,0.4)"',   '"color-mix(in srgb, var(--color-primary) 40%, transparent)"'],
  ['"#04150f"',                '"var(--color-primary-fg)"'],
  ['"#0d9488"',                '"var(--color-primary)"'],
];

const walkExt = new Set([".jsx", ".js"]);
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (walkExt.has(path.extname(e.name))) out.push(full);
  }
  return out;
}

let total = 0;
for (const file of walk(path.join(ROOT, "src"))) {
  const rel = path.relative(ROOT, file);
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  for (const [from, to] of colorPairs) {
    while (after.includes(from)) { after = after.replace(from, to); total++; }
  }
  if (after !== before) fs.writeFileSync(file, after, "utf8");
}
console.log("  total token replacements: " + total);

console.log("");
console.log("[2/4] Create spotlight.css...");

write("src/styles/utilities/spotlight.css", `/* src/styles/utilities/spotlight.css
   Cursor-following spotlight primitive. */

.spotlight-card {
  position: relative;
  isolation: isolate;
  transition: transform 250ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
              border-color 250ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
}

.spotlight-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    var(--spot-radius, 320px) circle at var(--mx, 50%) var(--my, 50%),
    color-mix(in srgb, var(--spot-color, #3fe0c5) calc(var(--spot-intensity, 0.14) * 100%), transparent),
    transparent 70%
  );
  opacity: var(--spot-opacity, 0);
  transition: opacity 300ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
  pointer-events: none;
  z-index: 0;
}

.spotlight-card:hover {
  transform: translateY(calc(-1 * var(--spot-lift, 2px)));
  border-color: var(--color-border-strong);
}

.spotlight-card > * { position: relative; z-index: 1; }

@media (prefers-reduced-motion: reduce) {
  .spotlight-card, .spotlight-card::before { transition: none !important; }
  .spotlight-card:hover { transform: none !important; }
  .spotlight-card::before { display: none !important; }
}

@media (pointer: coarse) {
  .spotlight-card::before { display: none !important; }
}
`);

console.log("");
console.log("[3/4] Create useCursorSpotlight hook...");

write("src/hooks/useCursorSpotlight.js", `// src/hooks/useCursorSpotlight.js
import { useEffect } from "react";

export default function useCursorSpotlight(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    };
    const onLeave = () => {
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
}
`);

console.log("");
console.log("[4/4] Wire spotlight.css import into global.css...");

patch("src/styles/base/global.css", [
  ['@import "../utilities/hover.css";', '@import "../utilities/hover.css";\n@import "../utilities/spotlight.css";']
]);

console.log("");
console.log("DONE. Now restart the frontend: npm run dev");
