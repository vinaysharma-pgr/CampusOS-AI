import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import { getMyResults } from "../../api/examResults.js";

export default function StudentResults() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyResults()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <Loader2 size={26} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>Failed to load</p>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>{error}</p>
      </div>
    );
  }

  const results = data?.results || [];
  const byCourse = data?.byCourse || [];
  const summary = data?.summary;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-text-tertiary)" }}>
          Your results
        </p>
        <h1 className="text-text-primary" style={{ marginTop: "6px", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Results
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {results.length === 0 ? "No published results yet" : `${summary.coursesCount} course${summary.coursesCount === 1 ? "" : "s"} · ${summary.examsTaken} exams taken`}
        </p>
      </motion.div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ marginTop: "1.5rem", padding: "3rem 1.5rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <BookOpen size={32} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "17px", fontWeight: 600 }}>No results yet</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>Once your faculty enters marks and admin publishes them, they'll appear here.</p>
        </div>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ marginTop: "1.5rem", gap: "10px" }}>
              <StatCard icon={TrendingUp} label="Overall" value={summary.overallPercentage + "%"} accent={summary.overallPercentage >= 60 ? "#4ade80" : "#f5a524"} />
              <StatCard icon={CheckCircle2} label="Passed" value={summary.passedCount} accent="#4ade80" />
              <StatCard icon={XCircle} label="Total exams" value={summary.examsTaken} accent="#3fe0c5" />
              <StatCard icon={BookOpen} label="Marks" value={summary.totalObtained + "/" + summary.totalMax} accent="#a855f7" />
            </div>
          )}

          <div style={{ marginTop: "2rem" }}>
            <h2 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>
              By course
            </h2>
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {byCourse.map((c, i) => (
                <motion.div key={c.courseCode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ padding: "1rem 1.25rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                  <div className="flex items-center justify-between flex-wrap" style={{ gap: "12px", marginBottom: "10px" }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                        {c.courseCode}
                      </span>
                      <p className="text-text-primary" style={{ marginTop: "6px", fontSize: "14px", fontWeight: 600 }}>{c.courseName}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="font-mono" style={{ fontSize: "20px", fontWeight: 700, color: c.percentage >= 60 ? "#4ade80" : c.percentage >= 40 ? "#f5a524" : "#f0554d" }}>{c.percentage}%</p>
                      <p className="font-mono" style={{ marginTop: "2px", fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>{c.totalObtained}/{c.totalMax}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap" style={{ gap: "6px" }}>
                    {c.exams.map((e) => (
                      <span key={e.resultId} className="font-mono"
                        style={{ padding: "3px 9px", borderRadius: "6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, backgroundColor: e.countsTowardTotal === false ? "var(--color-surface-raised)" : e.passed ? "rgba(74,222,128,0.12)" : "rgba(240,85,77,0.12)", color: e.countsTowardTotal === false ? "var(--color-text-tertiary)" : e.passed ? "#4ade80" : "#f0554d" }}>
                        {e.examType}: {e.isAbsent ? "Absent" : e.marksObtained}/{e.maxMarks}{e.countsTowardTotal === false ? " (not counted)" : ""}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={{ padding: "0.875rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
      <div className="flex items-center" style={{ gap: "6px", color: "var(--color-text-tertiary)" }}>
        <Icon size={11} strokeWidth={2} />
        <p className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.14em" }}>{label}</p>
      </div>
      <p className="font-mono" style={{ marginTop: "6px", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, color: accent }}>
        {value}
      </p>
    </div>
  );
}
