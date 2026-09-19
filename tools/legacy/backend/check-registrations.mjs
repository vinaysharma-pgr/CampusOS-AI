import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import Event from "./src/models/Event.js";
import EventRegistration from "./src/models/EventRegistration.js";

await mongoose.connect(env.mongoUri);

const evt = await Event.findOne({ isPaid: true }).sort({ createdAt: -1 }).lean();
if (!evt) {
  console.log("No paid event found — create one first.");
} else {
  console.log("Event:", evt.title);
  console.log("  registered count:", evt.registered);
  console.log("  seats:", evt.seats);
}

const regs = await EventRegistration.find({ paymentStatus: "paid" })
  .sort({ createdAt: -1 }).limit(5).lean();
console.log("");
console.log("Paid registrations (last 5):");
for (const r of regs) {
  console.log("  -", r.eventTitle || "?", "| user:", r.userEmail, "| status:", r.paymentStatus, "| amount:", r.amountPaid);
}

await mongoose.disconnect();
