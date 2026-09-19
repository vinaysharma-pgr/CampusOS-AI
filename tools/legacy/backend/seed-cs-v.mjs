import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected");

const Timetable = (await import("./src/models/Timetable.js")).default;

const M_TUE_WED_FRI = [
  ["08:30","09:30"],["09:30","10:30"],["10:50","11:50"],
  ["11:50","12:50"],["14:00","15:00"],["15:00","16:00"],["16:00","17:00"]
];

function cls(day, s, e, code, name, room, fac, type) {
  return { dayOfWeek: day, startTime: s, endTime: e, courseCode: code, courseName: name, room, facultyName: fac, type: type || "lecture" };
}

const CS1_CLASSES = [
  // MONDAY
  cls("Monday", "08:30","09:30","CS1","Machine Learning Techniques","303","SB"),
  cls("Monday", "09:30","10:30","CS1","Design & Analysis of Algorithms","303","SB"),
  cls("Monday", "10:50","11:50","CS3","Database Management Systems","303","AGC"),
  cls("Monday", "11:50","12:50","CS3","DBMS Lab / Web Tech Lab (rotating)","Lab-A","AGC","lab"),
  cls("Monday", "14:00","15:00","CS2","Web Technologies","303","MO"),
  cls("Monday", "15:00","16:00","CS3","DBMS Lab (contd)","Lab-A","AGC","lab"),
  cls("Monday", "16:00","17:00","ZERO","Zero Hour / Library","Library","","lecture"),

  // TUESDAY
  cls("Tuesday", "08:30","09:30","CS2","Web Technologies","303","MO"),
  cls("Tuesday", "09:30","10:30","CS1","Machine Learning","303","AN"),
  cls("Tuesday", "10:50","11:50","CS3","DBMS","303","PKS"),
  cls("Tuesday", "11:50","12:50","CS3","DBMS Lab / WT Lab (rotating)","Lab-A","PKS","lab"),
  cls("Tuesday", "14:00","15:00","CS1","DAA","303","RFK"),
  cls("Tuesday", "15:00","16:00","CS4","Constitution of India","303","AK"),
  cls("Tuesday", "16:00","17:00","CS4","COI Lab","Lab-B","AK","lab"),

  // WEDNESDAY
  cls("Wednesday", "08:30","09:30","CS1","DAA","303","RFK"),
  cls("Wednesday", "09:30","10:30","CS3","DBMS","303","PKS"),
  cls("Wednesday", "10:50","11:50","CS4","Constitution of India","303","AK"),
  cls("Wednesday", "11:50","12:50","CS3","DBMS Lab / WT Lab (rotating)","Lab-A","PKS","lab"),
  cls("Wednesday", "14:00","15:00","CS2","Web Tech Lab","Lab-B","AN","lab"),
  cls("Wednesday", "15:00","16:00","CS5","Soft Skills","303","KP"),
  cls("Wednesday", "16:00","17:00","CS5","Soft Skills (contd)","303","KP"),

  // THURSDAY
  cls("Thursday", "08:30","09:20","CS4","Constitution of India","303","AK"),
  cls("Thursday", "09:20","10:10","CS3","DBMS","303","PKS"),
  cls("Thursday", "10:30","11:20","CS1","DAA","303","RFK"),
  cls("Thursday", "11:20","12:10","CS1","DAA Lab / DBMS Lab","Lab-A","RFK","lab"),
  cls("Thursday", "12:10","13:00","CS2","Web Tech Lab","Lab-B","AK","lab"),
  cls("Thursday", "14:00","14:50","CS6","Mini Project","Lab","SHM","lab"),
  cls("Thursday", "14:50","15:40","CS6","Aptitude","303","YY","tutorial"),
  cls("Thursday", "15:40","16:30","ZERO","Library / Self Study","Library","","lecture"),

  // FRIDAY
  cls("Friday", "08:30","09:30","CS2","Web Technologies","303","MO"),
  cls("Friday", "09:30","10:30","CS1","Machine Learning","303","AN"),
  cls("Friday", "10:50","11:50","CS3","DBMS","303","AGC"),
  cls("Friday", "11:50","12:50","CS1","DAA","303","RFK"),
  cls("Friday", "14:00","15:00","CS2","Web Tech Lab","Lab-B","MO","lab"),
  cls("Friday", "15:00","16:00","CS5","Soft Skills","303","KP"),
  cls("Friday", "16:00","17:00","ZERO","Zero Hour / Sports","Sports","","lecture"),
];

// Sanity check - no empty courseCode/room anywhere
const bad = CS1_CLASSES.filter(c => !c.courseCode || !c.room);
if (bad.length) {
  console.error("Found " + bad.length + " classes with empty code/room:");
  bad.forEach((c, i) => console.error("  " + i + ":", JSON.stringify(c)));
  process.exit(1);
}

await Timetable.deleteMany({ department: "CS" });
console.log("Deleted old CS timetables");

await Timetable.create({
  department: "CS",
  semester: "5",
  section: "CS1",
  academicYear: "2025-26",
  effectiveFrom: "2026-08-13",
  classes: CS1_CLASSES,
  isActive: true,
});
console.log("Created CS-V / Section CS1 with " + CS1_CLASSES.length + " classes");

const CS2_CLASSES = CS1_CLASSES.map(c => ({
  ...c,
  room: c.room === "303" ? "304" : c.room,
  facultyName: c.facultyName === "SB" ? "SJA" : c.facultyName === "MO" ? "NP" : c.facultyName,
}));

await Timetable.create({
  department: "CS",
  semester: "5",
  section: "CS2",
  academicYear: "2025-26",
  effectiveFrom: "2026-08-13",
  classes: CS2_CLASSES,
  isActive: true,
});
console.log("Created CS-V / Section CS2 with " + CS2_CLASSES.length + " classes");

console.log("\n=== DONE ===");
await mongoose.disconnect();
