# PRD — DhuroGjak

> Product Requirements Document (Dokumenti i kërkesave të produktit) · Programimi për Pajisje Mobile 2026/2027

## 1. Përmbledhja

**DhuroGjak** lidh njerëzit që kanë nevojë urgjente për gjak me dhuruesit vullnetarë që kanë **grup gjaku të përputhshëm**, janë **në të njëjtin qytet ose afër**, dhe **lejohen të dhurojnë** sipas kohës nga dhurimi i fundit. Aplikacioni është PWA (Progressive Web App), punon në telefon dhe mund të instalohet në ekranin kryesor.

Dhurimi i gjakut është **falas dhe vullnetar**, siç e rekomandon Organizata Botërore e Shëndetësisë. Aplikacioni nuk ka asnjë pagesë mes përdoruesve.

## 2. Problemi

- Postimet në rrjete sociale arrijnë te njerëz me grup të gabuar ose në qytet tjetër.
- Dhuruesi nuk e di gjithmonë nëse ka kaluar koha e mjaftueshme nga dhurimi i fundit.
- Familja nuk e di sa dhurues janë nisur realisht drejt spitalit.
- Numrat e telefonit publikohen haptazi dhe keqpërdoren.

## 3. Përdoruesit

| Përdoruesi | Nevoja | Shembull |
|---|---|---|
| Kërkuesi | Të gjejë shpejt dhurues të përshtatshëm dhe të dijë sa janë nisur | Arta ka babain në QKUK dhe nevojiten 2 doza O- deri në 18:00 |
| Dhuruesi | Të njoftohet vetëm kur mund të ndihmojë realisht | Dreni ka O-, jeton në Prishtinë dhe dhuroi 5 muaj më parë |
| Administratori | Të moderojë kërkesat e rreme | Stafi i projektit / partneri |

## 4. Rrjedha kryesore

1. Dhuruesi hyn dhe plotëson profilin: emri, telefoni, qyteti, gjinia, grupi i gjakut, data e dhurimit të fundit, njoftimet aktive.
2. Kërkuesi poston kërkesë: grupi, spitali, qyteti, dozat, afati, telefoni i kontaktit.
3. Aplikacioni gjen dhuruesit që:
   - kanë grup të përputhshëm (O- i jep të gjithëve, AB+ merr nga të gjithë);
   - janë në të njëjtin qytet ose në një qytet fqinj;
   - kanë kaluar **90 ditë (meshkujt)** ose **120 ditë (femrat)** nga dhurimi i fundit.
4. Këta dhurues marrin njoftim në aplikacion (dhe push, nëse e kanë lejuar).
5. Dhuruesi shtyp **“Do të shkoj”**; kërkuesi sheh “1 nga 2 dhurues u gjet ✅”.
6. Pas dhurimit, kërkuesi konfirmon dhuruesin. Kur mbushen dozat, kërkesa bëhet **“Përfunduar”**.
7. Dhuruesi bllokohet automatikisht për 90/120 ditë dhe nuk merr njoftime gjatë asaj kohe.

## 5. MVP (veçoritë që duhen)

1. Lista publike e kërkesave aktive dhe detajet e çdo kërkese (pa të dhëna private).
2. Hyrja dhe profili i dhuruesit me grupin e gjakut dhe datën e dhurimit të fundit.
3. Postimi i kërkesës dhe përputhja automatike (grupi + qyteti + koha).
4. Butoni “Do të shkoj” dhe numëruesi “X nga Y dhurues”.
5. Konfirmimi i dhurimit dhe bllokimi automatik 90/120 ditë.

## 6. Ekstra (pas MVP)

- 🏅 Profili me numrin e dhurimeve dhe distinktivat (“Dhuruesi i parë”, “Dhurues i rregullt”, “Hero”, “Legjendë”).
- 📍 Qendrat e transfuzionit me distancën nga vendndodhja ime (pas klikimit).
- 📅 Kujtues: “Tani mund të dhuroni përsëri!”
- 📊 Statistikat: “Këtë muaj u ndihmuan 45 pacientë”.
- 🔔 Njoftime push në telefon (opsionale).
- 📴 Lexim offline i listës publike.

## 7. Jashtë MVP-së

- Shpërblimet nga partnerët (kërkojnë marrëveshje dhe verifikim nga spitali).
- Integrimi me sistemin e Qendrës Kombëtare të Transfuzionit të Gjakut.
- Chat mes kërkuesit dhe dhuruesit.

## 8. Privatësia dhe siguria

- Grupi i gjakut është **e dhënë shëndetësore**; nuk shfaqet publikisht për dhuruesit.
- Telefoni i dhuruesit shfaqet **vetëm te kërkuesi** dhe **vetëm pasi dhuruesi pranon** kërkesën.
- Telefoni i kërkuesit shfaqet vetëm te dhuruesi që ka shtypur “Do të shkoj”.
- `DATABASE_URL` dhe sekretet ruhen vetëm në server (Vercel Environment Variables).
- Serveri kontrollon gjithmonë hyrjen, pronësinë dhe rolin para çdo shkrimi në databazë.

## 9. Modeli i qëndrueshmërisë (pa pagesë mes përdoruesve)

- **Sponsorë:** kompani që shfaqen si “Mbështetës” në aplikacion.
- **Partneritete:** Kryqi i Kuq, spitalet, komunat, Qendra Kombëtare e Transfuzionit të Gjakut.
- **Grante:** OJQ, BE dhe programe për shëndetësi digjitale.
- **Shpërblime jo-monetare:** zbritje ose kafe falas nga partnerët pas dhurimit.

## 10. Teknologjitë

| Shtresa | Zgjedhja | Pse |
|---|---|---|
| Frontend + server | Next.js (App Router), React, TypeScript | E njëjta si në RideShare; server components dhe server actions |
| PWA | `manifest.ts`, `sw.js`, `offline.html` | Instalim në telefon dhe lexim offline |
| Databaza | PostgreSQL në Neon (`@neondatabase/serverless`) | Falas, serverless, lidhet me Vercel |
| Hyrja | NextAuth + GitHub (Google opsional) | Identitet i verifikuar pa ruajtur fjalëkalime |
| Njoftimet | Tabela `njoftimet` + Web Push (VAPID) | Njoftim në aplikacion; push opsional |
| Publikimi | Vercel | Deploy automatik nga GitHub, variabla private |

## 11. Si testohet

- Testet automatike për përputhjen e grupeve, kohën e pritjes dhe distinktivat (`npm test`).
- `npm run build` pa gabime.
- Prova në telefon: lista pa scroll horizontal, offline, leja e vendndodhjes, njoftimet.
- Prova me dy llogari: kërkuesi dhe dhuruesi shohin të njëjtin numërues brenda 5 sekondave.

## 12. Metrikat e suksesit

- Koha nga postimi i kërkesës deri te dhuruesi i parë që pranon.
- Përqindja e kërkesave që përfundojnë para afatit.
- Numri i dhuruesve aktivë për qytet dhe grup gjaku.
