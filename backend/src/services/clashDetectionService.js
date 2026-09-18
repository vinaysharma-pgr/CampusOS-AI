// src/services/clashDetectionService.js
import Timetable from "../models/Timetable.js";

function toMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== "string") return null;
  const parts = hhmm.split(":");
  if (parts.length < 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  if (aStart == null || aEnd == null || bStart == null || bEnd == null) return false;
  return aStart < bEnd && bStart < aEnd;
}

function normalize(cls, source) {
  return {
    day: cls.dayOfWeek,
    start: toMinutes(cls.startTime),
    end: toMinutes(cls.endTime),
    courseCode: cls.courseCode || "",
    courseName: cls.courseName || "",
    room: (cls.room || "").trim(),
    faculty: (cls.facultyName || "").trim(),
    type: cls.type || "lecture",
    _raw: cls,
    _source: source,
  };
}

function fromMinutes(mins) {
  if (mins == null) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

function fmt(range) {
  return fromMinutes(range.start) + "-" + fromMinutes(range.end);
}

export async function detectClashes({
  classes = [],
  department,
  semester,
  section,
  academicYear,
  excludeTimetableId = null,
}) {
  const clashes = [];
  const warnings = [];

  const incoming = classes.map((c) => normalize(c, "new"));

  let existing = [];
  try {
    const docs = await Timetable.find({ isActive: true }).lean();
    const filtered = excludeTimetableId
      ? docs.filter((d) => String(d._id) !== String(excludeTimetableId))
      : docs;
    existing = filtered.flatMap((d) =>
      (d.classes || []).map((c) => {
        const n = normalize(c, "existing");
        n._section = d.section;
        n._department = d.department;
        n._semester = d.semester;
        return n;
      })
    );
  } catch (e) {
    console.error("Clash fetch failed:", e.message);
  }

  // Intra-set clashes
  for (let i = 0; i < incoming.length; i++) {
    for (let j = i + 1; j < incoming.length; j++) {
      const a = incoming[i];
      const b = incoming[j];
      if (a.day !== b.day) continue;
      if (!overlaps(a.start, a.end, b.start, b.end)) continue;

      if (a.faculty && b.faculty && a.faculty.toLowerCase() === b.faculty.toLowerCase()) {
        clashes.push({
          type: "faculty",
          severity: "error",
          message: 'Faculty "' + a.faculty + '" is double-booked on ' + a.day + " " + fmt(a) + " and " + fmt(b),
          a: { course: a.courseCode, room: a.room, time: fmt(a) },
          b: { course: b.courseCode, room: b.room, time: fmt(b) },
        });
      }

      if (a.room && b.room && a.room.toLowerCase() === b.room.toLowerCase()) {
        clashes.push({
          type: "room",
          severity: "error",
          message: 'Room "' + a.room + '" is used twice on ' + a.day,
          a: { course: a.courseCode, faculty: a.faculty, time: fmt(a) },
          b: { course: b.courseCode, faculty: b.faculty, time: fmt(b) },
        });
      }
    }
  }

  // Cross-clashes against existing timetables
  for (const a of incoming) {
    for (const b of existing) {
      if (a.day !== b.day) continue;
      if (!overlaps(a.start, a.end, b.start, b.end)) continue;

      if (a.faculty && b.faculty && a.faculty.toLowerCase() === b.faculty.toLowerCase()) {
        clashes.push({
          type: "faculty-cross",
          severity: "error",
          message:
            'Faculty "' + a.faculty + '" also teaches ' + b.courseCode +
            " (" + b._department + "-" + b._semester + "-" + b._section + ") on " + a.day,
          a: { course: a.courseCode, room: a.room, time: fmt(a) },
          b: {
            course: b.courseCode,
            section: b._department + "-" + b._semester + "-" + b._section,
            room: b.room,
            time: fmt(b),
          },
        });
      }

      if (a.room && b.room && a.room.toLowerCase() === b.room.toLowerCase()) {
        clashes.push({
          type: "room-cross",
          severity: "error",
          message:
            'Room "' + a.room + '" is also used by ' + b.courseCode +
            " (" + b._department + "-" + b._semester + "-" + b._section + ") on " + a.day,
          a: { course: a.courseCode, faculty: a.faculty, time: fmt(a) },
          b: {
            course: b.courseCode,
            section: b._department + "-" + b._semester + "-" + b._section,
            faculty: b.faculty,
            time: fmt(b),
          },
        });
      }
    }
  }

  return { clashes, warnings };
}
