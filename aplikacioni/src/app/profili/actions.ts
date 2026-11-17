"use server";
import { revalidatePath } from "next/cache";
import { perdoruesiIm } from "@/lib/lejet";
import { validoProfilin } from "@/lib/validimi";
import { getSql } from "@/lib/db";

export type GjendjaFormes = { ok: boolean; mesazh: string; gabimet?: Record<string, string>; vlerat?: Record<string, string> };

const vlerat = (f: FormData) => Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)]));

export async function ruajProfilin(_: GjendjaFormes, formData: FormData): Promise<GjendjaFormes> {
  try {
    const p = await perdoruesiIm();
    if (!p) return { ok: false, mesazh: "Hyr në llogari para se të ruash profilin." };
    const r = validoProfilin(formData);
    if (!r.ok) return { ok: false, mesazh: "Kontrollo fushat e shënuara.", gabimet: r.gabimet, vlerat: vlerat(formData) };
    const v = r.vlera;
    const sql = getSql();
    // ID merret nga sesioni në server, jo nga formulari.
    await sql`
      UPDATE perdoruesit SET emri = ${v.emri}, telefoni = ${v.telefoni}, qyteti = ${v.qyteti}, gjinia = ${v.gjinia},
        grupi = ${v.grupi}, dhurimi_fundit = ${v.dhurimi_fundit}, njoftimet = ${v.njoftimet}
      WHERE id = ${p.id}`;
    revalidatePath("/profili");
    return { ok: true, mesazh: "Profili u ruajt. Faleminderit që je dhurues! ❤" };
  } catch {
    return { ok: false, mesazh: "Nuk u lidhëm me databazën. Provo përsëri.", vlerat: vlerat(formData) };
  }
}
