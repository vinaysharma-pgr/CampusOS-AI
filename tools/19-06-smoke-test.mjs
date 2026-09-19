const BASE = "http://localhost:5000/api";

async function login(email, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await r.json();
  const setCookies = r.headers.getSetCookie?.() || [];
  const cookies = setCookies.map((c) => c.split(";")[0]).join("; ");
  return { status: r.status, body, cookies };
}

function H(cookies, extra = {}) {
  return { "Content-Type": "application/json", Cookie: cookies, ...extra };
}

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`  ${ok ? "[PASS]" : "[FAIL]"} ${name}${detail ? "  --  " + detail : ""}`);
}

console.log("");
console.log("PHASE 19 SMOKE TEST");
console.log("");

// 1. Admin login
const admin = await login("vinay@srms.ac.in", "password123");
check("admin login", admin.body.success === true && !!admin.cookies, `status=${admin.status}`);
if (!admin.cookies) {
  console.error("\nNo admin cookie -- cannot continue.");
  process.exit(1);
}

// 2. Create exam
const createRes = await fetch(`${BASE}/exams`, {
  method: "POST",
  headers: H(admin.cookies),
  body: JSON.stringify({
    title: "SMOKE-TEST Mid-Sem CS999",
    courseCode: "CS999",
    courseName: "Smoke Test Course",
    examType: "mid-sem",
    date: "2027-01-15",
    startTime: "10:00",
    durationMinutes: 120,
    room: "TEST-101",
    department: "CSE",
    semester: "5",
    section: "A",
    maxMarks: 100,
    passingMarks: 40,
  }),
});
const createBody = await createRes.json();
check("create exam", createRes.status === 201 && createBody.success === true, createBody.message || "");
const examId = createBody.data?.exam?._id;
if (!examId) { console.error("No examId -- stopping."); process.exit(1); }

// 3. List exams
const listRes = await fetch(`${BASE}/exams`, { headers: H(admin.cookies) });
const listBody = await listRes.json();
const found = (listBody.data?.exams || []).find((e) => e._id === examId);
check("list exams contains new exam", !!found);

// 4. Get exam by ID
const getRes = await fetch(`${BASE}/exams/${examId}`, { headers: H(admin.cookies) });
const getBody = await getRes.json();
check("get exam by id", getRes.status === 200 && getBody.data?.exam?._id === examId);

// 5. Upcoming
const upRes = await fetch(`${BASE}/exams/upcoming`, { headers: H(admin.cookies) });
const upBody = await upRes.json();
check("upcoming exams endpoint", upRes.status === 200 && upBody.success === true);

// 6. List results for exam (faculty/admin)
const rlRes = await fetch(`${BASE}/exam-results/exam/${examId}`, { headers: H(admin.cookies) });
const rlBody = await rlRes.json();
check("list results for exam", rlRes.status === 200 && rlBody.success === true,
  `students=${rlBody.data?.students?.length ?? "?"}`);

// 7. Bulk save (admin acting as faculty)
const bulkRes = await fetch(`${BASE}/exam-results/exam/${examId}/bulk`, {
  method: "POST",
  headers: H(admin.cookies),
  body: JSON.stringify({ results: [] }),
});
const bulkBody = await bulkRes.json();
// We expect 400 because results is empty. That's a valid "rejects bad input" check.
check("bulk rejects empty results", bulkRes.status === 400, bulkBody.message || "");

// 8. Publish
const pubRes = await fetch(`${BASE}/exam-results/exam/${examId}/publish`, {
  method: "PUT",
  headers: H(admin.cookies),
  body: JSON.stringify({ publish: true }),
});
const pubBody = await pubRes.json();
check("publish exam", pubRes.status === 200 && pubBody.success === true, `status=${pubRes.status} body=${JSON.stringify(pubBody).slice(0,200)}`);

// 9. Stats
const stRes = await fetch(`${BASE}/exam-results/exam/${examId}/stats`, { headers: H(admin.cookies) });
const stBody = await stRes.json();
check("exam stats", stRes.status === 200 && stBody.success === true);

// 10. My results (admin will get empty -- that's fine)
const myRes = await fetch(`${BASE}/exam-results/mine`, { headers: H(admin.cookies) });
const myBody = await myRes.json();
check("my results endpoint", myRes.status === 200 && myBody.success === true);

// 11. Cleanup -- delete exam
const delRes = await fetch(`${BASE}/exams/${examId}`, {
  method: "DELETE",
  headers: H(admin.cookies),
});
const delBody = await delRes.json();
check("delete exam (cleanup)", delRes.status === 200 && delBody.success === true);

// Summary
const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log("");
console.log(`=== ${passed}/${total} checks passed ===`);
console.log("");
process.exit(passed === total ? 0 : 1);