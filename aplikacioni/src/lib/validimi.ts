// Validimi në server (pa varësi nga Next/DB, që të testohet me `npm test`).
import { eshteGrup, eshteQytet, type GrupGjaku, type Gjinia } from "./gjaku.ts";
import { gjejSpitalin } from "./spitalet.ts";

export type Rezultat<T> = { ok: true; vlera: T } | { ok: false; gabimet: Record<string, string> };

type Burim = { get(emri: string): unknown };

const tekst = (b: Burim, k: string) => pastro(String(b.get(k) ?? "")).trim();

export function normalizoTelefonin(v: string): string {
  let t = v.replace(/[\s\-().]/g, "");
  if (t.startsWith("00")) t = "+" + t.slice(2);
  return t;
}

export function telefonValid(v: string): boolean {
  return /^\+?[0-9]{8,15}$/.test(v);
}

/** Java 12: gjaku nuk shitet (OBSH). Refuzo tekstet që ofrojnë/kërkojnë para. */
export function kaOferteParash(t: string): boolean {
  // `\b` nuk i njeh shkronjat shqipe (ë, ç), prandaj kufijtë e fjalës janë me \p{L} (Unicode).
  return /(€|\$|(?<![\p{L}\d])\d+\s*(euro|eur|lek[eë]?|den[aá]r)(?!\p{L})|(?<!\p{L})(pages[eë]|paguaj\p{L}*|paguhet|shp[eë]rblim\p{L}*|honorar\p{L}*|[cç]mim\p{L}*|shes|blej)(?!\p{L}))/iu.test(t);
}

export function kaLidhje(t: string): boolean {
  return /(https?:\/\/|www\.)/i.test(t);
}

/** Heq karakteret e kontrollit (p.sh. \u0000) që mund të prishin shfaqjen ose log-et. */
function pastro(t: string): string {
  return t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export type ProfiliInput = {
  emri: string;
  telefoni: string;
  qyteti: string;
  gjinia: Gjinia;
  grupi: GrupGjaku;
  dhurimi_fundit: string | null;
  njoftimet: boolean;
};

export function validoProfilin(b: Burim, sot: Date = new Date()): Rezultat<ProfiliInput> {
  const gabimet: Record<string, string> = {};
  const emri = tekst(b, "emri");
  const telefoni = normalizoTelefonin(tekst(b, "telefoni"));
  const qyteti = tekst(b, "qyteti");
  const gjinia = tekst(b, "gjinia");
  const grupi = tekst(b, "grupi");
  const data = tekst(b, "dhurimi_fundit");

  if (emri.length < 2 || emri.length > 80) gabimet.emri = "Shkruaj emrin (2–80 shkronja).";
  if (!telefonValid(telefoni)) gabimet.telefoni = "Shkruaj një numër telefoni të vlefshëm, p.sh. 044 123 456.";
  if (!eshteQytet(qyteti)) gabimet.qyteti = "Zgjidh qytetin nga lista.";
  if (gjinia !== "M" && gjinia !== "F") gabimet.gjinia = "Zgjidh gjininë (përdoret për kohën e pritjes 3 ose 4 muaj).";
  if (!eshteGrup(grupi)) gabimet.grupi = "Zgjidh grupin e gjakut.";
  if (data) {
    const d = new Date(data + "T00:00:00Z");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(d.getTime())) gabimet.dhurimi_fundit = "Data nuk është e vlefshme.";
    else if (d.getTime() > sot.getTime()) gabimet.dhurimi_fundit = "Data e dhurimit nuk mund të jetë në të ardhmen.";
    else if (d.getUTCFullYear() < 1950) gabimet.dhurimi_fundit = "Data duket shumë e vjetër.";
  }

  if (Object.keys(gabimet).length) return { ok: false, gabimet };
  return {
    ok: true,
    vlera: {
      emri, telefoni, qyteti,
      gjinia: gjinia as Gjinia,
      grupi: grupi as GrupGjaku,
      dhurimi_fundit: data || null,
      njoftimet: b.get("njoftimet") === "on",
    },
  };
}

export type KerkesaInput = {
  grupi: GrupGjaku;
  spitali_id: string;
  spitali: string;
  qyteti: string;
  dozat: number;
  afati: string; // ISO
  pershkrimi: string;
  urgjente: boolean;
  telefoni_kontaktit: string;
};

/** `afati` vjen si ISO; shfletuesi e konverton orën lokale (datetime-local) para dërgimit. */
export function validoKerkesen(b: Burim, tani: Date = new Date()): Rezultat<KerkesaInput> {
  const gabimet: Record<string, string> = {};
  const grupi = tekst(b, "grupi");
  const spitaliObj = gjejSpitalin(tekst(b, "spitali_id"));
  const dozat = Number(tekst(b, "dozat"));
  const afatiRaw = tekst(b, "afati");
  const pershkrimi = tekst(b, "pershkrimi");
  const telefoni = normalizoTelefonin(tekst(b, "telefoni_kontaktit"));

  if (!eshteGrup(grupi)) gabimet.grupi = "Zgjidh grupin e gjakut që nevojitet.";
  if (!spitaliObj) gabimet.spitali_id = "Zgjidh spitalin nga lista.";
  if (!Number.isInteger(dozat) || dozat < 1 || dozat > 10) gabimet.dozat = "Dozat duhet të jenë nga 1 deri në 10.";
  if (pershkrimi.length > 500) gabimet.pershkrimi = "Përshkrimi mund të ketë deri në 500 shkronja.";
  else if (kaOferteParash(pershkrimi)) gabimet.pershkrimi = "Dhurimi i gjakut është falas. Kërkesat me pagesë ose shpërblim në para nuk lejohen.";
  else if (kaLidhje(pershkrimi)) gabimet.pershkrimi = "Lidhjet (URL) nuk lejohen në përshkrim.";
  if (!telefonValid(telefoni)) gabimet.telefoni_kontaktit = "Shkruaj telefonin e kontaktit (shfaqet vetëm te dhuruesit që pranojnë).";

  const afati = new Date(afatiRaw);
  if (!afatiRaw || Number.isNaN(afati.getTime())) gabimet.afati = "Zgjidh afatin (data dhe ora).";
  else if (afati.getTime() <= tani.getTime() + 30 * 60 * 1000) gabimet.afati = "Afati duhet të jetë të paktën 30 minuta nga tani.";
  else if (afati.getTime() > tani.getTime() + 14 * 24 * 60 * 60 * 1000) gabimet.afati = "Afati mund të jetë deri në 14 ditë.";

  if (Object.keys(gabimet).length) return { ok: false, gabimet };
  return {
    ok: true,
    vlera: {
      grupi: grupi as GrupGjaku,
      spitali_id: spitaliObj!.id, spitali: spitaliObj!.emri, qyteti: spitaliObj!.qyteti, dozat,
      afati: afati.toISOString(), pershkrimi,
      urgjente: b.get("urgjente") === "on",
      telefoni_kontaktit: telefoni,
    },
  };
}
