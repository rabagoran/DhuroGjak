import Link from "next/link";
import KartaKerkeses from "@/components/KartaKerkeses";
import GabimDB from "@/components/GabimDB";
import LiveRifreskim from "@/components/LiveRifreskim";
import { lexoKerkesat, type Kerkese } from "@/lib/kerkesat";

export const dynamic = "force-dynamic";

export default async function Home() {
  let kerkesat: Kerkese[];
  try {
    kerkesat = await lexoKerkesat();
  } catch {
    return <main><h1>Kërkesat aktive</h1><GabimDB /></main>;
  }

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Kërkesat aktive</h1>
          <p className="muted">Njoftojmë vetëm dhuruesit e përputhshëm, afër dhe që lejohen të dhurojnë.</p>
          <LiveRifreskim url="/api/kerkesat" intervali={15000} />
        </div>
        <Link className="btn btn-small" href="/kerkesa/e-re">+ Posto kërkesë</Link>
      </div>
      {kerkesat.length === 0 ? (
        <div className="card empty"><p className="big-emoji">🩸</p><p>Nuk ka kërkesa aktive për momentin.</p></div>
      ) : (
        <div className="stack">
          {kerkesat.map((k) => <KartaKerkeses key={k.id} kerkesa={k} />)}
        </div>
      )}
    </main>
  );
}
