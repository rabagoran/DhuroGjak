# DhuroGjak — Java 11: Njoftimet dhe angazhimi

## Çfarë ndërtova

### 1. Njoftimet në aplikacion (funksionojnë gjithmonë)
Tabela `njoftimet` (`aplikacioni/schema-java11.sql`) dhe `aplikacioni/src/lib/njoftimet.ts`:

| Ngjarja | Kush njoftohet | Teksti (shembull) |
|---|---|---|
| Kërkesë e re | Dhuruesit e **përputhshëm**: grup i përshtatshëm + qytet i njëjtë/fqinj + kanë kaluar 90/120 ditë + njoftimet aktive | “URGJENTE: nevojitet gjak O- në QKUK Prishtinë, 2 doza, sot deri në 18:00.” |
| Dhuruesi pranon | Kërkuesi | “Dreni po vjen… **1 nga 2 dhurues u gjet**.” |
| Dhuruesi anulon | Kërkuesi | “…nuk mund të vijë më. Kërkesa është sërish e hapur.” |
| Dhurimi konfirmohet | Dhuruesi | “Faleminderit! … distinktivi: 🩸 Dhuruesi i parë.” |
| Mbaron pushimi | Dhuruesi | “📅 Tani mund të dhuroni përsëri!” (Vercel Cron, çdo ditë 07:00 UTC) |

- **Zilja 🔔** në shiritin e sipërm tregon numrin e palexuarave (`/api/njoftimet/numri`).
- **`/njoftimet`**: lista; çdo njoftim lidhet me **kërkesën e saktë** (`/kerkesa/{id}`).
- Hapja e kërkesës i **shënon si të lexuara** njoftimet e saj; ka edhe “Shëno të gjitha si të lexuara”.
- Pa dyfishime: indeks unik `(perdoruesi_id, kerkesa_id) WHERE lloji = 'kerkese_e_re'`; kujtuesi një herë në ditë.
- Pas postimit, kërkuesi sheh: “**U njoftuan N dhurues** të përputhshëm afër spitalit 🔔”.
- Dhuruesi i bllokuar (pas dhurimit) **nuk** merr njoftime deri në mbarim të pushimit.

### 2. Push në telefon (opsional)
- `aplikacioni/src/components/NjoftimetPush.tsx` në `/profili`: leja kërkohet **vetëm pas klikimit** “Aktivizo njoftimet në telefon”; mund të çaktivizohet.
- `aplikacioni/src/lib/push.ts` me `web-push` dhe çelësa VAPID; abonimet e skaduara (404/410) fshihen vetë.
- `aplikacioni/public/sw.js`: `push` → `showNotification`; `notificationclick` → hap kërkesën.
- Pa çelësa VAPID, push thjesht çaktivizohet dhe **aplikacioni punon pa të**.

## Konfigurimi (hapat që bën ti)

1. Ekzekuto `aplikacioni/schema-java11.sql` në Neon.
2. Push (opsional): `npx web-push generate-vapid-keys` → vendos `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` në `.env.local` (dhe më vonë në Vercel).
3. Kujtuesi: vendos `CRON_SECRET` (varg i gjatë i rastësishëm) në Vercel. `aplikacioni/vercel.json` e regjistron cron-in.

## Provat

1. **Njoftimi kur pranohet:** A poston kërkesë; B (dhurues i përputhshëm) pranon. A sheh 🔔 1 dhe “1 nga 2 dhurues u gjet”. A klikon njoftimin → hapet kërkesa e saktë → zilja bie në 0.
   **Rezultati real:** _(plotëso)_
2. **Përputhja:** B ndryshon grupin në A+ dhe A poston kërkesë të re O- → B **nuk** merr njoftim. Ktheje B në O-.
   **Rezultati real:** _(plotëso)_
3. **Njoftime të përsëritura:** B pranon dy kërkesa të ndryshme → A merr dy njoftime, secili hap kërkesën e vet.
   **Rezultati real:** _(plotëso)_
4. **Push (opsional):** në Chrome Android, “Aktivizo njoftimet” → Allow → mbyll aplikacionin → A poston kërkesë → njoftimi shfaqet; klikimi hap kërkesën.
   **Rezultati real:** _(plotëso)_

`npm run build` kaloi pa gabime.

## Ndihma nga AI

Claude ndihmoi me SQL-në e përputhjes, push-in dhe service worker-in. Provat me dy llogari dhe në telefon i bëj vetë.
