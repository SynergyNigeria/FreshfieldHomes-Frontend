const CACHE_NAME = "freshfields-v2";

// Install — skip waiting so the new SW activates immediately
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

// Activate — take control of all clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function offlineHtmlResponse() {
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fresh Fields Homes</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 2rem; background: #f7f4ee; color: #1f3b2d; }
      .card { max-width: 42rem; margin: 10vh auto 0; background: white; padding: 2rem; border: 1px solid #ddd2bf; }
      h1 { margin-top: 0; }
      p { line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Connection interrupted</h1>
      <p>This page is not available offline yet. Reconnect and try again.</p>
    </div>
  </body>
</html>`,
    {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

// Fetch — network-first with cache fallback for navigation requests
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only cache same-origin requests; skip API calls
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api")) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);

      if (
        response.ok &&
        (event.request.mode === "navigate" || url.pathname.match(/\.(js|css|png|svg|ico|woff2?)$/))
      ) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      const cached = await caches.match(event.request);
      if (cached) {
        return cached;
      }

      if (event.request.mode === "navigate") {
        return offlineHtmlResponse();
      }

      return new Response("", { status: 504, statusText: "Gateway Timeout" });
    }
  })());
});
