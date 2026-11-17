# DhuroGjak — Java 9: Gjendja dhe ndërfaqja optimiste

## Çfarë ndërtova

Butoni **“❤ Do të shkoj”** tani është optimist (`aplikacioni/src/components/DoTeShkoj.tsx`):

1. Pas klikimit, numëruesi **“X nga Y dhurues”** rritet **menjëherë** dhe butoni tregon **“Po dërgohet…”** (i çaktivizuar, `aria-busy`).
2. Server action `doTeShkojOptimist()` (`aplikacioni/src/app/kerkesa/actions.ts`) e ruan përgjigjen në Neon dhe kthen numrin real dhe kontaktin e kërkuesit.
3. **Sukses:** shfaqet “Ke pranuar këtë kërkesë ✅” me telefonin e kërkuesit; `router.refresh()` e sinkronizon faqen me serverin.
4. **Gabim:** numëruesi **kthehet** në vlerën e mëparshme, shfaqet mesazhi dhe butoni bëhet **“↻ Provo përsëri”**. Asnjë sukses i rremë.

## Pse nuk krijohen dyfishime

- Klikimet gjatë pritjes injorohen në klient (`gjendja === "duke"`).
- Në databazë: `UNIQUE (kerkesa_id, dhuruesi_id)` + `ON CONFLICT` — edhe dy kërkesa paralele krijojnë vetëm një rresht.
- `INSERT … SELECT … WHERE COUNT(*) < dozat` nuk lejon më shumë dhurues se dozat.

## Simulimi i gabimit

Në `aplikacioni/.env.local` vendos `SIMULO_GABIM_PERGJIGJE=1` dhe rinise `npm run dev`. Serveri kthen gabim **para** shkrimit në databazë. Ktheje në `0` pas provës. Mos e vendos në Vercel.

## Provat

1. **Suksesi dhe rifreskimi:** pranoj një kërkesë → numëruesi rritet menjëherë → konfirmimi. Rifresko: “Ke pranuar këtë kërkesë ✅” mbetet.
   **Rezultati real:** _(plotëso)_
2. **Gabimi dhe rikthimi:** me simulimin aktiv, kliko → “1 nga 2” për një çast → kthehet “0 nga 2” dhe “Nuk u ruajt… provo përsëri.” Pastaj çaktivizo simulimin dhe “↻ Provo përsëri” → sukses.
   **Rezultati real:** _(plotëso)_
3. **Klikime të përsëritura:** kliko 5 herë shpejt. Në Neon:
   ```sql
   SELECT kerkesa_id, dhuruesi_id, COUNT(*) FROM pergjigjet GROUP BY 1, 2 HAVING COUNT(*) > 1;
   ```
   duhet të kthejë **0 rreshta**.
   **Rezultati real:** _(plotëso)_

`npm run build` kaloi pa gabime.

## Ndihma nga AI

Claude ndihmoi me gjendjet e komponentit optimist. Provat me simulimin i bëj vetë.
