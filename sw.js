const CACHE='almanza-parra-rescate-20261108';
const CORE=['./index.html','./data.json','./icon-192.png','./manifest.webmanifest'];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(async cache=>{
    await Promise.allSettled(CORE.map(file=>cache.add(file)));
  }));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys()) if(key.startsWith('almanza-parra-')&&key!==CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(req,{cache:'no-store'});
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(req,response.clone());}
      return response;
    }catch(err){
      const cache=await caches.open(CACHE);
      return (await cache.match(req)) || (req.mode==='navigate'?await cache.match('./index.html'):undefined) || Response.error();
    }
  })());
});
