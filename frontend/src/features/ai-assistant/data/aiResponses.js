// src/features/ai-assistant/data/aiResponses.js

export const QUICK_PROMPTS = [
  { label: "Where is the library?", text: "Where is the Central Library?" },
  { label: "Next bus to Bareilly?", text: "When is the next bus to Bareilly?" },
  { label: "Who teaches CS 301?", text: "Who teaches CS 301?" },
  { label: "Is the library crowded?", text: "Is the library crowded right now?" },
  { label: "Nearest washroom?", text: "Where is the nearest washroom?" },
  { label: "Today's events?", text: "What events are happening today?" },
];

// Keyword-based response engine (placeholder until real backend AI)
export function getAIResponse(input) {
  const q = input.toLowerCase().trim();

  // Library
  if (q.includes("library") && (q.includes("where") || q.includes("location") || q.includes("find"))) {
    return {
      text: "The **Central Library** (Asha Gupta Library) is on Block A, floors G–3. From the Main Gate, take the central road 200m, turn left at the Academic Block, then it's the second building on your right. About a 4-minute walk.",
      actions: [{ label: "Open in Facilities", to: "/facilities/central-library" }],
    };
  }
  if (q.includes("library") && (q.includes("crowd") || q.includes("busy") || q.includes("occupied"))) {
    return {
      text: "Right now the library is at **68% occupancy** — 154 of 480 seats are free. The 3rd-floor silent zone is quietest. Peak hours are 2–4 PM.",
      actions: [{ label: "See live view", to: "/facilities/central-library" }],
    };
  }
  if (q.includes("library")) {
    return {
      text: "The Central Library is open **24/7** for main reading rooms, and 8 AM – 10 PM for the archive. It has 480 seats, 120 terminals, Wi-Fi 6E, and a café on the ground floor.",
      actions: [{ label: "View library", to: "/facilities/central-library" }],
    };
  }

  // Bus
  if (q.includes("bus") && (q.includes("bareilly") || q.includes("city") || q.includes("next"))) {
    return {
      text: "The **next bus to Bareilly City** departs from the Main Gate at **3:15 PM** (in 12 minutes). It stops at Civil Lines, Ayub Khan Chauraha, and the Junction. Return trip at 6:30 PM.",
      actions: [{ label: "Bus schedule", to: "/facilities" }],
    };
  }
  if (q.includes("bus")) {
    return {
      text: "Campus buses run every 30 minutes from the Main Gate bus bay. Morning routes cover Civil Lines, Rajendra Nagar, and I.V.R.I. Check the live tracker in Navigation.",
      actions: [{ label: "Open map", to: "/navigation" }],
    };
  }

  // Professors
  const profMatch = q.match(/(cs|it|ece|me|ce|pharm|mba)\s*(\d{3})/i);
  if (profMatch || q.includes("who teaches")) {
    return {
      text: "**CS 301 – Design & Analysis of Algorithms** is taught by **Dr. Anurag Sharma**, Associate Professor, CSE Department. Office: Block B, Room 214. Office hours: Mon/Wed 3–5 PM.",
      actions: [{ label: "Faculty directory", to: "/facilities" }],
    };
  }

  // Washroom
  if (q.includes("washroom") || q.includes("toilet") || q.includes("restroom") || q.includes("bathroom")) {
    return {
      text: "**Nearest washrooms from your current location (Academic Block):**\n• Ground floor, East wing — 30 sec walk\n• 1st floor, near Room 105 — 1 min walk\n• 2nd floor, West wing — 90 sec walk\n\nAll are wheelchair accessible.",
      actions: [{ label: "See on map", to: "/navigation" }],
    };
  }

  // Events
  if (q.includes("event") && (q.includes("today") || q.includes("happening"))) {
    return {
      text: "**Today's events:**\n• 10:00 AM — Guest Lecture: AI in Healthcare (Auditorium)\n• 2:00 PM — Coding Club Workshop (Computer Centre)\n• 4:30 PM — Placement Prep: Aptitude (Seminar Hall 2)\n• 6:00 PM — Cultural Rehearsal (Auditorium)",
      actions: [{ label: "Full calendar", to: "/events" }],
    };
  }
  if (q.includes("event")) {
    return {
      text: "There are **4 events today** and **12 this week**. Zest 2026 is on March 18–20. Would you like the calendar?",
      actions: [{ label: "Open events", to: "/events" }],
    };
  }

  // Cafeteria
  if (q.includes("cafeteria") || q.includes("food") || q.includes("lunch") || q.includes("eat")) {
    return {
      text: "The **Cafeteria** is currently at **71% occupancy**. Today's specials: Paneer Butter Masala, Chole Bhature, and a new Thai counter. Peak rush 12:30–2 PM. Rooftop seating is quieter.",
      actions: [{ label: "See cafeteria", to: "/facilities/student-cafeteria" }],
    };
  }

  // SOS / Emergency
  if (q.includes("emergency") || q.includes("sos") || q.includes("help") || q.includes("safety")) {
    return {
      text: "⚠️ If this is a real emergency, please use the **SOS button** in the top navigation — it alerts campus security with your live location instantly.\n\nFor non-urgent: Medical Center (Block D, ground floor), Security Post (Main Gate).",
      actions: [{ label: "Open SOS", action: "open-sos" }],
    };
  }

  // Timetable
  if (q.includes("timetable") || q.includes("class") || q.includes("schedule")) {
    return {
      text: "Your **next class is CS 302 – Operating Systems** at 2:00 PM in Room B-204 with Dr. Meera Rao. After that, DBMS Lab at 4:00 PM in Computer Centre.",
      actions: [{ label: "Today's view", to: "/dashboard" }],
    };
  }

  // Academic
  if (q.includes("attendance")) {
    return {
      text: "Your **overall attendance is 82%**. CS 301 is at 76% (needs attention — below 75% threshold). All other subjects are above 80%.",
      actions: [{ label: "Open dashboard", to: "/dashboard" }],
    };
  }

  // Facilities fallback
  if (q.includes("lab") || q.includes("facility") || q.includes("facilities")) {
    return {
      text: "You have **6 labs** on campus — AI & Robotics Lab, Chemistry Lab, Computer Science Lab A, plus 3 department labs. All show live occupancy.",
      actions: [{ label: "Browse facilities", to: "/facilities" }],
    };
  }

  if (q.includes("sports") || q.includes("gym") || q.includes("basketball")) {
    return {
      text: "The **Sports Complex** is open 6 AM – 10 PM. Basketball court is on the left of the Main Gate. Currently 32% occupied — good time to go.",
      actions: [{ label: "See sports", to: "/facilities/sports-complex" }],
    };
  }

  // Default
  return {
    text: "I can help you with campus navigation, facility details, live occupancy, class schedules, bus timings, events, and more. Try asking:\n\n• Where's the Central Library?\n• When is the next bus?\n• Who teaches CS 301?\n• Is the library crowded?",
    actions: [
      { label: "Explore facilities", to: "/facilities" },
      { label: "Open map", to: "/navigation" },
    ],
  };
}