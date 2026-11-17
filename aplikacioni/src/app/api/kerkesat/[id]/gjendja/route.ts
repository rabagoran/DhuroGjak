import { gjejKerkesen } from "@/lib/kerkesat";

export const dynamic = "force-dynamic";

/** Java 10 — gjendja publike e një kërkese për polling (pa të dhëna private). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const k = await gjejKerkesen(id);
    if (!k) return Response.json({ error: "not_found" }, { status: 404 });
    return Response.json(
      { id: k.id, pranuar: k.pranuar, dozat: k.dozat, statusi: k.statusi },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "db" }, { status: 503 });
  }
}
