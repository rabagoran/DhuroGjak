// DhuroGjak service worker.
// Cache përmban VETËM: faqen offline, ikonat dhe listën PUBLIKE të kërkesave.
// Asnjë e dhënë private (profili, telefoni, grupi i dhuruesit) nuk ruhet këtu.
const CACHE = "dhurogjak-public-v1";
const API = "/api/kerkesat";
const SHELL = ["/offline.html", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("dhurogjak-public-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function listaPublike(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Lista nuk erdhi nga serveri");
    }
    const headers = new Headers(response.headers);
    headers.set("x-dhurogjak-source", "network");
    headers.set("x-dhurogjak-saved-at", new Date().toISOString());
    const fresh = new Response(await response.text(), { status: 200, headers });
    try { await cache.put(API, fresh.clone()); } catch { /* hapësira e plotë: vazhdo pa kopje */ }
    return fresh;
  } catch {
    const saved = await cache.match(API);
    if (!saved) {
      return new Response(JSON.stringify({ error: "no_snapshot" }), { status: 503, headers: { "content-type": "application/json" } });
    }
    const headers = new Headers(saved.headers);
    headers.set("x-dhurogjak-source", "cache");
    return new Response(await saved.text(), { status: 200, headers });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname === API && !url.search) {
    event.respondWith(listaPublike(request));
  } else if (request.mode === "navigate") {
    // Çdo faqe: provo rrjetin; pa internet shfaq listën e ruajtur.
    event.respondWith(fetch(request).catch(async () => {
      const saved = await caches.match("/offline.html");
      return saved || new Response("Hape DhuroGjak një herë me internet.", { status: 503 });
    }));
  }
});
