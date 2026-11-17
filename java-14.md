# DhuroGjak — Java 14: Testimi dhe CI/CD

## Testet automatike

`npm test` ekzekuton **20 teste** me test runner-in e integruar të Node.js (`node --test`, TypeScript pa build). Logjika e biznesit është në funksione të pastra (pa databazë), prandaj testohet shpejt dhe në mënyrë të përsëritshme.

| Skedari | Çfarë teston |
|---|---|
| `aplikacioni/tests/rregullat.test.ts` | Tri rastet e kërkuara: **(a) kërkesë e suksesshme** → `ok`; **(b) pa vende** (dozat të mbuluara) → `plot`; **(c) pa leje** (pa hyrje → `hyr`, kërkuesi te kërkesa e vet → `pronar`). Plus: grup i papërputhshëm, bllokim 90/120 ditë, kërkesë e mbyllur/skaduar, profil i paplotë, pranim i dyfishtë |
| `aplikacioni/tests/gjaku.test.ts` | Tabela e përputhshmërisë (O- i jep të gjithëve, AB+ merr nga të gjithë, Rh+ ≠ Rh-), koha e pritjes, përputhja grup+qytet+kohë+njoftime, distinktivat, renditja shqipe |
| `aplikacioni/tests/validimi.test.ts` | Normalizimi i telefonit, validimi i profilit dhe kërkesës, dozat 1–10, afati 30 min–14 ditë, refuzimi i ofertave me para dhe i lidhjeve |

Përveç këtyre, SQL-ja u verifikua në PostgreSQL lokal (PGlite) me 21 kontrolle (shih `java-12.md`).

### Rezultati real

```
ℹ tests 20
ℹ pass 20
ℹ fail 0
```

**Gabime që testet i gjetën dhe i rregullova:**
1. Filtri “gjaku nuk shitet” **nuk e kapte “pagesë”** — `\b` në regex nuk i njeh shkronjat shqipe (ë, ç). U zëvendësua me kufij Unicode (`\p{L}`, flag `u`) në `src/lib/validimi.ts`. Testi tani kontrollon edhe që “shesi” të mos refuzohet gabimisht.
2. Pritja ime për renditjen “Gjakovë/Graçanicë” ishte e gabuar: në alfabetin shqip **gj** është shkronjë më vete pas **g**, pra Graçanicë vjen e para. Kodi ishte i saktë; korrigjova testin.

### Lint dhe build

- `npm run lint`: ESLint (Next core-web-vitals + TypeScript) — **0 gabime** pasi rregullova tri vërejtje të React Compiler: `setState` brenda `useEffect` (`DoTeShkoj.tsx`, `NjoftimetPush.tsx`) dhe `Date.now()` gjatë render-it (`FormaKerkeses.tsx`).
- `npm run build`: **kaloi** pa gabime TypeScript.

## CI/CD

- **CI:** `.github/workflows/ci.yml` — në çdo push/PR: `npm ci` → `npm run lint` → `npm test` → `npm run build` (Node 24).
- **CD:** Vercel e lidh repository-n dhe publikon automatikisht `main`; PR-të marrin “Preview Deployment”.
- **Variablat private** vendosen vetëm në Vercel → Settings → Environment Variables. Lista e plotë është në `aplikacioni/.env.example` (pa vlera reale).

## Publikimi në Vercel (hapat që bën ti)

Udhëzimi i plotë është te `README.md → Publikimi në Vercel`. Shkurt: Root Directory `aplikacioni` → Neon nga Storage → `schema-plote.sql` → variablat → OAuth App me callback-un e Vercel → Deploy.

## Kontrolli në telefon me lidhjen publike

| Hapi | Rezultati real |
|---|---|
| Hap `https://<projekti>.vercel.app` në telefon | _(plotëso)_ |
| Hyr me GitHub, plotëso profilin | _(plotëso)_ |
| Posto kërkesë nga llogaria e dytë; njoftimi arrin | _(plotëso)_ |
| “Do të shkoj” → “1 nga 2 dhurues u gjet ✅” te kërkuesi | _(plotëso)_ |
| Konfirmo dhurimin → dhuruesi i bllokuar, distinktivi | _(plotëso)_ |
| Instalo në ekranin kryesor dhe provo offline | _(plotëso)_ |

## Kufizimet e njohura

Shih `README.md → Kufizimet e njohura` (koordinatat e përafërta, konfirmimi nga kërkuesi e jo nga spitali, push në iOS, polling).

## Ndihma nga AI

Claude shkroi testet bashkë me mua, ekzekutoi lint/test/build dhe ndihmoi me CI-në. Publikimin në Vercel dhe provën në telefon i bëj vetë.
