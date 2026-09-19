import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

function patch(rel, from, to) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) { fail(rel + " missing"); return; }
  let raw = fs.readFileSync(full, "utf8");
  const usesCRLF = raw.includes("\r\n");
  let src = usesCRLF ? raw.replace(/\r\n/g, "\n") : raw;

  if (src.includes(to)) { info(rel + " already patched"); return; }
  if (!src.includes(from)) { fail(rel + " anchor not found"); return; }
  src = src.replace(from, to);
  const out = usesCRLF ? src.replace(/\n/g, "\r\n") : src;
  fs.writeFileSync(full, out, "utf8");
  ok("patched " + rel);
}

console.log("");
console.log("PHASE 22 - Stage 2 - Notice read frontend (lightweight)");
console.log("");

// 1. API client -- add markNoticeRead
patch(
  "frontend/src/api/notices.js",
  `export async function deleteNotice(id) {
  const { data } = await apiClient.delete(\`/notices/\${id}\`);
  return data.data;
}`,
  `export async function deleteNotice(id) {
  const { data } = await apiClient.delete(\`/notices/\${id}\`);
  return data.data;
}

export async function markNoticeRead(id) {
  const { data } = await apiClient.post(\`/notices/\${id}/read\`);
  return data.data;
}`
);

// 2. NoticeCard -- unread dot + onOpen callback + subtle "New" styling
patch(
  "frontend/src/components/notices/NoticeCard.jsx",
  `export default function NoticeCard({ notice, index = 0, showActions = false, onEdit, onDelete }) {
  const color = CATEGORY_COLORS[notice.category] || CATEGORY_COLORS.General;
  const isUrgent = notice.priority === "urgent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group relative hover-lift"
      style={{
        borderRadius: "0.875rem",
        border: isUrgent ? "1px solid rgba(240,85,77,0.3)" : "1px solid var(--color-border)",
        backgroundColor: isUrgent ? "rgba(240,85,77,0.03)" : "var(--color-surface)",
        overflow: "hidden",
      }}
    >`,
  `export default function NoticeCard({ notice, index = 0, showActions = false, onEdit, onDelete, onOpen }) {
  const color = CATEGORY_COLORS[notice.category] || CATEGORY_COLORS.General;
  const isUrgent = notice.priority === "urgent";
  const isUnread = notice.isReadByMe === false;

  const handleClick = () => {
    if (onOpen) onOpen(notice);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onClick={handleClick}
      className={"group relative hover-lift" + (onOpen ? " cursor-pointer" : "")}
      style={{
        borderRadius: "0.875rem",
        border: isUrgent
          ? "1px solid rgba(240,85,77,0.3)"
          : isUnread
          ? "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)"
          : "1px solid var(--color-border)",
        backgroundColor: isUrgent
          ? "rgba(240,85,77,0.03)"
          : isUnread
          ? "color-mix(in srgb, var(--color-primary) 3%, transparent)"
          : "var(--color-surface)",
        overflow: "hidden",
      }}
    >`
);

// Add "New" indicator dot before the category badge row
patch(
  "frontend/src/components/notices/NoticeCard.jsx",
  `        <div className="flex items-center justify-between flex-wrap" style={{ gap: "8px", marginBottom: "10px" }}>
          <div className="flex items-center" style={{ gap: "8px", flexWrap: "wrap" }}>
            <span
              className="font-mono"
              style={{
                padding: "3px 8px",
                fontSize: "9.5px",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                borderRadius: "5px",
                backgroundColor: \`\${color}15\`,
                color,
                border: \`1px solid \${color}40\`,
                fontWeight: 600,
              }}
            >
              {notice.category}
            </span>`,
  `        <div className="flex items-center justify-between flex-wrap" style={{ gap: "8px", marginBottom: "10px" }}>
          <div className="flex items-center" style={{ gap: "8px", flexWrap: "wrap" }}>
            {isUnread && (
              <span
                className="inline-flex items-center gap-1 font-mono"
                style={{
                  padding: "3px 8px",
                  fontSize: "9.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  borderRadius: "5px",
                  backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
                  color: "var(--color-primary)",
                  border: "1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)",
                  fontWeight: 700,
                }}
              >
                <span
                  className="rounded-full"
                  style={{ height: "5px", width: "5px", backgroundColor: "var(--color-primary)" }}
                />
                New
              </span>
            )}
            <span
              className="font-mono"
              style={{
                padding: "3px 8px",
                fontSize: "9.5px",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                borderRadius: "5px",
                backgroundColor: \`\${color}15\`,
                color,
                border: \`1px solid \${color}40\`,
                fontWeight: 600,
              }}
            >
              {notice.category}
            </span>`
);

// 3. StudentNotices -- hook up onOpen to mark read
patch(
  "frontend/src/pages/student/StudentNotices.jsx",
  `import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { listNotices } from "../../api/notices.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import NoticeCard from "../../components/notices/NoticeCard.jsx";`,
  `import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { listNotices, markNoticeRead } from "../../api/notices.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import NoticeCard from "../../components/notices/NoticeCard.jsx";`
);

patch(
  "frontend/src/pages/student/StudentNotices.jsx",
  `  const filtered = filter === "all"`,
  `  const handleOpen = async (notice) => {
    if (notice.isReadByMe === true) return;
    // Optimistic update
    setNotices((prev) =>
      prev.map((n) => (n._id === notice._id ? { ...n, isReadByMe: true } : n))
    );
    try {
      await markNoticeRead(notice._id);
    } catch (err) {
      // Revert if it failed
      setNotices((prev) =>
        prev.map((n) => (n._id === notice._id ? { ...n, isReadByMe: false } : n))
      );
      console.error("markRead failed:", err.message);
    }
  };

  const filtered = filter === "all"`
);

patch(
  "frontend/src/pages/student/StudentNotices.jsx",
  `          {filtered.map((n, i) => (
            <NoticeCard key={n._id} notice={n} index={i} />
          ))}`,
  `          {filtered.map((n, i) => (
            <NoticeCard key={n._id} notice={n} index={i} onOpen={handleOpen} />
          ))}`
);

// 4. Add "X unread" counter near the header
patch(
  "frontend/src/pages/student/StudentNotices.jsx",
  `        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading ? "Loading…" : \`\${notices.length} notices for you\`}
        </p>`,
  `        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading
            ? "Loading…"
            : (() => {
                const unread = notices.filter((n) => n.isReadByMe === false).length;
                if (!notices.length) return "0 notices for you";
                return unread > 0
                  ? \`\${notices.length} notices · \${unread} new\`
                  : \`\${notices.length} notices · all caught up\`;
              })()}
        </p>`
);

console.log("");
console.log("Done.");