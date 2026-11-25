// Sliceview service worker, version 2026.11.25-2129
// The app opens at once from the copy kept on this device; a new version is fetched in the background
// (a new sw.js installs it into the cache), so it opens instantly and is up to date from the next start.
const CACHE = 'sliceview-2026.11.25-2129';
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon-32.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('sliceview-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return; // fonts and the like: straight to the network
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = (await cache.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? await cache.match('index.html') : null);
    if (hit) return hit; // the kept copy, at once (a new version arrives with a new sw.js, checked by the browser on each start)
    try { const r = await fetch(req, { cache: 'no-cache' }); if (r && r.ok) cache.put(req, r.clone()); return r; } catch (err) { return Response.error(); }
  })());
});
