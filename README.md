# CampusOS.ai

> A unified campus layer for SRMS CET Bareilly — AI assistant, exams, materials, attendance, notices, and a digital twin. Built to **complement** the existing college ERP, not replace it.

[![Node](https://img.shields.io/badge/Node-20%2B-3fe0c5?style=flat-square)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-4DB33D?style=flat-square)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## What it is

CampusOS.ai is a student-built platform that fills the gaps most college ERPs leave behind. It doesn't reimplement fees, library, or bus tracking — the college already has those. Instead, it solves the workflows that still run on WhatsApp, paper, and Excel:

- **AI campus assistant** — grounded in live data (faculty, timetable, notices, events, occupancy)
- **Exam schedule + results** — faculty enter marks, HOD publishes, students see them (or don't — admins decide)
- **Study material hub** — faculty upload notes per course, students get filtered by their dept/sem/section
- **Attendance predictor** — "you can skip N more classes" instead of "82%"
- **Exam paper → HOD workflow** — digital trail with audit log
- **Real-time notices** — unread badges + live push, not buried in email

---

## Demo in 5 minutes

Open three browser windows, log in as each role, and walk this path:

1. **Landing → AI assistant** — ask "Where is the Central Library?", "Who teaches CS 301?", "Is the library crowded?"
2. **Student → Attendance** — see the Safe-to-Skip predictor with green/red cards per subject
3. **Admin → Create Exam** — uncheck "Show marks to students", save, watch the "Internal only" badge appear
4. **Admin → Audit Logs** — filter + export CSV of every login in the last 24h
5. **Admin → Post Notice** — see a toast pop up on the student window in real time

Full walkthrough: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)

---

## Feature highlights

### For students
- Live timetable with "now / past / upcoming" status per class
- Safe-to-Skip attendance predictor (skip N more / attend N to recover)
- Per-course results with percentage; internal-only exams hidden
- Study materials filtered to their dept + sem + section
- Event registration with Razorpay checkout for paid events
- Real-time notifications + Web Push (works when tab is closed)

### For faculty
- Mark attendance in 10 seconds from a phone
- Post assignments to a specific class with optional image
- Enter marks per student, bulk-save, or override
- Upload notes / slides / PYQs per course
- Send exam papers / reports to HOD with a digital trail

### For admin / HOD
- Full CRUD for facilities, events, notices, timetables, exams
- Timetable clash detection (faculty + room)
- Exam visibility controls (internal-only, doesn't-count-toward-total)
- HOD inbox for faculty submissions with approve/reject
- Audit log with CSV export and 90-day cleanup
- Account lockout management, session monitoring
- Command palette (Ctrl+K) + Alt+1..9,0 shortcuts

### Platform
- httpOnly cookie auth with refresh rotation + replay detection
- Web Push via VAPID + Socket.io for in-app real-time
- Gemini-powered AI grounded in live campus data
- Dual-store: MongoDB primary, in-memory fallback
- Audit trail on every sensitive action
- Rate limits + quotas + account lockout

See [`docs/FEATURES.md`](docs/FEATURES.md) for the complete list.

---

## Tech stack

| Layer | Stack |
|---|---|
| **Frontend** | React 19 · Vite · React Router 7 · Tailwind CSS v4 · Framer Motion · Lucide · Socket.io-client |
| **Backend** | Node 20+ · Express · Mongoose · Socket.io · JWT · bcryptjs · Multer · Nodemailer · web-push |
| **Database** | MongoDB Atlas (with automatic in-memory fallback) |
| **AI** | Google Gemini (`@google/generative-ai`) |
| **Payments** | Razorpay (paid event registration) |
| **Other** | Helmet · express-rate-limit · express-validator · CORS · Nodemon |

---

## Quick start

### Prerequisites
- Node.js 20+ and npm
- MongoDB Atlas account (free tier works) — or run without it in memory mode
- Google Gemini API key (optional — falls back to keyword engine)

### 1. Clone

\`\`\`bash
git clone https://github.com/vinaysharma-pgr/CampusOS-AI.git
cd CampusOS-AI
\`\`\`

### 2. Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env   # then fill in MONGODB_URI, JWT_SECRET, etc.
npm run dev
\`\`\`

Backend runs at `http://localhost:5000`.
Health check: `curl http://localhost:5000/api/health`

### 3. Frontend

\`\`\`bash
cd ../frontend
npm install
npm run dev
\`\`\`

Frontend runs at `http://localhost:5173`.

### 4. Seed admin (optional)

Backend auto-seeds a demo admin on first boot:
- Email: `vinay@srms.ac.in`
- Password: `password123`

**Change this before any real deployment.**

### 5. Whitelist your IP in MongoDB Atlas

If you see `❌ MongoDB connection failed`, go to Atlas → **Network Access** → **Add Current IP Address**. The server falls back to in-memory until you do, but data resets on every restart.

---

## Project layout

\`\`\`\`
CampusOS-AI/
├── backend/          Express API + Socket.io
│   ├── src/
│   │   ├── config/         env, cloudinary, email
│   │   ├── controllers/    HTTP layer
│   │   ├── database/       db proxy · mongoStore · memoryStore · seed
│   │   ├── middleware/     auth · error · rate limits · security · upload · audit
│   │   ├── models/         Mongoose schemas
│   │   ├── routes/         route modules
│   │   ├── services/       business logic
│   │   ├── utils/          ApiError · ApiResponse · jwt · cookieHelper
│   │   ├── validators/     express-validator rules
│   │   └── server.js
│   └── uploads/            local file storage
│
├── frontend/         React SPA
│   ├── src/
│   │   ├── api/            axios modules
│   │   ├── components/     reusable UI
│   │   ├── contexts/       Auth · Notification · Theme · Toast
│   │   ├── features/       per-domain components (ai, dashboard, events, ...)
│   │   ├── hooks/          custom hooks
│   │   ├── layouts/        Admin · Dashboard · Main
│   │   ├── pages/          admin · faculty · student · settings · public
│   │   ├── routes/         route config
│   │   └── styles/         tokens · themes · utilities
│   └── public/             static + service-worker.js
│
├── docs/             Full documentation
│   ├── FEATURES.md         Feature inventory by role
│   ├── ARCHITECTURE.md     System design
│   ├── DEMO_SCRIPT.md      Evaluation walkthrough
│   └── CHANGELOG.md        Phase-by-phase history
│
├── tools/            Idempotent patch scripts (numbered by phase)
│   └── legacy/             Historical one-shot scripts
│
├── README.md         (this file)
├── LICENSE
└── start-backend.bat / .ps1 · start-frontend.bat
\`\`\`

Full architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Security posture

CampusOS takes auth and data integrity seriously, even as a student project:

- httpOnly JWT cookies — tokens never touch JavaScript
- Refresh token rotation with replay detection (old tokens revoked on rotate)
- SHA-256 hashed refresh tokens in DB — plaintext never stored
- bcrypt cost 12 for passwords
- Account lockout after 5 failed logins (15-min window)
- Rate limiting per endpoint: login 10/15min, register 3/hr, OTP 3/15min, upload 20/hr
- Per-user upload quota (100 MB)
- MIME whitelist on all uploads
- Audit log on every sensitive action (user + IP + UA + status)
- Helmet + strict CSP in production
- express-validator on every mutating endpoint
- CORS whitelisted origins with credentials

---

## What we deliberately didn't build

The college already has an ERP that handles:
- Fee structure + payment
- Library catalog + checkout
- Bus tracking with GPS
- Faculty feedback surveys
- Weekly quiz system (college has its own site)

Duplicating these adds no value. CampusOS.ai is designed as a **layer on top**, not a replacement.

---

## Documentation

| Document | Purpose |
|---|---|
| [`docs/FEATURES.md`](docs/FEATURES.md) | Complete feature inventory by role |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, data flow, auth flow, dual-store |
| [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) | Click-by-click evaluation walkthrough + Q&A prep |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | Phase-by-phase history |

---

## Development workflow

The project was built using **idempotent patch scripts** — every change is applied by running a numbered `.mjs` script in `tools/`. This means:

- Every phase is auditable through its scripts
- Running any script twice is safe (they check if the change already exists)
- Rolling back a phase is a matter of reverting one commit

Pattern:

\`\`\`bash
node tools/19-01-exam-models.mjs         # Phase 19 stage 1
node tools/19-02-exam-crud.mjs           # Phase 19 stage 2
node tools/19-03-exam-results.mjs        # Phase 19 stage 3
...
\`\`\`

---

## Contributing

This is a college project, not an open-source library — but the patterns are portable. If you're adapting this for another campus:

1. Update `SRMS CET Bareilly` references in `backend/src/database/seed.js`, `frontend/src/features/landing/data/campusNodes.js`, and `frontend/src/features/facilities/data/facilities.js`
2. Replace the seed admin credentials in `.env` and `seed.js`
3. Adjust `DEPARTMENTS` arrays in the admin forms to match your college's structure
4. Wire your own SMTP + Razorpay + Cloudinary keys

---

## License

MIT — see [LICENSE](LICENSE).

---

## Credits

Built for **SRMS CET Bareilly** as a final-year project.

**Stack:** React 19 · Vite · Node · Express · MongoDB · Socket.io · Gemini · Razorpay

**Status:** Feature-complete for demo. Actively maintained.
