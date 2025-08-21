const CACHE_NAME = "schoolbase-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styleGpt.css",
  "/app.js",
  "/icons/logo.png-192.png",
  "/icons/logo.png-512.png"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
