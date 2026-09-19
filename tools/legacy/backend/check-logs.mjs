import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

const AuditLog = (await import("./src/models/AuditLog.js")).default;
const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(10).lean();

console.log("Total audit logs in DB:", await AuditLog.countDocuments({}));
console.log("");
console.log("Latest 10:");
for (const l of logs) {
  const when = new Date(l.createdAt).toLocaleTimeString();
  console.log(`  [${when}] ${l.action} - ${l.status} - ${l.userEmail || "anon"}`);
}

await mongoose.disconnect();
