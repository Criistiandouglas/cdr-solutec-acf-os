const CACHE = "cdr-solutec-acf-pwa-v1";
const BASE = new URL("./", self.registration.scope);
const FILES = [
  "./", "./index.html", "./manifest.webmanifest", "./ios-install.css", "./ios-install.js",
  "./assets/index-DRpVqdhS.js", "./assets/index-DkbCDmpZ.css",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png",
  "./logo-cdr-tec.png", "./logo-solutec.png", "./logo-xandinho.png", "./logo_cdr.png",
  "./letterhead-cdr-tec.png", "./letterhead-solutec.png", "./letterhead-xandinho.png"
].map(path => new URL(path, BASE).href);
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener("activate", event => {
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
  ]));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      caches.open(CACHE).then(cache => cache.put(new URL("./", BASE).href, response.clone()));
      return response;
    }).catch(() => caches.match(new URL("./", BASE).href)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});
