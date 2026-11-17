import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GRUPET, mundTeJape, grupetDhuruese, grupetMarrese, ditetDeriLejimit, dataELejimit, mundTeDhurojeTani,
  perputhet, qytetetAfer, distinktivat, distinktiviTjeter, QYTETET, krahasoShqip,
} from "../src/lib/gjaku.ts";

test("O- i jep të gjithëve, AB+ merr nga të gjithë", () => {
  for (const g of GRUPET) assert.ok(mundTeJape("O-", g), `O- → ${g}`);
  assert.deepEqual([...grupetDhuruese("AB+")].sort(), [...GRUPET].sort());
  assert.deepEqual(grupetMarrese("AB+"), ["AB+"]);
});

test("tabela e përputhshmërisë: raste kryesore", () => {
  assert.ok(mundTeJape("O+", "A+"));
  assert.ok(!mundTeJape("O+", "A-"), "Rh+ nuk i jep Rh-");
  assert.ok(!mundTeJape("A+", "B+"));
  assert.ok(mundTeJape("B-", "AB-"));
  assert.ok(!mundTeJape("AB-", "O-"));
  assert.deepEqual([...grupetDhuruese("O-")], ["O-"]);
});

test("koha e pritjes: 90 ditë meshkujt, 120 femrat", () => {
  const sot = new Date("2026-12-17T12:00:00Z");
  assert.equal(dataELejimit("2026-09-18", "M"), "2026-12-17");
  assert.equal(ditetDeriLejimit("2026-09-18", "M", sot), 0);
  assert.equal(ditetDeriLejimit("2026-09-18", "F", sot), 30);
  assert.equal(ditetDeriLejimit("2026-09-19", "M", sot), 1);
  assert.ok(mundTeDhurojeTani(null, "F", sot), "pa dhurim të mëparshëm = lejohet");
});

test("përputhja: grupi + qyteti afër + koha + njoftimet", () => {
  const sot = new Date("2026-12-17T12:00:00Z");
  const k = { grupi: "O-" as const, qyteti: "Prishtinë" };
  const d = { grupi: "O-" as const, qyteti: "Fushë Kosovë", gjinia: "M" as const, dhurimi_fundit: null, njoftimet: true };
  assert.ok(perputhet(d, k, sot), "Fushë Kosova është afër Prishtinës");
  assert.ok(!perputhet({ ...d, qyteti: "Prizren" }, k, sot), "Prizreni është larg");
  assert.ok(!perputhet({ ...d, njoftimet: false }, k, sot), "njoftimet e fikura");
  assert.ok(!perputhet({ ...d, grupi: "O+" }, k, sot), "O+ nuk i jep O-");
  assert.ok(!perputhet({ ...d, dhurimi_fundit: "2026-12-01" }, k, sot), "bllokuar pas dhurimit");
  assert.ok(qytetetAfer("Pejë").includes("Deçan"));
});

test("distinktivat", () => {
  assert.deepEqual(distinktivat(0), []);
  assert.deepEqual(distinktivat(5).map((d) => d.kodi), ["i-pari", "i-rregullt", "hero"]);
  assert.equal(distinktiviTjeter(3)?.kodi, "hero");
  assert.equal(distinktiviTjeter(10), null);
});

test("renditja shqipe e qyteteve është e qëndrueshme (Java 13, gabimi #418)", () => {
  assert.ok(krahasoShqip("Deçan", "Drenas") < 0, "e para Deçan (e < r)");
  assert.ok(krahasoShqip("Graçanicë", "Gjakovë") < 0, "gj është shkronjë më vete, pas g");
  assert.ok(krahasoShqip("Shtime", "Suharekë") > 0, "sh vjen pas s");
  assert.equal(QYTETET[0], "Deçan");
  assert.equal(new Set(QYTETET).size, QYTETET.length);
});
