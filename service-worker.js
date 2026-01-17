const CACHE_NAME = 'lista-compras-v1';

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './pngtree-full-grocery-cart-with-various-food-products-png-image_14304612.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
