const API = "http://localhost:5000/api";

const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "sb@srms.ac.in", password: "faculty123" }),
}).then(r => r.json());

const token = login.data.token;
const auth = { Authorization: "Bearer " + token };

// 1. Groups
const groups = await fetch(API + "/groups", { headers: auth }).then(r => r.json());
console.log("Groups:", groups.data.count);
console.log(groups.data.groups.map(g => g.code + " - " + g.department + " Y" + g.year).join(", "));

// 2. Create assignment
const a = await fetch(API + "/assignments", {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Test Assignment 1",
    description: "Solve problems 1-10 from chapter 3.",
    dueDate: "2026-09-25",
    type: "assignment",
    groupCode: "CS1",
    department: "CS",
    year: 2,
    semester: "5",
    section: "CS1",
    courseCode: "CS1",
    courseName: "Machine Learning",
  }),
}).then(r => r.json());
console.log("\nAssignment created:", a.success, a.data?.assignment?.title);

// 3. List assignments
const list = await fetch(API + "/assignments", { headers: auth }).then(r => r.json());
console.log("Assignments total:", list.data.count);

// 4. Create HOD submission
const h = await fetch(API + "/hod-submissions", {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Mid-sem Exam Paper - MLT",
    description: "Please review before final print.",
    type: "exam_paper",
    imageUrl: "http://localhost:5000/uploads/test.png",
  }),
}).then(r => r.json());
console.log("HOD submission:", h.success, h.data?.submission?.title);

// 5. Admin login + inbox
const adminLogin = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
}).then(r => r.json());

if (adminLogin.success) {
  const inbox = await fetch(API + "/hod-submissions", {
    headers: { Authorization: "Bearer " + adminLogin.data.token },
  }).then(r => r.json());
  console.log("Admin inbox count:", inbox.data.count);
} else {
  console.log("Admin login failed:", adminLogin.message);
}
