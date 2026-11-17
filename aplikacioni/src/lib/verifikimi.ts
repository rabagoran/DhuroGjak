// Verifikimi nga spitali — rregulla të pastra (pa databazë), të testuara në tests/verifikimi.test.ts.
// Serveri i zbaton të njëjtat kushte edhe në SQL (WHERE), që ID e ndryshuar në formular të refuzohet.

export type Roli = "perdorues" | "spital" | "admin";

export type Aktor = { id: string; roli: Roli; spitali_id: string | null } | null;

export type KerkesePerVerifikim = {
  statusi: string;
  pezulluar: boolean;
  krijuar_nga: string | null;
  spitali_id: string | null;
};

/** Pas sa raportimeve të pashqyrtuara kërkesa fshihet automatikisht nga lista publike. */
export const KUFIRI_RAPORTIMEVE = 3;

export const ARSYET_E_RAPORTIMIT = {
  e_rreme: "Duket e rreme / s’ka pacient të tillë",
  pagese: "Kërkon ose ofron para",
  e_dyfishte: "Është e dyfishtë",
  tjeter: "Tjetër problem",
} as const;
export type ArsyeRaportimi = keyof typeof ARSYET_E_RAPORTIMIT;

export const ARSYET_E_REFUZIMIT = {
  pa_pacient: "Spitali nuk ka pacient me këtë nevojë.",
  mbuluar: "Nevoja u mbulua nga banka e gjakut.",
  te_pasakta: "Të dhënat e kërkesës janë të pasakta.",
  pa_kontakt: "Kërkuesi nuk u gjet në telefon për verifikim.",
} as const;
export type ArsyeRefuzimi = keyof typeof ARSYET_E_REFUZIMIT;

export function eshteArsyeRaportimi(v: string): v is ArsyeRaportimi {
  return Object.hasOwn(ARSYET_E_RAPORTIMIT, v);
}
export function eshteArsyeRefuzimi(v: string): v is ArsyeRefuzimi {
  return Object.hasOwn(ARSYET_E_REFUZIMIT, v);
}

/** Stafi i spitalit të kërkesës ose admini. */
export function eshteStafi(p: Aktor, k: Pick<KerkesePerVerifikim, "spitali_id">): boolean {
  if (!p) return false;
  if (p.roli === "admin") return true;
  return p.roli === "spital" && p.spitali_id !== null && p.spitali_id === k.spitali_id;
}

/**
 * Statusi i kërkesës sapo postohet:
 * - stafi i po atij spitali (ose admini) → "aktive" (e verifikuar menjëherë);
 * - kushdo tjetër (familja, stafi i një spitali tjetër) → "ne_verifikim", pa njoftuar asnjë dhurues.
 */
export function statusiFillestar(p: Aktor, spitaliId: string): "aktive" | "ne_verifikim" {
  return eshteStafi(p, { spitali_id: spitaliId }) ? "aktive" : "ne_verifikim";
}

/** Vetëm stafi i spitalit të kërkesës (ose admini) e verifikon/refuzon, dhe vetëm kur është në pritje. */
export function mundTeVerifikoje(p: Aktor, k: KerkesePerVerifikim): boolean {
  return k.statusi === "ne_verifikim" && eshteStafi(p, k);
}

/**
 * Kush e sheh kërkesën:
 * - publikisht: vetëm kërkesat e verifikuara (aktive/përfunduar/anuluar) që nuk janë pezulluar;
 * - kërkuesi dhe stafi i spitalit: gjithmonë (edhe në pritje, të refuzuara ose të pezulluara).
 */
export function mundTeShikoje(p: Aktor, k: KerkesePerVerifikim): boolean {
  const publike = ["aktive", "perfunduar", "anuluar"].includes(k.statusi) && !k.pezulluar;
  if (publike) return true;
  if (!p) return false;
  return p.id === k.krijuar_nga || eshteStafi(p, k);
}

/** Raportimi: vetëm përdorues të kyçur, jo për kërkesën e vet, vetëm për kërkesa aktive. */
export function mundTeRaportoje(p: Aktor, k: KerkesePerVerifikim): boolean {
  return p !== null && p.id !== k.krijuar_nga && k.statusi === "aktive" && !k.pezulluar && !eshteStafi(p, k);
}
