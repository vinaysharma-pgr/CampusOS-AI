import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);
const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const TONES = {
  success: { border: "rgba(34,197,94,0.35)",  bg: "rgba(34,197,94,0.10)",  icon: "#16a34a" },
  error:   { border: "rgba(240,85,77,0.40)",  bg: "rgba(240,85,77,0.10)",  icon: "#f0554d" },
  info:    { border: "color-mix(in srgb, var(--color-primary) 35%, transparent)", bg: "color-mix(in srgb, var(--color-primary) 10%, transparent)", icon: "var(--color-primary)" },
};

function ToastItem({ id, type = "info", title, description, onClose }) {
  const Icon = ICONS[type] ?? Info;
  const tone = TONES[type] ?? TONES.info;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl p-4"
      style={{
        border: `1px solid ${tone.border}`,
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text-primary)",
        boxShadow: "var(--shadow-lg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      role="status"
    >
      <Icon size={20} className="mt-0.5 shrink-0" strokeWidth={2} style={{ color: tone.icon }} />
      <div className="flex-1">
        {title && <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{title}</p>}
        {description && <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="transition-colors"
        style={{ color: "var(--color-text-tertiary)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-tertiary)"; }}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const showToast = useCallback(({ type = "info", title, description, duration = 4000 }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((t) => <ToastItem key={t.id} {...t} onClose={removeToast} />)}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
