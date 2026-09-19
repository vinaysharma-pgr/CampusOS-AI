# Legacy one-shot scripts

These scripts were run **once** during development to create or patch files
in `backend/` and `frontend/`. They are kept here for historical reference
only.

## Why moved

They lived in the project root directories and cluttered the workspace.
All functionality they performed is now baked into the actual source tree.

## Do NOT run these again

They use string-replacement to patch existing files — running them on the
current (already-patched) code would either no-op or, in rare cases,
corrupt the file if the anchors still match partially.

## Categories

### `backend/` — server-side migration scripts
- `ai-vision.mjs` — added Gemini Vision service
- `patch-ai-*.mjs` — AI system prompt iterations
- `patch-vision-retry.mjs` — added retry loop for Gemini 503/429
- `seed-*.mjs` — one-off data seeders (bulk events, groups, CS-V timetable)
- `fix-admin.mjs` — password reset utility for admin user
- `make-student.mjs` — created a test student account
- `check-*.mjs` — DB inspection utilities
- `test-*.mjs` — ad-hoc API test scripts (superseded by `tools/19-*` and `tools/20-*`)

### `frontend/` — client-side migration scripts
- `apply-fixes.mjs` — bulk token replacement (light theme)
- `fix-light-theme.mjs` — rgba → color-mix conversion
- `fix-mojibake.mjs` — UTF-8 mojibake repair (superseded by `cleanup-01-mojibake.mjs`)
- `patch-clash-ui.mjs` — wired ClashModal into AdminTimetable
- `patch-drawer-*.mjs` — AI drawer UI iterations
- `patch-final.mjs` — CSS import wiring

### `root/` — legacy top-level
- `phase8-script1.mjs` — added semester + section to signup flow
