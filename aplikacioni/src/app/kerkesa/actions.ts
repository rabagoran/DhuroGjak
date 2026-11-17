"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { perdoruesiIm } from "@/lib/lejet";
import { validoKerkesen } from "@/lib/validimi";
import { krijoKerkesen, ndryshoStatusin } from "@/lib/kerkesat";

export type GjendjaKerkeses = { ok: boolean; mesazh: string; gabimet?: Record<string, string>; vlerat?: Record<string, string> };

const vlerat = (f: FormData) => Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)]));

export async function postoKerkesen(_: GjendjaKerkeses, formData: FormData): Promise<GjendjaKerkeses> {
  let id: string;
  try {
    const p = await perdoruesiIm();
    if (!p) return { ok: false, mesazh: "Hyr në llogari para se të postosh kërkesë.", vlerat: vlerat(formData) };
    const r = validoKerkesen(formData);
    if (!r.ok) return { ok: false, mesazh: "Kontrollo fushat e shënuara.", gabimet: r.gabimet, vlerat: vlerat(formData) };
    id = await krijoKerkesen(p, r.vlera);
  } catch {
    return { ok: false, mesazh: "Nuk u lidhëm me databazën. Kërkesa nuk u postua.", vlerat: vlerat(formData) };
  }
  revalidatePath("/");
  redirect(`/kerkesa/${id}?m=postuar`);
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
