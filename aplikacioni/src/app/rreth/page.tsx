import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Rreth DhuroGjak" };

export default function Rreth() {
  return (
    <main className="stack">
      <div>
        <h1>Rreth DhuroGjak</h1>
        <p className="muted">Lidh pacientët që kanë nevojë urgjente për gjak me dhuruesit vullnetarë afër tyre.</p>
      </div>
      <section className="card stack">
        <h2>❤ Gjaku nuk shitet</h2>
        <p>Në Kosovë, në Shqipëri dhe në pjesën më të madhe të botës, gjaku dhurohet <strong>vullnetarisht dhe pa pagesë</strong>, siç e rekomandon Organizata Botërore e Shëndetësisë. Shitja e gjakut nuk lejohet dhe nuk është etike. DhuroGjak nuk ka asnjë pagesë mes përdoruesve. Raporto çdo kërkesë që ofron ose kërkon para.</p>
      </section>
      <section className="card stack">
        <h2>🏥 Çdo kërkesë verifikohet nga spitali</h2>
        <ul>
          <li>Kërkesat që poston stafi i spitalit publikohen menjëherë.</li>
          <li>Kërkesat e familjarëve shkojnë fillimisht te stafi i spitalit të zgjedhur, që i konfirmon me telefon.</li>
          <li>Asnjë dhurues nuk njoftohet për kërkesë që spitali nuk e ka konfirmuar.</li>
          <li>Çdo kërkesë mund të raportohet; pas disa raportimeve fshihet derisa ta shqyrtojë spitali.</li>
        </ul>
      </section>
      <section className="card stack">
        <h2>🤝 Bashkëpunimi</h2>
        <p>DhuroGjak është jofitimprurës. Spitalet dhe qendrat e transfuzionit që duan qasje në panelin e verifikimit mund të kërkojnë llogari stafi nga administratori.</p>
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
