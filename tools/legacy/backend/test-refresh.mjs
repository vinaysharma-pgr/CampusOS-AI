const API = "http://localhost:5000/api";

// Login
const login = await fetch(API + "/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
});
const setCookie = login.headers.get("set-cookie") || "";
console.log("Login status:", login.status);
console.log("Has access cookie:", setCookie.includes("campusos_token="));
console.log("Has refresh cookie:", setCookie.includes("campusos_refresh="));

// Extract both cookies for the test
const cookies = setCookie.split(/,(?=[^;]+=[^;]+)/).map(c => c.split(";")[0].trim());
const cookieHeader = cookies.join("; ");

// Verify /me works with access cookie
const me = await fetch(API + "/auth/me", { headers: { Cookie: cookieHeader } }).then(r => r.json());
console.log("");
console.log("GET /auth/me:", me.success ? "✓ " + me.data.user.name : "✗");

// Refresh the session
const refresh = await fetch(API + "/auth/refresh", {
  method: "POST",
  headers: { Cookie: cookieHeader },
});
const refreshBody = await refresh.json();
const newCookies = (refresh.headers.get("set-cookie") || "").split(/,(?=[^;]+=[^;]+)/).map(c => c.split(";")[0].trim());
const newCookieHeader = newCookies.join("; ");

console.log("");
console.log("POST /auth/refresh:", refresh.status);
console.log("Got new access token:", newCookies.some(c => c.includes("campusos_token=")));
console.log("Got new refresh token:", newCookies.some(c => c.includes("campusos_refresh=")));

// Verify new access token works
const me2 = await fetch(API + "/auth/me", { headers: { Cookie: newCookieHeader } }).then(r => r.json());
console.log("");
console.log("GET /auth/me with new token:", me2.success ? "✓ " + me2.data.user.name : "✗");

// Test logout
const logout = await fetch(API + "/auth/logout", {
  method: "POST",
  headers: { Cookie: newCookieHeader },
});
console.log("");
console.log("POST /auth/logout:", logout.status);
