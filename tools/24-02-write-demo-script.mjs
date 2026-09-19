import fs from "node:fs";
import path from "node:path";

const content = `# CampusOS.ai — Demo Script

**Purpose:** A click-by-click walkthrough for evaluation day.
**Duration:** ~10-12 minutes if you follow the golden path. Stop at any point if short on time.
**Prep:** Before the evaluator walks in — see [Pre-demo checklist](#pre-demo-checklist).

---

## Pre-demo checklist (5 min before)

- [ ] Backend running: \`cd backend; npm run dev\` — should print \`✅ MongoDB connected\`
- [ ] Frontend running: \`cd frontend; npm run dev\` — should print a localhost URL
- [ ] Open **three browser windows** (Chrome + Edge + one incognito) so you can switch roles fast
- [ ] Pre-login in each:
  - Window 1: admin — \`vinay@srms.ac.in\` / \`password123\`
  - Window 2: faculty — check the signup flow first if you don't have one seeded
  - Window 3: student — check the signup flow first
- [ ] Whitelist your current IP in MongoDB Atlas (Network Access) if not already
- [ ] Have the URLs bookmarked:
  - \`http://localhost:5173\`
  - \`http://localhost:5173/admin\`
  - \`http://localhost:5173/student\`
  - \`http://localhost:5173/faculty\`

---

## The 4-minute elevator pitch (opening)

> "CampusOS.ai is a unified layer on top of SRMS's existing ERP. It doesn't duplicate what the ERP already does — no fees, no library, no bus tracking. Instead, it solves the gaps the ERP leaves: an AI assistant grounded in live campus data, a mobile-first exam and results flow with faculty-entered marks, study materials per course, a Safe-to-Skip attendance predictor, and an audit-trailed workflow for exam paper submission. Everything runs on httpOnly cookies, refresh rotation, and real-time notifications."

---

## Demo path

### Act 1 — Public site (60 sec)

1. Open \`http://localhost:5173\`
2. **Landing page:** scroll a bit → point out the campus preview with live node statuses, then stop at the feature modules grid.
3. Click **Facilities** in the navbar → filter by "lab" → click **AI & Robotics Lab** → show the live occupancy gauge + gallery.
4. Click **Heatmap** → scrub the time slider → "watch the campus breathe".

**Talking point:** "The heatmap is the same data the AI assistant reads when a student asks 'is the library crowded?'"

---

### Act 2 — AI assistant (60 sec)

1. Click the **purple sparkle bubble** bottom-right (or go to \`/ai\`)
2. Ask: **"Where is the Central Library?"** → show it uses real building data
3. Ask: **"Who teaches CS 301?"** → show it reads the timetable
4. Ask: **"When's the next bus to Bareilly?"** → show the fallback to the Transport Desk
5. Ask: **"Is the library crowded right now?"** → show it uses the live occupancy numbers

**Talking point:** "Every answer is grounded in data from this specific campus — not a generic LLM's guess."

---

### Act 3 — Student flow (2 min)

Login as **student** (Window 3).

1. Land on \`/student\` → dashboard shows today's classes, weekly load, notices
2. Left sidebar → **Timetable** → today's classes at top + full week grid
3. → **Attendance** → scroll down → **Safe-to-Skip card** shows:
   - Green cards: "You can skip N more classes"
   - Red cards: "Attend N in a row to get back to 75%"
4. → **Notices** → show the unread **"New"** badge → click one → badge disappears, header updates to "X notices · Y new"
5. → **Exams** → upcoming exams grouped by date
6. → **Results** → per-course marks + overall percentage
7. → **Materials** → filtered to their dept/sem/section
8. → **Sessions** → show this device + option to revoke others

**Talking point:** "This is the mobile-first layer the ERP forgot to build. The Safe-to-Skip predictor alone saves every student mental math every semester."

---

### Act 4 — Faculty flow (2 min)

Switch to **faculty** (Window 2).

1. \`/faculty\` → dashboard with today's classes, weekly load
2. → **Exams** → list of department exams
3. Click **Enter marks** on the mid-sem exam → student table → type a few marks → **Save marks**
4. → **Study Materials** → click **Upload Material** → pick a PDF → fill title + course → **Publish**
5. → **Attendance** → pick class → toggle present/absent → **Save Attendance**
6. → **Send to HOD** → title + optional image → **Send**

**Talking point:** "Faculty marks attendance in 10 seconds from a phone. No paper sheets, no CSV uploads, no Excel."

---

### Act 5 — Admin / HOD flow (3 min)

Switch to **admin** (Window 1).

1. \`/admin\` → dashboard stats + quick actions
2. **Command palette:** press **Ctrl+K** → type "exams" → jump instantly. Then **Alt+9** for exams, **Alt+0** for users.
3. → **Exams** → click **Add Exam** → fill form, check **Show marks to students: off**, check **Counts toward student's total: off** → **Create exam**
4. Back in the list → **"Internal only"** badge appears → click **Edit** → change visibility flags → **Save**
5. → **HOD Inbox** → click the submission from faculty → review notes → change status to **Approved** → **Save Review**
6. → **Audit Logs** → filter by action "auth.login" → show every login with IP + UA → click **Export CSV** → file downloads
7. → **Admin → Locks** → show locked accounts (if any) → **Unlock**
8. → **Notices** → post a notice to a specific department → check the badge in the student window updates in real time

**Talking point:** "Every sensitive action is logged. Every workflow has an audit trail. This is what an evaluator cares about — not just features, but trust."

---

### Act 6 — Real-time + Push (30 sec)

1. In the admin window, post a new notice
2. Watch the student window — a **toast pops up in real time** with a chime (if not muted)
3. Point to the notification bell with its unread badge

**Talking point:** "Socket.io for in-app + Web Push via VAPID for when the tab is closed."

---

## Q&A prep — Likely questions

| Question | Answer |
|---|---|
| **How is this different from the college ERP?** | We complement, not replace. The ERP handles fees/library/bus. We handle exams, materials, AI, attendance, notices. See \`docs/FEATURES.md\` "Deliberately not built". |
| **What if MongoDB goes down?** | Server falls back to in-memory automatically. Data is lost on restart but the app stays up. See \`docs/ARCHITECTURE.md\` "Dual-store design". |
| **Is the AI just ChatGPT?** | No. It's Gemini with a system prompt built from live MongoDB data on every request — faculty, timetable, notices, events, facility occupancy. If Gemini fails, a keyword engine takes over. |
| **How is auth secure?** | httpOnly cookies (never touch JS), refresh rotation with replay detection, SHA-256 hashed refresh tokens, bcrypt cost 12, 5-attempt lockout, per-endpoint rate limits. |
| **Where's the audit trail?** | Every sensitive action logs user + IP + UA + status. See \`/admin/audit-logs\`. |
| **Why no fee / library / bus?** | College ERP already covers those. Duplicating them adds no value. We solve the gaps. |
| **Is this production-ready?** | No — it's a student project. But the security posture, error handling, and dual-store resilience are patterned after production systems. |
| **Best feature?** | Safe-to-Skip predictor — 30 lines, saves every student mental math every semester. |

---

## If something breaks mid-demo

| Symptom | Recovery |
|---|---|
| Backend won't connect to MongoDB | It auto-falls back to in-memory. Restart isn't needed; data just resets. |
| Frontend shows blank page | Hard-refresh (Ctrl+Shift+R). Vite HMR sometimes misses a file. |
| Login returns 401 on every request | Cookies got cleared — log out and back in. |
| Notifications don't arrive in real time | Check the backend is running; Socket.io needs port 5000 up. |
| AI times out | Gemini rate limit. Say "the assistant is rate-limited; here's the fallback" and ask again after 30s. |

---

## Post-demo

- Open GitHub repo → point to commit history with phased feature work
- Point to \`docs/FEATURES.md\` → "here's the full inventory"
- Point to \`docs/ARCHITECTURE.md\` → "here's how it's built"
- Offer to walk through any specific flow in more depth

---

## Golden path (if only 5 minutes available)

1. Landing → **AI assistant** demo (ask 3 questions) — 90s
2. Student → **Safe-to-Skip** card — 60s
3. Admin → **Create exam with hidden marks** → show "Internal only" badge — 60s
4. Admin → **Audit logs** → filter + export CSV — 60s
5. Real-time: post notice → toast on student window — 30s

**Total: 5 minutes, all four user roles, all signature features.**
`;

const contentPath = path.join(process.cwd(), "docs", "DEMO_SCRIPT.md");
fs.mkdirSync(path.dirname(contentPath), { recursive: true });
fs.writeFileSync(contentPath, content, "utf8");

console.log("");
console.log("✅ Created docs/DEMO_SCRIPT.md");
const lines = content.split("\n").length;
console.log("   " + lines + " lines");
console.log("");