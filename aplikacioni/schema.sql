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
