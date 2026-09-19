const login = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "vinay@srms.ac.in", password: "password123" }),
});

console.log("Status:", login.status);
const setCookie = login.headers.get("set-cookie");
console.log("Set-Cookie header:");
console.log(setCookie || "(none)");
