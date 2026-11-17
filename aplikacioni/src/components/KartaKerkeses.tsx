import Link from "next/link";
import type { Kerkese } from "@/lib/kerkesat";
import { dozat, formatoAfatin } from "@/lib/format";
import Progresi from "@/components/Progresi";

export default function KartaKerkeses({ kerkesa }: { kerkesa: Kerkese }) {
  return (
    <article className={`card request-card${kerkesa.urgjente ? " is-urgent" : ""}`}>
      <div className="request-head">
        <span className="blood-badge" aria-label={`Grupi i gjakut ${kerkesa.grupi}`}>{kerkesa.grupi}</span>
        <div>
          <h2>{kerkesa.spitali}</h2>
          <p className="muted">
            {kerkesa.qyteti} · {dozat(kerkesa.dozat)} · {formatoAfatin(kerkesa.afati)}
          </p>
        </div>
        {kerkesa.urgjente && <span className="pill pill-urgent">Urgjente</span>}
      </div>
      <Progresi pranuar={kerkesa.pranuar} dozat={kerkesa.dozat} />
      <Link className="link-arrow" href={`/kerkesa/${kerkesa.id}`}>
        Shiko detajet <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
