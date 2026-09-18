// src/components/notifications/NotificationToasts.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext.jsx";

export default function NotificationToasts() {
  const { toasts, dismissToast, markRead } = useNotifications();
  const navigate = useNavigate();

  const open = (t) => {
    if (t.notification._id) markRead(t.notification._id);
    dismissToast(t.id);
    if (t.notification.url) navigate(t.notification.url);
  };

  return (
    <div className="pointer-events-none fixed z-[120] flex flex-col"
      style={{ bottom: "1.5rem", right: "1.5rem", gap: "10px", maxWidth: "380px" }}>
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => open(t)}
            className="pointer-events-auto relative overflow-hidden cursor-pointer"
            style={{
              padding: "14px 16px 14px 14px",
              borderRadius: "12px",
              border: "1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)",
              backgroundColor: "var(--color-surface)",
              boxShadow: "0 20px 60px -12px rgba(0,0,0,0.5), 0 0 40px -20px color-mix(in srgb, var(--color-primary) 60%, transparent)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-start" style={{ gap: "12px" }}>
              <div className="flex items-center justify-center shrink-0"
                style={{ height: "36px", width: "36px", borderRadius: "9px", backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)", fontSize: "18px" }}>
                {t.notification.icon || "🔔"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600, lineHeight: 1.3 }}>
                  {t.notification.title}
                </p>
                {t.notification.body && (
                  <p className="text-text-secondary" style={{ marginTop: "3px", fontSize: "12px", lineHeight: 1.45 }}>
                    {t.notification.body}
                  </p>
                )}
                <p className="font-mono" style={{ marginTop: "6px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-primary)" }}>
                  Click to open
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismissToast(t.id); }}
                aria-label="Dismiss"
                style={{ height: "22px", width: "22px", borderRadius: "6px", color: "var(--color-text-tertiary)", background: "transparent", border: "none", cursor: "pointer", flexShrink: 0 }}
              >
                <X size={13} />
              </button>
            </div>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 6, ease: "linear" }}
              style={{ position: "absolute", left: 0, bottom: 0, height: "2px", backgroundColor: "var(--color-primary)" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
