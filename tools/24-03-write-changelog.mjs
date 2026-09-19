import fs from "node:fs";
import path from "node:path";

const content = `# Changelog

All notable changes to CampusOS.ai, grouped by phase. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

---

## Phase 22 — Notice read tracking (lightweight)

**Commit:** \`7b2df1d\` — *feat(phase-22): notice read tracking (lightweight)*

### Added
- \`NoticeRead\` model with unique compound index on \`(noticeId, userId)\`
- \`noticeReadService\`: markRead, countForNotices, readIdsForUser, readersForNotice, statsForNotice
- \`noticeReadController\` with 3 endpoints (POST /read, GET /readers, GET /stats)
- \`noticeService.attachReadInfo\` — attaches \`isReadByMe\` (all users) + \`readCount\` (admin/faculty)
- Frontend \`markNoticeRead\` API helper
- \`NoticeCard\`: "New" badge + primary-tinted border for unread items
- \`StudentNotices\`: optimistic mark-as-read on click with rollback; header shows "X notices · Y new"

### Design note
Skipped the "seen by X/Y" admin dashboard — WhatsApp-style read receipts don't translate well to broadcast notices. Kept unread indicator + readCount field for future expansion.

### Fixed
- Type mismatch: \`noticeId\`/\`userId\` stored as strings to match ObjectId queries

---

## Phase 21 — Attendance predictor

**Commit:** \`7970ea4\` — *feat(phase-21): attendance predictor (safe-to-skip calculator)*

### Added
- \`SafeSkipCard\` component: per-subject skip/recovery prediction
  - Above 75%: "You can skip N more classes"
  - Below 75%: "Attend N in a row to get back to 75%"
- Math: \`skips = floor((present - 0.75*total) / 0.75)\`, \`recover = ceil((0.75*total - present) / 0.25)\`
- Risk subjects sorted first; overall alert if any subject below threshold
- Wired into \`/student/attendance\` below the subject breakdown

---

## Phase 20 — Study Material Hub

**Commit:** \`7c7bd07\` — *feat(phase-20): study material hub*

### Added
- \`StudyMaterial\` model (course, dept, sem, section, category, file metadata, faculty)
- Service: role-filtered list, mine, create, soft delete
- Controller + routes at \`/api/materials\`
- Extended upload middleware with \`uploadDoc\` (PDF, DOCX, PPTX, TXT, image, 25 MB limit)
- Extended \`uploadController\` with \`uploadDocument\` endpoint
- Extended \`uploadFetchController\` to serve docs from \`uploads/docs/\`
- Frontend API: \`materials.js\` + \`uploadDocument\` helper
- Faculty: \`/faculty/materials\` — upload + list own uploads with category filters
- Student: \`/student/materials\` — browse filtered to dept+sem+section, search, category filter
- Nav: Materials link in both faculty and student sidebars

### Notes
Not a digital library — faculty-to-student notes hub only. College ERP handles the book catalog.

---

## Phase 19.5 — Exam visibility controls

**Commit:** \`d99d746\` — *feat(phase-19.5): exam visibility controls + flexible exam types*

### Added
- Exam model: \`showToStudents\` (default true) + \`countsTowardTotal\` (default true)
- \`examResultService.getMyResults\`: filter out exams where \`showToStudents=false\`
- Aggregate percentages only over \`countsTowardTotal=true\` exams
- AdminExamForm: new "Visibility" section with two checkboxes
- AdminExams: "Internal only" + "Not counted" badges
- FacultyExamMarks: warning badge when exam is internal-only
- StudentResults: gray-out for non-counted exams

### Added (later in phase)
- Expanded exam type enum: \`mid-sem, end-sem, class-test, pre-university, internal, practical, viva, lab-viva, quiz, assignment-test, other\`
- \`customType\` field for user-defined exam types

### Rationale
Real colleges hide class tests / lab vivas / quizzes from students. Best-of-N rules vary — admin flags exams instead of hardcoding.

---

## Phase 19 — Exam schedule + results system

**Commit:** \`057a341\` — *feat(phase-19): exam schedule + results system*

### Added
- \`Exam\` + \`ExamResult\` models with indexes
- Exam CRUD service / controller / routes (admin only)
- ExamResult service: faculty marks entry, bulk upsert, publish, student results, class stats
- Admin: \`/admin/exams\` list + create/edit forms
- Faculty: \`/faculty/exams\` list + \`/faculty/exams/:id/marks\` entry table
- Student: \`/student/exams\` upcoming list + \`/student/results\` per-course breakdown
- Nav: Exams in AdminLayout (Alt+9), Exams+Results in student/faculty sidebar

### Fixed
- \`loadExamOrFail\` was using \`.lean()\`, which broke \`save()\` during publish
- Duplicate Alt+6 shortcut (Users now Alt+0)
- GraduationCap import missing in AdminLayout

---

## Mojibake cleanup

**Commit:** \`9d91fc8\` — *chore(cleanup): fix mojibake in index.html title + strip BOM*

### Fixed
- UTF-8 mojibake in \`index.html\` title (\`â€"\` → \`—\`)
- Stripped UTF-8 BOM from \`index.html\` (BOM was causing the mojibake on some browsers)

---

## Auth UX improvements

**Commit:** \`f0af197\` — *feat(auth): improve login UX + admin OTP bypass*

### Changed
- Login error: "Invalid credentials" → "No account found with this email. Please sign up first."
- Admin OTP bypass: admins skip the OTP step for demo convenience (configurable)
- Related tweaks in LoginPage, SignupOTPPage, LoginOTPPage, ForgotPasswordPage

---

## Repo hygiene

**Commits:** \`131f332\`, \`14ad092\`

### Added
- \`.gitignore\` entry for \`structure-clean.txt\`
- \`tools/legacy/\` — moved 38 one-shot dev scripts out of \`backend/\`, \`frontend/\`, and root

---

## Earlier phases (context)

Prior to Phase 19, the following features were already in place:

- **Phase 16 (Tier 2)** — upload rate limit, storage quota, refresh token rotation, auto-refresh interceptor
- **Stage 1–2 login** — password login now requires OTP; dev bypass flag; socket auth via httpOnly cookie
- **Cleanup** — removed 14 "- Copy" files, uploads-Copy folder, 12 empty scaffold folders
- **Bug fixes** — /ai route mount, notice URL string, paid-event double-count guard, AI page uses real Gemini
- **Group 1** — Event card price badge + register button spacing
- **Phase 8 (earlier)** — User model + signup with semester/section

---

## Unreleased / planned

- **Phase 23** — Leave application workflow (postponed pending college adoption confirmation)
- **Best-of-N** — Series-based exam aggregation (deferred until college locks the rule)
- **PWA manifest polish** — offline shell + install prompt
- **Docs** — API reference with sample requests/responses

---

## Known limitations

- Audit logs, refresh tokens, and a few other services bypass the dual-store proxy — they time out in memory mode
- Real-time Socket.io requires backend on port 5000
- Gemini rate limits occasionally surface as "AI unavailable" (keyword fallback kicks in)
- File uploads live on local disk — not yet migrated to Cloudinary despite being configured
- Exam paper → HOD workflow uses \`HodSubmission\` but isn't yet linked to \`Exam\` records (planned for Phase 19.6)
`;

const contentPath = path.join(process.cwd(), "docs", "CHANGELOG.md");
fs.mkdirSync(path.dirname(contentPath), { recursive: true });
fs.writeFileSync(contentPath, content, "utf8");

console.log("");
console.log("✅ Created docs/CHANGELOG.md");
const lines = content.split("\n").length;
console.log("   " + lines + " lines");
console.log("");