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
console.log("PHASE 20 SMOKE TEST - Study Material Hub");
console.log("");

// 1. Admin login (also acts as faculty for this test)
const admin = await login("vinay@srms.ac.in", "password123");
check("admin login", admin.body.success === true && !!admin.cookies, `status=${admin.status}`);
if (!admin.cookies) { console.error("No cookie - stop"); process.exit(1); }

// 2. Upload a doc
const pdfBytes = new Uint8Array([
  0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xC3, 0xA4, 0xC3,
  0xB6, 0xC3, 0xBC, 0xC3, 0x9F, 0x0A, 0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A,
  0x0A, 0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x43, 0x61, 0x74, 0x61,
  0x6C, 0x6F, 0x67, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30,
  0x20, 0x52, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x32,
  0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70,
  0x65, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x2F, 0x4B, 0x69, 0x64, 0x73, 0x5B,
  0x5D, 0x2F, 0x43, 0x6F, 0x75, 0x6E, 0x74, 0x20, 0x30, 0x3E, 0x3E, 0x0A, 0x65,
  0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72,
  0x0A, 0x3C, 0x3C, 0x2F, 0x52, 0x6F, 0x6F, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20,
  0x52, 0x3E, 0x3E, 0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46
]);

const upForm = new FormData();
upForm.append("file", new Blob([pdfBytes], { type: "application/pdf" }), "smoke-notes.pdf");
upForm.append("purpose", "study-material");
const upRes = await fetch(`${BASE}/upload/doc`, {
  method: "POST",
  headers: { Cookie: admin.cookies },
  body: upForm,
});
const upBody = await upRes.json();
check("upload PDF", upRes.status === 201 && upBody.success === true, upBody.message || "");
const fileUrl = upBody.data?.url;

// 3. Create material
const createRes = await fetch(`${BASE}/materials`, {
  method: "POST",
  headers: H(admin.cookies),
  body: JSON.stringify({
    title: "SMOKE Unit 1",
    description: "Test upload",
    category: "notes",
    courseCode: "CS999",
    courseName: "Smoke Course",
    semester: "5",
    section: "",
    fileUrl,
    fileName: "smoke-notes.pdf",
    fileSize: pdfBytes.length,
    mimeType: "application/pdf",
  }),
});
const createBody = await createRes.json();
check("create material", createRes.status === 201 && createBody.success === true, createBody.message || "");
const materialId = createBody.data?.material?._id;

// 4. List materials
const listRes = await fetch(`${BASE}/materials`, { headers: H(admin.cookies) });
const listBody = await listRes.json();
const found = (listBody.data?.materials || []).find((m) => m._id === materialId);
check("list materials", listRes.status === 200 && !!found, `count=${listBody.data?.count}`);

// 5. List mine
const mineRes = await fetch(`${BASE}/materials/mine`, { headers: H(admin.cookies) });
const mineBody = await mineRes.json();
check("list mine", mineRes.status === 200 && mineBody.success === true, `count=${mineBody.data?.count}`);

// 6. Get one
const getRes = await fetch(`${BASE}/materials/${materialId}`, { headers: H(admin.cookies) });
check("get material by id", getRes.status === 200);

// 7. Bad input -- missing title
const badRes = await fetch(`${BASE}/materials`, {
  method: "POST",
  headers: H(admin.cookies),
  body: JSON.stringify({ courseCode: "CS999", fileUrl: "x" }),
});
const badBody = await badRes.json();
check("rejects missing title", badRes.status === 400, badBody.message || "");

// 8. Delete
const delRes = await fetch(`${BASE}/materials/${materialId}`, {
  method: "DELETE",
  headers: H(admin.cookies),
});
const delBody = await delRes.json();
check("delete material", delRes.status === 200 && delBody.success === true);

const passed = results.filter((r) => r.ok).length;
console.log("");
console.log(`=== ${passed}/${results.length} checks passed ===`);
console.log("");
process.exit(passed === results.length ? 0 : 1);