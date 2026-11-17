# DhuroGjak — Java 10: Sinkronizimi në kohë reale

## Zgjedhja: polling, SSE apo WebSocket?

| Teknika | Pro | Kundër | Për DhuroGjak |
|---|---|---|---|
| **Polling (5 s)** | I thjeshtë, punon në Vercel serverless, rilidhje natyrale | Kërkesa edhe kur s’ka ndryshim | ✅ **Zgjodha këtë** |
| SSE | Serveri shtyn ndryshimet | Lidhje e gjatë; funksionet serverless kanë kohëzgjatje të kufizuar | Për më vonë |
| WebSocket | Dy-drejtimësh, i shpejtë | Kërkon server të veçantë / shërbim të jashtëm | E tepërt për MVP |

Një kërkesë gjaku ndryshon disa herë në orë; 5 sekonda vonesë janë të pranueshme.

## Çfarë ndërtova

- **`aplikacioni/src/app/api/kerkesat/[id]/gjendja/route.ts`** — kthen vetëm `{ pranuar, dozat, statusi }` (pa të dhëna private), `Cache-Control: no-store`.
- **`aplikacioni/src/components/LiveRifreskim.tsx`** — pyet serverin çdo 5 s (lista: 15 s). Kur përgjigjja ndryshon, thërret `router.refresh()` dhe Server Components rivizatohen me të dhënat e reja:
  - **dhuruesi** sheh “1 nga 2 → 2 nga 2 ✅” kur pranon dikush tjetër;
  - **kërkuesi** sheh dhuruesin e ri në listë (me telefon) pa rifreskuar;
  - kur kërkesa mbushet/mbyllet, butoni “Do të shkoj” zhduket te të gjithë.
- **Rilidhja:** pas gabimit tregon “🟠 Lidhja u ndërpre — po riprovojmë…”, dhe rifillon menjëherë kur kthehet interneti (`online`) ose skeda bëhet e dukshme. Kur skeda është e fshehur, polling-u pushon.
- **`DoTeShkoj.tsx`** sinkronizon numëruesin optimist me vlerën e re nga serveri.
- **📊 Statistikat** (`/statistikat`): “Këtë muaj u ndihmuan X pacientë”, dhurimet e muajit, kërkesat aktive, dhuruesit sipas grupit — vetëm numra agregatë.
- **Rreth projektit** (`/rreth`): modeli pa pagesa, mbështetësit, privatësia.

## Provat me dy ekrane

**Përgatitja:** Ekrani A = kërkuesi (Chrome), ekrani B = dhuruesi (Incognito ose telefon). Të dy hapin të njëjtën kërkesë me 2 doza.

1. **Kërkesa:** B shtyp “Do të shkoj”. Brenda ≤ 5 s, A sheh “1 nga 2” dhe emrin/telefonin e B.
   **Rezultati real:** _(plotëso: sa sekonda u deshën?)_
2. **Pranimi/konfirmimi:** A shtyp “Konfirmo dhurimin”. Brenda ≤ 5 s, B sheh “Dhurimi yt u konfirmua”.
   **Rezultati real:** _(plotëso)_
3. **Rilidhja:** Në B: DevTools → Offline → shfaqet “Lidhja u ndërpre”. Ndërkohë A ndryshon diçka. B → Online → ndryshimi shfaqet menjëherë.
   **Rezultati real:** _(plotëso)_

`npm run build` kaloi pa gabime.

## Ndihma nga AI

Claude ndihmoi me krahasimin e teknikave dhe komponentin e polling-ut. Provat me dy ekrane i bëj vetë.
