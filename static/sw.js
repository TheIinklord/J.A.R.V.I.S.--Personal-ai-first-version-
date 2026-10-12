const CACHE = "jarvis-shell-v1";
const SHELL = ["/", "/static/style.css", "/static/app.js", "/static/pwa.js", "/manifest.webmanifest", "/static/icons/icon-192.png", "/static/icons/icon-512.png"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.pathname.startsWith("/api/")) return;
  if (url.origin === self.location.origin) event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(cached => cached || caches.match("/"))));
});
