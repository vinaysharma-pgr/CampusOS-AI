// src/contexts/NotificationContext.jsx
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import * as api from "../api/notifications.js";
import { useAuth } from "./AuthContext.jsx";
import { playChime } from "../utils/notificationSound.js";

const NotificationContext = createContext(null);
const MUTE_KEY = "campusos_notif_muted";

export function NotificationProvider({ children }) {
  const { isAuthed, user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; }
  });
  const [toasts, setToasts] = useState([]);
  const socketRef = useRef(null);

  // ─── Load on login ───
  const refresh = useCallback(async () => {
    if (!isAuthed) return;
    setLoading(true);
    try {
      const data = await api.listNotifications();
      setItems(data.notifications || []);
      setUnread(data.unread || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err.message);
    } finally { setLoading(false); }
  }, [isAuthed]);

  useEffect(() => {
    if (isAuthed) refresh();
    else { setItems([]); setUnread(0); }
  }, [isAuthed, refresh]);

  // ─── Socket.io connection ───
  // Tier 1+2: JWT lives in an httpOnly cookie. The socket handshake carries
  // that cookie automatically because of withCredentials: true.
  useEffect(() => {
    if (!isAuthed) {
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const origin = apiUrl.replace(/\/api\/?$/, "");

    const socket = io(origin, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => console.log("🔔 Socket connected:", socket.id));
    socket.on("disconnect", (reason) => console.log("🔌 Socket disconnected:", reason));
    socket.on("connect_error", (err) => console.warn("Socket error:", err.message));

    socket.on("notification", (n) => {
      console.log("🔔 New notification:", n.title);
      setItems((prev) => [n, ...prev].slice(0, 50));
      setUnread((u) => u + 1);
      pushToast(n);
      if (!muted) playChime({ muted });
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [isAuthed, muted]);

  // ─── Toast queue ───
  const pushToast = (n) => {
    const id = n._id || Math.random().toString(36).slice(2);
    setToasts((prev) => {
      if (prev.find((t) => t.id === id)) return prev;
      return [...prev, { id, notification: n }];
    });
    setTimeout(() => dismissToast(id), 6000);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ─── Actions ───
  const markRead = useCallback(async (id) => {
    try {
      await api.markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch (err) { console.error(err.message); }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch (err) { console.error(err.message); }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await api.deleteNotification(id);
      setItems((prev) => prev.filter((n) => n._id !== id));
    } catch (err) { console.error(err.message); }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try { localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  }, []);

  return (
    <NotificationContext.Provider value={{
      items, unread, loading, toasts, muted,
      refresh, markRead, markAllRead, remove, toggleMute, dismissToast,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside <NotificationProvider>");
  return ctx;
}
