const CACHE = 'ekonomi-v1';
const ASSETS = ['/Familjeekonomi/', '/Familjeekonomi/index.html'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
});

self.addEventListener('fetch', function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).catch(function(){
        return caches.match('/Familjeekonomi/index.html');
      });
    })
  );
});