
const CACHE_NAME = "geberit-schichtkalender-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        "/schichtkalender-Geberit/",
        "/schichtkalender-Geberit/manifest.json",
        "/schichtkalender-Geberit/icon-192.png",
        "/schichtkalender-Geberit/icon-512.png"
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("push", event => {
  let data = {
    title: "Geberit Schichtkalender",
    body: "Der Schichtkalender wurde geändert. Tippe hier, um ihn zu öffnen.",
    url: "/schichtkalender-Geberit/"
  };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/schichtkalender-Geberit/icon-192.png",
      badge: "/schichtkalender-Geberit/icon-192.png",
      data: { url: data.url }
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(
    event.notification.data?.url || "/schichtkalender-Geberit/",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      const existing = clients.find(client =>
        client.url.startsWith(self.location.origin + "/schichtkalender-Geberit/")
      );
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
