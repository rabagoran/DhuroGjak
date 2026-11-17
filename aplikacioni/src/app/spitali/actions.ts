"use server";
import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { perdoruesiIm } from "@/lib/lejet";
import { verifikoKerkesen, refuzoKerkesen, shqyrtoRaportimet, caktoRolin } from "@/lib/spitali";
import { eshteArsyeRefuzimi, type Roli } from "@/lib/verifikimi";
import { gjejSpitalin } from "@/lib/spitalet";

/** Kthehu aty ku ishte stafi: te paneli ose te detajet e kërkesës (vetëm lidhje të brendshme). */
function kthimi(formData: FormData, id: string) {
  return formData.get("kthehu") === "kerkesa" ? `/kerkesa/${encodeURIComponent(id)}` : "/spitali";
}

export async function verifiko(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  let m: string;
  try {
    const p = await perdoruesiIm();
    if (!p) redirect("/hyrja?callbackUrl=/spitali");
    const n = await verifikoKerkesen(p, id);
    m = n === null ? "ndaluar" : `verifikuar&n=${n}`;
  } catch (e) {
    unstable_rethrow(e);
    m = "databaza";
  }
  revalidatePath("/");
  redirect(`${kthimi(formData, id)}?m=${m}`);
}

export async function refuzo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const arsyeja = String(formData.get("arsyeja") ?? "");
  let m: string;
  try {
    const p = await perdoruesiIm();
    if (!p) redirect("/hyrja?callbackUrl=/spitali");
    m = !eshteArsyeRefuzimi(arsyeja) ? "fushe" : (await refuzoKerkesen(p, id, arsyeja)) ? "refuzuar" : "ndaluar";
  } catch (e) {
    unstable_rethrow(e);
    m = "databaza";
  }
  revalidatePath("/");
  redirect(`${kthimi(formData, id)}?m=${m}`);
}

export async function shqyrto(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const vendimi = formData.get("vendimi") === "anulo" ? "anulo" : "rikthe";
  let m: string;
  try {
    const p = await perdoruesiIm();
    if (!p) redirect("/hyrja?callbackUrl=/spitali");
    m = (await shqyrtoRaportimet(p, id, vendimi)) ? (vendimi === "anulo" ? "anuluar" : "rikthyer") : "ndaluar";
  } catch (e) {
    unstable_rethrow(e);
    m = "databaza";
  }
  revalidatePath("/");
  redirect(`${kthimi(formData, id)}?m=${m}`);
}

const ROLET: Roli[] = ["perdorues", "spital", "admin"];

export async function ndryshoRolin(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const roli = String(formData.get("roli") ?? "") as Roli;
  const spitali = gjejSpitalin(String(formData.get("spitali_id") ?? ""));
  let m: string;
  try {
    const p = await perdoruesiIm();
    if (!p) redirect("/hyrja?callbackUrl=/admin");
    if (!ROLET.includes(roli) || (roli === "spital" && !spitali)) m = "fushe";
    else m = (await caktoRolin(p, id, roli, spitali?.id ?? null)) ? "ruajtur" : "ndaluar";
  } catch (e) {
    unstable_rethrow(e);
    m = "databaza";
  }
  revalidatePath("/admin");
  redirect(`/admin?m=${m}`);
}
