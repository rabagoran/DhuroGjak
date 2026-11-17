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
