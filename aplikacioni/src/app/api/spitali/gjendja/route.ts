import { perdoruesiIm } from "@/lib/lejet";
import { kerkesatPerStafin } from "@/lib/spitali";

export const dynamic = "force-dynamic";

/** Gjendja e panelit të spitalit për polling: vetëm ID-të dhe statuset (për stafin e kyçur). */
export async function GET() {
  try {
    const p = await perdoruesiIm();
    if (!p || (p.roli !== "spital" && p.roli !== "admin")) return Response.json({ error: "ndaluar" }, { status: 403 });
    const te = await kerkesatPerStafin(p);
    const gjendja = [...te.nePritje, ...te.teRaportuara, ...te.aktive].map((k) => `${k.id}:${k.statusi}:${k.raportime}:${k.pezulluar}`);
    return Response.json({ gjendja }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "db" }, { status: 503 });
  }
}
