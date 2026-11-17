# DhuroGjak — Java 7: A funksionon aplikacioni për përdoruesin?

## Kontrolli i MVP-së

Deri në Java 6 “Do të shkoj” ishte simulim. Këtë javë e lidha rrjedhën kryesore me serverin, fund e krye:

1. Dhuruesi shtyp **“Do të shkoj”** → rresht në tabelën `pergjigjet` (Neon).
2. Numëruesi **“X nga Y dhurues”** llogaritet nga databaza (`pranuar`).
3. Dhuruesi sheh **telefonin e kërkuesit**; kërkuesi sheh **emrin dhe telefonin e dhuruesit** — vetëm pas pranimit.
4. Kërkuesi shtyp **“Konfirmo dhurimin”** → dhuruesi merr `dhurimi_fundit = sot`, `dhurime + 1` dhe **bllokohet automatikisht** 90/120 ditë.
5. Kur dhurimet mbulojnë dozat → kërkesa bëhet **“Përfunduar”** automatikisht.
6. Profili tregon “📅 Tani mund të dhuroni përsëri!” ose datën e lejimit, numrin e dhurimeve dhe **distinktivat** (Dhuruesi i parë, Dhurues i rregullt, Hero, Legjendë).

## Skedarët

- `aplikacioni/schema-java07.sql` — tabela `pergjigjet` me `UNIQUE (kerkesa_id, dhuruesi_id)`.
- `aplikacioni/src/lib/rregullat.ts` — `vendosPergjigjen()`: funksion i pastër që vendos `ok / hyr / profili / pronar / mbyllur / plot / grupi / bllokuar / ekziston`.
- `aplikacioni/src/lib/pergjigjet.ts` — shkrimi në Neon; konfirmimi është **një deklaratë SQL atomike** (CTE) që përditëson përgjigjen, dhuruesin dhe kërkesën njëherësh.
- `aplikacioni/src/app/kerkesa/actions.ts` — `doTeShkoj`, `anuloPjesemarrjen`, `konfirmoDhurimInAction`.
- `aplikacioni/src/app/kerkesa/[id]/page.tsx` — pamja e dhuruesit dhe e pronarit.
- `aplikacioni/src/app/kerkesa/[id]/pergjigja/page.tsx` — “Faleminderit!” me kontaktin (jo më simulim).
- `aplikacioni/src/components/StatusiDhuruesit.tsx` — statusi, statistikat personale dhe distinktivat.

## Parashikim → provë → rregullim

| # | Hyrja e ndryshuar | Parashikimi im | Çfarë pashë realisht |
|---|---|---|---|
| 1 | Dhuruesi O- pranon kërkesën O- (2 doza) | “1 nga 2 dhurues”, shfaqet telefoni i kërkuesit | _(plotëso)_ |
| 2 | Dhuruesi A+ hap kërkesën O- | Butoni i çaktivizuar: “Grupi yt nuk përputhet” | _(plotëso)_ |
| 3 | Pronari konfirmon dhuruesin, pastaj dhuruesi hap një kërkesë tjetër | Dhuruesi sheh “Nuk ka kaluar koha e pritjes”; profili tregon datën e lejimit | _(plotëso)_ |

**Si i bëj provat me dy llogari:** llogaria A (kërkuesi) në Chrome normal, llogaria B (dhuruesi) në dritare Incognito ose shfletues tjetër (GitHub + Google).

## Dy probleme të vëzhguara dhe një rregullim

1. **Problemi:** Pas gabimit të validimit në profil, React e rivendos formularin dhe fushat e shkruara humbnin.
   **Rregullimi:** Server action kthen `vlerat` e dërguara dhe formulari i përdor si `defaultValue` (`FormaProfilit.tsx`, `FormaKerkeses.tsx`).
2. **Problemi i dytë (për t’u vëzhguar):** _(plotëso pas provës — p.sh. a duket qartë butoni “Konfirmo dhurimin” në telefon?)_

## Dy versione që funksionojnë

- Versioni i Java 6: commit `Java 6: PWA, service worker…` (simulim).
- Versioni i Java 7: ky commit (rrjedha reale).

## Ndihma nga AI

Claude ndihmoi me SQL-në atomike dhe rregullat e përputhjes. Provat me dy llogari i bëj vetë.
