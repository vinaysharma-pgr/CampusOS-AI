const API = "http://localhost:5000/api";

// Login (should be logged)
const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
});
const cookie = login.headers.get("set-cookie").split(";")[0];
console.log("✓ Logged in");

// Try a failed login too (should also be logged)
await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "fake@test.com", password: "wrong" }),
});
console.log("✓ Tried a failed login");

// Wait 1 second for logs to write (they're fire-and-forget)
await new Promise((r) => setTimeout(r, 1000));

// Query the audit logs
console.log("");
console.log("Fetching audit logs...");

const logs = await fetch(API + "/audit-logs", {
  headers: { Cookie: cookie },
}).then(r => r.json()).catch(() => null);

console.log("");
if (logs?.success) {
  console.log("Audit logs found:", logs.data?.logs?.length || 0);
  logs.data?.logs?.slice(0, 5).forEach(l => {
    console.log(`  [${l.action}] ${l.status} — ${l.userEmail || "anon"} — ${l.message}`);
  });
} else {
  console.log("(No audit-logs route yet — that ships in Script 2)");
}
