// Life OS Service Worker for PWA & Offline Support
const CACHE_NAME = 'life-os-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Network first strategy for dynamic application requests
  if (e.request.mode === 'navigate' || e.request.url.includes('/js/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});
