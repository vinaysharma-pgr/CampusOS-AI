const BASE = "http://localhost:5000/api";
async function login(email, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await r.json();
  const cookies = (r.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
  return { body, cookies };
}
function H(c, extra = {}) { return { "Content-Type": "application/json", Cookie: c, ...extra }; }
const results = [];
function check(n, ok, d = "") { results.push(ok); console.log(`  ${ok ? "[PASS]" : "[FAIL]"} ${n}${d ? "  --  " + d : ""}`); }

console.log("");
console.log("PHASE 22 SMOKE - Notice read tracking");
console.log("");

const admin = await login("vinay@srms.ac.in", "password123");
check("admin login", admin.body.success === true && !!admin.cookies);
if (!admin.cookies) process.exit(1);

const createRes = await fetch(`${BASE}/notices`, {
  method: "POST", headers: H(admin.cookies),
  body: JSON.stringify({
    title: "22 TEST Notice",
    body: "Test body for read tracking",
    category: "General", priority: "normal", targetAudience: "all",
  }),
});
const createBody = await createRes.json();
check("create notice", createRes.status === 201 && createBody.success === true, createBody.message || "");
const noticeId = createBody.data?.notice?._id;

const listRes = await fetch(`${BASE}/notices`, { headers: H(admin.cookies) });
const listBody = await listRes.json();
const found = (listBody.data?.notices || []).find((n) => n._id === noticeId);
check("list returns notice", !!found);
check("isReadByMe=false initially", found?.isReadByMe === false, `got ${found?.isReadByMe}`);
check("readCount is defined", typeof found?.readCount === "number", `got ${found?.readCount}`);

const markRes = await fetch(`${BASE}/notices/${noticeId}/read`, {
  method: "POST", headers: H(admin.cookies),
});
check("POST /read returns 200", markRes.status === 200);

const list2Res = await fetch(`${BASE}/notices`, { headers: H(admin.cookies) });
const list2Body = await list2Res.json();
const found2 = (list2Body.data?.notices || []).find((n) => n._id === noticeId);
check("isReadByMe=true after marking", found2?.isReadByMe === true, `got ${found2?.isReadByMe}`);
check("readCount incremented", found2?.readCount >= 1, `got ${found2?.readCount}`);

await fetch(`${BASE}/notices/${noticeId}`, { method: "DELETE", headers: H(admin.cookies) });

const passed = results.filter(Boolean).length;
console.log("");
console.log(`=== ${passed}/${results.length} checks passed ===`);
console.log("");
process.exit(passed === results.length ? 0 : 1);