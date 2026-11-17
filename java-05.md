# DhuroGjak — Java 5: Kush hyn? Kush mund ta ndryshojë kërkesën?

## Çfarë ndërtova

- **Hyrja:** NextAuth me GitHub (Google opsional, aktivizohet vetëm nëse vendos `GOOGLE_ID`/`GOOGLE_SECRET`). ID e përdoruesit në sesion është `github:12345` ose `google:…`.
- **Tabela `perdoruesit`** në Neon: emri, telefoni, qyteti, gjinia, grupi i gjakut, data e dhurimit të fundit, njoftimet, numri i dhurimeve, roli (`perdorues` / `admin`).
- **Profili i dhuruesit** (`/profili`): formulari me validim në server (`src/lib/validimi.ts`). ID merret nga sesioni, kurrë nga formulari.
- **Postimi i kërkesës** (`/kerkesa/e-re`): kërkon hyrje; kërkesa ruan `krijuar_nga` dhe `telefoni_kontaktit`.
- **Pronësia:** vetëm krijuesi (ose admini) mund ta shënojë kërkesën “Përfunduar” ose “Anuluar”. Kontrolli është në `WHERE` të SQL-së (`src/lib/kerkesat.ts → ndryshoStatusin`), jo vetëm në UI.
- **Kërkesat e mia** (`/kerkesa/e-mia`).

“Do të shkoj” mbetet **simulim**; ruajtja reale vjen në Java 7.

## Konfigurimi (hapat që bën ti)

1. Ekzekuto `aplikacioni/schema-java05.sql` në Neon SQL Editor.
2. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Kopjo **Client ID** dhe gjenero **Client secret**. Vendosi në `aplikacioni/.env.local`:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<rezultati i: npx auth secret   ose   openssl rand -base64 32>
   GITHUB_ID=...
   GITHUB_SECRET=...
   ```
4. Rinise `npm run dev`.

## Prova 1 — Hyrja, profili, rifreskimi, dalja

**Hapat:** Hap `/profili` pa hyrë → “Hyr me GitHub”. Plotëso profilin (p.sh. O-, Prishtinë, M) dhe ruaj. Rifresko faqen. Shtyp “Dil”.

**Rezultati real:** _(plotëso: a mbeti profili pas rifreskimit? a u shfaq rreshti në Neon me `SELECT * FROM perdoruesit;`?)_

## Prova 2 — Pronari mbyll kërkesën e vet

**Hapat:** Posto një kërkesë nga `/kerkesa/e-re`. Te detajet shtyp “Shëno Përfunduar”.

**Rezultati real:** _(plotëso: mesazhi “Kërkesa u shënua Përfunduar”, kërkesa zhduket nga lista, `statusi = 'perfunduar'` në Neon.)_

## Prova 3 — Veprimi pa leje refuzohet

**Hapat:** Hap kërkesën tënde aktive, në DevTools ndrysho `<input type="hidden" name="id">` në `1` (kërkesa e `demo:kerkuesi`) dhe shtyp “Shëno Përfunduar”.

**Rezultati real:** _(plotëso: duhet “Nuk ke leje për këtë kërkesë. Asgjë nuk ndryshoi.” dhe kërkesa 1 mbetet `aktive` në Neon.)_

**Validimi:** Provo profilin me telefon `abc` ose datë dhurimi në të ardhmen → shfaqen gabimet te fushat, dhe vlerat e shkruara nuk humbin.

**Build:** `npm run build` kaloi pa gabime.

## Privatësia

Grupi i gjakut dhe telefoni nuk shfaqen në asnjë faqe publike. Telefoni i kërkuesit dhe i dhuruesit do të zbulohen vetëm pas pranimit (Java 7).

## Ndihma nga AI

Claude ndihmoi me NextAuth, validimin dhe kontrollin e pronësisë. Konfigurimin e GitHub OAuth dhe provat i bëj vetë.
