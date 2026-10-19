var CACHE_NAME = 'pwa-task-manager';
var urlsToCache = [
  '/',
  '/completed'
];

// Install a service worker
self.addEventListener('install', event => {
  // Replace the old worker right away instead of waiting for every tab to close.
  self.skipWaiting();
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // Only this site's own GETs go through the cache. Everything else (API calls,
  // bills POSTed to the thermal print server on 127.0.0.1) is left to the page:
  // Chrome blocks a service worker's requests to 127.0.0.1 from the live site,
  // because only the page can ask the cashier for local network permission.
  var url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  var cacheWhitelist = ['pwa-task-manager'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});