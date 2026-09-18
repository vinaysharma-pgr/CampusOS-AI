// src/components/events/EventConfirmModal.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, Check, Loader2, IndianRupee, ShieldCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function EventConfirmModal({ open, event, onClose, onConfirm, loading = false }) {
  const { user } = useAuth();
  const [agreed, setAgreed] = useState(false)

  // Reset checkbox when modal opens/closes
  useEffect(() => {
    if (open) setAgreed(false)
  }, [open])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape" && !loading) onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, loading, onClose])

  if (!event) return null

  const isPaid = event.isPaid && event.price > 0
  const price = event.price || 0
  const date = event.date ? new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => !loading && onClose()}
          className="fixed inset-0 z-[110] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", padding: "1rem", backdropFilter: "blur(8px)" }}>
          <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col"
            style={{
              maxWidth: "540px",
              width: "100%",
              maxHeight: "calc(100vh - 2rem)",
              borderRadius: "1rem",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              overflow: "hidden",
            }}>

            {/* Header (fixed) */}
            <div className="flex items-center justify-between shrink-0"
              style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-surface-raised)" }}>
              <div>
                <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>
                  Confirm Registration
                </p>
                <h2 className="text-text-primary" style={{ marginTop: "4px", fontSize: "17px", fontWeight: 600 }}>
                  {isPaid ? "Pay & Register" : "Register for this event"}
                </h2>
              </div>
              <button onClick={onClose} disabled={loading} aria-label="Close"
                style={{ height: "30px", width: "30px", color: "var(--color-text-tertiary)", background: "transparent", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.4 : 1 }}>
                <X size={15} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
              <div style={{ padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface-raised)" }}>
                <div className="flex items-center" style={{ gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <span className="font-mono" style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                    {event.type}
                  </span>
                  {isPaid ? (
                    <span className="font-mono inline-flex items-center" style={{ padding: "2px 8px", gap: "2px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "rgba(245,165,36,0.15)", color: "#f5a524" }}>
                      <IndianRupee size={9} /> {price}
                    </span>
                  ) : (
                    <span className="font-mono" style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "rgba(74,222,128,0.15)", color: "#4ade80" }}>
                      Free
                    </span>
                  )}
                </div>
                <p className="text-text-primary" style={{ fontSize: "16px", fontWeight: 600, lineHeight: 1.3 }}>{event.title}</p>
                <div className="flex flex-col" style={{ marginTop: "10px", gap: "6px", fontSize: "12.5px", color: "var(--color-text-secondary)" }}>
                  <span className="flex items-center" style={{ gap: "6px" }}><Calendar size={11} />{date}</span>
                  <span className="flex items-center" style={{ gap: "6px" }}><Clock size={11} />{event.time}</span>
                  <span className="flex items-center" style={{ gap: "6px" }}><MapPin size={11} />{event.venue}</span>
                </div>
              </div>

              <div style={{ marginTop: "1.25rem" }}>
                <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", marginBottom: "8px" }}>
                  Your details
                </p>
                <div className="flex items-center" style={{ padding: "12px 14px", gap: "12px", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                  <span className="flex items-center justify-center shrink-0"
                    style={{ height: "36px", width: "36px", borderRadius: "9px", backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)", fontSize: "15px", fontWeight: 700 }}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600 }}>{user?.name}</p>
                    <p className="text-text-tertiary" style={{ marginTop: "2px", fontSize: "11.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
                    {(user?.department || user?.semester || user?.section) && (
                      <p className="font-mono" style={{ marginTop: "3px", fontSize: "10.5px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {[user.department, user.semester && "Sem " + user.semester, user.section].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <label className="flex items-start" style={{ marginTop: "1.25rem", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: "2px", height: "16px", width: "16px", accentColor: "var(--color-primary)", cursor: "pointer", flexShrink: 0 }} />
                <span className="text-text-secondary" style={{ fontSize: "12.5px", lineHeight: 1.5 }}>
                  I confirm I want to register for <strong className="text-text-primary">{event.title}</strong>. My name and email will be shared with the event coordinator.
                </span>
              </label>
            </div>

            {/* Footer (fixed) */}
            <div className="shrink-0"
              style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              <div className="flex" style={{ gap: "10px" }}>
                <button onClick={onClose} disabled={loading}
                  className="flex-1 rounded-lg font-medium"
                  style={{ padding: "12px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", background: "transparent", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}>
                  Cancel
                </button>
                <button onClick={() => agreed && onConfirm()} disabled={!agreed || loading}
                  className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold"
                  style={{ padding: "12px 0", gap: "8px", fontSize: "13px",
                    backgroundColor: agreed ? (isPaid ? "#f5a524" : "var(--color-primary)") : "var(--color-surface-raised)",
                    color: agreed ? (isPaid ? "#1a1a1a" : "var(--color-primary-fg)") : "var(--color-text-tertiary)",
                    border: "none", cursor: (!agreed || loading) ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1 }}>
                  {loading ? (
                    <><Loader2 size={14} className="animate-spin" /> Processing...</>
                  ) : isPaid ? (
                    <><IndianRupee size={14} /> Pay ₹{price} & Register</>
                  ) : (
                    <><Check size={14} /> Confirm Registration</>
                  )}
                </button>
              </div>
              {isPaid && (
                <div className="flex items-center justify-center" style={{ marginTop: "10px", gap: "6px", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                  <ShieldCheck size={12} />
                  Secure payment via Razorpay
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
