"use client";
import { useEffect, useState } from "react";
import { ruajAbonimin, fshiAbonimin } from "@/app/njoftimet/actions";

type Gjendja = "kontrollon" | "pambeshtetur" | "pa-celes" | "fikur" | "ndezur" | "refuzuar" | "duke";

function base64UrlNeUint8(b64: string) {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Java 11 — Push OPSIONAL.
 * Leja kërkohet vetëm pasi përdoruesi shtyp butonin. Pa push, aplikacioni vazhdon me njoftimet në aplikacion.
 */
export default function NjoftimetPush() {
  const celesi = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const [gjendja, setGjendja] = useState<Gjendja>("kontrollon");
  const [mesazhi, setMesazhi] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) { setGjendja("pambeshtetur"); return; }
    if (!celesi) { setGjendja("pa-celes"); return; }
    if (Notification.permission === "denied") { setGjendja("refuzuar"); return; }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setGjendja(sub ? "ndezur" : "fikur"))
      .catch(() => setGjendja("fikur"));
  }, [celesi]);

  async function ndiz() {
    setGjendja("duke");
    setMesazhi("");
    try {
      const leja = await Notification.requestPermission(); // vetëm pas klikimit
      if (leja !== "granted") { setGjendja(leja === "denied" ? "refuzuar" : "fikur"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlNeUint8(celesi!) });
      const r = await ruajAbonimin(sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      if (!r.ok) { await sub.unsubscribe(); throw new Error("ruajtja"); }
      setGjendja("ndezur");
      setMesazhi("Njoftimet në telefon u aktivizuan ✅");
    } catch {
      setGjendja("fikur");
      setMesazhi("Nuk u aktivizuan. Provo përsëri — njoftimet në aplikacion vazhdojnë të punojnë.");
    }
  }

  async function fik() {
    setGjendja("duke");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) { await fshiAbonimin(sub.endpoint); await sub.unsubscribe(); }
      setGjendja("fikur");
      setMesazhi("Njoftimet në telefon u çaktivizuan.");
    } catch {
      setGjendja("ndezur");
    }
  }

  return (
    <section className="card stack" aria-labelledby="push-titulli">
      <h2 id="push-titulli">🔔 Njoftimet në telefon</h2>
      {gjendja === "pambeshtetur" && <p className="muted">Ky shfletues nuk i mbështet njoftimet push. Në iPhone: shto DhuroGjak në ekranin kryesor (Share → Add to Home Screen) dhe hape prej andej. Njoftimet në aplikacion (🔔 lart) punojnë gjithsesi.</p>}
      {gjendja === "pa-celes" && <p className="muted">Push nuk është konfiguruar në server (mungojnë çelësat VAPID). Njoftimet në aplikacion punojnë.</p>}
      {gjendja === "refuzuar" && <p className="muted">Njoftimet janë bllokuar në cilësimet e shfletuesit. Për t’i lejuar: ikona 🔒 pranë adresës → Notifications → Allow.</p>}
      {(gjendja === "fikur" || gjendja === "duke" || gjendja === "kontrollon") && (
        <>
          <p className="muted">Merr njoftim menjëherë kur dikush afër ka nevojë për grupin tënd — edhe kur aplikacioni është i mbyllur.</p>
          <button className="btn" type="button" onClick={ndiz} disabled={gjendja !== "fikur"}>{gjendja === "duke" ? "Po aktivizohet…" : "Aktivizo njoftimet në telefon"}</button>
        </>
      )}
      {gjendja === "ndezur" && (
        <>
          <p>✅ Ky telefon merr njoftime push.</p>
          <button className="btn btn-ghost btn-small" type="button" onClick={fik}>Çaktivizo në këtë telefon</button>
        </>
      )}
      {mesazhi && <p role="status" className="small">{mesazhi}</p>}
    </section>
  );
}
