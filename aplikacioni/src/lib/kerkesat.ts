import "server-only";
import { getSql } from "./db";
import type { GrupGjaku } from "./gjaku";

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
};

// Java 4: të dhënat vijnë nga Neon. `pranuar` do të llogaritet nga pergjigjet në Java 7.
export async function lexoKerkesat(): Promise<Kerkese[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id::text AS id, grupi, spitali, qyteti, dozat, afati, pershkrimi, urgjente, statusi, 0 AS pranuar
    FROM kerkesat
    WHERE statusi = 'aktive' AND afati > NOW()
    ORDER BY urgjente DESC, afati ASC
  `;
  return rows.map(normalizo);
}

export async function gjejKerkesen(id: string): Promise<Kerkese | undefined> {
  if (!/^\d{1,12}$/.test(id)) return undefined;
  const sql = getSql();
  const rows = await sql`
    SELECT id::text AS id, grupi, spitali, qyteti, dozat, afati, pershkrimi, urgjente, statusi, 0 AS pranuar
    FROM kerkesat WHERE id = ${id}
  `;
  return rows[0] ? normalizo(rows[0]) : undefined;
}

function normalizo(r: Record<string, unknown>): Kerkese {
  return {
    ...(r as Kerkese),
    afati: new Date(r.afati as string).toISOString(),
    pranuar: Number(r.pranuar ?? 0),
  };
}
