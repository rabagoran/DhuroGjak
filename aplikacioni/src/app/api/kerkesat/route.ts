import { lexoKerkesat } from "@/lib/kerkesat";

export const dynamic = "force-dynamic";

/** Lista publike për offline: VETËM fusha publike (pa telefon, pa krijues). */
export async function GET() {
  try {
    const rows = await lexoKerkesat();
    const kerkesat = rows.map(({ id, grupi, spitali, qyteti, dozat, afati, urgjente, pranuar }) =>
      ({ id, grupi, spitali, qyteti, dozat, afati, urgjente, pranuar }));
    return Response.json({ kerkesat }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Lista nuk mund të lexohet tani." }, { status: 503 });
  }
}
