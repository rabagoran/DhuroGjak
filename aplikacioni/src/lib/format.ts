// Formatime të vogla që përdoren edhe në server edhe në klient.

const ZONA = "Europe/Belgrade"; // e njëjta orë si Prishtina

export function formatoAfatin(iso: string, tani: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const ora = d.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA });
  const dita = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: ZONA });
  const neser = new Date(tani.getTime() + 24 * 60 * 60 * 1000);
  if (dita(d) === dita(tani)) return `sot deri në ${ora}`;
  if (dita(d) === dita(neser)) return `nesër deri në ${ora}`;
  const data = d.toLocaleDateString("sq-AL", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: ZONA });
  return `deri më ${data}, ${ora}`;
}

export function kaSkaduar(iso: string, tani: Date = new Date()): boolean {
  return new Date(iso).getTime() < tani.getTime();
}

export function formatoDaten(data: string | null): string {
  if (!data) return "—";
  const [v, m, d] = data.slice(0, 10).split("-");
  return `${d}.${m}.${v}`;
}

export function dozat(n: number): string {
  return n === 1 ? "1 dozë" : `${n} doza`;
}
