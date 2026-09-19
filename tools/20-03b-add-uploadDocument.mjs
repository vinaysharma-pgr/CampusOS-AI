import fs from "node:fs";
import path from "node:path";

const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

const rel = "frontend/src/api/upload.js";
const full = path.join(process.cwd(), rel);

if (!fs.existsSync(full)) { fail(rel + " missing"); process.exit(1); }

let raw = fs.readFileSync(full, "utf8");
const usesCRLF = raw.includes("\r\n");
let src = usesCRLF ? raw.replace(/\r\n/g, "\n") : raw;

if (src.includes("export async function uploadDocument")) {
  info("uploadDocument already exists - no change needed");
  process.exit(0);
}

// Append uploadDocument at end
const append = `

export async function uploadDocument(file, purpose = "study-material") {
  const form = new FormData();
  form.append("file", file);
  form.append("purpose", purpose);
  const { data } = await apiClient.post("/upload/doc", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}
`;

src = src.trimEnd() + append;

const out = usesCRLF ? src.replace(/\n/g, "\r\n") : src;
fs.writeFileSync(full, out, "utf8");
ok("appended uploadDocument to " + rel);