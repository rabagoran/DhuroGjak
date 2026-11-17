"use server";
import { revalidatePath } from "next/cache";
import { perdoruesiIm } from "@/lib/lejet";
import { shenoTeGjithaTeLexuara } from "@/lib/njoftimet";
import { getSql } from "@/lib/db";

export async function shenoTeGjitha() {
  const p = await perdoruesiIm().catch(() => null);
  if (!p) return;
  await shenoTeGjithaTeLexuara(p.id).catch(() => {});
  revalidatePath("/njoftimet");
}

type Abonim = { endpoint: string; keys: { p256dh: string; auth: string } };

/** Ruan abonimin push të kësaj pajisjeje (pas lejes së qartë të përdoruesit). */
export async function ruajAbonimin(a: Abonim): Promise<{ ok: boolean }> {
  try {
    const p = await perdoruesiIm();
    if (!p) return { ok: false };
    const ok = typeof a?.endpoint === "string" && a.endpoint.startsWith("https://") && a.endpoint.length < 1000
      && typeof a.keys?.p256dh === "string" && a.keys.p256dh.length < 200
      && typeof a.keys?.auth === "string" && a.keys.auth.length < 100;
    if (!ok) return { ok: false };
    const sql = getSql();
    await sql`
      INSERT INTO push_abonimet (perdoruesi_id, endpoint, p256dh, auth)
      VALUES (${p.id}, ${a.endpoint}, ${a.keys.p256dh}, ${a.keys.auth})
      ON CONFLICT (endpoint) DO UPDATE SET perdoruesi_id = EXCLUDED.perdoruesi_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`;
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function fshiAbonimin(endpoint: string): Promise<{ ok: boolean }> {
  try {
    const p = await perdoruesiIm();
    if (!p) return { ok: false };
    const sql = getSql();
    await sql`DELETE FROM push_abonimet WHERE endpoint = ${endpoint} AND perdoruesi_id = ${p.id}`;
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
