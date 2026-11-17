import type { Metadata } from "next";
import Link from "next/link";
import { lexoStatistikat, type Statistikat } from "@/lib/statistikat";
import GabimDB from "@/components/GabimDB";

export const metadata: Metadata = { title: "Statistikat" };
export const dynamic = "force-dynamic";

export default async function StatistikatFaqe() {
  let s: Statistikat;
  try { s = await lexoStatistikat(); }
  catch { return <main><h1>Statistikat</h1><GabimDB provo="/statistikat" /></main>; }

  const max = Math.max(1, ...s.sipasGrupit.map((g) => g.numri));
  const muaji = new Date().toLocaleDateString("sq-AL", { month: "long", timeZone: "Europe/Belgrade" });

  return (
    <main className="stack">
      <div>
        <h1>📊 Statistikat</h1>
        <p className="muted">Numra agregatë, pa të dhëna personale.</p>
      </div>
      <section className="card" style={{ background: "var(--red)", color: "#fff", borderColor: "var(--red)" }}>
        <p style={{ fontSize: 15, margin: 0 }}>Këtë muaj ({muaji})</p>
        <p style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>u ndihmuan {s.pacienteMuaji} pacientë</p>
        <p style={{ margin: 0 }}>falë {s.dhurimeMuaji} dhurimeve të konfirmuara ❤</p>
      </section>
      <div className="stats-row">
        <div className="stat"><strong>{s.kerkesaAktive}</strong>kërkesa aktive</div>
        <div className="stat"><strong>{s.dhuruesAktive}</strong>dhurues të regjistruar</div>
        <div className="stat"><strong>{s.dhurimeGjithsej}</strong>dhurime gjithsej</div>
      </div>
      <section className="card stack">
        <h2>Dhuruesit sipas grupit të gjakut</h2>
        <div className="bars">
          {s.sipasGrupit.map((g) => (
            <div className="bar-row" key={g.grupi}>
              <strong>{g.grupi}</strong>
              <div className="bar" role="img" aria-label={`${g.grupi}: ${g.numri} dhurues`}><span style={{ width: `${(g.numri / max) * 100}%` }} /></div>
              <span className="small">{g.numri}</span>
            </div>
          ))}
        </div>
        <p className="small muted">Grupi O- është dhuruesi universal — çdo dhurues O- vlen shumë në urgjenca.</p>
      </section>
      <section className="card stack">
        <h2>Si mbahet DhuroGjak?</h2>
        <p>Dhurimi i gjakut është <strong>vullnetar dhe falas</strong>, siç e rekomandon Organizata Botërore e Shëndetësisë. Në aplikacion nuk ka pagesa mes përdoruesve.</p>
        <p className="muted">DhuroGjak është jofitimprurës dhe punon me spitalet, që verifikojnë çdo kërkesë para se të njoftohen dhuruesit.</p>
        <Link href="/rreth">Më shumë për DhuroGjak →</Link>
      </section>
    </main>
  );
}
