// Logjika e pastër e domenit: pa databazë, pa React. Testohet me `npm test`.

export const GRUPET = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;
export type GrupGjaku = (typeof GRUPET)[number];

export type Gjinia = "M" | "F";

/** Ditët minimale mes dy dhurimeve të gjakut të plotë. */
export const DITET_PRITJES: Record<Gjinia, number> = { M: 90, F: 120 };

export function eshteGrup(vlera: unknown): vlera is GrupGjaku {
  return typeof vlera === "string" && (GRUPET as readonly string[]).includes(vlera);
}

/**
 * Kush mund t'i japë marrësit? (eritrocite)
 * O- i jep të gjithëve; AB+ merr nga të gjithë.
 */
const DHURUESIT_PER_MARRESIN: Record<GrupGjaku, readonly GrupGjaku[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

export function grupetDhuruese(marresi: GrupGjaku): readonly GrupGjaku[] {
  return DHURUESIT_PER_MARRESIN[marresi];
}

export function mundTeJape(dhuruesi: GrupGjaku, marresi: GrupGjaku): boolean {
  return DHURUESIT_PER_MARRESIN[marresi].includes(dhuruesi);
}

/** Grupet të cilave dhuruesi u jep (p.sh. O- → të gjitha). */
export function grupetMarrese(dhuruesi: GrupGjaku): GrupGjaku[] {
  return GRUPET.filter((m) => mundTeJape(dhuruesi, m));
}

const DITA_MS = 24 * 60 * 60 * 1000;

/** Data kur dhuruesi lejohet përsëri (YYYY-MM-DD) ose null nëse s'ka dhuruar kurrë. */
export function dataELejimit(dhurimiFundit: string | null, gjinia: Gjinia): string | null {
  if (!dhurimiFundit) return null;
  const d = new Date(dhurimiFundit + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getTime() + DITET_PRITJES[gjinia] * DITA_MS).toISOString().slice(0, 10);
}

/** Sa ditë kanë mbetur deri në lejim (0 = mund të dhurojë sot). */
export function ditetDeriLejimit(dhurimiFundit: string | null, gjinia: Gjinia, sot: Date = new Date()): number {
  const leje = dataELejimit(dhurimiFundit, gjinia);
  if (!leje) return 0;
  const sotUTC = Date.UTC(sot.getUTCFullYear(), sot.getUTCMonth(), sot.getUTCDate());
  const diff = Math.ceil((new Date(leje + "T00:00:00Z").getTime() - sotUTC) / DITA_MS);
  return Math.max(0, diff);
}

export function mundTeDhurojeTani(dhurimiFundit: string | null, gjinia: Gjinia, sot: Date = new Date()): boolean {
  return ditetDeriLejimit(dhurimiFundit, gjinia, sot) === 0;
}

/** Qytetet fqinje për përputhjen “në të njëjtin qytet ose afër”. */
const FQINJET: Record<string, readonly string[]> = {
  "Prishtinë": ["Fushë Kosovë", "Obiliq", "Lipjan", "Podujevë", "Graçanicë", "Drenas"],
  "Fushë Kosovë": ["Prishtinë", "Obiliq", "Lipjan", "Drenas"],
  "Obiliq": ["Prishtinë", "Fushë Kosovë", "Vushtrri"],
  "Lipjan": ["Prishtinë", "Fushë Kosovë", "Shtime", "Ferizaj", "Graçanicë"],
  "Graçanicë": ["Prishtinë", "Lipjan"],
  "Podujevë": ["Prishtinë"],
  "Drenas": ["Prishtinë", "Fushë Kosovë", "Skënderaj", "Malishevë"],
  "Ferizaj": ["Lipjan", "Shtime", "Kaçanik", "Viti", "Gjilan"],
  "Shtime": ["Lipjan", "Ferizaj", "Suharekë"],
  "Kaçanik": ["Ferizaj"],
  "Gjilan": ["Ferizaj", "Viti", "Kamenicë"],
  "Viti": ["Gjilan", "Ferizaj"],
  "Kamenicë": ["Gjilan"],
  "Prizren": ["Suharekë", "Rahovec", "Dragash"],
  "Suharekë": ["Prizren", "Rahovec", "Shtime", "Malishevë"],
  "Rahovec": ["Prizren", "Suharekë", "Gjakovë", "Malishevë"],
  "Dragash": ["Prizren"],
  "Malishevë": ["Drenas", "Rahovec", "Suharekë", "Klinë"],
  "Gjakovë": ["Rahovec", "Deçan", "Klinë"],
  "Deçan": ["Gjakovë", "Pejë"],
  "Pejë": ["Deçan", "Istog", "Klinë"],
  "Istog": ["Pejë", "Klinë"],
  "Klinë": ["Pejë", "Istog", "Gjakovë", "Malishevë", "Skënderaj"],
  "Skënderaj": ["Drenas", "Klinë", "Vushtrri", "Mitrovicë"],
  "Vushtrri": ["Mitrovicë", "Obiliq", "Skënderaj"],
  "Mitrovicë": ["Vushtrri", "Skënderaj"],
};

// Java 13: renditje e fiksuar. `localeCompare("sq")` jepte renditje të ndryshme në Node (server)
// dhe në shfletues, duke shkaktuar gabim hidratimi React #418 te <select>.
const ALFABETI = "a b c ç d dh e ë f g gj h i j k l ll m n nj o p q r rr s sh t th u v x xh y z zh".split(" ");
function celesi(fjala: string): number[] {
  const f = fjala.toLowerCase();
  const out: number[] = [];
  for (let i = 0; i < f.length; ) {
    const dy = f.slice(i, i + 2);
    const j = ALFABETI.indexOf(dy) >= 0 ? ALFABETI.indexOf(dy) : ALFABETI.indexOf(f[i]);
    out.push(j >= 0 ? j : 100 + f.charCodeAt(i));
    i += ALFABETI.indexOf(dy) >= 0 ? 2 : 1;
  }
  return out;
}
export function krahasoShqip(a: string, b: string): number {
  const x = celesi(a), y = celesi(b);
  for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i];
  return x.length - y.length;
}

export const QYTETET: readonly string[] = Object.keys(FQINJET).sort(krahasoShqip);

export function eshteQytet(vlera: unknown): vlera is string {
  return typeof vlera === "string" && vlera in FQINJET;
}

/** Qyteti vetë + fqinjët e tij. */
export function qytetetAfer(qyteti: string): string[] {
  return [qyteti, ...(FQINJET[qyteti] ?? [])];
}

export type DhuruesPerPerputhje = {
  grupi: GrupGjaku;
  qyteti: string;
  gjinia: Gjinia;
  dhurimi_fundit: string | null;
  njoftimet: boolean;
};

/** A duhet ky dhurues të njoftohet për këtë kërkesë? */
export function perputhet(
  dhuruesi: DhuruesPerPerputhje,
  kerkesa: { grupi: GrupGjaku; qyteti: string },
  sot: Date = new Date(),
): boolean {
  return (
    dhuruesi.njoftimet &&
    mundTeJape(dhuruesi.grupi, kerkesa.grupi) &&
    qytetetAfer(kerkesa.qyteti).includes(dhuruesi.qyteti) &&
    mundTeDhurojeTani(dhuruesi.dhurimi_fundit, dhuruesi.gjinia, sot)
  );
}

export type Distinktiv = { kodi: string; emri: string; pershkrimi: string; ikona: string; nga: number };

export const DISTINKTIVAT: readonly Distinktiv[] = [
  { kodi: "i-pari", emri: "Dhuruesi i parë", pershkrimi: "Dhurimi i parë përmes DhuroGjak", ikona: "🩸", nga: 1 },
  { kodi: "i-rregullt", emri: "Dhurues i rregullt", pershkrimi: "3 dhurime", ikona: "🏅", nga: 3 },
  { kodi: "hero", emri: "Hero", pershkrimi: "5 dhurime — deri në 15 jetë të ndihmuara", ikona: "🦸", nga: 5 },
  { kodi: "legjende", emri: "Legjendë", pershkrimi: "10 dhurime", ikona: "🏆", nga: 10 },
];

export function distinktivat(numriDhurimeve: number): Distinktiv[] {
  return DISTINKTIVAT.filter((d) => numriDhurimeve >= d.nga);
}

export function distinktiviTjeter(numriDhurimeve: number): Distinktiv | null {
  return DISTINKTIVAT.find((d) => numriDhurimeve < d.nga) ?? null;
}
