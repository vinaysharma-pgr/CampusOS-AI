const API = "http://localhost:5000/api";

// Login as admin
const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
});
const cookie = login.headers.get("set-cookie").split(";")[0];

// List locked accounts
const list = await fetch(API + "/admin/locks", {
  headers: { Cookie: cookie },
}).then(r => r.json());

console.log("Locked accounts:", list.data?.count || 0);
list.data?.locked?.forEach(l => {
  console.log(`  ${l.email} — ${l.attempts} attempts — unlocks in ${l.minutesRemaining}m`);
});

// Unlock the test account
if (list.data?.count > 0) {
  const email = list.data.locked[0].email;
  const unlock = await fetch(API + "/admin/locks/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ email }),
  }).then(r => r.json());
  console.log("");
  console.log("Unlock result:", unlock.message, "→", unlock.data?.unlocked);
}
