/* Corrida do Carinho — service worker: jogo disponível offline após a 1ª visita */
const CACHE = 'corrida-carinho-v1';
const ARQUIVOS = ['.', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  ev.respondWith(
    caches.match(ev.request).then(hit => hit ||
      fetch(ev.request).then(resp => {
        if (resp.ok && ev.request.method === 'GET' && new URL(ev.request.url).origin === location.origin){
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(ev.request, copia));
        }
        return resp;
      })
    ).catch(() => caches.match('index.html'))
  );
});
