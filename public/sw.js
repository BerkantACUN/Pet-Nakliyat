// Patiyolu service worker — placeholder
// Gerçek PWA davranışı Sprint 8'de eklenecek (offline cache, push notification vb.)
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
