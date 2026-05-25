const CACHE_NAME = 'siurot-cache-v1';
const URLS_TO_CACHE = [
    './',
    './manifest.json',
    './icono-192.png',
    './icono-512.png'
];

// Instalación: cachear archivos básicos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
    );
    self.skipWaiting();
});

// Activación: limpiar cachés viejas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch: estrategia Network first, falling back to Cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Si la red funciona, guardamos una copia en caché
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Si no hay red, servimos desde la caché
                return caches.match(event.request);
            })
    );
});