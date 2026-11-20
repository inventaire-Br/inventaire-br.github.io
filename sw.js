// Service worker propre à Inventaire Scan (portée /inventaire-scan/) : sépare l'application de Parlio. Aucune mise en cache.
self.addEventListener('install',function(){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
