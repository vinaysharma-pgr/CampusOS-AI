// src/layouts/DashboardLayout.jsx
// Shared shell for student + faculty dashboards (sidebar + header + outlet)
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { ScanEye, LayoutDashboard, Calendar, Bell, BookOpen, LogOut, ArrowLeft, Upload, ClipboardCheck, Ticket, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

const NAV_STUDENT = [
  { label: "Overview", to: "/student", icon: LayoutDashboard, end: true },
  { label: "Timetable", to: "/student/timetable", icon: Calendar },
  { label: "Attendance", to: "/student/attendance", icon: ClipboardCheck },
  { label: "My Events", to: "/student/registrations", icon: Ticket },
  { label: "Notices", to: "/student/notices", icon: Bell },
  { label: "Assignments", to: "/student/assignments", icon: BookOpen },
  { label: "Sessions", to: "/settings/sessions", icon: Shield },
];

const NAV_FACULTY = [
  { label: "Overview", to: "/faculty", icon: LayoutDashboard, end: true },
  { label: "My Classes", to: "/faculty/timetable", icon: Calendar },
  { label: "Assignments", to: "/faculty/assignments", icon: BookOpen },
  { label: "Attendance", to: "/faculty/attendance", icon: ClipboardCheck },
  { label: "Send to HOD", to: "/faculty/send-to-hod", icon: Upload },
  { label: "Post Notice", to: "/faculty/notices", icon: Bell },
  { label: "Sessions", to: "/settings/sessions", icon: Shield },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isFaculty = user?.role === "faculty";
  const NAV = isFaculty ? NAV_FACULTY : NAV_STUDENT;
  const roleLabel = isFaculty ? "Faculty" : "Student";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <aside
        className="hidden lg:flex flex-col"
        style={{
          width: "240px",
          borderRight: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div style={{ padding: "20px" }}>
          <Link to="/" className="flex items-center" style={{ gap: "10px" }}>
            <span
              className="flex items-center justify-center rounded-lg"
              style={{
                height: "32px", width: "32px",
                backgroundColor: "rgba(63,224,197,0.1)",
                color: "var(--color-primary)",
                border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
              }}
            >
              <ScanEye size={16} strokeWidth={1.75} />
            </span>
            <span className="font-semibold text-text-primary" style={{ fontSize: "14px" }}>
              CampusOS<span style={{ color: "var(--color-primary)" }}>.ai</span>
            </span>
          </Link>
        </div>

        <div style={{ padding: "0 20px 12px" }}>
          <span
            className="font-mono"
            style={{
              fontSize: "9.5px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--color-text-tertiary)",
            }}
          >
            {roleLabel} portal
          </span>
        </div>

        <nav className="flex flex-col" style={{ padding: "0 12px", gap: "2px", flex: 1 }}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex items-center rounded-lg font-medium transition-colors"
              style={({ isActive }) => ({
                padding: "10px 12px",
                gap: "10px",
                fontSize: "13px",
                backgroundColor: isActive ? "rgba(63,224,197,0.1)" : "transparent",
                color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
              })}
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "20px 12px", borderTop: "1px solid var(--color-border)" }}>
          <Link
            to="/"
            className="flex items-center rounded-lg"
            style={{ padding: "10px 12px", gap: "10px", fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            <ArrowLeft size={15} />
            Back to site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg text-left"
            style={{ padding: "10px 12px", gap: "10px", fontSize: "13px", color: "#f0554d" }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1" style={{ minWidth: 0 }}>
        <header
          className="flex items-center justify-between"
          style={{
            height: "64px",
            padding: "0 1.5rem",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            position: "sticky",
            top: 0,
            zIndex: 30,
            backdropFilter: "blur(20px)",
          }}
        >
          <div>
            <p
              className="font-mono"
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "var(--color-text-tertiary)",
              }}
            >
              Signed in as
            </p>
            <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {user?.name} · <span style={{ color: "var(--color-primary)" }}>{user?.role}</span>
            </p>
          </div>
          <div className="flex items-center" style={{ gap: "10px" }}>
            <span
              className="flex items-center rounded-full font-mono"
              style={{
                padding: "5px 10px",
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
          </div>
        </header>

        <div style={{ padding: "2rem 1.5rem 4rem" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
