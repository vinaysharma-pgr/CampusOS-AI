import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected");

const User = (await import("./src/models/User.js")).default;

const users = await User.find({}).select("+password");
console.log(`\nFound ${users.length} users in DB:`);
for (const u of users) {
  console.log(`  ${u.email}  role=${u.role}  active=${u.isActive}  hasPassword=${!!u.password}  hashPrefix=${u.password?.slice(0, 7)}`);
}

// Ensure admin exists with password123
let admin = await User.findOne({ email: "vinay@srms.ac.in" }).select("+password");

if (!admin) {
  console.log("\n❌ Admin user not found — creating…");
  admin = new User({
    name: "Vinay Sharma",
    email: "vinay@srms.ac.in",
    password: "password123",  // will be hashed by pre-save hook
    role: "admin",
    organization: "SRMS CET Bareilly",
    department: "CSE",
  });
  await admin.save();
  console.log("✅ Admin created");
} else {
  console.log("\n✅ Admin exists — resetting password to 'password123'…");
  admin.password = "password123";  // pre-save will hash
  await admin.save();
  console.log("✅ Password reset");
}

await mongoose.disconnect();
process.exit(0);
