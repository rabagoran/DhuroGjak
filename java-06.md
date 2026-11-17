# DhuroGjak — Java 6: Aplikacioni vazhdon edhe kur interneti ndalet

## Çfarë ndërtova

- **PWA:** `aplikacioni/src/app/manifest.ts` (emri, ngjyra `#b91c1c`, `display: standalone`) dhe ikonat `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (pika e gjakut e bardhë mbi të kuqe). Aplikacioni mund të instalohet në ekranin kryesor të telefonit.
- **API publike** `aplikacioni/src/app/api/kerkesat/route.ts`: kthen vetëm fushat publike (grupi, spitali, qyteti, dozat, afati, progresi). **Pa telefon, pa krijues.**
- **Service worker** `aplikacioni/public/sw.js`:
  - për `/api/kerkesat`: rrjeti i pari; kopjen e fundit e ruan në cache me kohën `x-dhurogjak-saved-at`; pa internet kthen kopjen me `x-dhurogjak-source: cache`;
  - për çdo faqe pa internet: shfaq `offline.html`.
- **`aplikacioni/public/offline.html`:** lista e ruajtur, koha e ruajtjes, “Rifresko listën”, rifreskim automatik kur kthehet interneti. Butoni “Do të shkoj” është i çaktivizuar.
- **`aplikacioni/src/components/Pwa.tsx`:** regjistron SW-në dhe shfaq shiritin “Je pa internet”.

## Pse kopja ≠ databaza

Kopja në cache është fotografi e listës në një moment. Pa internet nuk dimë nëse kërkesa është mbushur ose anuluar, prandaj aplikacioni **nuk lejon** “Do të shkoj” offline dhe e thotë qartë se lista mund të jetë e vjetër. Të dhënat private nuk hyjnë kurrë në cache.

## Prova 1 — Tri kartat pas rifreskimit pa internet

**Hapat:** Hap `/` me internet (SW instalohet dhe ruan listën). DevTools → Network → **Offline**. Rifresko faqen.

**Rezultati real:** _(plotëso: a u shfaq `offline.html` me kartat dhe “Lista e fundit e ruajtur”? cila ishte koha e ruajtjes?)_

## Prova 2 — Kthimi i internetit

**Hapat:** Në modalitetin offline, ndrysho `dozat` e një kërkese në Neon. Kthe **Online**.

**Rezultati real:** _(plotëso: lista rifreskohet vetë dhe tregon “Lista erdhi nga serveri.” me vlerën e re?)_

## Prova 3 — Pa kopje fare

**Hapat:** DevTools → Application → **Clear site data**, pastaj Offline dhe hap `/offline.html` nga cache-i i shfletuesit (ose instalimi i parë pa internet).

**Rezultati real:** _(plotëso: “Ende nuk ka listë të ruajtur…”)_

**Instalimi:** Në Chrome Android → menyja ⋮ → **Add to Home screen**. _(plotëso: a u hap si aplikacion më vete?)_

## Ndihma nga AI

Claude ndihmoi me service worker-in dhe ikonat (të gjeneruara me një skript Node). Provat offline i bëj vetë në telefon.
