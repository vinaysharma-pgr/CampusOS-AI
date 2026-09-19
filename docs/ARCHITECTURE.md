# CampusOS.ai — Architecture

**Purpose:** A system-level view of how CampusOS.ai is built — for evaluators, future maintainers, and anyone joining the project.

---

## High-level shape

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (React)                         │
│  React 19 · Vite · React Router 7 · Framer Motion · Tailwind    │
│  ┌─────────────────┬──────────────────┬──────────────────────┐  │
│  │  Public pages   │ Student dashboard│ Faculty / Admin      │  │
│  └─────────────────┴──────────────────┴──────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Contexts: Auth · Theme · Toast · Notifications           │  │
│  │  Socket.io client (per-user room)                         │  │
│  │  Service Worker (Web Push)                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS · httpOnly cookies · Socket.io
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node + Express)                     │
│  Middleware: helmet → cors → rate-limit → cookie-parser → json   │
│              → auditMiddleware → route-specific guards           │
│  Routes (25) → Controllers (45) → Services (30)                  │
│  Cross-cutting: notifications, push, audit, email                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                            │
│  ┌───────────────────────────┬───────────────────────────────┐  │
│  │  MongoDB (primary)        │  In-memory fallback           │  │
│  │  via Mongoose · 16 models │  Maps keyed by _id · no persist │  │
│  └───────────────────────────┴───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

---

## Dual-store design

CampusOS runs on either MongoDB or an in-memory store without service-level changes. \`backend/src/database/index.js\` exports a Proxy that picks the correct store at first method call. When MongoDB fails to connect at boot, \`server.js\` sets \`USE_MONGO=false\` and every \`db.x()\` call automatically hits the memory store.

**Limitation:** A few services (\`refreshTokenService\`, \`auditLogService\`, \`assignmentService\`, \`attendanceService\`, \`clashDetectionService\`) bypass the proxy and use Mongoose directly. In fallback mode those time out — but session persistence is the only user-visible impact.

---

## Auth architecture

### Two cookies

| Cookie | Scope | Purpose |
|---|---|---|
| \`campusos_token\` | \`/api\` | JWT, 15 min |
| \`campusos_refresh\` | \`/api/auth\` | Opaque, 30 days, hashed in DB |

Both httpOnly, Secure, SameSite=None. Refresh tokens are stored SHA-256-hashed in \`RefreshToken\`.

### 2-step login

1. POST \`/api/auth/login\` → verify credentials → if admin: issue tokens; else: send OTP
2. POST \`/api/auth/login/verify-password-otp\` → verify OTP → issue tokens

### Silent refresh

Frontend \`api/client.js\` intercepts 401 → POSTs \`/api/auth/refresh\` (cookie-based) → replays original + queued requests. Refresh rotates the token (old one revoked as \`rotated\`), preventing replay.

---

## Real-time notifications

**Socket.io:** handshake reads the \`campusos_token\` cookie → each socket joins room \`user:<id>\`. Backend emits \`io.to("user:"+userId).emit("notification", payload)\`.

**Web Push:** VAPID keys configured; service worker handles \`push\` + \`notificationclick\`; subscriptions in \`PushSubscription\`; dead subscriptions auto-cleaned on 410/404.

**In-app bell:** \`NotificationContext\` maintains items (50), unread, toasts (6s auto-dismiss). Socket listener pushes new items + plays chime (if not muted).

---

## Frontend data flow

Component → API helper (\`api/*.js\`) → axios instance (\`api/client.js\`, 401 interceptor) → Express route → controller → service → \`db\` proxy → MongoDB or memory.

Response envelope everywhere: \`{ success, message, data }\`.

---

## Upload architecture

**Images:** \`POST /api/upload\` → multer memory, \`image/*\` only, 8 MB → \`backend/uploads/\` → served via authenticated \`GET /api/upload/:filename\`.

**Documents:** \`POST /api/upload/doc\` → multer memory, PDF/DOCX/PPTX/TXT/image, 25 MB → \`backend/uploads/docs/\` → served via \`GET /api/upload/doc/:filename\`.

Quota: aggregate user's bytes in \`Upload\` collection, reject if \`used + new > 100 MB\` with 413. Rate limit: 20 uploads/hour per user.

---

## Audit trail

\`auditMiddleware\` wraps \`res.json\`, matches \`method + path\` against regex map (login, upload, notice.create, etc.), writes \`{userId, action, resource, status, ip, userAgent, metadata}\` fire-and-forget. Admin browses + exports + cleans up at \`/admin/audit-logs\`.

---

## AI assistant

3-layer fallback:

1. **Gemini** with a live-data system prompt (faculty, timetable, notices, events, facilities, occupancy, navigation hints).
2. **Keyword engine** (\`aiResponses.js\`) if Gemini fails.
3. **Graceful error** suggesting next steps.

Vision variant \`/api/ai/extract-timetable\` accepts a timetable image → returns structured JSON with retry on 503/429.

---

## Security posture

| Layer | Measure |
|---|---|
| Transport | https-only cookies in prod |
| Auth | httpOnly JWT + refresh rotation + session revocation |
| Password | Bcrypt cost 12 |
| Rate limits | Login 10/15min · register 3/hr · OTP 3/15min |
| Lockout | 5 failed attempts → 15-min lock |
| Upload | MIME whitelist + size limit + per-user quota + rate limit |
| Audit | Every sensitive action logged with IP + UA |
| Headers | Helmet + CSP in prod + X-Frame-Options: DENY |
| Validation | express-validator on every mutating endpoint |
| CORS | Whitelisted origins, credentials enabled |

---

## Directory layout

\`\`\`
CampusOS-AI/
├── backend/
│   ├── src/
│   │   ├── config/          env, cloudinary, email
│   │   ├── controllers/     thin HTTP layer
│   │   ├── database/        db proxy, mongoStore, memoryStore, seed, otpStore
│   │   ├── middleware/      auth, error, rateLimit, security, upload, audit
│   │   ├── models/          Mongoose schemas
│   │   ├── routes/          route modules + index.js aggregator
│   │   ├── services/        business logic
│   │   ├── utils/           ApiError, ApiResponse, jwt, cookieHelper, asyncHandler
│   │   ├── validators/      express-validator rules
│   │   └── server.js
│   ├── uploads/
│   └── package.json
│
├── frontend/
│   ├── public/              static + service-worker.js
│   ├── src/
│   │   ├── api/             axios modules
│   │   ├── components/      auth, common, events, layout, notices, notifications, timetable, ui
│   │   ├── contexts/        Auth, Notification, Theme, Toast
│   │   ├── features/        ai-assistant, dashboard, events, facilities, heatmap, landing, sos, timetable, attendance
│   │   ├── hooks/           useCountUp, useCursorSpotlight, usePushNotifications, useScrollSpy, useSOS
│   │   ├── layouts/         Admin, Dashboard, Main
│   │   ├── pages/           admin/*, faculty/*, student/*, settings/*, public/*
│   │   ├── routes/          AppRoutes, ProtectedRoute, DashboardRedirect
│   │   ├── styles/          base, tokens, themes, utilities, animations
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── vite.config.js
│
├── docs/                    FEATURES, ARCHITECTURE, DEMO_SCRIPT, CHANGELOG
├── tools/                   idempotent patch scripts (numbered by phase)
│   └── legacy/              historical one-shot scripts
│
├── README.md
├── LICENSE
└── start-backend.bat/.ps1 · start-frontend.bat
\`\`\`

---

## Design principles

1. **Thin controllers, fat services.**
2. **Idempotent patch scripts** — every tool is safe to run twice.
3. **Response envelope consistency** — every endpoint returns \`{success, message, data}\`.
4. **Cookies over localStorage** — JWTs never touch JS.
5. **Optimistic UI + rollback** — read tracking, registration, etc. update UI immediately and revert on failure.
6. **Dual-store resilience** — MongoDB down does not crash the app.
7. **Fail-open on non-critical guards** — quota lookup errors don't block uploads.
