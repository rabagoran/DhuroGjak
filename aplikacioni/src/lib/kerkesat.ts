import "server-only";
import { getSql } from "./db";
import type { GrupGjaku } from "./gjaku";
import type { KerkesaInput } from "./validimi";
import type { Perdorues } from "./lejet";

export type Statusi = "aktive" | "perfunduar" | "anuluar";

export type Kerkese = {
  id: string;
  grupi: GrupGjaku;
  spitali: string;
  qyteti: string;
  dozat: number;
  afati: string;
  pershkrimi: string;
  urgjente: boolean;
  statusi: Statusi;
  pranuar: number;
  krijuar_nga: string | null;
};

const KOLONAT = `id::text AS id, grupi, spitali, qyteti, dozat, afati, pershkrimi, urgjente, statusi, krijuar_nga, 0 AS pranuar`;

export async function lexoKerkesat(): Promise<Kerkese[]> {
  const sql = getSql();
  const rows = await sql.query(
    `SELECT ${KOLONAT} FROM kerkesat WHERE statusi = 'aktive' AND afati > NOW() ORDER BY urgjente DESC, afati ASC`,
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

export async function krijoKerkesen(p: Perdorues, k: KerkesaInput): Promise<string> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO kerkesat (grupi, spitali, qyteti, dozat, afati, pershkrimi, urgjente, krijuar_nga, telefoni_kontaktit)
    VALUES (${k.grupi}, ${k.spitali}, ${k.qyteti}, ${k.dozat}, ${k.afati}, ${k.pershkrimi}, ${k.urgjente}, ${p.id}, ${k.telefoni_kontaktit})
    RETURNING id::text AS id`;
  return String(rows[0].id);
}

/**
 * Vetëm pronari (ose admini) mund ta mbyllë/anulojë kërkesën.
 * Kontrolli bëhet në WHERE, jo vetëm në UI: ID e ndryshuar në formular refuzohet.
 */
export async function ndryshoStatusin(p: Perdorues, id: string, statusi: "perfunduar" | "anuluar") {
  if (!/^\d{1,12}$/.test(id)) return "fushe" as const;
  const sql = getSql();
  const rows = await sql`
    UPDATE kerkesat SET statusi = ${statusi}
    WHERE id = ${id} AND statusi = 'aktive'
      AND (krijuar_nga = ${p.id} OR ${p.roli === "admin"})
    RETURNING id`;
  return rows.length === 1 ? ("ruajtur" as const) : ("ndaluar" as const);
}

function normalizo(r: Record<string, unknown>): Kerkese {
  return {
    ...(r as Kerkese),
    afati: new Date(r.afati as string).toISOString(),
    pranuar: Number(r.pranuar ?? 0),
  };
}
