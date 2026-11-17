# DhuroGjak — Java 13: Performanca dhe auditimi mobile

## Si e mata

- `npm run build` + `npx next start -p 3123` (modaliteti production, në kompjuter lokal).
- **Lighthouse 12**, profili **mobile** (ekran i ngushtë, CPU dhe rrjet i ngadalësuar), Chrome headless.
- Faqet: `/qendrat` (komponent klienti + hartë) dhe `/hyrja`.
- **Kufizim:** gjatë matjes nuk ishte lidhur Neon, prandaj `/api/kerkesat` kthente 503 (pritet). Lista dhe detajet duhen matur sërish pas lidhjes me Neon/Vercel.

## Baza (para rregullimeve) — rezultati real

| Faqja | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/qendrat` | 93 | 96 | 96 | 100 |
| `/hyrja` | 80 | 95 | 96 | 100 |

Problemet që gjeti Lighthouse:
1. **Kontrast i pamjaftueshëm (3.76:1)** — teksti i bardhë mbi `#ef4444` në **dark mode** (shiriti i sipërm, butonat). Minimumi WCAG është 4.5:1.
2. **Gabim React #418 (hidratim)** te `/qendrat`: lista e qyteteve renditej me `localeCompare("sq")`, që jep renditje tjetër në Node (server) dhe në shfletues → `<option>` të ndryshme.
3. **`/favicon.ico` 404**.
4. **500 te `/api/njoftimet/numri`** kur `NEXTAUTH_SECRET` mungon (sesioni hidhte gabim).

## Rregullimet

1. Token i ri `--red-solid: #b91c1c` për çdo sfond me tekst të bardhë (kontrast **6.5:1**) — `aplikacioni/src/app/globals.css`. E kuqja e çelur mbetet vetëm për tekst mbi sfond të errët.
2. Renditje e fiksuar sipas alfabetit shqip (`krahasoShqip`, me shkronjat dyshe `dh, gj, ll, nj, rr, sh, th, xh, zh`) — `aplikacioni/src/lib/gjaku.ts`.
3. `aplikacioni/src/app/favicon.ico`.
4. Zilja kthen “pa hyrje” në vend të 500 — `aplikacioni/src/app/api/njoftimet/numri/route.ts`.
5. Shtesë për ndjesinë e shpejtësisë: `aplikacioni/src/app/loading.tsx` (skeleton gjatë leximit nga Neon) dhe `prefers-reduced-motion`.

## Pas rregullimeve — rezultati real

| Faqja | Performance | Accessibility | Best practices | SEO | LCP | TBT |
|---|---|---|---|---|---|---|
| `/qendrat` | 89 | **100** | 96 | 100 | 1.6 s | 430 ms |
| `/hyrja` | 97 | **100** | 96 | 100 | 1.9 s | 160 ms |

- Kontrasti: **kaloi**. Gabimi #418 dhe 500: **zhdukën**. Mbeti vetëm 503 (pa databazë lokalisht).
- Performanca luhatet ±5 pikë nga një matje në tjetrën (CPU e simuluar); te `/qendrat` pjesa më e madhe e TBT vjen nga harta OpenStreetMap në `<iframe>` (ngarkohet me `loading="lazy"`).

## Kontrolli në telefon (për ta bërë ti)

| Kontrolli | Rezultati real |
|---|---|
| Lista dhe detajet pa scroll horizontal (360 px) | _(plotëso)_ |
| Butonat ≥ 44–48 px, të lehtë për t’u shtypur me gisht | _(plotëso)_ |
| Navigimi me tastierë (Tab) — fokusi i dukshëm | _(plotëso)_ |
| Lighthouse te `/` dhe `/kerkesa/1` pas lidhjes me Neon | _(plotëso)_ |

## Ndihma nga AI

Claude ekzekutoi Lighthouse, gjeti shkakun e gabimit #418 dhe propozoi rregullimet. Matjet në telefon i bëj vetë.
