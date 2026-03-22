const CACHE_NAME = 'tivasani-v2';

// Al instalar: cachea el HTML principal
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/icon-192.png',
        '/icon-512.png',
        '/manifest.json'
      ]);
    }).then(() => self.skipWaiting())
  );
});

// Al activar: borra caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first para assets locales, network-only para streams de radio
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // No interceptar peticiones externas (radio, API, fonts)
  if (!url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cachea respuestas válidas
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline: sirve index.html
        return caches.match('/index.html');
      });
    })
  );
});
