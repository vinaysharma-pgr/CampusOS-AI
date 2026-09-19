const API = "http://localhost:5000/api";
const r = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
});
console.log("Status:", r.status);
console.log("Body:", JSON.stringify(await r.json(), null, 2));
