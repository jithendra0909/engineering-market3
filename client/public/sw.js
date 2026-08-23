/**
 * Engineering Market — Service Worker
 * Provides offline support, caching, and PWA functionality
 */

const CACHE_NAME = 'em-cache-v1';
const STATIC_CACHE = 'em-static-v1';
const DYNAMIC_CACHE = 'em-dynamic-v1';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// Install event — pre-cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // Take control of all pages
  );
});

// Fetch event — Network First strategy for API, Cache First for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extension requests and non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // API requests — Network First (try network, fall back to cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets — Cache First (try cache, fall back to network)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cache and update in background (stale-while-revalidate)
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
          return networkResponse.clone();
        }).catch(() => {});
        
        return cachedResponse;
      }

      // Not in cache — fetch from network
      return fetch(request).then((response) => {
        // Cache images, JS, CSS for future use
        if (response.ok && (
          request.destination === 'image' ||
          request.destination === 'script' ||
          request.destination === 'style' ||
          request.destination === 'font'
        )) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      }).catch(() => {
        // If it's a navigation request and we're offline, serve the cached index
        if (request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
