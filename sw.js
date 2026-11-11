/* 덴데·부우 건강기록 service worker — 오프라인에서도 앱이 열리도록 */
const CACHE = 'dbh-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './bg-dende.jpg', './bg-boo.jpg', './bg-both.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('script.google') || url.hostname.includes('googleusercontent') || url.hostname.includes('drive.google')) return; // 데이터는 항상 네트워크
  if (url.origin === location.origin) { // 앱 파일: 네트워크 우선, 실패 시 캐시
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
  } else if (url.hostname === 'cdn.jsdelivr.net' || url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) { // 폰트: 캐시 우선
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); return res; })));
  }
});
