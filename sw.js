// ============================================
// Service Worker برای PWA
// ============================================

const CACHE_NAME = 'fileuploader-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// ===== نصب Service Worker =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('❌ Cache addAll failed:', err);
      })
  );
});

// ===== فعال‌سازی Service Worker =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ===== دریافت درخواست‌ها =====
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // اگر در کش وجود داشت، برگردان
        if (response) {
          return response;
        }
        // اگر نه، از شبکه بگیر
        return fetch(event.request)
          .then((response) => {
            // پاسخ معتبر را در کش ذخیره کن
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});