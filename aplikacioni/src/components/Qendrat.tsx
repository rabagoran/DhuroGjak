"use client";
import { useMemo, useState } from "react";
import { QENDRAT, QENDRA_E_QYTETIT, renditSipasDistances } from "@/lib/qendrat";
import { QYTETET } from "@/lib/gjaku";

type Gjendja = "idle" | "loading" | "success" | "denied" | "timeout" | "unavailable";

/**
 * Java 8 — Geolocation:
 * - leja kërkohet VETËM pasi përdoruesi shtyp butonin;
 * - koordinatat mbeten në telefon (nuk dërgohen në server);
 * - kur leja refuzohet / mungon, zgjedhja manuale e qytetit funksionon njësoj.
 */
export default function Qendrat() {
  const [gjendja, setGjendja] = useState<Gjendja>("idle");
  const [mesazhi, setMesazhi] = useState("");
  const [pika, setPika] = useState<[number, number] | null>(null);
  const [burimi, setBurimi] = useState<string>("");
  const [qyteti, setQyteti] = useState("");
  const [zgjedhur, setZgjedhur] = useState<string>(QENDRAT[0].id);

  const lista = useMemo(() => (pika ? renditSipasDistances(pika) : QENDRAT.map((q) => ({ ...q, km: null as number | null }))), [pika]);
  const qendra = lista.find((q) => q.id === zgjedhur) ?? lista[0];

  function perdorVendndodhjen() {
    if (!("geolocation" in navigator)) {
      setGjendja("unavailable");
      setMesazhi("Ky shfletues nuk e mbështet vendndodhjen. Zgjidh qytetin më poshtë.");
      return;
    }
    setGjendja("loading");
    setMesazhi("Po kërkojmë vendndodhjen…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPika(p);
        setBurimi(`vendndodhja jote (saktësi rreth ${Math.round(pos.coords.accuracy)} m)`);
        setGjendja("success");
        setMesazhi("U renditën sipas distancës nga ti.");
        setZgjedhur(renditSipasDistances(p)[0].id);
      },
      (err) => {
        if (err.code === 1) { setGjendja("denied"); setMesazhi("Leja u refuzua. Zgjidh qytetin tënd më poshtë."); }
        else if (err.code === 3) { setGjendja("timeout"); setMesazhi("Koha mbaroi. Provo sërish ose zgjidh qytetin."); }
        else { setGjendja("unavailable"); setMesazhi("Vendndodhja nuk është e disponueshme. Zgjidh qytetin."); }
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }

  function zgjidhQytetin(q: string) {
    setQyteti(q);
    const k = QENDRA_E_QYTETIT[q];
    if (!k) return;
    setPika(k);
    setBurimi(`qendra e ${q}`);
    setZgjedhur(renditSipasDistances(k)[0].id);
  }

  const d = 0.01;
  const harta = `https://www.openstreetmap.org/export/embed.html?bbox=${qendra.lng - d},${qendra.lat - d},${qendra.lng + d},${qendra.lat + d}&layer=mapnik&marker=${qendra.lat},${qendra.lng}`;

  return (
    <div className="stack">
      <section className="card stack" data-testid="vendndodhja">
        <h2>Ku je?</h2>
        <button className="btn btn-block" type="button" onClick={perdorVendndodhjen} disabled={gjendja === "loading"} data-testid="locate-me">
          📍 {gjendja === "loading" ? "Po kërkojmë vendndodhjen…" : "Përdor vendndodhjen time"}
        </button>
        <p role="status" aria-live="polite" data-testid="location-status" data-state={gjendja} className="small muted">
          {mesazhi || "Vendndodhja kërkohet vetëm kur shtyp butonin dhe nuk dërgohet në server."}
        </p>
        <div className="field">
          <label htmlFor="qyteti-manual">…ose zgjidh qytetin</label>
          <select id="qyteti-manual" value={qyteti} onChange={(e) => zgjidhQytetin(e.target.value)} data-testid="city-select">
            <option value="">Zgjidh qytetin</option>
            {QYTETET.map((q) => <option key={q}>{q}</option>)}
          </select>
        </div>
        {burimi && <p className="small" data-testid="location-source">Distancat llogariten nga: <strong>{burimi}</strong></p>}
      </section>

      <section className="card stack">
        <h2>{qendra.emri}</h2>
        <p className="muted">{qendra.adresa}{qendra.km !== null && ` · ${qendra.km.toFixed(1)} km`}</p>
        <iframe className="map-frame" title={`Harta: ${qendra.emri}`} src={harta} loading="lazy" referrerPolicy="no-referrer" />
        <div className="actions">
          <a className="btn btn-small" href={`https://www.openstreetmap.org/?mlat=${qendra.lat}&mlon=${qendra.lng}#map=16/${qendra.lat}/${qendra.lng}`} target="_blank" rel="noopener noreferrer">Hape në hartë</a>
          <a className="btn btn-ghost btn-small" href={`https://www.google.com/maps/dir/?api=1&destination=${qendra.lat},${qendra.lng}`} target="_blank" rel="noopener noreferrer">Udhëzimet</a>
        </div>
      </section>

      <section className="card" aria-label="Lista e qendrave">
        {lista.map((q) => (
          <div className="donor-row" key={q.id}>
            <div>
              <strong>{q.emri}</strong><br />
              <span className="small muted">{q.qyteti}{q.km !== null && ` · ${q.km.toFixed(1)} km`}</span>
            </div>
            <button type="button" className={`btn btn-small ${q.id === qendra.id ? "" : "btn-ghost"}`} onClick={() => setZgjedhur(q.id)} aria-pressed={q.id === qendra.id}>
              {q.id === qendra.id ? "Në hartë" : "Shfaq"}
            </button>
          </div>
        ))}
      </section>
      <p className="small muted">Koordinatat janë të përafërta. Telefono qendrën para se të shkosh për orarin e dhurimit.</p>
    </div>
  );
}
