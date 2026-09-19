const API = "http://localhost:5000/api";

// 1. Login
const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
});
const loginData = await login.json();
console.log("Login status:", login.status);
console.log("Login body has token?", !!loginData.data?.token);
console.log("Login body user:", loginData.data?.user?.name);

// 2. Check Set-Cookie header
const setCookie = login.headers.get("set-cookie");
console.log("Set-Cookie header present:", !!setCookie);
if (setCookie) console.log("  Cookie starts with:", setCookie.slice(0, 40) + "...");

// 3. Use cookie to hit /auth/me
if (!setCookie) {
  console.log("❌ No cookie was set. Cannot continue.");
  process.exit(1);
}
const cookieValue = setCookie.split(";")[0];

const me = await fetch(API + "/auth/me", {
  headers: { Cookie: cookieValue },
});
const meData = await me.json();
console.log("");
console.log("GET /auth/me status:", me.status);
console.log("User from cookie:", meData.data?.user?.name);
console.log("User role:", meData.data?.user?.role);
