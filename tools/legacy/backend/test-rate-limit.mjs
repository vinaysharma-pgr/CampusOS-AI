const API = "http://localhost:5000/api";

console.log("Testing login rate limit (should allow 5, then block)...");
console.log("");

for (let i = 1; i <= 7; i++) {
  const r = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "fake@test.com", password: "wrongpass" }),
  });
  const data = await r.json();
  console.log(`Attempt ${i}: Status ${r.status} — ${data.message}`);
}
console.log("");
console.log("Expected: attempts 1-5 return 'Invalid credentials' (401), 6-7 return 'Too many requests' (429)");
