"use server";
import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { perdoruesiIm } from "@/lib/lejet";
import { validoKerkesen } from "@/lib/validimi";
import { krijoKerkesen, ndryshoStatusin, gjejKerkesen, arsyejaEKufizimit } from "@/lib/kerkesat";
import { pergjigjuNeKerkese, anuloPergjigjen, konfirmoDhurimin, kontaktiPerDhuruesin } from "@/lib/pergjigjet";
import type { VendimPergjigjeje } from "@/lib/rregullat";
import { njoftoDhuruesitEPerputhshem, njoftoStafin } from "@/lib/njoftimet";
import { statusiFillestar, eshteArsyeRaportimi } from "@/lib/verifikimi";
import { raportoKerkesen } from "@/lib/spitali";
import { dozat, formatoAfatin } from "@/lib/format";

export type GjendjaKerkeses = { ok: boolean; mesazh: string; gabimet?: Record<string, string>; vlerat?: Record<string, string> };

const vlerat = (f: FormData) => Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)]));

export async function postoKerkesen(_: GjendjaKerkeses, formData: FormData): Promise<GjendjaKerkeses> {
  let id: string;
  let njoftuar = 0;
  let statusi: "aktive" | "ne_verifikim";
  try {
    const p = await perdoruesiIm();
    if (!p) return { ok: false, mesazh: "Hyr në llogari para se të postosh kërkesë.", vlerat: vlerat(formData) };
    const r = validoKerkesen(formData);
    if (!r.ok) return { ok: false, mesazh: "Kontrollo fushat e shënuara.", gabimet: r.gabimet, vlerat: vlerat(formData) };
    const kufizimi = p.roli === "perdorues" ? await arsyejaEKufizimit(p.id) : null;
    if (kufizimi) return { ok: false, mesazh: kufizimi, vlerat: vlerat(formData) };
    // Verifikimi: vetëm stafi i po atij spitali poston direkt. Të tjerët presin konfirmimin e spitalit
    // dhe asnjë dhurues nuk njoftohet para tij (mbrojtje nga kërkesat e rreme).
    statusi = statusiFillestar(p, r.vlera.spitali_id);
    id = await krijoKerkesen(p, r.vlera, statusi);
    try {
      if (statusi === "aktive") {
        njoftuar = await njoftoDhuruesitEPerputhshem({ id, ...r.vlera, krijuar_nga: p.id });
      } else {
        const v = r.vlera;
        await njoftoStafin(v.spitali_id, id, "verifikim_i_ri",
          `${v.urgjente ? "URGJENTE: " : ""}Kërkesë e re për verifikim: ${v.grupi}, ${dozat(v.dozat)}, ${formatoAfatin(v.afati)}. Konfirmoje me telefon.`,
          "🏥 Kërkesë në pritje të verifikimit");
      }
    } catch { njoftuar = -1; }
  } catch {
    return { ok: false, mesazh: "Nuk u lidhëm me databazën. Kërkesa nuk u postua.", vlerat: vlerat(formData) };
  }
  revalidatePath("/");
  if (statusi === "ne_verifikim") redirect(`/kerkesa/${id}?m=ne-verifikim`);
  redirect(`/kerkesa/${id}?m=postuar&n=${njoftuar}`);
}

export async function mbyllKerkesen(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const statusi = formData.get("statusi") === "anuluar" ? "anuluar" : "perfunduar";
  let m: string;
  try {
    const p = await perdoruesiIm();
    m = p ? await ndryshoStatusin(p, id, statusi) : "hyr";
  } catch {
    m = "databaza";
  }
  if (m === "ruajtur") revalidatePath("/");
  redirect(`/kerkesa/${encodeURIComponent(id)}?m=${m === "ruajtur" ? statusi : m}`);
}

export async function raporto(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const arsyeja = String(formData.get("arsyeja") ?? "");
  let m: string;
  try {
    const p = await perdoruesiIm();
    if (!p) redirect(`/hyrja?callbackUrl=${encodeURIComponent(`/kerkesa/${id}`)}`);
    m = !eshteArsyeRaportimi(arsyeja) ? "fushe" : await raportoKerkesen(p, id, arsyeja);
  } catch (e) {
    unstable_rethrow(e);
    m = "databaza";
  }
  revalidatePath("/");
  redirect(`/kerkesa/${encodeURIComponent(id)}?m=${m === "ok" ? "raportuar" : m === "ekziston" ? "raportuar-me-pare" : m}`);
}

// ---- Java 7: “Do të shkoj”, anulimi dhe konfirmimi i dhurimit ----

export async function doTeShkoj(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  let m: string;
  try {
    const p = await perdoruesiIm();
    m = p ? await pergjigjuNeKerkese(p, id) : "hyr";
  } catch {
    m = "databaza";
  }
  if (m === "hyr") redirect(`/hyrja?callbackUrl=${encodeURIComponent(`/kerkesa/${id}`)}`);
  revalidatePath("/");
  if (m === "ok" || m === "ekziston") redirect(`/kerkesa/${encodeURIComponent(id)}/pergjigja`);
  redirect(`/kerkesa/${encodeURIComponent(id)}?m=${m}`);
}

export async function anuloPjesemarrjen(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  let m = "anuluar-pjesemarrja";
  try {
    const p = await perdoruesiIm();
    if (!p) m = "hyr";
    else if (!(await anuloPergjigjen(p, id))) m = "ndaluar";
  } catch {
    m = "databaza";
  }
  revalidatePath("/");
  redirect(`/kerkesa/${encodeURIComponent(id)}?m=${m}`);
}

export async function konfirmoDhurimInAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const pergjigjeId = String(formData.get("pergjigje") ?? "");
  let m: string;
  try {
    const p = await perdoruesiIm();
    if (!p) m = "hyr";
    else {
      const r = await konfirmoDhurimin(p, id, pergjigjeId);
      m = !r.konfirmuar ? "ndaluar" : r.perfunduar ? "perfunduar-auto" : "konfirmuar";
    }
  } catch {
    m = "databaza";
  }
  revalidatePath("/");
  redirect(`/kerkesa/${encodeURIComponent(id)}?m=${m}`);
}

// ---- Java 9: “Do të shkoj” optimist (kthen rezultat, jo redirect) ----

export type RezultatiPergjigjes =
  | { ok: true; pranuar: number; kontakti: { emri: string; telefoni: string } | null }
  | { ok: false; vendimi: VendimPergjigjeje | "databaza" };

export async function doTeShkojOptimist(kerkesaId: string): Promise<RezultatiPergjigjes> {
  try {
    const p = await perdoruesiIm();
    if (!p) return { ok: false, vendimi: "hyr" };
    // Simulim gabimi për provën e rikthimit (vetëm lokalisht; mos e aktivizo në Vercel).
    if (process.env.SIMULO_GABIM_PERGJIGJE === "1") return { ok: false, vendimi: "databaza" };
    const vendimi = await pergjigjuNeKerkese(p, kerkesaId);
    if (vendimi !== "ok") return { ok: false, vendimi };
    const [kerkesa, kontakti] = await Promise.all([gjejKerkesen(kerkesaId), kontaktiPerDhuruesin(p, kerkesaId)]);
    revalidatePath("/");
    return { ok: true, pranuar: kerkesa?.pranuar ?? 0, kontakti };
  } catch {
    return { ok: false, vendimi: "databaza" };
  }
}
