// src/database/seed.js
import { db } from "./index.js";

const SAMPLE_FACILITIES = [
  {
    id: "central-library",
    code: "LIB_01",
    name: "Central Library",
    type: "library",
    tagline: "Four floors of silence, study, and stack access",
    description: "The heart of academic life. 4 floors of study zones, a rare-books archive, 24/7 reading rooms, and digital terminals on every level.",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=80&auto=format&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=80&auto=format&fit=crop"],
    specs: { seats: 480, systems: 120, floors: 4, area: "42,000 sq ft", hours: "24/7" },
    amenities: ["Wi-Fi 6E", "Silent Zones", "Group Study Rooms", "Digital Terminals"],
    live: { occupancy: 68, seatsAvailable: 154, systemsAvailable: 47, status: "open" },
    location: { building: "Block A", floor: "G-3", x: 22, y: 30 },
  },
  {
    id: "ai-robotics-lab",
    code: "LAB_AI_02",
    name: "AI & Robotics Lab",
    type: "lab",
    tagline: "GPU workstations, robotic arms, and a 3D print farm",
    description: "Advanced computing and robotics research.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80&auto=format&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80&auto=format&fit=crop"],
    specs: { seats: 60, systems: 40, floors: 1, area: "6,400 sq ft", hours: "8am-11pm" },
    amenities: ["RTX Workstations", "Robotic Arms", "3D Print Farm"],
    live: { occupancy: 42, seatsAvailable: 35, systemsAvailable: 23, status: "open" },
    location: { building: "Block B", floor: "2", x: 55, y: 24 },
  },
  {
    id: "computer-lab-a",
    code: "LAB_CS_07",
    name: "Computer Science Lab A",
    type: "lab",
    tagline: "200-seat programming lab with dual monitors",
    description: "Primary CS lab for programming and algorithms.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop"],
    specs: { seats: 200, systems: 200, floors: 1, area: "8,500 sq ft", hours: "8am-9pm" },
    amenities: ["Dual Monitors", "GPU Cluster Access"],
    live: { occupancy: 61, seatsAvailable: 78, systemsAvailable: 78, status: "open" },
    location: { building: "Block B", floor: "1", x: 40, y: 60 },
  },
  {
    id: "student-cafeteria",
    code: "CAF_05",
    name: "Student Cafeteria",
    type: "cafeteria",
    tagline: "Multi-cuisine food court with 12 counters",
    description: "Multi-cuisine food court.",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1600&q=80&auto=format&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1600&q=80&auto=format&fit=crop"],
    specs: { seats: 320, systems: 0, floors: 2, area: "12,000 sq ft", hours: "7am-10pm" },
    amenities: ["12 Counters", "Digital Ordering", "Rooftop Seating"],
    live: { occupancy: 71, seatsAvailable: 93, systemsAvailable: 0, status: "busy" },
    location: { building: "Block E", floor: "1", x: 68, y: 72 },
  },
  {
    id: "sports-complex",
    code: "SPT_04",
    name: "Sports Complex",
    type: "sports",
    tagline: "Indoor courts, Olympic pool, and gym",
    description: "Two basketball courts, an Olympic-length pool, and a full gym.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&auto=format&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&auto=format&fit=crop"],
    specs: { seats: 200, systems: 0, floors: 2, area: "22,000 sq ft", hours: "6am-10pm" },
    amenities: ["Olympic Pool", "Gym Equipment"],
    live: { occupancy: 32, seatsAvailable: 136, systemsAvailable: 0, status: "open" },
    location: { building: "Block D", floor: "G-1", x: 20, y: 76 },
  },
  {
    id: "grand-auditorium",
    code: "AUD_06",
    name: "Grand Auditorium",
    type: "auditorium",
    tagline: "1,200-seat acoustically treated hall",
    description: "The primary venue for convocation, conferences, and cultural events.",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1600&q=80&auto=format&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1503095396549-807759245b35?w=1600&q=80&auto=format&fit=crop"],
    specs: { seats: 1200, systems: 30, floors: 1, area: "18,000 sq ft", hours: "Event-based" },
    amenities: ["Full A/V Rig", "Live Streaming"],
    live: { occupancy: 0, seatsAvailable: 1200, systemsAvailable: 30, status: "closed" },
    location: { building: "Block F", floor: "G", x: 50, y: 45 },
  },
];

const SAMPLE_EVENTS = [
  {
    title: "AI in Healthcare Guest Lecture",
    type: "academic",
    date: "2026-03-16",
    time: "10:00 AM - 12:00 PM",
    venue: "Auditorium",
    speaker: "Dr. R. K. Mishra, AIIMS Delhi",
    description: "Deep dive into how AI is transforming diagnostics and treatment planning.",
    seats: 800,
    registered: 342,
    tag: "TODAY",
  },
  {
    title: "Zest 2026 Annual Cultural Fest",
    type: "cultural",
    date: "2026-03-18",
    time: "All day - 3 days",
    venue: "Main Campus",
    speaker: "Student Council",
    description: "The biggest cultural festival of SRMS.",
    seats: 3000,
    registered: 1284,
    tag: "FEATURED",
  },
];

const SAMPLE_NOTICES = [
  {
    title: "Mid-semester exam schedule released",
    body: "The mid-semester examination schedule for all departments has been published. Exams begin from 25th September. Check your individual timetable on the exam portal.",
    category: "Exam",
    priority: "urgent",
    targetAudience: "students",
    targetDepartment: "CSE",
    author: { name: "Exam Cell", role: "admin", _id: null },
  },
  {
    title: "Zest 2026 Registration now open",
    body: "SRMS CET's annual cultural festival Zest returns from March 18-20, 2026. Register for music, dance, drama, and 30+ events. Last date for registration: March 10.",
    category: "Cultural",
    priority: "normal",
    targetAudience: "all",
    author: { name: "Student Council", role: "admin", _id: null },
  },
  {
    title: "Library extended hours during exams",
    body: "Central Library will remain open until midnight from September 20 onwards to help students prepare for mid-semester exams.",
    category: "Facility",
    priority: "normal",
    targetAudience: "students",
    author: { name: "Central Library", role: "admin", _id: null },
  },
  {
    title: "TCS campus placement drive",
    body: "Final list of students eligible for TCS campus drive on March 25 has been posted on the placement board. Report to the Training & Placement Cell with your resume.",
    category: "Placement",
    priority: "normal",
    targetAudience: "students",
    targetDepartment: "CSE",
    author: { name: "Training & Placement Cell", role: "admin", _id: null },
  },
  {
    title: "Faculty meeting Friday 3 PM",
    body: "All CSE faculty members are requested to attend the department meeting on Friday at 3 PM in the HOD office. Agenda: exam preparation and student attendance review.",
    category: "Academic",
    priority: "normal",
    targetAudience: "faculty",
    targetDepartment: "CSE",
    author: { name: "HOD CSE", role: "admin", _id: null },
  },
];

const SAMPLE_TIMETABLE = {
  department: "CSE",
  semester: "5",
  section: "A",
  academicYear: "2025-26",
  effectiveFrom: "2026-01-15",
  classes: [
    { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00", courseCode: "CS 302", courseName: "Operating Systems", room: "B-204", facultyName: "Dr. Meera Rao", type: "lecture" },
    { dayOfWeek: "Monday", startTime: "10:15", endTime: "11:15", courseCode: "CS 301", courseName: "Design & Analysis of Algorithms", room: "B-201", facultyName: "Dr. Anurag Sharma", type: "lecture" },
    { dayOfWeek: "Monday", startTime: "11:30", endTime: "12:30", courseCode: "CS 305", courseName: "Database Systems", room: "B-102", facultyName: "Prof. Kavita Singh", type: "lecture" },
    { dayOfWeek: "Monday", startTime: "14:00", endTime: "16:00", courseCode: "CS 302", courseName: "OS Lab", room: "Computer Centre", facultyName: "Dr. Meera Rao", type: "lab" },

    { dayOfWeek: "Tuesday", startTime: "09:00", endTime: "10:00", courseCode: "CS 306", courseName: "Computer Networks", room: "B-201", facultyName: "Dr. Rajesh Kumar", type: "lecture" },
    { dayOfWeek: "Tuesday", startTime: "10:15", endTime: "11:15", courseCode: "CS 305", courseName: "DBMS Lab", room: "Computer Centre", facultyName: "Prof. Kavita Singh", type: "lab" },
    { dayOfWeek: "Tuesday", startTime: "11:30", endTime: "12:30", courseCode: "CS 301", courseName: "DAA Tutorial", room: "B-201", facultyName: "Dr. Anurag Sharma", type: "tutorial" },

    { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "10:00", courseCode: "CS 307", courseName: "Software Engineering", room: "B-105", facultyName: "Prof. Anil Verma", type: "lecture" },
    { dayOfWeek: "Wednesday", startTime: "10:15", endTime: "11:15", courseCode: "CS 302", courseName: "Operating Systems", room: "B-204", facultyName: "Dr. Meera Rao", type: "lecture" },
    { dayOfWeek: "Wednesday", startTime: "11:30", endTime: "12:30", courseCode: "CS 306", courseName: "Computer Networks", room: "B-201", facultyName: "Dr. Rajesh Kumar", type: "lecture" },

    { dayOfWeek: "Thursday", startTime: "09:00", endTime: "10:00", courseCode: "CS 305", courseName: "Database Systems", room: "B-102", facultyName: "Prof. Kavita Singh", type: "lecture" },
    { dayOfWeek: "Thursday", startTime: "10:15", endTime: "12:15", courseCode: "CS 307", courseName: "SE Lab", room: "Computer Centre", facultyName: "Prof. Anil Verma", type: "lab" },

    { dayOfWeek: "Friday", startTime: "09:00", endTime: "10:00", courseCode: "CS 301", courseName: "Design & Analysis of Algorithms", room: "B-201", facultyName: "Dr. Anurag Sharma", type: "lecture" },
    { dayOfWeek: "Friday", startTime: "10:15", endTime: "11:15", courseCode: "CS 306", courseName: "CN Lab", room: "Computer Lab A", facultyName: "Dr. Rajesh Kumar", type: "lab" },
    { dayOfWeek: "Friday", startTime: "14:00", endTime: "16:00", courseCode: "CS 307", courseName: "Software Engineering", room: "B-105", facultyName: "Prof. Anil Verma", type: "lecture" },

    { dayOfWeek: "Saturday", startTime: "09:00", endTime: "11:00", courseCode: "CS 301", courseName: "DAA Extra Class", room: "B-201", facultyName: "Dr. Anurag Sharma", type: "lecture" },
  ],
};

export async function seedDatabase() {
  const startTime = Date.now();
  console.log("Seeding data...");

  // Admin user
  const existingAdmin = await db.findByEmail("vinay@srms.ac.in");
  if (!existingAdmin) {
    await db.createUser({
      name: "Vinay Sharma",
      email: "vinay@srms.ac.in",
      password: "password123",
      role: "admin",
      organization: "SRMS CET Bareilly",
      department: "CSE",
    });
    console.log("   Seeded admin user");
  }

  // Facilities
  const facilities = await db.listFacilities();
  if (facilities.length === 0) {
    for (const f of SAMPLE_FACILITIES) await db.createFacility(f);
    console.log("   Seeded " + SAMPLE_FACILITIES.length + " facilities");
  }

  // Events
  const events = await db.listEvents();
  if (events.length === 0) {
    for (const e of SAMPLE_EVENTS) await db.createEvent(e);
    console.log("   Seeded " + SAMPLE_EVENTS.length + " events");
  }

  // Notices
  const notices = await db.listNotices({ role: "admin" });
  if (notices.length === 0) {
    for (const n of SAMPLE_NOTICES) await db.createNotice(n);
    console.log("   Seeded " + SAMPLE_NOTICES.length + " notices");
  }

  // Timetables
  const timetables = await db.listTimetables ? await db.listTimetables() : [];
  if (timetables.length === 0 && db.createTimetable) {
    await db.createTimetable(SAMPLE_TIMETABLE);
    console.log("   Seeded 1 timetable");
  } else if (timetables.length === 0) {
    // Fallback: timetableService handles seeding via the service
    try {
      const { createTimetable } = await import("../services/timetableService.js");
      await createTimetable(SAMPLE_TIMETABLE, null);
      console.log("   Seeded 1 timetable");
    } catch (e) { /* ignore */ }
  }

  console.log("   Seed check complete in " + (Date.now() - startTime) + "ms");
}
