import type { Perdorues } from "@/lib/lejet";
import { dataELejimit, ditetDeriLejimit, distinktivat, distinktiviTjeter, DISTINKTIVAT, grupetMarrese } from "@/lib/gjaku";
import { formatoDaten } from "@/lib/format";

export default function StatusiDhuruesit({ p }: { p: Perdorues }) {
  if (!p.grupi || !p.gjinia) return null;
  const mbetur = ditetDeriLejimit(p.dhurimi_fundit, p.gjinia);
  const leje = dataELejimit(p.dhurimi_fundit, p.gjinia);
  const fituar = new Set(distinktivat(p.dhurime).map((d) => d.kodi));
  const tjetri = distinktiviTjeter(p.dhurime);

  return (
    <>
      {mbetur === 0 ? (
        <p className="alert alert-ok" role="status">
          <strong>📅 Tani mund të dhuroni përsëri!</strong>{" "}
          {p.njoftimet ? "Do të njoftohesh kur dikush afër ka nevojë për ty." : "Njoftimet janë të fikura — aktivizoji më poshtë."}
        </p>
      ) : (
        <p className="alert alert-info" role="status">
          ⏳ Je në periudhë pushimi. Mund të dhurosh përsëri më <strong>{formatoDaten(leje)}</strong> ({mbetur} ditë). Deri atëherë nuk merr njoftime.
        </p>
      )}

      <div className="stats-row">
        <div className="stat"><strong>{p.dhurime}</strong>dhurime</div>
        <div className="stat"><strong>{p.dhurime * 3}</strong>jetë të ndihmuara*</div>
        <div className="stat"><strong>{p.grupi}</strong>i jep: {grupetMarrese(p.grupi).join(", ")}</div>
      </div>
      <p className="small muted">* Një dhurim mund të ndihmojë deri në 3 pacientë.</p>

      <section className="card stack">
        <h2>🏅 Distinktivat</h2>
        <div className="badges">
          {DISTINKTIVAT.map((d) => (
            <div key={d.kodi} className={`badge${fituar.has(d.kodi) ? "" : " locked"}`} aria-label={`${d.emri}${fituar.has(d.kodi) ? " (fituar)" : " (i kyçur)"}`}>
              <span className="icon" aria-hidden="true">{d.ikona}</span>
              <strong>{d.emri}</strong>
              <div className="small muted">{d.pershkrimi}</div>
            </div>
          ))}
        </div>
        {tjetri && <p className="small muted">Edhe {tjetri.nga - p.dhurime} dhurim(e) deri te “{tjetri.emri}”.</p>}
      </section>
    </>
  );
}
