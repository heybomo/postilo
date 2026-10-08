/* Постило: служебный скрипт только для «Поделиться → Постило» на Android.
   Ничего не кэширует: страница всегда берётся свежая с сайта. */
const SHARE_CACHE = "postilo-share";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "POST" || !url.pathname.endsWith("/share-target")) return;
  e.respondWith((async () => {
    let n = 0;
    try {
      const fd = await e.request.formData();
      const files = fd.getAll("media").filter((f) => f && typeof f !== "string");
      const cache = await caches.open(SHARE_CACHE);
      for (const k of await cache.keys()) await cache.delete(k);
      for (const f of files.slice(0, 20)) {
        await cache.put(new Request("./shared/" + n), new Response(f, { headers: {
          "content-type": f.type || "application/octet-stream",
          "x-name": encodeURIComponent(f.name || "file" + n) } }));
        n++;
      }
    } catch (err) { /* не получилось — просто откроем Постило */ }
    return Response.redirect("./?shared=" + n, 303);
  })());
});
