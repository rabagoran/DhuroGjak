-- DhuroGjak · Skema e plotë (Java 4 → Java 12) për një databazë të re Neon.
-- Ekzekutoje një herë në Neon SQL Editor. Përmban edhe 3 kërkesa demo (fiktive).

-- ===== schema.sql =====
-- Java 4 · DhuroGjak · Ekzekuto në Neon SQL Editor.
-- Të dhëna fiktive për laboratorin.
CREATE TABLE IF NOT EXISTS kerkesat (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  grupi TEXT NOT NULL CHECK (grupi IN ('O-','O+','A-','A+','B-','B+','AB-','AB+')),
  spitali TEXT NOT NULL CHECK (char_length(spitali) BETWEEN 3 AND 120),
  qyteti TEXT NOT NULL,
  dozat INTEGER NOT NULL CHECK (dozat BETWEEN 1 AND 10),
  afati TIMESTAMPTZ NOT NULL,
  pershkrimi TEXT NOT NULL DEFAULT '' CHECK (char_length(pershkrimi) <= 500),
  urgjente BOOLEAN NOT NULL DEFAULT FALSE,
  statusi TEXT NOT NULL DEFAULT 'aktive' CHECK (statusi IN ('aktive','perfunduar','anuluar')),
  krijuar_ne TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kerkesat_statusi_afati_idx ON kerkesat (statusi, afati);

INSERT INTO kerkesat (grupi, spitali, qyteti, dozat, afati, pershkrimi, urgjente)
SELECT * FROM (VALUES
  ('O-',  'QKUK Prishtinë',           'Prishtinë', 2, NOW() + INTERVAL '5 hours',  'Pacient në kirurgji (shembull fiktiv).', TRUE),
  ('A+',  'Spitali Rajonal Pejë',     'Pejë',      3, NOW() + INTERVAL '26 hours', 'Operacion i planifikuar (shembull fiktiv).', FALSE),
  ('AB-', 'Spitali Rajonal Prizren',  'Prizren',   1, NOW() + INTERVAL '48 hours', 'Lindje me komplikime (shembull fiktiv).', FALSE)
) AS v(grupi, spitali, qyteti, dozat, afati, pershkrimi, urgjente)
WHERE NOT EXISTS (SELECT 1 FROM kerkesat);

SELECT id, grupi, spitali, qyteti, dozat, afati, statusi FROM kerkesat ORDER BY id;

-- ===== schema-java05.sql =====
-- Java 5 · Hyrja, profili i dhuruesit dhe pronësia e kërkesave.
-- Ekzekuto pas schema.sql në të njëjtën databazë Neon.
CREATE TABLE IF NOT EXISTS perdoruesit (
  id TEXT PRIMARY KEY,                       -- p.sh. "github:12345" (nga NextAuth)
  emri TEXT NOT NULL,
  telefoni TEXT CHECK (telefoni IS NULL OR telefoni ~ '^\+?[0-9]{8,15}$'),
  qyteti TEXT,
  gjinia TEXT CHECK (gjinia IN ('M','F')),
  grupi TEXT CHECK (grupi IN ('O-','O+','A-','A+','B-','B+','AB-','AB+')),
  dhurimi_fundit DATE CHECK (dhurimi_fundit IS NULL OR dhurimi_fundit <= CURRENT_DATE),
  njoftimet BOOLEAN NOT NULL DEFAULT TRUE,
  dhurime INTEGER NOT NULL DEFAULT 0 CHECK (dhurime >= 0),
  roli TEXT NOT NULL DEFAULT 'perdorues' CHECK (roli IN ('perdorues','admin')),
  krijuar_ne TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE kerkesat ADD COLUMN IF NOT EXISTS krijuar_nga TEXT REFERENCES perdoruesit(id);
ALTER TABLE kerkesat ADD COLUMN IF NOT EXISTS telefoni_kontaktit TEXT;
CREATE INDEX IF NOT EXISTS kerkesat_krijuar_nga_idx ON kerkesat (krijuar_nga);
CREATE INDEX IF NOT EXISTS perdoruesit_perputhja_idx ON perdoruesit (qyteti, grupi) WHERE njoftimet;

-- Pronar fiktiv për kërkesat demo: llogaria jote NUK mund t'i mbyllë ato (prova e refuzimit).
INSERT INTO perdoruesit (id, emri, telefoni, qyteti)
VALUES ('demo:kerkuesi', 'Kërkues demo', '38344000000', 'Prishtinë')
ON CONFLICT (id) DO NOTHING;

UPDATE kerkesat SET krijuar_nga = 'demo:kerkuesi', telefoni_kontaktit = '38344000000'
WHERE krijuar_nga IS NULL;

SELECT id, grupi, spitali, krijuar_nga FROM kerkesat ORDER BY id;

-- ===== schema-java07.sql =====
-- Java 7 · Përgjigjet “Do të shkoj” dhe konfirmimi i dhurimit.
-- Ekzekuto pas schema.sql dhe schema-java05.sql.
CREATE TABLE IF NOT EXISTS pergjigjet (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kerkesa_id BIGINT NOT NULL REFERENCES kerkesat(id) ON DELETE CASCADE,
  dhuruesi_id TEXT NOT NULL REFERENCES perdoruesit(id) ON DELETE CASCADE,
  statusi TEXT NOT NULL DEFAULT 'do_shkoj' CHECK (statusi IN ('do_shkoj','dhuroi','anuluar')),
  krijuar_ne TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  perditesuar_ne TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (kerkesa_id, dhuruesi_id)          -- një dhurues, një përgjigje për kërkesë
);
CREATE INDEX IF NOT EXISTS pergjigjet_kerkesa_idx ON pergjigjet (kerkesa_id, statusi);
CREATE INDEX IF NOT EXISTS pergjigjet_dhuruesi_idx ON pergjigjet (dhuruesi_id);

SELECT k.id, k.grupi, k.dozat,
       COUNT(p.*) FILTER (WHERE p.statusi IN ('do_shkoj','dhuroi')) AS pranuar
FROM kerkesat k LEFT JOIN pergjigjet p ON p.kerkesa_id = k.id
GROUP BY k.id ORDER BY k.id;

-- ===== schema-java11.sql =====
-- Java 11 · Njoftimet në aplikacion dhe abonimet push (opsionale).
CREATE TABLE IF NOT EXISTS njoftimet (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  perdoruesi_id TEXT NOT NULL REFERENCES perdoruesit(id) ON DELETE CASCADE,
  kerkesa_id BIGINT REFERENCES kerkesat(id) ON DELETE CASCADE,
  lloji TEXT NOT NULL CHECK (lloji IN ('kerkese_e_re','dhurues_vjen','dhuruesi_anuloi','dhurim_konfirmuar','kerkesa_perfundoi','kujtues')),
  teksti TEXT NOT NULL CHECK (char_length(teksti) <= 300),
  lexuar BOOLEAN NOT NULL DEFAULT FALSE,
  krijuar_ne TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS njoftimet_perdoruesi_idx ON njoftimet (perdoruesi_id, lexuar, krijuar_ne DESC);
-- Një dhurues merr vetëm një njoftim “kërkesë e re” për të njëjtën kërkesë.
CREATE UNIQUE INDEX IF NOT EXISTS njoftimet_kerkese_e_re_uniq ON njoftimet (perdoruesi_id, kerkesa_id) WHERE lloji = 'kerkese_e_re';
-- Kujtuesi dërgohet një herë në ditë.
CREATE UNIQUE INDEX IF NOT EXISTS njoftimet_kujtues_uniq ON njoftimet (perdoruesi_id, ((krijuar_ne AT TIME ZONE 'UTC')::date)) WHERE lloji = 'kujtues';

CREATE TABLE IF NOT EXISTS push_abonimet (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  perdoruesi_id TEXT NOT NULL REFERENCES perdoruesit(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  krijuar_ne TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS push_abonimet_perdoruesi_idx ON push_abonimet (perdoruesi_id);

SELECT lloji, COUNT(*) FROM njoftimet GROUP BY lloji;

-- ===== schema-java12.sql =====
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
