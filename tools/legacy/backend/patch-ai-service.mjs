import fs from "node:fs";

const path = "src/services/aiService.js";
let c = fs.readFileSync(path, "utf8");

// Replace the entire buildSystemPrompt with a richer version
const NEW_BUILD = `async function buildSystemPrompt(user, db) {
  const lines = [];
  lines.push("You are CampusOS AI — the campus assistant for SRMS CET Bareilly.");
  lines.push("Answer in a friendly, concise way. 2-4 sentences unless more detail is needed.");
  lines.push("When asked about a location, give clear walking directions from wherever the user says they are.");
  lines.push("When asked about occupancy, use the live numbers below.");
  lines.push("IMPORTANT: If data is not in this system prompt, say so honestly in one line, then suggest who to contact (e.g. 'check with the Transport Desk' or 'ask the CSE department office').");
  lines.push("Never invent facts. Never say 'I can help with X' as a fallback — either answer or point to the right office.");
  lines.push("");

  // User context
  if (user) {
    lines.push("CURRENT USER:");
    lines.push("  Name: " + (user.name || "Guest"));
    lines.push("  Role: " + (user.role || "student"));
    if (user.department) lines.push("  Department: " + user.department);
    if (user.semester) lines.push("  Semester: " + user.semester);
    if (user.section) lines.push("  Section: " + user.section);
    lines.push("");
  }

  // Facilities with locations
  try {
    const facilities = await db.listFacilities();
    lines.push("CAMPUS FACILITIES (" + facilities.length + " total):");
    for (const f of facilities.slice(0, 30)) {
      lines.push("  - " + f.name + " (" + f.type + ") — " + (f.tagline || ""));
      lines.push("    Location: " + (f.location?.building || "?") + ", Floor " + (f.location?.floor || "?"));
      lines.push("    Live occupancy: " + (f.live?.occupancy || 0) + "% (" + (f.live?.status || "?") + "), " + (f.live?.seatsAvailable || 0) + " seats free");
      if (f.specs?.hours) lines.push("    Hours: " + f.specs.hours);
    }
    lines.push("");
  } catch (e) {}

  // Faculty directory
  try {
    const User = (await import("../models/User.js")).default;
    const faculty = await User.find({ role: "faculty", isActive: true }).select("name email department").lean();
    if (faculty.length > 0) {
      lines.push("FACULTY DIRECTORY (" + faculty.length + " members):");
      for (const f of faculty.slice(0, 40)) {
        lines.push("  - " + f.name + " (" + (f.department || "?") + ") — " + f.email);
      }
      lines.push("");
    }
  } catch (e) {}

  // FULL timetable index — every class across all sections (for "who teaches X")
  try {
    const Timetable = (await import("../models/Timetable.js")).default;
    const tts = await Timetable.find({ isActive: true }).lean();
    const allClasses = tts.flatMap((t) => (t.classes || []).map((c) => ({ ...c, _dept: t.department, _sem: t.semester, _sec: t.section })));
    if (allClasses.length > 0) {
      lines.push("FULL TIMETABLE INDEX (" + allClasses.length + " total classes across all sections):");
      for (const c of allClasses.slice(0, 100)) {
        const tag = c._dept + "-Sem" + c._sem + "-" + c._sec;
        lines.push("  [" + tag + "] " + c.dayOfWeek + " " + c.startTime + "-" + c.endTime + " " + c.courseCode + " " + c.courseName + " in " + c.room + (c.facultyName ? " — taught by " + c.facultyName : ""));
      }
      lines.push("");
    }
  } catch (e) {}

  // Timetable for this user
  if (user && (user.role === "student" || user.role === "faculty")) {
    try {
      const Timetable = (await import("../models/Timetable.js")).default;
      let ttQuery = { isActive: true };
      if (user.role === "student") {
        if (user.department) ttQuery.department = user.department;
        if (user.semester) ttQuery.semester = String(user.semester);
        if (user.section) ttQuery.section = user.section;
      }
      const tts = await Timetable.find(ttQuery).lean();
      const classes = tts.flatMap((t) => t.classes || []);
      if (classes.length > 0) {
        lines.push("YOUR TIMETABLE (" + classes.length + " classes):");
        for (const c of classes.slice(0, 40)) {
          lines.push("  " + c.dayOfWeek + " " + c.startTime + "-" + c.endTime + " " + c.courseCode + " " + c.courseName + " in " + c.room + (c.facultyName ? " (" + c.facultyName + ")" : ""));
        }
        lines.push("");
      }
    } catch (e) {}
  }

  // Recent notices
  try {
    const notices = await db.listNotices({ role: user?.role, department: user?.department });
    lines.push("RECENT NOTICES (" + notices.length + " active):");
    for (const n of notices.slice(0, 10)) {
      lines.push("  [" + (n.category || "General") + "] " + n.title + " — " + (n.body || "").slice(0, 200));
    }
    lines.push("");
  } catch (e) {}

  // Events
  try {
    const events = await db.listEvents();
    lines.push("UPCOMING EVENTS (" + events.length + "):");
    for (const e of events.slice(0, 12)) {
      lines.push("  " + e.date + " " + e.time + " — " + e.title + " at " + e.venue + (e.speaker ? " (by " + e.speaker + ")" : ""));
    }
    lines.push("");
  } catch (e) {}

  // Bus info (static — no live API)
  lines.push("BUS TRANSPORT:");
  lines.push("  The campus runs shuttle buses to Bareilly City from the Main Gate bus bay.");
  lines.push("  Morning routes: Civil Lines, Rajendra Nagar, I.V.R.I., Ayub Khan Chauraha, Junction.");
  lines.push("  Frequency: approximately every 30 minutes during 7 AM - 9 AM and 4 PM - 7 PM.");
  lines.push("  For exact timing and route changes, students should check with the Transport Desk (Ground floor, Admin Block).");
  lines.push("  If asked for the EXACT next bus time, say: 'Live bus timing is not yet available in CampusOS. Check the Transport Desk at the Admin Block for exact schedules.'");
  lines.push("");

  // Navigation hints
  lines.push("NAVIGATION NOTES:");
  lines.push("  Main Gate is the primary entrance from the highway.");
  lines.push("  From Main Gate: walk straight 200m on the central road to reach the Academic Block area.");
  lines.push("  Central Library (Asha Gupta Library) is in Block A, near the Academic Block.");
  lines.push("  Computer Centre is next to the Academic Block. Cafeteria is near the Seminar Halls.");
  lines.push("  When a user says where they are, give a short step-by-step walk (e.g. walk 50m forward, turn left, second building on right).");
  lines.push("");

  lines.push("Now answer the user question based on the above data. If the question is about a feature not in this data, say so in one line, then point to the right office/person.");
  return lines.join(String.fromCharCode(10));
}`;

// Find and replace the entire buildSystemPrompt function
const re = /async function buildSystemPrompt\(user, db\) \{[\s\S]*?\n\}/;

if (c.match(re)) {
  c = c.replace(re, NEW_BUILD);
  fs.writeFileSync(path, c, "utf8");
  console.log("aiService.js — system prompt expanded with faculty, timetable, bus info");
} else {
  console.log("ERROR: Could not find buildSystemPrompt function");
}