// src/hooks/usePushNotifications.js
import { useCallback, useEffect, useState } from "react";
import { getVapidPublicKey, subscribePush, unsubscribePush } from "../api/push.js";
import { useAuth } from "../contexts/AuthContext.jsx";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { isAuthed } = useAuth();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(ok);
    if (ok) {
      setPermission(Notification.permission);
      navigator.serviceWorker.register("/service-worker.js").catch((e) =>
        console.error("SW registration failed:", e)
      );
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported || !isAuthed) return;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") throw new Error("Permission denied");

      const reg = await navigator.serviceWorker.ready;
      const publicKey = await getVapidPublicKey();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await subscribePush(sub.toJSON());
      setSubscribed(true);
      console.log("✅ Push subscription created");
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supported, isAuthed]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
      return true;
    } finally {
      setLoading(false);
    }
  }, [supported]);

  return { supported, permission, subscribed, loading, subscribe, unsubscribe };
}
