/* ============================================
   Financial Tracker PWA - Service Worker
   ============================================ */

// Bump this version whenever app files change
const CACHE_NAME = 'financial-tracker-v3';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/banks/bca.webp',
    './icons/banks/mandiri.webp',
    './icons/banks/krom.webp',
    './icons/banks/jago.webp',
    './icons/banks/sampoerna.webp',
    './icons/banks/seabank.webp',
    './icons/banks/gopay.webp',
    './icons/banks/shopeepay.webp',
    './icons/banks/dana.webp',
    './icons/banks/honest.webp',
    './icons/banks/nex.webp',
    './icons/banks/kredivo.webp',
    './icons/banks/spaylatter.webp',
    './icons/banks/jagoloan.webp'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
            .catch((err) => {
                console.log('Cache install failed:', err);
            })
    );
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            )
        )
    );
    self.clients.claim();
});

// Save a successful response to the cache
function putInCache(request, response) {
    if (response && (response.ok || response.type === 'opaque')) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
    }
    return response;
}

// Network-first: always try to get the latest version, fall back to cache offline
function networkFirst(request) {
    return fetch(request)
        .then((response) => putInCache(request, response))
        .catch(async () => {
            const cached = await caches.match(request);
            if (cached) return cached;
            if (request.mode === 'navigate') {
                const shell = await caches.match('./index.html');
                if (shell) return shell;
            }
            return Response.error();
        });
}

// Cache-first: fast for assets that rarely change (images, fonts)
function cacheFirst(request) {
    return caches.match(request).then(
        (cached) =>
            cached ||
            fetch(request)
                .then((response) => putInCache(request, response))
                .catch(() => Response.error())
    );
}

// Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    // Skip Google Apps Script requests (always go to network)
    if (url.hostname.includes('script.google.com') ||
        url.hostname.includes('googleusercontent.com')) {
        return;
    }

    // Google Fonts - cache-first so the font works offline
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Ignore other cross-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }

    // Images - cache-first
    if (request.destination === 'image') {
        event.respondWith(cacheFirst(request));
        return;
    }

    // HTML, JS, CSS, manifest - network-first so updates show up immediately
    event.respondWith(networkFirst(request));
});
