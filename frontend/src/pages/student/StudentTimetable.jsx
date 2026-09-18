// src/pages/student/StudentTimetable.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2, Clock } from "lucide-react";
import { getMyTimetable } from "../../api/timetables.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import WeeklyGrid from "../../features/timetable/components/WeeklyGrid";
import ClassPill from "../../features/timetable/components/ClassPill";
import { todayClasses, todayName } from "../../features/timetable/utils";

export default function StudentTimetable() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    getMyTimetable()
      .then((data) => setClasses(data.classes || []))
      .catch((err) =>
        showToast({
          type: "error",
          title: "Failed to load timetable",
          description: err.response?.data?.message || err.message,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const today = todayName();
  const todayList = todayClasses(classes);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--color-text-tertiary)",
          }}
        >
          Weekly schedule
        </p>
        <h1 className="text-text-primary" style={{ marginTop: "6px", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Your timetable
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading ? "Loading…" : `${classes.length} classes this week`}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "300px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Today's classes at the top */}
          {today && (
            <div style={{ marginTop: "1.5rem" }}>
              <div className="flex items-center" style={{ gap: "10px", marginBottom: "10px" }}>
                <Clock size={13} style={{ color: "var(--color-primary)" }} />
                <h2
                  className="font-mono"
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "var(--color-primary)",
                  }}
                >
                  Today · {today}
                </h2>
              </div>
              {todayList.length === 0 ? (
                <p className="text-text-secondary" style={{ fontSize: "13px" }}>
                  No classes today. Enjoy the break.
                </p>
              ) : (
                <div className="flex flex-col" style={{ gap: "8px" }}>
                  {todayList.map((c, i) => (
                    <ClassPill key={`today-${i}`} cls={c} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Full week */}
          <div style={{ marginTop: "2rem" }}>
            <div className="flex items-center" style={{ gap: "10px", marginBottom: "12px" }}>
              <Calendar size={13} style={{ color: "var(--color-text-tertiary)" }} />
              <h2
                className="font-mono"
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--color-text-tertiary)",
                }}
              >
                Full week
              </h2>
            </div>
            <WeeklyGrid classes={classes} />
          </div>
        </>
      )}
    </div>
  );
}
