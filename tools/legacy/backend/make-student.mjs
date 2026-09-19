const API = "http://localhost:5000/api";
const ts = Date.now();
const r = await fetch(API + "/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Student CS1 Demo",
    email: "student" + ts + "@test.com",
    password: "password123",
    role: "student",
    department: "CS",
    semester: "5",
    section: "CS1",
  }),
}).then(x => x.json());

if (!r.success) {
  console.log("❌ Failed:", r.message);
  process.exit(1);
}

console.log("✅ Student created");
console.log("");
console.log("  Email:    " + r.data.user.email);
console.log("  Password: password123");
console.log("  Role:     " + r.data.user.role);
console.log("  Section:  " + r.data.user.section + " / Sem " + r.data.user.semester);
console.log("");
console.log("Use these to log in at http://localhost:5173/login");
