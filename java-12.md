# DhuroGjak — Java 12: Validimi dhe siguria mobile

## Rreziqet dhe si i mbylla

| Rreziku | Mbrojtja | Ku |
|---|---|---|
| **Mbirezervimi:** 2 dhurues pranojnë njëkohësisht kërkesën e fundit me 1 dozë | Transaksion + `pg_advisory_xact_lock(kerkesa_id)`; `INSERT … WHERE COUNT(*) < dozat` brenda bllokimit | `src/lib/pergjigjet.ts → pergjigjuNeKerkese` |
| Klikime të dyfishta / rrjet i ngadaltë | `UNIQUE (kerkesa_id, dhuruesi_id)` + `ON CONFLICT`; butoni i çaktivizuar gjatë dërgimit | `schema-java07.sql`, `DoTeShkoj.tsx` |
| Konfirmim i dyfishtë i dhurimit | `WHERE statusi = 'do_shkoj'` në CTE atomike → konfirmimi i dytë nuk numëron | `konfirmoDhurimin` |
| Ndryshim i ID-së në formular (IDOR) | ID e përdoruesit merret vetëm nga sesioni; pronësia kontrollohet në `WHERE` | `lejet.ts`, `kerkesat.ts`, `pergjigjet.ts` |
| Spam / kërkesa të rreme | Hyrje e detyrueshme; maks. **3 kërkesa aktive** dhe **5 në 24 orë** për përdorues | `arsyejaEKufizimit()` |
| **Shitja e gjakut** | Refuzohen tekstet me pagesë/çmim/€/“shpërblim” dhe lidhjet URL | `validimi.ts → kaOferteParash, kaLidhje` |
| Të dhëna të pavlefshme | Validim në server për çdo fushë (grupi, qyteti nga lista, telefoni, dozat 1–10, afati 30 min–14 ditë, data e dhurimit jo në të ardhmen) + `CHECK` në databazë | `validimi.ts`, `schema*.sql` |
| Karaktere kontrolli / injeksion | Heqja e karaktereve të kontrollit; SQL vetëm me parametra; React e “escape-on” tekstin | `validimi.ts`, `@neondatabase/serverless` |
| Zbulimi i telefonit / grupit | API-të publike kthejnë vetëm fusha publike; telefoni vetëm pas pranimit | `api/kerkesat`, `kontaktiPerDhuruesin` |
| Clickjacking, XSS, sniffing | Header-a: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `HSTS` | `next.config.ts` |
| Leje të panevojshme të pajisjes | `Permissions-Policy: geolocation=(self), camera=(), microphone=(), payment=()` | `next.config.ts` |
| Cron i hapur për këdo | `Authorization: Bearer CRON_SECRET` | `api/cron/kujtuesit` |
| Ridrejtim i jashtëm pas hyrjes | `callbackUrl` pranohet vetëm nëse fillon me `/` (jo `//`) | `app/hyrja/page.tsx` |
| CSRF në Server Actions | Next.js krahason `Origin` me host-in për çdo Server Action | (i integruar) |

Shtova edhe `aplikacioni/schema-java12.sql` me kufizime shtesë në databazë (formati i telefonit, gjatësia e emrit, afati ≤ 14 ditë) dhe një pyetje kontrolli që duhet të kthejë 0 rreshta.

## Provat

### Verifikimi automatik i SQL-së (i ekzekutuar)
Të gjitha skemat (`schema.sql` → `schema-java12.sql`) dhe pyetjet kryesore u ekzekutuan në PostgreSQL lokal (PGlite). **Rezultati real: 21/21 kontrolle kaluan**, ndër to:
- kërkesa me 1 dozë: dhuruesi i dytë merr “plot”; klikimi i dytë i të njëjtit dhurues nuk krijon rresht të ri;
- pronari nuk mund t’i përgjigjet kërkesës së vet; jo-pronari nuk mund të konfirmojë dhurim;
- konfirmimi rrit `dhurime`, vendos `dhurimi_fundit = sot` dhe e përfundon kërkesën; konfirmimi i dytë nuk numërohet;
- `CHECK` refuzon grupin `X+` dhe afatin 30 ditë.

### Provat në aplikacion (për t’i bërë ti)
1. **Mbirezervimi:** kërkesë me 1 dozë; dy dhurues (dy telefona) shtypin “Do të shkoj” njëkohësisht. Vetëm njëri merr “Ke pranuar”; tjetri “Dozat janë mbuluar tashmë”.
   **Rezultati real:** _(plotëso)_
2. **Pagesa:** posto kërkesë me përshkrimin “paguaj 50 euro” → refuzohet me mesazhin për dhurimin falas.
   **Rezultati real:** _(plotëso)_
3. **Kufizimi:** posto 4 kërkesa aktive → e katërta refuzohet.
   **Rezultati real:** _(plotëso)_
4. **Header-at:** DevTools → Network → dokumenti → Response Headers: shfaqen CSP, X-Frame-Options etj.
   **Rezultati real:** _(plotëso)_

`npm run build` kaloi pa gabime.

## Ndihma nga AI

Claude ndihmoi me analizën e rreziqeve, bllokimin e transaksionit dhe verifikimin e SQL-së me PGlite. Provat në aplikacion i bëj vetë.
