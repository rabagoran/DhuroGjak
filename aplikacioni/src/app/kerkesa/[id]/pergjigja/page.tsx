import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejKerkesen, type Kerkese } from "@/lib/kerkesat";
import GabimDB from "@/components/GabimDB";

export const dynamic = "force-dynamic";

export default async function Pergjigja({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let kerkesa: Kerkese | undefined;
  try {
    kerkesa = await gjejKerkesen(id);
  } catch {
    return <main><GabimDB provo={`/kerkesa/${id}/pergjigja`} /></main>;
  }
  if (!kerkesa) notFound();

  return (
    <main>
      <Link href={`/kerkesa/${id}`} className="link-arrow">← Kthehu te detajet</Link>
      <section className="card empty">
        <p className="big-emoji">⏳</p>
        <h1>Simulim: Në pritje</h1>
        <p>Pjesëmarrja jote për <strong>{kerkesa.spitali}</strong> nuk është dërguar ende te kërkuesi.</p>
        <p className="muted">Ruajtjen reale dhe njoftimin do t’i shtojmë në javët e ardhshme.</p>
      </section>
    </main>
  );
}
