import fs from "node:fs";
import path from "node:path";

const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

// ---------- 1. Fix loadExamOrFail (remove .lean()) ----------
{
  const rel = "backend/src/services/examResultService.js";
  const full = path.join(process.cwd(), rel);
  if (!fs.existsSync(full)) { fail(rel + " missing"); process.exit(1); }

  let src = fs.readFileSync(full, "utf8");
  const from = "const exam = await Exam.findById(examId).lean();";
  const to   = "const exam = await Exam.findById(examId);";

  if (src.includes(to)) { info(rel + " already patched"); }
  else if (src.includes(from)) {
    src = src.replace(from, to);
    fs.writeFileSync(full, src, "utf8");
    ok("patched " + rel);
  } else {
    fail(rel + " anchor not found"); process.exit(1);
  }
}

// ---------- 2. Verbose smoke test v2 ----------
const smokePath = "tools\\19-06-smoke-test.mjs";
const smokeFull = path.join(process.cwd(), smokePath);

if (fs.existsSync(smokeFull)) {
  let src = fs.readFileSync(smokeFull, "utf8");

  // Wrap every fetch to also print status + body on failure
  // Simplest: replace the publish check line to include detail
  const oldPub = `check("publish exam", pubRes.status === 200 && pubBody.success === true);`;
  const newPub = `check("publish exam", pubRes.status === 200 && pubBody.success === true, \`status=\${pubRes.status} body=\${JSON.stringify(pubBody).slice(0,200)}\`);`;

  if (src.includes(newPub)) {
    info("smoke test already verbose");
  } else if (src.includes(oldPub)) {
    src = src.replace(oldPub, newPub);
    fs.writeFileSync(smokeFull, src, "utf8");
    ok("made publish check verbose");
  } else {
    info("publish check line not found — skipping verbose patch");
  }
} else {
  info("smoke test file not present yet");
}

console.log("");
console.log("Done.");