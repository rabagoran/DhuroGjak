-- DhuroGjak · Verifikimi nga spitali, raportimet dhe heqja e të dhënave demo.
-- Ekzekuto pas skemave të mëparshme (ose përdor schema-plote.sql). Idempotente.

-- 1) Spitalet / qendrat e transfuzionit (lista zyrtare që përdor formulari).
CREATE TABLE IF NOT EXISTS spitalet (
  id TEXT PRIMARY KEY,
  emri TEXT NOT NULL,
  qyteti TEXT NOT NULL,
  aktiv BOOLEAN NOT NULL DEFAULT TRUE
);
INSERT INTO spitalet (id, emri, qyteti) VALUES
  ('qktgj',     'QKUK / Qendra Kombëtare e Transfuzionit të Gjakut', 'Prishtinë'),
  ('peje',      'Spitali Rajonal Pejë',      'Pejë'),
  ('prizren',   'Spitali Rajonal Prizren',   'Prizren'),
  ('gjakove',   'Spitali Rajonal Gjakovë',   'Gjakovë'),
  ('gjilan',    'Spitali Rajonal Gjilan',    'Gjilan'),
  ('ferizaj',   'Spitali Rajonal Ferizaj',   'Ferizaj'),
  ('mitrovice', 'Spitali Rajonal Mitrovicë', 'Mitrovicë')
ON CONFLICT (id) DO UPDATE SET emri = EXCLUDED.emri, qyteti = EXCLUDED.qyteti;

-- 2) Roli "spital": stafi i një spitali konkret (i caktuar nga admini).
ALTER TABLE perdoruesit ADD COLUMN IF NOT EXISTS spitali_id TEXT REFERENCES spitalet(id);
ALTER TABLE perdoruesit DROP CONSTRAINT IF EXISTS perdoruesit_roli_check;
ALTER TABLE perdoruesit ADD CONSTRAINT perdoruesit_roli_check CHECK (roli IN ('perdorues','spital','admin'));
ALTER TABLE perdoruesit DROP CONSTRAINT IF EXISTS perdoruesit_spitali_check;
ALTER TABLE perdoruesit ADD CONSTRAINT perdoruesit_spitali_check CHECK (roli <> 'spital' OR spitali_id IS NOT NULL);

-- 3) Kërkesat: spitali nga lista, verifikimi dhe pezullimi pas raportimeve.
ALTER TABLE kerkesat ADD COLUMN IF NOT EXISTS spitali_id TEXT REFERENCES spitalet(id);
ALTER TABLE kerkesat ADD COLUMN IF NOT EXISTS verifikuar_nga TEXT REFERENCES perdoruesit(id);
ALTER TABLE kerkesat ADD COLUMN IF NOT EXISTS verifikuar_ne TIMESTAMPTZ;
ALTER TABLE kerkesat ADD COLUMN IF NOT EXISTS arsyeja_refuzimit TEXT CHECK (arsyeja_refuzimit IS NULL OR char_length(arsyeja_refuzimit) <= 200);
ALTER TABLE kerkesat ADD COLUMN IF NOT EXISTS pezulluar BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE kerkesat ALTER COLUMN statusi SET DEFAULT 'ne_verifikim';
ALTER TABLE kerkesat DROP CONSTRAINT IF EXISTS kerkesat_statusi_check;
ALTER TABLE kerkesat ADD CONSTRAINT kerkesat_statusi_check
  CHECK (statusi IN ('ne_verifikim','aktive','perfunduar','anuluar','refuzuar'));
CREATE INDEX IF NOT EXISTS kerkesat_verifikimi_idx ON kerkesat (spitali_id, statusi);

-- 4) Hiq të dhënat demo (pronari fiktiv dhe kërkesat e tij; përgjigjet/njoftimet fshihen me CASCADE).
DELETE FROM kerkesat WHERE krijuar_nga = 'demo:kerkuesi' OR (krijuar_nga IS NULL AND pershkrimi LIKE '%(shembull fiktiv)%');
DELETE FROM perdoruesit WHERE id = 'demo:kerkuesi';

-- 5) Kërkesat e vjetra që nuk i ka parë spitali kthehen në pritje (nuk fshihet asgjë).
UPDATE kerkesat k SET spitali_id = s.id FROM spitalet s
WHERE k.spitali_id IS NULL AND k.qyteti = s.qyteti;
UPDATE kerkesat SET statusi = 'ne_verifikim' WHERE statusi = 'aktive' AND verifikuar_ne IS NULL;

-- Garancia në databazë: asnjë kërkesë aktive pa verifikim nga spitali.
ALTER TABLE kerkesat DROP CONSTRAINT IF EXISTS kerkesat_verifikuar_check;
ALTER TABLE kerkesat ADD CONSTRAINT kerkesat_verifikuar_check CHECK (statusi <> 'aktive' OR verifikuar_ne IS NOT NULL);
-- Kërkesat e reja duhet të kenë spital nga lista.
ALTER TABLE kerkesat DROP CONSTRAINT IF EXISTS kerkesat_spitali_id_check;
ALTER TABLE kerkesat ADD CONSTRAINT kerkesat_spitali_id_check CHECK (spitali_id IS NOT NULL) NOT VALID;

-- 6) Raportimet ("Raporto kërkesën"): një raportim për përdorues për kërkesë.
CREATE TABLE IF NOT EXISTS raportimet (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kerkesa_id BIGINT NOT NULL REFERENCES kerkesat(id) ON DELETE CASCADE,
  perdoruesi_id TEXT NOT NULL REFERENCES perdoruesit(id) ON DELETE CASCADE,
  arsyeja TEXT NOT NULL CHECK (arsyeja IN ('e_rreme','pagese','e_dyfishte','tjeter')),
  shqyrtuar BOOLEAN NOT NULL DEFAULT FALSE,
  krijuar_ne TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (kerkesa_id, perdoruesi_id)
);
CREATE INDEX IF NOT EXISTS raportimet_kerkesa_idx ON raportimet (kerkesa_id) WHERE NOT shqyrtuar;

-- 7) Llojet e reja të njoftimeve.
ALTER TABLE njoftimet DROP CONSTRAINT IF EXISTS njoftimet_lloji_check;
ALTER TABLE njoftimet ADD CONSTRAINT njoftimet_lloji_check CHECK (lloji IN (
  'kerkese_e_re','dhurues_vjen','dhuruesi_anuloi','dhurim_konfirmuar','kerkesa_perfundoi','kujtues',
  'verifikim_i_ri','kerkesa_u_verifikua','kerkesa_u_refuzua','kerkesa_u_raportua'));

SELECT statusi, COUNT(*) FROM kerkesat GROUP BY statusi;
