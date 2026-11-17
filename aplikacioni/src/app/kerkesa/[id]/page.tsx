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
import { mbyllKerkesen, anuloPjesemarrjen, konfirmoDhurimInAction } from "../actions";

export const dynamic = "force-dynamic";

const MESAZHET: Record<string, { teksti: string; ok: boolean }> = {
  postuar: { teksti: "Kërkesa u postua. Dhuruesit e përputhshëm do të njoftohen.", ok: true },
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
  if (!kerkesa) notFound();

  const pronar = p !== null && (p.id === kerkesa.krijuar_nga || p.roli === "admin");
  const aktive = kerkesa.statusi === "aktive" && !kaSkaduar(kerkesa.afati);
  const kaPranuar = ime === "do_shkoj" || ime === "dhuroi";
  const vendimi = vendosPergjigjen(p, kerkesa, { kaPranuar });
  const nr = Number(n);
  const mesazh = m === "postuar" && n !== undefined
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
        {!aktive && <p><span className="pill pill-off">{kerkesa.statusi === "perfunduar" ? "Përfunduar ✅" : kerkesa.statusi === "anuluar" ? "Anuluar" : "Afati ka kaluar"}</span></p>}
        {kerkesa.urgjente && aktive && <p><span className="pill pill-urgent">Urgjente</span></p>}
        {kerkesa.pershkrimi && <p>{kerkesa.pershkrimi}</p>}
        {!butoniOptimist && <Progresi pranuar={kerkesa.pranuar} dozat={kerkesa.dozat} />}
        {aktive && <LiveRifreskim url={`/api/kerkesat/${kerkesa.id}/gjendja`} />}
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
      </section>

      {/* Pamja e pronarit */}
      {pronar && (
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
    </main>
  );
}
