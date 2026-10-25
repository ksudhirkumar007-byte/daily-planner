const CACHE_NAME = 'dailyflow-v3';

const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './vendor/tailwind.min.css',
  './vendor/lucide.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(LOCAL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || e.request.url.includes('script.google.com')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

// Native Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetModule = event.notification.data ? event.notification.data.targetModule : null;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          if (targetModule) {
            client.postMessage({ action: 'scrollToModule', moduleId: targetModule });
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        const urlToOpen = targetModule ? `./index.html#${targetModule}` : './index.html';
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
