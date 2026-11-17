import type { Metadata } from "next";
import Link from "next/link";
import { perdoruesiIm, profiliIPlote, type Perdorues } from "@/lib/lejet";
import { ofruesitAktive } from "@/lib/auth";
import { ButonatEHyrjes, ButoniDalja } from "@/components/Hyrja";
import FormaProfilit from "@/components/FormaProfilit";
import GabimDB from "@/components/GabimDB";

export const metadata: Metadata = { title: "Profili" };
export const dynamic = "force-dynamic";

export default async function Profili() {
  let p: Perdorues | null;
  try { p = await perdoruesiIm(); }
  catch { return <main><h1>Profili im</h1><GabimDB provo="/profili" /></main>; }

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
      <FormaProfilit p={p} />
      <p className="small muted">Kërkesat që ke postuar i gjen te <Link href="/kerkesa/e-mia">Kërkesat e mia</Link>.</p>
    </main>
  );
}
