-- Java 12 · Kufizime shtesë në databazë (mbrojtja e fundit, edhe nëse kodi gabon).
ALTER TABLE kerkesat DROP CONSTRAINT IF EXISTS kerkesat_telefoni_check;
ALTER TABLE kerkesat ADD CONSTRAINT kerkesat_telefoni_check
  CHECK (telefoni_kontaktit IS NULL OR telefoni_kontaktit ~ '^\+?[0-9]{8,15}$');

ALTER TABLE perdoruesit DROP CONSTRAINT IF EXISTS perdoruesit_emri_check;
ALTER TABLE perdoruesit ADD CONSTRAINT perdoruesit_emri_check CHECK (char_length(emri) BETWEEN 1 AND 80);

-- Afati nuk mund të jetë më shumë se 14 ditë pas krijimit.
ALTER TABLE kerkesat DROP CONSTRAINT IF EXISTS kerkesat_afati_check;
ALTER TABLE kerkesat ADD CONSTRAINT kerkesat_afati_check CHECK (afati <= krijuar_ne + INTERVAL '14 days');

-- Kontroll: asnjë kërkesë me më shumë dhurues aktivë se dozat (duhet 0 rreshta).
SELECT k.id, k.dozat, COUNT(p.*) AS pranuar
FROM kerkesat k JOIN pergjigjet p ON p.kerkesa_id = k.id AND p.statusi IN ('do_shkoj','dhuroi')
GROUP BY k.id HAVING COUNT(p.*) > k.dozat;
