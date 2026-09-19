const API = "http://localhost:5000/api";

const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
});
const setCookie = login.headers.get("set-cookie");
const cookie = setCookie.split(";")[0];
console.log("Logged in");

const test1 = await fetch(API + "/timetables/check-clash", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({
    department: "CS",
    semester: "5",
    section: "CS1",
    academicYear: "2025-26",
    classes: [
      { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00", courseCode: "CS1", courseName: "ML", room: "303", facultyName: "SB", type: "lecture" },
      { dayOfWeek: "Monday", startTime: "09:30", endTime: "10:30", courseCode: "CS2", courseName: "DAA", room: "304", facultyName: "SB", type: "lecture" },
    ],
  }),
}).then(r => r.json());

console.log("");
console.log("Test 1 - Same faculty, overlapping time:");
console.log("  Clashes found:", test1.data?.clashes?.length || 0);
test1.data?.clashes?.forEach(c => console.log("    -", c.message));

const test2 = await fetch(API + "/timetables/check-clash", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({
    department: "CS",
    semester: "5",
    section: "CS1",
    academicYear: "2025-26",
    classes: [
      { dayOfWeek: "Monday", startTime: "11:00", endTime: "12:00", courseCode: "CS1", courseName: "ML", room: "303", facultyName: "SB", type: "lecture" },
      { dayOfWeek: "Monday", startTime: "11:15", endTime: "12:15", courseCode: "CS3", courseName: "DBMS", room: "303", facultyName: "AGC", type: "lecture" },
    ],
  }),
}).then(r => r.json());

console.log("");
console.log("Test 2 - Same room, overlapping time:");
console.log("  Clashes found:", test2.data?.clashes?.length || 0);
test2.data?.clashes?.forEach(c => console.log("    -", c.message));

const test3 = await fetch(API + "/timetables/check-clash", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({
    department: "CS",
    semester: "5",
    section: "CS1",
    academicYear: "2025-26",
    classes: [
      { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00", courseCode: "CS1", courseName: "ML", room: "999", facultyName: "ZZ_UNIQUE", type: "lecture" },
      { dayOfWeek: "Monday", startTime: "10:30", endTime: "11:30", courseCode: "CS2", courseName: "DAA", room: "998", facultyName: "YY_UNIQUE", type: "lecture" },
    ],
  }),
}).then(r => r.json());

console.log("");
console.log("Test 3 - No clashes:");
console.log("  Clashes found:", test3.data?.clashes?.length || 0);
