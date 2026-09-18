// src/pages/settings/SessionsPage.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Loader2, Laptop, Smartphone, Monitor, Globe,
  Shield, Trash2, AlertTriangle, Check,
} from "lucide-react";
import { listSessions, revokeSession, revokeOtherSessions } from "../../api/sessions.js";
import { useToast } from "../../contexts/ToastContext.jsx";

function deviceIcon(label = "") {
  const l = label.toLowerCase();
  if (l.includes("android") || l.includes("ios")) return Smartphone;
  if (l.includes("windows") || l.includes("macos") || l.includes("linux")) return Laptop;
  return Monitor;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null); // id being revoked
  const [confirmOthers, setConfirmOthers] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await listSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      showToast({ type: "error", title: "Failed to load sessions", description: err.response?.data?.message || err.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRevoke = async (s) => {
    if (s.isCurrent) return;
    setBusy(s.id);
    try {
      await revokeSession(s.id);
      showToast({ type: "success", title: "Session revoked" });
      setSessions((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    } finally { setBusy(null); }
  };

  const handleRevokeOthers = async () => {
    setBusy("others");
    try {
      const res = await revokeOtherSessions();
      showToast({ type: "success", title: `${res.revoked} session(s) revoked` });
      setConfirmOthers(false);
      await load();
    } catch (err) {
      showToast({ type: "error", title: "Failed", description: err.response?.data?.message || err.message });
    } finally { setBusy(null); }
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      <Link to="/" className="inline-flex items-center" style={{ gap: "8px", fontSize: "12.5px", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
        <ArrowLeft size={13} />
        Back
      </Link>

      <div className="flex items-start justify-between flex-wrap" style={{ gap: "12px", marginBottom: "1.5rem" }}>
        <div>
          <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-text-tertiary)" }}>
            Security
          </p>
          <h1 className="text-text-primary" style={{ marginTop: "6px", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Active sessions
          </h1>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
            Devices currently signed in to your account. Revoke any you don't recognize.
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={() => setConfirmOthers(true)}
            className="inline-flex items-center rounded-lg font-medium"
            style={{
              height: "40px", paddingLeft: "14px", paddingRight: "14px", gap: "8px",
              border: "1px solid rgba(240,85,77,0.3)",
              backgroundColor: "rgba(240,85,77,0.06)",
              color: "#f0554d",
              fontSize: "12.5px",
              cursor: "pointer",
            }}
          >
            <Shield size={13} />
            Revoke other devices
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
          <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ padding: "3rem 1.5rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <Globe size={24} style={{ color: "var(--color-text-tertiary)" }} />
          <p className="text-text-primary" style={{ marginTop: "1rem", fontSize: "15px", fontWeight: 600 }}>No active sessions</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "10px" }}>
          {sessions.map((s, i) => {
            const Icon = deviceIcon(s.deviceLabel);
            const isBusy = busy === s.id;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-center"
                style={{
                  padding: "1rem 1.25rem",
                  gap: "16px",
                  borderRadius: "0.75rem",
                  border: s.isCurrent
                    ? "1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)"
                    : "1px solid var(--color-border)",
                  backgroundColor: s.isCurrent
                    ? "color-mix(in srgb, var(--color-primary) 4%, transparent)"
                    : "var(--color-surface)",
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{
                    height: "42px", width: "42px", borderRadius: "10px",
                    backgroundColor: s.isCurrent
                      ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
                      : "var(--color-surface-raised)",
                    color: s.isCurrent ? "var(--color-primary)" : "var(--color-text-secondary)",
                    border: s.isCurrent
                      ? "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)"
                      : "1px solid var(--color-border-strong)",
                  }}
                >
                  <Icon size={17} />
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center" style={{ gap: "8px", flexWrap: "wrap" }}>
                    <p className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600 }}>
                      {s.deviceLabel}
                    </p>
                    {s.isCurrent && (
                      <span className="font-mono inline-flex items-center" style={{
                        padding: "2px 8px", gap: "4px", borderRadius: "9999px", fontSize: "9.5px",
                        textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700,
                        backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
                        color: "var(--color-primary)",
                      }}>
                        <Check size={9} />
                        This device
                      </span>
                    )}
                  </div>
                  <div className="flex items-center" style={{ marginTop: "4px", gap: "12px", flexWrap: "wrap", fontSize: "11.5px", color: "var(--color-text-tertiary)" }}>
                    {s.ipAddress && s.ipAddress !== "::1" && s.ipAddress !== "127.0.0.1" && <span>IP: {s.ipAddress}</span>}
                    {(!s.ipAddress || s.ipAddress === "::1" || s.ipAddress === "127.0.0.1") && <span>Local network</span>}
                    <span>Signed in {timeAgo(s.createdAt)}</span>
                    <span>Expires {new Date(s.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>

                {!s.isCurrent && (
                  <button
                    onClick={() => handleRevoke(s)}
                    disabled={isBusy}
                    aria-label="Revoke session"
                    style={{
                      height: "32px", width: "32px", borderRadius: "8px",
                      color: "#f0554d",
                      border: "1px solid rgba(240,85,77,0.3)",
                      background: "transparent",
                      cursor: isBusy ? "wait" : "pointer",
                      opacity: isBusy ? 0.5 : 1,
                      flexShrink: 0,
                    }}
                  >
                    {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirm revoke others */}
      <AnimatePresence>
        {confirmOthers && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !busy && setConfirmOthers(false)}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.75)", padding: "1.5rem", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "420px", width: "100%", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "var(--color-surface)" }}
            >
              <div className="flex items-start" style={{ gap: "14px" }}>
                <span className="flex items-center justify-center" style={{ height: "40px", width: "40px", flexShrink: 0, backgroundColor: "rgba(240,85,77,0.1)", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", borderRadius: "10px" }}>
                  <AlertTriangle size={18} />
                </span>
                <div>
                  <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>Revoke all other devices?</p>
                  <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.5 }}>
                    Every session except this one will be signed out immediately.
                  </p>
                </div>
              </div>
              <div className="flex" style={{ marginTop: "1.5rem", gap: "10px" }}>
                <button onClick={() => setConfirmOthers(false)} disabled={busy === "others"} className="flex-1 rounded-lg font-medium" style={{ padding: "10px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", background: "transparent", cursor: "pointer" }}>Cancel</button>
                <button onClick={handleRevokeOthers} disabled={busy === "others"} className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold" style={{ padding: "10px 0", gap: "8px", fontSize: "13px", backgroundColor: "#f0554d", color: "#fff", border: "none", cursor: "pointer" }}>
                  {busy === "others" ? <><Loader2 size={14} className="animate-spin" /> Revoking…</> : "Revoke others"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
