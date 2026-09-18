// src/layouts/AdminLayout.jsx
import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanEye, LayoutDashboard, Building2, Calendar, Bell, Users,
  LogOut, ArrowLeft, Command, Search, Settings, CalendarClock, Inbox, ClipboardCheck, ScrollText,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import NotificationBell from "../components/notifications/NotificationBell.jsx";
import { listHodSubmissions } from "../api/hodSubmissions.js";

const NAV = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true, shortcut: "1" },
  { label: "Facilities", to: "/admin/facilities", icon: Building2, shortcut: "2" },
  { label: "Events", to: "/admin/events", icon: Calendar, shortcut: "3" },
  { label: "Notices", to: "/admin/notices", icon: Bell, shortcut: "4" },
  { label: "Timetable", to: "/admin/timetable", icon: CalendarClock, shortcut: "5" },
  { label: "Attendance", to: "/admin/attendance", icon: ClipboardCheck, shortcut: "6" },
  { label: "HOD Inbox", to: "/admin/hod-inbox", icon: Inbox, shortcut: "7" },
  { label: "Audit Logs", to: "/admin/audit-logs", icon: ScrollText, shortcut: "8" },
  { label: "Users", to: "/admin/users", icon: Users, shortcut: "6" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pendingHod, setPendingHod] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        const items = await listHodSubmissions();
        if (mounted) setPendingHod(items.filter((i) => i.status === "pending").length);
      } catch {}
    };
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === "Escape") setPaletteOpen(false);
      if (e.altKey && ["1", "2", "3", "4", "5", "6", "7", "8"].includes(e.key)) {
        e.preventDefault();
        const target = NAV.find((n) => n.shortcut === e.key);
        if (target) navigate(target.to);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <aside
        className="hidden lg:flex flex-col"
        style={{
          width: "260px",
          borderRight: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div style={{ padding: "20px 20px 16px" }}>
          <Link to="/" className="flex items-center" style={{ gap: "10px" }}>
            <span
              className="flex items-center justify-center rounded-xl"
              style={{
                height: "34px",
                width: "34px",
                backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                color: "var(--color-primary)",
                border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
              }}
            >
              <ScanEye size={17} strokeWidth={1.75} />
            </span>
            <div>
              <span className="font-semibold text-text-primary" style={{ fontSize: "14px", letterSpacing: "-0.01em" }}>
                CampusOS<span style={{ color: "var(--color-primary)" }}>.ai</span>
              </span>
              <p
                className="font-mono"
                style={{
                  marginTop: "2px",
                  fontSize: "9px",
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                }}
              >
                Admin Console
              </p>
            </div>
          </Link>
        </div>

        <div style={{ padding: "0 12px 16px" }}>
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex w-full items-center rounded-lg"
            style={{
              padding: "8px 10px",
              gap: "8px",
              backgroundColor: "var(--color-surface-raised)",
              border: "1px solid var(--color-border-strong)",
              color: "var(--color-text-tertiary)",
              fontSize: "12px",
            }}
          >
            <Search size={13} />
            <span style={{ flex: 1, textAlign: "left" }}>Jump to…</span>
            <kbd
              className="font-mono"
              style={{
                padding: "2px 6px",
                fontSize: "9px",
                borderRadius: "4px",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-strong)",
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        <nav className="flex flex-col" style={{ padding: "0 12px", gap: "2px", flex: 1 }}>
          <p
            className="font-mono"
            style={{
              padding: "6px 12px",
              fontSize: "9.5px",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--color-text-tertiary)",
            }}
          >
            Workspace
          </p>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="group relative flex items-center rounded-lg font-medium transition-colors"
              style={({ isActive }) => ({
                padding: "9px 12px",
                gap: "10px",
                fontSize: "13px",
                backgroundColor: isActive ? "rgba(63,224,197,0.1)" : "transparent",
                color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="admin-active"
                      className="absolute left-0"
                      style={{ top: "20%", bottom: "20%", width: "3px", borderRadius: "9999px", backgroundColor: "var(--color-primary)" }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <item.icon size={15} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.to === "/admin/hod-inbox" && pendingHod > 0 && (
                    <span className="font-mono" style={{ minWidth: "20px", height: "18px", padding: "0 6px", borderRadius: "9999px", backgroundColor: "#f0554d", color: "#fff", fontSize: "10px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {pendingHod}
                    </span>
                  )}
                  <kbd
                    className="font-mono opacity-0 transition-opacity group-hover:opacity-60"
                    style={{ fontSize: "9px", padding: "2px 5px", borderRadius: "4px", backgroundColor: "var(--color-surface-raised)" }}
                  >
                    ⌥{item.shortcut}
                  </kbd>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "12px", borderTop: "1px solid var(--color-border)" }}>
          <div className="flex items-center rounded-xl" style={{ padding: "10px", gap: "10px", backgroundColor: "var(--color-surface-raised)" }}>
            <span
              className="flex items-center justify-center rounded-full font-semibold"
              style={{ height: "32px", width: "32px", backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)", fontSize: "13px", flexShrink: 0 }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="text-text-primary" style={{ fontSize: "12.5px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </p>
              <p className="font-mono" style={{ fontSize: "9.5px", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                {user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="flex items-center justify-center rounded-md"
              style={{ height: "28px", width: "28px", color: "var(--color-text-tertiary)", flexShrink: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f0554d"; e.currentTarget.style.backgroundColor = "rgba(240,85,77,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-tertiary)"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <LogOut size={13} />
            </button>
          </div>
          <Link
            to="/"
            className="flex items-center rounded-lg"
            style={{ marginTop: "8px", padding: "8px 12px", gap: "10px", fontSize: "12.5px", color: "var(--color-text-tertiary)" }}
          >
            <ArrowLeft size={13} />
            Back to public site
          </Link>
        </div>
      </aside>

      <main className="flex-1" style={{ minWidth: 0 }}>
        <header
          className="flex items-center justify-between"
          style={{
            height: "64px",
            padding: "0 1.5rem",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-glass)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div>
            <p className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-text-tertiary)" }}>
              Signed in as
            </p>
            <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-text-primary)", marginTop: "2px" }}>
              {user?.name} · <span style={{ color: "var(--color-primary)" }}>{user?.role}</span>
            </p>
          </div>

          <div className="flex items-center" style={{ gap: "8px" }}>
            <span
              className="flex items-center rounded-full font-mono"
              style={{
                padding: "6px 12px",
                gap: "6px",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                backgroundColor: "rgba(74,222,128,0.08)",
                border: "1px solid rgba(74,222,128,0.25)",
                color: "#4ade80",
              }}
            >
              <span className="rounded-full animate-pulse" style={{ height: "6px", width: "6px", backgroundColor: "#4ade80" }} />
              Live
            </span>
            <NotificationBell />
            <button
              aria-label="Settings"
              className="flex items-center justify-center rounded-lg"
              style={{ height: "36px", width: "36px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)" }}
            >
              <Settings size={15} />
            </button>
          </div>
        </header>

        <div style={{ padding: "2rem 1.5rem 4rem" }}>
          <Outlet />
        </div>
      </main>

      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaletteOpen(false)}
            className="fixed inset-0 z-50 flex items-start justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", paddingTop: "15vh" }}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="overflow-hidden rounded-2xl"
              style={{
                width: "100%",
                maxWidth: "520px",
                border: "1px solid var(--color-border-strong)",
                backgroundColor: "var(--color-surface)",
                boxShadow: "0 32px 80px -12px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-center" style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border)", gap: "10px" }}>
                <Command size={15} style={{ color: "var(--color-text-tertiary)" }} />
                <input
                  autoFocus
                  placeholder="Search pages, actions, or jump to…"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "14px", color: "var(--color-text-primary)" }}
                />
                <kbd
                  className="font-mono"
                  style={{
                    padding: "3px 7px",
                    fontSize: "9.5px",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-surface-raised)",
                    color: "var(--color-text-tertiary)",
                    border: "1px solid var(--color-border-strong)",
                  }}
                >
                  ESC
                </kbd>
              </div>
              <div style={{ padding: "8px" }}>
                <p
                  className="font-mono"
                  style={{
                    padding: "6px 10px",
                    fontSize: "9.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  Navigate
                </p>
                {NAV.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => { setPaletteOpen(false); navigate(item.to); }}
                    className="flex w-full items-center rounded-lg"
                    style={{ padding: "10px 12px", gap: "12px", color: "var(--color-text-primary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <span
                      className="flex items-center justify-center rounded-md"
                      style={{ height: "28px", width: "28px", backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)", color: "var(--color-primary)" }}
                    >
                      <item.icon size={14} />
                    </span>
                    <span style={{ flex: 1, textAlign: "left", fontSize: "13.5px" }}>{item.label}</span>
                    <kbd
                      className="font-mono"
                      style={{ padding: "2px 6px", fontSize: "9.5px", borderRadius: "4px", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-tertiary)" }}
                    >
                      ⌥{item.shortcut}
                    </kbd>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
