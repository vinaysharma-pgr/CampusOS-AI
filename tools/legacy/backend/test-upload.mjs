import fs from "node:fs";

// Create a tiny test PNG (1x1 pixel)
const png1x1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
fs.writeFileSync("test-image.png", png1x1);

const API = "http://localhost:5000/api";

// Login as faculty (SB)
const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "sb@srms.ac.in", password: "faculty123" }),
}).then(r => r.json());

if (!login.success) {
  console.log("Login failed:", login.message);
  process.exit(1);
}
console.log("Logged in as", login.data.user.name);

// Upload the image
const form = new FormData();
form.append("file", new Blob([png1x1], { type: "image/png" }), "test.png");

const up = await fetch(API + "/upload", {
  method: "POST",
  headers: { Authorization: "Bearer " + login.data.token },
  body: form,
}).then(r => r.json());

console.log("");
console.log("Upload result:");
console.log(JSON.stringify(up, null, 2));
