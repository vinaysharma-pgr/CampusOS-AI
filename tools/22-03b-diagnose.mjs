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

console.log("");
console.log("=== DIAGNOSTIC ===");
console.log("");

const admin = await login("vinay@srms.ac.in", "password123");
console.log("admin cookies:", admin.cookies ? "present" : "MISSING");

// Create notice
const createRes = await fetch(`${BASE}/notices`, {
  method: "POST", headers: H(admin.cookies),
  body: JSON.stringify({
    title: "DIAG Test Notice",
    body: "Diagnostic",
    category: "General", priority: "normal", targetAudience: "all",
  }),
});
const createBody = await createRes.json();
const noticeId = createBody.data?.notice?._id;
console.log("noticeId:", noticeId);
console.log("noticeId type:", typeof noticeId);
console.log("looks like ObjectId:", /^[0-9a-f]{24}$/.test(String(noticeId)));
console.log("");

// Mark read -- log full response
console.log("POST /notices/:id/read ...");
const markRes = await fetch(`${BASE}/notices/${noticeId}/read`, {
  method: "POST", headers: H(admin.cookies),
});
const markBody = await markRes.json();
console.log("  status:", markRes.status);
console.log("  body:", JSON.stringify(markBody, null, 2));
console.log("");

// List -- log the specific notice's read fields
console.log("GET /notices ...");
const listRes = await fetch(`${BASE}/notices`, { headers: H(admin.cookies) });
const listBody = await listRes.json();
const found = (listBody.data?.notices || []).find((n) => String(n._id) === String(noticeId));
console.log("  notice found:", !!found);
if (found) {
  console.log("  isReadByMe:", found.isReadByMe);
  console.log("  readCount:", found.readCount);
}
console.log("");

// Check via direct Mongo (bypass API)
console.log("Direct NoticeRead query via mongoose ...");
try {
  const { default: NoticeRead } = await import("../backend/src/models/NoticeRead.js");
  const { default: mongoose } = await import("mongoose");
  const { env } = await import("../backend/src/config/env.js");
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
  const rows = await NoticeRead.find({ noticeId }).lean();
  console.log("  rows in DB for this noticeId:", rows.length);
  if (rows.length) console.log("  sample:", JSON.stringify(rows[0], null, 2));
  await mongoose.disconnect();
} catch (err) {
  console.log("  DB check failed:", err.message);
}

// Cleanup
await fetch(`${BASE}/notices/${noticeId}`, { method: "DELETE", headers: H(admin.cookies) });

console.log("");
console.log("=== END ===");