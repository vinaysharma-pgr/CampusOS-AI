const API = "http://localhost:5000/api";
const fs = await import("node:fs");

// 1. Log in as admin
const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
});
const setCookie = login.headers.get("set-cookie");
const cookie = setCookie.split(";")[0];
console.log("✓ Logged in");

// 2. Upload a test image
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
const form = new FormData();
form.append("file", new Blob([png], { type: "image/png" }), "test.png");
form.append("purpose", "test");

const uploadRes = await fetch(API + "/upload", {
  method: "POST",
  headers: { Cookie: cookie },
  body: form,
});
const uploadData = await uploadRes.json();
console.log("✓ Upload status:", uploadRes.status);
console.log("  URL:", uploadData.data?.url);
const filename = uploadData.data?.filename;

// 3. Fetch the file with the SAME cookie (should work)
const fetchRes = await fetch(API + "/uploads/" + filename, {
  headers: { Cookie: cookie },
});
console.log("");
console.log("Test A — fetch with auth cookie:");
console.log("  Status:", fetchRes.status, fetchRes.status === 200 ? "✅ SUCCESS" : "❌ FAILED");

// 4. Fetch WITHOUT cookie (should fail with 401)
const noAuthRes = await fetch(API + "/uploads/" + filename);
console.log("");
console.log("Test B — fetch WITHOUT auth:");
console.log("  Status:", noAuthRes.status, noAuthRes.status === 401 ? "✅ BLOCKED (correct)" : "❌ ALLOWED (bad!)");

// 5. Fetch through the OLD public URL (should 404 now)
const oldRes = await fetch("http://localhost:5000/uploads/" + filename);
console.log("");
console.log("Test C — fetch old public /uploads/ path:");
console.log("  Status:", oldRes.status, oldRes.status === 404 ? "✅ NOT PUBLIC (correct)" : "❌ STILL PUBLIC (bad!)");

console.log("");
console.log("=== Summary ===");
console.log("Upload with auth:  ", uploadRes.status === 201 ? "✅" : "❌");
console.log("Fetch with auth:   ", fetchRes.status === 200 ? "✅" : "❌");
console.log("Fetch without auth:", noAuthRes.status === 401 ? "✅" : "❌");
console.log("Old public path:   ", oldRes.status === 404 ? "✅" : "❌");
