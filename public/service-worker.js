const CACHE_NAME = "schoolbase-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styleGpt.css",
  "/app.js",
  "/icons/logo-192.png",
  "/icons/logo-512.png"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
          console.log(`Cached: ${url}`);
        } catch (err) {
          console.error(`Failed to cache: ${url}`, err);
        }
      }
    })
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

self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
