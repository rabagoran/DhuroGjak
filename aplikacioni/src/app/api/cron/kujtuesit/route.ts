import { dergoKujtuesit } from "@/lib/njoftimet";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron (vercel.json) e thërret çdo ditë.
 * Vercel dërgon `Authorization: Bearer <CRON_SECRET>`; pa të, kërkesa refuzohet.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const derguar = await dergoKujtuesit();
    return Response.json({ ok: true, derguar });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
