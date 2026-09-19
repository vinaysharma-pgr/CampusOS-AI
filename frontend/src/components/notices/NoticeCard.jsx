// src/components/notices/NoticeCard.jsx
import { motion } from "framer-motion";
import { AlertTriangle, User, Clock, Edit2, Trash2 } from "lucide-react";

const CATEGORY_COLORS = {
  Academic: "#3b82f6",
  Exam: "#f0554d",
  Cultural: "#ec4899",
  Sports: "#f97316",
  Placement: "#a855f7",
  Facility: "#10b981",
  General: "var(--color-primary)",
};

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NoticeCard({ notice, index = 0, showActions = false, onEdit, onDelete, onOpen }) {
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
    >
      {isUrgent && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", backgroundColor: "#f0554d" }} />
      )}

      <div style={{ padding: "1rem 1.25rem" }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: "8px", marginBottom: "10px" }}>
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
                backgroundColor: `${color}15`,
                color,
                border: `1px solid ${color}40`,
                fontWeight: 600,
              }}
            >
              {notice.category}
            </span>
            {isUrgent && (
              <span
                className="font-mono inline-flex items-center"
                style={{
                  padding: "3px 8px",
                  gap: "4px",
                  fontSize: "9.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  borderRadius: "5px",
                  backgroundColor: "rgba(240,85,77,0.12)",
                  color: "#f0554d",
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={9} />
                Urgent
              </span>
            )}
            {notice.targetAudience !== "all" && (
              <span
                className="font-mono"
                style={{
                  padding: "3px 8px",
                  fontSize: "9.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  borderRadius: "5px",
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                {notice.targetAudience}
                {notice.targetDepartment ? ` · ${notice.targetDepartment}` : ""}
              </span>
            )}
          </div>

          {showActions && (
            <div className="flex items-center" style={{ gap: "4px" }}>
              {onEdit && (
                <button
                  onClick={() => onEdit(notice)}
                  className="flex items-center justify-center"
                  style={{ height: "28px", width: "28px", borderRadius: "6px", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-strong)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary)"; e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-primary) 40%, transparent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-secondary)"; e.currentTarget.style.borderColor = "var(--color-border-strong)"; }}
                  aria-label="Edit"
                >
                  <Edit2 size={12} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(notice)}
                  className="flex items-center justify-center"
                  style={{ height: "28px", width: "28px", borderRadius: "6px", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(240,85,77,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  aria-label="Delete"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        <h3
          className="text-text-primary"
          style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.01em" }}
        >
          {notice.title}
        </h3>

        <p
          className="text-text-secondary"
          style={{
            marginTop: "8px",
            fontSize: "13px",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {notice.body}
        </p>

        <div
          className="flex items-center justify-between flex-wrap"
          style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--color-divider)", gap: "10px" }}
        >
          <div className="flex items-center" style={{ gap: "12px", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
            <span className="flex items-center" style={{ gap: "4px" }}>
              <User size={10} />
              {notice.author?.name || "System"}
            </span>
            <span className="flex items-center" style={{ gap: "4px" }}>
              <Clock size={10} />
              {timeAgo(notice.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
