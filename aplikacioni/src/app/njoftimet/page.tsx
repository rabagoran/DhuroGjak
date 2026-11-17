import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { perdoruesiIm, type Perdorues } from "@/lib/lejet";
import { lexoNjoftimet, lidhjaENjoftimit, type Njoftim } from "@/lib/njoftimet";
import GabimDB from "@/components/GabimDB";
import { shenoTeGjitha } from "./actions";

export const metadata: Metadata = { title: "Njoftimet" };
export const dynamic = "force-dynamic";

const IKONAT: Record<Njoftim["lloji"], string> = {
  kerkese_e_re: "🩸", dhurues_vjen: "✅", dhuruesi_anuloi: "⚠️", dhurim_konfirmuar: "❤", kerkesa_perfundoi: "🎉", kujtues: "📅",
};

function kohaRelative(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "tani";
  if (s < 3600) return `para ${Math.floor(s / 60)} min`;
  if (s < 86400) return `para ${Math.floor(s / 3600)} orësh`;
  return new Date(iso).toLocaleDateString("sq-AL", { timeZone: "Europe/Belgrade" });
}

export default async function NjoftimetFaqe() {
  let p: Perdorues | null;
  let lista: Njoftim[] = [];
  try {
    p = await perdoruesiIm();
    if (p) lista = await lexoNjoftimet(p.id);
  } catch {
    return <main><h1>Njoftimet</h1><GabimDB provo="/njoftimet" /></main>;
  }
  if (!p) redirect("/hyrja?callbackUrl=/njoftimet");
  const palexuara = lista.filter((n) => !n.lexuar).length;

  return (
    <main className="stack">
      <div className="page-head">
        <div>
          <h1>🔔 Njoftimet</h1>
          <p className="muted">{palexuara ? `${palexuara} të palexuara` : "Të gjitha të lexuara"}</p>
        </div>
        {palexuara > 0 && (
          <form action={shenoTeGjitha}><button className="btn btn-ghost btn-small">Shëno të gjitha si të lexuara</button></form>
        )}
      </div>
      {lista.length === 0 ? (
        <div className="card empty">
          <p className="big-emoji">🔕</p>
          <p>Ende s’ke njoftime. Kur dikush afër ka nevojë për grupin tënd, do ta shohësh këtu.</p>
          <Link href="/profili">Kontrollo cilësimet e njoftimeve</Link>
        </div>
      ) : lista.map((n) => (
        <Link key={n.id} href={lidhjaENjoftimit(n)} className={`card notif${n.lexuar ? "" : " unread"}`}>
          <p style={{ margin: 0 }}>
            <span aria-hidden="true">{IKONAT[n.lloji]} </span>
            {!n.lexuar && <span className="sr-only">E palexuar: </span>}
            {n.lexuar ? n.teksti : <strong>{n.teksti}</strong>}
          </p>
          <time dateTime={n.krijuar_ne}>{kohaRelative(n.krijuar_ne)}</time>
        </Link>
      ))}
    </main>
  );
}
