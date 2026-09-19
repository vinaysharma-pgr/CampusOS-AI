const API = "http://localhost:5000/api";

const res = await fetch(API + "/health");
console.log("Status:", res.status);
console.log("");
console.log("=== Security Headers ===");
const wanted = [
  "x-content-type-options",
  "x-frame-options",
  "x-dns-prefetch-control",
  "x-permitted-cross-domain-policies",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-resource-policy",
  "cross-origin-opener-policy",
  "strict-transport-security",
  "content-security-policy",
  "x-powered-by",
];

for (const h of wanted) {
  const v = res.headers.get(h);
  const status = v ? "OK" : "--";
  const display = v ? (v.length > 80 ? v.slice(0, 80) + "..." : v) : "(not set)";
  console.log("  [" + status + "] " + h + ": " + display);
}
