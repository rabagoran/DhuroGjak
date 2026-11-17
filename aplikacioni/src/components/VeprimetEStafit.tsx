import { verifiko, refuzo, shqyrto } from "@/app/spitali/actions";
import { ARSYET_E_REFUZIMIT } from "@/lib/verifikimi";

/** Butonat e stafit të spitalit: konfirmo/refuzo kërkesën në pritje, ose shqyrto raportimet. */
export default function VeprimetEStafit({ id, lloji, kthehu = "spitali" }: {
  id: string; lloji: "verifikim" | "raportim"; kthehu?: "spitali" | "kerkesa";
}) {
  if (lloji === "raportim") {
    return (
      <form action={shqyrto} className="actions">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="kthehu" value={kthehu} />
        <button className="btn btn-green btn-small" name="vendimi" value="rikthe">Kërkesa është e saktë — rikthe</button>
        <button className="btn btn-ghost btn-small" name="vendimi" value="anulo">Anulo kërkesën</button>
      </form>
    );
  }
  return (
    <div className="stack">
      <form action={verifiko}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="kthehu" value={kthehu} />
        <button className="btn btn-green btn-block" type="submit">✅ Konfirmo — pacienti është te ne</button>
      </form>
      <form action={refuzo} className="refuzo">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="kthehu" value={kthehu} />
        <label className="sr-only" htmlFor={`arsyeja-${id}`}>Arsyeja e refuzimit</label>
        <select id={`arsyeja-${id}`} name="arsyeja" defaultValue="pa_pacient">
          {Object.entries(ARSYET_E_REFUZIMIT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn btn-ghost btn-small" type="submit">Refuzo</button>
      </form>
    </div>
  );
}
