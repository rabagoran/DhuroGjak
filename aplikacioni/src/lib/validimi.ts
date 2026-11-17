// Validimi në server (pa varësi nga Next/DB, që të testohet me `npm test`).
import { eshteGrup, eshteQytet, type GrupGjaku, type Gjinia } from "./gjaku.ts";

export type Rezultat<T> = { ok: true; vlera: T } | { ok: false; gabimet: Record<string, string> };

type Burim = { get(emri: string): unknown };

const tekst = (b: Burim, k: string) => String(b.get(k) ?? "").trim();

export function normalizoTelefonin(v: string): string {
  let t = v.replace(/[\s\-().]/g, "");
  if (t.startsWith("00")) t = "+" + t.slice(2);
  return t;
}

export function telefonValid(v: string): boolean {
  return /^\+?[0-9]{8,15}$/.test(v);
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
  const spitali = tekst(b, "spitali");
  const qyteti = tekst(b, "qyteti");
  const dozat = Number(tekst(b, "dozat"));
  const afatiRaw = tekst(b, "afati");
  const pershkrimi = tekst(b, "pershkrimi");
  const telefoni = normalizoTelefonin(tekst(b, "telefoni_kontaktit"));

  if (!eshteGrup(grupi)) gabimet.grupi = "Zgjidh grupin e gjakut që nevojitet.";
  if (spitali.length < 3 || spitali.length > 120) gabimet.spitali = "Shkruaj spitalin (3–120 shkronja).";
  if (!eshteQytet(qyteti)) gabimet.qyteti = "Zgjidh qytetin nga lista.";
  if (!Number.isInteger(dozat) || dozat < 1 || dozat > 10) gabimet.dozat = "Dozat duhet të jenë nga 1 deri në 10.";
  if (pershkrimi.length > 500) gabimet.pershkrimi = "Përshkrimi mund të ketë deri në 500 shkronja.";
  if (!telefonValid(telefoni)) gabimet.telefoni_kontaktit = "Shkruaj telefonin e kontaktit (shfaqet vetëm te dhuruesit që pranojnë).";

  const afati = new Date(afatiRaw);
  if (!afatiRaw || Number.isNaN(afati.getTime())) gabimet.afati = "Zgjidh afatin (data dhe ora).";
  else if (afati.getTime() <= tani.getTime() + 30 * 60 * 1000) gabimet.afati = "Afati duhet të jetë të paktën 30 minuta nga tani.";
  else if (afati.getTime() > tani.getTime() + 14 * 24 * 60 * 60 * 1000) gabimet.afati = "Afati mund të jetë deri në 14 ditë.";

  if (Object.keys(gabimet).length) return { ok: false, gabimet };
  return {
    ok: true,
    vlera: {
      grupi: grupi as GrupGjaku, spitali, qyteti, dozat,
      afati: afati.toISOString(), pershkrimi,
      urgjente: b.get("urgjente") === "on",
      telefoni_kontaktit: telefoni,
    },
  };
}
