
const CACHE = 'kirawave-v1';
const PRECACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

// Instala e faz cache dos assets essenciais
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then((c) => c.addAll(PRECACHE))
    );
    self.skipWaiting();
});

// Limpa caches antigos ao ativar
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Estratégia: network-first para HTML, cache-first para assets estáticos
self.addEventListener('fetch', (e) => {
    const { request } = e;
    const url = new URL(request.url);

    // Ignora requests de terceiros (Firebase, Stripe etc.)
    if (url.origin !== location.origin) return;

    if (request.destination === 'document') {
        // HTML: sempre tenta a rede primeiro (garante updates)
        e.respondWith(
            fetch(request)
                .then((res) => {
                    const clone = res.clone();
                    caches.open(CACHE).then((c) => c.put(request, clone));
                    return res;
                })
                .catch(() => caches.match('/index.html'))
        );
    } else {
        // Assets: cache-first (JS, CSS, imagens)
        e.respondWith(
            caches.match(request).then(
                (cached) => cached || fetch(request).then((res) => {
                    caches.open(CACHE).then((c) => c.put(request, res.clone()));
                    return res;
                })
            )
        );
    }
});