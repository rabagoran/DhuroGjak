"use client";
import { useActionState } from "react";
import { ruajProfilin, type GjendjaFormes } from "@/app/profili/actions";
import { GRUPET, QYTETET } from "@/lib/gjaku";
import type { Perdorues } from "@/lib/lejet";
import Gabim from "@/components/GabimFushe";

const fillim: GjendjaFormes = { ok: false, mesazh: "" };

export default function FormaProfilit({ p }: { p: Perdorues }) {
  const [gjendja, veprimi, nePritje] = useActionState(ruajProfilin, fillim);
  const g = gjendja.gabimet ?? {};
  // Pas gabimi, fushat mbajnë atë që shkroi përdoruesi (React i rivendos formularët pas veprimit).
  const v = gjendja.vlerat;
  const d = {
    emri: v?.emri ?? p.emri,
    telefoni: v?.telefoni ?? p.telefoni ?? "",
    qyteti: v?.qyteti ?? p.qyteti ?? "",
    grupi: v ? v.grupi : p.grupi,
    gjinia: v?.gjinia ?? p.gjinia ?? "",
    dhurimi_fundit: v?.dhurimi_fundit ?? p.dhurimi_fundit ?? "",
    njoftimet: v ? v.njoftimet === "on" : p.njoftimet,
  };
  const sot = new Date().toISOString().slice(0, 10);

  return (
    <form action={veprimi} className="card stack" noValidate>
      <h2>Të dhënat e dhuruesit</h2>
      <div className="field">
        <label htmlFor="emri">Emri dhe mbiemri</label>
        <input id="emri" name="emri" defaultValue={d.emri} autoComplete="name" required maxLength={80} aria-invalid={!!g.emri} />
        <Gabim teksti={g.emri} />
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="telefoni">Telefoni</label>
          <input id="telefoni" name="telefoni" type="tel" inputMode="tel" defaultValue={d.telefoni} autoComplete="tel" placeholder="044 123 456" required aria-invalid={!!g.telefoni} />
          <p className="hint">🔒 Shfaqet vetëm te kërkuesi, pasi ti të pranosh kërkesën.</p>
          <Gabim teksti={g.telefoni} />
        </div>
        <div className="field">
          <label htmlFor="qyteti">Qyteti</label>
          <select id="qyteti" name="qyteti" defaultValue={d.qyteti} required aria-invalid={!!g.qyteti}>
            <option value="" disabled>Zgjidh qytetin</option>
            {QYTETET.map((q) => <option key={q}>{q}</option>)}
          </select>
          <Gabim teksti={g.qyteti} />
        </div>
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, marginBottom: 6 }}>Grupi i gjakut</legend>
        <div className="group-picker">
          {GRUPET.map((gr) => (
            <label key={gr}>
              <input type="radio" name="grupi" value={gr} defaultChecked={d.grupi === gr} />
              <span>{gr}</span>
            </label>
          ))}
        </div>
        <p className="hint">🔒 E dhënë shëndetësore — nuk shfaqet publikisht.</p>
        <Gabim teksti={g.grupi} />
      </fieldset>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="gjinia">Gjinia</label>
          <select id="gjinia" name="gjinia" defaultValue={d.gjinia} required aria-invalid={!!g.gjinia}>
            <option value="" disabled>Zgjidh</option>
            <option value="M">Mashkull (pritje 3 muaj)</option>
            <option value="F">Femër (pritje 4 muaj)</option>
          </select>
          <Gabim teksti={g.gjinia} />
        </div>
        <div className="field">
          <label htmlFor="dhurimi_fundit">Data e dhurimit të fundit</label>
          <input id="dhurimi_fundit" name="dhurimi_fundit" type="date" max={sot} defaultValue={d.dhurimi_fundit} aria-invalid={!!g.dhurimi_fundit} />
          <p className="hint">Lëre bosh nëse nuk ke dhuruar kurrë.</p>
          <Gabim teksti={g.dhurimi_fundit} />
        </div>
      </div>
      <label className="checkbox">
        <input type="checkbox" name="njoftimet" defaultChecked={d.njoftimet} />
        Më njofto kur dikush afër meje ka nevojë për grupin tim
      </label>
      {gjendja.mesazh && (
        <p className={`alert ${gjendja.ok ? "alert-ok" : "alert-error"}`} role={gjendja.ok ? "status" : "alert"}>{gjendja.mesazh}</p>
      )}
      <button className="btn btn-block" type="submit" disabled={nePritje}>{nePritje ? "Po ruhet…" : "Ruaj profilin"}</button>
    </form>
  );
}
