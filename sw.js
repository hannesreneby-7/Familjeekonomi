// Familjeekonomi – service worker
// Strategi: hämta alltid senaste versionen från nätet först.
// Den sparade kopian används bara om nätet är nere.

const CACHE = 'ekonomi-v2026_09_02-1645';
const INDEX = '/Familjeekonomi/index.html';
const ASSETS = ['/Familjeekonomi/', INDEX];

self.addEventListener('install', function(e){
  self.skipWaiting(); // ta över direkt, vänta inte på att gamla flikar stängs
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  const req = e.request;
  // Bara sidans egna filer. Supabase, CDN m.m. lämnas orörda.
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req).then(function(res){
      // Spara en färsk kopia för offline-läge
      const copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(req, copy); });
      return res;
    }).catch(function(){
      // Nätet nere: använd kopian, annars startsidan
      return caches.match(req).then(function(cached){ return cached || caches.match(INDEX); });
    })
  );
});
