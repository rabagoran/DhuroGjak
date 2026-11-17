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

// Java 3: të dhëna fiktive, statike. Në Java 4 zëvendësohen nga Neon.
const sot = new Date();
const ore = (h: number) => new Date(sot.getTime() + h * 60 * 60 * 1000).toISOString();

const KERKESAT: Kerkese[] = [
  { id: "1", grupi: "O-", spitali: "QKUK Prishtinë", qyteti: "Prishtinë", dozat: 2, afati: ore(5), pershkrimi: "Pacient në kirurgji (shembull fiktiv).", urgjente: true, statusi: "aktive", pranuar: 1 },
  { id: "2", grupi: "A+", spitali: "Spitali Rajonal Pejë", qyteti: "Pejë", dozat: 3, afati: ore(26), pershkrimi: "Operacion i planifikuar (shembull fiktiv).", urgjente: false, statusi: "aktive", pranuar: 0 },
  { id: "3", grupi: "AB-", spitali: "Spitali Rajonal Prizren", qyteti: "Prizren", dozat: 1, afati: ore(48), pershkrimi: "Lindje me komplikime (shembull fiktiv).", urgjente: false, statusi: "aktive", pranuar: 1 },
];

export function lexoKerkesat(): Kerkese[] {
  return KERKESAT;
}

export function gjejKerkesen(id: string): Kerkese | undefined {
  return KERKESAT.find((k) => k.id === id);
}
