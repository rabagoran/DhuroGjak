import KartaKerkeses from "@/components/KartaKerkeses";
import { lexoKerkesat } from "@/lib/kerkesat";

export default function Home() {
  const kerkesat = lexoKerkesat();

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Kërkesat aktive</h1>
          <p className="muted">Të dhëna fiktive për ushtrime · Java 3</p>
        </div>
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
