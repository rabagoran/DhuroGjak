import "server-only";
import { getSql } from "./db";
import type { GrupGjaku } from "./gjaku";
import type { KerkesaInput } from "./validimi";
import type { Perdorues } from "./lejet";

export type Statusi = "ne_verifikim" | "aktive" | "perfunduar" | "anuluar" | "refuzuar";

export type Kerkese = {
  id: string;
  grupi: GrupGjaku;
  spitali: string;
  spitali_id: string | null;
  qyteti: string;
  dozat: number;
  afati: string;
  pershkrimi: string;
  urgjente: boolean;
  statusi: Statusi;
  pranuar: number;
  krijuar_nga: string | null;
  verifikuar: boolean;
  pezulluar: boolean;
  arsyeja_refuzimit: string | null;
};

// `pranuar` = dhurues që kanë shtypur “Do të shkoj” ose kanë dhuruar.
const KOLONAT = `id::text AS id, grupi, spitali, spitali_id, qyteti, dozat, afati, pershkrimi, urgjente, statusi, krijuar_nga,
  (verifikuar_ne IS NOT NULL) AS verifikuar, pezulluar, arsyeja_refuzimit,
  (SELECT COUNT(*) FROM pergjigjet p WHERE p.kerkesa_id = kerkesat.id AND p.statusi IN ('do_shkoj', 'dhuroi'))::int AS pranuar`;

/** Spitali i stafit (null për përdorues të zakonshëm) — përdoret në WHERE për lejet. */
export function spitaliIStafit(p: Perdorues): string | null {
  return p.roli === "spital" ? p.spitali_id : null;
}

/** Lista publike: vetëm kërkesat e verifikuara nga spitali, aktive dhe jo të pezulluara. */
export async function lexoKerkesat(): Promise<Kerkese[]> {
  const sql = getSql();
  const rows = await sql.query(
    `SELECT ${KOLONAT} FROM kerkesat
     WHERE statusi = 'aktive' AND verifikuar_ne IS NOT NULL AND NOT pezulluar AND afati > NOW()
     ORDER BY urgjente DESC, afati ASC`,
  );
  return rows.map(normalizo);
}

export async function gjejKerkesen(id: string): Promise<Kerkese | undefined> {
  if (!/^\d{1,12}$/.test(id)) return undefined;
  const sql = getSql();
  const rows = await sql.query(`SELECT ${KOLONAT} FROM kerkesat WHERE id = $1`, [id]);
  return rows[0] ? normalizo(rows[0]) : undefined;
}

export async function kerkesatEMia(perdoruesId: string): Promise<Kerkese[]> {
  const sql = getSql();
  const rows = await sql.query(
    `SELECT ${KOLONAT} FROM kerkesat WHERE krijuar_nga = $1 ORDER BY krijuar_ne DESC LIMIT 20`,
    [perdoruesId],
  );
  return rows.map(normalizo);
}

/** Kufizimi kundër spam-it: maks. 3 kërkesa të hapura dhe 5 në 24 orë për përdorues. */
export const KUFIRI_AKTIVE = 3;
export const KUFIRI_DITOR = 5;

export async function arsyejaEKufizimit(perdoruesId: string): Promise<string | null> {
  const sql = getSql();
  const [r] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE statusi IN ('aktive', 'ne_verifikim') AND afati > NOW())::int AS aktive,
      COUNT(*) FILTER (WHERE krijuar_ne > NOW() - INTERVAL '24 hours')::int AS ditore
    FROM kerkesat WHERE krijuar_nga = ${perdoruesId}`;
  if (Number(r.aktive) >= KUFIRI_AKTIVE) return `Ke ${KUFIRI_AKTIVE} kërkesa të hapura. Mbyll njërën para se të postosh tjetër.`;
  if (Number(r.ditore) >= KUFIRI_DITOR) return `Ke arritur kufirin prej ${KUFIRI_DITOR} kërkesash në 24 orë. Provo më vonë.`;
  return null;
}

/**
 * Krijon kërkesën. Kur `statusi` është "aktive" (stafi i po atij spitali), shënohet edhe verifikimi.
 * Databaza e garanton: asnjë kërkesë "aktive" pa `verifikuar_ne` (kerkesat_verifikuar_check).
 */
export async function krijoKerkesen(p: Perdorues, k: KerkesaInput, statusi: "aktive" | "ne_verifikim"): Promise<string> {
  const sql = getSql();
  const verifikuar = statusi === "aktive";
  const rows = await sql`
    INSERT INTO kerkesat (grupi, spitali, spitali_id, qyteti, dozat, afati, pershkrimi, urgjente, krijuar_nga, telefoni_kontaktit,
                          statusi, verifikuar_nga, verifikuar_ne)
    VALUES (${k.grupi}, ${k.spitali}, ${k.spitali_id}, ${k.qyteti}, ${k.dozat}, ${k.afati}, ${k.pershkrimi}, ${k.urgjente}, ${p.id},
            ${k.telefoni_kontaktit}, ${statusi}, ${verifikuar ? p.id : null}, ${verifikuar ? new Date().toISOString() : null})
    RETURNING id::text AS id`;
  return String(rows[0].id);
}

/**
 * Mbyllja/anulimi: pronari, stafi i spitalit të kërkesës ose admini.
 * Kërkesa në pritje mund vetëm të anulohet. Kontrolli bëhet në WHERE, jo vetëm në UI.
 */
export async function ndryshoStatusin(p: Perdorues, id: string, statusi: "perfunduar" | "anuluar") {
  if (!/^\d{1,12}$/.test(id)) return "fushe" as const;
  const sql = getSql();
  const rows = await sql`
    UPDATE kerkesat SET statusi = ${statusi}
    WHERE id = ${id}
      AND (statusi = 'aktive' OR (statusi = 'ne_verifikim' AND ${statusi} = 'anuluar'))
      AND (krijuar_nga = ${p.id} OR ${p.roli === "admin"} OR spitali_id = ${spitaliIStafit(p)})
    RETURNING id`;
  return rows.length === 1 ? ("ruajtur" as const) : ("ndaluar" as const);
}

function normalizo(r: Record<string, unknown>): Kerkese {
  return {
    ...(r as Kerkese),
    afati: new Date(r.afati as string).toISOString(),
    pranuar: Number(r.pranuar ?? 0),
    verifikuar: Boolean(r.verifikuar),
    pezulluar: Boolean(r.pezulluar),
  };
}
