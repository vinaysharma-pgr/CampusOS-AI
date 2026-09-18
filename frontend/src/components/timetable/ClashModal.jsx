// src/components/timetable/ClashModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Check, Loader2 } from "lucide-react";

const TYPE_LABELS = {
  faculty: "Faculty clash (within this timetable)",
  "faculty-cross": "Faculty clash (with another section)",
  room: "Room clash (within this timetable)",
  "room-cross": "Room clash (with another section)",
};

export default function ClashModal({ open, clashes = [], onCancel, onOverride, saving = false }) {
  if (!open) return null

  const grouped = clashes.reduce((acc, c) => {
    if (!acc[c.type]) acc[c.type] = [];
    acc[c.type].push(c);
    return acc;
  }, {})

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto"
        style={{ backgroundColor: "rgba(0,0,0,0.8)", padding: "4vh 1.5rem", backdropFilter: "blur(8px)" }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 12 }}
          style={{
            maxWidth: "640px",
            width: "100%",
            borderRadius: "1rem",
            border: "1px solid rgba(240,85,77,0.3)",
            backgroundColor: "var(--color-surface)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="flex items-start"
            style={{
              padding: "1.25rem 1.5rem",
              gap: "14px",
              borderBottom: "1px solid rgba(240,85,77,0.2)",
              backgroundColor: "rgba(240,85,77,0.06)",
            }}
          >
            <span
              className="flex items-center justify-center shrink-0"
              style={{
                height: "44px",
                width: "44px",
                borderRadius: "11px",
                backgroundColor: "rgba(240,85,77,0.15)",
                color: "#f0554d",
                border: "1px solid rgba(240,85,77,0.3)",
              }}
            >
              <AlertTriangle size={20} />
            </span>
            <div style={{ flex: 1 }}>
              <h2 className="text-text-primary" style={{ fontSize: "17px", fontWeight: 600 }}>
                {clashes.length} clash{clashes.length === 1 ? "" : "es"} detected
              </h2>
              <p className="text-text-secondary" style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.5 }}>
                This timetable conflicts with existing schedules. Fix them or override to save anyway.
              </p>
            </div>
          </div>

          {/* Body */}
          <div style={{ maxHeight: "50vh", overflowY: "auto", padding: "1.25rem 1.5rem" }}>
            {Object.entries(grouped).map(([type, list]) => (
              <div key={type} style={{ marginBottom: "1.25rem" }}>
                <p
                  className="font-mono"
                  style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#f0554d",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  {TYPE_LABELS[type] || type} ({list.length})
                </p>
                <div className="flex flex-col" style={{ gap: "6px" }}>
                  {list.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(240,85,77,0.2)",
                        backgroundColor: "rgba(240,85,77,0.03)",
                      }}
                    >
                      <p className="text-text-primary" style={{ fontSize: "12.5px", lineHeight: 1.5 }}>
                        {c.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="flex flex-col sm:flex-row"
            style={{
              padding: "1rem 1.5rem",
              gap: "10px",
              borderTop: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 rounded-lg font-semibold"
              style={{
                padding: "12px 0",
                fontSize: "13px",
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-fg)",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              Fix the timetable
            </button>
            <button
              type="button"
              onClick={onOverride}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center rounded-lg font-medium"
              style={{
                padding: "12px 0",
                gap: "8px",
                fontSize: "13px",
                backgroundColor: "transparent",
                color: "#f0554d",
                border: "1px solid rgba(240,85,77,0.4)",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save anyway" }
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
