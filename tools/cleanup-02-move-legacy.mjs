import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ok = (m) => console.log("  [OK]   " + m);
const skip = (m) => console.log("  [SKIP] " + m);
const fail = (m) => console.log("  [FAIL] " + m);

const MOVES = {
  "backend": [
    "ai-vision.mjs",
    "check-cookie-header.mjs",
    "check-logs.mjs",
    "check-registrations.mjs",
    "fix-admin.mjs",
    "make-student.mjs",
    "patch-ai-remove-bus.mjs",
    "patch-ai-service.mjs",
    "patch-vision-retry.mjs",
    "seed-2-events.mjs",
    "seed-cs-v.mjs",
    "seed-groups.mjs",
    "seed-paid-events.mjs",
    "test-audit.mjs",
    "test-audit-api.mjs",
    "test-clash.mjs",
    "test-cookie-auth.mjs",
    "test-current.mjs",
    "test-headers.mjs",
    "test-lockout.mjs",
    "test-login-otp.mjs",
    "test-phase9.mjs",
    "test-protected-uploads.mjs",
    "test-rate-limit.mjs",
    "test-razorpay-keys.mjs",
    "test-refresh.mjs",
    "test-unlock.mjs",
    "test-upload.mjs",
    "test-vision.mjs",
    "test-image.png",
  ],
  "frontend": [
    "apply-fixes.mjs",
    "fix-light-theme.mjs",
    "fix-mojibake.mjs",
    "patch-clash-ui.mjs",
    "patch-drawer.mjs",
    "patch-drawer-ui.mjs",
    "patch-final.mjs",
  ],
  "root": [
    "phase8-script1.mjs",
  ],
};

// Ensure destination dirs exist
for (const sub of Object.keys(MOVES)) {
  const dest = path.join(ROOT, "tools", "legacy", sub);
  fs.mkdirSync(dest, { recursive: true });
}

let moved = 0, skipped = 0, missing = 0;

for (const [sub, files] of Object.entries(MOVES)) {
  console.log("");
  console.log("--- " + sub + " ---");
  for (const f of files) {
    const src = sub === "root" ? path.join(ROOT, f) : path.join(ROOT, sub, f);
    const dest = path.join(ROOT, "tools", "legacy", sub, f);

    if (!fs.existsSync(src)) {
      if (fs.existsSync(dest)) { skip("already moved: " + f); skipped++; }
      else { fail("not found: " + src); missing++; }
      continue;
    }
    if (fs.existsSync(dest)) {
      skip("dest exists, leaving src alone: " + f);
      skipped++;
      continue;
    }
    fs.renameSync(src, dest);
    ok("moved: " + f);
    moved++;
  }
}

// Write a README explaining what's in here
const readmePath = path.join(ROOT, "tools", "legacy", "README.md");
if (!fs.existsSync(readmePath)) {
  fs.writeFileSync(readmePath, `# Legacy one-shot scripts

These scripts were run **once** during development to create or patch files
in \`backend/\` and \`frontend/\`. They are kept here for historical reference
only.

## Why moved

They lived in the project root directories and cluttered the workspace.
All functionality they performed is now baked into the actual source tree.

## Do NOT run these again

They use string-replacement to patch existing files — running them on the
current (already-patched) code would either no-op or, in rare cases,
corrupt the file if the anchors still match partially.

## Categories

### \`backend/\` — server-side migration scripts
- \`ai-vision.mjs\` — added Gemini Vision service
- \`patch-ai-*.mjs\` — AI system prompt iterations
- \`patch-vision-retry.mjs\` — added retry loop for Gemini 503/429
- \`seed-*.mjs\` — one-off data seeders (bulk events, groups, CS-V timetable)
- \`fix-admin.mjs\` — password reset utility for admin user
- \`make-student.mjs\` — created a test student account
- \`check-*.mjs\` — DB inspection utilities
- \`test-*.mjs\` — ad-hoc API test scripts (superseded by \`tools/19-*\` and \`tools/20-*\`)

### \`frontend/\` — client-side migration scripts
- \`apply-fixes.mjs\` — bulk token replacement (light theme)
- \`fix-light-theme.mjs\` — rgba → color-mix conversion
- \`fix-mojibake.mjs\` — UTF-8 mojibake repair (superseded by \`cleanup-01-mojibake.mjs\`)
- \`patch-clash-ui.mjs\` — wired ClashModal into AdminTimetable
- \`patch-drawer-*.mjs\` — AI drawer UI iterations
- \`patch-final.mjs\` — CSS import wiring

### \`root/\` — legacy top-level
- \`phase8-script1.mjs\` — added semester + section to signup flow
`, "utf8");
  ok("wrote tools/legacy/README.md");
}

console.log("");
console.log("Moved: " + moved + " | Skipped: " + skipped + " | Missing: " + missing);
console.log("");