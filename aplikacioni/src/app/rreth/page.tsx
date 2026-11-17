import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Rreth projektit" };

export default function Rreth() {
  return (
    <main className="stack">
      <div>
        <h1>Rreth DhuroGjak</h1>
        <p className="muted">Projekt social me ndikim · Programimi për Pajisje Mobile, AAB 2026/2027</p>
      </div>
      <section className="card stack">
        <h2>❤ Gjaku nuk shitet</h2>
        <p>Në Kosovë, në Shqipëri dhe në pjesën më të madhe të botës, gjaku dhurohet <strong>vullnetarisht dhe pa pagesë</strong>, siç e rekomandon Organizata Botërore e Shëndetësisë. Shitja e gjakut nuk lejohet dhe nuk është etike. DhuroGjak nuk ka asnjë pagesë mes përdoruesve. Raporto çdo kërkesë që ofron ose kërkon para.</p>
      </section>
      <section className="card stack">
        <h2>Si mbahet projekti</h2>
        <ul>
          <li><strong>Sponsorë</strong> — kompani që shfaqen si “Mbështetës” në aplikacion.</li>
          <li><strong>Partneritete</strong> — Kryqi i Kuq, spitalet, komunat, Qendra Kombëtare e Transfuzionit të Gjakut.</li>
          <li><strong>Grante</strong> — OJQ, BE dhe programe për shëndetësi digjitale.</li>
          <li><strong>Shpërblime jo-monetare</strong> për dhuruesit nga partnerët: p.sh. zbritje në palestër ose kafe falas pas dhurimit.</li>
        </ul>
      </section>
      <section className="card stack">
        <h2>🤝 Mbështetësit</h2>
        <p className="muted">Hapësirë për partnerët e ardhshëm. Dëshiron ta mbështesësh projektin? Na shkruaj.</p>
        <div className="badges">
          <div className="badge locked"><span className="icon">🏥</span>Partneri juaj</div>
          <div className="badge locked"><span className="icon">☕</span>Partneri juaj</div>
          <div className="badge locked"><span className="icon">🏋️</span>Partneri juaj</div>
        </div>
      </section>
      <section className="card stack">
        <h2>🔒 Privatësia</h2>
        <ul>
          <li>Grupi i gjakut është e dhënë shëndetësore dhe nuk shfaqet publikisht.</li>
          <li>Telefoni yt shfaqet vetëm te kërkuesi, vetëm pasi ti të pranosh kërkesën.</li>
          <li>Vendndodhja përdoret vetëm në telefon dhe nuk ruhet.</li>
          <li>Mund të fikësh njoftimet në çdo kohë nga <Link href="/profili">Profili</Link>.</li>
        </ul>
      </section>
      <p className="small muted">Ky aplikacion nuk zëvendëson udhëzimet mjekësore. Kriteret përfundimtare për dhurim i vendos stafi mjekësor në qendrën e transfuzionit.</p>
    </main>
  );
}
