import "server-only";
import { getSql } from "./db";
import type { Perdorues } from "./lejet";
import { spitaliIStafit } from "./kerkesat";
import { njofto, njoftoDhuruesitEPerputhshem, njoftoStafin } from "./njoftimet";
import { ARSYET_E_RAPORTIMIT, ARSYET_E_REFUZIMIT, KUFIRI_RAPORTIMEVE, type ArsyeRaportimi, type ArsyeRefuzimi, type Roli } from "./verifikimi";
import { dozat, formatoAfatin } from "./format";
import type { GrupGjaku } from "./gjaku";

const ID = /^\d{1,12}$/;

export type KerkesePerStafin = {
  id: string;
  grupi: GrupGjaku;
  spitali: string;
  qyteti: string;
  dozat: number;
  afati: string;
  pershkrimi: string;
  urgjente: boolean;
  statusi: string;
  pezulluar: boolean;
  kerkuesi: string;
  telefoni: string | null;
  raportime: number;
  krijuar_ne: string;
};

/**
 * Paneli i spitalit: kërkesat në pritje, të raportuarat dhe aktivet e spitalit.
 * Stafi sheh vetëm spitalin e vet; admini sheh të gjitha. Filtri është në SQL.
 */
export async function kerkesatPerStafin(p: Perdorues) {
  if (p.roli !== "spital" && p.roli !== "admin") return { nePritje: [], teRaportuara: [], aktive: [] };
  const sql = getSql();
  const rows = await sql`
    SELECT k.id::text AS id, k.grupi, k.spitali, k.qyteti, k.dozat, k.afati, k.pershkrimi, k.urgjente, k.statusi, k.pezulluar,
           u.emri AS kerkuesi, k.telefoni_kontaktit AS telefoni, k.krijuar_ne,
           (SELECT COUNT(*) FROM raportimet r WHERE r.kerkesa_id = k.id AND NOT r.shqyrtuar)::int AS raportime
    FROM kerkesat k LEFT JOIN perdoruesit u ON u.id = k.krijuar_nga
    WHERE (${p.roli === "admin"} OR k.spitali_id = ${spitaliIStafit(p)})
      AND k.afati > NOW() AND k.statusi IN ('ne_verifikim', 'aktive')
    ORDER BY k.urgjente DESC, k.afati ASC
    LIMIT 100`;
  const lista = rows.map((r) => ({
    ...(r as KerkesePerStafin),
    afati: new Date(r.afati as string).toISOString(),
    krijuar_ne: new Date(r.krijuar_ne as string).toISOString(),
    raportime: Number(r.raportime ?? 0),
  }));
  return {
    nePritje: lista.filter((k) => k.statusi === "ne_verifikim"),
    teRaportuara: lista.filter((k) => k.statusi === "aktive" && (k.pezulluar || k.raportime > 0)),
    aktive: lista.filter((k) => k.statusi === "aktive" && !k.pezulluar && k.raportime === 0),
  };
}

/** Numri i kërkesave që presin stafin (për shenjën në profil). */
export async function numriNePritje(p: Perdorues): Promise<number> {
  if (p.roli !== "spital" && p.roli !== "admin") return 0;
  const sql = getSql();
  const [r] = await sql`
    SELECT COUNT(*)::int AS n FROM kerkesat k
    WHERE (${p.roli === "admin"} OR k.spitali_id = ${spitaliIStafit(p)}) AND k.afati > NOW()
      AND (k.statusi = 'ne_verifikim' OR (k.statusi = 'aktive' AND k.pezulluar))`;
  return Number(r?.n ?? 0);
}

/**
 * Stafi konfirmon kërkesën → bëhet publike dhe VETËM atëherë njoftohen dhuruesit.
 * Kthen numrin e dhuruesve të njoftuar, ose null kur nuk ka leje / kërkesa s'është më në pritje.
 */
export async function verifikoKerkesen(p: Perdorues, id: string): Promise<number | null> {
  if (!ID.test(id)) return null;
  const sql = getSql();
  const rows = await sql`
    UPDATE kerkesat SET statusi = 'aktive', verifikuar_nga = ${p.id}, verifikuar_ne = NOW()
    WHERE id = ${id} AND statusi = 'ne_verifikim' AND afati > NOW()
      AND (${p.roli === "admin"} OR spitali_id = ${spitaliIStafit(p)})
    RETURNING id::text AS id, grupi, qyteti, spitali, dozat, afati, urgjente, krijuar_nga`;
  const k = rows[0];
  if (!k) return null;
  const afati = new Date(k.afati as string).toISOString();
  if (k.krijuar_nga) {
    await njofto(String(k.krijuar_nga), id, "kerkesa_u_verifikua",
      `${k.spitali} e konfirmoi kërkesën tënde për ${k.grupi}. Dhuruesit e përputhshëm po njoftohen.`,
      "✅ Kërkesa u verifikua").catch(() => {});
  }
  try {
    return await njoftoDhuruesitEPerputhshem({
      id, grupi: k.grupi as GrupGjaku, qyteti: String(k.qyteti), spitali: String(k.spitali), dozat: Number(k.dozat),
      afati, urgjente: Boolean(k.urgjente), krijuar_nga: String(k.krijuar_nga ?? ""),
    });
  } catch {
    return -1;
  }
}

export async function refuzoKerkesen(p: Perdorues, id: string, arsyeja: ArsyeRefuzimi): Promise<boolean> {
  if (!ID.test(id)) return false;
  const sql = getSql();
  const teksti = ARSYET_E_REFUZIMIT[arsyeja];
  const rows = await sql`
    UPDATE kerkesat SET statusi = 'refuzuar', arsyeja_refuzimit = ${teksti}
    WHERE id = ${id} AND statusi = 'ne_verifikim'
      AND (${p.roli === "admin"} OR spitali_id = ${spitaliIStafit(p)})
    RETURNING krijuar_nga, spitali, grupi`;
  if (rows.length !== 1) return false;
  if (rows[0].krijuar_nga) {
    await njofto(String(rows[0].krijuar_nga), id, "kerkesa_u_refuzua",
      `${rows[0].spitali} nuk e konfirmoi kërkesën për ${rows[0].grupi}: ${teksti}`, "Kërkesa nuk u verifikua").catch(() => {});
  }
  return true;
}

/**
 * “Raporto kërkesën”. Pas KUFIRI_RAPORTIMEVE raportimesh të pashqyrtuara kërkesa pezullohet
 * (fshihet nga lista publike, “Do të shkoj” bllokohet) derisa stafi ta shqyrtojë.
 */
export async function raportoKerkesen(p: Perdorues, id: string, arsyeja: ArsyeRaportimi): Promise<"ok" | "ekziston" | "ndaluar"> {
  if (!ID.test(id)) return "ndaluar";
  const sql = getSql();
  const rows = await sql`
    INSERT INTO raportimet (kerkesa_id, perdoruesi_id, arsyeja)
    SELECT k.id, ${p.id}, ${arsyeja} FROM kerkesat k
    WHERE k.id = ${id} AND k.statusi = 'aktive' AND NOT k.pezulluar
      AND k.krijuar_nga IS DISTINCT FROM ${p.id}
    ON CONFLICT (kerkesa_id, perdoruesi_id) DO NOTHING
    RETURNING id`;
  if (rows.length !== 1) {
    const [ekziston] = await sql`SELECT 1 FROM raportimet WHERE kerkesa_id = ${id} AND perdoruesi_id = ${p.id}`;
    return ekziston ? "ekziston" : "ndaluar";
  }
  const pezulluar = await sql`
    UPDATE kerkesat SET pezulluar = TRUE
    WHERE id = ${id} AND NOT pezulluar
      AND (SELECT COUNT(*) FROM raportimet WHERE kerkesa_id = ${id} AND NOT shqyrtuar) >= ${KUFIRI_RAPORTIMEVE}
    RETURNING spitali_id, spitali, grupi`;
  const [k] = pezulluar.length ? pezulluar : await sql`SELECT spitali_id, spitali, grupi FROM kerkesat WHERE id = ${id}`;
  if (k) {
    await njoftoStafin(k.spitali_id ? String(k.spitali_id) : null, id, "kerkesa_u_raportua",
      pezulluar.length
        ? `Kërkesa për ${k.grupi} në ${k.spitali} u pezullua pas ${KUFIRI_RAPORTIMEVE} raportimeve. Shqyrtoje.`
        : `Kërkesa për ${k.grupi} në ${k.spitali} u raportua: ${ARSYET_E_RAPORTIMIT[arsyeja]}.`,
      "⚠️ Kërkesë e raportuar").catch(() => {});
  }
  return "ok";
}

/** Stafi shqyrton raportimet: e rikthen kërkesën (raportimet s'qëndrojnë) ose e anulon. */
export async function shqyrtoRaportimet(p: Perdorues, id: string, vendimi: "rikthe" | "anulo"): Promise<boolean> {
  if (!ID.test(id)) return false;
  const sql = getSql();
  const [, , rows] = await sql.transaction([
    sql`UPDATE raportimet r SET shqyrtuar = TRUE FROM kerkesat k
        WHERE r.kerkesa_id = k.id AND k.id = ${id} AND (${p.roli === "admin"} OR k.spitali_id = ${spitaliIStafit(p)})`,
    sql`UPDATE kerkesat SET pezulluar = FALSE, statusi = CASE WHEN ${vendimi} = 'anulo' THEN 'anuluar' ELSE statusi END
        WHERE id = ${id} AND statusi = 'aktive' AND (${p.roli === "admin"} OR spitali_id = ${spitaliIStafit(p)})`,
    sql`SELECT statusi FROM kerkesat WHERE id = ${id} AND (${p.roli === "admin"} OR spitali_id = ${spitaliIStafit(p)})`,
  ]);
  return rows.length === 1;
}

// ---- Administrimi i roleve (vetëm admini) ----

export type PerdoruesPerAdmin = { id: string; emri: string; qyteti: string | null; roli: Roli; spitali_id: string | null };

export async function listaEPerdoruesve(p: Perdorues, kerko: string): Promise<PerdoruesPerAdmin[]> {
  if (p.roli !== "admin") return [];
  const sql = getSql();
  const q = `%${kerko.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const rows = await sql`
    SELECT id, emri, qyteti, roli, spitali_id FROM perdoruesit
    WHERE emri ILIKE ${q} OR id ILIKE ${q}
    ORDER BY (roli <> 'perdorues') DESC, krijuar_ne DESC LIMIT 50`;
  return rows as PerdoruesPerAdmin[];
}

/** Admini cakton rolin. Nuk mund ta heqë rolin e vet (që të mos mbetet aplikacioni pa admin). */
export async function caktoRolin(p: Perdorues, id: string, roli: Roli, spitaliId: string | null): Promise<boolean> {
  if (p.roli !== "admin" || id === p.id) return false;
  const sql = getSql();
  const rows = await sql`
    UPDATE perdoruesit SET roli = ${roli}, spitali_id = ${roli === "spital" ? spitaliId : null}
    WHERE id = ${id} RETURNING id`;
  return rows.length === 1;
}

/** Teksti i shkurtër i kërkesës për panelin. */
export function permbledhja(k: Pick<KerkesePerStafin, "grupi" | "dozat" | "afati">) {
  return `${k.grupi} · ${dozat(k.dozat)} · ${formatoAfatin(k.afati)}`;
}
