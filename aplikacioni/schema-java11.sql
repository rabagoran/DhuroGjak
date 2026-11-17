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
