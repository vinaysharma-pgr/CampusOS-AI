import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Loader2, Clock, MapPin, CheckCircle2, XCircle, Edit2 } from "lucide-react";
import { listExams } from "../../api/exams.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function FacultyExams() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listExams({ department: user?.department })
      .then(setExams)
      .catch((err) => showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message }))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>Exams</h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading ? "Loading…" : `${exams.length} exam${exams.length === 1 ? "" : "s"} in your department`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <Calendar size={28} style={{ color: "var(--color-text-tertiary)" }} />
          <p className="text-text-primary" style={{ marginTop: "1rem", fontSize: "15px", fontWeight: 600 }}>No exams yet</p>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>Your department admin hasn't scheduled any exams.</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "10px" }}>
          {exams.map((e, i) => (
            <motion.div key={e._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex flex-wrap items-center"
              style={{ padding: "1rem 1.25rem", gap: "16px", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div className="flex items-center" style={{ gap: "8px", marginBottom: "4px" }}>
                  <span className="font-mono" style={{ padding: "2px 7px", borderRadius: "5px", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                    {e.courseCode}
                  </span>
                  <span className="font-mono" style={{ fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{e.examType}</span>
                  {e.isPublished ? (
                    <span className="inline-flex items-center" style={{ gap: "4px", fontSize: "10px", fontWeight: 700, color: "#4ade80" }}>
                      <CheckCircle2 size={10} /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center" style={{ gap: "4px", fontSize: "10px", fontWeight: 700, color: "#f5a524" }}>
                      <XCircle size={10} /> Draft
                    </span>
                  )}
                </div>
                <p className="text-text-primary" style={{ fontSize: "14px", fontWeight: 600 }}>{e.title}</p>
                <div className="flex items-center flex-wrap" style={{ marginTop: "6px", gap: "12px", fontSize: "11.5px", color: "var(--color-text-tertiary)" }}>
                  <span className="flex items-center" style={{ gap: "4px" }}><Calendar size={10} /> {e.date}</span>
                  <span className="flex items-center" style={{ gap: "4px" }}><Clock size={10} /> {e.startTime}</span>
                  {e.room && <span className="flex items-center" style={{ gap: "4px" }}><MapPin size={10} /> {e.room}</span>}
                  <span>· {e.department} · Sem {e.semester}{e.section ? " · " + e.section : ""}</span>
                </div>
              </div>
              <Link to={`/faculty/exams/${e._id}/marks`}
                className="inline-flex items-center justify-center rounded-lg font-semibold"
                style={{ height: "38px", paddingLeft: "16px", paddingRight: "16px", gap: "6px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "12.5px" }}>
                <Edit2 size={13} />
                {e.isPublished ? "View marks" : "Enter marks"}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
