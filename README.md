# 🩸 DhuroGjak — Dhuro gjak, shpëto jetë

PWA (Progressive Web App) që lidh pacientët që kanë nevojë urgjente për gjak me dhuruesit vullnetarë që kanë **grup të përputhshëm**, janë **afër** dhe **lejohen të dhurojnë** (90 ditë meshkujt / 120 ditë femrat nga dhurimi i fundit).

> Projekt për lëndën **Programimi për Pajisje Mobile** (AAB, 2026/2027). I ndërtuar javë pas jave sipas planit të lëndës, me të njëjtën strukturë si projekti RideShare: Next.js + Neon + Vercel.

## Si funksionon

1. **Dhuruesi** hyn dhe plotëson profilin: emri, telefoni, qyteti, gjinia, grupi i gjakut, data e dhurimit të fundit, njoftimet.
2. **Kërkuesi** poston: “Urgjent: nevojitet gjak O- në QKUK Prishtinë, 2 doza, deri sot në 18:00”.
3. Aplikacioni gjen dhuruesit e përputhshëm (grupi + qyteti/fqinjët + koha) dhe i **njofton** (në aplikacion + push opsional).
4. Dhuruesi shtyp **“Do të shkoj”** → kërkuesi sheh “**1 nga 2 dhurues u gjet ✅**” (live, çdo 5 s).
5. Kërkuesi **konfirmon dhurimin** → kur mbushen dozat kërkesa bëhet “Përfunduar”; dhuruesi **bllokohet automatikisht** 3–4 muaj.

Ekstra: 🏅 distinktivat (Dhuruesi i parë, Dhurues i rregullt, Hero, Legjendë) · 📍 qendrat e transfuzionit sipas distancës · 📅 kujtuesi “Tani mund të dhuroni përsëri!” · 📊 statistikat “Këtë muaj u ndihmuan X pacientë” · 📴 lexim offline.

**Pa pagesa.** Dhurimi i gjakut është vullnetar dhe falas (OBSH). Aplikacioni refuzon kërkesat që përmendin pagesë.

## Teknologjitë

| | |
|---|---|
| Frontend + server | Next.js 16 (App Router), React 19, TypeScript, CSS |
| Databaza | PostgreSQL në **Neon** (`@neondatabase/serverless`) |
| Hyrja | NextAuth + GitHub (Google opsional) |
| PWA | `manifest.ts`, `public/sw.js`, `public/offline.html` |
| Njoftimet | Tabela `njoftimet` + Web Push (`web-push`, VAPID) |
| Publikimi | **Vercel** (+ Vercel Cron për kujtuesit) |
| Testet / CI | `node --test` (20 teste), ESLint, GitHub Actions |

## Struktura

```
.
├── exit-ticket.md, prd.md          # Java 1
├── java-02.md … java-14.md         # raportet javore
├── skica.svg                       # Java 2 (bëj edhe skica.jpg me dorë)
├── .github/workflows/ci.yml        # Java 14 — CI
└── aplikacioni/                    # projekti Next.js
    ├── schema.sql … schema-java12.sql, schema-plote.sql
    ├── public/  (sw.js, offline.html, icons/)
    ├── tests/   (rregullat, gjaku, validimi)
    └── src/
        ├── app/         # faqet, server actions, API
        ├── components/  # KartaKerkeses, DoTeShkoj, LiveRifreskim, Qendrat, …
        └── lib/         # gjaku.ts, rregullat.ts, validimi.ts, kerkesat.ts, pergjigjet.ts, njoftimet.ts, …
```

## Nisja lokale

Kërkon **Node.js 24** dhe një databazë **Neon** falas.

```bash
cd aplikacioni
npm install
cp .env.example .env.local      # plotëso vlerat (shih më poshtë)
npm run dev                     # http://localhost:3000
```

1. **Neon:** krijo projekt → kopjo connection string te `DATABASE_URL` → hap **SQL Editor** dhe ekzekuto `aplikacioni/schema-plote.sql`.
2. **GitHub OAuth:** github.com → Settings → Developer settings → OAuth Apps → New. Callback: `http://localhost:3000/api/auth/callback/github`. Vendos `GITHUB_ID`, `GITHUB_SECRET`, `NEXTAUTH_SECRET` (`npx auth secret` ose `openssl rand -base64 32`), `NEXTAUTH_URL=http://localhost:3000`.
3. **Push (opsional):** `npx web-push generate-vapid-keys` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

`.env.local` **nuk** hyn në git. Asnjë sekret nuk është në repository.

> **Antivirus (p.sh. Avast Web Shield) dhe “fetch failed / UNABLE_TO_VERIFY_LEAF_SIGNATURE”:** antivirusi e inspekton HTTPS-in dhe e zëvendëson certifikatën e Neon me të vetën. Prandaj `npm run dev` e nis Next.js me `node --use-system-ca`, që Node të besojë certifikatat e Windows-it. Mos përdor `NODE_TLS_REJECT_UNAUTHORIZED=0`, sepse e çaktivizon sigurinë TLS.

## Komandat

```bash
npm test         # 20 teste automatike
npm run lint     # ESLint
npm run build    # build production
```

## Publikimi në Vercel

1. Bëj push repository-n në GitHub.
2. vercel.com → **Add New → Project** → zgjidh repository-n → **Root Directory: `aplikacioni`**.
3. **Storage → Neon** (ose vendos `DATABASE_URL` vetë) dhe ekzekuto `schema-plote.sql`.
4. **Settings → Environment Variables:** `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://<projekti>.vercel.app`, `GITHUB_ID`, `GITHUB_SECRET`, (opsionale) VAPID dhe `CRON_SECRET`.
5. Krijo një OAuth App të dytë në GitHub me callback `https://<projekti>.vercel.app/api/auth/callback/github`.
6. **Deploy.** Çdo push në `main` publikohet automatikisht (CD).

## Siguria dhe privatësia

- Grupi i gjakut dhe telefoni nuk shfaqen publikisht; telefoni zbulohet vetëm pas pranimit.
- Serveri kontrollon hyrjen, pronësinë dhe rregullat në çdo shkrim (edhe në SQL).
- Bllokim transaksioni kundër mbirezervimit; `UNIQUE` kundër dyfishimeve; kufizim 3 kërkesa aktive / 5 në 24 orë.
- CSP, X-Frame-Options, Permissions-Policy, HSTS.
- Vendndodhja llogaritet në telefon dhe nuk dërgohet në server.

## Kufizimet e njohura

- Koordinatat e qendrave janë të përafërta — duhen verifikuar para përdorimit real.
- Dhurimi konfirmohet nga kërkuesi, jo nga spitali (verifikimi zyrtar kërkon partneritet).
- Push në iPhone punon vetëm kur aplikacioni është shtuar në ekranin kryesor (iOS 16.4+).
- Polling-u (5 s) është i thjeshtë; për shumë përdorues njëkohësisht SSE/WebSocket do të ishte më efikas.

## Ndihma nga AI

Kodi dhe dokumentet u ndërtuan me ndihmën e Claude (Anthropic). Çdo raport javor ka seksionin “Ndihma nga AI”. Provat në telefon dhe me llogari reale i kryen studenti; rezultatet që ende nuk janë provuar janë shënuar “_(plotëso)_”.
