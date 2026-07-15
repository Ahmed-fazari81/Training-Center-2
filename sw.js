const CACHE_NAME = 'training-center-v1';
const baseUrl = new URL('./', self.registration.scope);
const urlsToCache = [
  baseUrl.href,
  new URL('./index.html', baseUrl).href,
  new URL('./icon.png', baseUrl).href,
  new URL('./icon-512.png', baseUrl).href,
  new URL('./logo.png', baseUrl).href,
  new URL('./manifest.json', baseUrl).href
];

// تثبيت Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.warn('SW cache.addAll failed:', err))
  );
  self.skipWaiting();
});

// تفعيل Service Worker وحذف التخزين القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// استراتيجية Network First للطلبات التنقلية (HTML)
// و Network First للباقي مع fallback للكاش
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // تجاهل الطلبات غير GET (POST للـ API مثلاً)
  if (request.method !== 'GET') return;

  // طلبات التنقل (صفحات HTML): Network First مع fallback إلى index.html المخزّن
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)
          .then((cached) => cached || caches.match(new URL('./index.html', baseUrl)))
        )
    );
    return;
  }

  // باقي الطلبات: Network First مع fallback للكاش
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
