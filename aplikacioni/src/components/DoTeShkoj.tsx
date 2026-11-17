"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doTeShkojOptimist } from "@/app/kerkesa/actions";
import { MESAZHET_E_VENDIMIT } from "@/lib/rregullat";
import Progresi from "@/components/Progresi";

/**
 * Java 9 — UI optimiste:
 * 1. klikimi rrit menjëherë numëruesin dhe tregon “Po dërgohet…”;
 * 2. serveri e ruan në Neon (UNIQUE parandalon dyfishimin);
 * 3. në gabim, numëruesi kthehet si ishte dhe shfaqet “Provo përsëri”.
 */
export default function DoTeShkoj({ kerkesaId, pranuar, dozat, kaHyre }: {
  kerkesaId: string; pranuar: number; dozat: number; kaHyre: boolean;
}) {
  const router = useRouter();
  const [numri, setNumri] = useState(pranuar);
  const [gjendja, setGjendja] = useState<"gati" | "duke" | "ok" | "gabim">("gati");
  const [mesazhi, setMesazhi] = useState("");
  const [kontakti, setKontakti] = useState<{ emri: string; telefoni: string } | null>(null);
  const [, startTransition] = useTransition();

  // Java 10: kur polling-u sjell numër të ri nga serveri, përditëso (përveç gjatë dërgimit).
  useEffect(() => {
    if (gjendja === "gati" || gjendja === "gabim") setNumri(pranuar);
  }, [pranuar]); // eslint-disable-line react-hooks/exhaustive-deps

  function kliko() {
    if (!kaHyre) { router.push(`/hyrja?callbackUrl=${encodeURIComponent(`/kerkesa/${kerkesaId}`)}`); return; }
    if (gjendja === "duke" || gjendja === "ok") return; // klikimet e përsëritura injorohen
    const numriPara = numri;
    setNumri((n) => n + 1);
    setGjendja("duke");
    setMesazhi("Po dërgohet…");
    startTransition(async () => {
      const r = await doTeShkojOptimist(kerkesaId);
      if (r.ok) {
        setNumri(r.pranuar);
        setKontakti(r.kontakti);
        setGjendja("ok");
        setMesazhi(MESAZHET_E_VENDIMIT.ok);
        router.refresh();
      } else {
        setNumri(numriPara); // rikthimi
        setGjendja("gabim");
        setMesazhi(r.vendimi === "databaza" ? "Nuk u ruajt. Kontrollo internetin dhe provo përsëri." : MESAZHET_E_VENDIMIT[r.vendimi]);
      }
    });
  }

  return (
    <div className="stack" data-testid="do-te-shkoj">
      <Progresi pranuar={numri} dozat={dozat} />
      {gjendja === "ok" ? (
        <div className="alert alert-ok" role="status">
          <p><strong>Ke pranuar këtë kërkesë ✅</strong></p>
          {kontakti && <p>Kontakti: {kontakti.emri} · <a className="contact" href={`tel:${kontakti.telefoni}`}>{kontakti.telefoni}</a></p>}
          <Link href={`/kerkesa/${kerkesaId}/pergjigja`}>Shiko udhëzimet →</Link>
        </div>
      ) : (
        <button className="btn btn-block" type="button" onClick={kliko} disabled={gjendja === "duke"} aria-busy={gjendja === "duke"}>
          {gjendja === "duke" ? "Po dërgohet…" : gjendja === "gabim" ? "↻ Provo përsëri" : "❤ Do të shkoj"}
        </button>
      )}
      <p role={gjendja === "gabim" ? "alert" : "status"} aria-live="polite" className={gjendja === "gabim" ? "alert alert-error" : "hint"}>
        {mesazhi || "Telefoni i kërkuesit shfaqet vetëm pasi të pranosh."}
      </p>
    </div>
  );
}
