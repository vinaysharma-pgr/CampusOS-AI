// src/pages/student/StudentRegistrations.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Ticket, Loader2, ArrowRight, Users } from "lucide-react";
import { listMyRegistrations } from "../../api/eventRegistrations.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function StudentRegistrations() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listMyRegistrations()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const groupLabel = user?.section && user?.semester
    ? user.section + " - Year " + Math.ceil(Number(user.semester) / 2)
    : null;

  const upcoming = items.filter((r) => r.eventDate >= new Date().toISOString().slice(0, 10));
  const past = items.filter((r) => r.eventDate < new Date().toISOString().slice(0, 10));

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-text-tertiary)" }}>
          Your events
        </p>
        <h1 className="text-text-primary" style={{ marginTop: "6px", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          My Registrations
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading ? "Loading..." : items.length + " " + (items.length === 1 ? "event" : "events") + " registered" + (groupLabel ? " - " + groupLabel : "")}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "280px" }}>
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ marginTop: "1.5rem", minHeight: "280px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <Ticket size={32} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "17px", fontWeight: 600 }}>No registrations yet</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", maxWidth: "40ch", fontSize: "13px", lineHeight: 1.5 }}>
            Browse the events page and register for lectures, workshops, fests, and more.
          </p>
          <Link to="/events" className="inline-flex items-center rounded-lg font-semibold"
            style={{ marginTop: "1.25rem", height: "40px", paddingLeft: "20px", paddingRight: "20px", gap: "6px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", textDecoration: "none", fontSize: "13px" }}>
            Browse events <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ marginTop: "1.75rem" }}>
              <h2 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-primary)", marginBottom: "12px" }}>
                Upcoming ({upcoming.length})
              </h2>
              <div className="flex flex-col" style={{ gap: "10px" }}>
                {upcoming.map((r, i) => <RegCard key={r._id} reg={r} index={i} />)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h2 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>
                Past ({past.length})
              </h2>
              <div className="flex flex-col" style={{ gap: "10px", opacity: 0.7 }}>
                {past.map((r, i) => <RegCard key={r._id} reg={r} index={i} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RegCard({ reg, index }) {
  const isPast = reg.eventDate < new Date().toISOString().slice(0, 10);
  const d = new Date(reg.eventDate);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.04 }}
      className="flex items-center"
      style={{ padding: "1rem 1.25rem", gap: "16px", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
      <div className="flex flex-col items-center justify-center shrink-0"
        style={{ height: "58px", width: "58px", borderRadius: "10px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)" }}>
        <span className="font-mono" style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1 }}>{String(day).padStart(2, "0")}</span>
        <span className="font-mono" style={{ marginTop: "3px", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>{month}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center" style={{ gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span className="font-mono" style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
            {reg.eventType}
          </span>
          {isPast ? (
            <span className="font-mono" style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-tertiary)" }}>
              Completed
            </span>
          ) : (
            <span className="font-mono" style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "rgba(74,222,128,0.15)", color: "#4ade80" }}>
              Registered
            </span>
          )}
        </div>
        <p className="text-text-primary" style={{ fontSize: "14.5px", fontWeight: 600, lineHeight: 1.3 }}>{reg.eventTitle}</p>
        <div className="flex items-center flex-wrap" style={{ marginTop: "6px", gap: "12px", fontSize: "11.5px", color: "var(--color-text-tertiary)" }}>
          <span className="flex items-center" style={{ gap: "4px" }}><Clock size={10} />{reg.eventTime}</span>
          <span className="flex items-center" style={{ gap: "4px" }}><MapPin size={10} />{reg.eventVenue}</span>
        </div>
      </div>
    </motion.div>
  );
}
