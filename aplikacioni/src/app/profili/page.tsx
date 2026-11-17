import type { Metadata } from "next";
import Link from "next/link";
import { perdoruesiIm, profiliIPlote, type Perdorues } from "@/lib/lejet";
import { pjesemarrjetEMia, type PjesemarrjaIme } from "@/lib/pergjigjet";
import { numriNePritje } from "@/lib/spitali";
import { gjejSpitalin } from "@/lib/spitalet";
import { ofruesitAktive } from "@/lib/auth";
import { formatoAfatin } from "@/lib/format";
import { ButonatEHyrjes, ButoniDalja } from "@/components/Hyrja";
import FormaProfilit from "@/components/FormaProfilit";
import StatusiDhuruesit from "@/components/StatusiDhuruesit";
import NjoftimetPush from "@/components/NjoftimetPush";
import GabimDB from "@/components/GabimDB";

export const metadata: Metadata = { title: "Profili" };
export const dynamic = "force-dynamic";

export default async function Profili() {
  let p: Perdorues | null;
  let pjesemarrjet: PjesemarrjaIme[] = [];
  let nePritje = 0;
  try {
    p = await perdoruesiIm();
    if (p) [pjesemarrjet, nePritje] = await Promise.all([pjesemarrjetEMia(p.id), numriNePritje(p)]);
  } catch {
    return <main><h1>Profili im</h1><GabimDB provo="/profili" /></main>;
  }

  if (!p) {
    return (
      <main>
        <section className="card stack">
          <h1>Bëhu dhurues</h1>
          <p>Regjistrohu një herë dhe do të njoftohesh vetëm kur dikush afër teje ka nevojë për grupin tënd — dhe vetëm kur lejohesh të dhurosh.</p>
          <ButonatEHyrjes ofruesit={ofruesitAktive} />
        </section>
      </main>
    );
  }

  return (
    <main className="stack">
      <div className="page-head">
        <div>
          <h1>Përshëndetje, {p.emri.split(" ")[0]}!</h1>
          <p className="muted">{profiliIPlote(p) ? `Dhurues · ${p.grupi} · ${p.qyteti}` : "Plotëso profilin për t’u bërë dhurues."}</p>
        </div>
        <ButoniDalja />
      </div>

      {(p.roli === "spital" || p.roli === "admin") && (
        <Link href="/spitali" className="card notif unread">
          <h2>🏥 Paneli i spitalit</h2>
          <p className="muted small">
            {p.roli === "spital" ? gjejSpitalin(p.spitali_id)?.emri : "Administrator"} ·{" "}
            {nePritje > 0 ? `${nePritje} kërkesa presin verifikimin` : "asnjë kërkesë në pritje"}
          </p>
        </Link>
      )}

      <StatusiDhuruesit p={p} />

      {pjesemarrjet.length > 0 && (
        <section className="card">
          <h2>Pjesëmarrjet e mia</h2>
          {pjesemarrjet.map((x) => (
            <div className="donor-row" key={x.kerkesa_id}>
              <Link href={`/kerkesa/${x.kerkesa_id}`}><strong>{x.grupi}</strong> · {x.spitali}</Link>
              <span className={`pill ${x.statusi === "dhuroi" ? "pill-ok" : "pill-wait"}`}>
                {x.statusi === "dhuroi" ? "Dhurova ✅" : formatoAfatin(x.afati)}
              </span>
            </div>
          ))}
        </section>
      )}

      <FormaProfilit p={p} />
      <NjoftimetPush />
      <p className="small muted">Kërkesat që ke postuar i gjen te <Link href="/kerkesa/e-mia">Kërkesat e mia</Link>.</p>
      <p className="small muted">ID e llogarisë: <code>{p.id}</code> (i duhet administratorit nëse punon në spital dhe kërkon qasje në panel).</p>
    </main>
  );
}
