import Link from "next/link";
import { notFound, redirect, unstable_rethrow } from "next/navigation";
import { gjejKerkesen, type Kerkese } from "@/lib/kerkesat";
import { perdoruesiIm } from "@/lib/lejet";
import { kontaktiPerDhuruesin } from "@/lib/pergjigjet";
import { formatoAfatin } from "@/lib/format";
import GabimDB from "@/components/GabimDB";

export const dynamic = "force-dynamic";

/** Ekrani “Pranuar · në pritje” — vetëm për dhuruesin që ka pranuar. */
export default async function Pergjigja({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let kerkesa: Kerkese | undefined;
  let emri = "";
  let kontakti: { emri: string; telefoni: string } | null = null;
  try {
    kerkesa = await gjejKerkesen(id);
    const p = await perdoruesiIm();
    if (!p) redirect(`/hyrja?callbackUrl=/kerkesa/${id}`);
    emri = p.emri.split(" ")[0];
    if (kerkesa) kontakti = await kontaktiPerDhuruesin(p, kerkesa.id);
  } catch (e) {
    unstable_rethrow(e); // lër redirect-in e Next.js të kalojë
    return <main><GabimDB provo={`/kerkesa/${id}/pergjigja`} /></main>;
  }
  if (!kerkesa) notFound();
  if (!kontakti) redirect(`/kerkesa/${id}`);

  return (
    <main>
      <Link href={`/kerkesa/${id}`} className="link-arrow">← Kthehu te detajet</Link>
      <section className="card stack" style={{ textAlign: "center" }}>
        <p className="big-emoji" style={{ fontSize: 52, margin: 0 }}>✅</p>
        <h1>Faleminderit, {emri}!</h1>
        <p>Kërkuesi u njoftua që po vjen.</p>
        <div className="card" style={{ textAlign: "left" }}>
          <p><strong>{kerkesa.spitali}</strong> · {kerkesa.qyteti}</p>
          <p className="muted">Grupi {kerkesa.grupi} · {formatoAfatin(kerkesa.afati)}</p>
          <p>Kontakti: {kontakti.emri}</p>
          <p><a className="btn btn-block" href={`tel:${kontakti.telefoni}`}>📞 Telefono {kontakti.telefoni}</a></p>
        </div>
        <p className="muted small">Merr me vete letërnjoftimin. Pas dhurimit, kërkuesi e konfirmon dhe ti bllokohesh automatikisht 3 muaj (meshkujt) ose 4 muaj (femrat), që të mos marrësh njoftime.</p>
        <Link href="/qendrat" className="link-arrow" style={{ justifyContent: "center" }}>📍 Gjej qendrën e transfuzionit</Link>
      </section>
    </main>
  );
}
