const CACHE = 'elite-mob-static-v3';
const CACHEABLE = [
  '/portfolio-gallery/_generated/',
  '/hero/',
  '/og/',
  '/assets/',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  const isCacheable = CACHEABLE.some((prefix) => url.pathname.includes(prefix));
  const isFont =
    url.pathname.includes('/assets/') &&
    /\.(woff2|woff)$/i.test(url.pathname);
  if (!isCacheable && !isFont) return;
  if (url.pathname.includes('/assets/') && !isFont) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) {
        cache.put(event.request, response.clone());
      }
      return response;
    }),
  );
});
