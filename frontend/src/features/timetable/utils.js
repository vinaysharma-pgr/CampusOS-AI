// src/features/timetable/utils.js

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const TYPE_COLORS = {
  lecture:  { bg: "color-mix(in srgb, var(--color-primary) 10%, transparent)",  border: "color-mix(in srgb, var(--color-primary) 35%, transparent)",  text: "var(--color-primary)" },
  lab:      { bg: "rgba(168,85,247,0.10)",  border: "rgba(168,85,247,0.35)",  text: "#a855f7" },
  tutorial: { bg: "rgba(245,165,36,0.10)",  border: "rgba(245,165,36,0.35)",  text: "#f5a524" },
  exam:     { bg: "rgba(240,85,77,0.10)",   border: "rgba(240,85,77,0.35)",   text: "#f0554d" },
};

/** Return today's day name, or null if Sunday */
export function todayName() {
  const d = new Date().getDay(); // 0 = Sun
  if (d === 0) return null;
  return DAYS[d - 1];
}

/** Group classes by day → sorted by startTime */
export function groupByDay(classes = []) {
  const map = Object.fromEntries(DAYS.map((d) => [d, []]));
  for (const c of classes) {
    if (!map[c.dayOfWeek]) continue;
    map[c.dayOfWeek].push(c);
  }
  for (const d of DAYS) {
    map[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return map;
}

/** Return today's classes only */
export function todayClasses(classes = []) {
  const t = todayName();
  if (!t) return [];
  return classes
    .filter((c) => c.dayOfWeek === t)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/** "09:00" → "9:00 AM" */
export function fmtTime(hhmm) {
  if (!hhmm || !hhmm.includes(":")) return hhmm || "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
}

/** Status of a class relative to now — "past" | "now" | "next" | "upcoming" */
export function classStatus(cls, now = new Date()) {
  if (!cls?.startTime || !cls?.endTime) return "upcoming";
  const [sh, sm] = cls.startTime.split(":").map(Number);
  const [eh, em] = cls.endTime.split(":").map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0, 0);
  const end   = new Date(now); end.setHours(eh, em, 0, 0);
  if (now > end) return "past";
  if (now >= start && now <= end) return "now";
  return "upcoming";
}

/** Find the next upcoming class today */
export function nextClass(classes = []) {
  const t = todayClasses(classes);
  const now = new Date();
  for (const c of t) {
    const [h, m] = c.startTime.split(":").map(Number);
    const start = new Date(now); start.setHours(h, m, 0, 0);
    if (start > now) return c;
  }
  return null;
}
