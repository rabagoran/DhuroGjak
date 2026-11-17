import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejKerkesen, type Kerkese } from "@/lib/kerkesat";
import { perdoruesiIm, type Perdorues } from "@/lib/lejet";
import { grupetDhuruese } from "@/lib/gjaku";
import { dozat, formatoAfatin, kaSkaduar } from "@/lib/format";
import Progresi from "@/components/Progresi";
import GabimDB from "@/components/GabimDB";
import { mbyllKerkesen } from "../actions";

export const dynamic = "force-dynamic";

const MESAZHET: Record<string, { teksti: string; ok: boolean }> = {
  postuar: { teksti: "Kërkesa u postua. Dhuruesit e përputhshëm do të njoftohen.", ok: true },
  perfunduar: { teksti: "Kërkesa u shënua “Përfunduar”.", ok: true },
  anuluar: { teksti: "Kërkesa u anulua.", ok: true },
  ndaluar: { teksti: "Nuk ke leje për këtë kërkesë. Asgjë nuk ndryshoi.", ok: false },
  hyr: { teksti: "Hyr në llogari për këtë veprim.", ok: false },
  fushe: { teksti: "Kërkesa nuk është e vlefshme.", ok: false },
  databaza: { teksti: "Nuk u lidhëm me databazën. Provo përsëri.", ok: false },
};

export default async function Detajet({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ m?: string }>;
}) {
  const { id } = await params;
  const { m } = await searchParams;
  let kerkesa: Kerkese | undefined;
  let p: Perdorues | null = null;
  try {
    kerkesa = await gjejKerkesen(id);
    p = await perdoruesiIm();
  } catch {
    return <main><Link href="/" className="link-arrow">← Kthehu te lista</Link><GabimDB provo={`/kerkesa/${id}`} teksti="Detajet nuk u ngarkuan." /></main>;
  }
  if (!kerkesa) notFound();

  const pronar = p !== null && (p.id === kerkesa.krijuar_nga || p.roli === "admin");
  const aktive = kerkesa.statusi === "aktive" && !kaSkaduar(kerkesa.afati);
  const mesazh = m ? MESAZHET[m] : undefined;

  return (
    <main>
      <Link href="/" className="link-arrow">← Kthehu te lista</Link>
      {mesazh && <p className={`alert ${mesazh.ok ? "alert-ok" : "alert-error"}`} role={mesazh.ok ? "status" : "alert"}>{mesazh.teksti}</p>}
      <div className="detail-head">
        <span className="blood-badge big">{kerkesa.grupi}</span>
        <div>
          <h1>{kerkesa.spitali}</h1>
          <p className="muted">{kerkesa.qyteti} · {dozat(kerkesa.dozat)} · {formatoAfatin(kerkesa.afati)}</p>
        </div>
      </div>
      <section className="card stack">
        {!aktive && <p className="pill pill-off">{kerkesa.statusi === "perfunduar" ? "Përfunduar ✅" : kerkesa.statusi === "anuluar" ? "Anuluar" : "Afati ka kaluar"}</p>}
        {kerkesa.pershkrimi && <p>{kerkesa.pershkrimi}</p>}
        <Progresi pranuar={kerkesa.pranuar} dozat={kerkesa.dozat} />
        <p className="muted small">Mund të dhurojnë grupet: <strong>{grupetDhuruese(kerkesa.grupi).join(", ")}</strong></p>
        {aktive && !pronar && <Link className="btn btn-block" href={`/kerkesa/${kerkesa.id}/pergjigja`}>❤ Do të shkoj</Link>}
      </section>

      {pronar && aktive && (
        <section className="card stack" style={{ marginTop: 14 }}>
          <h2>Menaxho kërkesën tënde</h2>
          <form action={mbyllKerkesen} className="actions">
            <input type="hidden" name="id" value={kerkesa.id} />
            <button className="btn btn-green" name="statusi" value="perfunduar">Shëno “Përfunduar”</button>
            <button className="btn btn-ghost" name="statusi" value="anuluar">Anulo</button>
          </form>
          <p className="small muted">Serveri kontrollon pronarin edhe nëse ID në formular ndryshohet.</p>
        </section>
      )}
    </main>
  );
}
