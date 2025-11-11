// Service Worker for Space Race PWA
const CACHE_NAME = 'space-race-v2'; // Updated to force refresh
const urlsToCache = [
  '/',
  '/index.html',
  '/space-bg.jpg'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy: Network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for unsupported schemes and non-GET requests
  const isUnsupportedScheme = url.protocol === 'chrome-extension:' || 
                               url.protocol === 'chrome:' ||
                               url.protocol === 'moz-extension:' ||
                               url.protocol === 'safari-extension:' ||
                               url.protocol === 'edge:';
  
  const isWebSocket = url.protocol === 'ws:' || url.protocol === 'wss:';
  const isNonGet = event.request.method !== 'GET';
  
  // Skip Vite HMR endpoints
  const isViteHMR = url.pathname.includes('/@vite/client') || 
                    url.pathname.includes('/@react-refresh') ||
                    url.searchParams.has('import');
  
  // Skip caching for Vite HMR, WebSocket, and extension URLs
  if (isUnsupportedScheme || isWebSocket || isNonGet || isViteHMR) {
    return; // Let browser handle these requests normally
  }
  
  // Only cache http/https requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            try {
              cache.put(event.request, responseToCache);
            } catch (error) {
              // Silently fail if caching fails (e.g., quota exceeded)
              console.warn('Failed to cache resource:', event.request.url, error);
            }
          });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
