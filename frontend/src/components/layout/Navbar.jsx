// src/components/layout/Navbar.jsx
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ScanEye, AlertTriangle, ArrowUpRight, LayoutDashboard, LogOut, User, Shield } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";
import NotificationBell from "../notifications/NotificationBell.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

const NAV_LINKS = [
  { label: "Platform", to: "/features" },
  { label: "Facilities", to: "/facilities" },
  { label: "Events", to: "/events" },
  { label: "Heatmap", to: "/heatmap" },
  { label: "AI", to: "/ai" },
];

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

export default function Navbar({ onOpenSOS }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthed, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useLockBodyScroll(menuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = () => setUserMenuOpen(false);
    setTimeout(() => window.addEventListener("click", handler), 0);
    return () => window.removeEventListener("click", handler);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        transition: "all 0.3s",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        backgroundColor: scrolled ? "var(--color-glass)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div style={{ ...CONTAINER_STYLE, display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        <Link to="/" className="flex items-center" style={{ gap: "10px" }}>
          <span className="flex items-center justify-center rounded-lg" style={{ height: "32px", width: "32px", backgroundColor: "rgba(63,224,197,0.1)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}>
            <ScanEye size={16} strokeWidth={1.75} />
          </span>
          <span className="font-semibold text-text-primary" style={{ fontSize: "14.5px", letterSpacing: "-0.015em" }}>
            CampusOS<span style={{ color: "var(--color-primary)" }}>.ai</span>
          </span>
        </Link>

        <nav className="hidden items-center lg:flex" style={{ gap: "6px" }}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="relative rounded-lg font-medium transition-colors"
              style={({ isActive }) => ({ padding: "8px 14px", fontSize: "13px", color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)" })}
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-lg" style={{ backgroundColor: "var(--color-hover)" }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center lg:flex" style={{ gap: "8px" }}>
          <ThemeToggle />
          <NotificationBell />
          <button onClick={onOpenSOS}
            aria-label="Emergency SOS"
            className="flex items-center rounded-lg"
            style={{ height: "36px", gap: "6px", paddingLeft: "10px", paddingRight: "10px", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "rgba(240,85,77,0.06)", color: "#f0554d" }}
          >
            <AlertTriangle size={13} strokeWidth={2.5} />
            <span className="font-mono font-semibold" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>SOS</span>
          </button>

          {isAuthed ? (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setUserMenuOpen((o) => !o); }}
                className="flex items-center rounded-full"
                style={{ height: "36px", gap: "8px", paddingLeft: "6px", paddingRight: "14px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border-strong)" }}
              >
                <span className="flex items-center justify-center rounded-full" style={{ height: "26px", width: "26px", backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)", fontSize: "11px", fontWeight: 700 }}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
                <span className="font-medium text-text-primary" style={{ fontSize: "12.5px" }}>
                  {user?.name?.split(" ")[0] || "User"}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 rounded-xl"
                    style={{ top: "calc(100% + 8px)", minWidth: "220px", padding: "6px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "0 20px 60px -12px rgba(0,0,0,0.4)" }}
                  >
                    <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border)" }}>
                      <p className="text-text-primary" style={{ fontSize: "13px", fontWeight: 600 }}>{user?.name}</p>
                      <p className="text-text-tertiary" style={{ fontSize: "11px", marginTop: "2px" }}>{user?.email}</p>
                      <span className="inline-flex rounded-full" style={{ marginTop: "6px", padding: "2px 8px", fontSize: "9.5px", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", backgroundColor: "rgba(63,224,197,0.1)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}>
                        {user?.role}
                      </span>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin/facilities"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center rounded-lg"
                        style={{ padding: "10px 12px", gap: "10px", fontSize: "13px", color: "var(--color-text-primary)" }}
                      >
                        <LayoutDashboard size={14} /> Admin Panel
                      </Link>
                    )}                  <Link
                    to={user?.role === "admin" ? "/admin" : user?.role === "faculty" ? "/faculty" : "/student"}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center rounded-lg"
                    style={{ padding: "10px 12px", gap: "10px", fontSize: "13px", color: "var(--color-text-primary)" }}
                  >
                    <User size={14} /> My Dashboard
                  </Link>

                    <Link
                      to="/settings/sessions"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center rounded-lg"
                      style={{ padding: "10px 12px", gap: "10px", fontSize: "13px", color: "var(--color-text-primary)" }}
                    >
                      <Shield size={14} /> Sessions
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center rounded-lg text-left"
                      style={{ padding: "10px 12px", gap: "10px", fontSize: "13px", color: "#f0554d" }}
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center rounded-full font-medium transition-all"
                style={{ height: "36px", paddingLeft: "16px", paddingRight: "16px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface)", color: "var(--color-text-primary)", fontSize: "12.5px" }}
              >
                Sign in
              </Link>
              <Link
                to="/signup/otp"
                className="group inline-flex items-center rounded-full font-semibold transition-all hover:opacity-90"
                style={{ height: "36px", gap: "6px", paddingLeft: "16px", paddingRight: "16px", backgroundColor: "var(--color-text-primary)", color: "var(--color-background)", fontSize: "12.5px", letterSpacing: "-0.015em" }}
              >
                Get started
                <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center lg:hidden" style={{ gap: "8px" }}>
          <button
            onClick={onOpenSOS}
            aria-label="Emergency SOS"
            className="flex items-center justify-center rounded-lg"
            style={{ height: "36px", width: "36px", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "rgba(240,85,77,0.06)", color: "#f0554d" }}
          >
            <AlertTriangle size={14} strokeWidth={2.5} />
          </button>
          <ThemeToggle />
          <NotificationBell />
          <button onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center justify-center rounded-lg text-text-primary"
            style={{ height: "36px", width: "36px", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface)" }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.65, 0, 0.35, 1] }}
            className="overflow-hidden lg:hidden"
            style={{ borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <div className="flex flex-col" style={{ padding: "20px", gap: "4px" }}>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg font-medium"
                  style={({ isActive }) => ({ padding: "12px 16px", fontSize: "14px", backgroundColor: isActive ? "var(--color-hover)" : "transparent", color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)" })}
                >
                  {link.label}
                </NavLink>
              ))}
              {isAuthed ? (
                <>
                  {isAdmin && (
                    <Link to="/admin/facilities" onClick={() => setMenuOpen(false)} className="rounded-lg font-medium" style={{ padding: "12px 16px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
                      Admin Panel
                    </Link>
                  )}                  <Link
                    to={user?.role === "admin" ? "/admin" : user?.role === "faculty" ? "/faculty" : "/student"}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center rounded-lg"
                    style={{ padding: "10px 12px", gap: "10px", fontSize: "13px", color: "var(--color-text-primary)" }}
                  >
                    <User size={14} /> My Dashboard
                  </Link>

                  <button onClick={handleLogout} className="rounded-lg text-left font-medium" style={{ padding: "12px 16px", fontSize: "14px", color: "#f0554d" }}>
                    Sign out
                  </button>
                </>
              ) : (
                <div style={{ marginTop: "12px", paddingTop: "16px", borderTop: "1px solid var(--color-border)" }}>
                  <Link to="/signup/otp" onClick={() => setMenuOpen(false)} className="flex items-center justify-center rounded-full font-semibold" style={{ padding: "12px 0", gap: "6px", fontSize: "13px", backgroundColor: "var(--color-text-primary)", color: "var(--color-background)" }}>
                    Get started <ArrowUpRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
