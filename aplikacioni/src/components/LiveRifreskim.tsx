"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Java 10 — sinkronizim me polling.
 * Çdo `intervali` ms pyet serverin. Kur përgjigjja ndryshon nga ajo e mëparshmja,
 * thërret `router.refresh()` që Server Components të rivizatohen me të dhënat e reja.
 * - Ndalet kur skeda është e fshehur (kursen bateri dhe kërkesa).
 * - Pas gabimit tregon “Lidhja u ndërpre” dhe riprovon vetë (rilidhje).
 */
export default function LiveRifreskim({ url, intervali = 5000 }: { url: string; intervali?: number }) {
  const router = useRouter();
  const iFundit = useRef<string | null>(null);
  const [gjendja, setGjendja] = useState<"live" | "offline">("live");
  const [koha, setKoha] = useState<number | null>(null);
  const [tani, setTani] = useState(() => Date.now());

  useEffect(() => {
    let aktiv = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function pyet() {
      if (document.visibilityState === "hidden") { timer = setTimeout(pyet, intervali); return; }
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) throw new Error(String(r.status));
        const teksti = await r.text();
        if (!aktiv) return;
        if (iFundit.current !== null && iFundit.current !== teksti) router.refresh();
        iFundit.current = teksti;
        setGjendja("live");
        setKoha(Date.now());
      } catch {
        if (aktiv) setGjendja("offline");
      }
      if (aktiv) timer = setTimeout(pyet, intervali);
    }

    const ktheu = () => { if (document.visibilityState === "visible") { clearTimeout(timer); pyet(); } };
    pyet();
    document.addEventListener("visibilitychange", ktheu);
    window.addEventListener("online", ktheu);
    const ora = setInterval(() => setTani(Date.now()), 1000);
    return () => {
      aktiv = false;
      clearTimeout(timer);
      clearInterval(ora);
      document.removeEventListener("visibilitychange", ktheu);
      window.removeEventListener("online", ktheu);
    };
  }, [url, intervali, router]);

  const sekonda = koha ? Math.max(0, Math.round((tani - koha) / 1000)) : null;
  return (
    <p className="small muted" role="status" aria-live="off" data-testid="live-status" data-state={gjendja}>
      {gjendja === "live"
        ? <>🟢 Live · {sekonda === null ? "po lidhet…" : `përditësuar para ${sekonda} s`}</>
        : <>🟠 Lidhja u ndërpre — po riprovojmë…</>}
    </p>
  );
}
