# DhuroGjak — Java 4: Të dhëna që ruhen në Neon

## Çfarë ndërtova

Lista statike e Java 3 u zëvendësua me tabelën `kerkesat` në **Neon (PostgreSQL)**. Faqet lexojnë nga databaza përmes serverit; shfletuesi nuk e sheh kurrë `DATABASE_URL`.

- `aplikacioni/schema.sql` — tabela `kerkesat` me kufizime (`CHECK`) për grupin, dozat (1–10) dhe statusin. (Rreshtat fillestarë për prova u hoqën më vonë; skema aktuale nuk ka të dhëna demo.)
- `aplikacioni/src/lib/db.ts` — `getSql()` me `@neondatabase/serverless` dhe `import "server-only"`.
- `aplikacioni/src/lib/kerkesat.ts` — `lexoKerkesat()` (vetëm aktive dhe pa skaduar) dhe `gjejKerkesen(id)` (ID validohet si numër).
- `aplikacioni/src/components/GabimDB.tsx` — mesazhi për gabim lidhjeje me “Provo përsëri”.

**Lista bosh ≠ gabim lidhjeje:** nëse tabela s’ka kërkesa aktive shfaqet “Nuk ka kërkesa aktive për momentin.”; nëse Neon nuk arrihet shfaqet “Nuk u lidhëm me databazën.”

## Si e lidha Neon (hapat që bën ti)

1. Hyr në [vercel.com](https://vercel.com) → **Storage** → **Create Database** → **Neon** (ose direkt në [console.neon.tech](https://console.neon.tech)).
2. Kopjo **connection string** (fillon me `postgresql://`).
3. Në `aplikacioni/` krijo `.env.local` sipas `.env.example`:
   ```
   DATABASE_URL=postgresql://...
   ```
4. Hap **Neon → SQL Editor**, ngjit përmbajtjen e `aplikacioni/schema.sql` dhe shtyp **Run**.
5. `npm run dev` dhe hap `http://localhost:3000`.

## Prova 1 — Ndryshimi në databazë shfaqet pa ndryshuar kodin

**Hapat:** Në Neon SQL Editor:
```sql
UPDATE kerkesat SET dozat = 3 WHERE id = 1;
```
Rifresko listën dhe detajet e kërkesës 1. Pastaj ktheje në `2`.

**Rezultati real:** _(plotëso: a u shfaq “0 nga 3” në listë dhe detaje pa ndryshim kodi?)_

## Prova 2 — Lista bosh

**Hapat:** `UPDATE kerkesat SET statusi = 'perfunduar';` → rifresko. Pastaj `UPDATE kerkesat SET statusi = 'aktive';`.

**Rezultati real:** _(plotëso: duhet “Nuk ka kërkesa aktive për momentin.”)_

## Prova 3 — Gabim lidhjeje

**Hapat:** Ndrysho përkohësisht fjalëkalimin në `DATABASE_URL` te `.env.local`, rinise `npm run dev` dhe hap `/`. Pastaj ktheje vlerën e saktë.

**Rezultati real:** _(plotëso: duhet “Nuk u lidhëm me databazën.” me butonin “Provo përsëri”.)_

**Build:** `npm run build` kaloi pa gabime; `/`, `/kerkesa/[id]` dhe `/kerkesa/[id]/pergjigja` janë dinamike (`force-dynamic`).

## Siguria

`DATABASE_URL` është vetëm në `.env.local` (i injoruar nga git) dhe në Vercel Environment Variables. `db.ts` ka `import "server-only"`, kështu build-i dështon nëse dikush e importon gabimisht në klient.

## Ndihma nga AI

Claude ndihmoi me skemën SQL dhe trajtimin e gabimeve. Lidhjen me Neon dhe provat i kam bërë vetë.
