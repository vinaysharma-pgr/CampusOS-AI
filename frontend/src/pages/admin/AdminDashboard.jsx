import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, Plus, ArrowUpRight, Calendar, Users, Activity,
  TrendingUp, Clock, Zap,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { listFacilities } from "../../api/facilities.js";

const SPARKLINE = [22, 34, 28, 45, 38, 52, 48, 62, 58, 71, 65, 78];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listFacilities()
      .then(setFacilities)
      .catch(() => setFacilities([]))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const stats = [
    { icon: Building2, label: "Facilities", value: loading ? "…" : facilities.length, delta: "+2 this month", accent: "var(--color-primary)" },
    { icon: Calendar, label: "Events", value: "0", delta: "Next: none", accent: "#a855f7" },
    { icon: Users, label: "Users", value: "1", delta: "Active today", accent: "#f59e0b" },
    { icon: Activity, label: "Live now", value: facilities.filter((f) => f.live?.status === "open").length, delta: "All systems go", accent: "#4ade80" },
  ];

  return (
    <div>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--color-text-tertiary)",
          }}
        >
          {today}
        </p>
        <h1
          className="text-text-primary"
          style={{ marginTop: "8px", fontSize: "32px", fontWeight: 600, letterSpacing: "-0.03em" }}
        >
          Welcome back, <span style={{ color: "var(--color-primary)" }}>{user?.name?.split(" ")[0]}</span>.
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "8px", fontSize: "14px" }}>
          Here's what's happening on CampusOS today.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ marginTop: "2rem", gap: "12px" }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className="relative overflow-hidden"
            style={{
              padding: "1.25rem",
              borderRadius: "1rem",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <div
              className="pointer-events-none absolute"
              style={{
                top: "-3rem",
                right: "-3rem",
                height: "8rem",
                width: "8rem",
                borderRadius: "9999px",
                backgroundColor: s.accent,
                opacity: 0.06,
                filter: "blur(30px)",
              }}
            />
            <div className="flex items-start justify-between">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  height: "34px",
                  width: "34px",
                  backgroundColor: `${s.accent}15`,
                  color: s.accent,
                  border: `1px solid ${s.accent}40`,
                }}
              >
                <s.icon size={15} strokeWidth={1.75} />
              </div>
              {i === 0 && (
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                  <polyline
                    points={SPARKLINE.map((v, idx) => `${idx * 5.5},${20 - (v / 100) * 18}`).join(" ")}
                    stroke={s.accent}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <p
              className="font-mono text-text-primary"
              style={{ marginTop: "1rem", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              {s.value}
            </p>
            <div className="flex items-center justify-between" style={{ marginTop: "4px" }}>
              <p className="text-text-tertiary" style={{ fontSize: "11.5px" }}>{s.label}</p>
              <p className="font-mono" style={{ fontSize: "9.5px", color: s.accent }}>{s.delta}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]" style={{ marginTop: "2.5rem", gap: "1.5rem" }}>
        {/* Quick actions */}
        <div>
          <h2
            className="font-mono"
            style={{
              fontSize: "10.5px",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--color-text-tertiary)",
              marginBottom: "1rem",
            }}
          >
            Quick actions
          </h2>
          <div className="flex flex-col" style={{ gap: "10px" }}>
            <ActionCard
              to="/admin/facilities"
              icon={Building2}
              accent="var(--color-primary)"
              title="Manage facilities"
              description="Add, edit, or remove campus facilities"
            />
            <ActionCard
              to="/admin/facilities/new"
              icon={Plus}
              accent="var(--color-primary)"
              title="Add new facility"
              description="Creates it live for every student"
              primary
            />
            <ActionCard
              to="/admin/events"
              icon={Calendar}
              accent="#a855f7"
              title="Manage events"
              description="Publish events to the campus calendar"
            />
          </div>
        </div>

        {/* Activity */}
        <div>
          <h2
            className="font-mono"
            style={{
              fontSize: "10.5px",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--color-text-tertiary)",
              marginBottom: "1rem",
            }}
          >
            Recent activity
          </h2>
          <div
            style={{
              padding: "1rem",
              borderRadius: "1rem",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            {[
              { icon: Zap, text: "You signed in", time: "Just now", accent: "#4ade80" },
              { icon: TrendingUp, text: `${facilities.length} facilities online`, time: "1 min ago", accent: "var(--color-primary)" },
              { icon: Clock, text: "System healthy", time: "5 min ago", accent: "var(--color-primary)" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start"
                style={{
                  padding: "10px 0",
                  gap: "12px",
                  borderBottom: i < 2 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <span
                  className="flex items-center justify-center rounded-md"
                  style={{
                    height: "26px",
                    width: "26px",
                    backgroundColor: `${item.accent}15`,
                    color: item.accent,
                    flexShrink: 0,
                  }}
                >
                  <item.icon size={12} />
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "12.5px", color: "var(--color-text-primary)" }}>{item.text}</p>
                  <p className="font-mono" style={{ marginTop: "2px", fontSize: "10px", color: "var(--color-text-tertiary)" }}>
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, accent, title, description, primary }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl transition-all"
      style={{
        padding: "1.25rem",
        border: primary ? `1px solid ${accent}40` : "1px solid var(--color-border)",
        backgroundColor: primary ? `${accent}08` : "var(--color-surface)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div className="flex items-center" style={{ gap: "14px" }}>
        <span
          className="flex items-center justify-center rounded-lg"
          style={{
            height: "42px",
            width: "42px",
            backgroundColor: primary ? accent : `${accent}15`,
            color: primary ? "var(--color-primary-fg)" : accent,
            border: primary ? "none" : `1px solid ${accent}40`,
          }}
        >
          <Icon size={18} strokeWidth={primary ? 2.5 : 1.75} />
        </span>
        <div>
          <p className="text-text-primary" style={{ fontSize: "14px", fontWeight: 600 }}>{title}</p>
          <p className="text-text-secondary" style={{ marginTop: "2px", fontSize: "12.5px" }}>{description}</p>
        </div>
      </div>
      <ArrowUpRight
        size={15}
        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        style={{ color: primary ? accent : "var(--color-text-tertiary)" }}
      />
    </Link>
  );
}