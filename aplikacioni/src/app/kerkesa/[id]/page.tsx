import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejKerkesen, type Kerkese } from "@/lib/kerkesat";
import { perdoruesiIm, type Perdorues } from "@/lib/lejet";
import { pergjigjaIme, pergjigjetPerPronar, kontaktiPerDhuruesin, type PergjigjePerPronar, type StatusiPergjigjes } from "@/lib/pergjigjet";
import { vendosPergjigjen, MESAZHET_E_VENDIMIT } from "@/lib/rregullat";
import { grupetDhuruese } from "@/lib/gjaku";
import { dozat, formatoAfatin, kaSkaduar } from "@/lib/format";
import Progresi from "@/components/Progresi";
import GabimDB from "@/components/GabimDB";
import DoTeShkoj from "@/components/DoTeShkoj";
import LiveRifreskim from "@/components/LiveRifreskim";
import { shenoTeLexuaraPerKerkesen } from "@/lib/njoftimet";
import { mbyllKerkesen, anuloPjesemarrjen, konfirmoDhurimInAction, raporto } from "../actions";
import { mundTeShikoje, eshteStafi, mundTeVerifikoje, mundTeRaportoje, ARSYET_E_RAPORTIMIT } from "@/lib/verifikimi";
import VeprimetEStafit from "@/components/VeprimetEStafit";

export const dynamic = "force-dynamic";

const MESAZHET: Record<string, { teksti: string; ok: boolean }> = {
  postuar: { teksti: "Kërkesa u postua. Dhuruesit e përputhshëm do të njoftohen.", ok: true },
  "ne-verifikim": { teksti: "Kërkesa u dërgua te spitali për verifikim. Stafi mund të të telefonojë; pas konfirmimit dhuruesit njoftohen automatikisht.", ok: true },
  verifikuar: { teksti: "Kërkesa u konfirmua dhe u bë publike.", ok: true },
  refuzuar: { teksti: "Kërkesa u refuzua. Kërkuesi u njoftua me arsyen.", ok: true },
  rikthyer: { teksti: "Raportimet u shqyrtuan. Kërkesa është sërish publike.", ok: true },
  raportuar: { teksti: "Faleminderit! Stafi i spitalit do ta shqyrtojë raportimin.", ok: true },
  "raportuar-me-pare": { teksti: "E ke raportuar tashmë këtë kërkesë.", ok: true },
  perfunduar: { teksti: "Kërkesa u shënua “Përfunduar”.", ok: true },
  "perfunduar-auto": { teksti: "Dhurimi u konfirmua dhe dozat u mbuluan — kërkesa u përfundua ✅", ok: true },
  konfirmuar: { teksti: "Dhurimi u konfirmua. Dhuruesi u bllokua automatikisht për 3–4 muaj.", ok: true },
  anuluar: { teksti: "Kërkesa u anulua.", ok: true },
  "anuluar-pjesemarrja": { teksti: "Pjesëmarrja jote u anulua. Kërkuesi do ta shohë.", ok: true },
  ndaluar: { teksti: "Nuk ke leje për këtë veprim. Asgjë nuk ndryshoi.", ok: false },
  fushe: { teksti: "Kërkesa nuk është e vlefshme.", ok: false },
  databaza: { teksti: "Nuk u lidhëm me databazën. Provo përsëri.", ok: false },
  ...Object.fromEntries(Object.entries(MESAZHET_E_VENDIMIT).map(([k, v]) => [k, { teksti: v, ok: false }])),
};

export default async function Detajet({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ m?: string; n?: string }>;
}) {
  const { id } = await params;
  const { m, n } = await searchParams;
  let kerkesa: Kerkese | undefined;
  let p: Perdorues | null = null;
  let ime: StatusiPergjigjes | null = null;
  let dhuruesit: PergjigjePerPronar[] = [];
  let kontakti: { emri: string; telefoni: string } | null = null;
  try {
    kerkesa = await gjejKerkesen(id);
    if (kerkesa) {
      p = await perdoruesiIm();
      if (p) {
        // Java 11: hapja e kërkesës i shënon njoftimet e saj si të lexuara.
        await shenoTeLexuaraPerKerkesen(p.id, kerkesa.id).catch(() => {});
        ime = await pergjigjaIme(kerkesa.id, p.id);
        if (p.id === kerkesa.krijuar_nga || p.roli === "admin") dhuruesit = await pergjigjetPerPronar(p, kerkesa.id);
        if (ime === "do_shkoj" || ime === "dhuroi") kontakti = await kontaktiPerDhuruesin(p, kerkesa.id);
      }
    }
  } catch {
    return <main><Link href="/" className="link-arrow">← Kthehu te lista</Link><GabimDB provo={`/kerkesa/${id}`} teksti="Detajet nuk u ngarkuan." /></main>;
  }
  // Kërkesat në verifikim, të refuzuara ose të pezulluara i shohin vetëm kërkuesi dhe stafi i spitalit.
  if (!kerkesa || !mundTeShikoje(p, kerkesa)) notFound();

  const stafi = eshteStafi(p, kerkesa);
  const pronar = p !== null && (p.id === kerkesa.krijuar_nga || stafi);
  const aktive = kerkesa.statusi === "aktive" && !kerkesa.pezulluar && !kaSkaduar(kerkesa.afati);
  const nePritje = kerkesa.statusi === "ne_verifikim" && !kaSkaduar(kerkesa.afati);
  const kaPranuar = ime === "do_shkoj" || ime === "dhuroi";
  const vendimi = vendosPergjigjen(p, kerkesa, { kaPranuar });
  const nr = Number(n);
  const mesazh = m === "verifikuar" && n !== undefined
    ? { ok: true, teksti: nr >= 0 ? `Kërkesa u konfirmua. U njoftuan ${nr} dhurues të përputhshëm.` : "Kërkesa u konfirmua, por njoftimet nuk u dërguan." }
    : m === "postuar" && n !== undefined
    ? { ok: true, teksti: nr > 0 ? `Kërkesa u postua. U njoftuan ${nr} dhurues të përputhshëm afër spitalit 🔔` : nr === 0 ? "Kërkesa u postua. Ende s’ka dhurues të përputhshëm të lirë afër — ndaje lidhjen me të afërmit." : "Kërkesa u postua, por njoftimet nuk u dërguan. Ndaje lidhjen me të afërmit." }
    : m ? MESAZHET[m] : undefined;
  // Java 9: kur butoni optimist shfaqet, ai vizaton edhe progresin (që të rritet menjëherë).
  const butoniOptimist = !pronar && aktive && !kaPranuar && (vendimi === "ok" || vendimi === "hyr");

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
        {kerkesa.verifikuar && <p className="verified">✅ E verifikuar nga {kerkesa.spitali}</p>}
        {nePritje && (
          <div className="alert alert-info">
            <p><strong>🏥 Në pritje të verifikimit nga spitali</strong></p>
            <p className="small">Kërkesa nuk është publike dhe asnjë dhurues nuk është njoftuar ende. Stafi i spitalit e konfirmon me telefon.</p>
          </div>
        )}
        {kerkesa.statusi === "refuzuar" && (
          <p className="alert alert-error"><strong>Spitali nuk e konfirmoi këtë kërkesë.</strong> {kerkesa.arsyeja_refuzimit}</p>
        )}
        {kerkesa.pezulluar && kerkesa.statusi === "aktive" && (
          <p className="alert alert-error"><strong>⚠️ E pezulluar pas raportimeve.</strong> Nuk shfaqet publikisht derisa stafi i spitalit ta shqyrtojë.</p>
        )}
        {!aktive && !nePritje && kerkesa.statusi !== "refuzuar" && !kerkesa.pezulluar && <p><span className="pill pill-off">{kerkesa.statusi === "perfunduar" ? "Përfunduar ✅" : kerkesa.statusi === "anuluar" ? "Anuluar" : "Afati ka kaluar"}</span></p>}
        {kerkesa.urgjente && aktive && <p><span className="pill pill-urgent">Urgjente</span></p>}
        {kerkesa.pershkrimi && <p>{kerkesa.pershkrimi}</p>}
        {!butoniOptimist && <Progresi pranuar={kerkesa.pranuar} dozat={kerkesa.dozat} />}
        {aktive && <LiveRifreskim url={`/api/kerkesat/${kerkesa.id}/gjendja`} />}
        {stafi && mundTeVerifikoje(p, kerkesa) && nePritje && <VeprimetEStafit id={kerkesa.id} lloji="verifikim" kthehu="kerkesa" />}
        {stafi && kerkesa.pezulluar && kerkesa.statusi === "aktive" && <VeprimetEStafit id={kerkesa.id} lloji="raportim" kthehu="kerkesa" />}
        <p className="muted small">Mund të dhurojnë grupet: <strong>{grupetDhuruese(kerkesa.grupi).join(", ")}</strong></p>

        {/* Pamja e dhuruesit */}
        {!pronar && kaPranuar && (
          <div className="alert alert-ok">
            <p><strong>{ime === "dhuroi" ? "Dhurimi yt u konfirmua. Faleminderit, hero! 🦸" : "Ke pranuar këtë kërkesë ✅"}</strong></p>
            {kontakti && <p>Kontakti: {kontakti.emri} · <a className="contact" href={`tel:${kontakti.telefoni}`}>{kontakti.telefoni}</a></p>}
          </div>
        )}
        {!pronar && aktive && !kaPranuar && (
          vendimi === "ok" || vendimi === "hyr" ? (
            <DoTeShkoj kerkesaId={kerkesa.id} pranuar={kerkesa.pranuar} dozat={kerkesa.dozat} kaHyre={p !== null} />
          ) : (
            <>
              <button className="btn btn-block" type="button" disabled>❤ Do të shkoj</button>
              <p className="hint">{MESAZHET_E_VENDIMIT[vendimi]}{vendimi === "profili" && <> <Link href="/profili">Plotëso profilin</Link></>}</p>
            </>
          )
        )}
        {!pronar && ime === "do_shkoj" && aktive && (
          <form action={anuloPjesemarrjen}>
            <input type="hidden" name="id" value={kerkesa.id} />
            <button className="btn btn-ghost btn-small" type="submit">Nuk mund të shkoj më — anulo</button>
          </form>
        )}
        {aktive && mundTeRaportoje(p, kerkesa) && (
          <details className="report">
            <summary>Raporto kërkesën</summary>
            <form action={raporto} className="refuzo" style={{ marginTop: 8 }}>
              <input type="hidden" name="id" value={kerkesa.id} />
              <label className="sr-only" htmlFor="arsyeja">Arsyeja</label>
              <select id="arsyeja" name="arsyeja" defaultValue="e_rreme">
                {Object.entries(ARSYET_E_RAPORTIMIT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button className="btn btn-ghost btn-small" type="submit">Dërgo raportimin</button>
            </form>
          </details>
        )}
      </section>

      {/* Pamja e kërkuesit dhe e stafit të spitalit */}
      {pronar && kerkesa.verifikuar && (
        <section className="card stack" style={{ marginTop: 14 }}>
          <h2>Dhuruesit që po vijnë</h2>
          {dhuruesit.length === 0 ? (
            <p className="muted">Ende asnjë dhurues. Do të shfaqen këtu sapo të shtypin “Do të shkoj”.</p>
          ) : (
            <div>
              {dhuruesit.map((d) => (
                <div className="donor-row" key={d.id}>
                  <div>
                    <strong>{d.emri}</strong> {d.grupi && <span className="pill pill-urgent">{d.grupi}</span>}<br />
                    {d.telefoni && <a href={`tel:${d.telefoni}`}>{d.telefoni}</a>}
                  </div>
                  {d.statusi === "dhuroi" ? (
                    <span className="pill pill-ok">Dhuroi ✅</span>
                  ) : aktive ? (
                    <form action={konfirmoDhurimInAction}>
                      <input type="hidden" name="id" value={kerkesa.id} />
                      <input type="hidden" name="pergjigje" value={d.id} />
                      <button className="btn btn-green btn-small" type="submit">Konfirmo dhurimin</button>
                    </form>
                  ) : <span className="pill pill-wait">Në pritje</span>}
                </div>
              ))}
            </div>
          )}
          {aktive && (
            <form action={mbyllKerkesen} className="actions">
              <input type="hidden" name="id" value={kerkesa.id} />
              <button className="btn btn-ghost btn-small" name="statusi" value="perfunduar">Shëno “Përfunduar”</button>
              <button className="btn btn-ghost btn-small" name="statusi" value="anuluar">Anulo kërkesën</button>
            </form>
          )}
          <p className="small muted">Telefonat e dhuruesve shfaqen vetëm këtu, vetëm për ty, sepse ata e pranuan kërkesën.</p>
        </section>
      )}
      {p?.id === kerkesa.krijuar_nga && nePritje && (
        <form action={mbyllKerkesen} className="actions">
          <input type="hidden" name="id" value={kerkesa.id} />
          <button className="btn btn-ghost btn-small" name="statusi" value="anuluar">Anulo kërkesën</button>
        </form>
      )}
    </main>
  );
}
