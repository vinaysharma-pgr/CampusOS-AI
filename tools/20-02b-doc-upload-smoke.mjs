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

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`  ${ok ? "[PASS]" : "[FAIL]"} ${name}${detail ? "  --  " + detail : ""}`);
}

console.log("");
console.log("PHASE 20 STAGE 2 - Document upload smoke");
console.log("");

const admin = await login("vinay@srms.ac.in", "password123");
check("admin login", admin.body.success === true && !!admin.cookies);
if (!admin.cookies) process.exit(1);

// Build a minimal valid PDF
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

const form = new FormData();
form.append("file", new Blob([pdfBytes], { type: "application/pdf" }), "test.pdf");
form.append("purpose", "study-material");

const upRes = await fetch(`${BASE}/upload/doc`, {
  method: "POST",
  headers: { Cookie: admin.cookies },
  body: form,
});
const upBody = await upRes.json();
check("upload PDF succeeds", upRes.status === 201 && upBody.success === true, upBody.message || "");
const filename = upBody.data?.filename;
check("response has filename", !!filename, filename || "");

if (filename) {
  const dlRes = await fetch(`${BASE}/upload/doc/${filename}`, {
    headers: { Cookie: admin.cookies },
  });
  check("download PDF succeeds", dlRes.status === 200, `status=${dlRes.status}`);
}

// Reject .exe
const form2 = new FormData();
form2.append("file", new Blob([new Uint8Array([0x4D, 0x5A])], { type: "application/x-msdownload" }), "evil.exe");

const badRes = await fetch(`${BASE}/upload/doc`, {
  method: "POST",
  headers: { Cookie: admin.cookies },
  body: form2,
});
const badBody = await badRes.json();
check("rejects .exe upload", badRes.status === 400, badBody.message || "");

const passed = results.filter((r) => r.ok).length;
console.log("");
console.log(`=== ${passed}/${results.length} checks passed ===`);
console.log("");
process.exit(passed === results.length ? 0 : 1);