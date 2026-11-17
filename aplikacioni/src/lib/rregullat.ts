// Rregullat e biznesit për “Do të shkoj” — funksion i pastër, i testuar në tests/rregullat.test.ts.
// Serveri i zbaton të njëjtat kushte edhe në SQL (mbrojtje e dyfishtë).
import { mundTeJape, ditetDeriLejimit, type GrupGjaku, type Gjinia } from "./gjaku.ts";

export type VendimPergjigjeje =
  | "ok"
  | "hyr"        // nuk ka hyrë
  | "profili"    // profili i paplotë (pa grup/gjini/telefon/qytet)
  | "pronar"     // kërkuesi nuk mund t'i përgjigjet kërkesës së vet
  | "mbyllur"    // kërkesa jo aktive ose afati ka kaluar
  | "plot"       // dozat janë mbuluar
  | "grupi"      // grup i papërputhshëm
  | "bllokuar"   // nuk kanë kaluar 90/120 ditë
  | "ekziston";  // ka pranuar tashmë

export type DhuruesPerVendim = {
  id: string;
  grupi: GrupGjaku | null;
  gjinia: Gjinia | null;
  telefoni: string | null;
  qyteti: string | null;
  dhurimi_fundit: string | null;
} | null;

export type KerkesePerVendim = {
  grupi: GrupGjaku;
  statusi: string;
  afati: string;
  dozat: number;
  pranuar: number;
  krijuar_nga: string | null;
  pezulluar?: boolean;
};

export function vendosPergjigjen(
  dhuruesi: DhuruesPerVendim,
  kerkesa: KerkesePerVendim,
  opsione: { kaPranuar?: boolean; tani?: Date } = {},
): VendimPergjigjeje {
  const tani = opsione.tani ?? new Date();
  if (!dhuruesi) return "hyr";
  if (kerkesa.krijuar_nga === dhuruesi.id) return "pronar";
  if (kerkesa.statusi !== "aktive" || kerkesa.pezulluar || new Date(kerkesa.afati).getTime() <= tani.getTime()) return "mbyllur";
  if (opsione.kaPranuar) return "ekziston";
  if (!dhuruesi.grupi || !dhuruesi.gjinia || !dhuruesi.telefoni || !dhuruesi.qyteti) return "profili";
  if (kerkesa.pranuar >= kerkesa.dozat) return "plot";
  if (!mundTeJape(dhuruesi.grupi, kerkesa.grupi)) return "grupi";
  if (ditetDeriLejimit(dhuruesi.dhurimi_fundit, dhuruesi.gjinia, tani) > 0) return "bllokuar";
  return "ok";
}

export const MESAZHET_E_VENDIMIT: Record<VendimPergjigjeje, string> = {
  ok: "Faleminderit! Kërkuesi u njoftua që po vjen.",
  hyr: "Hyr në llogari për të shtypur “Do të shkoj”.",
  profili: "Plotëso profilin e dhuruesit (grupi, gjinia, qyteti, telefoni) para se të pranosh.",
  pronar: "Kjo është kërkesa jote.",
  mbyllur: "Kjo kërkesë nuk është më aktive.",
  plot: "Dozat janë mbuluar tashmë. Faleminderit gjithsesi!",
  grupi: "Grupi yt i gjakut nuk përputhet me këtë kërkesë.",
  bllokuar: "Nuk ka kaluar ende koha e pritjes nga dhurimi yt i fundit.",
  ekziston: "Ke pranuar tashmë këtë kërkesë.",
};
