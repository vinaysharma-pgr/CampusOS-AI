import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2, Clock, MapPin } from "lucide-react";
import { listUpcomingExams } from "../../api/exams.js";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function StudentExams() {
  const { showToast } = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUpcomingExams()
      .then(setExams)
      .catch((err) => showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message }))
      .finally(() => setLoading(false));
  }, []);

  const grouped = exams.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-text-tertiary)" }}>
          Upcoming exams
        </p>
        <h1 className="text-text-primary" style={{ marginTop: "6px", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Exam schedule
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading ? "Loading…" : `${exams.length} upcoming exam${exams.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "280px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ padding: "3rem 1.5rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <Calendar size={32} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "17px", fontWeight: 600 }}>No upcoming exams</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>When your department schedules exams, they'll appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "1.5rem" }}>
          {dates.map((date) => (
            <div key={date}>
              <div className="flex items-center" style={{ gap: "12px", marginBottom: "10px" }}>
                <p className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>
                  {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <span style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
                <span className="font-mono" style={{ fontSize: "10.5px", color: "var(--color-primary)" }}>
                  {grouped[date].length} exam{grouped[date].length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: "8px" }}>
                {grouped[date].map((e, i) => (
                  <motion.div key={e._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex flex-wrap items-center"
                    style={{ padding: "12px 16px", gap: "12px", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div className="flex items-center" style={{ gap: "8px", marginBottom: "4px" }}>
                        <span className="font-mono" style={{ padding: "2px 7px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                          {e.courseCode}
                        </span>
                        <span className="font-mono" style={{ fontSize: "9.5px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{e.examType}</span>
                      </div>
                      <p className="text-text-primary" style={{ fontSize: "14px", fontWeight: 600 }}>{e.title}</p>
                      <p className="text-text-secondary" style={{ marginTop: "2px", fontSize: "12px" }}>{e.courseName}</p>
                    </div>
                    <div className="flex items-center" style={{ gap: "16px", fontSize: "11.5px", color: "var(--color-text-tertiary)" }}>
                      <span className="flex items-center" style={{ gap: "4px" }}><Clock size={11} /> {e.startTime} · {e.durationMinutes}m</span>
                      {e.room && <span className="flex items-center" style={{ gap: "4px" }}><MapPin size={11} /> {e.room}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
