# DhuroGjak — Java 3: Komponentët dhe App Router

## Çfarë ndërtova

Krijova projektin Next.js + TypeScript në folderin `aplikacioni/` pa i prekur dokumentet e javëve 1–2. Aplikacioni ka tri faqe me URL unike dhe dy komponentë të ripërdorshëm. Të dhënat janë **tri kërkesa fiktive** në një listë statike.

| Faqja | Skedari | Përshkrimi |
|---|---|---|
| Lista | `aplikacioni/src/app/page.tsx` | Kartat e kërkesave aktive |
| Detajet | `aplikacioni/src/app/kerkesa/[id]/page.tsx` | Një kërkesë sipas `id`, me butonin “Do të shkoj” |
| Në pritje | `aplikacioni/src/app/kerkesa/[id]/pergjigja/page.tsx` | **Simulim** — nuk ruan asgjë |
| 404 | `aplikacioni/src/app/kerkesa/[id]/not-found.tsx` | ID e panjohur nuk shfaq kërkesë të gabuar |

Komponentët:

- `aplikacioni/src/components/KartaKerkeses.tsx` — karta me grupin, spitalin, qytetin, dozat, afatin dhe progresin.
- `aplikacioni/src/components/Progresi.tsx` — “1 nga 2 dhurues u gjet ✅” me shirit progresi (`role="progressbar"`).
- `aplikacioni/src/components/Navigimi.tsx` — navigimi poshtë, si në aplikacionet mobile.

Logjika e grupeve të gjakut është te `aplikacioni/src/lib/gjaku.ts` (pa databazë). Faqja e detajeve tregon cilat grupe mund t’i dhurojnë marrësit, p.sh. për `AB-` → `O-, A-, B-, AB-`.

## Si e nis

```bash
cd aplikacioni
npm install
npm run dev
```

Hap `http://localhost:3000`.

## Prova 1 — Struktura dhe build

**Hapat:** `npm run build` në `aplikacioni/`.

**Rezultati real:** Build kaloi pa gabime TypeScript. Next.js gjeneroi `/` (statike) dhe `/kerkesa/[id]`, `/kerkesa/[id]/pergjigja` (dinamike).

## Prova 2 — Lista → detajet → kthimi

**Hapat:** Hap `/`, kliko “Shiko detajet” te kërkesa `O-` QKUK, pastaj “← Kthehu te lista”.

**Rezultati real:** _(plotëso pas provës në telefon: a përputhen grupi, spitali dhe dozat me kartën? a lexohet lista pa scroll horizontal?)_

## Prova 3 — ID e panjohur dhe simulimi

**Hapat:** Hap `/kerkesa/99`. Pastaj hap `/kerkesa/1` dhe kliko “Do të shkoj”.

**Rezultati real:** _(plotëso: `/kerkesa/99` duhet të tregojë “Kërkesa nuk u gjet”; ekrani i pritjes duhet të thotë qartë “Simulim”.)_

## Ndihma nga AI

Claude (Anthropic) ndihmoi me strukturën e faqeve dhe CSS-in. Kodin e kam lexuar dhe mund ta shpjegoj; provat në telefon i bëj vetë.
