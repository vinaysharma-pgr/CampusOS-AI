import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected");

const Group = (await import("./src/models/Group.js")).default;

const SEED_GROUPS = [
  { code: "CS1", label: "CS1", department: "CS", year: 2, semester: "5", section: "CS1" },
  { code: "CS2", label: "CS2", department: "CS", year: 2, semester: "5", section: "CS2" },
];

for (const g of SEED_GROUPS) {
  const exists = await Group.findOne({ code: g.code });
  if (!exists) {
    await Group.create(g);
    console.log("  + " + g.code + " -> " + g.label);
  } else {
    console.log("  = " + g.code + " already exists");
  }
}

const total = await Group.countDocuments({ isActive: true });
console.log("");
console.log("Groups in DB: " + total);
await mongoose.disconnect();
