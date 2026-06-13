// Strict Service Worker for Archery Form Coach PWA - Full Offline Support
// All analysis is client-side only. No user data is ever transmitted.
// This SW caches the MediaPipe library, WASM runtime, and model so the app
// can run completely offline after initial preparation.

const CACHE_NAME = 'archery-form-v3-offline';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './version.json',
  './pose_landmarker_lite.task'  // bundled model for self-contained offline
];

// Critical external assets for offline (MediaPipe free browser version)
const PRECACHE_URLS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      // Pre-cache the main bundle (best effort)
      for (const url of PRECACHE_URLS) {
        try {
          const res = await fetch(url, { mode: 'cors' });
          if (res.ok) await cache.put(url, res);
        } catch (e) {
          // Will be cached on first successful app load
        }
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Helper: should we cache/intercept this request for offline?
function shouldHandleForOffline(url) {
  if (url.origin === location.origin) return true;

  // MediaPipe free CDN assets and model
  if (url.hostname.includes('jsdelivr.net') && url.pathname.includes('tasks-vision')) {
    return true;
  }
  if (url.hostname.includes('storage.googleapis.com') && url.pathname.includes('mediapipe-models/pose_landmarker')) {
    return true;
  }
  return false;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (!shouldHandleForOffline(url)) {
    return; // Let browser handle other requests (no interception)
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Try cache first
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Not cached -> fetch from network (requires online)
      try {
        const networkResponse = await fetch(event.request);
        // Cache successful GETs for future offline use
        if (event.request.method === 'GET' && networkResponse && networkResponse.ok) {
          // Clone because response can only be consumed once
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // Offline and not in cache
        return new Response('オフラインです。初回起動時にモデルをダウンロードしてください。', {
          status: 503,
          statusText: 'Service Unavailable - Offline',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })()
  );
});
