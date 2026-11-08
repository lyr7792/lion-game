// Li-On 서비스 워커: 한 번 받으면 오프라인에서도 실행. 게임 파일은 항상 새 버전 먼저 확인.
const CACHE = 'lion-cache-v8';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const fresh = req.mode === 'navigate' || /\/(index\.html|version\.json)?$/.test(url.pathname) || url.pathname.endsWith('version.json');
  if (fresh) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? 'index.html' : req, cp)); } return r; })
      .catch(() => caches.match(req.mode === 'navigate' ? 'index.html' : req).then(r => r || caches.match('./'))));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(r2 => { if (r2.ok) { const cp = r2.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r2; })));
  }
});
