import type { Metadata } from "next";
import { ofruesitAktive } from "@/lib/auth";
import { ButonatEHyrjes } from "@/components/Hyrja";

export const metadata: Metadata = { title: "Hyrja" };

export default async function HyrjaFaqe({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const { callbackUrl, error } = await searchParams;
  // Lejo vetëm kthim brenda aplikacionit (jo URL të jashtme).
  const kthehu = callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/profili";
  return (
    <main>
      <section className="card stack">
        <h1>Hyr në DhuroGjak</h1>
        <p className="muted">Lista e kërkesave është publike. Hyrja nevojitet për t’u regjistruar si dhurues, për të postuar kërkesë ose për të shtypur “Do të shkoj”.</p>
        {error && <p className="alert alert-error" role="alert">Hyrja nuk u krye. Provo përsëri.</p>}
        <ButonatEHyrjes ofruesit={ofruesitAktive} kthehu={kthehu} />
        <p className="small muted">Nuk ruajmë fjalëkalime. Identiteti vërtetohet nga ofruesi që zgjedh.</p>
      </section>
    </main>
  );
}
