// Service Worker — TIVASANI Lista de Precios PWA
const CACHE = 'tivasani-v1';
const ASSETS = [
  './',
  './index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network-first para la radio (streams externos), cache-first para assets locales
  if (e.request.url.includes('radio-browser') || e.request.url.includes('.mp3') || e.request.url.includes('somafm')) {
    return; // dejar pasar sin interceptar
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
