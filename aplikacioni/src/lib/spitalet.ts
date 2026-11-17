// Lista e spitaleve / qendrave të transfuzionit që mund të marrin kërkesa.
// Duhet të përputhet me tabelën `spitalet` në schema-verifikimi.sql.

export type Spital = { id: string; emri: string; qyteti: string };

export const SPITALET: readonly Spital[] = [
  { id: "qktgj", emri: "QKUK / Qendra Kombëtare e Transfuzionit të Gjakut", qyteti: "Prishtinë" },
  { id: "peje", emri: "Spitali Rajonal Pejë", qyteti: "Pejë" },
  { id: "prizren", emri: "Spitali Rajonal Prizren", qyteti: "Prizren" },
  { id: "gjakove", emri: "Spitali Rajonal Gjakovë", qyteti: "Gjakovë" },
  { id: "gjilan", emri: "Spitali Rajonal Gjilan", qyteti: "Gjilan" },
  { id: "ferizaj", emri: "Spitali Rajonal Ferizaj", qyteti: "Ferizaj" },
  { id: "mitrovice", emri: "Spitali Rajonal Mitrovicë", qyteti: "Mitrovicë" },
];

export function gjejSpitalin(id: string | null | undefined): Spital | undefined {
  return SPITALET.find((s) => s.id === id);
}
