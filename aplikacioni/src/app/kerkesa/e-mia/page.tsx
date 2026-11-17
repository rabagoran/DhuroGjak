import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { perdoruesiIm, type Perdorues } from "@/lib/lejet";
import { kerkesatEMia, type Kerkese } from "@/lib/kerkesat";
import { dozat, formatoAfatin } from "@/lib/format";
import GabimDB from "@/components/GabimDB";

export const metadata: Metadata = { title: "Kërkesat e mia" };
export const dynamic = "force-dynamic";

const STATUSI: Record<string, { teksti: string; klasa: string }> = {
  aktive: { teksti: "Aktive", klasa: "pill-wait" },
  perfunduar: { teksti: "Përfunduar", klasa: "pill-ok" },
  anuluar: { teksti: "Anuluar", klasa: "pill-off" },
};

export default async function KerkesatEMia() {
  let p: Perdorues | null;
  let kerkesat: Kerkese[] = [];
  try {
    p = await perdoruesiIm();
    if (p) kerkesat = await kerkesatEMia(p.id);
  } catch {
    return <main><h1>Kërkesat e mia</h1><GabimDB provo="/kerkesa/e-mia" /></main>;
  }
  if (!p) redirect("/hyrja?callbackUrl=/kerkesa/e-mia");

  return (
    <main className="stack">
      <div className="page-head">
        <h1>Kërkesat e mia</h1>
        <Link className="btn btn-small" href="/kerkesa/e-re">+ Kërkesë e re</Link>
      </div>
      {kerkesat.length === 0 ? (
        <div className="card empty"><p>Nuk ke postuar asnjë kërkesë.</p></div>
      ) : kerkesat.map((k) => (
        <Link key={k.id} href={`/kerkesa/${k.id}`} className="card notif">
          <div className="request-head" style={{ marginBottom: 0 }}>
            <span className="blood-badge">{k.grupi}</span>
            <div>
              <h2>{k.spitali}</h2>
              <p className="muted small">{k.pranuar} nga {dozat(k.dozat)} · {formatoAfatin(k.afati)}</p>
            </div>
            <span className={`pill ${STATUSI[k.statusi].klasa}`}>{STATUSI[k.statusi].teksti}</span>
          </div>
        </Link>
      ))}
    </main>
  );
}
