// Ekzekuton schema-plote.sql në databazën Neon nga DATABASE_URL (.env.local).
// Përdorimi:  npm run db:setup
// Skema është idempotente (IF NOT EXISTS / ON CONFLICT), prandaj mund të ekzekutohet disa herë.
import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const url = process.env.DATABASE_URL;
if (!url || !url.startsWith("postgres")) {
  console.error("✖ DATABASE_URL mungon në aplikacioni/.env.local (duhet të fillojë me postgresql://).");
  process.exit(1);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const teksti = fs.readFileSync(path.join(dir, "..", "schema-plote.sql"), "utf8");
// Hiq komentet dhe ndaj në deklarata (Neon HTTP pranon një deklaratë për kërkesë).
const deklaratat = teksti
  .split("\n").filter((r) => !r.trim().startsWith("--")).join("\n")
  .split(";").map((s) => s.trim()).filter(Boolean);

const sql = neon(url);
let i = 0;
try {
  for (const d of deklaratat) { await sql.query(d); i++; }
  const [k] = await sql.query("SELECT COUNT(*)::int AS n FROM kerkesat");
  const tabelat = await sql.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1");
  console.log(`✔ ${i} deklarata u ekzekutuan.`);
  console.log(`✔ Tabelat: ${tabelat.map((t) => t.table_name).join(", ")}`);
  console.log(`✔ Kërkesa në databazë: ${k.n}`);
} catch (e) {
  console.error(`✖ Dështoi te deklarata ${i + 1}:\n${deklaratat[i]?.slice(0, 200)}\n\n${e.message}`);
  process.exit(1);
}
