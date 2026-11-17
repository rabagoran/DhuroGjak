import "server-only";
import webpush from "web-push";
import { getSql } from "./db";

let konfiguruar: boolean | null = null;

function konfiguro(): boolean {
  if (konfiguruar !== null) return konfiguruar;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return (konfiguruar = false);
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", pub, priv);
  return (konfiguruar = true);
}

export function pushAktiv(): boolean {
  return konfiguro();
}

export type PushPayload = { title: string; body: string; url: string; tag?: string };

/**
 * Dërgon push te të gjitha pajisjet e përdoruesve. Push është OPSIONAL:
 * pa çelësat VAPID nuk bën asgjë dhe aplikacioni punon me njoftimet në aplikacion.
 */
export async function dergoPush(perdoruesIds: string[], payload: PushPayload): Promise<number> {
  if (perdoruesIds.length === 0 || !konfiguro()) return 0;
  const sql = getSql();
  const abonimet = await sql`SELECT id, endpoint, p256dh, auth FROM push_abonimet WHERE perdoruesi_id = ANY(${perdoruesIds})`;
  const trupi = JSON.stringify(payload);
  const teSkaduara: string[] = [];
  let derguar = 0;
  await Promise.all(abonimet.map(async (a) => {
    try {
      await webpush.sendNotification(
        { endpoint: a.endpoint as string, keys: { p256dh: a.p256dh as string, auth: a.auth as string } },
        trupi,
        { TTL: 60 * 60, urgency: "high" },
      );
      derguar++;
    } catch (e) {
      const kodi = (e as { statusCode?: number }).statusCode;
      if (kodi === 404 || kodi === 410) teSkaduara.push(String(a.id)); // pajisja e çregjistroi
    }
  }));
  if (teSkaduara.length) await sql`DELETE FROM push_abonimet WHERE id = ANY(${teSkaduara}::bigint[])`;
  return derguar;
}
