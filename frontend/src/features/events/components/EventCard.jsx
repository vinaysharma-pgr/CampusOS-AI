// src/features/events/components/EventCard.jsx
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, Users, ArrowRight, Check, Loader2, IndianRupee } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../../contexts/ToastContext.jsx";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { registerForEvent } from "../../../api/eventRegistrations.js";
import { createPaymentOrder, verifyPayment } from "../../../api/payments.js";

const TYPE_COLORS = {
  academic: { bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.30)", text: "#3b82f6", glow: "rgba(59,130,246,0.20)" },
  cultural: { bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.30)", text: "#ec4899", glow: "rgba(236,72,153,0.20)" },
  sports:   { bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.30)", text: "#f97316", glow: "rgba(249,115,22,0.20)" },
  placement:{ bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.30)", text: "#a855f7", glow: "rgba(168,85,247,0.20)" },
  workshop: { bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.30)", text: "#10b981", glow: "rgba(16,185,129,0.20)" },
};

export default function EventCard({ event, index = 0, alreadyRegistered = false, onRegistered, onRequestRegister }) {
  const { isAuthed, user } = useAuth();
  const { showToast } = useToast();
  const [registered, setRegistered] = useState(alreadyRegistered);
  const [loading, setLoading] = useState(false);
  const typeStyle = TYPE_COLORS[event.type] ?? TYPE_COLORS.academic;

const handleConfirm = async () => {
    setLoading(true);
    try {
      const isPaid = event.isPaid && event.price > 0;
      const eid = event._id || event.id;
      if (!isPaid) {
        await registerForEvent(eid);
        setRegistered(true);
        setConfirmOpen(false);
        showToast({ type: "success", title: "Registered!", description: event.title });
        if (onRegistered) onRegistered(eid);
      } else {
        // Paid event — create Razorpay order
        const { order } = await createPaymentOrder(eid);
        if (!window.Razorpay) {
          showToast({ type: "error", title: "Payment unavailable", description: "Razorpay failed to load" });
          return;
        }
        const opts = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "CampusOS.ai",
          description: event.title,
          order_id: order.orderId,
          prefill: { name: user.name || "", email: user.email || "" },
          theme: { color: "#3fe0c5" },
          handler: async (response) => {
            try {
              await verifyPayment({
                eventId: eid,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setRegistered(true);
              setConfirmOpen(false);
              showToast({ type: "success", title: "Paid & Registered!", description: event.title });
              if (onRegistered) onRegistered(eid);
            } catch (err) {
              showToast({ type: "error", title: "Payment failed", description: err.response?.data?.message || err.message });
            }
          },
          modal: {
            ondismiss: () => {
              showToast({ type: "info", title: "Payment cancelled" });
            },
          },
        };
        const rzp = new window.Razorpay(opts);
        rzp.open();
      }
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };


  const date = new Date(event.date);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const fillPct = event.seats > 0 ? Math.round((event.registered / event.seats) * 100) : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-xl hover-lift"
      style={{
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        "--lift-glow": typeStyle.glow,
      }}
    >
      <div className="flex items-start gap-4" style={{ padding: "1.25rem" }}>
        <div
          className="flex shrink-0 flex-col items-center justify-center rounded-lg transition-colors"
          style={{
            height: "64px",
            width: "64px",
            border: "1px solid var(--color-border-strong)",
            backgroundColor: "var(--color-surface-raised)",
          }}
        >
          <span className="font-mono font-semibold text-text-primary" style={{ fontSize: "20px", lineHeight: 1 }}>
            {String(day).padStart(2, "0")}
          </span>
          <span
            className="font-mono"
            style={{
              marginTop: "4px",
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--color-text-tertiary)",
            }}
          >
            {month}
          </span>
        </div>

        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="flex items-start justify-between" style={{ gap: "8px" }}>
            <span
              className="font-mono"
              style={{
                padding: "2px 8px",
                borderRadius: "6px",
                fontSize: "9.5px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                backgroundColor: typeStyle.bg,
                border: `1px solid ${typeStyle.border}`,
                color: typeStyle.text,
              }}
            >
              {event.type}
            </span>
            {event.tag && (
              <span
                className="font-mono"
                style={{
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "9.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  border: "1px solid rgba(13,148,136,0.4)",
                  backgroundColor: "rgba(13,148,136,0.1)",
                  color: "var(--color-primary)",
                }}
              >
                {event.tag}
              </span>
            )}
            {event.isPaid && event.price > 0 ? (
              <span
                className="font-mono"
                style={{
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "9.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  border: "1px solid rgba(245,165,36,0.4)",
                  backgroundColor: "rgba(245,165,36,0.1)",
                  color: "#f5a524",
                  fontWeight: 600,
                }}
              >
                ₹{event.price}
              </span>
            ) : (
              <span
                className="font-mono"
                style={{
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "9.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  border: "1px solid rgba(74,222,128,0.4)",
                  backgroundColor: "rgba(74,222,128,0.08)",
                  color: "#4ade80",
                  fontWeight: 600,
                }}
              >
                Free
              </span>
            )}
          </div>

          <h3
            className="font-semibold text-text-primary"
            style={{ marginTop: "10px", fontSize: "15px", lineHeight: 1.2, letterSpacing: "-0.015em" }}
          >
            {event.title}
          </h3>

          <div
            className="flex flex-wrap items-center text-text-secondary"
            style={{ marginTop: "12px", gap: "12px", fontSize: "11.5px" }}
          >
            <span className="flex items-center" style={{ gap: "6px" }}>
              <Clock size={11} />
              {event.time}
            </span>
            <span className="flex items-center" style={{ gap: "6px" }}>
              <MapPin size={11} />
              {event.venue}
            </span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--color-border)", padding: "1rem 1.25rem" }}>
        <p
          className="text-text-secondary"
          style={{
            fontSize: "12.5px",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.description}
        </p>

        <div className="flex items-center" style={{ marginTop: "12px", gap: "8px" }}>
          <User size={11} style={{ color: "var(--color-text-tertiary)" }} />
          <p
            className="flex-1 text-text-tertiary"
            style={{ fontSize: "11.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}
          >
            {event.speaker}
          </p>
        </div>

        <div style={{ marginTop: "14px" }}>
          <div
            className="flex items-center justify-between font-mono"
            style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)" }}
          >
            <span className="flex items-center" style={{ gap: "5px" }}>
              <Users size={10} />
              {event.registered} / {event.seats}
            </span>
            <span>{fillPct}% full</span>
          </div>
          <div
            className="overflow-hidden"
            style={{ marginTop: "6px", height: "4px", borderRadius: "9999px", backgroundColor: "var(--color-surface-raised)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${fillPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: "100%",
                borderRadius: "9999px",
                backgroundColor: fillPct >= 90 ? "#ef4444" : fillPct >= 70 ? "#f59e0b" : "var(--color-primary)",
              }}
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (!isAuthed) { showToast({ type: "info", title: "Sign in to register" }); return; }
            if (user?.role !== "student") { showToast({ type: "info", title: "Only students can register" }); return; }
            if (registered || loading) return;
            if (onRequestRegister) onRequestRegister(event);
          }}
          disabled={registered || loading}
          className="flex w-full items-center justify-between rounded-lg font-medium transition-all"
          style={{
            border: registered ? "1px solid rgba(74,222,128,0.3)" : "1px solid var(--color-border-strong)",
            backgroundColor: registered ? "rgba(74,222,128,0.08)" : "var(--color-surface-raised)",
            color: registered ? "#4ade80" : "var(--color-text-primary)",
            padding: "10px 14px",
            marginTop: "20px",
            fontSize: "12.5px",
            cursor: registered ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Registering..." : registered ? "Registered" : "Register"}
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : registered ? (
            <Check size={13} />
          ) : (
            <ArrowRight size={13} style={{ color: "var(--color-primary)" }} className="icon-slide" />
          )}
        </button>
      </div>
   </motion.article>
  );
}
