// src/components/notifications/NotificationBell.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, Check, Trash2, Volume2, VolumeX } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + "d ago";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationBell() {
  const { isAuthed } = useAuth();
  const {
    items, unread, loading, muted,
    markRead, markAllRead, remove, toggleMute,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    setTimeout(() => window.addEventListener("mousedown", handler), 0);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!isAuthed) return null;

  const handleClick = async (n) => {
    if (!n.read) await markRead(n._id);
    setOpen(false);
    if (n.url) navigate(n.url);
  };
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex items-center justify-center rounded-lg"
        style={{
          height: "36px",
          width: "36px",
          border: "1px solid var(--color-border-strong)",
          backgroundColor: unread > 0 ? "color-mix(in srgb, var(--color-primary) 8%, transparent)" : "var(--color-surface)",
          color: unread > 0 ? "var(--color-primary)" : "var(--color-text-secondary)",
        }}
      >
        <Bell size={15} />
        {unread > 0 && (
          <span
            className="font-mono"
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              minWidth: "18px",
              height: "18px",
              padding: "0 5px",
              borderRadius: "9999px",
              backgroundColor: "#f0554d",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 2px var(--color-surface), 0 0 12px -2px rgba(240,85,77,0.6)",
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 rounded-xl overflow-hidden"
            style={{
              top: "calc(100% + 8px)",
              width: "380px",
              maxWidth: "calc(100vw - 2rem)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              boxShadow: "0 24px 80px -12px rgba(0,0,0,0.5)",
              zIndex: 80,
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
              }}
            >
              <div>
                <p
                  className="font-mono"
                  style={{
                    fontSize: "9.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "var(--color-text-tertiary)",
                    fontWeight: 600,
                  }}
                >
                  Notifications
                </p>
                <p
                  className="text-text-primary"
                  style={{ marginTop: "2px", fontSize: "13px", fontWeight: 600 }}
                >
                  {loading ? "Loading..." : unread + " unread of " + items.length}
                </p>
              </div>
              <div className="flex items-center" style={{ gap: "6px" }}>
                <button
                  onClick={toggleMute}
                  title={muted ? "Unmute sound" : "Mute sound"}
                  className="flex items-center justify-center rounded-md"
                  style={{ height: "26px", width: "26px", color: "var(--color-text-tertiary)", background: "transparent", border: "none", cursor: "pointer" }}
                >
                  {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Mark all as read"
                    className="flex items-center justify-center rounded-md"
                    style={{ height: "26px", paddingLeft: "8px", paddingRight: "8px", gap: "4px", fontSize: "11px", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)", backgroundColor: "color-mix(in srgb, var(--color-primary) 6%, transparent)", cursor: "pointer" }}
                  >
                    <Check size={11} /> All read
                  </button>
                )}
              </div>
            </div>

            <div style={{ maxHeight: "420px", overflowY: "auto" }}>
              {loading ? (
                <div className="flex items-center justify-center" style={{ padding: "2.5rem 1rem" }}>
                  <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>Loading...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                  <BellOff size={24} style={{ color: "var(--color-text-tertiary)" }} />
                  <p className="text-text-secondary" style={{ marginTop: "10px", fontSize: "13px" }}>You are all caught up</p>
                  <p className="text-text-tertiary" style={{ marginTop: "3px", fontSize: "11.5px" }}>New notifications will appear here</p>
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className="group flex w-full items-start text-left"
                    style={{ padding: "12px 14px", gap: "10px", borderBottom: "1px solid var(--color-divider)", backgroundColor: n.read ? "transparent" : "color-mix(in srgb, var(--color-primary) 4%, transparent)", cursor: "pointer" }}
                  >
                    <div className="flex items-center justify-center shrink-0" style={{ height: "36px", width: "36px", borderRadius: "9px", fontSize: "18px", backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>
                      {n.icon || "🔔"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-start justify-between" style={{ gap: "6px" }}>
                        <p className="text-text-primary" style={{ fontSize: "13px", fontWeight: n.read ? 500 : 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span style={{ flexShrink: 0, height: "7px", width: "7px", borderRadius: "9999px", backgroundColor: "#f0554d", marginTop: "5px", boxShadow: "0 0 6px rgba(240,85,77,0.6)" }} />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-text-secondary" style={{ marginTop: "3px", fontSize: "11.5px", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {n.body}
                        </p>
                      )}
                      <p className="font-mono" style={{ marginTop: "4px", fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(n._id); }}
                      title="Delete"
                      className="opacity-0 group-hover:opacity-100"
                      style={{ flexShrink: 0, height: "22px", width: "22px", borderRadius: "5px", color: "var(--color-text-tertiary)", background: "transparent", border: "none", cursor: "pointer" }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
