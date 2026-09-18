// src/pages/EventsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2 } from "lucide-react";
import { EVENT_TYPES } from "../features/events/data/events";
import EventCard from "../features/events/components/EventCard";
import EventFilters from "../features/events/components/EventFilters";
import EventConfirmModal from "../components/events/EventConfirmModal.jsx";
import { listEvents } from "../api/events.js";
import { getMyEventIds, registerForEvent } from "../api/eventRegistrations.js";
import { createPaymentOrder, verifyPayment } from "../api/payments.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

export default function EventsPage() {
  const { isAuthed, user } = useAuth();
  const { showToast } = useToast();

  const [activeType, setActiveType] = useState("all");
  const [apiEvents, setApiEvents] = useState([]);
  const [myEventIds, setMyEventIds] = useState(new Set());
  const [pendingEvent, setPendingEvent] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  const refreshMyIds = async () => {
    try {
      const ids = await getMyEventIds();
      setMyEventIds(new Set(ids.map(String)));
    } catch (err) {
      console.error("Failed to refresh my event IDs:", err.message);
    }
  };

  useEffect(() => {
    listEvents()
      .then((data) => setApiEvents(data || []))
      .catch(() => setApiEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthed && user?.role === "student") refreshMyIds();
  }, [isAuthed, user]);

  const results = useMemo(() => {
    if (activeType === "all") return apiEvents;
    return apiEvents.filter((e) => e.type === activeType);
  }, [activeType, apiEvents]);

  const myEvents = useMemo(() => {
    return results.filter((e) => myEventIds.has(String(e._id || e.id)));
  }, [results, myEventIds]);

  const otherEvents = useMemo(() => {
    return results.filter((e) => !myEventIds.has(String(e._id || e.id)));
  }, [results, myEventIds]);

  const groupedOther = useMemo(() => {
    const map = {};
    otherEvents.forEach((e) => {
      const d = e.date || "unknown";
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [otherEvents]);

  const handleConfirm = async () => {
    if (!pendingEvent) return;
    setConfirmLoading(true);
    try {
      const eid = pendingEvent._id || pendingEvent.id;
      const isPaid = pendingEvent.isPaid && pendingEvent.price > 0;
      if (!isPaid) {
        await registerForEvent(eid);
        await refreshMyIds();
        setPendingEvent(null);
        showToast({ type: "success", title: "Registered!", description: pendingEvent.title });
      } else {
        const { order } = await createPaymentOrder(eid);
        if (!window.Razorpay) {
          showToast({ type: "error", title: "Payment unavailable" });
          setConfirmLoading(false);
          return;
        }
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "CampusOS.ai",
          description: pendingEvent.title,
          order_id: order.orderId,
          prefill: { name: user.name || "", email: user.email || "" },
          theme: { color: "#3fe0c5" },
          handler: async (r) => {
            try {
              await verifyPayment({
                eventId: eid,
                razorpay_order_id: r.razorpay_order_id,
                razorpay_payment_id: r.razorpay_payment_id,
                razorpay_signature: r.razorpay_signature,
              });
              await refreshMyIds();
              setPendingEvent(null);
              showToast({ type: "success", title: "Paid & Registered!", description: pendingEvent.title });
            } catch (err) {
              showToast({ type: "error", title: "Payment verification failed", description: err.response?.data?.message || err.message });
            }
          },
          modal: { ondismiss: () => setConfirmLoading(false) },
        });
        rzp.open();
      }
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <section style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
      <div style={CONTAINER_STYLE}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
          style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto", marginBottom: "3.5rem" }}
        >
          <span className="inline-flex items-center" style={{ gap: "8px", padding: "6px 14px 6px 8px", borderRadius: "9999px", border: "1px solid rgba(13,148,136,0.25)", backgroundColor: "rgba(13,148,136,0.06)" }}>
            <span className="flex items-center justify-center rounded-full" style={{ height: "22px", width: "22px", backgroundColor: "rgba(13,148,136,0.15)", color: "#0d9488" }}>
              <Calendar size={11} strokeWidth={2} />
            </span>
            <span className="font-mono font-medium" style={{ fontSize: "10.5px", color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.14em" }}>Campus Events</span>
          </span>
          <h1 className="text-text-primary" style={{ marginTop: "1.5rem", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            Everything happening on campus.
          </h1>
          <p className="text-text-secondary" style={{ marginTop: "1.5rem", fontSize: "16px", lineHeight: 1.6 }}>
            Lectures, workshops, fests, sports, and placement drives - all in one place.
          </p>
        </motion.div>

        <div style={{ marginBottom: "2.5rem" }}>
          <EventFilters types={EVENT_TYPES} active={activeType} onChange={setActiveType} count={results.length} />
        </div>

        {!eventsLoading && isAuthed && user?.role === "student" && myEvents.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: "3rem" }}>
            <div className="flex items-center" style={{ gap: "12px", marginBottom: "1.25rem" }}>
              <CheckCircle2 size={14} style={{ color: "var(--color-primary)" }} />
              <h2 className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-primary)", fontWeight: 700 }}>
                Your registrations ({myEvents.length})
              </h2>
              <span className="flex-1" style={{ height: "1px", backgroundColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "1rem" }}>
              {myEvents.map((e, i) => (
                <EventCard key={e._id || e.id} event={e} index={i} alreadyRegistered={true} onRegistered={() => {}} onRequestRegister={() => {}} />
              ))}
            </div>
          </motion.div>
        )}

        {eventsLoading ? (
          <div className="flex items-center justify-center" style={{ minHeight: "260px" }}>
            <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>Loading events...</span>
          </div>
        ) : otherEvents.length === 0 && myEvents.length === 0 ? (
          <div className="flex items-center justify-center" style={{ minHeight: "260px", borderRadius: "1rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
            <p className="font-mono" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>No events in this category</p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: "2.5rem" }}>
            {groupedOther.map(([date, list]) => {
              const d = new Date(date);
              const label = isNaN(d) ? date : d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
              return (
                <div key={date}>
                  <motion.div initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="flex items-center" style={{ gap: "12px", marginBottom: "1rem" }}>
                    <p className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>{label}</p>
                    <span className="flex-1" style={{ height: "1px", backgroundColor: "var(--color-border)" }} />
                    <span className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#0d9488" }}>{list.length} {list.length === 1 ? "event" : "events"}</span>
                  </motion.div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "1rem" }}>
                    {list.map((e, i) => (
                      <EventCard key={e._id || e.id} event={e} index={i} alreadyRegistered={false} onRegistered={() => refreshMyIds()} onRequestRegister={(evt) => setPendingEvent(evt)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EventConfirmModal open={!!pendingEvent} event={pendingEvent} onClose={() => !confirmLoading && setPendingEvent(null)} onConfirm={handleConfirm} loading={confirmLoading} />
    </section>
  );
}
