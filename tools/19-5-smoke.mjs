const BASE = "http://localhost:5000/api";

async function login(email, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await r.json();
  const cookies = (r.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
  return { body, cookies };
}

function H(c, extra = {}) {
  return { "Content-Type": "application/json", Cookie: c, ...extra };
}

const results = [];
function check(n, ok, d = "") {
  results.push(ok);
  console.log(`  ${ok ? "[PASS]" : "[FAIL]"} ${n}${d ? "  --  " + d : ""}`);
}

console.log("");
console.log("PHASE 19.5 SMOKE - Exam visibility flags");
console.log("");

const admin = await login("vinay@srms.ac.in", "password123");
check("admin login", admin.body.success === true && !!admin.cookies, `status=${admin.body.success}`);
if (!admin.cookies) process.exit(1);

// Hidden exam
const createRes = await fetch(`${BASE}/exams`, {
  method: "POST",
  headers: H(admin.cookies),
  body: JSON.stringify({
    title: "19.5 TEST Hidden Exam",
    courseCode: "CS888",
    courseName: "Test Hidden",
    examType: "class-test",
    date: "2027-02-01",
    startTime: "10:00",
    durationMinutes: 60,
    room: "T-1",
    department: "CSE",
    semester: "5",
    section: "A",
    maxMarks: 20,
    passingMarks: 8,
    showToStudents: false,
    countsTowardTotal: false,
  }),
});
const createBody = await createRes.json();
check("create exam", createRes.status === 201 && createBody.success === true, createBody.message || "");
const exam = createBody.data?.exam;
check("showToStudents=false saved", exam?.showToStudents === false, `got ${exam?.showToStudents}`);
check("countsTowardTotal=false saved", exam?.countsTowardTotal === false, `got ${exam?.countsTowardTotal}`);
const examId = exam?._id;

// Visible exam (defaults)
const create2Res = await fetch(`${BASE}/exams`, {
  method: "POST",
  headers: H(admin.cookies),
  body: JSON.stringify({
    title: "19.5 TEST Visible Exam",
    courseCode: "CS889",
    courseName: "Test Visible",
    examType: "mid-sem",
    date: "2027-02-15",
    startTime: "10:00",
    durationMinutes: 120,
    room: "T-2",
    department: "CSE",
    semester: "5",
    section: "A",
    maxMarks: 100,
    passingMarks: 40,
  }),
});
const create2Body = await create2Res.json();
const exam2 = create2Body.data?.exam;
check("visible exam created", create2Res.status === 201, create2Body.message || "");
check("default showToStudents=true", exam2?.showToStudents === true, `got ${exam2?.showToStudents}`);
check("default countsTowardTotal=true", exam2?.countsTowardTotal === true, `got ${exam2?.countsTowardTotal}`);
const examId2 = exam2?._id;

// Cleanup
if (examId) await fetch(`${BASE}/exams/${examId}`, { method: "DELETE", headers: H(admin.cookies) });
if (examId2) await fetch(`${BASE}/exams/${examId2}`, { method: "DELETE", headers: H(admin.cookies) });

const passed = results.filter(Boolean).length;
console.log("");
console.log(`=== ${passed}/${results.length} checks passed ===`);
console.log("");
process.exit(passed === results.length ? 0 : 1);