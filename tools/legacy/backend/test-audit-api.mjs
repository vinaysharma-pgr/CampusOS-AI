const API = "http://localhost:5000/api";

// Login
const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
});
const cookie = login.headers.get("set-cookie").split(";")[0];
console.log("Logged in");

// Wait for log write
await new Promise((r) => setTimeout(r, 500));

// Fetch audit logs
const r = await fetch(API + "/audit-logs", {
  headers: { Cookie: cookie },
}).then((r) => r.json());

console.log("");
console.log("Success:", r.success);
console.log("Logs count:", r.data?.count);
console.log("");
r.data?.logs?.slice(0, 8).forEach((l) => {
  const when = new Date(l.createdAt).toLocaleTimeString();
  console.log(`  [${when}] ${l.action} - ${l.status} - ${l.userEmail || "anon"}`);
});
