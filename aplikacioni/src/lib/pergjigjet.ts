import "server-only";
import { getSql } from "./db";
import type { Perdorues } from "./lejet";
import { gjejKerkesen } from "./kerkesat";
import { vendosPergjigjen, type VendimPergjigjeje } from "./rregullat";

export type StatusiPergjigjes = "do_shkoj" | "dhuroi" | "anuluar";

export type PergjigjePerPronar = {
  id: string;
  emri: string;
  telefoni: string | null;
  grupi: string | null;
  statusi: StatusiPergjigjes;
  krijuar_ne: string;
};

export async function pergjigjaIme(kerkesaId: string, perdoruesId: string): Promise<StatusiPergjigjes | null> {
  const sql = getSql();
  const rows = await sql`SELECT statusi FROM pergjigjet WHERE kerkesa_id = ${kerkesaId} AND dhuruesi_id = ${perdoruesId}`;
  return (rows[0]?.statusi as StatusiPergjigjes | undefined) ?? null;
}

/**
 * “Do të shkoj”. Rregullat kontrollohen dy herë:
 * 1) në TypeScript (mesazh i qartë për përdoruesin);
 * 2) në SQL, që dy klikime ose dy dhurues njëkohësisht të mos kalojnë dozat.
 */
export async function pergjigjuNeKerkese(p: Perdorues, kerkesaId: string): Promise<VendimPergjigjeje> {
  const kerkesa = await gjejKerkesen(kerkesaId);
  if (!kerkesa) return "mbyllur";
  const ime = await pergjigjaIme(kerkesaId, p.id);
  const vendimi = vendosPergjigjen(p, kerkesa, { kaPranuar: ime === "do_shkoj" || ime === "dhuroi" });
  if (vendimi !== "ok") return vendimi;

  const sql = getSql();
  const rows = await sql`
    INSERT INTO pergjigjet (kerkesa_id, dhuruesi_id)
    SELECT k.id, ${p.id} FROM kerkesat k
    WHERE k.id = ${kerkesaId} AND k.statusi = 'aktive' AND k.afati > NOW()
      AND k.krijuar_nga IS DISTINCT FROM ${p.id}
      AND (SELECT COUNT(*) FROM pergjigjet x WHERE x.kerkesa_id = k.id AND x.statusi IN ('do_shkoj','dhuroi')) < k.dozat
    ON CONFLICT (kerkesa_id, dhuruesi_id)
      DO UPDATE SET statusi = 'do_shkoj', perditesuar_ne = NOW() WHERE pergjigjet.statusi = 'anuluar'
    RETURNING id`;
  return rows.length === 1 ? "ok" : "plot";
}

export async function anuloPergjigjen(p: Perdorues, kerkesaId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE pergjigjet SET statusi = 'anuluar', perditesuar_ne = NOW()
    WHERE kerkesa_id = ${kerkesaId} AND dhuruesi_id = ${p.id} AND statusi = 'do_shkoj'
    RETURNING id`;
  return rows.length === 1;
}

/** Dhuruesit e kërkesës — vetëm për pronarin. Telefoni zbulohet sepse dhuruesi ka pranuar. */
export async function pergjigjetPerPronar(p: Perdorues, kerkesaId: string): Promise<PergjigjePerPronar[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT pg.id::text AS id, u.emri, u.telefoni, u.grupi, pg.statusi, pg.krijuar_ne
    FROM pergjigjet pg
    JOIN perdoruesit u ON u.id = pg.dhuruesi_id
    JOIN kerkesat k ON k.id = pg.kerkesa_id
    WHERE pg.kerkesa_id = ${kerkesaId} AND pg.statusi IN ('do_shkoj','dhuroi')
      AND (k.krijuar_nga = ${p.id} OR ${p.roli === "admin"})
    ORDER BY pg.krijuar_ne`;
  return rows as PergjigjePerPronar[];
}

/** Kontakti i kërkuesit — vetëm për dhuruesin që ka pranuar. */
export async function kontaktiPerDhuruesin(p: Perdorues, kerkesaId: string): Promise<{ emri: string; telefoni: string } | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT u.emri, k.telefoni_kontaktit AS telefoni
    FROM kerkesat k
    JOIN perdoruesit u ON u.id = k.krijuar_nga
    JOIN pergjigjet pg ON pg.kerkesa_id = k.id AND pg.dhuruesi_id = ${p.id} AND pg.statusi IN ('do_shkoj','dhuroi')
    WHERE k.id = ${kerkesaId}`;
  return (rows[0] as { emri: string; telefoni: string } | undefined) ?? null;
}

/**
 * Pronari konfirmon që dhuruesi dhuroi. Në një deklaratë të vetme (atomike):
 * - përgjigja → 'dhuroi';
 * - dhuruesi: dhurimi_fundit = sot, dhurime + 1 (bllokohet automatikisht 90/120 ditë);
 * - kur dhurimet mbulojnë dozat, kërkesa → 'perfunduar'.
 */
export async function konfirmoDhurimin(p: Perdorues, kerkesaId: string, pergjigjeId: string) {
  if (!/^\d{1,12}$/.test(kerkesaId) || !/^\d{1,12}$/.test(pergjigjeId)) return { konfirmuar: false, perfunduar: false };
  const sql = getSql();
  const rows = await sql`
    WITH u AS (
      UPDATE pergjigjet pg SET statusi = 'dhuroi', perditesuar_ne = NOW()
      FROM kerkesat k
      WHERE pg.id = ${pergjigjeId} AND pg.kerkesa_id = ${kerkesaId} AND k.id = pg.kerkesa_id
        AND pg.statusi = 'do_shkoj' AND (k.krijuar_nga = ${p.id} OR ${p.roli === "admin"})
      RETURNING pg.dhuruesi_id, k.dozat
    ), d AS (
      UPDATE perdoruesit SET dhurimi_fundit = CURRENT_DATE, dhurime = dhurime + 1
      WHERE id IN (SELECT dhuruesi_id FROM u) RETURNING id
    ), m AS (
      UPDATE kerkesat SET statusi = 'perfunduar'
      WHERE id = ${kerkesaId} AND EXISTS (SELECT 1 FROM u)
        AND (SELECT COUNT(*) FROM pergjigjet WHERE kerkesa_id = ${kerkesaId} AND statusi = 'dhuroi') + 1 >= (SELECT dozat FROM u LIMIT 1)
      RETURNING id
    )
    SELECT (SELECT COUNT(*) FROM d)::int AS konfirmuar, (SELECT COUNT(*) FROM m)::int AS perfunduar`;
  return { konfirmuar: rows[0]?.konfirmuar === 1, perfunduar: rows[0]?.perfunduar === 1 };
}

export type PjesemarrjaIme = { kerkesa_id: string; spitali: string; grupi: string; afati: string; statusi: StatusiPergjigjes };

export async function pjesemarrjetEMia(perdoruesId: string): Promise<PjesemarrjaIme[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT k.id::text AS kerkesa_id, k.spitali, k.grupi, k.afati, pg.statusi
    FROM pergjigjet pg JOIN kerkesat k ON k.id = pg.kerkesa_id
    WHERE pg.dhuruesi_id = ${perdoruesId} AND pg.statusi <> 'anuluar'
    ORDER BY pg.krijuar_ne DESC LIMIT 10`;
  return rows.map((r) => ({ ...(r as PjesemarrjaIme), afati: new Date(r.afati as string).toISOString() }));
}
