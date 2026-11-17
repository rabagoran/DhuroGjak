-- Java 4 · DhuroGjak · Ekzekuto në Neon SQL Editor.
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


SELECT id, grupi, spitali, qyteti, dozat, afati, statusi FROM kerkesat ORDER BY id;
