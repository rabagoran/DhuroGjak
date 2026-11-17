import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejKerkesen, type Kerkese } from "@/lib/kerkesat";
import { grupetDhuruese } from "@/lib/gjaku";
import { dozat, formatoAfatin } from "@/lib/format";
import Progresi from "@/components/Progresi";
import GabimDB from "@/components/GabimDB";

export const dynamic = "force-dynamic";

export default async function Detajet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let kerkesa: Kerkese | undefined;
  try {
    kerkesa = await gjejKerkesen(id);
  } catch {
    return <main><Link href="/" className="link-arrow">← Kthehu te lista</Link><GabimDB provo={`/kerkesa/${id}`} teksti="Detajet nuk u ngarkuan." /></main>;
  }
  if (!kerkesa) notFound();

  return (
    <main>
      <Link href="/" className="link-arrow">← Kthehu te lista</Link>
      <div className="detail-head">
        <span className="blood-badge big">{kerkesa.grupi}</span>
        <div>
          <h1>{kerkesa.spitali}</h1>
          <p className="muted">{kerkesa.qyteti} · {dozat(kerkesa.dozat)} · {formatoAfatin(kerkesa.afati)}</p>
        </div>
      </div>
      <section className="card stack">
        {kerkesa.pershkrimi && <p>{kerkesa.pershkrimi}</p>}
        <Progresi pranuar={kerkesa.pranuar} dozat={kerkesa.dozat} />
        <p className="muted small">Mund të dhurojnë grupet: <strong>{grupetDhuruese(kerkesa.grupi).join(", ")}</strong></p>
        <Link className="btn btn-block" href={`/kerkesa/${kerkesa.id}/pergjigja`}>❤ Do të shkoj</Link>
      </section>
    </main>
  );
}
