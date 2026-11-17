import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { numriPalexuar } from "@/lib/njoftimet";

export const dynamic = "force-dynamic";

/** Numri i njoftimeve të palexuara për zilen (0 kur nuk ka hyrë). */
export async function GET() {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return Response.json({ hyre: false, numri: 0 }, { headers: { "Cache-Control": "no-store" } });
  try {
    return Response.json({ hyre: true, numri: await numriPalexuar(id) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ hyre: true, numri: 0, error: "db" }, { status: 503 });
  }
}
