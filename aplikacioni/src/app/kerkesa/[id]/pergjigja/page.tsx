import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejKerkesen } from "@/lib/kerkesat";

export default async function Pergjigja({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kerkesa = gjejKerkesen(id);
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
