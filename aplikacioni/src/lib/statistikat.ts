import "server-only";
import { getSql } from "./db";
import { GRUPET, type GrupGjaku } from "./gjaku";

export type Statistikat = {
  pacienteMuaji: number;
  dhurimeMuaji: number;
  dhuruesAktive: number;
  kerkesaAktive: number;
  dhurimeGjithsej: number;
  sipasGrupit: { grupi: GrupGjaku; numri: number }[];
};

/** Vetëm numra agregatë — asnjë e dhënë personale. */
export async function lexoStatistikat(): Promise<Statistikat> {
  const sql = getSql();
  const [r] = await sql`
    SELECT
      (SELECT COUNT(DISTINCT pg.kerkesa_id) FROM pergjigjet pg
         WHERE pg.statusi = 'dhuroi' AND pg.perditesuar_ne >= date_trunc('month', NOW()))::int AS pacienteMuaji,
      (SELECT COUNT(*) FROM pergjigjet pg
         WHERE pg.statusi = 'dhuroi' AND pg.perditesuar_ne >= date_trunc('month', NOW()))::int AS dhurimeMuaji,
      (SELECT COUNT(*) FROM perdoruesit WHERE grupi IS NOT NULL AND telefoni IS NOT NULL)::int AS dhuruesAktive,
      (SELECT COUNT(*) FROM kerkesat WHERE statusi = 'aktive' AND NOT pezulluar AND afati > NOW())::int AS kerkesaAktive,
      (SELECT COUNT(*) FROM pergjigjet WHERE statusi = 'dhuroi')::int AS dhurimeGjithsej`;
  const grupet = await sql`SELECT grupi, COUNT(*)::int AS numri FROM perdoruesit WHERE grupi IS NOT NULL GROUP BY grupi`;
  const harta = new Map(grupet.map((g) => [g.grupi as string, Number(g.numri)]));
  return {
    pacienteMuaji: Number(r.pacientemuaji ?? 0),
    dhurimeMuaji: Number(r.dhurimemuaji ?? 0),
    dhuruesAktive: Number(r.dhuruesaktive ?? 0),
    kerkesaAktive: Number(r.kerkesaaktive ?? 0),
    dhurimeGjithsej: Number(r.dhurimegjithsej ?? 0),
    sipasGrupit: GRUPET.map((g) => ({ grupi: g, numri: harta.get(g) ?? 0 })),
  };
}
