import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { numriPalexuar } from "@/lib/njoftimet";

export const dynamic = "force-dynamic";

const pa = { "Cache-Control": "no-store" };

/** Numri i njoftimeve të palexuara për zilen (0 kur nuk ka hyrë). */
export async function GET() {
  let id: string | undefined;
  try {
    id = (await getServerSession(authOptions))?.user?.id;
  } catch {
    // Java 13: pa NEXTAUTH_SECRET sesioni hedh gabim → mos kthe 500, thjesht “pa hyrje”.
    return Response.json({ hyre: false, numri: 0 }, { headers: pa });
  }
  if (!id) return Response.json({ hyre: false, numri: 0 }, { headers: pa });
  try {
    return Response.json({ hyre: true, numri: await numriPalexuar(id) }, { headers: pa });
  } catch {
    return Response.json({ hyre: true, numri: 0, error: "db" }, { status: 503 });
  }
}
