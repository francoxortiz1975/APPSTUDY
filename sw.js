const CACHE_NAME = 'etudly-v1';

const STATIC_ASSETS = [
  '/src/features/dashboard/dashboard.html',
  '/src/features/dashboard/dashboard.css',
  '/src/features/dashboard/dashboard.js',
  '/src/features/grade-calculator/app.html',
  '/src/features/grade-calculator/app.css',
  '/src/features/grade-calculator/app.js',
  '/src/features/timeline/timeline.html',
  '/src/features/timeline/timeline.css',
  '/src/features/timeline/timeline.js',
  '/src/features/study-plan/study-plan.html',
  '/src/features/study-plan/study-plan.css',
  '/src/features/study-plan/study-plan.js',
  '/src/auth/auth.js',
  '/src/auth/auth-manager.js',
  '/src/core/state.js',
  '/src/core/grading-utils.js',
  '/src/database/firestore.js',
  '/src/shared/grading-scale-ui.js',
  '/assets/1.png',
  '/assets/4.png',
  '/manifest.json'
];

// Install: cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static assets, network-first for everything else
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never intercept Firebase, Gemini API, or Google Fonts requests
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('fonts.google') ||
    url.pathname.startsWith('/api/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        // Return cached version immediately, then refresh in background
        if (cached) {
          fetch(event.request)
            .then(fresh => {
              if (fresh && fresh.status === 200) {
                caches.open(CACHE_NAME).then(c => c.put(event.request, fresh));
              }
            })
            .catch(() => {});
          return cached;
        }

        // Not in cache: fetch from network, cache the response
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
            return response;
          })
          .catch(() => {
            // Offline fallback: return dashboard for HTML navigation requests
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/src/features/dashboard/dashboard.html');
            }
          });
      })
  );
});
