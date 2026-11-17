"use client";
import { useEffect, useState } from "react";

/** Regjistron service worker-in dhe tregon shiritin kur interneti mungon. */
export default function Pwa() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    let cancelled = false;
    async function ngrohKopjen() {
      if (cancelled || !navigator.serviceWorker.controller) return;
      try { await fetch("/api/kerkesat", { cache: "no-store" }); } catch { /* offline */ }
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", ngrohKopjen);
      navigator.serviceWorker.register("/sw.js", { scope: "/" })
        .then(() => navigator.serviceWorker.ready).then(ngrohKopjen).catch(() => {});
    }
    return () => {
      cancelled = true;
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      if ("serviceWorker" in navigator) navigator.serviceWorker.removeEventListener("controllerchange", ngrohKopjen);
    };
  }, []);

  if (!offline) return null;
  return (
    <p className="offline-banner" role="status">
      Je pa internet. <a href="/offline.html">Shiko listën e ruajtur</a> · asnjë veprim nuk konfirmohet pa lidhje.
    </p>
  );
}
