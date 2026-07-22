const CACHE_NAME = "pwa-github-v7";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./mouvements.html",
  "./reservation-tonnelles.html",
  "./agenda-tonnelles.html",
  "./tonnelles.html",
  "./reservationMinibus.html",
  "./agendaminibus.html",
  "./minibus.html",

  "./styles.css",

  "./js/minibus.js",
  "./js/reservationMinibus.js",
  "./js/agendaMinibus.js",
  "./js/tonelles.js",
  "./js/app.js",
  "./js/mouvement.js",
  "./js/reservationTonnelles.js",
  "./js/agendaTonnelles.js",
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

// Install the service worker and cache static files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Delete old caches and activate the new service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const oldCaches = cacheNames
        .filter((cacheName) => cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName));

      return Promise.all(oldCaches);
    })
  );

  self.clients.claim();
});

// Handle network requests
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // Do not cache Supabase requests
  if (
    request.url.includes("supabase.co") ||
    request.url.includes("supabase.com")
  ) {
    return;
  }

  // Network-first strategy for HTML pages
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseCopy = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseCopy);
          });

          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);

          return cachedResponse || caches.match("/index.html");
        })
    );

    return;
  }

  // Cache-first strategy for CSS, JavaScript, images and other files
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type === "opaque"
        ) {
          return networkResponse;
        }

        const responseCopy = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseCopy);
        });

        return networkResponse;
      });
    })
  );
});