import "server-only";
import { getSql } from "./db";
import { dergoPush } from "./push";
import { grupetDhuruese, qytetetAfer, DITET_PRITJES, type GrupGjaku } from "./gjaku";
import { dozat, formatoAfatin } from "./format";

export type Lloji =
  | "kerkese_e_re" | "dhurues_vjen" | "dhuruesi_anuloi" | "dhurim_konfirmuar" | "kerkesa_perfundoi" | "kujtues"
  | "verifikim_i_ri" | "kerkesa_u_verifikua" | "kerkesa_u_refuzua" | "kerkesa_u_raportua";

export type Njoftim = {
  id: string;
  kerkesa_id: string | null;
  lloji: Lloji;
  teksti: string;
  lexuar: boolean;
  krijuar_ne: string;
};

/** Lidhja e njoftimit: gjithmonë te kërkesa e saktë (ose te profili për kujtuesin). */
export function lidhjaENjoftimit(n: Pick<Njoftim, "kerkesa_id" | "lloji">): string {
  return n.kerkesa_id ? `/kerkesa/${n.kerkesa_id}` : "/profili";
}

/**
 * Hapi 2–3 i idesë: gjej dhuruesit që
 *  - kanë grup të përputhshëm,
 *  - janë në të njëjtin qytet ose afër,
 *  - lejohen të dhurojnë (90 ditë M / 120 ditë F),
 *  - kanë njoftimet aktive,
 * dhe njoftoji (në aplikacion + push opsional). Kthen numrin e dhuruesve të njoftuar.
 */
export async function njoftoDhuruesitEPerputhshem(k: {
  id: string; grupi: GrupGjaku; qyteti: string; spitali: string; dozat: number; afati: string; urgjente: boolean; krijuar_nga: string;
}): Promise<number> {
  const sql = getSql();
  const teksti = `${k.urgjente ? "URGJENTE: " : ""}nevojitet gjak ${k.grupi} në ${k.spitali}, ${dozat(k.dozat)}, ${formatoAfatin(k.afati)}.`;
  const rows = await sql`
    INSERT INTO njoftimet (perdoruesi_id, kerkesa_id, lloji, teksti)
    SELECT u.id, ${k.id}, 'kerkese_e_re', ${teksti}
    FROM perdoruesit u
    WHERE u.njoftimet
      AND u.id <> ${k.krijuar_nga}
      AND u.telefoni IS NOT NULL AND u.gjinia IS NOT NULL
      AND u.grupi = ANY(${[...grupetDhuruese(k.grupi)]})
      AND u.qyteti = ANY(${qytetetAfer(k.qyteti)})
      AND (u.dhurimi_fundit IS NULL OR u.dhurimi_fundit
           + (CASE WHEN u.gjinia = 'F' THEN ${DITET_PRITJES.F} ELSE ${DITET_PRITJES.M} END)::int <= CURRENT_DATE)
    ON CONFLICT DO NOTHING
    RETURNING perdoruesi_id`;
  const ids = rows.map((r) => String(r.perdoruesi_id));
  await dergoPush(ids, { title: `🩸 Nevojitet gjak ${k.grupi}`, body: teksti, url: `/kerkesa/${k.id}`, tag: `kerkesa-${k.id}` });
  return ids.length;
}

/** Njoftim për një përdorues të vetëm (pronari ose dhuruesi). */
export async function njofto(perdoruesId: string, kerkesaId: string | null, lloji: Lloji, teksti: string, titulli = "DhuroGjak") {
  const sql = getSql();
  await sql`INSERT INTO njoftimet (perdoruesi_id, kerkesa_id, lloji, teksti) VALUES (${perdoruesId}, ${kerkesaId}, ${lloji}, ${teksti})
            ON CONFLICT DO NOTHING`;
  await dergoPush([perdoruesId], { title: titulli, body: teksti, url: kerkesaId ? `/kerkesa/${kerkesaId}` : "/profili", tag: kerkesaId ? `kerkesa-${kerkesaId}` : lloji });
}

/** Njofton stafin e një spitali (dhe adminët, që asnjë kërkesë të mos mbetet pa u parë). */
export async function njoftoStafin(spitaliId: string | null, kerkesaId: string, lloji: Lloji, teksti: string, titulli = "DhuroGjak · Spitali") {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO njoftimet (perdoruesi_id, kerkesa_id, lloji, teksti)
    SELECT id, ${kerkesaId}, ${lloji}, ${teksti} FROM perdoruesit
    WHERE (roli = 'spital' AND spitali_id = ${spitaliId}) OR roli = 'admin'
    RETURNING perdoruesi_id`;
  const ids = rows.map((r) => String(r.perdoruesi_id));
  await dergoPush(ids, { title: titulli, body: teksti, url: `/kerkesa/${kerkesaId}`, tag: `verifikim-${kerkesaId}` });
  return ids.length;
}

export async function lexoNjoftimet(perdoruesId: string): Promise<Njoftim[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id::text AS id, kerkesa_id::text AS kerkesa_id, lloji, teksti, lexuar, krijuar_ne
    FROM njoftimet WHERE perdoruesi_id = ${perdoruesId}
    ORDER BY krijuar_ne DESC LIMIT 50`;
  return rows.map((r) => ({ ...(r as Njoftim), krijuar_ne: new Date(r.krijuar_ne as string).toISOString() }));
}

export async function numriPalexuar(perdoruesId: string): Promise<number> {
  const sql = getSql();
  const [r] = await sql`SELECT COUNT(*)::int AS n FROM njoftimet WHERE perdoruesi_id = ${perdoruesId} AND NOT lexuar`;
  return Number(r?.n ?? 0);
}

/** Kur përdoruesi hap kërkesën, njoftimet e saj shënohen si të lexuara. */
export async function shenoTeLexuaraPerKerkesen(perdoruesId: string, kerkesaId: string) {
  const sql = getSql();
  await sql`UPDATE njoftimet SET lexuar = TRUE WHERE perdoruesi_id = ${perdoruesId} AND kerkesa_id = ${kerkesaId} AND NOT lexuar`;
}

export async function shenoTeGjithaTeLexuara(perdoruesId: string) {
  const sql = getSql();
  await sql`UPDATE njoftimet SET lexuar = TRUE WHERE perdoruesi_id = ${perdoruesId} AND NOT lexuar`;
}

/**
 * Kujtuesi ditor: “Tani mund të dhuroni përsëri!” për dhuruesit që lejohen SOT.
 * Thirret nga Vercel Cron (/api/cron/kujtuesit).
 */
export async function dergoKujtuesit(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO njoftimet (perdoruesi_id, lloji, teksti)
    SELECT u.id, 'kujtues', '📅 Tani mund të dhuroni përsëri! Faleminderit që shpëton jetë.'
    FROM perdoruesit u
    WHERE u.njoftimet AND u.dhurimi_fundit IS NOT NULL AND u.gjinia IS NOT NULL
      AND u.dhurimi_fundit + (CASE WHEN u.gjinia = 'F' THEN ${DITET_PRITJES.F} ELSE ${DITET_PRITJES.M} END)::int = CURRENT_DATE
    ON CONFLICT DO NOTHING
    RETURNING perdoruesi_id`;
  const ids = rows.map((r) => String(r.perdoruesi_id));
  await dergoPush(ids, { title: "📅 Tani mund të dhuroni përsëri!", body: "Periudha e pushimit mbaroi. Do të njoftohesh kur dikush afër ka nevojë.", url: "/profili", tag: "kujtues" });
  return ids.length;
}
