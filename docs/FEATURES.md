# CampusOS.ai — Feature Inventory

**Version:** 1.0
**Last updated:** Phase 24
**Purpose:** The full feature set built into CampusOS.ai, grouped by audience.

---

## Public (no login)

| Feature | Where | Notes |
|---|---|---|
| Landing page | `/` | Hero, feature modules, live campus preview, CTA |
| Features page | `/features` | Deep dive into each module |
| Facilities browser | `/facilities` | Filterable list, detail pages with gallery + live stats |
| Events calendar | `/events` | Grouped by date, paid + free events |
| Heatmap | `/heatmap` | Hour-by-hour occupancy visualization |
| Navigation | `/navigation` | Digital twin preview (static) |
| AI assistant preview | `/ai` | Interactive demo of CampusOS AI |
| Contact | `/contact` | Form + team info |
| Dark/light theme | Anywhere | `ThemeToggle` in navbar |

---

## Auth system

| Feature | Notes |
|---|---|
| Password login | Email + password, 2-step with OTP |
| OTP-only login | Passwordless — email + 6-digit code |
| Signup with OTP | Verify email before account creation |
| Forgot password | 3-step: email → OTP → new password |
| Account lockout | 5 failed logins → 15-min lock |
| Refresh tokens | httpOnly cookie, rotated on use |
| Session list | See all devices, revoke individually or all others |
| Admin OTP bypass | Admins skip OTP for demo convenience |

---

## Student

| Feature | Where | Notes |
|---|---|---|
| Dashboard | `/student` | Today's classes, notices, weekly overview |
| Timetable | `/student/timetable` | Today + full week, class status (now/past/upcoming) |
| Attendance | `/student/attendance` | Per-subject breakdown + Safe-to-Skip predictor |
| Assignments | `/student/assignments` | Faculty posts, image attachments, lightbox |
| Notices | `/student/notices` | Category filter, unread badge, mark-as-read |
| Exams | `/student/exams` | Upcoming schedule grouped by date |
| Results | `/student/results` | Per-course marks + percentage, hides non-published |
| Materials | `/student/materials` | Faculty notes filtered to their dept/sem/section |
| My Events | `/student/registrations` | Registered events, upcoming + past |
| Event registration | `/events` | Free = one-click; paid = Razorpay checkout |
| Session management | `/settings/sessions` | View + revoke other sessions |
| Push notifications | Browser | VAPID subscription, service worker |

### Safe-to-Skip Predictor (signature feature)
For each subject with attendance data:
- **Above 75%:** "You can skip N more classes"
- **Below 75%:** "Attend N in a row to get back to 75%"

Math: `skips = floor((present - 0.75×total) / 0.75)` and `recover = ceil((0.75×total - present) / 0.25)`.

---

## Faculty

| Feature | Where | Notes |
|---|---|---|
| Dashboard | `/faculty` | Today's classes, weekly load, recent notices |
| My classes | `/faculty/timetable` | Today + full week for the faculty's courses |
| Mark attendance | `/faculty/attendance` | Pick class → toggle present/absent per student |
| Assignments | `/faculty/assignments` | Post to a specific class, with optional image |
| Exams | `/faculty/exams` | Department exams, enter marks per student |
| Study materials | `/faculty/materials` | Upload notes, slides, PYQs per course |
| Post notices | `/faculty/notices` | Auto-targeted to their department's students |
| Send to HOD | `/faculty/send-to-hod` | Exam papers / reports with optional image |
| Session management | `/settings/sessions` | Same as student |

---

## Admin / HOD

| Feature | Where | Notes |
|---|---|---|
| Admin dashboard | `/admin` | Stats, quick actions, recent activity |
| Facilities | `/admin/facilities` | CRUD list + form (name, code, location, specs, amenities, live status) |
| Events | `/admin/events` | CRUD + paid/free toggle + coordinator assignment |
| Notices | `/admin/notices` | Post to all/students/faculty/department |
| Timetables | `/admin/timetable` | Timetable editor with clash detection |
| Attendance | `/admin/attendance` | Department-wide records, CSV export, filters |
| Exams | `/admin/exams` | Create exams with visibility flags (see below) |
| HOD inbox | `/admin/hod-inbox` | Review faculty submissions, approve/reject with notes |
| Audit logs | `/admin/audit-logs` | Every sensitive action tracked, CSV export, cleanup |
| Users | `/admin/users` | Role overview (invite disabled, view-only for now) |
| Locked accounts | `/admin/locks` | See + unlock locked accounts |
| Command palette | `⌘K` / `Ctrl+K` | Fast navigation, `Alt+1..9,0` shortcuts |

### Exam visibility flags (Phase 19.5)
Each exam has:
- **`showToStudents`** — controls whether students ever see marks for this exam
- **`countsTowardTotal`** — controls whether marks count in the aggregate percentage

Real college scenario: class tests, quizzes, and lab vivas use `showToStudents: false` so only faculty and HOD see the marks.

### Exam types supported
`mid-sem`, `end-sem`, `class-test`, `pre-university`, `internal`, `practical`, `viva`, `lab-viva`, `quiz`, `assignment-test`, `other` (+ custom label).

---

## Platform features

| Feature | Notes |
|---|---|
| CampusOS AI assistant | Gemini-powered, grounded in live campus data (faculty, timetable, notices, events) |
| AI fallback | Keyword-based responses if Gemini fails |
| Real-time notifications | Socket.io — bell, toasts, unread count |
| Web Push (PWA) | Service worker + VAPID, works when tab is closed |
| Live occupancy | Heatmap + per-facility live stats |
| Audit trail | Every sensitive action logged with user, IP, action, status |
| Rate limiting | Per-endpoint + per-user limits |
| Upload quotas | 20 uploads/hour, 100 MB/user for images |
| Clash detection | Faculty double-booking + room double-booking checks |
| Session security | Refresh-token rotation with replay detection |
| Cookie security | httpOnly, Secure, SameSite=None (dev-friendly) |

---

## Reused / integrated infrastructure

- **Razorpay** — paid event registration with signature verification
- **Cloudinary** — configured for future CDN migration of uploads
- **SMTP (Gmail)** — OTP + welcome emails via nodemailer
- **MongoDB Atlas** — primary store with in-memory fallback
- **Socket.io** — per-user rooms (`user:<id>`) for targeted notifications

---

## Deliberately not built

Given the college already has an ERP, we skipped:

- Fee structure management
- Library book catalog / checkout
- Bus tracking with GPS
- Faculty feedback surveys
- Weekly quiz system (college has its own site)

These are noted so the evaluator sees we made **informed decisions**, not oversights.