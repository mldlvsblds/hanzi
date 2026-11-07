// Offline support: app files are network-first (so updates show up right away),
// stroke data and the Hanzi Writer library from the CDN are cache-first.
const CACHE = 'hanzi-v3';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'firebase-config.js', 'data/drills.js', 'data/words.txt', 'manifest.json', 'icons/icon-192.png',
  'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(SHELL);
    // pre-cache all pronunciation files (~2 MB) so audio also works offline
    try {
      const idx = await (await fetch('audio/index.json', { cache: 'no-cache' })).json();
      await c.put('audio/index.json', new Response(JSON.stringify(idx), { headers: { 'Content-Type': 'application/json' } }));
      await Promise.all(idx.files.map(f => c.add('audio/' + f + '.m4a').catch(() => { })));
    } catch (err) { }
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'cdn.jsdelivr.net' || (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'))) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
});
