// src/pages/student/StudentNotices.jsx
import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { listNotices } from "../../api/notices.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import NoticeCard from "../../components/notices/NoticeCard.jsx";

export default function StudentNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    listNotices()
      .then(setNotices)
      .catch((err) => showToast({ type: "error", title: "Failed to load", description: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? notices
    : filter === "urgent"
    ? notices.filter((n) => n.priority === "urgent")
    : notices.filter((n) => n.category === filter);

  const categories = ["all", "urgent", ...Array.from(new Set(notices.map((n) => n.category)))];

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Notices
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading ? "Loading…" : `${notices.length} notices for you`}
        </p>
      </div>

      {/* Filters */}
      {!loading && notices.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: "6px", marginBottom: "1.25rem" }}>
          {categories.map((c) => {
            const active = filter === c;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className="font-medium capitalize"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  borderRadius: "8px",
                  border: active ? "1px solid var(--color-primary)" : "1px solid var(--color-border-strong)",
                  backgroundColor: active ? "rgba(63,224,197,0.1)" : "var(--color-surface)",
                  color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                  transition: "all 0.15s",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "280px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <Bell size={28} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "16px", fontWeight: 600 }}>No notices here</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>
            {filter === "all" ? "You're all caught up." : "Try a different filter."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "10px" }}>
          {filtered.map((n, i) => (
            <NoticeCard key={n._id} notice={n} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
