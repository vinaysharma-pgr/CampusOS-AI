const API = "http://localhost:5000/api";

console.log("═══ Step 1: password login (expect OTP required) ═══");
const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
});
const loginBody = await login.json();
const loginCookies = login.headers.get("set-cookie") || "";
console.log("Status:", login.status);
console.log("Body:", JSON.stringify(loginBody, null, 2));
console.log("Set-Cookie present:", loginCookies.length > 0);
console.log("→ Expect: success=false? No — expect requiresOTP=true, NO cookies");

console.log("");
console.log("═══ Step 2: try OTP verify with WRONG code ═══");
const bad = await fetch(API + "/auth/login/verify-password-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", otp: "000000" }),
});
console.log("Status:", bad.status);
console.log("Body:", await bad.json());
console.log("→ Expect: 400 Incorrect code. N attempts remaining.");

console.log("");
console.log("═══ Step 3: dev bypass check ═══");
console.log("To test the bypass, set DISABLE_LOGIN_OTP=true in .env and restart backend.");
console.log("Then password login should return user + cookies immediately.");
