import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { perdoruesiIm, type Perdorues } from "@/lib/lejet";
import { listaEPerdoruesve, type PerdoruesPerAdmin } from "@/lib/spitali";
import { SPITALET, gjejSpitalin } from "@/lib/spitalet";
import GabimDB from "@/components/GabimDB";
import { ndryshoRolin } from "../spitali/actions";

export const metadata: Metadata = { title: "Stafi i spitaleve" };
export const dynamic = "force-dynamic";

const MESAZHET: Record<string, { teksti: string; ok: boolean }> = {
  ruajtur: { teksti: "Roli u ruajt.", ok: true },
  fushe: { teksti: "Për rolin “Staf spitali” zgjidh spitalin.", ok: false },
  ndaluar: { teksti: "Ky ndryshim nuk lejohet (p.sh. nuk mund ta ndryshosh rolin tënd).", ok: false },
  databaza: { teksti: "Nuk u lidhëm me databazën. Provo përsëri.", ok: false },
};

const EMRAT_E_ROLEVE = { perdorues: "Përdorues", spital: "Staf spitali", admin: "Administrator" } as const;

export default async function Admin({ searchParams }: { searchParams: Promise<{ m?: string; q?: string }> }) {
  const { m, q = "" } = await searchParams;
  let p: Perdorues | null;
  let lista: PerdoruesPerAdmin[] = [];
  try {
    p = await perdoruesiIm();
    if (p?.roli === "admin") lista = await listaEPerdoruesve(p, q.slice(0, 80));
  } catch {
    return <main><h1>Stafi i spitaleve</h1><GabimDB provo="/admin" /></main>;
  }
  if (!p) redirect("/hyrja?callbackUrl=/admin");
  if (p.roli !== "admin") {
    return <main className="stack"><h1>Stafi i spitaleve</h1><p className="alert alert-error" role="alert">Vetëm administratori ka qasje këtu.</p></main>;
  }
  const mesazh = m ? MESAZHET[m] : undefined;

  return (
    <main className="stack">
      <div className="page-head">
        <div>
          <h1>Stafi i spitaleve</h1>
          <p className="muted">Cakto kush mund të verifikojë kërkesat në emër të një spitali.</p>
        </div>
        <Link className="btn btn-small btn-ghost" href="/spitali">Paneli</Link>
      </div>
      {mesazh && <p className={`alert ${mesazh.ok ? "alert-ok" : "alert-error"}`} role={mesazh.ok ? "status" : "alert"}>{mesazh.teksti}</p>}
      <p className="alert alert-info small">Jepja rolin “Staf spitali” vetëm pasi ta kesh verifikuar personin drejtpërdrejt me spitalin (p.sh. me telefon zyrtar ose email të institucionit).</p>

      <form className="card grid-2" role="search">
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="q">Kërko sipas emrit ose ID-së</label>
          <input id="q" name="q" defaultValue={q} maxLength={80} />
        </div>
        <button className="btn" type="submit" style={{ alignSelf: "end" }}>Kërko</button>
      </form>

      <section className="card">
        {lista.length === 0 ? <p className="muted">Asnjë përdorues.</p> : lista.map((u) => (
          <form key={u.id} action={ndryshoRolin} className="donor-row">
            <input type="hidden" name="id" value={u.id} />
            <div>
              <strong>{u.emri}</strong> <span className="pill pill-off">{EMRAT_E_ROLEVE[u.roli]}</span><br />
              <span className="small muted">{u.id}{u.qyteti ? ` · ${u.qyteti}` : ""}{u.spitali_id ? ` · ${gjejSpitalin(u.spitali_id)?.emri ?? u.spitali_id}` : ""}</span>
            </div>
            {u.id === p.id ? <span className="small muted">Ti</span> : (
              <div className="actions" style={{ marginTop: 0 }}>
                <label className="sr-only" htmlFor={`roli-${u.id}`}>Roli</label>
                <select id={`roli-${u.id}`} name="roli" defaultValue={u.roli}>
                  {Object.entries(EMRAT_E_ROLEVE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <label className="sr-only" htmlFor={`spitali-${u.id}`}>Spitali</label>
                <select id={`spitali-${u.id}`} name="spitali_id" defaultValue={u.spitali_id ?? ""}>
                  <option value="">— Spitali —</option>
                  {SPITALET.map((s) => <option key={s.id} value={s.id}>{s.emri}</option>)}
                </select>
                <button className="btn btn-small" type="submit">Ruaj</button>
              </div>
            )}
          </form>
        ))}
      </section>
    </main>
  );
}
