# DhuroGjak — Java 8: Sensorët dhe Device APIs (Geolocation)

## Përmbledhja

Shtova faqen **📍 Qendrat e transfuzionit** (`/qendrat`). Dhuruesi shtyp **“Përdor vendndodhjen time”** dhe qendrat renditen sipas distancës (formula Haversine). Nëse leja refuzohet, koha mbaron ose shfletuesi s’e mbështet, dhuruesi **zgjedh qytetin** dhe renditja funksionon njësoj. Qendra e zgjedhur shfaqet në hartë (OpenStreetMap, pa librari) me lidhjet “Hape në hartë” dhe “Udhëzimet”.

## Privatësia

- Leja kërkohet **vetëm pas klikimit**; faqja nuk pyet gjatë hapjes.
- Koordinatat **mbeten në telefon** — llogaritja bëhet në klient dhe nuk dërgohen në server ose në URL.
- Në GitHub nuk ka adresa reale personale; qendrat janë institucione publike me koordinata të përafërta.

## Skedarët

- `aplikacioni/src/components/Qendrat.tsx` — butoni, gjendjet `idle / loading / success / denied / timeout / unavailable`, zgjedhja manuale, harta.
- `aplikacioni/src/lib/qendrat.ts` — lista e qendrave, qendrat e qyteteve, `distancaKm()` dhe `renditSipasDistances()`.
- `aplikacioni/src/app/qendrat/page.tsx` — faqja.
- Ekrani “Faleminderit” (Java 7) lidhet te `/qendrat`.

Identifikuesit për testim automatik: `locate-me`, `location-status` (me `data-state`), `city-select`, `location-source`.

## Sjelljet

| Rasti | Çfarë ndodh |
|---|---|
| Lejo | “U renditën sipas distancës nga ti.”, saktësia në metra, qendra më e afërt në hartë |
| Refuzo (`code 1`) | “Leja u refuzua. Zgjidh qytetin tënd më poshtë.” — butoni mbetet i përdorshëm |
| Timeout (`code 3`) | “Koha mbaroi. Provo sërish ose zgjidh qytetin.” |
| Pa API / `code 2` | “…nuk e mbështet / nuk është e disponueshme. Zgjidh qytetin.” |
| Zgjedhja manuale | Distancat nga qendra e qytetit; p.sh. Pejë → Spitali Rajonal Pejë i pari |

## Provat

### Prova 1 — Leja pranohet
**Hapat:** Hap `/qendrat` në telefon (HTTPS ose localhost), shtyp butonin, kliko “Allow”.
**Pritshmëria:** Lista renditet, qendra më e afërt shfaqet në hartë.
**Rezultati real:** _(plotëso — përdor koordinata fiktive në DevTools → Sensors → Location, p.sh. Prishtinë 42.66, 21.16)_

### Prova 2 — Leja refuzohet
**Hapat:** Blloko lejen, shtyp butonin, pastaj zgjidh “Prizren”.
**Pritshmëria:** Mesazhi i refuzimit; pas zgjedhjes, Prizren është i pari.
**Rezultati real:** _(plotëso)_

### Prova 3 — Ndryshimi i hyrjes
**Hapat:** Zgjidh “Gjilan”, pastaj “Mitrovicë”.
**Parashikimi:** E para Gjilan, pastaj Mitrovicë në krye; “Distancat llogariten nga” ndryshon.
**Rezultati real:** _(plotëso)_

## Ndihma nga AI

Claude ndihmoi me komponentin dhe formulën e distancës. Provat me leje reale i bëj vetë në telefon.
