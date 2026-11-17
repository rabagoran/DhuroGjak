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
