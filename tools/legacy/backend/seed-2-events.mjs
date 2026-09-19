import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected");

const Event = (await import("./src/models/Event.js")).default;

const newEvents = [
  {
    title: "Hackathon 2026 — 24hr Coding Challenge",
    type: "workshop",
    date: "2026-11-22",
    time: "9:00 AM – 9:00 AM (next day)",
    venue: "Computer Centre, Block B",
    speaker: "Coding Club + IEEE Student Chapter",
    description: "24-hour hackathon open to all CS/IT/AIML students. Teams of 3-4. Themes: Campus Tech, AI for Good, FinTech. Prizes worth ₹50,000. Free food and swag for all participants.",
    seats: 200,
    registered: 0,
    tag: "NEW",
    isPaid: false,
    price: 0,
  },
  {
    title: "Rangoli & Diwali Celebration",
    type: "cultural",
    date: "2026-11-08",
    time: "4:00 PM – 9:00 PM",
    venue: "Main Ground",
    speaker: "Cultural Committee",
    description: "Celebrate Diwali with the SRMS family. Rangoli competition, diya decoration, live music, and traditional sweets. Entry free for all students. Bring your best designs!",
    seats: 500,
    registered: 0,
    tag: "FESTIVAL",
    isPaid: false,
    price: 0,
  },
];

for (const ev of newEvents) {
  const exists = await Event.findOne({ title: ev.title });
  if (exists) {
    console.log("⏭  Already exists:", ev.title);
  } else {
    const doc = await Event.create(ev);
    console.log("✅ Created:", doc.title, "| ID:", doc._id);
  }
}

const total = await Event.countDocuments({ isActive: true });
console.log("");
console.log("Total events in DB:", total);

await mongoose.disconnect();
