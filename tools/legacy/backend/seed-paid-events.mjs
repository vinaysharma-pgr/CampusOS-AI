import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected");

const Event = (await import("./src/models/Event.js")).default;

const paidEvents = [
  {
    title: "Tech Summit 2026 — Full Day Pass",
    type: "academic",
    date: "2026-12-05",
    time: "9:00 AM – 6:00 PM",
    venue: "Grand Auditorium",
    speaker: "Industry Keynotes + Panel",
    description: "A full day of talks from Google, Microsoft, and TCS engineers. Lunch included. Certificate on completion. Limited to 300 seats.",
    seats: 300,
    registered: 0,
    tag: "PAID",
    isPaid: true,
    price: 499,
    currency: "INR",
  },
  {
    title: "Zest 2026 — Premium Concert Pass",
    type: "cultural",
    date: "2026-12-20",
    time: "7:00 PM – 11:00 PM",
    venue: "Main Ground",
    speaker: "Live Band + DJ Night",
    description: "Premium front-row access to Zest's closing concert. Includes one complimentary drink coupon and priority entry.",
    seats: 150,
    registered: 0,
    tag: "FEATURED",
    isPaid: true,
    price: 299,
    currency: "INR",
  },
];

for (const ev of paidEvents) {
  const exists = await Event.findOne({ title: ev.title });
  if (exists) {
    console.log("⏭  Already exists:", ev.title, "| isPaid:", exists.isPaid, "| price:", exists.price);
  } else {
    const doc = await Event.create(ev);
    console.log("✅ Created:", doc.title, "| ₹" + doc.price, "| ID:", doc._id);
  }
}

const total = await Event.countDocuments({ isActive: true });
console.log("");
console.log("Total events:", total);
console.log("Paid events:", await Event.countDocuments({ isActive: true, isPaid: true }));

await mongoose.disconnect();
