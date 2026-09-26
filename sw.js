const CACHE = "cdr-solutec-acf-pwa-v6";
const BASE = new URL("./", self.registration.scope);
const CORE = [
  "./", "./index.html", "./manifest.webmanifest", "./ios-install.css", "./ios-install.js", "./print-one-page.css",
  "./index-DRpVqdhS.js", "./index-DkbCDmpZ.css",
  "./html2canvas.min.js", "./jspdf.umd.min.js", "./pdf-export.js"
].map(path => new URL(path, BASE).href);
const OPTIONAL = [
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png",
  "./logo-cdr-tec.png", "./logo-solutec.png", "./logo-xandinho.png", "./logo_cdr.png",
  "./letterhead-cdr-tec.png", "./letterhead-solutec.png", "./letterhead-xandinho.png"
].map(path => new URL(path, BASE).href);
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(async cache => {
    await cache.addAll(CORE);
    await Promise.allSettled(OPTIONAL.map(file => cache.add(file)));
  }));
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
      caches.open(CACHE).then(cache => Promise.all([
        cache.put(new URL("./", BASE).href, response.clone()),
        cache.put(new URL("./index.html", BASE).href, response.clone())
      ])).catch(() => {});
      return response;
    }).catch(async () =>
      (await caches.match(new URL("./index.html", BASE).href, {ignoreSearch: true})) ||
      (await caches.match(new URL("./", BASE).href, {ignoreSearch: true})) ||
      new Response("Aplicativo indisponível. Conecte-se à internet e abra novamente.", {headers: {"Content-Type": "text/plain; charset=utf-8"}})
    ));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});
