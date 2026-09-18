// src/features/facilities/data/facilities.js

export const FACILITY_TYPES = [
  { id: "all", label: "All", icon: "LayoutGrid" },
  { id: "lab", label: "Labs", icon: "FlaskConical" },
  { id: "library", label: "Library", icon: "BookOpen" },
  { id: "classroom", label: "Classrooms", icon: "GraduationCap" },
  { id: "sports", label: "Sports", icon: "Dumbbell" },
  { id: "cafeteria", label: "Cafeteria", icon: "UtensilsCrossed" },
  { id: "auditorium", label: "Auditorium", icon: "Mic2" },
];

export const FACILITIES = [
  {
    id: "central-library",
    code: "LIB_01",
    name: "Central Library",
    type: "library",
    tagline: "Four floors of silence, study, and stack access",
    description:
      "The heart of academic life. 4 floors of study zones, a rare-books archive, 24/7 reading rooms, and digital terminals on every level. Silent zones enforced on floors 3–4.",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80&auto=format&fit=crop",
    ],
    specs: {
      seats: 480,
      systems: 120,
      floors: 4,
      area: "42,000 sq ft",
      hours: "24/7",
    },
    amenities: [
      "Wi-Fi 6E",
      "Silent Zones",
      "Group Study Rooms",
      "Digital Terminals",
      "Print/Scan Station",
      "Café",
      "Accessible Entry",
      "Book Drop",
    ],
    live: {
      occupancy: 68,
      seatsAvailable: 154,
      systemsAvailable: 47,
      status: "open",
    },
    location: { building: "Block A", floor: "G–3", x: 22, y: 30 },
  },
  {
    id: "ai-robotics-lab",
    code: "LAB_AI_02",
    name: "AI & Robotics Lab",
    type: "lab",
    tagline: "GPU workstations, robotic arms, and a 3D print farm",
    description:
      "Advanced computing and robotics research. 40 RTX workstations, 6 robotic arms, a drone test area, and a 24/7 3D printing bay. Open to CS, EE, and Mechatronics students with faculty approval.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=1600&q=80&auto=format&fit=crop",
    ],
    specs: {
      seats: 60,
      systems: 40,
      floors: 1,
      area: "6,400 sq ft",
      hours: "8am–11pm",
    },
    amenities: [
      "RTX Workstations",
      "Robotic Arms",
      "3D Print Farm",
      "VR Headsets",
      "Drone Cage",
      "Wi-Fi 6E",
      "Tech Support",
      "Secure Storage",
    ],
    live: {
      occupancy: 42,
      seatsAvailable: 35,
      systemsAvailable: 23,
      status: "open",
    },
    location: { building: "Block B", floor: "2", x: 55, y: 24 },
  },
  {
    id: "chemistry-lab",
    code: "LAB_CH_03",
    name: "Chemistry Lab",
    type: "lab",
    tagline: "Analytical, organic, and inorganic wings",
    description:
      "Fully equipped wet lab with fume hoods, spectrometers, and designated zones for organic, inorganic, and analytical chemistry. Safety-certified personnel on-site during hours.",
    image:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1600&q=80&auto=format&fit=crop",
    ],
    specs: {
      seats: 40,
      systems: 8,
      floors: 1,
      area: "4,800 sq ft",
      hours: "9am–6pm",
    },
    amenities: [
      "Fume Hoods",
      "Spectrometers",
      "Centrifuges",
      "Safety Showers",
      "Chemical Storage",
      "Emergency Eyewash",
      "PPE Provided",
    ],
    live: {
      occupancy: 55,
      seatsAvailable: 18,
      systemsAvailable: 4,
      status: "open",
    },
    location: { building: "Block C", floor: "1", x: 78, y: 22 },
  },
  {
    id: "sports-complex",
    code: "SPT_04",
    name: "Sports Complex",
    type: "sports",
    tagline: "Indoor courts, Olympic pool, and gym",
    description:
      "Two basketball courts, four badminton courts, an Olympic-length pool, and a full gym with cardio and strength zones. Coaching staff available on weekday evenings.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&q=80&auto=format&fit=crop",
    ],
    specs: {
      seats: 200,
      systems: 0,
      floors: 2,
      area: "22,000 sq ft",
      hours: "6am–10pm",
    },
    amenities: [
      "Olympic Pool",
      "Gym Equipment",
      "Locker Rooms",
      "Showers",
      "First Aid",
      "Coaching Staff",
      "Equipment Rental",
    ],
    live: {
      occupancy: 32,
      seatsAvailable: 136,
      systemsAvailable: 0,
      status: "open",
    },
    location: { building: "Block D", floor: "G–1", x: 20, y: 76 },
  },
  {
    id: "student-cafeteria",
    code: "CAF_05",
    name: "Student Cafeteria",
    type: "cafeteria",
    tagline: "Multi-cuisine food court with 12 counters",
    description:
      "Multi-cuisine food court serving Indian, Continental, and Asian dishes. 12 counters, digital ordering kiosks, and a rooftop seating area. Cashless payments only.",
    image:
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1600&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1600&q=80&auto=format&fit=crop",
    ],
    specs: {
      seats: 320,
      systems: 0,
      floors: 2,
      area: "12,000 sq ft",
      hours: "7am–10pm",
    },
    amenities: [
      "12 Counters",
      "Digital Ordering",
      "Rooftop Seating",
      "Vegan Options",
      "Halal Section",
      "Cashless Payment",
      "Water Station",
    ],
    live: {
      occupancy: 71,
      seatsAvailable: 93,
      systemsAvailable: 0,
      status: "busy",
    },
    location: { building: "Block E", floor: "1", x: 68, y: 72 },
  },
  {
    id: "grand-auditorium",
    code: "AUD_06",
    name: "Grand Auditorium",
    type: "auditorium",
    tagline: "1,200-seat acoustically treated hall",
    description:
      "The primary venue for convocation, conferences, and cultural events. Full A/V rig, live streaming setup, and green room. Advance booking required for external events.",
    image:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1600&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1600&q=80&auto=format&fit=crop",
    ],
    specs: {
      seats: 1200,
      systems: 30,
      floors: 1,
      area: "18,000 sq ft",
      hours: "Event-based",
    },
    amenities: [
      "Full A/V Rig",
      "Live Streaming",
      "Green Room",
      "Stage Lighting",
      "Wheelchair Access",
      "Simultaneous Translation",
    ],
    live: {
      occupancy: 0,
      seatsAvailable: 1200,
      systemsAvailable: 30,
      status: "closed",
    },
    location: { building: "Block F", floor: "G", x: 50, y: 45 },
  },
  {
    id: "computer-lab-a",
    code: "LAB_CS_07",
    name: "Computer Science Lab A",
    type: "lab",
    tagline: "200-seat programming lab with dual monitors",
    description:
      "Primary CS lab for programming, algorithms, and DSA courses. Every seat has a dual-monitor workstation with access to the campus GPU cluster.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=1600&q=80&auto=format&fit=crop",
    ],
    specs: {
      seats: 200,
      systems: 200,
      floors: 1,
      area: "8,500 sq ft",
      hours: "8am–9pm",
    },
    amenities: [
      "Dual Monitors",
      "GPU Cluster Access",
      "IDEA Software",
      "Wi-Fi 6E",
      "Print Station",
      "TA Support",
    ],
    live: {
      occupancy: 61,
      seatsAvailable: 78,
      systemsAvailable: 78,
      status: "open",
    },
    location: { building: "Block B", floor: "1", x: 40, y: 60 },
  },
  {
    id: "seminar-hall-1",
    code: "CLS_08",
    name: "Seminar Hall 1",
    type: "classroom",
    tagline: "80-seat smart classroom with hybrid setup",
    description:
      'Smart classroom with 85" interactive display, ceiling mic array, and hybrid conferencing. Ideal for seminars, guest lectures, and small cohorts.',
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&q=80&auto=format&fit=crop",
    ],
    specs: {
      seats: 80,
      systems: 4,
      floors: 1,
      area: "2,200 sq ft",
      hours: "8am–8pm",
    },
    amenities: [
      "Interactive Display",
      "Hybrid Conferencing",
      "Ceiling Mics",
      "Recording Setup",
      "Wi-Fi 6E",
      "Air Conditioning",
    ],
    live: {
      occupancy: 0,
      seatsAvailable: 80,
      systemsAvailable: 4,
      status: "available",
    },
    location: { building: "Block A", floor: "2", x: 30, y: 55 },
  },
];

export function getFacilityById(id) {
  return FACILITIES.find((f) => f.id === id) || null;
}

export function getFacilitiesByType(type) {
  if (!type || type === "all") return FACILITIES;
  return FACILITIES.filter((f) => f.type === type);
}

export function searchFacilities(query) {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return FACILITIES;
  return FACILITIES.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.code.toLowerCase().includes(q) ||
      f.tagline.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q)
  );
}