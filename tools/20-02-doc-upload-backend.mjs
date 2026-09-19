import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

function writeIfMissing(rel, content) {
  const full = path.join(ROOT, rel);
  if (fs.existsSync(full)) { info(rel + " already exists - skipping"); return; }
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  ok("created " + rel);
}

function patch(rel, from, to) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) { fail(rel + " missing"); return; }
  let src = fs.readFileSync(full, "utf8");
  if (src.includes(to)) { info(rel + " already patched"); return; }
  if (!src.includes(from)) { fail(rel + " anchor not found"); return; }
  src = src.replace(from, to);
  fs.writeFileSync(full, src, "utf8");
  ok("patched " + rel);
}

console.log("");
console.log("PHASE 20 - STAGE 2 - Document upload backend");
console.log("");

// 1. Extend middleware/upload.js — add uploadDoc
patch(
  "backend/src/middleware/upload.js",
  'export const upload = multer({\n  storage,\n  fileFilter,\n  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB\n});',
  `export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

const DOC_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);

const docFileFilter = (req, file, cb) => {
  if (file.mimetype && DOC_MIMES.has(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest("Unsupported file type. Allowed: image, PDF, Word, PowerPoint, plain text."));
};

export const uploadDoc = multer({
  storage,
  fileFilter: docFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB for study materials
});`
);

// 2. Extend uploadController — add uploadDocument
patch(
  "backend/src/controllers/uploadController.js",
  'const UPLOAD_DIR = path.join(process.cwd(), "uploads");\nfs.mkdirSync(UPLOAD_DIR, { recursive: true });',
  `const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const DOC_DIR = path.join(process.cwd(), "uploads", "docs");
fs.mkdirSync(DOC_DIR, { recursive: true });`
);

patch(
  "backend/src/controllers/uploadController.js",
  'export const uploadImage = asyncHandler(async (req, res) => {',
  `const DOC_EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "text/plain": ".txt",
};

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");

  const ext = DOC_EXT_BY_MIME[req.file.mimetype] || path.extname(req.file.originalname) || ".bin";
  const random = crypto.randomBytes(16).toString("hex");
  const filename = \`doc-\${Date.now()}-\${random}\${ext}\`;
  const fullPath = path.join(DOC_DIR, filename);

  fs.writeFileSync(fullPath, req.file.buffer);

  const doc = await Upload.create({
    filename,
    originalName: req.file.originalname || "",
    mimeType: req.file.mimetype,
    size: req.file.size,
    ownerId: req.user?._id || null,
    ownerName: req.user?.name || "",
    ownerRole: req.user?.role || "",
    purpose: req.body?.purpose || "study-material",
  });

  const url = \`/api/upload/doc/\${filename}\`;

  return success(res, {
    url,
    filename,
    originalName: req.file.originalname || "",
    size: req.file.size,
    mime: req.file.mimetype,
    uploadId: doc._id,
  }, "Document uploaded", 201);
});

export const uploadImage = asyncHandler(async (req, res) => {`
);

// 3. Extend uploadFetchController — handle doc/ prefix
patch(
  "backend/src/controllers/uploadFetchController.js",
  'const UPLOAD_DIR = path.join(process.cwd(), "uploads");',
  'const UPLOAD_DIR = path.join(process.cwd(), "uploads");\nconst DOC_DIR = path.join(process.cwd(), "uploads", "docs");'
);

patch(
  "backend/src/controllers/uploadFetchController.js",
  '  const fullPath = path.join(UPLOAD_DIR, filename);\n  if (!fs.existsSync(fullPath)) throw ApiError.notFound("File not found on disk");',
  `  // Docs live in uploads/docs/, images in uploads/
  const isDoc = record.purpose === "study-material" || filename.startsWith("doc-");
  const baseDir = isDoc ? DOC_DIR : UPLOAD_DIR;
  const fullPath = path.join(baseDir, filename);
  if (!fs.existsSync(fullPath)) throw ApiError.notFound("File not found on disk");`
);

// 4. Extend uploadRoutes — add POST /doc and GET /doc/:filename
patch(
  "backend/src/routes/uploadRoutes.js",
  'import { uploadImage } from "../controllers/uploadController.js";',
  'import { uploadImage, uploadDocument } from "../controllers/uploadController.js";'
);

patch(
  "backend/src/routes/uploadRoutes.js",
  'import { upload } from "../middleware/upload.js";',
  'import { upload, uploadDoc } from "../middleware/upload.js";'
);

patch(
  "backend/src/routes/uploadRoutes.js",
  '// Fetch by filename (authenticated + ownership checked)\nrouter.get("/:filename", requireAuth, fetchUpload);',
  `// Document upload (images + PDFs + Office docs, up to 25 MB)
router.post("/doc",
  requireAuth,
  uploadRateLimiter,
  uploadDoc.single("file"),
  uploadQuotaGuard,
  uploadDocument
);

// Fetch document by filename (authenticated + ownership checked)
router.get("/doc/:filename", requireAuth, fetchUpload);

// Fetch by filename (authenticated + ownership checked)
router.get("/:filename", requireAuth, fetchUpload);`
);

console.log("");
console.log("Done.");