// src/features/heatmap/data/heatmapData.js

export const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am–9pm

// Occupancy 0-100 per facility per hour
export const HEATMAP_DATA = {
  "central-library": [15, 25, 40, 55, 68, 72, 80, 88, 92, 85, 78, 70, 60, 45, 25],
  "ai-robotics-lab": [10, 20, 38, 55, 62, 58, 65, 72, 78, 82, 75, 65, 50, 35, 15],
  "chemistry-lab": [5, 15, 35, 55, 68, 62, 58, 60, 65, 70, 62, 48, 30, 15, 5],
  "sports-complex": [35, 42, 28, 22, 20, 24, 32, 38, 45, 55, 68, 78, 82, 75, 55],
  "student-cafeteria": [15, 35, 55, 45, 30, 55, 78, 92, 88, 65, 55, 68, 78, 55, 25],
  "grand-auditorium": [0, 0, 0, 0, 0, 0, 15, 25, 12, 8, 30, 55, 70, 45, 20],
  "computer-lab-a": [12, 28, 45, 62, 78, 82, 88, 85, 78, 72, 68, 55, 42, 28, 12],
  "seminar-hall-1": [8, 22, 42, 55, 62, 58, 48, 45, 55, 62, 58, 45, 30, 18, 5],
};

export const FACILITY_COLORS = {
  "central-library": "bg-blue-500",
  "ai-robotics-lab": "bg-purple-500",
  "chemistry-lab": "bg-emerald-500",
  "sports-complex": "bg-orange-500",
  "student-cafeteria": "bg-amber-500",
  "grand-auditorium": "bg-pink-500",
  "computer-lab-a": "bg-cyan-500",
  "seminar-hall-1": "bg-indigo-500",
};

export function heatColor(value) {
  if (value >= 85) return "bg-red-500";
  if (value >= 70) return "bg-orange-500";
  if (value >= 50) return "bg-amber-500";
  if (value >= 30) return "bg-yellow-500";
  if (value >= 15) return "bg-lime-500";
  if (value > 0) return "bg-green-500";
  return "bg-surface-raised";
}

export function heatLabel(value) {
  if (value >= 85) return "Packed";
  if (value >= 70) return "Very busy";
  if (value >= 50) return "Busy";
  if (value >= 30) return "Moderate";
  if (value >= 15) return "Light";
  if (value > 0) return "Empty";
  return "Closed";
}