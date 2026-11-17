import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getSql } from "./db";
import type { GrupGjaku, Gjinia } from "./gjaku";

export type Perdorues = {
  id: string;
  emri: string;
  telefoni: string | null;
  qyteti: string | null;
  gjinia: Gjinia | null;
  grupi: GrupGjaku | null;
  dhurimi_fundit: string | null;
  njoftimet: boolean;
  dhurime: number;
  roli: "perdorues" | "admin";
};

const ID_VALIDE = /^(github|google):[A-Za-z0-9_-]{1,64}$/;

/** Lexon sesionin dhe siguron që përdoruesi ekziston në Neon. null = nuk ka hyrë. */
export async function perdoruesiIm(): Promise<Perdorues | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id || !ID_VALIDE.test(id)) return null;
  const sql = getSql();
  const emri = (session.user.name ?? "Dhurues").slice(0, 80);
  await sql`INSERT INTO perdoruesit (id, emri) VALUES (${id}, ${emri}) ON CONFLICT (id) DO NOTHING`;
  const rows = await sql`
    SELECT id, emri, telefoni, qyteti, gjinia, grupi, to_char(dhurimi_fundit, 'YYYY-MM-DD') AS dhurimi_fundit,
           njoftimet, dhurime, roli
    FROM perdoruesit WHERE id = ${id}`;
  return (rows[0] as Perdorues | undefined) ?? null;
}

/** Profili i dhuruesit është i plotë kur ka grup, qytet, gjini dhe telefon. */
export function profiliIPlote(p: Perdorues | null): boolean {
  return Boolean(p?.grupi && p.qyteti && p.gjinia && p.telefoni);
}
