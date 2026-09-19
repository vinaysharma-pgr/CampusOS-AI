const API = "http://localhost:5000/api";
const TEST_EMAIL = "lockout-test-" + Date.now() + "@example.com";

console.log("Testing account lockout for:", TEST_EMAIL);
console.log("");

for (let i = 1; i <= 7; i++) {
  const r = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, password: "wrongpass" }),
  });
  const data = await r.json();
  console.log(`Attempt ${i}: [${r.status}] ${data.message}`);
}
