import type { Metadata } from "next";
import { perdoruesiIm, type Perdorues } from "@/lib/lejet";
import { ofruesitAktive } from "@/lib/auth";
import { ButonatEHyrjes } from "@/components/Hyrja";
import FormaKerkeses from "@/components/FormaKerkeses";
import GabimDB from "@/components/GabimDB";

export const metadata: Metadata = { title: "Posto kërkesë" };
export const dynamic = "force-dynamic";

export default async function KerkeseERe() {
  let p: Perdorues | null;
  try { p = await perdoruesiIm(); }
  catch { return <main><h1>Posto kërkesë</h1><GabimDB provo="/kerkesa/e-re" /></main>; }

  return (
    <main className="stack">
      <div>
        <h1>Posto kërkesë për gjak</h1>
        <p className="muted">Njoftojmë vetëm dhuruesit me grup të përputhshëm, afër spitalit, që lejohen të dhurojnë.</p>
        {p && p.roli === "perdorues" && (
          <p className="alert alert-info small">🏥 Për t’u mbrojtur nga kërkesat e rreme, kërkesa jote shkon fillimisht te stafi i spitalit. Ata të telefonojnë dhe, pasi ta konfirmojnë, kërkesa bëhet publike dhe dhuruesit njoftohen.</p>
        )}
      </div>
      {p ? (
        <FormaKerkeses qytetiIm={p.qyteti} telefoniIm={p.telefoni} spitaliIm={p.roli === "spital" ? p.spitali_id : null} />
      ) : (
        <section className="card stack">
          <p>Për të shmangur kërkesat e rreme, postimi kërkon hyrje.</p>
          <ButonatEHyrjes ofruesit={ofruesitAktive} kthehu="/kerkesa/e-re" />
        </section>
      )}
    </main>
  );
}
