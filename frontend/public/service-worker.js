// public/service-worker.js
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "CampusOS", body: event.data.text() };
  }

  const title = payload.title || "CampusOS AI";
  const options = {
    body: payload.body || "",
    tag: payload.tag || "campusos",
    data: { url: payload.url || "/" },
    vibrate: payload.priority === "urgent" ? [200, 100, 200] : [100],
    requireInteraction: payload.priority === "urgent",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
