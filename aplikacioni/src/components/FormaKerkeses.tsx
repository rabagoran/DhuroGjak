"use client";
import { useActionState, useState } from "react";
import { postoKerkesen, type GjendjaKerkeses } from "@/app/kerkesa/actions";
import { GRUPET, QYTETET, grupetDhuruese, type GrupGjaku } from "@/lib/gjaku";
import Gabim from "@/components/GabimFushe";

const fillim: GjendjaKerkeses = { ok: false, mesazh: "" };

/** Ora lokale e shfletuesit në formatin e <input type="datetime-local">. */
function lokal(d: Date) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 16);
}

export default function FormaKerkeses({ qytetiIm, telefoniIm }: { qytetiIm: string | null; telefoniIm: string | null }) {
  const [gjendja, veprimi, nePritje] = useActionState(postoKerkesen, fillim);
  const g = gjendja.gabimet ?? {};
  const v = gjendja.vlerat;
  const [grupi, setGrupi] = useState<GrupGjaku | null>((v?.grupi as GrupGjaku) ?? null);
  const [afatiLokal, setAfatiLokal] = useState(v?.afati_lokal ?? lokal(new Date(Date.now() + 6 * 3600e3)));
  const afatiISO = afatiLokal ? new Date(afatiLokal).toISOString() : "";

  return (
    <form action={veprimi} className="card stack" noValidate>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, marginBottom: 6 }}>Grupi i gjakut që nevojitet</legend>
        <div className="group-picker">
          {GRUPET.map((gr) => (
            <label key={gr}>
              <input type="radio" name="grupi" value={gr} checked={grupi === gr} onChange={() => setGrupi(gr)} />
              <span>{gr}</span>
            </label>
          ))}
        </div>
        {grupi && <p className="hint">Mund të dhurojnë: <strong>{grupetDhuruese(grupi).join(", ")}</strong></p>}
        <Gabim teksti={g.grupi} />
      </fieldset>
      <div className="field">
        <label htmlFor="spitali">Spitali / qendra</label>
        <input id="spitali" name="spitali" defaultValue={v?.spitali ?? ""} placeholder="p.sh. QKUK Prishtinë" maxLength={120} required aria-invalid={!!g.spitali} />
        <Gabim teksti={g.spitali} />
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="qyteti">Qyteti</label>
          <select id="qyteti" name="qyteti" defaultValue={v?.qyteti ?? qytetiIm ?? ""} required aria-invalid={!!g.qyteti}>
            <option value="" disabled>Zgjidh qytetin</option>
            {QYTETET.map((q) => <option key={q}>{q}</option>)}
          </select>
          <Gabim teksti={g.qyteti} />
        </div>
        <div className="field">
          <label htmlFor="dozat">Dozat (dhurues)</label>
          <input id="dozat" name="dozat" type="number" inputMode="numeric" min={1} max={10} defaultValue={v?.dozat ?? "1"} required aria-invalid={!!g.dozat} />
          <Gabim teksti={g.dozat} />
        </div>
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="afati_lokal">Afati</label>
          <input id="afati_lokal" name="afati_lokal" type="datetime-local" value={afatiLokal} onChange={(e) => setAfatiLokal(e.target.value)} required aria-invalid={!!g.afati} />
          <input type="hidden" name="afati" value={afatiISO} />
          <Gabim teksti={g.afati} />
        </div>
        <div className="field">
          <label htmlFor="telefoni_kontaktit">Telefoni i kontaktit</label>
          <input id="telefoni_kontaktit" name="telefoni_kontaktit" type="tel" inputMode="tel" defaultValue={v?.telefoni_kontaktit ?? telefoniIm ?? ""} placeholder="044 123 456" required aria-invalid={!!g.telefoni_kontaktit} />
          <p className="hint">🔒 Shfaqet vetëm te dhuruesit që shtypin “Do të shkoj”.</p>
          <Gabim teksti={g.telefoni_kontaktit} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="pershkrimi">Përshkrimi (opsional)</label>
        <textarea id="pershkrimi" name="pershkrimi" defaultValue={v?.pershkrimi ?? ""} maxLength={500} placeholder="p.sh. Paraqituni te Qendra e transfuzionit, kati përdhes. Mos shkruani emrin e pacientit." />
        <Gabim teksti={g.pershkrimi} />
      </div>
      <label className="checkbox">
        <input type="checkbox" name="urgjente" defaultChecked={v ? v.urgjente === "on" : false} /> Urgjente (sot)
      </label>
      {gjendja.mesazh && <p className="alert alert-error" role="alert">{gjendja.mesazh}</p>}
      <button className="btn btn-block" type="submit" disabled={nePritje}>{nePritje ? "Po postohet…" : "Posto kërkesën"}</button>
      <p className="small muted">Dhurimi i gjakut është vullnetar dhe falas. Ndalohet çdo ofertë pagese.</p>
    </form>
  );
}
