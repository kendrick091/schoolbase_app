const CACHE_NAME = "schoolbase-cache-v3"; // 🔥 increase version when updating
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/install.js",
  "/icons/logo-192.png",
  "/icons/logo-512.png"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch(err => console.error("Failed to cache:", err))
  );
  self.skipWaiting(); // 🔥 activate new SW immediately
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});


// Fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
