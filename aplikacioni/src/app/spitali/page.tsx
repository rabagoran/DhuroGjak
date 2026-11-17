import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { perdoruesiIm, type Perdorues } from "@/lib/lejet";
import { kerkesatPerStafin, permbledhja, type KerkesePerStafin } from "@/lib/spitali";
import { gjejSpitalin } from "@/lib/spitalet";
import GabimDB from "@/components/GabimDB";
import VeprimetEStafit from "@/components/VeprimetEStafit";
import LiveRifreskim from "@/components/LiveRifreskim";

export const metadata: Metadata = { title: "Paneli i spitalit" };
export const dynamic = "force-dynamic";

const MESAZHET: Record<string, { teksti: string; ok: boolean }> = {
  verifikuar: { teksti: "Kërkesa u konfirmua dhe u bë publike.", ok: true },
  refuzuar: { teksti: "Kërkesa u refuzua. Kërkuesi u njoftua me arsyen.", ok: true },
  rikthyer: { teksti: "Raportimet u shqyrtuan. Kërkesa është sërish publike.", ok: true },
  anuluar: { teksti: "Kërkesa u anulua.", ok: true },
  ndaluar: { teksti: "Kjo kërkesë nuk është më në pritje ose nuk i përket spitalit tënd.", ok: false },
  fushe: { teksti: "Zgjidh një arsye të vlefshme.", ok: false },
  databaza: { teksti: "Nuk u lidhëm me databazën. Provo përsëri.", ok: false },
};

function Karta({ k, children }: { k: KerkesePerStafin; children?: React.ReactNode }) {
  return (
    <article className={`card stack${k.urgjente ? " request-card is-urgent" : ""}`}>
      <div className="request-head" style={{ marginBottom: 0 }}>
        <span className="blood-badge">{k.grupi}</span>
        <div>
          <h3>{k.spitali}</h3>
          <p className="muted small">{permbledhja(k)}</p>
        </div>
        {k.urgjente && <span className="pill pill-urgent">Urgjente</span>}
      </div>
      <dl className="facts">
        <dt>Kërkuesi</dt><dd>{k.kerkuesi ?? "—"}</dd>
        <dt>Telefoni</dt><dd>{k.telefoni ? <a href={`tel:${k.telefoni}`}>{k.telefoni}</a> : "—"}</dd>
        {k.pershkrimi && <><dt>Shënimi</dt><dd>{k.pershkrimi}</dd></>}
        {k.raportime > 0 && <><dt>Raportime</dt><dd>{k.raportime}{k.pezulluar ? " · e pezulluar" : ""}</dd></>}
      </dl>
      {children}
      <Link className="link-arrow" href={`/kerkesa/${k.id}`}>Hap kërkesën <span aria-hidden="true">→</span></Link>
    </article>
  );
}

export default async function PaneliISpitalit({ searchParams }: { searchParams: Promise<{ m?: string; n?: string }> }) {
  const { m, n } = await searchParams;
  let p: Perdorues | null;
  let te: Awaited<ReturnType<typeof kerkesatPerStafin>>;
  try {
    p = await perdoruesiIm();
    te = p ? await kerkesatPerStafin(p) : { nePritje: [], teRaportuara: [], aktive: [] };
  } catch {
    return <main><h1>Paneli i spitalit</h1><GabimDB provo="/spitali" /></main>;
  }
  if (!p) redirect("/hyrja?callbackUrl=/spitali");
  if (p.roli !== "spital" && p.roli !== "admin") {
    return (
      <main className="stack">
        <h1>Paneli i spitalit</h1>
        <p className="alert alert-info">Ky panel është vetëm për stafin e verifikuar të spitaleve. Nëse punon në një qendër transfuzioni, kërko qasje nga administratori.</p>
      </main>
    );
  }

  const nr = Number(n);
  const mesazh = m === "verifikuar" && n !== undefined
    ? { ok: true, teksti: nr >= 0 ? `Kërkesa u konfirmua dhe u bë publike. U njoftuan ${nr} dhurues të përputhshëm.` : "Kërkesa u konfirmua, por njoftimet nuk u dërguan." }
    : m ? MESAZHET[m] : undefined;
  const spitali = p.roli === "spital" ? gjejSpitalin(p.spitali_id)?.emri : "Të gjitha spitalet (admin)";

  return (
    <main className="stack">
      <div className="page-head">
        <div>
          <h1>🏥 Paneli i spitalit</h1>
          <p className="muted">{spitali}</p>
          <LiveRifreskim url="/api/spitali/gjendja" intervali={15000} />
        </div>
        {p.roli === "admin" && <Link className="btn btn-small btn-ghost" href="/admin">Stafi</Link>}
      </div>
      {mesazh && <p className={`alert ${mesazh.ok ? "alert-ok" : "alert-error"}`} role={mesazh.ok ? "status" : "alert"}>{mesazh.teksti}</p>}

      <section className="stack" aria-labelledby="ne-pritje">
        <h2 id="ne-pritje">Në pritje të verifikimit ({te.nePritje.length})</h2>
        <p className="small muted">Telefono kërkuesin dhe kontrollo që pacienti është shtruar te ju. Dhuruesit njoftohen vetëm pasi ta konfirmosh.</p>
        {te.nePritje.length === 0
          ? <div className="card empty"><p>Asnjë kërkesë në pritje.</p></div>
          : te.nePritje.map((k) => <Karta key={k.id} k={k}><VeprimetEStafit id={k.id} lloji="verifikim" /></Karta>)}
      </section>

      {te.teRaportuara.length > 0 && (
        <section className="stack" aria-labelledby="raportuara">
          <h2 id="raportuara">⚠️ Të raportuara ({te.teRaportuara.length})</h2>
          {te.teRaportuara.map((k) => <Karta key={k.id} k={k}><VeprimetEStafit id={k.id} lloji="raportim" /></Karta>)}
        </section>
      )}

      <section className="stack" aria-labelledby="aktive">
        <h2 id="aktive">Aktive ({te.aktive.length})</h2>
        {te.aktive.length === 0
          ? <div className="card empty"><p>Asnjë kërkesë aktive.</p></div>
          : te.aktive.map((k) => <Karta key={k.id} k={k} />)}
      </section>
    </main>
  );
}
