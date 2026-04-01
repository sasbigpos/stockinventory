const CACHE_NAME = "inventory-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install: cache core assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fall back to cache
self.addEventListener("fetch", e => {
  // Skip non-GET and Firebase/CDN requests — always fetch those live
  if (e.request.method !== "GET") return;
  const url = e.request.url;
  if (url.includes("firebasejs") || url.includes("gstatic") || url.includes("firestore")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache a fresh copy of local assets
        if (url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
