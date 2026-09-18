// src/features/events/data/events.js

export const EVENT_TYPES = [
  { id: "all", label: "All events" },
  { id: "academic", label: "Academic" },
  { id: "cultural", label: "Cultural" },
  { id: "sports", label: "Sports" },
  { id: "placement", label: "Placement" },
  { id: "workshop", label: "Workshop" },
];

export const EVENTS = [
  {
    id: "e1",
    title: "AI in Healthcare — Guest Lecture",
    type: "academic",
    date: "2026-03-16",
    time: "10:00 AM – 12:00 PM",
    venue: "Auditorium",
    speaker: "Dr. R. K. Mishra, AIIMS Delhi",
    description: "Deep dive into how AI is transforming diagnostics and treatment planning.",
    seats: 800,
    registered: 342,
    tag: "TODAY",
  },
  {
    id: "e2",
    title: "Coding Club Workshop — React Patterns",
    type: "workshop",
    date: "2026-03-16",
    time: "2:00 PM – 4:00 PM",
    venue: "Computer Centre",
    speaker: "Coding Club Core Team",
    description: "Hands-on session on advanced React hooks, patterns, and performance.",
    seats: 60,
    registered: 47,
    tag: "TODAY",
  },
  {
    id: "e3",
    title: "Placement Prep — Aptitude Bootcamp",
    type: "placement",
    date: "2026-03-16",
    time: "4:30 PM – 6:00 PM",
    venue: "Seminar Hall 2",
    speaker: "Training & Placement Cell",
    description: "Speed math, logical reasoning, and verbal ability for campus placements.",
    seats: 200,
    registered: 156,
    tag: "TODAY",
  },
  {
    id: "e4",
    title: "Zest 2026 — Annual Cultural Fest",
    type: "cultural",
    date: "2026-03-18",
    time: "All day · 3 days",
    venue: "Main Campus",
    speaker: "Student Council",
    description: "The biggest cultural festival of SRMS — music, dance, drama, fashion, and 30+ events.",
    seats: 3000,
    registered: 1284,
    tag: "FEATURED",
  },
  {
    id: "e5",
    title: "Techvyom 2026 — Technical Symposium",
    type: "academic",
    date: "2026-03-22",
    time: "9:00 AM – 6:00 PM",
    venue: "Academic Block",
    speaker: "IEEE Student Chapter",
    description: "Paper presentations, hackathon, project expo, and industry keynotes.",
    seats: 500,
    registered: 320,
  },
  {
    id: "e6",
    title: "Inter-College Basketball Tournament",
    type: "sports",
    date: "2026-03-20",
    time: "8:00 AM – 5:00 PM",
    venue: "Basketball Court",
    speaker: "Sports Department",
    description: "8 teams from Bareilly region competing for the SRMS trophy.",
    seats: 400,
    registered: 218,
  },
  {
    id: "e7",
    title: "Robotics Demo Day",
    type: "workshop",
    date: "2026-03-19",
    time: "3:00 PM – 5:00 PM",
    venue: "AI & Robotics Lab",
    speaker: "Robotics Club",
    description: "Live demos of student-built autonomous robots, drones, and arm manipulators.",
    seats: 80,
    registered: 62,
  },
  {
    id: "e8",
    title: "TCS Campus Recruitment Drive",
    type: "placement",
    date: "2026-03-25",
    time: "9:00 AM – 5:00 PM",
    venue: "Auditorium",
    speaker: "TCS HR Team",
    description: "Open to all final-year B.Tech and MCA students with 60%+ aggregate.",
    seats: 500,
    registered: 412,
  },
];

export function getUpcomingEvents(daysAhead = 30) {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() + daysAhead);
  return EVENTS.filter((e) => {
    const d = new Date(e.date);
    return d >= now && d <= cutoff;
  });
}